/**
 * AI Recommendation Interface for Homepage
 * Handles user queries and displays AI-powered post recommendations
 */

class AIRecommender {
  constructor() {
    this.conversationId = null;
    this.isLoading = false;
  }

  /**
   * Initialize the recommender
   */
  init() {
    this.attachListeners();
  }

  /**
   * Attach event listeners
   */
  attachListeners() {
    const form = document.getElementById('recommend-form');
    if (form) {
      form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    // Auto-resize textarea
    const textarea = document.getElementById('recommend-input');
    if (textarea) {
      textarea.addEventListener('input', () => {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
      });
    }
  }

  /**
   * Handle form submission
   */
  async handleSubmit(e) {
    e.preventDefault();
    
    const input = document.getElementById('recommend-input');
    const query = input.value.trim();

    if (!query || this.isLoading) return;

    // Show loading state
    this.setLoading(true);
    this.hideError();
    this.hideResults();

    try {
      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: query,
          conversationId: this.conversationId
        })
      });

      const data = await response.json();

      if (data.success) {
        // Store conversation ID for follow-up
        if (data.conversation_id) {
          this.conversationId = data.conversation_id;
        }
        this.showResults(data.answer);
      } else {
        this.showError(data.error || 'Error al obtener recomendaciones');
      }
    } catch (error) {
      console.error('Recommendation error:', error);
      this.showError('Error de conexión. Intenta de nuevo.');
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Set loading state
   */
  setLoading(loading) {
    this.isLoading = loading;
    const btn = document.getElementById('recommend-btn');
    const btnText = document.getElementById('recommend-btn-text');
    const btnLoading = document.getElementById('recommend-btn-loading');

    if (btn && btnText && btnLoading) {
      btn.disabled = loading;
      btnText.classList.toggle('hidden', loading);
      btnLoading.classList.toggle('hidden', !loading);
    }
  }

  /**
   * Show results
   */
  showResults(markdown) {
    const resultsContainer = document.getElementById('recommend-results');
    const contentContainer = document.getElementById('recommend-content');

    if (resultsContainer && contentContainer) {
      contentContainer.innerHTML = this.markdownToHtml(markdown);
      resultsContainer.classList.remove('hidden');
      
      // Smooth scroll to results
      setTimeout(() => {
        resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }

  /**
   * Hide results
   */
  hideResults() {
    const resultsContainer = document.getElementById('recommend-results');
    if (resultsContainer) {
      resultsContainer.classList.add('hidden');
    }
  }

  /**
   * Show error
   */
  showError(message) {
    const errorContainer = document.getElementById('recommend-error');
    const errorText = document.getElementById('recommend-error-text');

    if (errorContainer && errorText) {
      errorText.textContent = message;
      errorContainer.classList.remove('hidden');
    }
  }

  /**
   * Hide error
   */
  hideError() {
    const errorContainer = document.getElementById('recommend-error');
    if (errorContainer) {
      errorContainer.classList.add('hidden');
    }
  }

  /**
   * Convert markdown to HTML with link support
   */
  markdownToHtml(markdown) {
    let html = this.escapeHtml(markdown);
    
    // Links: [text](url) -> <a href="url">text</a>
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="recommend-link" style="color: var(--cyan); text-decoration: underline;">$1</a>');
    
    // Bold: **text** -> <strong>text</strong>
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    
    // Italic: *text* -> <em>text</em>
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    
    // Code inline: `code` -> <code>code</code>
    html = html.replace(/`(.+?)`/g, '<code style="background-color: var(--bg); padding: 2px 6px; border-radius: 4px;">$1</code>');
    
    // Headers: # text -> <h4>text</h4>
    html = html.replace(/^### (.+?)$/gm, '<h4 style="color: var(--purple); margin-top: 1rem; margin-bottom: 0.5rem;">$1</h4>');
    html = html.replace(/^## (.+?)$/gm, '<h3 style="color: var(--purple); margin-top: 1rem; margin-bottom: 0.5rem;">$1</h3>');
    html = html.replace(/^# (.+?)$/gm, '<h2 style="color: var(--purple); margin-top: 1rem; margin-bottom: 0.5rem;">$1</h2>');
    
    // Lists: - item -> <li>item</li>
    html = html.replace(/^\- (.+?)$/gm, '<li style="margin-left: 1rem; margin-bottom: 0.25rem;">• $1</li>');
    
    // Numbered lists: 1. item -> <li>item</li>
    html = html.replace(/^\d+\. (.+?)$/gm, '<li style="margin-left: 1rem; margin-bottom: 0.25rem;">$1</li>');
    
    // Line breaks: \n -> <br>
    html = html.replace(/\n/g, '<br>');
    
    return html;
  }

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    const map = {
      '&': '&',
      '<': '<',
      '>': '>',
      '"': '"',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  const recommender = new AIRecommender();
  recommender.init();
});
