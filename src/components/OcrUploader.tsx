'use client'
import React, { useState } from 'react'
import type { IngredientItem } from '@/lib/types'

export default function OcrUploader({ onParsed }: { onParsed: (items: IngredientItem[]) => void }) {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setBusy(true); setErr(null)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/ocr', { method: 'POST', body: form })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'OCR failed')
      const arr: string[] = json.ingredients || []
      const items = arr.map((name, i) => ({ display_name: name, ordinal: i+1 }))
      onParsed(items as any)
    } catch (e:any) {
      setErr(e.message || 'Failed')
    } finally { setBusy(false) }
  }

  return (
    <div className="card space-y-2">
      <h2 className="text-lg font-semibold">Scan label instead</h2>
      <input type="file" accept="image/*" onChange={onFile} />
      {busy && <div className="text-sm text-gray-500">Processing…</div>}
      {err && <div className="text-sm text-red-700">{err}</div>}
      <p className="text-xs text-gray-500">Images are sent to the OCR service only if configured.</p>
    </div>
  )
}
