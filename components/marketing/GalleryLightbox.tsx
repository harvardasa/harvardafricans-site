'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import type { GalleryImage } from '@/lib/marketing-types'

// The gallery grid for one album, plus a full-screen viewer.
//
// Previously each photo was an inert div that grew slightly on hover, so a page
// whose entire purpose is photographs had no way to actually look at one.
//
// Swipe is done with pointer events rather than a library: pointer events cover
// touch, pen and mouse in one API, and the whole gesture is a horizontal
// distance test, which is not worth a dependency.
export default function GalleryLightbox({
  images,
  albumName,
}: {
  images: GalleryImage[]
  albumName: string
}) {
  const [openAt, setOpenAt] = useState<number | null>(null)
  const isOpen = openAt !== null

  const close = useCallback(() => setOpenAt(null), [])
  const go = useCallback(
    (delta: number) => {
      setOpenAt((current) => {
        if (current === null) return current
        // Wrap around: at the last photo, forward returns to the first. On a
        // set of event photos people flick through, a dead end feels broken.
        return (current + delta + images.length) % images.length
      })
    },
    [images.length],
  )

  const dialogRef = useRef<HTMLDivElement>(null)
  // The thumbnail that opened the viewer, so focus can go back to it on close
  // rather than to the top of the document.
  const openerRef = useRef<HTMLElement | null>(null)

  // Keyboard, and locking the page behind the viewer so a swipe does not
  // scroll the gallery underneath.
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      else if (e.key === 'ArrowRight') go(1)
      else if (e.key === 'ArrowLeft') go(-1)
      else if (e.key === 'Tab') {
        // aria-modal="true" is a promise to assistive tech that the rest of the
        // page is unreachable; nothing was keeping Tab inside the viewer, so
        // focus walked out into the gallery behind it while the overlay still
        // covered the screen. Cycle within the dialog instead.
        const focusables = dialogRef.current?.querySelectorAll<HTMLElement>('button')
        if (!focusables || focusables.length === 0) return
        const first = focusables[0]
        const last = focusables[focusables.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
      openerRef.current?.focus()
    }
  }, [isOpen, close, go])

  // Horizontal swipe. Tracked on refs rather than state so a drag does not
  // re-render on every pointer move.
  const dragStartX = useRef<number | null>(null)
  const dragStartY = useRef<number | null>(null)

  const onPointerDown = (e: React.PointerEvent) => {
    dragStartX.current = e.clientX
    dragStartY.current = e.clientY
  }

  const onPointerUp = (e: React.PointerEvent) => {
    const startX = dragStartX.current
    const startY = dragStartY.current
    dragStartX.current = null
    dragStartY.current = null
    if (startX === null || startY === null) return

    const dx = e.clientX - startX
    const dy = e.clientY - startY

    // Needs to be a decisive, mostly-horizontal movement. The vertical check
    // stops a scroll-ish drag from flicking to the next photo by accident.
    if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy)) return
    go(dx < 0 ? 1 : -1)
  }

  if (images.length === 0) return null

  const currentIndex = openAt ?? 0

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {images.map((image, i) => (
          <button
            key={image.id}
            type="button"
            onClick={(e) => {
              openerRef.current = e.currentTarget
              setOpenAt(i)
            }}
            aria-label={`View photo ${i + 1} of ${images.length} from ${albumName}`}
            className="group relative aspect-square overflow-hidden rounded-lg border border-white/5 bg-gray-900 focus-visible:ring-2 focus-visible:ring-white/70"
          >
            <Image
              src={image.src}
              alt={albumName}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
            />
          </button>
        ))}
      </div>

      {isOpen && (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={`${albumName}, photo ${currentIndex + 1} of ${images.length}`}
          className="fixed inset-0 z-50 flex flex-col bg-black/95"
        >
          <div className="flex items-center justify-between px-4 py-3 text-white">
            <span className="text-sm tabular-nums text-white/70">
              {currentIndex + 1} of {images.length}
            </span>
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              autoFocus
              className="rounded-lg p-2 text-white/80 transition-colors hover:text-white"
            >
              <X size={24} />
            </button>
          </div>

          {/* The backdrop closes on click, but only when the click lands on the
              backdrop itself and not on the photo bubbling up through it. */}
          <div
            className="relative flex flex-1 items-center justify-center overflow-hidden px-4 pb-6 select-none"
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            onClick={(e) => {
              if (e.target === e.currentTarget) close()
            }}
          >
            <Image
              key={images[currentIndex].id}
              src={images[currentIndex].src}
              alt={`${albumName}, photo ${currentIndex + 1}`}
              fill
              draggable={false}
              className="object-contain p-2"
              sizes="100vw"
              preload
            />

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label="Previous photo"
                  className="absolute left-2 hidden rounded-full bg-black/50 p-3 text-white/80 transition-colors hover:bg-black/70 hover:text-white sm:block"
                >
                  <ChevronLeft size={28} />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label="Next photo"
                  className="absolute right-2 hidden rounded-full bg-black/50 p-3 text-white/80 transition-colors hover:bg-black/70 hover:text-white sm:block"
                >
                  <ChevronRight size={28} />
                </button>
              </>
            )}
          </div>

          {/* Warm the neighbours so a swipe lands on a painted photo rather
              than a blank frame. Hidden, and never announced. */}
          {images.length > 1 && (
            <div className="hidden" aria-hidden="true">
              {[-1, 1].map((d) => {
                const n = (currentIndex + d + images.length) % images.length
                return (
                  <Image key={`preload-${images[n].id}`} src={images[n].src} alt="" width={1} height={1} />
                )
              })}
            </div>
          )}

          {/* white/40 on black is about 3.7:1 — under the 4.5:1 this size of
              text needs, and this is the only place the swipe gesture is
              mentioned. */}
          <p className="pb-4 text-center text-xs text-white/70 sm:hidden">Swipe to move between photos</p>
        </div>
      )}
    </>
  )
}
