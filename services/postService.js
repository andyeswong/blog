const supabase = require('./supabaseClient');

/**
 * Obtiene todos los posts ordenados por fecha de creación descendente
 * @returns {Promise<Array>} Array de posts ordenados
 */
async function getAllPosts() {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_time', { ascending: false });

    if (error) throw error;

    // Transformar datos de Supabase al formato esperado por la app
    return data.map(transformPostFromSupabase);
  } catch (error) {
    console.error('Error reading posts from Supabase:', error.message);
    return [];
  }
}

/**
 * Obtiene un post específico por su ID
 * @param {string} postId - ID del post (sin extensión .json)
 * @returns {Promise<Object|null>} Post encontrado o null
 */
async function getPostById(postId) {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', postId)
      .single();

    if (error) throw error;

    return transformPostFromSupabase(data);
  } catch (error) {
    console.error(`Error reading post ${postId}:`, error.message);
    return null;
  }
}

/**
 * Obtiene posts filtrados por etiqueta
 * @param {string} tag - Etiqueta a filtrar
 * @returns {Promise<Array>} Array de posts con la etiqueta
 */
async function getPostsByTag(tag) {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .contains('tags', [tag])
      .order('created_time', { ascending: false });

    if (error) throw error;

    return data.map(transformPostFromSupabase);
  } catch (error) {
    console.error('Error filtering posts by tag:', error.message);
    return [];
  }
}

/**
 * Obtiene posts destacados
 * @returns {Promise<Array>} Array de posts destacados
 */
async function getFeaturedPosts() {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('featured', true)
      .order('created_time', { ascending: false })
      .limit(3);

    if (error) throw error;

    return data.map(transformPostFromSupabase);
  } catch (error) {
    console.error('Error getting featured posts:', error.message);
    return [];
  }
}

/**
 * Búsqueda de posts por título o descripción
 * @param {string} query - Término de búsqueda
 * @returns {Promise<Array>} Array de posts coincidentes
 */
async function searchPosts(query) {
  try {
    const lowerQuery = query.toLowerCase();

    // Supabase no tiene full-text search directo en el cliente,
    // así que obtenemos todos y filtramos en memoria
    // En producción, considera usar pg_trgm o implementar búsqueda en el servidor
    const allPosts = await getAllPosts();

    return allPosts.filter(post =>
      post.title.toLowerCase().includes(lowerQuery) ||
      post.description.toLowerCase().includes(lowerQuery) ||
      post.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  } catch (error) {
    console.error('Error searching posts:', error.message);
    return [];
  }
}

/**
 * Obtiene todas las etiquetas únicas de todos los posts
 * @returns {Promise<Array>} Array de etiquetas únicas ordenadas
 */
async function getAllTags() {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('tags');

    if (error) throw error;

    const tagsSet = new Set();
    data.forEach(post => {
      post.tags.forEach(tag => tagsSet.add(tag));
    });

    return Array.from(tagsSet).sort();
  } catch (error) {
    console.error('Error getting all tags:', error.message);
    return [];
  }
}

/**
 * Incrementa el contador de vistas de un post
 * @param {string} postId - ID del post
 * @returns {Promise<void>}
 */
async function incrementPostViews(postId) {
  try {
    // Primero obtener el post actual
    const { data: currentPost, error: fetchError } = await supabase
      .from('posts')
      .select('views')
      .eq('id', postId)
      .single();

    if (fetchError) throw fetchError;

    // Incrementar vistas
    const { error: updateError } = await supabase
      .from('posts')
      .update({
        views: (currentPost.views || 0) + 1
      })
      .eq('id', postId);

    if (updateError) throw updateError;
  } catch (error) {
    console.error(`Error incrementing views for post ${postId}:`, error.message);
  }
}

/**
 * Obtiene información estadística de los posts
 * @returns {Promise<Object>} Objeto con estadísticas
 */
async function getPostsStats() {
  try {
    const allPosts = await getAllPosts();
    const tags = await getAllTags();

    const totalViews = allPosts.reduce((sum, post) => sum + (post.views || 0), 0);
    const totalPosts = allPosts.length;

    return {
      total: totalPosts,
      totalViews: totalViews,
      totalTags: tags.length,
      averageViews: totalPosts > 0 ? Math.round(totalViews / totalPosts) : 0,
      newestPost: allPosts.length > 0 ? allPosts[0] : null,
      mostViewedPost: allPosts.reduce((max, post) =>
        (post.views || 0) > (max.views || 0) ? post : max,
        allPosts[0] || null
      )
    };
  } catch (error) {
    console.error('Error getting posts stats:', error.message);
    return null;
  }
}

/**
 * Crea un nuevo post
 * @param {Object} postData - Datos del post
 * @returns {Promise<Object>} Post creado
 */
async function createPost(postData) {
  try {
    // Validar campos requeridos
    if (!postData.id || !postData.title || !postData.slug || !postData.description ||
        !postData.tags || !postData.content) {
      throw new Error('Missing required fields');
    }

    // Verificar que el ID no exista
    const existingPost = await getPostById(postData.id);
    if (existingPost) {
      throw new Error('Post ID already exists');
    }

    // Preparar datos para Supabase
    const newPost = {
      id: postData.id,
      title: postData.title,
      slug: postData.slug,
      description: postData.description,
      image_url: postData.image_url || null,
      tags: Array.isArray(postData.tags) ? postData.tags : postData.tags.split(',').map(t => t.trim()),
      author: postData.author || 'AWONG',
      reading_time: parseInt(postData.reading_time) || 5,
      content: postData.content,
      created_time: new Date().toISOString(),
      modification_time: new Date().toISOString(),
      version: '1.0',
      status: postData.status || 'published',
      seo_keywords: postData.seo_keywords || null,
      featured: postData.featured === true || postData.featured === 'true',
      views: 0
    };

    const { data, error } = await supabase
      .from('posts')
      .insert([newPost])
      .select()
      .single();

    if (error) throw error;

    return transformPostFromSupabase(data);
  } catch (error) {
    console.error('Error creating post:', error.message);
    throw error;
  }
}

/**
 * Actualiza un post existente
 * @param {string} postId - ID del post
 * @param {Object} postData - Nuevos datos del post
 * @returns {Promise<Object>} Post actualizado
 */
async function updatePost(postId, postData) {
  try {
    const existingPost = await getPostById(postId);
    if (!existingPost) {
      throw new Error('Post not found');
    }

    // Preparar datos actualizados
    const updatedData = {
      title: postData.title || existingPost.title,
      slug: postData.slug || existingPost.slug,
      description: postData.description || existingPost.description,
      image_url: postData.image_url !== undefined ? postData.image_url : existingPost.image_url,
      tags: postData.tags ? (Array.isArray(postData.tags) ? postData.tags : postData.tags.split(',').map(t => t.trim())) : existingPost.tags,
      author: postData.author || existingPost.author,
      reading_time: postData.reading_time ? parseInt(postData.reading_time) : existingPost.reading_time,
      content: postData.content !== undefined ? postData.content : existingPost.content,
      featured: postData.featured !== undefined ? (postData.featured === true || postData.featured === 'true') : existingPost.featured,
      version: incrementVersion(existingPost.metadata.version),
      status: postData.status || existingPost.metadata.status,
      seo_keywords: postData.seo_keywords !== undefined ? postData.seo_keywords : existingPost.metadata.seo_keywords
      // modification_time se actualiza automáticamente por el trigger en Supabase
    };

    const { data, error } = await supabase
      .from('posts')
      .update(updatedData)
      .eq('id', postId)
      .select()
      .single();

    if (error) throw error;

    return transformPostFromSupabase(data);
  } catch (error) {
    console.error(`Error updating post ${postId}:`, error.message);
    throw error;
  }
}

/**
 * Elimina un post
 * @param {string} postId - ID del post a eliminar
 * @returns {Promise<void>}
 */
async function deletePost(postId) {
  try {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);

    if (error) throw error;
  } catch (error) {
    console.error(`Error deleting post ${postId}:`, error.message);
    throw error;
  }
}

/**
 * Incrementa la versión de un post (1.0 -> 1.1 -> 1.2, etc.)
 * @param {string} version - Versión actual
 * @returns {string} Nueva versión
 */
function incrementVersion(version) {
  const parts = version.split('.');
  const minor = parseInt(parts[1] || 0) + 1;
  return `${parts[0]}.${minor}`;
}

/**
 * Genera un ID único para un nuevo post
 * @returns {Promise<string>} Nuevo ID en formato 000-slug
 */
async function generateNextId(slug) {
  try {
    // Obtener todos los posts
    const { data, error } = await supabase
      .from('posts')
      .select('id');

    if (error) throw error;

    // Extraer números de los IDs existentes
    const numbers = data
      .map(post => {
        const match = post.id.match(/^(\d+)-/);
        return match ? parseInt(match[1]) : 0;
      })
      .filter(num => num > 0);

    // Obtener el siguiente número
    const nextNumber = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
    const paddedNumber = String(nextNumber).padStart(3, '0');

    return `${paddedNumber}-${slug}`;
  } catch (error) {
    console.error('Error generating next ID:', error.message);
    throw error;
  }
}

/**
 * Transforma un post de Supabase al formato esperado por la app
 * @param {Object} post - Post de Supabase
 * @returns {Object} Post en formato de la app
 */
function transformPostFromSupabase(post) {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    description: post.description,
    image_url: post.image_url,
    tags: post.tags,
    author: post.author,
    reading_time: post.reading_time,
    content: post.content,
    metadata: {
      created_time: post.created_time,
      modification_time: post.modification_time,
      version: post.version,
      status: post.status,
      seo_keywords: post.seo_keywords
    },
    featured: post.featured,
    views: post.views
  };
}

module.exports = {
  getAllPosts,
  getPostById,
  getPostsByTag,
  getFeaturedPosts,
  searchPosts,
  getAllTags,
  incrementPostViews,
  getPostsStats,
  createPost,
  updatePost,
  deletePost,
  generateNextId
};
