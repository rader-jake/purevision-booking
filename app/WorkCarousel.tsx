'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'

export interface WorkPhoto {
  src: string
  caption: string
}

const AUTOPLAY_MS = 4800

export default function WorkCarousel({ photos }: { photos: WorkPhoto[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const slideRefs = useRef<(HTMLElement | null)[]>([])
  const interacted = useRef(false)
  const visible = useRef(false)
  const activeRef = useRef(0)
  const [active, setActive] = useState(0)

  const goTo = useCallback((i: number) => {
    const sc = scrollerRef.current
    const slide = slideRefs.current[i]
    if (!sc || !slide) return
    sc.scrollTo({ left: slide.offsetLeft - (sc.clientWidth - slide.offsetWidth) / 2, behavior: 'smooth' })
  }, [])

  // Track which slide is centered
  useEffect(() => {
    const sc = scrollerRef.current
    if (!sc) return
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const mid = sc.scrollLeft + sc.clientWidth / 2
        let best = 0
        let bestDist = Infinity
        slideRefs.current.forEach((el, i) => {
          if (!el) return
          const d = Math.abs(el.offsetLeft + el.offsetWidth / 2 - mid)
          if (d < bestDist) { bestDist = d; best = i }
        })
        activeRef.current = best
        setActive(best)
      })
    }
    sc.addEventListener('scroll', onScroll, { passive: true })
    return () => { sc.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf) }
  }, [])

  // Gentle autoplay: only while on screen, never after the visitor touches it, and not for reduced-motion users
  useEffect(() => {
    const sc = scrollerRef.current
    if (!sc) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const io = new IntersectionObserver(([e]) => { visible.current = e.isIntersecting }, { threshold: 0.6 })
    io.observe(sc)

    const timer = setInterval(() => {
      if (interacted.current || !visible.current || document.hidden) return
      goTo(activeRef.current + 1 >= photos.length ? 0 : activeRef.current + 1)
    }, AUTOPLAY_MS)

    return () => { io.disconnect(); clearInterval(timer) }
  }, [goTo, photos.length])

  const stop = () => { interacted.current = true }

  return (
    <div className="relative" onPointerDown={stop} onWheel={stop} onKeyDown={stop}>
      <div
        ref={scrollerRef}
        className="flex gap-3 overflow-x-auto snap-x snap-mandatory -mx-5 px-[17%] sm:mx-0 sm:px-[calc(50%-130px)] pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        tabIndex={0}
        aria-roledescription="carousel"
        aria-label="Recent work from our shop"
      >
        {photos.map((p, i) => (
          <figure
            key={p.src}
            ref={el => { slideRefs.current[i] = el }}
            className={`shrink-0 snap-center w-[66%] sm:w-[260px] transition-all duration-500 ease-smooth ${
              i === active ? 'opacity-100 scale-100' : 'opacity-45 scale-[0.93]'
            }`}
          >
            <div className="relative aspect-[9/16] rounded-2xl overflow-hidden border border-white/[0.08] bg-white/[0.02]">
              <Image
                src={p.src}
                alt={p.caption}
                fill
                sizes="(max-width: 640px) 66vw, 260px"
                className="object-cover"
              />
            </div>
          </figure>
        ))}
      </div>

      {/* Caption + quiet progress dots */}
      <div className="mt-2 flex flex-col items-center gap-3">
        <p key={active} className="text-sm text-white/45 animate-fade-up h-5">{photos[active]?.caption}</p>
        <div className="flex items-center gap-1.5">
          {photos.map((p, i) => (
            <button
              key={p.src}
              onClick={() => { stop(); goTo(i) }}
              aria-label={`Show ${p.caption}`}
              className={`h-1.5 rounded-full transition-all duration-500 ease-smooth ${
                i === active ? 'w-5 bg-accent' : 'w-1.5 bg-white/20 hover:bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Arrows on larger screens only */}
      <button
        onClick={() => { stop(); goTo(Math.max(0, active - 1)) }}
        aria-label="Previous photo"
        className="hidden md:flex absolute left-0 top-[42%] -translate-y-1/2 h-9 w-9 items-center justify-center rounded-full bg-black/50 border border-white/10 text-white/60 hover:text-white hover:border-accent/40 transition"
      >
        ‹
      </button>
      <button
        onClick={() => { stop(); goTo(Math.min(photos.length - 1, active + 1)) }}
        aria-label="Next photo"
        className="hidden md:flex absolute right-0 top-[42%] -translate-y-1/2 h-9 w-9 items-center justify-center rounded-full bg-black/50 border border-white/10 text-white/60 hover:text-white hover:border-accent/40 transition"
      >
        ›
      </button>
    </div>
  )
}
