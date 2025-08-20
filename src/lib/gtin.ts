// EAN-13 / GTIN-13 check digit validation + normalization
export function normalizeGTIN(raw: string): string | null {
  const s = raw.replace(/[^0-9]/g, '')
  if (s.length === 13 && isValidEAN13(s)) return s
  if (s.length === 12) {
    // allow UPC-A by computing leading 0 for EAN-13
    const ean = '0' + s
    return isValidEAN13(ean) ? ean : null
  }
  if (s.length === 8) return s // accept EAN-8 (not validated here for brevity)
  return null
}

export function isValidEAN13(code: string): boolean {
  if (!/^\d{13}$/.test(code)) return false
  const digits = code.split('').map(d => parseInt(d, 10))
  const check = digits.pop() as number
  const sum = digits.reduce((acc, d, idx) => acc + d * (idx % 2 === 0 ? 1 : 3), 0)
  const cd = (10 - (sum % 10)) % 10
  return cd === check
}
