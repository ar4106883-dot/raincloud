import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { BoardOrchestrator } from './orchestrator/board';
import boardConfig from '../config/agents.json';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Provider configurations
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
  google: {
    apiKey: process.env.GOOGLE_API_KEY,
    model: 'gemini-2.0-flash-exp',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models'
  }
};

// Initialize board orchestrator
const board = new BoardOrchestrator(boardConfig, providerConfigs);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Board discussion endpoint
app.post('/api/board/discuss', async (req, res) => {
  try {
    const { query, mode = 'relevant' } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const discussion = await board.discussQuery(query, mode);
    res.json(discussion);
  } catch (error) {
    console.error('Board discussion error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Direct Claude endpoint
app.post('/api/claude/direct', async (req, res) => {
  try {
    const { query, provider = 'anthropic' } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const response = await board.getDirectResponse(query, provider);
    res.json(response);
  } catch (error) {
    console.error('Direct response error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Get board member info
app.get('/api/board/members', (req, res) => {
  res.json({ members: boardConfig.boardMembers });
});

// Legacy Langbase-compatible endpoint
app.post('/api/langbase', async (req, res) => {
  try {
    const { input, mode = 'board' } = req.body;

    if (!input) {
      return res.status(400).json({ error: 'Input is required' });
    }

    if (mode === 'board') {
      const discussion = await board.discussQuery(input, 'relevant');
      res.json({
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
      });
    } else {
      const response = await board.getDirectResponse(input);
      res.json({
        output: response.content,
        model: response.model,
        provider: response.provider
      });
    }
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message
    });
  }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Board Agent Server running on port ${PORT}`);
  console.log(`📊 API Endpoints:`);
  console.log(`   - POST /api/board/discuss - Board discussion`);
  console.log(`   - POST /api/claude/direct - Direct Claude`);
  console.log(`   - GET  /api/board/members - Board members`);
  console.log(`   - POST /api/langbase - Legacy compatibility`);
});

export default app;
