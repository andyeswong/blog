/**
 * Dify AI Chat Service
 * Communicates with Dify AI backend for post-specific conversations
 */

const DIFY_API_URL = 'https://dify.andres-wong.com/v1';
const DIFY_API_KEY = 'app-VZt3lE1zZuCaOHJV8JFpOdHj';

/**
 * Send message to Dify AI
 * @param {Object} params
 * @param {string} params.query - User question
 * @param {Object} params.post - Current post data
 * @param {string} params.conversationId - Conversation ID (optional, only for follow-up messages)
 * @returns {Promise<Object>} Response from Dify
 */
async function sendMessage({ query, post, conversationId = null }) {
  try {
    // Create the context JSON
    const contextData = {
      actual_post: post,
      user_prompt: query
    };

    const body = {
      inputs: {},
      query: JSON.stringify(contextData),
      response_mode: 'blocking',
      user: 'blog-user'
    };

    // Add conversation_id only if it exists (not first message)
    if (conversationId) {
      body.conversation_id = conversationId;
    } else {
      body.conversation_id = '';
    }

    const response = await fetch(`${DIFY_API_URL}/chat-messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DIFY_API_KEY}`
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`Dify API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      answer: data.answer,
      conversation_id: data.conversation_id,
      message_id: data.message_id,
      metadata: data.metadata
    };
  } catch (error) {
    console.error('Dify API error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Send recommendation request to Dify AI
 * @param {Object} params
 * @param {string} params.query - User question about what they want to learn
 * @param {Array} params.posts - Array of all posts with title, id, description
 * @param {string} params.conversationId - Conversation ID (optional)
 * @returns {Promise<Object>} Response from Dify with recommendations
 */
async function sendRecommendation({ query, posts, conversationId = null }) {
  try {
    // Create posts list with links for context
    const postsContext = posts.map(post => ({
      title: post.title,
      url: `/posts/${post.id}`,
      description: post.description,
      tags: post.tags
    }));

    // Create the context JSON with instruction for Dify
    const contextData = {
      instruction: "Eres un asistente de blog que recomienda artículos. Basándote en la pregunta del usuario y la lista de posts disponibles, recomienda los posts más relevantes. Responde en español con markdown, incluyendo los enlaces a los posts recomendados usando el formato [Título](url). Explica brevemente por qué cada post es relevante para lo que el usuario quiere aprender.",
      available_posts: postsContext,
      user_query: query
    };

    const body = {
      inputs: {},
      query: JSON.stringify(contextData),
      response_mode: 'blocking',
      user: 'blog-visitor'
    };

    // Add conversation_id only if it exists
    if (conversationId) {
      body.conversation_id = conversationId;
    } else {
      body.conversation_id = '';
    }

    const response = await fetch(`${DIFY_API_URL}/chat-messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DIFY_API_KEY}`
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`Dify API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      answer: data.answer,
      conversation_id: data.conversation_id,
      message_id: data.message_id,
      metadata: data.metadata
    };
  } catch (error) {
    console.error('Dify Recommendation API error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  sendMessage,
  sendRecommendation
};
