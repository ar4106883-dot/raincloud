import { Handler } from '@netlify/functions';
import { BoardOrchestrator } from '../../src/orchestrator/board';
import boardConfig from '../../config/agents.json';

const providerConfigs = {
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: 'claude-sonnet-4-5-20250929',
    endpoint: 'https://api.anthropic.com/v1/messages'
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4o',
    endpoint: 'https://api.openai.com/v1/chat/completions'
  },
  huggingface: {
    apiKey: process.env.HUGGINGFACE_API_KEY,
    model: 'meta-llama/Llama-3.3-70B-Instruct',
    endpoint: 'https://api-inference.huggingface.co/models/'
  },
  google: {
    apiKey: process.env.GOOGLE_API_KEY,
    model: 'gemini-2.0-flash-exp',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models'
  }
};

let boardInstance: BoardOrchestrator | null = null;

function getBoard() {
  if (!boardInstance) {
    boardInstance = new BoardOrchestrator(boardConfig, providerConfigs);
  }
  return boardInstance;
}

export const handler: Handler = async (event) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { query, mode = 'relevant' } = JSON.parse(event.body || '{}');

    if (!query) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Query is required' })
      };
    }

    const board = getBoard();
    const discussion = await board.discussQuery(query, mode);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(discussion)
    };
  } catch (error: any) {
    console.error('Board discussion error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message
      })
    };
  }
};
