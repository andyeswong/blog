# AWONG_blog 🚀

> A minimalist, AI-powered blog platform built with Node.js, Express, and Dify AI.

**⚡ 100% Created with AI** - This entire project was scaffolded and developed using AI assistance, from the backend architecture to the frontend UI and documentation.

---

## 🎯 Features

- **Dynamic Island Navbar** - Apple-inspired navigation bar with theme toggle
- **AI Chat Integration** - Ask questions about posts using Dify AI
- **Theme System** - Dark (Dracula) and Light (Solarized) themes with persistent storage
- **GitHub Sync** - Automatic post synchronization from a separate GitHub repository
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
│  │  GET  /api/pull-posts- Manual sync posts             │   │
│  └──────────────────────────────────────────────────────┘   │
└────┬──────────────────┬────────────────────┬─────────────────┘
     │                  │                    │
     │                  │                    │
┌────▼──────────────────▼────────────────────▼─────────────────┐
│                    Services Layer                             │
│  ┌──────────────────┐  ┌──────────────┐  ┌────────────────┐ │
│  │ postService.js   │  │ gitService   │  │ difyService    │ │
│  │                  │  │              │  │                │ │
│  │ - getAllPosts()  │  │ - pullLatest- │  │ - sendMessage()│ │
│  │ - getPostById()  │  │   Posts()    │  │ - AI API calls │ │
│  │ - searchPosts()  │  │ - smartPull()│  │ - Markdown     │ │
│  │ - getPostsByTag()│  │ - throttling │  │   responses    │ │
│  │ - incrementViews │  │              │  │                │ │
│  └──────────────────┘  └──────────────┘  └────────────────┘ │
└────┬──────────────────┬────────────────────┬─────────────────┘
     │                  │                    │
     │                  │                    │
┌────▼──────────────────▼────────────────────▼─────────────────┐
│                    Data Sources                              │
│  ┌──────────────────┐  ┌──────────────┐  ┌────────────────┐ │
│  │ ./storage/posts/ │  │ GitHub Posts │  │ Dify AI API    │ │
│  │                  │  │ Repository   │  │                │ │
│  │ - JSON files     │  │              │  │ - Chat API     │ │
│  │ - Post metadata  │  │ - Master     │  │ - Markdown     │ │
│  │ - View counts    │  │   branch     │  │   responses    │ │
│  │                  │  │ - Auto-sync  │  │ - Conversation │ │
│  │                  │  │   every 2min │  │   threading    │ │
│  └──────────────────┘  └──────────────┘  └────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Posts Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                    Blog Lifecycle                            │
└─────────────────────────────────────────────────────────────┘

1. WRITE POSTS (External, separate repo)
   ┌─────────────────────────┐
   │  GitHub: blog-posts     │
   │  (andyeswong/blog-posts)│
   │  └─ posts/              │
   │    ├─ 001-nodejs.json   │
   │    ├─ 002-mcp.json      │
   │    └─ ...               │
   └────────────┬────────────┘
                │
                │ git push
                │
   ┌────────────▼────────────┐
   │  GITHUB.COM             │
   │  blog-posts repo        │
   │  (public)               │
   └────────────┬────────────┘
                │
                │ git clone/pull
                │
2. SYNC POSTS (Automatic)
   ┌────────────▼────────────────────────────┐
   │  gitService.smartPull()                 │
   │  Triggers:                              │
   │  - On app startup                       │
   │  - Every visit to /                     │
   │  - Manual POST /api/pull-posts          │
   │  Throttle: 2 min (configurable)         │
   └────────────┬─────────────────────────────┘
                │
                │ git pull origin master
                │
   ┌────────────▼────────────────────────────┐
   │  ./storage/ (git repo)                  │
   │  └─ posts/                              │
   │    ├─ 001-introduccion-nodejs.json      │
   │    ├─ 002-mcp-protocolo.json            │
   │    └─ .gitkeep                          │
   └────────────┬─────────────────────────────┘
                │
3. READ POSTS (On Demand)
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
4. AI CHAT (On Post Detail Page)
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
├── .gitignore                     # Excludes posts, node_modules, etc
├── README.md                      # This file
├── package.json                   # Dependencies: express, ejs
├── app.js                         # Express server & routes
│
├── services/
│   ├── postService.js             # Post CRUD operations
│   ├── gitService.js              # GitHub sync & git operations
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
├── storage/
│   └── posts/                     # (Ignored in git)
│       ├── 001-introduccion-nodejs.json
│       ├── 002-mcp-protocolo.json
│       └── .gitkeep               # Keeps directory tracked
│
└── docs/
    ├── GITHUB_INTEGRATION.md      # Posts sync documentation
    ├── ENV_CONFIG.md              # Environment setup
    ├── CHAT_TESTING.md            # Chat feature testing
    ├── DESIGN_SYSTEM.md           # Design guidelines
    ├── ROUTES.md                  # API routes
    └── POSTS_STRUCTURE.md         # JSON post format
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 14+
- Git
- npm

### Installation

```bash
# Clone the blog repo
git clone git@github.com:andyeswong/blog.git
cd blog

# Install dependencies
npm install

# Create .env file
echo 'POSTS_REPO_URL=https://github.com/andyeswong/blog-posts.git' > .env

# Start server
npm start
```

Server runs on `http://localhost:3000`

---

## 🔧 Configuration

### Environment Variables

```bash
# .env
POSTS_REPO_URL=https://github.com/andyeswong/blog-posts.git
PORT=3000
```

### Git Workflow

The project uses **two separate repositories**:

1. **Blog Code** (this repo)
   ```bash
   git@github.com:andyeswong/blog.git
   ```
   - App code, UI, services
   - Excluded: `./storage/posts/*`

2. **Blog Posts** (separate repo)
   ```bash
   https://github.com/andyeswong/blog-posts.git
   ```
   - JSON post files
   - Auto-synced every 2 minutes
   - Branched: `master`

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

### GitHub Sync
- `GET /api/pull-posts` - Manual sync posts

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

Posts are JSON files in the separate repository:

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

Push to `https://github.com/andyeswong/blog-posts.git` and posts auto-sync within 2 minutes.

---

## 🔐 Security

- HTML escaping in chat messages (XSS prevention)
- API key stored in environment variable
- No sensitive data in logs
- Posts repository can be public
- View counts updated locally (not production-grade)

---

## 📊 Performance

- **Posts cached**: On each API call
- **Auto-sync throttled**: 2 minutes default
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
  -d '{"query":"test","postId":"001-nodejs","conversationId":null}'

# Manual pull
curl http://localhost:3000/api/pull-posts
```

---

## 📚 Documentation

- [GitHub Integration](./GITHUB_INTEGRATION.md) - Post sync setup
- [Environment Config](./ENV_CONFIG.md) - Variables & setup
- [Chat Testing](./CHAT_TESTING.md) - AI features
- [Design System](./DESIGN_SYSTEM.md) - UI guidelines
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
- Crush (documentation, git setup)
- Dify (AI conversation engine)

This project demonstrates how modern AI can bootstrap a full-stack application from concept to production.

---

**Made with ✨ and AI** • [Portfolio](https://andres-wong.com) • [GitHub](https://github.com/andyeswong)
