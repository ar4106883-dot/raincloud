# Quick Start Guide - Raincloud

## Setup Instructions

### 1. Install Dependencies

```bash
npm install express cors dotenv
npm install --save-dev typescript @types/node @types/express ts-node
```

### 2. Configure Environment Variables

Create a `.env` file:

```env
# At least one provider is required
ANTHROPIC_API_KEY=your_anthropic_key_here
OPENAI_API_KEY=your_openai_key_here
GOOGLE_API_KEY=your_google_key_here

PORT=3001
```

### 3. Compile TypeScript (optional if using ts-node)

```bash
npx tsc
```

### 4. Start the Server

```bash
npx ts-node src/api/server.ts
# or
node dist/api/server.js
```

## Usage Examples

### Example 1: Board Discussion

```typescript
// Request
POST http://localhost:3001/api/board/discuss
Content-Type: application/json

{
  "query": "We need to improve our user onboarding experience. What should we prioritize?",
  "mode": "relevant"  // or "all" for all board members
}

// Response
{
  "query": "We need to improve our user onboarding experience...",
  "responses": [
    {
      "agent": "Sarah Chen",
      "role": "CEO",
      "response": "From a strategic perspective, improving onboarding directly impacts...",
      "timestamp": "2025-10-31T03:00:00.000Z",
      "provider": "anthropic",
      "latency": 1250,
      "tokens": 450
    },
    {
      "agent": "Emily Watson",
      "role": "Product Manager",
      "response": "Based on user research, the key friction points are...",
      "timestamp": "2025-10-31T03:00:01.500Z",
      "provider": "anthropic",
      "latency": 1180,
      "tokens": 520
    },
    {
      "agent": "Lisa Park",
      "role": "UX Designer",
      "response": "From a UX perspective, we should focus on...",
      "timestamp": "2025-10-31T03:00:02.000Z",
      "provider": "google",
      "latency": 950,
      "tokens": 380
    }
  ],
  "totalLatency": 3380,
  "totalCost": 0.0135
}
```

### Example 2: Direct Claude Response

```typescript
// Request
POST http://localhost:3001/api/claude/direct
Content-Type: application/json

{
  "query": "What's the best way to structure a REST API?",
  "provider": "anthropic"  // optional
}

// Response
{
  "content": "Here's how to structure a REST API effectively...",
  "model": "claude-sonnet-4-5-20250929",
  "usage": {
    "promptTokens": 25,
    "completionTokens": 450,
    "totalTokens": 475
  },
  "provider": "anthropic",
  "latency": 1200
}
```

### Example 3: Get Board Members

```typescript
// Request
GET http://localhost:3001/api/board/members

// Response
{
  "members": [
    {
      "id": "ceo",
      "name": "Sarah Chen",
      "role": "CEO",
      "expertise": "Strategy & Vision",
      "priority": 1
    },
    // ... other members
  ]
}
```

## Integration with Your React Frontend

Update your frontend API calls to use the new endpoints:

```typescript
// Old Langbase call
const response = await fetch('/api/langbase', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ input: userQuery })
});

// New portable call (same interface!)
const response = await fetch('/api/langbase', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    input: userQuery,
    mode: 'board' // or 'claude'
  })
});
```

The server provides a legacy endpoint for compatibility, so your existing frontend will work without changes!

## Customization

### Add More Board Members

Edit `config/agents.json`:

```json
{
  "boardMembers": [
    // ... existing members
    {
      "id": "cfo",
      "name": "James Wilson",
      "role": "CFO",
      "expertise": "Financial Strategy",
      "systemPrompt": "You are James Wilson, CFO with expertise in...",
      "preferredProvider": "openai",
      "fallbackProviders": ["anthropic"],
      "temperature": 0.5,
      "priority": 2
    }
  ]
}
```

### Change Provider Routing

Modify `preferredProvider` in agent config to route different agents to different AI providers:

- Use Anthropic Claude for strategic/creative thinking
- Use OpenAI GPT-4 for technical analysis
- Use Google Gemini for research/data tasks
- Use Local LLMs for simple queries (cost-free!)

### Add New Providers

1. Create new provider class in `src/providers/`
2. Implement the `AIProvider` interface
3. Register in `BoardOrchestrator`

### Adjust Concurrency

In `config/agents.json`:

```json
{
  "boardSettings": {
    "maxConcurrentAgents": 6,  // Process more agents in parallel
    "responseTimeout": 60000    // 60 second timeout
  }
}
```

## Cost Optimization Tips

1. **Route by Complexity**
   - Simple queries → Google Gemini (free tier)
   - Medium queries → Local LLMs (Ollama)
   - Complex queries → Claude Sonnet 4.5 or GPT-4

2. **Use Fallbacks**
   - Primary: Cheaper provider
   - Fallback: Premium provider only when needed

3. **Batch Requests**
   - Set `maxConcurrentAgents` higher for faster responses
   - Set lower for sequential processing (more control)

4. **Monitor Costs**
   - Track `totalCost` in responses
   - Set up alerts for high usage
   - Review provider usage weekly

## Migration from Langbase

Your exported agent already works with this system! The `/api/langbase` endpoint maintains compatibility.

### Before (Langbase)
- Monthly subscription: $X
- Vendor lock-in
- Limited provider choice

### After (Portable)
- Pay-per-use only
- Switch providers anytime
- 50-90% cost reduction
- Full control of data

## Troubleshooting

### "Provider not configured"
- Check `.env` file has API keys
- Ensure at least one provider is configured

### "No available provider for X"
- Member's preferred provider failed
- Check API keys are valid
- Check fallback providers are configured

### Slow responses
- Reduce `maxConcurrentAgents`
- Use faster providers (Gemini, local LLMs)
- Increase timeout settings

## Next Steps

1. ✅ Test with your existing frontend
2. ✅ Add monitoring/logging
3. ✅ Set up rate limiting
4. ✅ Add caching layer
5. ✅ Deploy to production

## Support

This is YOUR system now - you own all the code and data. Modify anything you want!
