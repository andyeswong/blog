try {
  require('dotenv').config();
} catch (error) {
  // .env file optional - continue without it
}
const express = require('express');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const QRCode = require('qrcode');
const postService = require('./services/postService');
const difyService = require('./services/difyService');
const { requireAuth, verifyPassword } = require('./middleware/auth');
const app = express();

// Configurar multer para subida de archivos
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurar sesiones
app.use(session({
  secret: process.env.SESSION_SECRET || 'awong-blog-secret-key-2024',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 // 24 horas
  }
}));

// Rutas
app.get('/', (req, res) => {
  res.render('index');
});

// Listar todos los posts
app.get('/posts', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const allPosts = await postService.getAllPosts();
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPosts = allPosts.slice(startIndex, endIndex);
    
    const totalPages = Math.ceil(allPosts.length / limit);
    const tags = await postService.getAllTags();
    
    res.render('posts', {
      posts: paginatedPosts,
      currentPage: page,
      totalPages: totalPages,
      totalPosts: allPosts.length,
      tags: tags,
      searchQuery: undefined,
      selectedTag: undefined
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).render('error', { message: 'Error cargando artículos' });
  }
});

// Ver post individual
app.get('/posts/:id', async (req, res) => {
  try {
    const post = await postService.getPostById(req.params.id);
    
    if (!post) {
      return res.status(404).render('error', { message: 'Artículo no encontrado' });
    }
    
    // Incrementar vistas
    await postService.incrementPostViews(req.params.id);
    
    // Obtener posts relacionados (mismas etiquetas)
    const relatedPosts = [];
    for (const tag of post.tags.slice(0, 2)) {
      const postsWithTag = await postService.getPostsByTag(tag);
      relatedPosts.push(...postsWithTag.filter(p => p.id !== post.id));
    }
    
    // Eliminar duplicados y limitar a 3
    const uniqueRelatedPosts = Array.from(new Map(relatedPosts.map(p => [p.id, p])).values()).slice(0, 3);
    
    // Obtener 5 posts más recientes (excluyendo el actual)
    const allPosts = await postService.getAllPosts();
    const recentPosts = allPosts.filter(p => p.id !== post.id).slice(0, 5);
    
    res.render('post-detail', {
      post: post,
      relatedPosts: uniqueRelatedPosts,
      recentPosts: recentPosts
    });
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).render('error', { message: 'Error cargando el artículo' });
  }
});

// Filtrar por etiqueta
app.get('/posts/tag/:tag', async (req, res) => {
  try {
    const tag = req.params.tag;
    const posts = await postService.getPostsByTag(tag);
    const allTags = await postService.getAllTags();
    
    res.render('posts', {
      posts: posts,
      currentPage: 1,
      totalPages: 1,
      totalPosts: posts.length,
      tags: allTags,
      selectedTag: tag,
      searchQuery: undefined
    });
  } catch (error) {
    console.error('Error fetching posts by tag:', error);
    res.status(500).render('error', { message: 'Error filtrando artículos' });
  }
});

// Buscar posts
app.get('/search', async (req, res) => {
  try {
    const query = req.query.q || '';
    const posts = query ? await postService.searchPosts(query) : [];
    const allTags = await postService.getAllTags();
    
    res.render('posts', {
      posts: posts,
      currentPage: 1,
      totalPages: 1,
      totalPosts: posts.length,
      tags: allTags,
      searchQuery: query,
      selectedTag: undefined
    });
  } catch (error) {
    console.error('Error searching posts:', error);
    res.status(500).render('error', { message: 'Error buscando artículos' });
  }
});

// API: Obtener estadísticas de posts
app.get('/api/stats', async (req, res) => {
  try {
    const stats = await postService.getPostsStats();
    res.json(stats);
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ error: 'Error obteniendo estadísticas' });
  }
});

// API: Obtener todos los posts
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await postService.getAllPosts();
    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Error obteniendo artículos' });
  }
});

// Página Acerca de
app.get('/about', (req, res) => {
  res.render('about');
});

// Sitemap XML dinámico
app.get('/sitemap.xml', async (req, res) => {
  try {
    const posts = await postService.getAllPosts();
    const baseUrl = 'https://blog.andres-wong.com';
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  
  <!-- Página principal -->
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- Página de artículos -->
  <url>
    <loc>${baseUrl}/posts</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  
  <!-- Página Acerca de -->
  <url>
    <loc>${baseUrl}/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  
  <!-- Artículos individuales -->
`;
    
    posts.forEach(post => {
      const lastMod = post.metadata.modification_time || post.metadata.created_time;
      xml += `  <url>
    <loc>${baseUrl}/posts/${post.id}</loc>
    <lastmod>${new Date(lastMod).toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>`;
      
      if (post.image_url) {
        xml += `
    <image:image>
      <image:loc>${post.image_url}</image:loc>
      <image:title>${post.title.replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>')}</image:title>
    </image:image>`;
      }
      
      xml += `
  </url>
`;
    });
    
    // Agregar páginas de tags
    const tags = await postService.getAllTags();
    tags.forEach(tag => {
      xml += `  <url>
    <loc>${baseUrl}/posts/tag/${encodeURIComponent(tag)}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
`;
    });
    
    xml += `</urlset>`;
    
    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
});

// API: Chat with AI about post
app.post('/api/chat', async (req, res) => {
  try {
    const { query, postId, conversationId } = req.body;

    if (!query || !postId) {
      return res.status(400).json({
        success: false,
        error: 'Missing query or postId'
      });
    }

    const post = await postService.getPostById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    const result = await difyService.sendMessage({
      query,
      post,
      conversationId: conversationId || null
    });

    res.json(result);
  } catch (error) {
    console.error('Error in chat:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// API: Get AI recommendations for posts
app.post('/api/recommend', async (req, res) => {
  try {
    const { query, conversationId } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Missing query'
      });
    }

    // Get all posts for context
    const posts = await postService.getAllPosts();
    
    const result = await difyService.sendRecommendation({
      query,
      posts,
      conversationId: conversationId || null
    });

    res.json(result);
  } catch (error) {
    console.error('Error in recommendation:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// API: Generate QR Code for post
app.get('/api/qr/:postId', async (req, res) => {
  try {
    const postId = req.params.postId;
    const post = await postService.getPostById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    const postUrl = `https://blog.andres-wong.com/posts/${postId}`;

    // Generate QR code as data URL (base64 PNG)
    const qrDataUrl = await QRCode.toDataURL(postUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#282a36',
        light: '#f8f8f2'
      }
    });

    res.json({
      success: true,
      qrCode: qrDataUrl,
      url: postUrl,
      postTitle: post.title
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({
      success: false,
      error: 'Error generating QR code'
    });
  }
});

// ==================== ADMIN ROUTES ====================

// Admin login page
app.get('/admin/login', (req, res) => {
  if (req.session && req.session.isAuthenticated) {
    return res.redirect('/admin/dashboard');
  }
  res.render('admin-login', { error: null });
});

// Admin login handler
app.post('/admin/login', (req, res) => {
  const { password } = req.body;

  if (verifyPassword(password)) {
    req.session.isAuthenticated = true;
    return res.redirect('/admin/dashboard');
  }

  res.render('admin-login', { error: 'Contraseña incorrecta' });
});

// Admin logout
app.get('/admin/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/admin/login');
});

// Admin dashboard
app.get('/admin/dashboard', requireAuth, async (req, res) => {
  try {
    const posts = await postService.getAllPosts();
    const stats = await postService.getPostsStats();

    res.render('admin-dashboard', {
      posts,
      stats
    });
  } catch (error) {
    console.error('Error loading dashboard:', error);
    res.status(500).render('error', { message: 'Error cargando dashboard' });
  }
});

// Admin create post page
app.get('/admin/posts/new', requireAuth, (req, res) => {
  let importedPost = null;

  // Si viene de una importación, leer desde sesión
  if (req.query.imported === 'true' && req.session.importedPostData) {
    importedPost = req.session.importedPostData;
    // Limpiar la sesión después de usar los datos
    delete req.session.importedPostData;
  }

  res.render('admin-post-form', {
    post: importedPost,
    isEdit: false,
    error: null,
    isImported: !!importedPost
  });
});

// Admin create post handler
app.post('/admin/posts/new', requireAuth, async (req, res) => {
  try {
    const postData = req.body;

    // Generar ID automáticamente
    const generatedId = await postService.generateNextId(postData.slug);
    postData.id = generatedId;

    await postService.createPost(postData);
    res.redirect('/admin/dashboard');
  } catch (error) {
    console.error('Error creating post:', error);
    res.render('admin-post-form', {
      post: req.body,
      isEdit: false,
      error: error.message,
      isImported: false
    });
  }
});

// Admin edit post page
app.get('/admin/posts/edit/:id', requireAuth, async (req, res) => {
  try {
    const post = await postService.getPostById(req.params.id);

    if (!post) {
      return res.status(404).render('error', { message: 'Post no encontrado' });
    }

    res.render('admin-post-form', {
      post,
      isEdit: true,
      error: null,
      isImported: false
    });
  } catch (error) {
    console.error('Error loading post:', error);
    res.status(500).render('error', { message: 'Error cargando post' });
  }
});

// Admin update post handler
app.post('/admin/posts/edit/:id', requireAuth, async (req, res) => {
  try {
    await postService.updatePost(req.params.id, req.body);
    res.redirect('/admin/dashboard');
  } catch (error) {
    console.error('Error updating post:', error);
    const post = await postService.getPostById(req.params.id);
    res.render('admin-post-form', {
      post: { ...post, ...req.body },
      isEdit: true,
      error: error.message,
      isImported: false
    });
  }
});

// Admin delete post handler
app.post('/admin/posts/delete/:id', requireAuth, async (req, res) => {
  try {
    await postService.deletePost(req.params.id);
    res.redirect('/admin/dashboard');
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: error.message });
  }
});

// Admin import post from JSON
app.post('/admin/posts/import', requireAuth, upload.single('jsonFile'), async (req, res) => {
  console.log('📥 Ruta /admin/posts/import llamada');
  console.log('File recibido:', req.file ? req.file.originalname : 'Sin archivo');

  try {
    if (!req.file) {
      console.log('❌ No se recibió archivo');
      return res.status(400).render('error', { message: 'No se proporcionó ningún archivo' });
    }

    // Parsear JSON
    const jsonContent = req.file.buffer.toString('utf-8');
    console.log('📄 Contenido JSON recibido (primeros 100 chars):', jsonContent.substring(0, 100));
    const postData = JSON.parse(jsonContent);

    // Validar que tenga los campos básicos
    if (!postData.title || !postData.content) {
      return res.status(400).render('error', { message: 'JSON inválido: falta título o contenido' });
    }

    // Guardar en sesión en lugar de query params
    req.session.importedPostData = postData;

    // Redirigir sin datos en URL
    res.redirect('/admin/posts/new?imported=true');
  } catch (error) {
    console.error('Error importing JSON:', error);
    res.status(400).render('error', { message: `Error al importar JSON: ${error.message}` });
  }
});

// Página 404
app.use((req, res) => {
  res.status(404).render('error', { message: 'Página no encontrada' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`AWONG_blog running on http://localhost:${PORT}`);
  console.log('✅ Ruta de importación registrada: POST /admin/posts/import');
});
