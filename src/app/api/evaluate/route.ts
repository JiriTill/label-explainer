import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(()=>null)
  if (!body || !body.product) return new Response(JSON.stringify({ error:'Bad request' }), { status:400 })
  const res = evaluate(body)
  return Response.json(res)
}

function evaluate({ product, ingredients, context }: any) {
  const verdict: any = { flags: [] as any[] }
  const nutr = product?.nutrition || {}
  // sugars bands
  if (typeof nutr.sugars_g_per_100 === 'number') {
    verdict.nutrition = { sugars: { level: nutr.sugars_g_per_100 > 10 ? 'high' : nutr.sugars_g_per_100 > 5 ? 'medium' : 'low', per100: nutr.sugars_g_per_100 } }
    const perServing = Math.round((nutr.sugars_g_per_100 * 1.25) * 10) / 10
    verdict.daily_impact = { sugars_pct_of_target: Math.round((perServing / 50) * 100), per_serving_g: perServing }
  }
  // use OFF fields if provided
  const analysisTags: string[] = product?.ingredients_analysis_tags || []
  const allergensTags: string[] = product?.allergens_tags || []
  const isVegan = analysisTags.includes('en:vegan') || analysisTags.includes('vegan')
  const isVegetarian = analysisTags.includes('en:vegetarian') || analysisTags.includes('vegetarian')

  // Context rules
  const ctx = context || {}
  if (ctx.vegan && !isVegan) {
    // check for known animal-derived additives
    const enums = (ingredients || []).map((i:any)=>i.e_number).filter(Boolean)
    if (enums.includes('E120')) verdict.flags.push({ code:'VEGAN_INCOMPATIBLE', severity:'avoid', summary:'Not suitable for vegans (carmine detected).' })
    const names = (ingredients||[]).map((i:any)=> (i.display_name||'').toLowerCase())
    if (names.some((n:string)=>n.includes('gelatin')||n.includes('gelatine'))) verdict.flags.push({ code:'VEGAN_INCOMPATIBLE', severity:'avoid', summary:'Not suitable for vegans (gelatin detected).' })
  }
  if ((ctx.child_age_months ?? 9999) < 72 && typeof nutr.sugars_g_per_100 === 'number' && nutr.sugars_g_per_100 > 10) {
    verdict.flags.push({ code:'KIDS_SUGAR_HIGH', severity:'advice', summary:'High sugars for young kids; prefer ≤10 g/100 g.' })
  }
  if (ctx.pregnancy && nutr.caffeine_mg_per_serving && nutr.caffeine_mg_per_serving >= 80) {
    verdict.flags.push({ code:'PREGNANCY_CAFFEINE', severity:'caution', summary:'High caffeine per serving; consider limiting in pregnancy.' })
  }
  if (Array.isArray(ctx.allergies) && ctx.allergies.length) {
    const found = ctx.allergies.filter((a:string)=>allergensTags.some(t=>t.includes(a)))
    if (found.length) verdict.flags.push({ code:'ALLERGEN_MATCH', severity:'avoid', summary:`Contains your allergen(s): ${found.join(', ')}` })
  }

  return { verdict }
}
