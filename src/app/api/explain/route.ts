import { NextRequest } from 'next/server'
import { INGREDIENT_KB, kbByENumber } from '@/lib/ingredient_kb'
import { callLLMExplain } from '@/lib/llm'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(()=>null)
  if (!body || !body.ingredient) return new Response(JSON.stringify({ error:'Bad request' }), { status:400 })
  const ing = body.ingredient
  const kb = kbByENumber(ing.e_number) || undefined

  // Fallback text
  const fallback = simpleFromKB(ing, kb)

  // If no API key or request param says noLLM, return fallback
  if (!process.env.OPENAI_API_KEY || body.noLLM) {
    return Response.json({ text: fallback, source: kb?.sources?.[0]?.label || null })
  }

  try {
    const text = await callLLMExplain({ ingredient: { title: ing.display_name, role: kb?.role, origin: kb?.origin ? `${kb.origin.type}${kb.origin.processing? ' • ' + kb.origin.processing:''}` : undefined, kb }, rules: body.rules || [] })
    return Response.json({ text, source: kb?.sources?.[0]?.label || null })
  } catch (e:any) {
    return Response.json({ text: fallback, source: kb?.sources?.[0]?.label || null, error: e.message })
  }
}

function simpleFromKB(ing: any, kb: any) {
  const parts: string[] = []
  const title = ing.display_name || ing.canonical_name || 'Ingredient'
  if (kb?.plain) parts.push(kb.plain)
  if (kb?.origin) parts.push(`Origin: ${kb.origin.type}${kb.origin.processing? ' • ' + kb.origin.processing:''}.`)
  if (!parts.length) parts.push('Common food ingredient or additive.')
  return parts.join(' ')
}
