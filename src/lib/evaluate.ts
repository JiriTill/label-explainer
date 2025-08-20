import type { LookupResponse } from './types'

export type UserContext = {
  pregnancy?: boolean
  child_age_months?: number
  allergies?: string[] // lowercased simple list: 'milk','soy','gluten','egg','peanut','tree nuts'
  vegan?: boolean
}

export function evaluateWithContext(res: LookupResponse, ctx: UserContext): LookupResponse {
  const out: any = JSON.parse(JSON.stringify(res))
  out.verdict = out.verdict || { flags: [] }
  out.verdict.flags = out.verdict.flags || []

  const nutr = out.product?.nutrition || {}
  const ings = (out.ingredients || []).map((i:any) => (i.display_name || '').toLowerCase())

  // Allergens (naive keyword match)
  const allergenMap: Record<string, string[]> = {
    milk: ['milk', 'lactose', 'whey', 'casein'],
    soy: ['soy', 'soya', 'soja'],
    gluten: ['wheat', 'gluten', 'barley', 'rye', 'spelt'],
    egg: ['egg', 'albumen'],
    peanut: ['peanut'],
    'tree nuts': ['almond','hazelnut','cashew','walnut','pistachio','pecan','macadamia','brazil']
  }
  const foundAllergens: string[] = []

  for (const a of (ctx.allergies || [])) {
    const keys = allergenMap[a] || [a]
    if (ings.some(n => keys.some(k => n.includes(k)))) {
      foundAllergens.push(a)
    }
  }

  if (foundAllergens.length) {
    out.verdict.flags.push({
      code: 'ALLERGEN_MATCH',
      severity: 'avoid',
      summary: `Contains your allergen(s): ${foundAllergens.join(', ')}`
    })
  }

  // Pregnancy caffeine guidance (very conservative)
  if (ctx.pregnancy && nutr.caffeine_mg_per_serving && nutr.caffeine_mg_per_serving >= 80) {
    out.verdict.flags.push({
      code: 'PREGNANCY_CAFFEINE',
      severity: 'caution',
      summary: 'High caffeine per serving; consider limiting in pregnancy.'
    })
  }

  // Kids sugar guidance (<6 years)
  if ((ctx.child_age_months ?? 9999) < 72 && typeof nutr.sugars_g_per_100 === 'number') {
    if (nutr.sugars_g_per_100 > 10) {
      out.verdict.flags.push({
        code: 'KIDS_SUGAR_HIGH',
        severity: 'advice',
        summary: 'High sugars for young kids; prefer <=10 g/100 g.'
      })
    }
  }

  // Vegan note
  if (ctx.vegan) {
    const containsCarmine = (out.ingredients || []).some((i:any) => i.e_number === 'E120')
    const gelatin = ings.some((n:string) => n.includes('gelatin') || n.includes('gelatine'))
    if (containsCarmine || gelatin) {
      out.verdict.flags.push({
        code: 'VEGAN_INCOMPATIBLE',
        severity: 'avoid',
        summary: 'Not suitable for vegans (carmine/gelatin detected).'
      })
    }
  }

  return out
}
