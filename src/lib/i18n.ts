export type Dict = Record<string, string>
const en: Dict = {
  'summary.title': 'Summary',
  'ingredients.title': 'Ingredients',
  'pop.role': 'Role',
  'pop.plain': 'Plain English',
  'pop.origin': 'Origin',
  'pop.why': "Why it's here"
}
export function t(key: string, fallback?: string) {
  return (en as any)[key] || fallback || key
}
