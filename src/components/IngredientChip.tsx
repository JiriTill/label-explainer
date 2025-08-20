'use client'
import React from 'react'
import type { Origin } from '@/lib/types'

const ICONS: Record<Origin, string> = {
  plant: '🌿',
  animal: '🐄',
  mineral: '🪨',
  microbial: '🧫',
  synthetic: '⚗️',
  unknown: '❓'
}

export function IngredientChip({ label, origin, onOpen }: { label: string; origin: Origin; onOpen: () => void }) {
  const icon = ICONS[origin] ?? ICONS.unknown
  return (
    <button
      className="chip"
      onClick={onOpen}
      aria-haspopup="dialog"
      aria-expanded="true"
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  )
}
