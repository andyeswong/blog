# AWONG Blog - Post System with GitHub Integration

## Overview
The blog uses a **file-based JSON storage system** with automatic GitHub synchronization. Posts are stored in `./storage/posts/` directory, which is connected to a GitHub repository for centralized post management.

---

## Architecture

### Directory Structure
```
blog/
├── storage/
│   └── posts/                 # JSON post files (git-linked)
│       ├── post-1.json
│       ├── post-2.json
│       └── ...
├── services/
│   ├── postService.js        # Post CRUD & queries
│   └── gitService.js         # GitHub sync & git operations
└── app.js                     # Express server with auto-pull
```

### File Flow
1. **GitHub Repository** → Git Clone/Pull → `./storage/posts/` → **postService reads**
2. **Auto-sync**: Every visit to `/` triggers smart pull (throttled)
3. **Manual-sync**: API endpoint `POST /api/pull-posts` for force refresh

---

## Setup Instructions

### 1. Environment Configuration
Set the GitHub posts repository URL:

**Linux/Mac:**
```bash
export POSTS_REPO_URL="https://github.com/andyeswong/blog-posts.git"
```

**Windows (Command Prompt):**
```cmd
set POSTS_REPO_URL=https://github.com/andyeswong/blog-posts.git
```

**Windows (PowerShell):**
```powershell
$env:POSTS_REPO_URL="https://github.com/andyeswong/blog-posts.git"
```

### 2. Initialize & Start
```bash
npm start
# or
node app.js
```

The server will:
- Initialize git repository on startup
- Clone posts from GitHub if needed
- Show status logs in console

---

## How It Works

### Smart Pull System
```
GET /     →  gitService.smartPull()  →  git pull  →  Update posts
```

**Features:**
- ✅ Auto-pull on homepage visit (2 minute throttle)
- ✅ Graceful fallback if git fails (uses existing posts)
- ✅ Prevents excessive git operations
- ✅ Caches pull timestamp in `.git-pull-cache`

### Git Service Methods
Located in `services/gitService.js`:

| Method | Purpose |
|--------|---------|
| `initializeRepository()` | Clone repo if first time |
| `pullLatestPosts()` | Force git pull origin main |
| `smartPull(options)` | Smart pull with throttling |
| `shouldPull(minInterval)` | Check if throttle expired |
| `getLastPullTime()` | Read cached timestamp |
| `setLastPullTime()` | Update cached timestamp |

### Post Service Methods
Located in `services/postService.js`:

| Method | Purpose |
|--------|---------|
| `getAllPosts()` | Read all .json files, sort by date DESC |
| `getPostById(postId)` | Get single post by ID |
| `getPostsByTag(tag)` | Filter posts by tag |
| `searchPosts(query)` | Search by title/description |
| `getFeaturedPosts()` | Get featured posts |
| `incrementPostViews(postId)` | Track views (updates JSON) |
| `getPostsStats()` | Get blog statistics |
| `getAllTags()` | Get unique tags |

---

## API Endpoints

### Posts Management
```
GET  /posts              # List all posts (paginated, 10/page)
GET  /posts/:id          # Get single post detail
GET  /posts/tag/:tag     # Filter by tag
GET  /search?q=query     # Search posts
```

### Statistics & Data
```
GET  /api/posts          # JSON: All posts
GET  /api/stats          # JSON: Blog statistics
```

### GitHub Sync
```
POST /api/pull-posts     # Force sync from GitHub
```

**Pull Response:**
```json
{
  "success": true,
  "message": "Posts synced with GitHub",
  "timestamp": "2024-11-07T12:00:00.000Z",
  "output": "Already up to date"
}
```

---

## JSON Post Format

Each post is a `.json` file (filename = ID):

```json
{
  "id": "hello-world",
  "title": "Hello World",
  "description": "My first post",
  "content": "<p>HTML content here</p>",
  "tags": ["javascript", "web"],
  "featured": true,
  "views": 42,
  "metadata": {
    "created_time": "2024-01-15T10:30:00.000Z",
    "modification_time": "2024-01-20T14:22:00.000Z",
    "author": "Andy"
  }
}
```

---

## Troubleshooting

### Posts not syncing?
1. Check `POSTS_REPO_URL` is set:
   ```bash
   echo $POSTS_REPO_URL  # Linux/Mac
   echo %POSTS_REPO_URL% # Windows CMD
   ```

2. Verify git is installed and accessible:
   ```bash
   git --version
   ```

3. Test manual sync:
   ```bash
   curl -X POST http://localhost:3000/api/pull-posts
   ```

### Git permission denied?
- Use HTTPS URLs instead of SSH
- Or configure SSH keys for GitHub

### Storage/posts directory doesn't exist?
- Auto-created on first git clone
- If manual setup needed: `mkdir -p storage/posts`

---

## Configuration Examples

### Change Pull Throttle Interval
Edit `app.js` line 21:
```javascript
// Current: 2 minutes
await gitService.smartPull({ minInterval: 2 * 60 * 1000 });

// Change to 5 minutes
await gitService.smartPull({ minInterval: 5 * 60 * 1000 });

// Change to 30 seconds (development)
await gitService.smartPull({ minInterval: 30 * 1000 });
```

### Disable Auto-Pull
Comment out in `app.js` lines 20-25:
```javascript
// try {
//   await gitService.smartPull({ minInterval: 2 * 60 * 1000 });
// } catch (error) {
//   console.error('Error pulling posts:', error);
// }
```

---

## Performance Notes

- **Throttling**: Prevents excessive git operations
- **Caching**: Posts remain in memory between API calls
- **Pagination**: 10 posts per page by default
- **No database**: Pure file-based, scalable up to ~1000s of posts

---

## Security Considerations

- ⚠️ **Public repo**: Posts repository should be public or credentials secure
- ⚠️ **View counts**: Modified directly in JSON files (not production-grade)
- ✅ **Git credentials**: Use environment variables or SSH keys, never hardcode

---

## Future Enhancements

- [ ] Background scheduler for periodic pulls
- [ ] Webhook receiver for GitHub push events
- [ ] Post caching layer (Redis/memory)
- [ ] Atomic file operations for view counts
- [ ] Metadata cache (stats, tags) with TTL
- [ ] Multi-branch support
- [ ] Rollback capability
