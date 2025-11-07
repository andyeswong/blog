# Testing the AI Chat Feature

## Start the server
npm start

## Visit a post with chat
http://localhost:3000/posts/001-introduccion-nodejs

## Check if chat loads
- Right sidebar should show AI chat interface
- Try typing a question about the post
- Chat should send to /api/chat endpoint

## Test API directly
```bash
# Linux/Mac
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is Node.js?",
    "postId": "001-introduccion-nodejs",
    "conversationId": null
  }'
```

## Expected Response
```json
{
  "success": true,
  "answer": "AI response about the post...",
  "conversation_id": "xxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxx",
  "message_id": "xxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxx",
  "metadata": { ... }
}
```

## Features Implemented
✅ AI chat replaces metadata card on post detail page
✅ Conversation threading (first message has no conversation_id)
✅ Auto-stores conversation_id for follow-up messages
✅ Beautiful dark theme UI
✅ Scrollable messages
✅ Mobile responsive (hidden on mobile)
✅ Escape HTML for security
✅ Loading state on send button
