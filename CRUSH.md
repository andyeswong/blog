# CRUSH.md - AWONG_blog Agent Guide

## Project Overview

**AWONG_blog** is a minimalist blog platform built with Node.js and Express. It features:
- File-based JSON post storage in `storage/posts/`
- EJS templating for server-side rendering
- Dracula color scheme UI
- Post search, filtering by tags, and pagination
- RESTful API endpoints for posts and stats
- AI chat integration with Dify for post-specific conversations

**Technology Stack**: Node.js, Express 5.1, EJS 3.1, Tailwind CSS, vanilla JavaScript

---

## Quick Start Commands

```bash
# Install dependencies
npm install

# Start development server
npm start
# or
npm run dev

# Server runs on: http://localhost:3000
```

**Note**: No build or test commands. This is a simple Express app with no build step or test suite.

---

## Project Structure

```
blog/
├── app.js                      # Express server and route definitions
├── package.json                # Dependencies and scripts
├── services/
│   ├── postService.js          # All post-related business logic
│   └── difyService.js          # AI chat API integration
├── views/                      # EJS templates
│   ├── index.ejs              # Landing page (hero section + animations)
│   ├── posts.ejs              # Posts list, search, and tag filtering
│   ├── post-detail.ejs        # Individual post view with AI chat
│   ├── about.ejs              # About page
│   └── error.ejs              # Error page (404/500)
├── public/
│   ├── styles.css             # Global styles and Dracula theme CSS
│   ├── theme.js               # Dark/light theme toggle
│   ├── chat.js                # AI chat UI controller
│   └── glitch.js              # Client-side animations (hero section only)
├── storage/
│   └── posts/                 # JSON files for blog posts
├── POSTS_STRUCTURE.md         # Post JSON schema and validation rules
└── ROUTES.md                  # Detailed API and route documentation
```

---

## Critical Code Patterns & Conventions

### Post Storage (File-Based)

Posts are stored as individual JSON files in `storage/posts/` with naming convention:
```
{3-digit-number}-{slug}.json
Example: 001-charm-crush.json
```

**Post JSON Structure** (required fields):
```javascript
{
  id: "001-charm-crush",                     // Unique identifier
  title: "Título del Artículo",              // Post title
  slug: "charm-crush",                       // URL-friendly slug
  description: "Brief description...",       // 50-160 characters
  tags: ["node.js", "backend", "api"],       // Array of categories
  author: "AWONG",                           // Author name
  content: "<article>...</article>",         // Raw HTML to render
  image_url: "https://...",                  // Cover image URL
  reading_time: 8,                           // Estimated minutes
  featured: false,                           // Highlight on homepage
  views: 0,                                  // View counter (auto-incremented)
  metadata: {
    created_time: "2024-11-06T10:30:00Z",   // ISO 8601 UTC
    modification_time: "2024-11-06T10:30:00Z",
    version: "1.0",
    status: "published",                    // "published", "draft", or "archived"
    seo_keywords: "node.js, express, backend"
  }
}
```

**Key Rules**:
- `id` and `slug` must be unique
- All timestamps use ISO 8601 format (UTC)
- `content` contains raw HTML (EJS templates handle rendering)
- `tags` are case-insensitive but stored lowercase
- When modifying a post, update `modification_time` in metadata

### Service Layer Pattern

`services/postService.js` provides all post operations as async functions:
```javascript
getAllPosts()           // Returns all posts sorted by created_time DESC
getPostById(id)         // Returns single post or null
getPostsByTag(tag)      // Case-insensitive tag filtering
getFeaturedPosts()      // Returns posts where featured === true (max 3)
searchPosts(query)      // Searches title, description, tags
getAllTags()           // Returns unique tags from all posts, sorted
incrementPostViews(id) // Increments views + updates modification_time, writes to disk
getPostsStats()        // Returns {total, totalViews, totalTags, averageViews, newestPost, mostViewedPost}
```

`services/difyService.js` provides AI chat functionality:
```javascript
sendMessage({query, post, conversationId})  // Send message to Dify AI with post context
```

**Async Handling**: All service functions wrap file operations in try-catch with console.error logging. Errors return empty arrays or null, not thrown errors. This prevents server crashes but silently fails.

### EJS Template Patterns

All views use:
- `<% %>` for logic (if, loops, etc.)
- `<%= %>` for output (variables)
- `<%- %>` for raw HTML output (safe for `post.content`)
- Tailwind CSS for styling (no custom CSS in templates except inline `style=`)

**Key Variables Passed to Views**:
- `posts.ejs`: `posts`, `currentPage`, `totalPages`, `totalPosts`, `tags`, `searchQuery`, `selectedTag`
- `post-detail.ejs`: `post`, `relatedPosts`, `recentPosts`
- `index.ejs`: No variables (static landing page)
- `error.ejs`: `message`

### Route Error Handling

All routes follow this pattern:
```javascript
app.get('/route', async (req, res) => {
  try {
    // Logic
    res.render('template', { data });
  } catch (error) {
    console.error('Error message:', error);
    res.status(500).render('error', { message: 'User-friendly error' });
  }
});
```

Error messages are in Spanish (es_ES locale). Route always renders `error.ejs` for failures.

---

## Route Reference

### Main Routes (HTML Rendering)

| Method | Route | Purpose |
|--------|-------|---------|
| `GET` | `/` | Landing page (hero section with animations) |
| `GET` | `/posts` | All posts with pagination (10 per page) |
| `GET` | `/posts/:id` | Single post (increments views, shows related) |
| `GET` | `/posts/tag/:tag` | Filter posts by tag |
| `GET` | `/search?q=term` | Search posts by title/description/tags |
| `GET` | `/about` | About page |

### API Routes (JSON Response)

| Method | Route | Purpose |
|--------|-------|---------|
| `GET` | `/api/posts` | All posts as JSON array |
| `GET` | `/api/stats` | Blog statistics object |
| `POST` | `/api/chat` | AI chat about a post |

### Special Routes

- `GET` `/*` - Catch-all 404 handler

---

## AI Chat Integration

### Dify Service

The blog includes AI chat functionality powered by Dify. Each post detail page has a chat sidebar where users can ask questions about the post.

**Request Flow**:
1. User sends message via chat UI
2. `chat.js` sends POST to `/api/chat`
3. `app.js` gets post context from `postService`
4. `difyService.sendMessage()` calls Dify API with post context
5. Response returned with markdown formatting

**API Request Format**:
```javascript
{
  query: "user question",
  postId: "001-charm-crush",
  conversationId: null  // null for first message, then use returned ID
}
```

**API Response Format**:
```javascript
{
  success: true,
  answer: "## Response\n**Bold text**...",
  conversation_id: "abc-123-xyz",
  message_id: "msg-456",
  metadata: { usage: { tokens: 1161 } }
}
```

---

## Design System & Frontend

**Dracula Color Scheme** (defined in `styles.css`):
```
--dracula-bg: #282a36           (page background)
--dracula-fg: #f8f8f2           (text primary)
--dracula-comment: #6272a4      (text secondary)
--dracula-purple: #b8a6db       (nav links, accents)
--dracula-cyan: #8be9fd         (links, interactive)
--dracula-blue: #bd93f9         (decorative gradients)
```

**Typography**: All text uses `font-mono` (Courier New) with `font-light (weight: 300)` for a minimal, refined look.

**Animations**:
- **Hero section ONLY** (index.ejs): Word fade-in staggered (200ms intervals), floating elements, mouse gradient tracking
- **All other sections**: No animations (static and elegant)
- Transitions use 300ms (quick) or 500ms (medium)

**Responsive Breakpoints** (Tailwind): sm (640px), md (768px), lg (1024px), xl (1280px)

---

## Important Gotchas & Non-Obvious Patterns

### 1. View Increment Has Side Effects
`incrementPostViews(id)` **writes to disk** every time a post is viewed. This is intentional (persistent view counts) but means:
- Viewing a post modifies the JSON file
- No caching - every view hits the filesystem
- Consider implementing cache/debouncing if views spike

### 2. Post Ordering
Posts are sorted by `metadata.created_time` (descending). The file listing order in `storage/posts/` is **ignored**.

### 3. Tag Filtering is Case-Insensitive
Tags are stored in lowercase in JSON, but filtering works with any case:
```javascript
getPostsByTag("NODE.JS") === getPostsByTag("node.js") ✓
```

### 4. Related Posts on Post Detail
Related posts are calculated **on every request**:
- Takes first 2 tags from current post
- Finds all posts with those tags
- Filters out current post
- Deduplicates and limits to 3
- **No caching** - this is O(n) per request

### 5. Search Behavior
Search is **empty-string safe**: `/search?q=` returns empty array (no error).

### 6. Featured Posts
`getFeaturedPosts()` checks `featured: true` in post JSON. Currently unused in routes but available for future homepage highlights.

### 7. No Validation on File Write
`incrementPostViews()` writes JSON without schema validation. If post JSON is corrupted, it will write corrupt data back.

### 8. Spanish Locale
- Error messages are in Spanish
- Comments in code are mixed (English and Spanish)
- Route names use English `/posts`, `/posts/tag/:tag`

### 9. Port Configuration
Server port defaults to `process.env.PORT || 3000`. Set `PORT` env var to override.

### 10. AI Chat Context
The chat system sends the entire post object as context to Dify AI, allowing contextual responses about the specific article.

---

## Common Tasks & How-To

### Add a New Post

1. Create JSON file: `storage/posts/{num}-{slug}.json`
2. Include all required fields from POSTS_STRUCTURE.md
3. Ensure `metadata.created_time` is ISO 8601 UTC
4. Post appears immediately on next `/posts` page load

### Modify Post Data

1. Edit JSON file in `storage/posts/`
2. Update `metadata.modification_time` to current ISO 8601
3. Increment `metadata.version`
4. Changes visible immediately on next request (no cache)

### Change Design/Colors

1. Edit `styles.css` for color variables and animations
2. Use Dracula palette defined in CSS custom properties
3. Tailwind classes in templates for spacing/layout

### Add New Route

1. Add route handler in `app.js` with try-catch
2. Create/update EJS template in `views/`
3. Pass required variables from service layer
4. Render with error handling

### Debug Issues

- Check `console.error()` output on server terminal
- All postService functions log errors before returning empty/null
- No client-side error details exposed to user (by design)

---

## Dependencies & Versions

```json
{
  "dotenv": "^17.2.3",          // Environment variables (optional)
  "ejs": "^3.1.10",             // Server-side templating
  "express": "^5.1.0"           // Web framework
}
```

No dev dependencies, no linting, no testing framework. This is a bare-bones production setup.

---

## Performance Notes

- **No caching**: Every request reads and processes all posts from disk
- **Linear search**: `searchPosts()` and tag filtering are O(n)
- **Related posts**: Recalculated on every post view (O(n*m))
- **View counter**: Writes to disk synchronously on each view

For high traffic, consider:
- File-based caching (memoize `getAllPosts`)
- Lazy-load related posts
- Debounce view increments (batch write to disk)
- Move to database (MongoDB recommended in POSTS_STRUCTURE.md)

---

## Security Notes

- No authentication/authorization (public blog)
- No input sanitization on post content (sanitize in client if accepting user input)
- No rate limiting on views or search
- JSON files are readable/writable by Node process
- Ensure `storage/posts/` has proper file permissions
- HTML escaping in chat messages (XSS prevention)

---

## File Editing Reminders

When modifying existing code:
1. Match indentation exactly (spaces, not tabs)
2. Preserve error handling pattern (try-catch with console.error)
3. Keep async/await for all file operations
4. Update both `app.js` and `postService.js` if changing post structure
5. Test on all routes after changes

---

## Next Steps (If Implementing)

From ROUTES.md future features:
- [ ] Admin authentication
- [ ] POST/PUT/DELETE endpoints for CRUD operations
- [ ] Advanced filtering and sorting
- [ ] Comment system
- [ ] Pagination in search results

---

## Reference Documentation

- **POSTS_STRUCTURE.md**: Post JSON schema, validation rules, scalability notes
- **ROUTES.md**: Detailed route definitions with examples and use flows
