// 링크 미리보기(카톡 등)용 덱별 메타 — 제목·설명은 lib/decks.ts 등록값 사용
import type { ReactNode } from 'react'
import { deckMetadata } from '@/lib/decks'

export const metadata = deckMetadata('/ulsan-energy/260715_carbon')

export default function DeckLayout({ children }: { children: ReactNode }) {
  return children
}
