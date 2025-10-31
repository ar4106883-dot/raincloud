# ☁️ CLOUD DEPLOYMENT GUIDE

## Quick Deploy Options

Choose your platform (all are free tier friendly):

1. **Netlify** (Recommended) - Easiest, generous free tier
2. **Railway** - Simple, good for Express apps
3. **Vercel** - Fast, optimized for serverless

All three options deploy in under 5 minutes!

---

## 🚀 OPTION 1: NETLIFY (RECOMMENDED)

### Why Netlify?
- ✅ Free tier: 100GB bandwidth, 125K requests/month
- ✅ Automatic HTTPS
- ✅ Easy environment variables
- ✅ Serverless functions included

### Steps to Deploy:

#### 1. Install Netlify CLI
```bash
npm install -g netlify-cli
```

#### 2. Login to Netlify
```bash
netlify login
```
This opens a browser for authentication.

#### 3. Initialize Site
```bash
cd raincloud
netlify init
```

Follow prompts:
- **Create & configure a new site**: Yes
- **Team**: Choose your team
- **Site name**: your-board-agent (or auto-generate)
- **Build command**: `npm run build`
- **Deploy directory**: `dist`

#### 4. Set Environment Variables
```bash
netlify env:set ANTHROPIC_API_KEY "your-key-here"
netlify env:set OPENAI_API_KEY "your-key-here"
netlify env:set HUGGINGFACE_API_KEY "your-key-here"
netlify env:set GOOGLE_API_KEY "your-key-here"
```

Or set them in the Netlify dashboard:
1. Go to https://app.netlify.com
2. Select your site
3. Go to Site settings → Environment variables
4. Add each API key

#### 5. Deploy!
```bash
netlify deploy --prod
```

#### 6. Your API is Live!
```
Your site is live at: https://your-board-agent.netlify.app

API Endpoints:
- POST /api/board-discuss
- POST /api/claude-direct
- POST /api/langbase (legacy compatibility)
```

### Test Your Deployment
```bash
curl -X POST https://your-board-agent.netlify.app/api/board-discuss \
  -H "Content-Type: application/json" \
  -d '{"query": "Should we raise Series A now?", "mode": "relevant"}'
```

---

## 🚂 OPTION 2: RAILWAY

### Why Railway?
- ✅ Free $5/month credit
- ✅ Great for Express apps
- ✅ Simple deployment
- ✅ Automatic scaling

### Steps to Deploy:

#### 1. Install Railway CLI
```bash
npm install -g @railway/cli
```

#### 2. Login
```bash
railway login
```

#### 3. Initialize Project
```bash
cd raincloud
railway init
```

#### 4. Set Environment Variables
```bash
railway variables set ANTHROPIC_API_KEY="your-key"
railway variables set OPENAI_API_KEY="your-key"
railway variables set HUGGINGFACE_API_KEY="your-key"
railway variables set GOOGLE_API_KEY="your-key"
railway variables set PORT="3001"
```

#### 5. Deploy
```bash
railway up
```

#### 6. Get Your URL
```bash
railway domain
```

Your API is live at the provided URL!

---

## ⚡ OPTION 3: VERCEL

### Why Vercel?
- ✅ Free tier: 100GB bandwidth
- ✅ Optimized for serverless
- ✅ Fast global CDN
- ✅ Instant deployments

### Steps to Deploy:

#### 1. Install Vercel CLI
```bash
npm install -g vercel
```

#### 2. Deploy
```bash
cd raincloud
vercel
```

Follow prompts:
- **Set up and deploy**: Yes
- **Link to existing project**: No (first time)
- **Project name**: your-board-agent
- **Directory**: ./

#### 3. Set Environment Variables

Via CLI:
```bash
vercel env add ANTHROPIC_API_KEY
vercel env add OPENAI_API_KEY
vercel env add HUGGINGFACE_API_KEY
vercel env add GOOGLE_API_KEY
```

Or via dashboard:
1. Go to https://vercel.com
2. Select your project
3. Settings → Environment Variables
4. Add each API key

#### 4. Deploy to Production
```bash
vercel --prod
```

Your API is live!

---

## 🔑 Environment Variables You Need

**Required (at least ONE):**
- `ANTHROPIC_API_KEY` - Get from https://console.anthropic.com/
- `OPENAI_API_KEY` - Get from https://platform.openai.com/api-keys
- `HUGGINGFACE_API_KEY` - Get from https://huggingface.co/settings/tokens
- `GOOGLE_API_KEY` - Get from https://ai.google.dev/

**Optional:**
- `PORT` - Server port (Railway needs this, default 3001)

---

## 🎯 API Endpoints (All Platforms)

Once deployed, you have these endpoints:

### POST /api/board-discuss
Full board discussion
```bash
curl -X POST https://your-site.com/api/board-discuss \
  -H "Content-Type: application/json" \
  -d '{"query": "Your question here", "mode": "relevant"}'
```

### POST /api/claude-direct
Direct AI response
```bash
curl -X POST https://your-site.com/api/claude-direct \
  -H "Content-Type: application/json" \
  -d '{"query": "Your question", "provider": "anthropic"}'
```

### POST /api/langbase
Legacy Langbase compatibility
```bash
curl -X POST https://your-site.com/api/langbase \
  -H "Content-Type: application/json" \
  -d '{"input": "Your question", "mode": "board"}'
```

---

## 🔧 Update Your React Frontend

Once deployed, update your frontend API URL:

```javascript
// Old Langbase URL
const API_URL = 'https://command.new/your-agent';

// New deployed URL (choose based on platform)
const API_URL = 'https://your-board-agent.netlify.app';  // Netlify
// OR
const API_URL = 'https://your-app.up.railway.app';       // Railway
// OR
const API_URL = 'https://your-board-agent.vercel.app';   // Vercel

// Your existing code works as-is!
const response = await fetch(`${API_URL}/api/langbase`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ input: query, mode: 'board' })
});
```

---

## 💰 Cost Comparison

### Netlify
- **Free tier**: 100GB bandwidth, 125K requests/month
- **Pro**: $19/month for more
- **Your likely cost**: $0/month (free tier sufficient)

### Railway
- **Free**: $5 credit/month
- **Usage**: ~$5-10/month for light usage
- **Your likely cost**: $0-5/month

### Vercel
- **Free tier**: 100GB bandwidth
- **Pro**: $20/month
- **Your likely cost**: $0/month (free tier sufficient)

**Plus AI API costs:**
- Anthropic: $3-15 per million tokens
- OpenAI: $2.50-10 per million tokens
- Hugging Face: $0 (free) or $9/month Pro unlimited
- Google Gemini: $0 (free tier)

---

## 🐛 Troubleshooting

### "Module not found" errors
```bash
# Make sure you installed dependencies
npm install
```

### "Environment variable not set"
```bash
# Check your platform's env vars
netlify env:list    # Netlify
railway variables   # Railway
vercel env ls       # Vercel
```

### Deployment fails
```bash
# Check build logs
netlify logs     # Netlify
railway logs     # Railway
vercel logs      # Vercel
```

### API returns 500 error
- Check environment variables are set
- Verify API keys are valid
- Check logs for specific errors

---

## 🎉 Success Checklist

- ✅ Deployed to cloud platform
- ✅ Environment variables configured
- ✅ API endpoints responding
- ✅ Frontend connected to new URL
- ✅ Board members responding correctly
- ✅ All AI providers working

---

## 📊 Platform Recommendation

**For your use case (board agent system):**

1. **Netlify** - Best choice
   - Serverless functions perfect for this
   - Easiest to deploy and manage
   - Generous free tier
   - **Choose this if unsure**

2. **Railway** - Good alternative
   - Better for traditional Express apps
   - Simple deployment
   - Good for prototyping

3. **Vercel** - Also excellent
   - Very fast globally
   - Great for production
   - Slightly more complex setup

---

## 🚀 Quick Deploy Commands Summary

### Netlify
```bash
npm install -g netlify-cli
netlify login
netlify init
netlify env:set ANTHROPIC_API_KEY "your-key"
netlify deploy --prod
```

### Railway
```bash
npm install -g @railway/cli
railway login
railway init
railway variables set ANTHROPIC_API_KEY="your-key"
railway up
```

### Vercel
```bash
npm install -g vercel
vercel
vercel env add ANTHROPIC_API_KEY
vercel --prod
```

---

## ⏱️ Estimated Time

- **Account setup**: 2 minutes
- **CLI installation**: 1 minute
- **Deployment**: 2-5 minutes
- **Environment variables**: 2 minutes
- **Testing**: 2 minutes

**Total: 10-15 minutes** from zero to deployed! 🎊

---

## 🆘 Need Help?

1. Check platform documentation:
   - Netlify: https://docs.netlify.com
   - Railway: https://docs.railway.app
   - Vercel: https://vercel.com/docs

2. Check logs for errors:
   - Each platform has detailed logs in their dashboard

3. Verify your API keys are valid and have sufficient credits

---

**You're ready to deploy!** Choose your platform and follow the steps above. Your board will be live in the cloud in minutes! ☁️🚀
