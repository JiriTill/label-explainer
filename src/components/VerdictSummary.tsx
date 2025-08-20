import React from 'react'

export default function VerdictSummary({ verdict }: { verdict: any }) {
  const sugars = verdict?.nutrition?.sugars
  const impact = verdict?.daily_impact
  return (
    <div className="card space-y-2">
      <h2 className="text-lg font-semibold">Summary</h2>
      {sugars && (
        <div className="text-sm">
          <span className="badge">Sugar per 100g: {sugars.per100} g ({sugars.level})</span>
        </div>
      )}
      {impact?.sugars_pct_of_target != null && (
        <div className="text-sm">One serving ≈ {impact.per_serving_g} g free sugars (~{impact.sugars_pct_of_target}% of a 50 g/day target).</div>
      )}
      <div className="flex flex-wrap gap-2 pt-2">
        {(verdict?.flags||[]).map((f:any) => (
          <span key={f.code} className="badge">{f.summary}</span>
        ))}
      </div>
      <p className="text-xs text-gray-500">Informational only. Always check the label and your dietary needs.</p>
    </div>
  )
}
