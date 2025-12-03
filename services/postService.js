const fs = require('fs').promises;
const path = require('path');

const POSTS_DIR = path.join(__dirname, '..', 'storage', 'posts');

/**
 * Obtiene todos los posts ordenados por fecha de creación descendente
 * @returns {Promise<Array>} Array de posts ordenados
 */
async function getAllPosts() {
  try {
    const files = await fs.readdir(POSTS_DIR);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    
    const posts = [];
    
    for (const file of jsonFiles) {
      try {
        const filePath = path.join(POSTS_DIR, file);
        const data = await fs.readFile(filePath, 'utf-8');
        const post = JSON.parse(data);
        posts.push(post);
      } catch (error) {
        console.error(`Error reading post ${file}:`, error.message);
      }
    }
    
    // Ordenar por fecha de creación descendente (más nuevos primero)
    posts.sort((a, b) => 
      new Date(b.metadata.created_time) - new Date(a.metadata.created_time)
    );
    
    return posts;
  } catch (error) {
    console.error('Error reading posts directory:', error.message);
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
    const filePath = path.join(POSTS_DIR, `${postId}.json`);
    const data = await fs.readFile(filePath, 'utf-8');
    const post = JSON.parse(data);
    return post;
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
    const allPosts = await getAllPosts();
    return allPosts.filter(post => 
      post.tags.map(t => t.toLowerCase()).includes(tag.toLowerCase())
    );
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
    const allPosts = await getAllPosts();
    return allPosts.filter(post => post.featured === true).slice(0, 3);
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
    const allPosts = await getAllPosts();
    const lowerQuery = query.toLowerCase();
    
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
    const allPosts = await getAllPosts();
    const tagsSet = new Set();
    
    allPosts.forEach(post => {
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
    const post = await getPostById(postId);
    if (!post) return;
    
    post.views = (post.views || 0) + 1;
    post.metadata.modification_time = new Date().toISOString();
    
    const filePath = path.join(POSTS_DIR, `${postId}.json`);
    await fs.writeFile(filePath, JSON.stringify(post, null, 2));
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

    // Crear objeto de post completo
    const post = {
      id: postData.id,
      title: postData.title,
      slug: postData.slug,
      description: postData.description,
      image_url: postData.image_url || '',
      tags: Array.isArray(postData.tags) ? postData.tags : postData.tags.split(',').map(t => t.trim()),
      author: postData.author || 'AWONG',
      reading_time: parseInt(postData.reading_time) || 5,
      content: postData.content,
      metadata: {
        created_time: new Date().toISOString(),
        modification_time: new Date().toISOString(),
        version: '1.0',
        status: postData.status || 'published',
        seo_keywords: postData.seo_keywords || ''
      },
      featured: postData.featured === true || postData.featured === 'true',
      views: 0
    };

    // Guardar archivo
    const filePath = path.join(POSTS_DIR, `${post.id}.json`);
    await fs.writeFile(filePath, JSON.stringify(post, null, 2));

    return post;
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

    // Actualizar post manteniendo algunos campos del original
    const updatedPost = {
      ...existingPost,
      title: postData.title || existingPost.title,
      slug: postData.slug || existingPost.slug,
      description: postData.description || existingPost.description,
      image_url: postData.image_url !== undefined ? postData.image_url : existingPost.image_url,
      tags: postData.tags ? (Array.isArray(postData.tags) ? postData.tags : postData.tags.split(',').map(t => t.trim())) : existingPost.tags,
      author: postData.author || existingPost.author,
      reading_time: postData.reading_time ? parseInt(postData.reading_time) : existingPost.reading_time,
      content: postData.content !== undefined ? postData.content : existingPost.content,
      featured: postData.featured !== undefined ? (postData.featured === true || postData.featured === 'true') : existingPost.featured,
      metadata: {
        ...existingPost.metadata,
        modification_time: new Date().toISOString(),
        version: incrementVersion(existingPost.metadata.version),
        status: postData.status || existingPost.metadata.status,
        seo_keywords: postData.seo_keywords !== undefined ? postData.seo_keywords : existingPost.metadata.seo_keywords
      }
    };

    // Guardar archivo
    const filePath = path.join(POSTS_DIR, `${postId}.json`);
    await fs.writeFile(filePath, JSON.stringify(updatedPost, null, 2));

    return updatedPost;
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
    const filePath = path.join(POSTS_DIR, `${postId}.json`);
    await fs.unlink(filePath);
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
    const files = await fs.readdir(POSTS_DIR);
    const jsonFiles = files.filter(file => file.endsWith('.json'));

    // Extraer números de los archivos existentes
    const numbers = jsonFiles
      .map(file => {
        const match = file.match(/^(\d+)-/);
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
