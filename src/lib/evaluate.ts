import type { LookupResponse } from './types'

export type UserContext = {
  pregnancy?: boolean
  child_age_months?: number
  allergies?: string[] // lowercased simple list: 'milk','soy','gluten','egg','peanut','tree nuts'
  vegan?: boolean
}

export function evaluateWithContext(res: LookupResponse, ctx: UserContext): LookupResponse {
  // deep clone to avoid mutating callers
  const out: any = JSON.parse(JSON.stringify(res))
  out.verdict = out.verdict || { flags: [] }
  out.verdict.flags = out.verdict.flags || []

  const nutr = out.product?.nutrition || {}
  const ings: string[] = (out.ingredients || []).map((i: any) =>
    String(i.display_name || '').toLowerCase()
  )

  // Allergens (naive keyword match; prefer OFF tags when available)
  const allergenMap: Record<string, string[]> = {
    milk: ['milk', 'lactose', 'whey', 'casein'],
    soy: ['soy', 'soya', 'soja'],
    gluten: ['wheat', 'gluten', 'barley', 'rye', 'spelt'],
    egg: ['egg', 'albumen'],
    peanut: ['peanut'],
    'tree nuts': ['almond', 'hazelnut', 'cashew', 'walnut', 'pistachio', 'pecan', 'macadamia', 'brazil']
  }
  const foundAllergens: string[] = []

  for (const a of (ctx.allergies || [])) {
    const keys: string[] = allergenMap[a] || [a]
    if (ings.some((n: string) => keys.some((k: string) => n.includes(k)))) {
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
  if (ctx.pregnancy && typeof nutr.caffeine_mg_per_serving === 'number' && nutr.caffeine_mg_per_serving >= 80) {
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
        summary: 'High sugars for young kids; prefer ≤10 g/100 g.'
      })
    }
  }

  // Vegan note
  if (ctx.vegan) {
    const containsCarmine: boolean = (out.ingredients || []).some(
      (i: any) => i.e_number === 'E120'
    )
    const hasGelatin: boolean = ings.some(
      (n: string) => n.includes('gelatin') || n.includes('gelatine')
    )
    if (containsCarmine || hasGelatin) {
      out.verdict.flags.push({
        code: 'VEGAN_INCOMPATIBLE',
        severity: 'avoid',
        summary: 'Not suitable for vegans (carmine/gelatin detected).'
      })
    }
  }

  return out as LookupResponse
}
