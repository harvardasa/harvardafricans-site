'use client'

// Nine-point picker for object-position. Click any of the 9 dots overlaid on a
// preview of the image — the dot you pick becomes the focal point that stays
// visible when the image is cropped to fit a card. Values map to Tailwind
// `object-{position}` classes so they work directly in the public-side
// LeaderCard.

import { Label } from '@/components/ui/label'

const POSITIONS = [
  ['object-left-top', 'object-top', 'object-right-top'],
  ['object-left', 'object-center', 'object-right'],
  ['object-left-bottom', 'object-bottom', 'object-right-bottom'],
] as const

const POSITION_LABELS: Record<string, string> = {
  'object-left-top': 'Top-left',
  'object-top': 'Top',
  'object-right-top': 'Top-right',
  'object-left': 'Left',
  'object-center': 'Center',
  'object-right': 'Right',
  'object-left-bottom': 'Bottom-left',
  'object-bottom': 'Bottom',
  'object-right-bottom': 'Bottom-right',
}

const POSITION_TO_CSS: Record<string, string> = {
  'object-left-top': 'left top',
  'object-top': 'center top',
  'object-right-top': 'right top',
  'object-left': 'left center',
  'object-center': 'center',
  'object-right': 'right center',
  'object-left-bottom': 'left bottom',
  'object-bottom': 'center bottom',
  'object-right-bottom': 'right bottom',
}

export default function ImagePositionPicker({
  imageUrl,
  value,
  onChange,
}: {
  imageUrl: string
  value: string
  onChange: (positionClass: string) => void
}) {
  if (!imageUrl) return null
  const current = value || 'object-center'

  return (
    <div className="space-y-1.5">
      <Label>Photo crop — pick the part of the photo that should stay visible</Label>
      <div className="flex gap-4 items-start">
        <div className="relative w-40 h-40 rounded-md overflow-hidden border bg-gray-100 shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt="Photo preview"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: POSITION_TO_CSS[current] ?? 'center' }}
          />
          <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
            {POSITIONS.flat().map((pos) => {
              const isActive = pos === current
              return (
                <button
                  key={pos}
                  type="button"
                  onClick={() => onChange(pos)}
                  className="group flex items-center justify-center hover:bg-black/10 transition-colors"
                  aria-label={POSITION_LABELS[pos]}
                >
                  <span
                    className={
                      isActive
                        ? 'w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-white shadow'
                        : 'w-2 h-2 rounded-full bg-white/60 group-hover:bg-white shadow'
                    }
                  />
                </button>
              )
            })}
          </div>
        </div>
        <div className="text-xs text-gray-500 pt-1 space-y-1">
          <p>
            Selected: <strong>{POSITION_LABELS[current]}</strong>
          </p>
          <p>
            Click any of the 9 dots over the photo. That spot will stay visible when the photo
            is cropped to fit a card on the public site.
          </p>
        </div>
      </div>
    </div>
  )
}
