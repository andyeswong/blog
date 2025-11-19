/**
 * Post AI Chat Interface
 * Replaces metadata card with interactive chat about the post
 */

class PostAIChat {
  constructor(postId, containerId = 'ai-chat-container') {
    this.postId = postId;
    this.containerId = containerId;
    this.conversationId = null;
    this.messages = [];
    this.isLoading = false;
  }

  /**
   * Initialize chat interface
   */
  init() {
    this.render();
    this.attachListeners();
  }

  /**
   * Render chat HTML
   */
  render() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="ai-chat-panel">
        <!-- Header -->
        <div class="chat-header">
          <div class="chat-title-icon">
            <div class="title-text">
              <h3>Preguntas sobre el artículo</h3>
              <p class="subtitle">Powered by AI</p>
            </div>
          </div>
        </div>

        <!-- Messages Container -->
        <div class="chat-messages" id="chat-messages">
          <div class="welcome-message">
            <p>Hola 👋 Tengo preguntas sobre este artículo? Preguntame cualquier cosa y usaré el contenido del post para responder.</p>
          </div>
        </div>

        <!-- Input Area -->
        <div class="chat-input-area">
          <form id="chat-form" class="chat-form">
            <input
              type="text"
              id="chat-input"
              placeholder="Pregunta algo sobre este artículo..."
              class="chat-input"
              autocomplete="off"
            />
            <button type="submit" class="chat-send-btn" id="chat-send-btn">
              <span class="send-icon">↑</span>
            </button>
          </form>
          <div class="chat-footer-text">AI puede cometer errores. Verifica las respuestas importantes.</div>
        </div>
      </div>
    `;
  }

  /**
   * Attach event listeners
   */
  attachListeners() {
    const form = document.getElementById('chat-form');
    if (form) {
      form.addEventListener('submit', (e) => this.handleSubmit(e));
    }
  }

  /**
   * Handle form submission
   */
  async handleSubmit(e) {
    e.preventDefault();
    const input = document.getElementById('chat-input');
    const message = input.value.trim();

    if (!message || this.isLoading) return;

    // Add user message to UI
    this.addMessage(message, 'user');
    input.value = '';

    // Send to API
    this.isLoading = true;
    const btn = document.getElementById('chat-send-btn');
    btn.disabled = true;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: message,
          postId: this.postId,
          conversationId: this.conversationId
        })
      });

      const data = await response.json();

      if (data.success) {
        // Store conversation ID from first response
        if (data.conversation_id) {
          this.conversationId = data.conversation_id;
        }
        this.addMessage(data.answer, 'ai');
      } else {
        this.addMessage('Disculpa, hubo un error al procesar tu pregunta.', 'error');
      }
    } catch (error) {
      console.error('Chat error:', error);
      this.addMessage('Error de conexión. Intenta de nuevo.', 'error');
    } finally {
      this.isLoading = false;
      btn.disabled = false;
      input.focus();
    }
  }

  /**
   * Add message to chat
   */
  addMessage(text, type = 'user') {
    const messagesContainer = document.getElementById('chat-messages');
    
    // Remove welcome message on first user message
    if (type === 'user' && messagesContainer.querySelector('.welcome-message')) {
      messagesContainer.innerHTML = '';
    }

    const messageEl = document.createElement('div');
    messageEl.className = `chat-message chat-message-${type}`;
    
    if (type === 'ai') {
      messageEl.innerHTML = `
        <div class="message-avatar">🤖</div>
        <div class="message-content markdown-content">${this.markdownToHtml(text)}</div>
      `;
    } else if (type === 'error') {
      messageEl.innerHTML = `
        <div class="message-content error">${this.escapeHtml(text)}</div>
      `;
    } else {
      messageEl.innerHTML = `
        <div class="message-content">${this.escapeHtml(text)}</div>
      `;
    }

    messagesContainer.appendChild(messageEl);
    
    // Auto-scroll to bottom
    setTimeout(() => {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 0);
  }

  /**
   * Convert markdown to HTML
   */
  markdownToHtml(markdown) {
    let html = this.escapeHtml(markdown);
    
    // Bold: **text** -> <strong>text</strong>
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    
    // Italic: *text* -> <em>text</em>
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    
    // Code inline: `code` -> <code>code</code>
    html = html.replace(/`(.+?)`/g, '<code>$1</code>');
    
    // Headers: # text -> <h4>text</h4>
    html = html.replace(/^### (.+?)$/gm, '<h4>$1</h4>');
    html = html.replace(/^## (.+?)$/gm, '<h3>$1</h3>');
    html = html.replace(/^# (.+?)$/gm, '<h2>$1</h2>');
    
    // Lists: - item -> <li>item</li>
    html = html.replace(/^\- (.+?)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*?<\/li>)/s, '<ul>$1</ul>');
    
    // Line breaks: \n -> <br>
    html = html.replace(/\n/g, '<br>');
    
    return html;
  }

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  const postId = document.body.dataset.postId;
  if (postId) {
    const chat = new PostAIChat(postId);
    chat.init();
  }
});
