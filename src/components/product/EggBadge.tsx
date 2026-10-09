// Veg/non-veg style mark (green square = eggless, brown = contains egg), familiar to Indian shoppers.
// Pass `decorative` when a visible text label sits next to the mark, so screen readers don't read it twice.
export function EggMark({ eggType, small = false, decorative = false, className = '' }: { eggType: string; small?: boolean; decorative?: boolean; className?: string }) {
  if (eggType === 'NONE') return null
  const eggless = eggType === 'EGGLESS'
  const both = eggType === 'BOTH'
  const title = eggless ? '100% Eggless' : both ? 'Available eggless' : 'Contains egg'
  const color = eggless || both ? 'border-green-600' : 'border-amber-800'
  const dot = eggless || both ? 'bg-green-600' : 'bg-amber-800'
  return (
    <span title={title} {...(decorative ? { 'aria-hidden': true } : { role: 'img', 'aria-label': title })} className={`inline-flex items-center justify-center border-[1.5px] rounded-[3px] bg-white ${small ? 'w-3 h-3' : 'w-4 h-4'} ${color} ${className}`}>
      <span className={`rounded-full ${small ? 'w-1.5 h-1.5' : 'w-2 h-2'} ${dot}`} />
    </span>
  )
}

export function EggPill({ eggType }: { eggType: string }) {
  if (eggType === 'NONE') return null
  const label = eggType === 'EGGLESS' ? 'Eggless' : eggType === 'EGG' ? 'Contains egg' : 'Eggless option'
  const cls = eggType === 'EGG' ? 'bg-amber-50 text-amber-900 border-amber-200' : 'bg-green-50 text-green-800 border-green-200'
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${cls}`}>
      <EggMark eggType={eggType} small decorative />
      {label}
    </span>
  )
}
