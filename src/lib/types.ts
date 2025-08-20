export type Nutrition = {
  sugars_g_per_100?: number
  salt_g_per_100?: number
  satfat_g_per_100?: number
  energy_kcal_per_100?: number
  caffeine_mg_per_serving?: number
}

export type IngredientItem = {
  id?: number
  display_name: string
  canonical_name?: string
  e_number?: string
  origin?: { type: Origin, processing?: string }
  ordinal?: number
  percent?: number
}

export type Origin = 'plant'|'animal'|'mineral'|'microbial'|'synthetic'|'unknown'

export type Product = {
  gtin: string
  name?: string
  brand?: string
  category?: string
  image_url?: string
  nutrition?: Nutrition
  ingredients?: IngredientItem[]
}

export type Verdict = {
  nutrition?: any
  allergens?: string[]
  pregnancy?: { status: string, notes?: string[] }
  kids?: { status: string, min_age?: number }
  flags?: { code: string, severity: 'info'|'advice'|'caution'|'avoid', summary: string, why?: string }[]
  daily_impact?: { sugars_pct_of_target?: number, per_serving_g?: number }
}

export type LookupResponse = { gtin: string, product: Product, ingredients: IngredientItem[], verdict: Verdict }
