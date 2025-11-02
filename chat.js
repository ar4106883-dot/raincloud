// Netlify Function: Board Member Chat API
// Supports: Anthropic, OpenAI, Groq, NVIDIA, Gemini, Together

const BOARD_CONFIG = {
  chairman: {
    name: 'The Chairman',
    systemPrompt: 'You are the Chairman of the board. You make final decisions after hearing from all members. You are decisive, fair, and consider all perspectives.',
    provider: process.env.CHAIRMAN_PROVIDER || 'groq',
    model: process.env.CHAIRMAN_MODEL || 'llama-3.1-70b-versatile'
  },
  ceo: {
    name: 'CEO',
    systemPrompt: 'You are the CEO. You develop strategy, coordinate board members, and focus on long-term vision and execution.',
    provider: process.env.CEO_PROVIDER || 'anthropic',
    model: process.env.CEO_MODEL || 'claude-sonnet-4-20250514'
  },
  cfo: {
    name: 'CFO',
    systemPrompt: 'You are the CFO. You analyze financial implications, manage budgets, assess ROI, and ensure fiscal responsibility.',
    provider: process.env.CFO_PROVIDER || 'groq',
    model: process.env.CFO_MODEL || 'llama-3.1-70b-versatile'
  },
  cto: {
    name: 'CTO',
    systemPrompt: 'You are the CTO. You evaluate technical architecture, assess feasibility, recommend technologies, and ensure scalability.',
    provider: process.env.CTO_PROVIDER || 'groq',
    model: process.env.CTO_MODEL || 'llama-3.1-70b-versatile'
  },
  cpo: {
    name: 'CPO',
    systemPrompt: 'You are the CPO. You focus on user experience, product vision, feature prioritization, and market fit.',
    provider: process.env.CPO_PROVIDER || 'groq',
    model: process.env.CPO_MODEL || 'mixtral-8x7b-32768'
  },
  cmo: {
    name: 'CMO',
    systemPrompt: 'You are the CMO. You develop marketing strategy, brand positioning, customer acquisition, and growth tactics.',
    provider: process.env.CMO_PROVIDER || 'gemini',
    model: process.env.CMO_MODEL || 'gemini-1.5-flash'
  }
}

async function callLLM(provider, model, systemPrompt, userMessage) {
  switch (provider) {
    case 'anthropic':
      return await callAnthropic(model, systemPrompt, userMessage)
    case 'openai':
      return await callOpenAI(model, systemPrompt, userMessage)
    case 'groq':
      return await callGroq(model, systemPrompt, userMessage)
    case 'nvidia':
      return await callNvidia(model, systemPrompt, userMessage)
    case 'gemini':
      return await callGemini(model, systemPrompt, userMessage)
    case 'together':
      return await callTogether(model, systemPrompt, userMessage)
    default:
      throw new Error(`Unknown provider: ${provider}`)
  }
}

async function callAnthropic(model, systemPrompt, userMessage) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model,
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }]
    })
  })
  const data = await response.json()
  return data.content[0].text
}

async function callOpenAI(model, systemPrompt, userMessage) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      max_tokens: 1024
    })
  })
  const data = await response.json()
  return data.choices[0].message.content
}

async function callGroq(model, systemPrompt, userMessage) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      max_tokens: 1024
    })
  })
  const data = await response.json()
  return data.choices[0].message.content
}

async function callNvidia(model, systemPrompt, userMessage) {
  const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.NVIDIA_API_KEY}`
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      max_tokens: 1024
    })
  })
  const data = await response.json()
  return data.choices[0].message.content
}

async function callGemini(model, systemPrompt, userMessage) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GOOGLE_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `${systemPrompt}\n\n${userMessage}` }]
        }],
        generationConfig: {
          maxOutputTokens: 1024,
          temperature: 0.7
        }
      })
    }
  )
  const data = await response.json()
  return data.candidates[0].content.parts[0].text
}

async function callTogether(model, systemPrompt, userMessage) {
  const response = await fetch('https://api.together.xyz/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      max_tokens: 1024
    })
  })
  const data = await response.json()
  return data.choices[0].message.content
}

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  try {
    const { message, targetMember } = JSON.parse(event.body)

    if (!message) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Message is required' })
      }
    }

    if (targetMember === 'all') {
      const responses = await Promise.all(
        Object.entries(BOARD_CONFIG).map(async ([id, config]) => {
          try {
            const content = await callLLM(
              config.provider,
              config.model,
              config.systemPrompt,
              message
            )
            return { member: id, content }
          } catch (error) {
            console.error(`Error from ${id}:`, error)
            return {
              member: id,
              content: `[Error getting response from ${config.name}]`
            }
          }
        })
      )

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ responses })
      }
    } else {
      const config = BOARD_CONFIG[targetMember]
      
      if (!config) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid board member' })
        }
      }

      const content = await callLLM(
        config.provider,
        config.model,
        config.systemPrompt,
        message
      )

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          member: targetMember,
          content
        })
      }
    }
  } catch (error) {
    console.error('Error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message
      })
    }
  }
}
