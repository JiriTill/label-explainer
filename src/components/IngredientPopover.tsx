'use client'
import React, { useEffect, useRef } from 'react'

export function IngredientPopover({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    function onKey(e: KeyboardEvent){ if(e.key==='Escape') onClose() }
    function onClick(e: MouseEvent){ if(ref.current && !ref.current.contains(e.target as Node)) onClose() }
    if(open){ document.addEventListener('keydown', onKey); document.addEventListener('mousedown', onClick) }
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('mousedown', onClick) }
  }, [open, onClose])
  if(!open) return null
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/30">
      <div ref={ref} role="dialog" aria-modal="true" className="w-[min(560px,92vw)] rounded-2xl bg-white p-4 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} aria-label="Close" className="text-xl leading-none">×</button>
        </div>
        <div className="mt-3">{children}</div>
      </div>
    </div>
  )
}
