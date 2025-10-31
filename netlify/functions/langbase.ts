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
    model: 'meta-llama/Llama-3.3-70B-Instruct'
  },
  google: {
    apiKey: process.env.GOOGLE_API_KEY,
    model: 'gemini-2.0-flash-exp'
  }
};

let boardInstance: BoardOrchestrator | null = null;

function getBoard() {
  if (!boardInstance) {
    boardInstance = new BoardOrchestrator(boardConfig, providerConfigs);
  }
  return boardInstance;
}

// Legacy Langbase-compatible endpoint
export const handler: Handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

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
    const { input, mode = 'board' } = JSON.parse(event.body || '{}');

    if (!input) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Input is required' })
      };
    }

    const board = getBoard();

    if (mode === 'board') {
      const discussion = await board.discussQuery(input, 'relevant');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          boardCommunication: {
            responses: discussion.responses.map(r => ({
              agent: r.agent,
              response: r.response,
              timestamp: r.timestamp
            }))
          },
          metadata: {
            totalLatency: discussion.totalLatency,
            totalCost: discussion.totalCost
          }
        })
      };
    } else {
      const response = await board.getDirectResponse(input);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          output: response.content,
          model: response.model,
          provider: response.provider
        })
      };
    }
  } catch (error: any) {
    console.error('API error:', error);
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
