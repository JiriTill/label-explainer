export type ExplainInput = {
  ingredient: { title: string, role?: string, origin?: string, kb?: any }
  rules?: { code: string, severity: string, summary: string }[]
}

export async function callLLMExplain(input: ExplainInput): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OPENAI_API_KEY not set')
  const payload = {
    model: 'gpt-4o-mini',
    temperature: 0.2,
    messages: [
      { role: 'system', content: 'You are a careful nutrition explainer. Use only provided facts. Avoid medical claims. Be brief (2–3 sentences). Include a short [source:name] tag if kb.sources exist.' },
      { role: 'user', content: JSON.stringify(input) }
    ]
  }
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })
  if (!res.ok) {
    const txt = await res.text()
    throw new Error('LLM error: ' + txt)
  }
  const json = await res.json()
  const text = json.choices?.[0]?.message?.content?.trim() || ''
  return text
}
