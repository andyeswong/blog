# AWONG Blog - Environment & Configuration

## Environment Variables Required
- **POSTS_REPO_URL**: GitHub repository URL for posts (e.g., `https://github.com/andyeswong/blog-posts.git`)

## Setup Instructions
1. Set the environment variable:
   ```bash
   export POSTS_REPO_URL="https://github.com/andyeswong/blog-posts.git"
   # or for Windows:
   set POSTS_REPO_URL=https://github.com/andyeswong/blog-posts.git
   ```

2. Start the server:
   ```bash
   npm start
   # or
   node app.js
   ```

## Git Integration Features
- **Auto-pull on index**: Every time `/` is visited, posts are synced (throttled to every 2 minutes)
- **Manual pull API**: POST `/api/pull-posts` to force refresh posts from GitHub
- **Smart throttling**: Prevents excessive git pulls (configurable interval)
- **Graceful fallback**: Uses existing posts if git pull fails

## API Endpoints
- `POST /api/pull-posts` - Force sync posts from GitHub
  - Response: `{ success: bool, message: string, timestamp: ISO8601 }`

## Cache Files
- `.git-pull-cache` - Stores timestamp of last git pull for throttling

## Testing
```bash
# Test posts API
curl http://localhost:3000/api/posts

# Force pull posts
curl -X POST http://localhost:3000/api/pull-posts

# Test stats
curl http://localhost:3000/api/stats
```
