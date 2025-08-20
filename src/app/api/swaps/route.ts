import { NextRequest } from 'next/server'
import { mapOffToInternal } from '@/lib/normalize'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const gtin = url.searchParams.get('gtin')
  const remove = (url.searchParams.get('remove') || '').split(',').filter(Boolean) // E-numbers to avoid
  if (!gtin) return new Response(JSON.stringify({ error: 'gtin required' }), { status: 400 })

  // 1) Fetch the product to get its category
  const base = process.env.NEXT_PUBLIC_OFF_BASE || 'https://world.openfoodfacts.org'
  const prodRes = await fetch(`${base}/api/v2/product/${gtin}.json`)
  if (!prodRes.ok) return new Response(JSON.stringify({ error:'product not found' }), { status:404 })
  const prod = await prodRes.json()
  if (!prod || prod.status !== 1) return new Response(JSON.stringify({ error:'product not found' }), { status:404 })
  const current = mapOffToInternal(gtin, prod)

  const cat = (current.product.category || '').toLowerCase()
  if (!cat) return new Response(JSON.stringify({ items: [] }), { status: 200 })

  // 2) Search within category (OFF simple search by tag)
  const searchUrl = `${base}/api/v2/search?categories_tags_en=${encodeURIComponent(cat)}&page_size=20`
  const sres = await fetch(searchUrl)
  const sjson = await sres.json().catch(()=>({products:[]}))
  const items = (sjson.products || []).slice(0, 20).map((p:any)=> mapOffToInternal(p.code || p.gtin || p.id || '0', { product: p, status: 1 }))

  // 3) Filter: remove E-numbers present in 'remove', try lower sugar
  const filtered = items.filter((it:any)=> {
    const en = (it.ingredients || []).map((i:any)=>i.e_number).filter(Boolean)
    return remove.every(r=>!en.includes(r)) && it.product.gtin !== gtin
  })

  // 4) Rank by sugar/100 g ascending if same unit
  filtered.sort((a:any,b:any)=> (a.product.nutrition?.sugars_g_per_100 ?? 999) - (b.product.nutrition?.sugars_g_per_100 ?? 999))

  return Response.json({ items: filtered.slice(0,5), category: cat })
}
