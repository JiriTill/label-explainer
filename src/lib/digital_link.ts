// Minimal GS1 Digital Link parser to extract gtin, lot, exp
export function parseDigitalLink(url: string) {
  try {
    const u = new URL(url)
    const path = u.pathname.split('/')
    const out: any = {}
    for (let i = 0; i < path.length; i++) {
      if (path[i] === 'gtin' && path[i+1]) out.gtin = path[i+1]
      if (path[i] === 'lot' && path[i+1]) out.lot = path[i+1]
      if (path[i] === 'exp' && path[i+1]) out.exp = path[i+1]
    }
    // query params may also include ai=10 etc; skip for now
    return out
  } catch { return {} }
}
