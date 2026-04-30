import { useCallback, useEffect, useRef, useState } from 'react'
import type { Deck } from '../data/types'

function DeckPlayer({ deck }: { deck: Deck }) {
  const [idx, setIdx] = useState(0)
  const [isFs, setIsFs] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const total = deck.slides.length

  const next = useCallback(
    () => setIdx((i) => Math.min(total - 1, i + 1)),
    [total],
  )
  const prev = useCallback(() => setIdx((i) => Math.max(0, i - 1)), [])

  const goTo = useCallback(
    (i: number) => setIdx(Math.max(0, Math.min(total - 1, i))),
    [total],
  )

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.()
    } else {
      document.exitFullscreen?.()
    }
  }, [])

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return
      }
      switch (e.key) {
        case 'ArrowRight':
        case ' ':
        case 'PageDown':
          e.preventDefault()
          next()
          break
        case 'ArrowLeft':
        case 'PageUp':
          e.preventDefault()
          prev()
          break
        case 'f':
        case 'F':
          e.preventDefault()
          toggleFullscreen()
          break
        case 'Home':
          e.preventDefault()
          setIdx(0)
          break
        case 'End':
          e.preventDefault()
          setIdx(total - 1)
          break
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next, prev, toggleFullscreen, total])

  // Track fullscreen state
  useEffect(() => {
    const onFs = () => setIsFs(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onFs)
    return () => document.removeEventListener('fullscreenchange', onFs)
  }, [])

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-white text-gray-900 overflow-hidden flex flex-col"
    >
      {/* 풀스크린 버튼 — 우상단 고정 */}
      <button
        onClick={toggleFullscreen}
        aria-label="풀스크린"
        className="absolute top-4 right-4 z-20 size-9 rounded-lg bg-white/80 backdrop-blur border border-gray-200 hover:bg-white hover:border-gray-300 flex items-center justify-center transition shadow-sm"
      >
        <span className="material-symbols-outlined text-base">
          {isFs ? 'fullscreen_exit' : 'fullscreen'}
        </span>
      </button>

      {/* Slide content */}
      <main className="flex-1 overflow-y-auto flex flex-col">
        <div
          key={idx}
          className="flex-1 flex animate-[slideIn_300ms_ease-out]"
        >
          {deck.slides[idx]}
        </div>
      </main>

      {/* Bottom controls */}
      <footer className="border-t border-gray-100 px-6 md:px-10 py-4 flex items-center justify-between gap-4">
        <button
          onClick={prev}
          disabled={idx === 0}
          aria-label="이전"
          className="size-10 rounded-full bg-white border border-gray-200 hover:border-brand hover:text-brand transition flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
        >
          <span className="material-symbols-outlined">chevron_left</span>
        </button>

        {/* Indicators */}
        <div className="flex items-center gap-2 flex-1 justify-center max-w-md overflow-x-auto">
          {deck.slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`슬라이드 ${i + 1}`}
              className={`size-2 rounded-full transition-all ${
                i === idx
                  ? 'bg-brand w-6'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
          <span className="text-sm text-gray-400 font-mono ml-3 shrink-0">
            {idx + 1} / {total}
          </span>
        </div>

        <button
          onClick={next}
          disabled={idx === total - 1}
          aria-label="다음"
          className="size-10 rounded-full bg-white border border-gray-200 hover:border-brand hover:text-brand transition flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
        >
          <span className="material-symbols-outlined">chevron_right</span>
        </button>
      </footer>

      {/* Fade-in animation */}
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

export default DeckPlayer
