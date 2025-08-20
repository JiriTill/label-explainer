'use client'
import React, { useEffect, useState } from 'react'

export default function SmartSwaps({ gtin, removeENumbers }: { gtin: string, removeENumbers: string[] }) {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    if (!gtin) return
    setLoading(true); setErr(null)
    const params = new URLSearchParams({ gtin, remove: removeENumbers.join(',') })
    fetch('/api/swaps?' + params.toString())
      .then(r=>r.json())
      .then(json => setItems(json.items || []))
      .catch(e=>setErr(e.message||'failed'))
      .finally(()=>setLoading(false))
  }, [gtin, JSON.stringify(removeENumbers)])

  if (!gtin) return null

  return (
    <div className="card space-y-2">
      <h2 className="text-lg font-semibold">Smart swaps</h2>
      {loading && <div className="text-sm text-gray-500">Searching…</div>}
      {err && <div className="text-sm text-red-700">{err}</div>}
      <ul className="space-y-2">
        {items.map((p:any) => (
          <li key={p.product.gtin} className="flex items-center gap-3">
            {p.product.image_url && <img src={p.product.image_url} alt="" className="w-14 h-14 object-cover rounded-lg" />}
            <div className="flex-1">
              <div className="text-sm font-medium">{p.product.name}</div>
              <div className="text-xs text-gray-500">Sugar/100g: {p.product.nutrition?.sugars_g_per_100 ?? '—'}</div>
            </div>
          </li>
        ))}
        {!loading && items.length===0 && <li className="text-sm text-gray-500">No alternatives found.</li>}
      </ul>
    </div>
  )
}
