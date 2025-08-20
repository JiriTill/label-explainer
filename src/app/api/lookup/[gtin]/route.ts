import { NextRequest } from 'next/server'
import { mapOffToInternal } from '@/lib/normalize'

export async function GET(req: NextRequest, { params }: { params: { gtin: string } }) {
  const gtin = (params.gtin || '').trim()
  if (!/^\d{8,14}$/.test(gtin)) {
    return new Response(JSON.stringify({ error: 'Invalid GTIN' }), { status: 400 })
  }
  const base = process.env.NEXT_PUBLIC_OFF_BASE || 'https://world.openfoodfacts.org'
  const url = `${base}/api/v2/product/${gtin}.json`
  const res = await fetch(url, { next: { revalidate: 60 } })
  if (!res.ok) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 })
  const off = await res.json()
  if (!off || off.status !== 1) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 })
  const normalized = mapOffToInternal(gtin, off)
  return Response.json(normalized)
}
