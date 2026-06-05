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
  // PPT(슬라이드) 대신 전체화면으로 렌더할 커스텀 React 페이지. 지정 시 slides 무시.
  element?: ReactNode
  slides: ReactNode[] // 한 슬라이드 = 한 ReactNode (JSX)
}
