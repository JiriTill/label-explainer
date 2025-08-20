import { IngredientItem, LookupResponse, Product } from './types'
import { kbByENumber, INGREDIENT_KB } from './ingredient_kb'

export function mapOffToInternal(gtin: string, off: any): LookupResponse {
  const p = off?.product || off
  const name = p.product_name || p.generic_name || 'Unknown product'
  const brand = Array.isArray(p.brands_tags) ? p.brands_tags[0]?.toString().toUpperCase() : (p.brands || undefined)
  const category = Array.isArray(p.categories_tags) ? (p.categories_tags[0] || '').replace(/^\w+:/,'') : (p.categories || undefined)
  const image_url = p.image_front_url || p.image_url || undefined

  const nutr = p.nutriments || {}
  const nutrition = {
    sugars_g_per_100: toNum(nutr['sugars_100g']),
    salt_g_per_100: toNum(nutr['salt_100g']),
    satfat_g_per_100: toNum(nutr['saturated-fat_100g']),
    energy_kcal_per_100: toNum(nutr['energy-kcal_100g']),
    caffeine_mg_per_serving: toNum(nutr['caffeine_serving'])
  }

  const ingredients: IngredientItem[] = parseIngredients(p)

  const product: Product = { gtin, name, brand, category, image_url, nutrition, ingredients }
  // OFF helper fields
  ;(product as any).allergens_tags = p.allergens_tags || []
  ;(product as any).ingredients_analysis_tags = p.ingredients_analysis_tags || []

  const verdict = simpleVerdict(product)

  return { gtin, product, ingredients, verdict }
}

function toNum(v: any): number | undefined {
  const n = Number(v)
  return Number.isFinite(n) ? n : undefined
}

function parseIngredients(p: any): IngredientItem[] {
  if (Array.isArray(p.ingredients) && p.ingredients.length) {
    return p.ingredients.map((ing: any, i: number) => {
      const name = ing.text || ing.id || 'ingredient'
      const e = inferENumber(name)
      return decorateIngredient({ display_name: titleize(name), e_number: e || undefined, ordinal: i + 1 })
    })
  }
  const raw = (p.ingredients_text || p.ingredients_text_en || '').trim()
  if (!raw) return []
  return raw.split(/[;,]/).map((t: string, i: number) => {
    const name = t.trim()
    const e = inferENumber(name)
    return decorateIngredient({ display_name: titleize(name), e_number: e || undefined, ordinal: i + 1 })
  })
}

function decorateIngredient(item: any): IngredientItem {
  const kb = kbByENumber(item.e_number)
  if (kb?.origin) item.origin = kb.origin as any
  if (!item.origin) item.origin = inferOrigin(item.e_number, item.display_name) as any
  return item
}

function inferENumber(name: string): string | null {
  const m = name.toUpperCase().match(/\bE\s*([0-9]{3,4}[A-Z]?)\b/)
  return m ? `E${m[1]}`.replace(' ', '') : null
}

function inferOrigin(e: string | null, name: string) {
  if (!e) return { type: 'unknown' }
  const kb = INGREDIENT_KB[e]
  if (kb?.origin) return kb.origin
  return { type: 'unknown' }
}

function titleize(s: string) {
  return s.replace(/(^|\s)([a-z])/g, (m, a, b) => a + b.toUpperCase())
}

function simpleVerdict(product: Product) {
  const v: any = { flags: [] as any[] }
  const sugars = product.nutrition?.sugars_g_per_100
  if (typeof sugars === 'number') {
    v.nutrition = { sugars: { level: sugars > 10 ? 'high' : sugars > 5 ? 'medium' : 'low', per100: sugars } }
    const perServing = Math.round((sugars * 1.25) * 10) / 10 // guess 125g serving for demo
    v.daily_impact = { sugars_pct_of_target: Math.round((perServing / 50) * 100), per_serving_g: perServing }
  }
  const enumbers = (product.ingredients || []).map(i => i.e_number).filter(Boolean)
  if (enumbers.includes('E120')) v.flags.push({ code: 'CARMINE', severity: 'advice', summary: 'Contains carmine (animal-derived red color).', why: 'Not vegan/vegetarian-strict.' })
  if (enumbers.includes('E250')) v.flags.push({ code: 'NITRITE', severity: 'caution', summary: 'Contains sodium nitrite.', why: 'Limit frequency in processed meats.' })
  return v
}
