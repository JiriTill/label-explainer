import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return new Response(JSON.stringify({ error:'OCR not configured (OPENAI_API_KEY missing).' }), { status: 500 })

  const contentType = req.headers.get('content-type') || ''
  let base64: string | null = null

  if (contentType.startsWith('application/json')) {
    const body = await req.json()
    base64 = body.base64 || null
  } else if (contentType.startsWith('multipart/form-data')) {
    const form = await req.formData()
    const file = form.get('file') as File | null
    if (file) {
      const arr = new Uint8Array(await file.arrayBuffer())
      base64 = `data:${file.type};base64,` + Buffer.from(arr).toString('base64')
    }
  }

  if (!base64) return new Response(JSON.stringify({ error:'No image provided' }), { status:400 })

  const prompt = `Extract ONLY the ingredients list from this product label. Return a JSON array of strings in order, splitting nested components. Language: preserve as printed.`

  const body = {
    model: 'gpt-4o-mini',
    messages: [
      { role: 'user', content: [ { type:'input_text', text: prompt }, { type:'input_image', image_url: base64 } ] }
    ],
    temperature: 0.0
  }

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })

  if (!res.ok) {
    const txt = await res.text()
    return new Response(JSON.stringify({ error: 'OpenAI OCR error', details: txt }), { status: 500 })
  }

  const json = await res.json()
  const text = json.choices?.[0]?.message?.content?.trim() || '[]'
  let ingredients: string[] = []
  try { ingredients = JSON.parse(text) } catch { ingredients = [text] }
  return Response.json({ ingredients })
}
