'use client'
import React, { useEffect, useState } from 'react'
import type { UserContext } from '@/lib/evaluate'

const DEFAULTS: UserContext = { pregnancy: false, child_age_months: undefined, allergies: [], vegan: false }

export default function Preferences({ onChange }: { onChange: (ctx: UserContext) => void }) {
  const [ctx, setCtx] = useState<UserContext>(DEFAULTS)
  const [allergensText, setAllergensText] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('prefs')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setCtx(parsed)
        setAllergensText((parsed.allergies || []).join(', '))
        onChange(parsed)
      } catch {}
    }
  }, [])

  function update(partial: Partial<UserContext>) {
    const next = { ...ctx, ...partial }
    setCtx(next)
    localStorage.setItem('prefs', JSON.stringify(next))
    onChange(next)
  }

  function updateAllergens(text: string) {
    setAllergensText(text)
    const list = text.split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
    update({ allergies: list })
  }

  return (
    <div className="card space-y-2">
      <h2 className="text-lg font-semibold">Preferences</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
        <label className="flex items-center gap-2"><input type="checkbox" checked={!!ctx.pregnancy} onChange={e=>update({ pregnancy: e.target.checked })}/> Pregnancy mode</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={!!ctx.vegan} onChange={e=>update({ vegan: e.target.checked })}/> Vegan</label>
        <label className="flex items-center gap-2">
          <span>Child age (months):</span>
          <input type="number" min={0} className="px-2 py-1 border rounded" value={ctx.child_age_months ?? ''} onChange={e=>update({ child_age_months: e.target.value === '' ? undefined : Number(e.target.value) })} />
        </label>
        <label className="flex items-center gap-2 col-span-full">
          <span>Allergies (comma separated):</span>
          <input className="px-2 py-1 border rounded flex-1" value={allergensText} onChange={e=>updateAllergens(e.target.value)} placeholder="milk, soy, gluten, egg, peanut, tree nuts" />
        </label>
      </div>
    </div>
  )
}
