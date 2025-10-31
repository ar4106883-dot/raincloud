# ☁️ Raincloud

**AI board governance infrastructure - build products on top, not inside**

Raincloud is a vendor-independent platform that provides a 9-member AI board of directors as an API. Deploy it once, build multiple products on top of it.

---

## What is Raincloud?

Raincloud is **infrastructure**, not a product. It provides:

- **9 AI board members** (Chairman, CEO, CFO, CTO, CPO, CMO, 3 Non-Execs)
- **Multi-provider AI** (Anthropic, OpenAI, Hugging Face, Google)
- **REST API** for board consultations
- **Cloud-deployed** (Netlify/Railway/Vercel)
- **Zero vendor lock-in**

Your products sit **on top** of Raincloud, not inside it.

---

## Quick Start

### Deploy to Netlify

1. Push this repo to GitHub
2. Connect to Netlify
3. Set environment variables (ANTHROPIC_API_KEY, etc.)
4. Auto-deploys on every push

### Use the API

```bash
POST https://your-raincloud.netlify.app/api/board-discuss
{
  "query": "Should we raise Series A?",
  "mode": "relevant"
}
```

---

## Board Structure

**Executive:** Chairman, CEO, CFO, CTO, CPO, CMO  
**Non-Executive:** 3 independent directors

All anonymous, role-based, professional.

---

## Why "Raincloud"?

Clouds provide infrastructure. Rain nourishes growth.

**Raincloud provides AI governance infrastructure. Your products grow on top of it.**

---

Deploy Raincloud once. Build unlimited products on top. ☁️
