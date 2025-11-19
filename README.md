# AWONG_blog 🚀

> A minimalist, AI-powered blog platform built with Node.js, Express, and Dify AI.

**⚡ 100% Created with AI** - This entire project was scaffolded and developed using AI assistance, from the backend architecture to the frontend UI and documentation.

---

## 🎯 Features

- **Dynamic Island Navbar** - Apple-inspired navigation bar with theme toggle
- **AI Chat Integration** - Ask questions about posts using Dify AI
- **Theme System** - Dark (Dracula) and Light (Solarized) themes with persistent storage
- **Responsive Design** - Mobile-first, beautifully styled with Tailwind CSS
- **Post Management** - File-based JSON storage with metadata, tags, and view tracking
- **Markdown Support** - AI responses render with proper markdown formatting

---

## 🏗️ Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Browser / Client                          │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────┐ │
│  │  Theme.js   │  │  Chat.js     │  │  Glitch.js         │ │
│  │ (theme      │  │ (AI chat UI, │  │ (animations,       │ │
│  │  toggle)    │  │  markdown    │  │  effects)          │ │
│  │             │  │  rendering)  │  │                    │ │
│  └─────────────┘  └──────────────┘  └────────────────────┘ │
└────┬──────────────────┬────────────────────┬─────────────────┘
     │                  │                    │
     │                  │                    │
┌────▼──────────────────▼────────────────────▼─────────────────┐
│                    Express Server (Node.js)                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Routes                                              │   │
│  │  GET  /              - Home page                     │   │
│  │  GET  /posts         - List all posts (paginated)    │   │
│  │  GET  /posts/:id     - Post detail + AI chat         │   │
│  │  GET  /about         - About page                    │   │
│  │  GET  /search?q=     - Search posts                  │   │
│  │  GET  /posts/tag/:tag - Filter by tag               │   │
│  │  POST /api/chat      - AI chat endpoint              │   │
│  └──────────────────────────────────────────────────────┘   │
└────┬──────────────────┬────────────────────┬─────────────────┘
     │                  │                    │
     │                  │                    │
┌────▼──────────────────▼────────────────────▼─────────────────┐
│                    Services Layer                             │
│  ┌──────────────────────────────┐  ┌────────────────────┐   │
│  │ postService.js               │  │ difyService.js     │   │
│  │                              │  │                    │   │
│  │ - getAllPosts()              │  │ - sendMessage()    │   │
│  │ - getPostById()              │  │ - AI API calls     │   │
│  │ - searchPosts()              │  │ - Markdown         │   │
│  │ - getPostsByTag()            │  │   responses        │   │
│  │ - incrementViews             │  │                    │   │
│  └──────────────────────────────┘  └────────────────────┘   │
└────┬──────────────────────────────────────┬─────────────────┘
     │                                      │
     │                                      │
┌────▼──────────────────────────────────────▼─────────────────┐
│                    Data Sources                              │
│  ┌──────────────────────────────┐  ┌────────────────────┐   │
│  │ ./storage/posts/             │  │ Dify AI API        │   │
│  │                              │  │                    │   │
│  │ - JSON files                 │  │ - Chat API         │   │
│  │ - Post metadata              │  │ - Markdown         │   │
│  │ - View counts                │  │   responses        │   │
│  │                              │  │ - Conversation     │   │
│  │                              │  │   threading        │   │
│  └──────────────────────────────┘  └────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Posts Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                    Blog Lifecycle                            │
└─────────────────────────────────────────────────────────────┘

1. WRITE POSTS (Local Storage)
   ┌─────────────────────────┐
   │  ./storage/posts/       │
   │  ├─ 001-post.json       │
   │  ├─ 002-post.json       │
   │  └─ ...                 │
   └────────────┬────────────┘
                │
2. READ POSTS (On Demand)
   ├─────────────────────────────────────────┤
   │  postService.getAllPosts()              │
   │  - Reads ./storage/posts/*.json         │
   │  - Sorts by created_time DESC           │
   │  - Returns: [post1, post2, ...]         │
   └─────────────────────────────────────────┘
                │
   ┌────────────▼─────────────────────────────┐
   │  Display in Views                        │
   │  ├─ /posts (list, paginated)            │
   │  ├─ /posts/:id (detail + AI chat)       │
   │  ├─ /search (search results)            │
   │  └─ /posts/tag/:tag (filtered)          │
   └──────────────────────────────────────────┘
                │
3. AI CHAT (On Post Detail Page)
   ├─────────────────────────────────────────┤
   │  User asks: "What is this post about?"  │
   └──────────────────┬──────────────────────┘
                      │
   ┌──────────────────▼──────────────────────┐
   │  chat.js (Frontend)                     │
   │  POST /api/chat                         │
   │  {                                      │
   │    query: "What is this post about?",  │
   │    postId: "001-nodejs",               │
   │    conversationId: null (first msg)    │
   │  }                                      │
   └──────────────────┬──────────────────────┘
                      │
   ┌──────────────────▼──────────────────────┐
   │  app.js /api/chat endpoint              │
   │  - Gets post from postService           │
   │  - Calls difyService.sendMessage()      │
   └──────────────────┬──────────────────────┘
                      │
   ┌──────────────────▼──────────────────────┐
   │  difyService.js                         │
   │  POST https://dify.andres-wong.com/v1   │
   │  {                                      │
   │    query: JSON.stringify({              │
   │      actual_post: {...},                │
   │      user_prompt: "What is..."          │
   │    }),                                  │
   │    conversation_id: "first-time"        │
   │  }                                      │
   └──────────────────┬──────────────────────┘
                      │
   ┌──────────────────▼──────────────────────┐
   │  Dify AI Backend                        │
   │  - Processes context + question         │
   │  - Generates markdown response          │
   │  - Returns conversation_id              │
   └──────────────────┬──────────────────────┘
                      │
   ┌──────────────────▼──────────────────────┐
   │  Browser Receives Response              │
   │  {                                      │
   │    success: true,                       │
   │    answer: "## Response\n**Bold**...",  │
   │    conversation_id: "abc-123-xyz"       │
   │  }                                      │
   └──────────────────┬──────────────────────┘
                      │
   ┌──────────────────▼──────────────────────┐
   │  chat.js renders markdown               │
   │  - **text** → <strong>                  │
   │  - ## text → <h3>                       │
   │  - `code` → <code>                      │
   │  - Line breaks → <br>                   │
   │  - Displays in message bubble           │
   └──────────────────┬──────────────────────┘
                      │
   For follow-up messages:
   - Include conversation_id in next request
   - Maintains thread context
   - Returns related Dify resources
   │
   └─────────────────────────────────────────┘
```

### File Structure

```
blog/
├── .git/                          # Git repository
├── .gitignore                     # Excludes node_modules, etc
├── README.md                      # This file
├── package.json                   # Dependencies: express, ejs
├── app.js                         # Express server & routes
│
├── services/
│   ├── postService.js             # Post CRUD operations
│   └── difyService.js             # AI chat API calls
│
├── views/                         # EJS templates
│   ├── index.ejs                  # Home page
│   ├── posts.ejs                  # Posts list
│   ├── post-detail.ejs            # Post detail + AI chat
│   ├── about.ejs                  # About page
│   ├── footer.ejs                 # Footer component
│   └── error.ejs                  # Error page
│
├── public/                        # Frontend assets
│   ├── styles.css                 # Theme system + chat styles
│   ├── theme.js                   # Dark/light theme toggle
│   ├── chat.js                    # AI chat UI controller
│   └── glitch.js                  # Animations & effects
│
└── storage/
    └── posts/                     # JSON files for blog posts
        ├── 001-post-slug.json
        ├── 002-post-slug.json
        └── .gitkeep               # Keeps directory tracked
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 14+
- npm

### Installation

```bash
# Clone the blog repo
git clone git@github.com:andyeswong/blog.git
cd blog

# Install dependencies
npm install

# Start server
npm start
```

Server runs on `http://localhost:3000`

---

## 🔧 Configuration

### Environment Variables

```bash
# .env (optional)
PORT=3000
```

---

## 📡 API Endpoints

### Posts
- `GET /posts` - List all posts (paginated, 10/page)
- `GET /posts/:id` - Get single post
- `GET /posts/tag/:tag` - Filter by tag
- `GET /search?q=query` - Search posts

### Data
- `GET /api/posts` - JSON: all posts
- `GET /api/stats` - JSON: blog statistics

### AI
- `POST /api/chat` - Chat with AI about post

---

## 🤖 AI Features

### Chat on Posts
Every post has an AI chat sidebar powered by Dify:

1. Ask questions about the post
2. AI reads the full post context
3. Responses in markdown format
4. Conversation threading (context preserved)

### Request Format
```json
{
  "query": "user question",
  "postId": "001-nodejs",
  "conversationId": "abc-123" // null on first message
}
```

### Response Format
```json
{
  "success": true,
  "answer": "# Response\n**Bold text**...",
  "conversation_id": "abc-123-xyz",
  "metadata": {
    "usage": { "tokens": 1161, ... }
  }
}
```

---

## 🎨 Theme System

Two themes available:
- **Dark** (Dracula) - Default, optimized for night reading
- **Light** (Solarized) - High contrast, optimized for day reading

Toggle button in navbar. Persists in localStorage.

---

## 📝 Writing Posts

Posts are JSON files in the `storage/posts/` directory:

```json
{
  "id": "001-post-slug",
  "title": "Post Title",
  "description": "Short description",
  "content": "<article>HTML content</article>",
  "tags": ["tag1", "tag2"],
  "author": "AWONG",
  "reading_time": 8,
  "featured": true,
  "views": 42,
  "metadata": {
    "created_time": "2024-01-15T10:30:00Z",
    "modification_time": "2024-01-20T14:22:00Z",
    "version": "1.0",
    "status": "published"
  }
}
```

Add new posts directly to `storage/posts/` with the naming convention `{number}-{slug}.json`.

---

## 🔐 Security

- HTML escaping in chat messages (XSS prevention)
- No sensitive data in logs
- View counts updated locally (not production-grade)

---

## 📊 Performance

- **Posts cached**: On each API call
- **Pagination**: 10 posts per page
- **File-based**: Scales to ~1000s of posts
- **CDN ready**: Static assets in `public/`

---

## 🛠️ Development

### Add New Features
1. Services handle business logic
2. Routes in `app.js`
3. Views in `views/`
4. Styles in `public/styles.css`

### Testing
```bash
# Test posts API
curl http://localhost:3000/api/posts

# Test chat
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"query":"test","postId":"001-charm-crush","conversationId":null}'
```

---

## 📚 Documentation

- [Chat Testing](./CHAT_TESTING.md) - AI features
- [Routes](./ROUTES.md) - API reference
- [Post Structure](./POSTS_STRUCTURE.md) - JSON format

---

## 🤝 Contributing

This is a personal blog, but the architecture is open-sourced:
- Fork the repo
- Create feature branch
- Submit pull requests

---

## 📄 License

MIT - Use freely, credit appreciated

---

## 🙏 Acknowledgments

**100% AI-Generated** with assistance from:
- Claude (architecture, services, routing)
- Crush (documentation, setup)
- Dify (AI conversation engine)

This project demonstrates how modern AI can bootstrap a full-stack application from concept to production.

---

**Made with ✨ and AI** • [Portfolio](https://andres-wong.com) • [GitHub](https://github.com/andyeswong)
