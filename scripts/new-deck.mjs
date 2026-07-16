#!/usr/bin/env node
// ── 새 발표 만들기 CLI ──
// `npm run new` 로 실행.
//   1) 지역·주제·제목·날짜·설명을 물어보고
//   2) src/app/(main)/{regionSlug}/{YYMMDD}_{topicSlug}/page.tsx 를 빈 템플릿으로 생성
//   3) src/lib/decks.ts 의 decks 배열 맨 위에 한 줄 등록
//
// 나중에 서버가 붙으면 같은 입력을 받는 lib/api.ts 의 createDeck() 로 흐름이 합쳐진다.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import readline from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const DECKS_TS = join(ROOT, 'src/lib/decks.ts')
const APP_MAIN = join(ROOT, 'src/app/(main)')

// 기존 지역 옵션 (모달과 동일하게 유지)
const REGION_OPTIONS = [
  { label: '울산 에너지자급자족', slug: 'ulsan-energy' },
  { label: '공통', slug: 'common' },
]

const SLUG_RE = /^[a-z0-9][a-z0-9-]*$/

function todayISO() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

function fail(msg) {
  console.error(`\n❌ ${msg}`)
  process.exit(1)
}

function parseFlags(argv) {
  const out = {}
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a.startsWith('--')) {
      const key = a.slice(2)
      const val = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : 'true'
      out[key] = val
    }
  }
  return out
}

async function main() {
  const flags = parseFlags(process.argv.slice(2))
  // --region <slug> --topic <slug> --title "..." [--date YYYY-MM-DD] [--desc "..."]
  //   [--region-label "표시이름"]  // 새 지역일 때만 필요
  const useFlags = flags.region && flags.topic && flags.title

  let region, regionSlug, topicSlug, title, date, description

  if (useFlags) {
    regionSlug = String(flags.region).toLowerCase()
    const known = REGION_OPTIONS.find((r) => r.slug === regionSlug)
    region = flags['region-label'] ?? known?.label
    if (!region) fail(`알 수 없는 지역. 새 지역이면 --region-label "표시이름" 도 같이 주세요.`)
    topicSlug = String(flags.topic).toLowerCase()
    title = String(flags.title)
    date = flags.date ?? todayISO()
    description = flags.desc ?? ''
  } else {
    const rl = readline.createInterface({ input, output })
    const ask = (q) => rl.question(q)

    console.log('\n── 새 발표 만들기 ──\n')

    // 1. 지역
    console.log('지역:')
    REGION_OPTIONS.forEach((r, i) => console.log(`  ${i + 1}) ${r.label}  (${r.slug})`))
    console.log(`  ${REGION_OPTIONS.length + 1}) 새 지역 추가…`)
    const regionPick = (await ask(`선택 [1-${REGION_OPTIONS.length + 1}]: `)).trim()
    const idx = parseInt(regionPick, 10) - 1

    if (idx >= 0 && idx < REGION_OPTIONS.length) {
      region = REGION_OPTIONS[idx].label
      regionSlug = REGION_OPTIONS[idx].slug
    } else if (idx === REGION_OPTIONS.length) {
      region = (await ask('  새 지역 표시 이름 (예: 인천 에너지자급자족): ')).trim()
      regionSlug = (await ask('  새 지역 폴더명 (영문, 예: incheon-energy): ')).trim().toLowerCase()
      if (!region) { rl.close(); fail('표시 이름이 비었어요.') }
      if (!SLUG_RE.test(regionSlug)) { rl.close(); fail(`폴더명은 영문 소문자/숫자/하이픈만. (입력: ${regionSlug})`) }
    } else {
      rl.close(); fail('잘못된 선택.')
    }

    // 2. 주제·제목·날짜·설명
    topicSlug = (await ask('주제 슬러그 (영문, 예: planning): ')).trim().toLowerCase()
    title = (await ask('표시 제목 (한글 자유): ')).trim()
    const defaultDate = todayISO()
    const dateInput = (await ask(`날짜 [Enter=${defaultDate}]: `)).trim()
    date = dateInput || defaultDate
    description = (await ask('설명 (선택, Enter=생략): ')).trim()
    rl.close()
  }

  // 공통 검증
  if (!SLUG_RE.test(regionSlug)) fail(`지역 폴더명은 영문 소문자/숫자/하이픈만. (입력: ${regionSlug})`)
  if (!SLUG_RE.test(topicSlug)) fail(`주제 슬러그는 영문 소문자/숫자/하이픈만. (입력: ${topicSlug})`)
  if (!title) fail('제목이 비었어요.')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) fail(`날짜는 YYYY-MM-DD 형식. (입력: ${date})`)

  // 3. 경로 계산
  const yymmdd = date.slice(2).replace(/-/g, '')
  const folderName = `${yymmdd}_${topicSlug}`
  const folderAbs = join(APP_MAIN, regionSlug, folderName)
  const fileAbs = join(folderAbs, 'page.tsx')
  const href = `/${regionSlug}/${folderName}`

  if (existsSync(fileAbs)) fail(`이미 있어요: ${fileAbs.replace(ROOT, '.')}`)

  // 4. page.tsx 생성 (빈 슬라이드 템플릿)
  const dateDot = date.replace(/-/g, '.')
  const pageSrc = `'use client'

// ${title}
// 생성: ${date} · CLI(npm run new)

import DeckPlayer from '@/components/Deck'
import CoverSlide from '@/components/slides/CoverSlide'
import TocSlide from '@/components/slides/TocSlide'
import SectionSlide from '@/components/slides/SectionSlide'
import ThankYouSlide from '@/components/slides/ThankYouSlide'

const TOC = ['항목 1', '항목 2', '항목 3', '마무리']

const slides = [
  /* 1. 표지 */
  <CoverSlide
    title="${title}"
    subtitle="${description || '[부제목 또는 핵심 태그라인]'}"
    author="배효원"
    date="${dateDot}"
  />,

  /* 2. 목차 */
  <TocSlide items={TOC} pageNumber={2} />,

  /* 3. 섹션 구분 */
  <SectionSlide
    number="01"
    title="섹션 제목"
    description="이 섹션의 핵심 메시지를 한 줄로"
    progress="01 / 03"
    pageNumber={3}
  />,

  /* 4. 본문 */
  <div className="relative w-full min-h-full px-12 md:px-20 py-16">
    <p className="text-base text-slate-500 mb-2">I. 섹션</p>
    <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-8">본문 슬라이드</h2>
    <div className="rounded-2xl border border-blue-100 bg-blue-50 px-6 py-5 text-lg text-slate-700 max-w-3xl">
      <strong className="text-brand">강조 박스</strong> — 핵심 메시지를 강조할 때 사용하세요.
    </div>
    <p className="absolute bottom-3 right-6 text-sm text-slate-400 font-medium">4</p>
  </div>,

  /* 5. 마무리 */
  <ThankYouSlide email="hwbae@rms.co.kr" pageNumber={5} />,
]

export default function Page() {
  return <DeckPlayer slides={slides} />
}
`

  mkdirSync(folderAbs, { recursive: true })
  writeFileSync(fileAbs, pageSrc, 'utf8')

  // 5. lib/decks.ts 등록부 맨 위에 한 줄 삽입
  const decksSrc = readFileSync(DECKS_TS, 'utf8')
  const marker = 'export const decks: DeckMeta[] = ['
  const at = decksSrc.indexOf(marker)
  if (at < 0) fail(`등록 실패: ${DECKS_TS.replace(ROOT, '.')} 에서 "${marker}" 를 못 찾았어요.`)
  const insertAt = at + marker.length

  const entry = `
  {
    region: '${region.replace(/'/g, "\\'")}',
    date: '${date}',
    title: '${title.replace(/'/g, "\\'")}',
    href: '${href}',${description ? `\n    description: '${description.replace(/'/g, "\\'")}',` : ''}
  },`

  const nextSrc = decksSrc.slice(0, insertAt) + entry + decksSrc.slice(insertAt)
  writeFileSync(DECKS_TS, nextSrc, 'utf8')

  // 6. 결과
  console.log('\n✓ 발표 폴더 생성:')
  console.log(`   ${fileAbs.replace(ROOT, '.')}`)
  console.log('✓ 홈 등록부에 한 줄 추가:')
  console.log(`   src/lib/decks.ts → ${href}`)
  console.log('\n다음:')
  console.log(`   1) 위 page.tsx 열어서 슬라이드 내용 채우기`)
  console.log(`   2) npm run dev → http://localhost:3000${href}/ 에서 확인`)
  console.log('')
}

main().catch((e) => {
  console.error('\n❌ 오류:', e?.message ?? e)
  process.exit(1)
})
