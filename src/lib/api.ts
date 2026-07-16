// ── 데이터 API 추상화 ──
// 지금은 "서버 있다 가정" 가짜 응답. 나중에 진짜 서버 생기면 fetch() 호출로 한 줄만 갈아끼우면 된다.
// 그래서 폼/모달 등 호출 측은 절대 안 바뀐다 — 그게 추상화의 목적.

import type { DeckMeta } from './decks'

export type NewDeckInput = {
  region: string // 화면 표기 (예: '울산 에너지자급자족')
  regionSlug: string // URL 폴더명 (예: 'ulsan-energy')
  topicSlug: string // URL 폴더명 끝 (예: 'planning')
  title: string
  date: string // 'YYYY-MM-DD'
  description?: string
  tags?: string[]
}

/**
 * 새 발표 생성. 지금은 가짜 — 메모리에서만 살아 있음(새로고침하면 사라짐).
 *
 * 나중에 서버 생기면 본문을 이렇게 바꾸면 끝:
 *   const res = await fetch('/api/decks', { method:'POST', body: JSON.stringify(input) })
 *   return res.json()
 */
export async function createDeck(input: NewDeckInput): Promise<DeckMeta> {
  await new Promise((r) => setTimeout(r, 500)) // 가짜 네트워크 지연 (UX 미리보기용)

  const yymmdd = input.date.slice(2).replace(/-/g, '')
  return {
    region: input.region,
    date: input.date,
    title: input.title,
    href: `/${input.regionSlug}/${yymmdd}_${input.topicSlug}`,
    description: input.description,
    tags: input.tags,
  }
}
