# Sistema de Posts - Estructura de Almacenamiento

## Descripción
Los posts se almacenan como archivos JSON en la carpeta `storage/posts/`. Cada archivo representa un artículo individual del blog con toda la información necesaria para renderización y gestión.

## Estructura de Carpetas
```
blog/
├── storage/
│   ├── posts/
│   │   ├── 001-charm-crush.json
│   │   ├── 002-vibecoding-economico.json
│   │   ├── 003-toon-compresion-contexto.json
│   │   └── ...
```

## Esquema del Post JSON

### Propiedades Obligatorias

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | string | Identificador único del post (ej: "001-charm-crush") |
| `title` | string | Título del artículo |
| `slug` | string | URL-friendly versión del título (sin espacios, lowercase) |
| `description` | string | Descripción breve del artículo (50-160 caracteres) |
| `tags` | array | Arreglo de etiquetas/categorías (ej: ["nodejs", "backend"]) |
| `content` | string | Contenido en HTML raw que será renderizado en el cliente |
| `metadata` | object | Objeto con información de timestamps y control de versión |

### Propiedades Opcionales

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `image_url` | string | URL de imagen de portada del artículo |
| `author` | string | Nombre del autor (default: "AWONG") |
| `reading_time` | number | Tiempo estimado de lectura en minutos |
| `featured` | boolean | Indicador si el post debe aparecer en destacados |
| `views` | number | Contador de vistas del artículo |
| `seo_keywords` | string | Palabras clave para SEO (separadas por comas) |

## Objeto Metadata

```json
"metadata": {
  "created_time": "2024-11-06T10:30:00Z",
  "modification_time": "2024-11-06T14:45:00Z",
  "version": "1.0",
  "status": "published",
  "seo_keywords": "node.js, express, backend, api rest, javascript server"
}
```

### Propiedades de Metadata

| Campo | Tipo | Valores | Descripción |
|-------|------|--------|-------------|
| `created_time` | string (ISO 8601) | - | Fecha de creación del post |
| `modification_time` | string (ISO 8601) | - | Fecha de última modificación |
| `version` | string | "1.0", "1.1", etc. | Versión del contenido |
| `status` | string | "published", "draft", "archived" | Estado del post |
| `seo_keywords` | string | - | Palabras clave para optimización SEO |

## Convención de Nombres de Archivo

Los archivos de posts deben nombrase siguiendo este patrón:

```
{numero}-{titulo-slug}.json
```

**Ejemplos:**
- `001-charm-crush.json`
- `002-vibecoding-economico.json`
- `003-toon-compresion-contexto.json`

**Reglas:**
- Número secuencial de 3 dígitos (001, 002, 003...)
- Guión separador
- Slug en lowercase sin espacios
- Extensión .json

## Formato del Contenido HTML

El campo `content` debe contener HTML válido y bien formado. Recomendaciones:

```html
<article class="prose prose-invert">
  <h1>Título Principal</h1>
  
  <p>Párrafo de introducción...</p>
  
  <h2>Sección Principal</h2>
  <p>Contenido de la sección...</p>
  
  <h3>Subsección</h3>
  <ul>
    <li>Punto 1</li>
    <li>Punto 2</li>
  </ul>
  
  <pre><code>// Código de ejemplo
console.log('Hello');</code></pre>
  
  <p>Conclusión del artículo...</p>
</article>
```

### Elementos HTML Soportados

**Estructurales:**
- `<article>`, `<h1>` - `<h6>`, `<p>`, `<section>`

**Listas:**
- `<ul>`, `<ol>`, `<li>`

**Énfasis:**
- `<strong>`, `<em>`, `<b>`, `<i>`

**Código:**
- `<pre>`, `<code>`, `<kbd>`

**Otros:**
- `<blockquote>`, `<hr>`, `<table>`, `<tr>`, `<td>`, `<th>`

## Ejemplo Completo

```json
{
  "id": "001-charm-crush",
  "title": "Charm Crush: Un Vistazo Técnico al Copiloto de IA",
  "slug": "charm-crush",
  "description": "Un análisis profundo de Charm Crush, explorando su integración con LSPs.",
  "image_url": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800",
  "tags": ["charm crush", "ai", "terminal", "llm"],
  "author": "AWONG",
  "reading_time": 10,
  "content": "<article class=\"prose prose-invert\">...</article>",
  "metadata": {
    "created_time": "2024-11-06T10:30:00Z",
    "modification_time": "2024-11-06T14:45:00Z",
    "version": "1.0",
    "status": "published",
    "seo_keywords": "charm crush, ai terminal, lsp, developer tools"
  },
  "featured": true,
  "views": 60
}
```

## Validación de Posts

Antes de guardar un post, valida que:

1. ✓ `id` sea único entre todos los posts
2. ✓ `title` no esté vacío
3. ✓ `slug` sea URL-friendly (lowercase, sin espacios)
4. ✓ `tags` sea un arreglo con al menos 1 etiqueta
5. ✓ `content` contenga HTML válido
6. ✓ `metadata.created_time` sea un timestamp ISO válido
7. ✓ `metadata.status` esté en valores permitidos
8. ✓ `image_url` sea una URL válida (si se proporciona)

## Acceso a Posts

### Desde Express
```javascript
const fs = require('fs').promises;
const path = require('path');

async function getPost(id) {
  const filePath = path.join(__dirname, 'storage', 'posts', `${id}.json`);
  const data = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(data);
}

async function getAllPosts() {
  const dirPath = path.join(__dirname, 'storage', 'posts');
  const files = await fs.readdir(dirPath);
  const posts = [];
  
  for (const file of files) {
    if (file.endsWith('.json')) {
      const data = await fs.readFile(path.join(dirPath, file), 'utf-8');
      posts.push(JSON.parse(data));
    }
  }
  
  return posts.sort((a, b) => 
    new Date(b.metadata.created_time) - new Date(a.metadata.created_time)
  );
}
```

## Buenas Prácticas

1. **Versionado**: Incrementar `version` en metadata cuando edites contenido
2. **Timestamps**: Siempre usar formato ISO 8601 (UTC)
3. **Tags**: Usar lowercase, máximo 5-7 tags por post
4. **Descripción**: Mantener entre 50-160 caracteres
5. **Imágenes**: Usar URLs externas o servir desde carpeta `public/images`
6. **Backups**: Hacer backup regular de la carpeta `storage/`
7. **Validación**: Validar JSON con herramientas antes de guardar

## Agregar Nuevos Posts

Para agregar un nuevo post:

1. Crear archivo JSON en `storage/posts/` con el formato `{num}-{slug}.json`
2. Incluir todos los campos obligatorios
3. Asegurar que `metadata.created_time` esté en formato ISO 8601 UTC
4. El post aparecerá automáticamente en la próxima carga de `/posts`

## Escalabilidad Futura

Si en el futuro necesitas escalar a una base de datos:

1. La estructura JSON se mapea fácilmente a documentos en MongoDB
2. Los mismos campos se pueden usar en PostgreSQL con pequeños ajustes
3. Sistema de cache con Redis sería beneficioso para posts populares
4. Implementar full-text search para búsqueda de posts

## Consideraciones de Seguridad

- **Validación de entrada**: Sanitizar HTML en el cliente
- **Rate limiting**: Limitar acceso a posts para prevenir abuso
- **Backups automáticos**: Automatizar copias de seguridad de posts
- **Versionado**: Mantener historial de cambios en metadata
