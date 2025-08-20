'use client'
import React, { useState } from 'react'
import BarcodeScanner from '@/components/BarcodeScanner'
import VerdictSummary from '@/components/VerdictSummary'
import { IngredientChip } from '@/components/IngredientChip'
import { IngredientPopover } from '@/components/IngredientPopover'
import Preferences from '@/components/Preferences'
import OcrUploader from '@/components/OcrUploader'
import SmartSwaps from '@/components/SmartSwaps'
import type { LookupResponse, IngredientItem } from '@/lib/types'
import { evaluateWithContext, type UserContext } from '@/lib/evaluate'
import { kbByENumber } from '@/lib/ingredient_kb'

export default function Page() {
  const [data, setData] = useState<LookupResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [ctx, setCtx] = useState<UserContext>({})
  const [explainCache, setExplainCache] = useState<Record<string,string>>({})

  async function lookup(gtin: string) {
    setError(null)
    setData(null)
    try {
      const res = await fetch(`/api/lookup/${gtin}`)
      if (!res.ok) throw new Error('Not found')
      const json = await res.json()
      // server-side evaluation
      const evalRes = await fetch('/api/evaluate', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ product: json.product, ingredients: json.ingredients, context: ctx }) })
      const { verdict } = await evalRes.json()
      json.verdict = verdict
      setData(json)
    } catch (e: any) {
      setError(e.message || 'Lookup failed')
    }
  }

  function onPrefsChange(newCtx: UserContext) {
    setCtx(newCtx)
    if (data) {
      // re-evaluate
      fetch('/api/evaluate', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ product: data.product, ingredients: data.ingredients, context: newCtx }) })
        .then(r=>r.json())
        .then(({ verdict }) => setData({ ...data, verdict }))
    }
  }

  function onOCR(items: IngredientItem[]) {
    if (!data) return
    const newData = { ...data, ingredients: items }
    setData(newData)
  }

  async function explain(idx: number) {
    const ing = data?.ingredients?.[idx]
    if (!ing) return
    const key = `${data?.product.gtin}-${idx}`
    if (explainCache[key]) return
    const kb = kbByENumber(ing.e_number || '')
    try {
      const res = await fetch('/api/explain', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ ingredient: ing, rules: data?.verdict?.flags || [], noLLM: false }) })
      const json = await res.json()
      const text = json.text || kb?.plain || 'Common food ingredient.'
      setExplainCache(prev => ({ ...prev, [key]: text }))
    } catch {
      setExplainCache(prev => ({ ...prev, [key]: kb?.plain || 'Common food ingredient.' }))
    }
  }

  const title = (item: IngredientItem | null) => item ? `${item.display_name}${item.e_number ? ` (${item.e_number})` : ''}` : ''

  const removeENumbers = (data?.ingredients || []).map(i=>i.e_number).filter((e:any)=>e==='E120' || e==='E250') as string[]

  return (
    <div className="space-y-4">
      <Preferences onChange={onPrefsChange} />
      <BarcodeScanner onDetected={lookup} />
      <OcrUploader onParsed={onOCR} />

      {error && <div className="card text-red-700">{error}</div>}

      {data && (
        <>
          <div className="card flex items-center gap-4">
            {data.product.image_url && <img src={data.product.image_url} alt="" className="w-24 h-24 object-cover rounded-xl"/>}
            <div className="flex-1">
              <div className="text-sm text-gray-500">{data.product.brand}</div>
              <h1 className="text-xl font-semibold">{data.product.name}</h1>
              <div className="text-xs text-gray-500">GTIN: {data.gtin}</div>
            </div>
          </div>

          <VerdictSummary verdict={data.verdict} />

          <div className="card space-y-3">
            <h2 className="text-lg font-semibold">Ingredients</h2>
            <div className="flex flex-wrap gap-2">
              {data.ingredients?.map((i, idx) => (
                <React.Fragment key={`${i.display_name}-${idx}`}>
                  <IngredientChip label={i.display_name} origin={i.origin?.type || 'unknown'} onOpen={() => { setOpenIndex(idx); explain(idx) }} />
                  <IngredientPopover open={openIndex===idx} title={title(i)} onClose={() => setOpenIndex(null)}>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Role:</span> {i.e_number ? (kbByENumber(i.e_number)?.role || 'Food additive') : 'Ingredient'}</div>
                      <div><span className="font-medium">Plain English:</span> {explainCache[`${data.product.gtin}-${idx}`] || (kbByENumber(i.e_number||'')?.plain || (i.e_number ? 'EU-identified additive (E-number).' : 'Common food ingredient.'))}</div>
                      <div><span className="font-medium">Origin:</span> {(i.origin?.type||'unknown').toString().toUpperCase()} {i.origin?.processing ? `• ${i.origin.processing}`:''}</div>
                      <div className="pt-2 border-t text-xs text-gray-600">Why it's here: {kbByENumber(i.e_number||'')?.role ? `${kbByENumber(i.e_number||'')?.role.toLowerCase()} function` : 'improves taste/texture/stability'}.</div>
                    </div>
                  </IngredientPopover>
                </React.Fragment>
              ))}
            </div>
          </div>

          <SmartSwaps gtin={data.product.gtin} removeENumbers={removeENumbers} />
        </>
      )}
    </div>
  )
}
