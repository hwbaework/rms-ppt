import type { ReactNode } from 'react'

export type DeckMeta = {
  slug: string        // URL 슬러그 (예: '2026-04-29-demo')
  title: string
  date: string        // 'YYYY-MM-DD'
  description?: string
  tags?: string[]
}

export type Deck = {
  meta: DeckMeta
  slides: ReactNode[] // 한 슬라이드 = 한 ReactNode (JSX)
}
