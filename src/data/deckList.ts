import type { Deck, DeckMeta } from './types'
import rmsppt260429 from '../decks/rmsppt260429'
import rmsppt260430 from '../decks/rmsppt260430'
import rmsppt260513 from '../decks/rmsppt260513'

// 새 발표 추가하면 import + 이 배열에 추가
export const decks: Deck[] = [rmsppt260513, rmsppt260430, rmsppt260429]

export function getDeckBySlug(slug: string): Deck | undefined {
  return decks.find((d) => d.meta.slug === slug)
}

export function getAllMeta(): DeckMeta[] {
  return decks
    .map((d) => d.meta)
    .sort((a, b) => b.date.localeCompare(a.date)) // 최신 날짜 먼저
}

const monthNamesEn = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

export type GroupedDecks = {
  year: string
  months: {
    month: string // '04'
    monthLabel: string // 'April · 4월'
    decks: DeckMeta[]
  }[]
}[]

/** 발표 메타를 년 → 월 → 일 순으로 그룹화 */
export function getGroupedDecks(): GroupedDecks {
  const all = getAllMeta()
  const yearMap = new Map<string, Map<string, DeckMeta[]>>()

  for (const meta of all) {
    const [year, month] = meta.date.split('-')
    if (!yearMap.has(year)) yearMap.set(year, new Map())
    const monthMap = yearMap.get(year)!
    if (!monthMap.has(month)) monthMap.set(month, [])
    monthMap.get(month)!.push(meta)
  }

  return Array.from(yearMap.entries())
    .sort(([a], [b]) => b.localeCompare(a)) // 년 내림차순
    .map(([year, monthMap]) => ({
      year,
      months: Array.from(monthMap.entries())
        .sort(([a], [b]) => b.localeCompare(a)) // 월 내림차순
        .map(([month, decks]) => ({
          month,
          monthLabel: `${monthNamesEn[parseInt(month, 10) - 1]} · ${parseInt(month, 10)}월`,
          decks: decks.sort((a, b) => b.date.localeCompare(a.date)), // 일 내림차순
        })),
    }))
}
