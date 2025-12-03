/**
 * Script de migración de posts desde archivos JSON locales a Supabase
 * Este script:
 * 1. Crea la tabla 'posts' en Supabase (si no existe)
 * 2. Migra todos los posts desde storage/posts/ a Supabase
 *
 * Requisitos:
 * - Variable de entorno DATABASE_URL con la connection string de PostgreSQL
 *   Ejemplo: postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
 *
 * Uso:
 * DATABASE_URL="postgresql://..." node migrate-posts-to-supabase.js
 *
 * O agregar DATABASE_URL al archivo .env
 */

const fs = require('fs').promises;
const path = require('path');
const { Client } = require('pg');
const supabase = require('./services/supabaseClient');

const POSTS_DIR = path.join(__dirname, 'storage', 'posts');
const SCHEMA_FILE = path.join(__dirname, 'supabase-schema.sql');

/**
 * Crea la tabla posts en Supabase ejecutando el SQL schema
 */
async function createTableIfNotExists() {
  const DATABASE_URL = process.env.DATABASE_URL;

  if (!DATABASE_URL) {
    console.log('⚠️  No se encontró DATABASE_URL en las variables de entorno.\n');
    console.log('📋 OPCIONES:\n');
    console.log('Opción 1 - Ejecutar SQL manualmente:');
    console.log('1. Ve a: https://supabase00.andres-wong.com');
    console.log('2. Abre SQL Editor');
    console.log('3. Copia el contenido de supabase-schema.sql');
    console.log('4. Ejecuta el SQL');
    console.log('5. Vuelve a ejecutar este script\n');
    console.log('Opción 2 - Usar PostgreSQL client:');
    console.log('1. Obtén tu Connection String desde Supabase → Settings → Database');
    console.log('2. Agrégala al archivo .env: DATABASE_URL="postgresql://..."');
    console.log('3. Vuelve a ejecutar este script\n');

    // Intentar verificar si la tabla existe
    console.log('🔍 Verificando si la tabla ya existe...\n');
    const { error } = await supabase
      .from('posts')
      .select('id')
      .limit(1);

    if (error && (error.code === '42P01' || error.message.includes('does not exist'))) {
      console.log('❌ La tabla "posts" no existe. Por favor, sigue una de las opciones anteriores.\n');
      process.exit(1);
    }

    console.log('✅ La tabla "posts" existe y está lista.\n');
    return true;
  }

  try {
    console.log('📋 Conectando a PostgreSQL para crear la tabla...\n');

    // Crear cliente de PostgreSQL
    const client = new Client({
      connectionString: DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });

    await client.connect();

    // Leer el archivo SQL
    const sqlContent = await fs.readFile(SCHEMA_FILE, 'utf-8');

    console.log('🔨 Ejecutando schema SQL...\n');

    // Ejecutar el SQL completo
    await client.query(sqlContent);

    console.log('✅ Tabla "posts" creada exitosamente.\n');

    await client.end();
    return true;
  } catch (error) {
    // Si el error es porque la tabla ya existe, está bien
    if (error.code === '42P07' || error.message.includes('already exists')) {
      console.log('✅ La tabla "posts" ya existe.\n');
      return true;
    }

    console.error('❌ Error creando la tabla:', error.message);
    throw error;
  }
}

/**
 * Transforma un post del formato JSON local al formato de Supabase
 */
function transformPostForSupabase(post) {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    description: post.description,
    image_url: post.image_url || null,
    tags: post.tags || [],
    author: post.author || 'AWONG',
    reading_time: parseInt(post.reading_time) || 5,
    content: post.content,
    created_time: post.metadata.created_time,
    modification_time: post.metadata.modification_time || post.metadata.created_time,
    version: post.metadata.version || '1.0',
    status: post.metadata.status || 'published',
    seo_keywords: post.metadata.seo_keywords || null,
    featured: post.featured === true,
    views: parseInt(post.views) || 0
  };
}

/**
 * Migra todos los posts a Supabase
 */
async function migratePosts() {
  try {
    console.log('🚀 Iniciando migración de posts a Supabase...\n');

    // Verificar/crear tabla
    await createTableIfNotExists();

    // Leer todos los archivos JSON del directorio de posts
    const files = await fs.readdir(POSTS_DIR);
    const jsonFiles = files.filter(file => file.endsWith('.json'));

    console.log(`📁 Se encontraron ${jsonFiles.length} posts para migrar\n`);

    if (jsonFiles.length === 0) {
      console.log('❌ No se encontraron posts para migrar');
      return;
    }

    const posts = [];

    // Leer y transformar cada post
    for (const file of jsonFiles) {
      try {
        const filePath = path.join(POSTS_DIR, file);
        const data = await fs.readFile(filePath, 'utf-8');
        const post = JSON.parse(data);
        const transformedPost = transformPostForSupabase(post);
        posts.push(transformedPost);
        console.log(`✅ Post leído: ${post.id} - "${post.title}"`);
      } catch (error) {
        console.error(`❌ Error leyendo ${file}:`, error.message);
      }
    }

    console.log(`\n📤 Insertando ${posts.length} posts en Supabase...\n`);

    // Insertar todos los posts en Supabase
    // Usamos upsert para evitar errores si ya existen
    const { data, error } = await supabase
      .from('posts')
      .upsert(posts, { onConflict: 'id' })
      .select();

    if (error) {
      console.error('❌ Error insertando posts en Supabase:', error);
      throw error;
    }

    console.log(`✅ ¡Migración completada con éxito!`);
    console.log(`📊 ${data.length} posts insertados/actualizados en Supabase\n`);

    // Verificar que todos los posts se insertaron
    const { count, error: countError } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Error verificando posts:', countError);
    } else {
      console.log(`📈 Total de posts en Supabase: ${count}`);
    }

    console.log('\n✨ Migración finalizada exitosamente');
    console.log('🎉 Tu blog ahora usa Supabase como base de datos\n');
  } catch (error) {
    console.error('❌ Error en la migración:', error);
    process.exit(1);
  }
}

// Ejecutar migración
migratePosts();
