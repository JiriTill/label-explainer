export type KBEntry = {
  canonical_name: string
  e_number?: string
  role?: string
  origin?: {
    type: 'plant' | 'animal' | 'mineral' | 'microbial' | 'synthetic' | 'unknown'
    processing?: string
  }
  plain?: string
  pregnancy?: string
  kids?: string
  diet_flags?: { vegan?: boolean; vegetarian?: boolean }
  sources?: { label: string; url: string }[]
}

export const INGREDIENT_KB: Record<string, KBEntry> = {
  'E100': {
    canonical_name: 'Curcumin',
    e_number: 'E100',
    role: 'Colour',
    origin: { type: 'plant', processing: 'extract' },
    plain: 'Yellow pigment from turmeric, used to colour foods.',
    diet_flags: { vegan: true, vegetarian: true },
    sources: [{ label: 'EU additives', url: 'https://ec.europa.eu/' }]
  },
  'E120': {
    canonical_name: 'Carmine',
    e_number: 'E120',
    role: 'Colour',
    origin: { type: 'animal', processing: 'extract' },
    plain: 'Red colour from cochineal insects.',
    kids: 'Rare sensitivities exist.',
    pregnancy: 'Generally permitted.',
    diet_flags: { vegan: false, vegetarian: false }
  },
  'E129': {
    canonical_name: 'Allura Red AC',
    e_number: 'E129',
    role: 'Colour',
    origin: { type: 'synthetic' },
    plain: 'Synthetic red colour.',
    kids:
      'Some colours may affect activity and attention in children in some cases (label note in EU).',
    diet_flags: { vegan: true, vegetarian: true }
  },
  'E133': {
    canonical_name: 'Brilliant Blue FCF',
    e_number: 'E133',
    role: 'Colour',
    origin: { type: 'synthetic' },
    plain: 'Synthetic blue food colour.',
    diet_flags: { vegan: true, vegetarian: true }
  },
  'E202': {
    canonical_name: 'Potassium sorbate',
    e_number: 'E202',
    role: 'Preservative',
    origin: { type: 'synthetic' },
    plain: 'Helps stop moulds and yeasts.',
    diet_flags: { vegan: true, vegetarian: true }
  },
  'E211': {
    canonical_name: 'Sodium benzoate',
    e_number: 'E211',
    role: 'Preservative',
    origin: { type: 'synthetic' },
    plain: 'Preserves acidic drinks and sauces.'
  },
  'E249': {
    canonical_name: 'Potassium nitrite',
    e_number: 'E249',
    role: 'Preservative',
    origin: { type: 'synthetic' },
    plain: 'Curing salt used in some meats.'
  },
  'E250': {
    canonical_name: 'Sodium nitrite',
    e_number: 'E250',
    role: 'Preservative',
    origin: { type: 'synthetic' },
    plain: 'Curing salt used in some meats.'
  },
  'E251': {
    canonical_name: 'Sodium nitrate',
    e_number: 'E251',
    role: 'Preservative',
    origin: { type: 'synthetic' },
    plain: 'Curing salt and preservative.'
  },
  'E252': {
    canonical_name: 'Potassium nitrate',
    e_number: 'E252',
    role: 'Preservative',
    origin: { type: 'synthetic' },
    plain: 'Curing salt and preservative.'
  },
  'E270': {
    canonical_name: 'Lactic acid',
    e_number: 'E270',
    role: 'Acidity regulator',
    origin: { type: 'microbial', processing: 'fermentation' },
    plain: 'Gives mild acidity; commonly produced by fermentation.'
  },
  'E300': {
    canonical_name: 'Ascorbic acid (Vitamin C)',
    e_number: 'E300',
    role: 'Antioxidant',
    origin: { type: 'synthetic' },
    plain: 'Prevents browning and oxidation; vitamin C.',
    diet_flags: { vegan: true, vegetarian: true }
  },
  'E322': {
    canonical_name: 'Lecithins',
    e_number: 'E322',
    role: 'Emulsifier',
    origin: { type: 'plant', processing: 'extract' },
    plain: 'Often from soy or sunflower; helps blend oil and water.',
    diet_flags: { vegan: true, vegetarian: true }
  },
  'E330': {
    canonical_name: 'Citric acid',
    e_number: 'E330',
    role: 'Acidity regulator',
    origin: { type: 'microbial', processing: 'fermentation' },
    plain: 'Common acidifier; tart taste.',
    diet_flags: { vegan: true, vegetarian: true }
  },
  'E331': {
    canonical_name: 'Sodium citrates',
    e_number: 'E331',
    role: 'Acidity regulator',
    origin: { type: 'synthetic' },
    plain: 'Keeps acidity stable; derived from citric acid.'
  },
  'E407': {
    canonical_name: 'Carrageenan',
    e_number: 'E407',
    role: 'Thickener',
    origin: { type: 'plant', processing: 'extract' },
    plain: 'From red seaweed; provides creamy texture.',
    kids: 'Some people report GI discomfort.',
    diet_flags: { vegan: true, vegetarian: true }
  },
  'E410': {
    canonical_name: 'Locust bean gum',
    e_number: 'E410',
    role: 'Thickener',
    origin: { type: 'plant', processing: 'extract' },
    plain: 'From carob seeds; thickens foods.',
    diet_flags: { vegan: true, vegetarian: true }
  },
  'E412': {
    canonical_name: 'Guar gum',
    e_number: 'E412',
    role: 'Thickener',
    origin: { type: 'plant', processing: 'extract' },
    plain: 'From guar beans; thickens and stabilizes.',
    diet_flags: { vegan: true, vegetarian: true }
  },
  'E415': {
    canonical_name: 'Xanthan gum',
    e_number: 'E415',
    role: 'Thickener',
    origin: { type: 'microbial', processing: 'fermentation' },
    plain: 'Fermentation product that thickens and stabilizes.'
  },
  'E420': {
    canonical_name: 'Sorbitol',
    e_number: 'E420',
    role: 'Sweetener',
    origin: { type: 'synthetic' },
    plain: 'Polyol sweetener; excessive amounts may have a laxative effect.'
  },
  'E422': {
    canonical_name: 'Glycerol',
    e_number: 'E422',
    role: 'Humectant',
    origin: { type: 'synthetic' },
    plain: 'Keeps foods moist; also occurs naturally.'
  },
  'E471': {
    canonical_name: 'Mono- and diglycerides of fatty acids',
    e_number: 'E471',
    role: 'Emulsifier',
    origin: { type: 'synthetic' },
    plain: 'Helps mix oil and water; source can be plant or animal.',
    diet_flags: { vegan: false, vegetarian: true }
  },
  'E472e': {
    canonical_name: 'DATEM',
    e_number: 'E472e',
    role: 'Emulsifier',
    origin: { type: 'synthetic' }
  },
  'E500': {
    canonical_name: 'Sodium carbonates',
    e_number: 'E500',
    role: 'Raising agent',
    origin: { type: 'synthetic' },
    plain: 'Baking soda family; helps dough rise.'
  },
  'E503': {
    canonical_name: 'Ammonium carbonates',
    e_number: 'E503',
    role: 'Raising agent',
    origin: { type: 'synthetic' }
  },
  'E507': {
    canonical_name: 'Hydrochloric acid',
    e_number: 'E507',
    role: 'Acidity regulator',
    origin: { type: 'synthetic' }
  },
  'E620': {
    canonical_name: 'Glutamic acid',
    e_number: 'E620',
    role: 'Flavour enhancer',
    origin: { type: 'synthetic' }
  },
  'E621': {
    canonical_name: 'Monosodium glutamate (MSG)',
    e_number: 'E621',
    role: 'Flavour enhancer',
    origin: { type: 'synthetic' },
    plain: 'Enhances savoury (umami) taste.'
  },
  'E635': {
    canonical_name: "Disodium 5'-ribonucleotides",
    e_number: 'E635',
    role: 'Flavour enhancer',
    origin: { type: 'synthetic' }
  },
  'E951': {
    canonical_name: 'Aspartame',
    e_number: 'E951',
    role: 'Sweetener',
    origin: { type: 'synthetic' },
    plain:
      'High-intensity sweetener; contains phenylalanine (important for people with PKU).'
  },
  'E955': {
    canonical_name: 'Sucralose',
    e_number: 'E955',
    role: 'Sweetener',
    origin: { type: 'synthetic' }
  },
  'E960': {
    canonical_name: 'Steviol glycosides',
    e_number: 'E960',
    role: 'Sweetener',
    origin: { type: 'plant', processing: 'extract' },
    plain: 'Sweet extract from stevia leaves.'
  },
  'E967': {
    canonical_name: 'Xylitol',
    e_number: 'E967',
    role: 'Sweetener',
    origin: { type: 'synthetic' },
    plain: 'Sugar alcohol; excessive amounts may have a laxative effect.'
  },
  'E170': {
    canonical_name: 'Calcium carbonate',
    e_number: 'E170',
    role: 'Acidity regulator',
    origin: { type: 'mineral' }
  },
  'E1400': {
    canonical_name: 'Dextrins',
    e_number: 'E1400',
    role: 'Thickener',
    origin: { type: 'plant', processing: 'modified starch' }
  },
  'E1412': {
    canonical_name: 'Distarch phosphate',
    e_number: 'E1412',
    role: 'Thickener',
    origin: { type: 'plant', processing: 'modified starch' }
  },
  'E1442': {
    canonical_name: 'Hydroxypropyl distarch phosphate',
    e_number: 'E1442',
    role: 'Thickener',
    origin: { type: 'plant', processing: 'modified starch' }
  },
  'E160a': {
    canonical_name: 'Carotenes',
    e_number: 'E160a',
    role: 'Colour',
    origin: { type: 'plant', processing: 'extract' }
  }
}

export function kbByENumber(e: string | undefined) {
  if (!e) return undefined
  return INGREDIENT_KB[e]
}
