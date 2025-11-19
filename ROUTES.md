# Sistema de Rutas - AWONG_blog

## Descripción General
Este documento describe todas las rutas disponibles en la aplicación AWONG_blog, tanto para visualización como para API.

## Rutas de Visualización

### GET `/`
**Descripción**: Página de inicio (landing page)

**Vista**: `views/index.ejs`

**Parámetros**: Ninguno

**Respuesta**: Renderiza la página principal con animaciones hero

```
GET http://localhost:3000/
```

---

### GET `/posts`
**Descripción**: Listado paginado de todos los artículos

**Vista**: `views/posts.ejs`

**Parámetros Query**:
- `page` (optional, default: 1): Número de página para paginación
  - Ejemplo: `?page=2`

**Respuesta**: 
- Renderiza lista de posts con:
  - 10 posts por página
  - Tags disponibles para filtrar
  - Información meta de cada post (autor, fecha, vistas)
  - Formulario de búsqueda

```
GET http://localhost:3000/posts
GET http://localhost:3000/posts?page=2
GET http://localhost:3000/posts?page=3
```

---

### GET `/posts/:id`
**Descripción**: Visualización de un artículo individual

**Vista**: `views/post-detail.ejs`

**Parámetros URL**:
- `id` (required): ID único del post (sin extensión .json)
  - Ejemplo: `001-charm-crush`

**Funcionalidades**:
- Renderiza contenido HTML completo del post
- Incrementa contador de vistas automáticamente
- Muestra posts relacionados (basados en tags)
- Muestra posts recientes en sidebar
- Chat AI para preguntas sobre el post
- Información completa del post (autor, fecha, vistas, etc.)

**Respuesta en Caso de Error**: 
- Si el post no existe: Error 404 con mensaje "Artículo no encontrado"

```
GET http://localhost:3000/posts/001-charm-crush
GET http://localhost:3000/posts/002-vibecoding-economico
```

---

### GET `/posts/tag/:tag`
**Descripción**: Filtra y lista posts por etiqueta específica

**Vista**: `views/posts.ejs`

**Parámetros URL**:
- `tag` (required): Etiqueta para filtrar
  - Ejemplo: `node.js`, `backend`, `javascript`

**Respuesta**: 
- Lista todos los posts que contienen la etiqueta
- Muestra cantidad total de posts con esa etiqueta
- Resalta la etiqueta seleccionada en el filtro

```
GET http://localhost:3000/posts/tag/node.js
GET http://localhost:3000/posts/tag/backend
GET http://localhost:3000/posts/tag/ai
```

---

### GET `/search`
**Descripción**: Búsqueda de posts por término

**Vista**: `views/posts.ejs`

**Parámetros Query**:
- `q` (required): Término de búsqueda
  - Busca en: título, descripción y tags
  - Case-insensitive

**Respuesta**: 
- Lista posts que coinciden con el término
- Muestra cantidad de resultados
- Acepta búsqueda vacía (muestra 0 resultados)

```
GET http://localhost:3000/search?q=node.js
GET http://localhost:3000/search?q=API
GET http://localhost:3000/search?q=ai
```

---

### GET `/about`
**Descripción**: Página de información sobre el autor/blog

**Vista**: `views/about.ejs`

```
GET http://localhost:3000/about
```

---

## Rutas de API (JSON)

### GET `/api/posts`
**Descripción**: Obtiene todos los posts en formato JSON

**Parámetros**: Ninguno

**Respuesta**: Array JSON de todos los posts ordenados por fecha descendente

```json
[
  {
    "id": "001-charm-crush",
    "title": "Charm Crush: Un Vistazo Técnico...",
    "slug": "charm-crush",
    "description": "Un análisis profundo...",
    "tags": ["charm crush", "ai", "terminal"],
    "author": "AWONG",
    "metadata": {...},
    ...
  }
]
```

**Ejemplo**:
```
GET http://localhost:3000/api/posts
```

---

### GET `/api/stats`
**Descripción**: Obtiene estadísticas de los posts

**Parámetros**: Ninguno

**Respuesta**: Objeto JSON con estadísticas globales

```json
{
  "total": 3,
  "totalViews": 150,
  "totalTags": 12,
  "averageViews": 50,
  "newestPost": {...},
  "mostViewedPost": {...}
}
```

**Ejemplo**:
```
GET http://localhost:3000/api/stats
```

---

### POST `/api/chat`
**Descripción**: Chat con AI sobre un post específico

**Parámetros Body** (JSON):
- `query` (required): Pregunta del usuario
- `postId` (required): ID del post para contexto
- `conversationId` (optional): ID de conversación para seguimiento

**Request**:
```json
{
  "query": "¿De qué trata este artículo?",
  "postId": "001-charm-crush",
  "conversationId": null
}
```

**Respuesta Exitosa**:
```json
{
  "success": true,
  "answer": "## Respuesta\n\nEste artículo trata sobre...",
  "conversation_id": "abc-123-xyz",
  "message_id": "msg-456",
  "metadata": {
    "usage": { "tokens": 1161 }
  }
}
```

**Respuesta de Error**:
```json
{
  "success": false,
  "error": "Post not found"
}
```

**Ejemplo**:
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is this post about?",
    "postId": "001-charm-crush",
    "conversationId": null
  }'
```

---

## Rutas de Error

### 404 - Página No Encontrada
**Descripción**: Se ejecuta cuando se accede a una ruta no definida

**Vista**: `views/error.ejs`

**Mensaje**: "Página no encontrada"

```
GET http://localhost:3000/ruta-inexistente
```

---

### 500 - Error del Servidor
**Descripción**: Se ejecuta cuando ocurre un error en el servidor

**Vista**: `views/error.ejs`

**Mensajes Posibles**:
- "Error cargando artículos"
- "Error cargando el artículo"
- "Error filtrando artículos"
- "Error buscando artículos"

---

## Funciones del Servicio de Posts

Estas funciones están en `services/postService.js` y son utilizadas por las rutas:

```javascript
// Obtiene todos los posts ordenados por fecha
getAllPosts() -> Promise<Array>

// Obtiene un post específico por ID
getPostById(id) -> Promise<Object|null>

// Obtiene posts de una etiqueta específica
getPostsByTag(tag) -> Promise<Array>

// Obtiene posts destacados
getFeaturedPosts() -> Promise<Array>

// Busca posts por término
searchPosts(query) -> Promise<Array>

// Obtiene todas las etiquetas únicas
getAllTags() -> Promise<Array>

// Incrementa contador de vistas
incrementPostViews(id) -> Promise<void>

// Obtiene estadísticas
getPostsStats() -> Promise<Object>
```

---

## Funciones del Servicio de AI

Estas funciones están en `services/difyService.js`:

```javascript
// Envía mensaje a Dify AI con contexto del post
sendMessage({query, post, conversationId}) -> Promise<Object>
```

---

## Flujo de Uso

### Leer un artículo

1. Usuario va a `/posts` para ver listado
2. Usuario hace clic en un artículo
3. Sistema redirige a `/posts/{id}`
4. Contador de vistas se incrementa automáticamente
5. Se muestran artículos relacionados y recientes

### Filtrar por etiqueta

1. Usuario ve lista de posts
2. Usuario hace clic en una etiqueta (#tag)
3. Sistema redirige a `/posts/tag/{tag}`
4. Se muestran solo posts con esa etiqueta

### Buscar posts

1. Usuario escribe término en buscador
2. Usuario presiona "Buscar" o Enter
3. Sistema redirige a `/search?q={término}`
4. Se muestran posts coincidentes

### Usar chat AI

1. Usuario navega a un post específico
2. En el sidebar derecho aparece el chat AI
3. Usuario escribe pregunta sobre el post
4. Sistema envía pregunta a `/api/chat`
5. AI responde con contexto del post
6. Conversación se mantiene con `conversation_id`

---

## Convenciones

### IDs de Posts
- Formato: `{numero}-{slug}`
- Ejemplo: `001-charm-crush`
- Se usa directamente en URL (sin extensión .json)

### Parámetros Query
- Usar lowercase para valores
- Espacios codificados como `%20` o `+`
- Múltiples valores separados por `&`

### Respuestas de Error
- Status code: 400 para parámetros faltantes
- Status code: 404 para post no encontrado
- Status code: 500 para errores del servidor
- Se renderiza vista `error.ejs` con mensaje

---

## Próximas Características

- [ ] Ruta para crear post (`POST /api/posts`)
- [ ] Ruta para editar post (`PUT /api/posts/:id`)
- [ ] Ruta para eliminar post (`DELETE /api/posts/:id`)
- [ ] Autenticación de admin
- [ ] Paginación en búsqueda
- [ ] Filtros avanzados
- [ ] API de comentarios
