'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// 플랫폼 시연 발표 — 2026.07.29  (에디토리얼 스타일)
// 원본 자료: "울산 에자자 영상/RMS_플랫폼_발표멘트.docx" (시연 영상 발표 멘트)
// 발표 구성: ① 대시보드 → ② 컨설팅 → ③ 전력거래
// 관통 메시지: "우리 플랫폼은 수용가의 RE100 달성을 도와주는 플랫폼이다."
// 디자인: docs/style-reference.md — 260715_carbon 패턴(페이지 로컬 CSS + 자체 플레이어)
// ─────────────────────────────────────────────────────────────────────────────

const CSS = `
:root{--accent:#2563eb;--accent-soft:#7fa8e8;--ink:#0b1526;--body:#3e4c5e;--muted:#8a94a6;--hair:#e6eaf2;--paper:#fbfcfe;--card:#ffffff;--chip:#f5f7fb;--tint:#eff6ff;--tint-line:#bfdbfe;--navy1:#0a162e;--navy2:#12264d}
.presentation{position:fixed;inset:0;z-index:50;background:#081120;overflow:hidden;font-family:Pretendard,'Noto Sans KR',-apple-system,BlinkMacSystemFont,sans-serif;-webkit-font-smoothing:antialiased}
.presentation *{box-sizing:border-box;margin:0;padding:0}
.slide{opacity:0;pointer-events:none;flex-direction:column;transition:opacity .5s,transform .5s;display:flex;position:absolute;inset:0;transform:translate(48px)}
.slide>*{flex:1}
.slide.active{opacity:1;pointer-events:all;transform:translate(0)}
.slide.prev{opacity:0;transform:translate(-48px)}

/* ── 고정 배경 레이어 — 슬라이드가 넘어가도 블롭은 끊기지 않고 이어진다 ── */
.bg-stage{position:absolute;inset:0;background:radial-gradient(130% 150% at 82% -30%,var(--navy2) 0%,var(--navy1) 55%,#081120 100%);overflow:hidden;pointer-events:none}
.dark-stage{background:transparent;position:relative;overflow:hidden;display:flex;flex-direction:column;justify-content:center;padding:0 7.5%}
.blob{position:absolute;border-radius:50%;pointer-events:none}
.blob.b1{width:36vw;height:36vw;right:-10vw;top:-14vw;background:
  radial-gradient(circle at 30% 26%,rgba(255,255,255,.16) 0%,transparent 32%),
  radial-gradient(circle at 64% 70%,rgba(8,17,32,.32) 0%,transparent 54%),
  radial-gradient(circle at 38% 42%,rgba(127,168,232,.22) 0%,rgba(63,105,190,.14) 46%,transparent 72%)}
.blob.b2{width:28vw;height:28vw;left:-9vw;bottom:-11vw;background:
  radial-gradient(circle at 34% 30%,rgba(255,255,255,.12) 0%,transparent 30%),
  radial-gradient(circle at 68% 72%,rgba(8,17,32,.30) 0%,transparent 55%),
  radial-gradient(circle at 58% 36%,rgba(96,140,220,.20) 0%,rgba(52,90,170,.11) 55%,transparent 76%)}
.blob.b3{width:14vw;height:14vw;right:13vw;bottom:-4vw;background:
  radial-gradient(circle at 30% 26%,rgba(127,168,232,.12) 0%,transparent 36%),
  radial-gradient(circle,rgba(4,10,28,.55) 0%,rgba(4,10,28,.22) 55%,transparent 75%)}
.blob.b4{width:9vw;height:9vw;left:16vw;top:9vw;background:
  radial-gradient(circle at 32% 30%,rgba(255,255,255,.15) 0%,transparent 38%),
  radial-gradient(circle,rgba(127,168,232,.17) 0%,transparent 70%)}
.grain{position:absolute;inset:0;opacity:.05;mix-blend-mode:overlay;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");background-size:180px 180px;pointer-events:none}
.cover-eyebrow{color:var(--accent-soft);letter-spacing:.42em;text-transform:uppercase;font-size:.72vw;font-weight:600;margin-bottom:1.7vw;position:relative;z-index:1}
.cover-title{color:#fff;font-size:3.9vw;font-weight:900;letter-spacing:-.02em;line-height:1.18;margin-bottom:1.2vw;position:relative;z-index:1}
.cover-sub{color:rgba(191,209,238,.85);font-size:1.12vw;font-weight:300;line-height:1.75;margin-bottom:3.2vw;position:relative;z-index:1}
.cover-meta{display:flex;align-items:center;gap:1vw;color:rgba(148,168,200,.85);font-size:.82vw;position:relative;z-index:1}
.cover-meta img{height:1.35vw;filter:brightness(0) invert(1);opacity:.9}
.cover-meta i{width:3px;height:3px;border-radius:50%;background:rgba(148,168,200,.5)}
.thanks-inner{text-align:center;position:relative;z-index:1;align-self:center}
.thanks-inner img{height:2.4vw;filter:brightness(0) invert(1);margin-bottom:2.6vw;opacity:.92}
.thanks-title{color:#fff;font-size:3.1vw;font-weight:800;letter-spacing:-.01em;margin-bottom:1.3vw}
.thanks-tagline{color:var(--accent-soft);font-size:1vw;font-weight:300;line-height:1.8}
.thanks-contact{color:rgba(148,168,200,.6);font-size:.82vw;margin-top:2.8vw;letter-spacing:.08em}

/* ── 목차 (좌 네이비 패널 + 우 에디토리얼 리스트) ── */
.toc{display:flex}
.toc-left{width:35%;background:transparent;position:relative;overflow:hidden;display:flex;flex-direction:column;justify-content:center;padding:0 3.6vw}
.toc-left:before{content:"";position:absolute;left:-10vw;bottom:-14vw;width:30vw;height:30vw;border:1px solid rgba(127,168,232,.15);border-radius:50%}
.toc-eyebrow{color:var(--accent-soft);letter-spacing:.4em;text-transform:uppercase;font-size:.68vw;font-weight:600;margin-bottom:1.1vw}
.toc-title{color:#fff;font-size:2.7vw;font-weight:800;letter-spacing:-.01em;margin-bottom:1.2vw}
.toc-lead{color:rgba(191,209,238,.72);font-size:.92vw;font-weight:300;line-height:1.8}
.toc-right{flex:1;background:var(--paper);display:flex;flex-direction:column;justify-content:center;padding:0 3.6vw}
.trow{display:flex;align-items:center;gap:1.6vw;padding:1.05vw .4vw;border-bottom:1px solid var(--hair);transition:background .2s;cursor:pointer}
.trow:first-child{border-top:1px solid var(--hair)}
.trow:hover{background:#f4f7fd}
.trow-no{color:#c3ccda;font-size:1.45vw;font-weight:300;letter-spacing:.02em;width:2.9vw;flex-shrink:0;transition:color .2s}
.trow:hover .trow-no{color:var(--accent)}
.trow-t{color:var(--ink);font-size:1vw;font-weight:700;margin-bottom:.22vw}
.trow-d{color:var(--muted);font-size:.78vw;line-height:1.5}

/* ── 본문 공통 ── */
.cs{background:var(--paper);display:flex;flex-direction:column}
.cs-body{flex:1;display:flex;flex-direction:column;padding:3% 6.5% 58px}
.cs-head{display:flex;align-items:center;gap:.9vw;margin-bottom:1.1vw}
.cs-no{color:var(--accent);font-size:.78vw;font-weight:800;letter-spacing:.14em}
.cs-sec{color:var(--muted);font-size:.78vw;font-weight:500}
.cs-hair{flex:1;height:1px;background:var(--hair)}
.cs-title{color:var(--ink);font-size:2vw;font-weight:800;letter-spacing:-.025em;line-height:1.28;margin-bottom:.85vw}
.lede{color:var(--body);font-size:.94vw;line-height:1.8;max-width:78%;margin-bottom:1.15vw}
.lede b{color:var(--ink);font-weight:700}
.lede .hl{color:var(--accent);font-weight:700}
.area{flex:1;display:flex;flex-direction:column;gap:1.1vw}

/* ── 스텝 플로우 (점 + 라인) ── */
.flow{display:flex}
.step{flex:1;padding-right:1.2vw;position:relative}
.step-line{display:flex;align-items:center;gap:.55vw;margin-bottom:.55vw}
.step-dot{width:.52vw;height:.52vw;border-radius:50%;border:2px solid var(--accent);background:var(--paper);flex-shrink:0}
.step.final .step-dot{background:var(--accent)}
.step-no{color:var(--accent);font-size:.66vw;font-weight:800;letter-spacing:.1em}
.step-line:after{content:"";flex:1;height:1px;background:var(--hair)}
.step:last-child .step-line:after{display:none}
.step-name{color:var(--ink);font-size:.93vw;font-weight:700;line-height:1.4;margin-bottom:.28vw}
.step.final .step-name{color:var(--accent)}
.step-sub{color:var(--muted);font-size:.78vw;line-height:1.68}

/* ── 블록 (라벨 + 그리드) ── */
.block-label{display:flex;align-items:center;gap:.9vw;margin-bottom:.55vw}
.block-label b{color:var(--ink);font-size:.9vw;font-weight:700;white-space:nowrap}
.block-label:after{content:"";flex:1;height:1px;background:var(--hair)}
.grid-2{display:grid;grid-template-columns:1fr 1fr;gap:.8vw}
.grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:.8vw}
.item{background:var(--card);border:1px solid var(--hair);border-radius:12px;padding:.72vw 1vw}
.item-k{color:var(--ink);font-size:.84vw;font-weight:700;display:flex;align-items:center;gap:.5vw;margin-bottom:.32vw}
.item-k i{width:.4vw;height:.4vw;border-radius:50%;background:var(--accent);flex-shrink:0}
.item-d{color:var(--body);font-size:.77vw;line-height:1.66}

/* ── 피처 카드 ── */
.cards-3{display:grid;grid-template-columns:repeat(3,1fr);gap:1vw}
.fcard{background:var(--card);border:1px solid var(--hair);border-radius:14px;padding:1.05vw 1.25vw;box-shadow:0 1px 2px rgba(11,21,38,.03);display:flex;flex-direction:column}
.fcard.pick{border-color:#93c5fd;box-shadow:0 4px 18px rgba(37,99,235,.08)}
.fcard-title{color:var(--ink);font-size:.98vw;font-weight:700;display:flex;align-items:center;gap:.6vw;margin-bottom:.55vw;flex-wrap:wrap}
.fcard-desc{color:var(--body);font-size:.8vw;line-height:1.78}
.fcard-desc b{color:var(--ink)}
.fcard-ic{width:2.1vw;height:2.1vw;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;background:var(--tint);color:var(--accent);flex-shrink:0}
.fcard-ic .material-symbols-outlined{font-size:1.1vw}
.tag{display:inline-flex;align-items:center;gap:.38vw;border:1px solid var(--hair);border-radius:999px;padding:.15vw .7vw;font-size:.66vw;font-weight:600;color:var(--muted);background:#fff}
.tag i{width:.38vw;height:.38vw;border-radius:50%;display:inline-block}
.tag.blue{color:#1d4ed8}.tag.blue i{background:#2563eb}
.tag.amber{color:#b45309}.tag.amber i{background:#f59e0b}
.tag.gray i{background:#94a3b8}

/* ── 페르소나 스윔레인 ── */
.lane{background:var(--card);border:1px solid var(--hair);border-radius:14px;overflow:hidden}
.lane-row{display:flex;align-items:center;border-bottom:1px solid var(--hair);padding:.62vw 1vw;gap:1vw}
.lane-row:last-child{border-bottom:none}
.lane-row.hero{background:#fffdf5}
.lane-who{width:13.5vw;flex-shrink:0}
.lane-name{color:var(--ink);font-size:.88vw;font-weight:700;display:flex;align-items:center;gap:.5vw;flex-wrap:wrap}
.lane-name i{width:.5vw;height:.5vw;border-radius:50%;flex-shrink:0}
.lane-sub{color:var(--muted);font-size:.72vw;margin:.18vw 0 0 1vw}
.lane-steps{flex:1;display:flex;align-items:center;gap:.5vw;flex-wrap:wrap}
.lstep{background:var(--chip);border-radius:9px;padding:.42vw .8vw}
.lstep b{display:block;color:var(--ink);font-size:.78vw;font-weight:600;white-space:nowrap}
.lstep small{display:block;color:var(--muted);font-size:.66vw;margin-top:.1vw;white-space:nowrap}

/* ── 아이콘 + 키워드 타일 ── */
.press{display:grid;grid-template-columns:repeat(4,1fr);gap:.8vw}
.press-card{background:#fff;border:1px solid var(--hair);border-radius:14px;padding:.9vw .8vw;text-align:center}
.press-ic{width:2.4vw;height:2.4vw;border-radius:50%;margin:0 auto .4vw;display:flex;align-items:center;justify-content:center;background:var(--tint);color:var(--accent)}
.press-ic .material-symbols-outlined{font-size:1.25vw}
.press-k{color:var(--ink);font-size:.98vw;font-weight:800;letter-spacing:-.01em}
.press-d{color:var(--muted);font-size:.73vw;line-height:1.55;margin-top:.35vw}

/* ── 이미지 플레이스홀더 (실제 화면 캡처 넣을 자리) ── */
.imgslot{border:2px dashed #c7d2e3;border-radius:14px;background:var(--chip);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:1.1vw;gap:.35vw}
.imgslot .material-symbols-outlined{font-size:2vw;color:#94a3b8}
.imgslot-t{color:var(--muted);font-size:.78vw;font-weight:700}
.imgslot-d{color:var(--muted);font-size:.71vw;line-height:1.65}

/* ── 마침 문장 ── */
.coda{color:var(--body);font-size:.95vw;line-height:1.8;border-top:1px solid var(--hair);padding-top:1vw}
.coda b{color:var(--accent);font-weight:700}

/* ── 모션 (전부 CSS — 부유 블롭 + 콘텐츠 스태거 등장) ── */
@keyframes drift-a{0%{transform:translate(0,0) scale(1);opacity:.8}50%{opacity:1}100%{transform:translate(7vw,4.5vw) scale(1.25);opacity:.85}}
@keyframes drift-b{0%{transform:translate(0,0) scale(1);opacity:.85}50%{opacity:1}100%{transform:translate(-5.5vw,-4vw) scale(1.22);opacity:.8}}
@keyframes drift-c{0%{transform:translate(0,0) scale(.95);opacity:.8}100%{transform:translate(-4vw,4.5vw) scale(1.18);opacity:1}}
.blob.b1{animation:drift-a 11s ease-in-out infinite alternate}
.blob.b2{animation:drift-b 14s ease-in-out infinite alternate}
.blob.b3{animation:drift-c 12s ease-in-out infinite alternate}
.blob.b4{animation:drift-b 9s ease-in-out infinite alternate}
@keyframes rise{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
.slide.active .cover-eyebrow{animation:rise .65s cubic-bezier(.2,.6,.2,1) both}
.slide.active .cover-title{animation:rise .65s cubic-bezier(.2,.6,.2,1) .12s both}
.slide.active .cover-sub{animation:rise .65s cubic-bezier(.2,.6,.2,1) .24s both}
.slide.active .cover-meta{animation:rise .65s cubic-bezier(.2,.6,.2,1) .36s both}
.slide.active .toc-left>*{animation:rise .6s cubic-bezier(.2,.6,.2,1) both}
.slide.active .toc-left>:nth-child(2){animation-delay:.1s}
.slide.active .toc-left>:nth-child(3){animation-delay:.2s}
.slide.active .trow{animation:rise .5s cubic-bezier(.2,.6,.2,1) both}
.slide.active .trow:nth-child(2){animation-delay:.07s}
.slide.active .trow:nth-child(3){animation-delay:.14s}
.slide.active .trow:nth-child(4){animation-delay:.21s}
.slide.active .trow:nth-child(5){animation-delay:.28s}
.slide.active .cs-head{animation:rise .5s cubic-bezier(.2,.6,.2,1) both}
.slide.active .cs-title{animation:rise .55s cubic-bezier(.2,.6,.2,1) .08s both}
.slide.active .lede{animation:rise .6s cubic-bezier(.2,.6,.2,1) .16s both}
.slide.active .area>*{animation:rise .6s cubic-bezier(.2,.6,.2,1) both}
.slide.active .area>:nth-child(1){animation-delay:.24s}
.slide.active .area>:nth-child(2){animation-delay:.36s}
.slide.active .area>:nth-child(3){animation-delay:.48s}
.slide.active .area>:nth-child(4){animation-delay:.6s}
.slide.active .thanks-inner{animation:rise .8s cubic-bezier(.2,.6,.2,1) both}
/* ※ prefers-reduced-motion 스위치 금지 — OS 설정으로 모든 모션이 죽는 원인(CLAUDE.md §3.4) */

/* ── 플레이어 ── */
.nav{position:fixed;bottom:16px;left:50%;transform:translateX(-50%);z-index:1000;display:flex;align-items:center;gap:8px;background:rgba(10,18,32,.78);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,.08);border-radius:999px;padding:6px 12px}
.nav-btn{width:30px;height:30px;border-radius:999px;background:transparent;color:#dce4f2;border:none;cursor:pointer;font-size:13px;display:flex;align-items:center;justify-content:center;transition:background .2s;font-family:inherit}
.nav-btn:hover{background:rgba(255,255,255,.1)}
.nav-btn:disabled{opacity:.25;cursor:default}
.nav-dots{display:flex;gap:5px;margin:0 4px}
.nav-dot{width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,.22);border:none;cursor:pointer;padding:0;transition:all .2s}
.nav-dot.active{background:var(--accent);transform:scale(1.35)}
.nav-count{color:#aab6cc;font-size:12px;min-width:42px;text-align:center;font-variant-numeric:tabular-nums}
.progress{position:fixed;top:0;left:0;height:2px;background:var(--accent);z-index:1001;transition:width .4s}
.fs-btn{color:#fff;cursor:pointer;z-index:1001;opacity:0;background:rgba(0,0,0,.4);border:none;border-radius:8px;justify-content:center;align-items:center;width:34px;height:34px;font-size:15px;transition:opacity .3s;display:flex;position:fixed;top:12px;right:12px}
.presentation:hover .fs-btn{opacity:.55}
.fs-btn:hover{background:rgba(0,0,0,.65);opacity:1!important}
`

/* ─────────────────────────── 빌딩 블록 ─────────────────────────── */

function ContentSlide({
  no,
  sec,
  title,
  lede,
  children,
}: {
  no: string
  sec: string
  title: string
  lede?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="cs">
      <div className="cs-body">
        <div className="cs-head">
          <span className="cs-no">{no}</span>
          <span className="cs-sec">{sec}</span>
          <span className="cs-hair" />
        </div>
        <h2 className="cs-title">{title}</h2>
        {lede && <p className="lede">{lede}</p>}
        <div className="area">{children}</div>
      </div>
    </div>
  )
}

function Flow({ steps }: { steps: { no: string; name: string; sub: string; final?: boolean }[] }) {
  return (
    <div className="flow">
      {steps.map((s) => (
        <div key={s.no} className={`step${s.final ? ' final' : ''}`}>
          <div className="step-line">
            <span className="step-dot" />
            <span className="step-no">{s.no}</span>
          </div>
          <div className="step-name">{s.name}</div>
          <div className="step-sub">{s.sub}</div>
        </div>
      ))}
    </div>
  )
}

function Block({ label, cols, children }: { label: string; cols: 2 | 3; children: ReactNode }) {
  return (
    <div>
      <div className="block-label"><b>{label}</b></div>
      <div className={`grid-${cols}`}>{children}</div>
    </div>
  )
}

function Item({ k, d }: { k: string; d: string }) {
  return (
    <div className="item">
      <div className="item-k"><i />{k}</div>
      <div className="item-d">{d}</div>
    </div>
  )
}

// 페르소나 행 — 색상 매핑은 CLAUDE.md §4.5 (발전사 emerald · 수용가 amber · 컨설턴트 violet · SPC blue · 관리자 slate)
function PersonaRow({
  color,
  name,
  eng,
  quote,
  chips,
  hero,
}: {
  color: string
  name: string
  eng: string
  quote: string
  chips: { b: string; s?: string }[]
  hero?: boolean
}) {
  return (
    <div className={`lane-row${hero ? ' hero' : ''}`}>
      <div className="lane-who">
        <div className="lane-name">
          <i style={{ background: color }} />
          {name}
          <span style={{ color: 'var(--muted)', fontSize: '.66vw', fontWeight: 500 }}>{eng}</span>
          {hero && <span className="tag amber"><i />오늘 시연의 중심</span>}
        </div>
        <div className="lane-sub">한마디로 — &ldquo;{quote}&rdquo; 화면</div>
      </div>
      <div className="lane-steps">
        {chips.map((c, i) => (
          <div className="lstep" key={i}>
            <b>{c.b}</b>
            {c.s && <small>{c.s}</small>}
          </div>
        ))}
      </div>
    </div>
  )
}

function ImgSlot({ t, d }: { t: string; d: string }) {
  return (
    <div className="imgslot">
      <span className="material-symbols-outlined">add_photo_alternate</span>
      <div className="imgslot-t">{t}</div>
      <div className="imgslot-d">{d}</div>
    </div>
  )
}

/* ─────────────────────────── 슬라이드 ─────────────────────────── */

// target = 각 챕터 첫 슬라이드의 인덱스 (목차 행 클릭 시 이동)
const TOC = [
  { no: '00', t: '오프닝 — 오늘 보실 세 가지', d: '대시보드 · 컨설팅 · 전력거래, 전부 하나의 목적으로 이어진다', target: 2 },
  { no: '01', t: '대시보드', d: '누가 로그인했느냐에 따라, 보이는 화면이 다르다 — 다섯 역할', target: 3 },
  { no: '02', t: '컨설팅', d: '같은 화면을 보며 실시간으로 함께 — 무료 진단에서 7단계까지', target: 4 },
  { no: '03', t: '전력거래', d: '컨설팅 결과를 실제 거래로 — Lease · Off-site 두 케이스 시연', target: 6 },
  { no: '04', t: '마무리 — 그리고 앞으로', d: '다섯 역할, 하나의 목적 — 신뢰할 수 있는 플랫폼으로', target: 7 },
]

// goTo = 플레이어의 슬라이드 이동 함수
const buildSlides = (goTo: (i: number) => void): ReactNode[] => [
  /* 1. 표지 */
  <div className="dark-stage" key="cover">
    <p className="cover-eyebrow">Ulsan Energy Platform Live Demo</p>
    <h1 className="cover-title">수용가의 RE100 달성을<br />도와주는 플랫폼</h1>
    <p className="cover-sub">
      울산 에너지 자급자족 플랫폼 시연 — 대시보드 · 컨설팅 · 전력거래<br />
      세 기능이 하나의 목적으로 이어지는 과정을 보여드립니다
    </p>
    <div className="cover-meta">
      <img src="/images/logo.png" alt="RMS GROUP" />
      <i />
      <span>2026. 07. 29</span>
    </div>
  </div>,

  /* 2. 목차 */
  <div className="toc" key="toc">
    <div className="toc-left">
      <p className="toc-eyebrow">Contents</p>
      <h2 className="toc-title">목차</h2>
      <p className="toc-lead">
        대시보드도, 컨설팅도, 전력거래도 —<br />
        결국 전부 하나로 이어집니다.<br />
        수용가의 RE100 달성.
      </p>
    </div>
    <div className="toc-right">
      {TOC.map((t) => (
        <div className="trow" key={t.no} onClick={() => goTo(t.target)}>
          <span className="trow-no">{t.no}</span>
          <div>
            <div className="trow-t">{t.t}</div>
            <div className="trow-d">{t.d}</div>
          </div>
        </div>
      ))}
    </div>
  </div>,

  /* 3. 00 — 오프닝 */
  <ContentSlide
    key="s-open"
    no="00"
    sec="오프닝"
    title="세 가지를 보여드립니다 — 전부 하나로 이어집니다"
    lede={
      <>오늘 시연은 <b>① 대시보드 → ② 컨설팅 → ③ 전력거래</b> 순서로 진행합니다.
      이 플랫폼이 존재하는 이유는 하나 — <span className="hl">수용가가 RE100을 달성하도록 끝까지 도와드리는 것</span>입니다.</>
    }
  >
    <Flow
      steps={[
        { no: '①', name: '대시보드', sub: '역할별로 필요한 현황만 본다' },
        { no: '②', name: '컨설팅', sub: 'RE100을 "어떻게" 달성할지 방향을 잡는다' },
        { no: '③', name: '전력거래', sub: '정해진 방향을 실제 거래로 실행한다' },
        { no: '목적', name: '수용가의 RE100 달성', sub: '세 기능이 전부 이 하나로 이어진다', final: true },
      ]}
    />

    <Block label="시연 안내 — 오늘은 녹화 영상으로, 이후엔 직접" cols={3}>
      <Item k="녹화 영상 시연" d="플랫폼 화면을 녹화한 영상을 보면서 설명을 진행합니다" />
      <Item k="시연 후 직접 체험" d="시연 이후 회원가입 후, 각 페르소나별로 직접 테스트해 보실 수 있습니다" />
      <Item k="이용 가이드 제공" d="처음 이용하시는 분도 이용 가이드를 따라 쉽게 사용할 수 있습니다" />
    </Block>

    <ImgSlot
      t="제안: 플랫폼 메인(랜딩) 화면 캡처"
      d="시연 사이트 첫 화면 또는 로그인 화면 — 어떤 서비스에 접속하는지 한눈에 보이는 컷"
    />
  </ContentSlide>,

  /* 4. 01 — 대시보드 */
  <ContentSlide
    key="s-dash"
    no="01"
    sec="대시보드"
    title="누가 로그인했느냐에 따라, 보이는 화면이 다르다"
    lede={
      <>역할은 총 <b>다섯</b>. 같은 플랫폼이라도 <span className="hl">역할마다 필요한 것만</span> 화면에 노출됩니다.
      각 역할의 화면을 따로 돌아보지 않고, <b>수용가의 컨설팅을 진행하면서 자연스럽게</b> 보게 됩니다.</>
    }
  >
    <div className="lane">
      <PersonaRow
        color="#f59e0b"
        name="수용가"
        eng="Consumer"
        quote="내 RE100과 내 전기요금"
        hero
        chips={[
          { b: 'RE100 달성률' },
          { b: '이번 달 절감액 · 예상 요금' },
          { b: '한전 대비 실제 PPA 비교' },
        ]}
      />
      <PersonaRow
        color="#8b5cf6"
        name="컨설턴트"
        eng="Consultant"
        quote="내 컨설팅 업무"
        chips={[
          { b: '진행 중 프로젝트 · 담당 고객' },
          { b: '내게 할당된 의뢰' },
          { b: '이번 주 방문 일정' },
          { b: '매출 · 평점' },
        ]}
      />
      <PersonaRow
        color="#10b981"
        name="발전사업자"
        eng="Generator"
        quote="내 발전소"
        chips={[
          { b: '현재 출력' },
          { b: '전일 발전량 · 발전시간' },
          { b: 'CO₂ 저감' },
          { b: 'SMP 시장가' },
        ]}
      />
      <PersonaRow
        color="#2563eb"
        name="SPC"
        eng="전기 공급사업자"
        quote="컨소시엄 · 사업 단위"
        chips={[
          { b: '참여 기업 · 등록 발전소' },
          { b: '누적 거래량' },
          { b: '프로젝트별 진행률' },
          { b: '월별 PPA 거래 추이' },
        ]}
      />
      <PersonaRow
        color="#64748b"
        name="관리자"
        eng="Admin"
        quote="플랫폼 전체 운영"
        chips={[
          { b: '전체 사용자 · 등록 기업' },
          { b: '승인 대기 · PPA 계약' },
          { b: '역할별 사용자 분포' },
          { b: '감사 로그' },
        ]}
      />
    </div>
  </ContentSlide>,

  /* 5. 02 — 컨설팅 시작 */
  <ContentSlide
    key="s-consult1"
    no="02"
    sec="컨설팅"
    title="시작은 수용가의 무료 진단 — 그리고 같은 화면에서 함께"
    lede={
      <>수용가가 기본정보만 기입하면 회사의 현황이 <b>A–F 단계</b>로 진단됩니다.
      그 결과로 컨설턴트를 찾아 <span className="hl">무료 컨설팅</span>이 시작되고,
      컨설팅은 RE100을 <b>&ldquo;어떻게&rdquo;</b> 달성할지 방향을 잡는 단계입니다.</>
    }
  >
    <Flow
      steps={[
        { no: 'STEP 1', name: '무료 진단 설문', sub: '수용가 로그인 후 기본정보 기입' },
        { no: 'STEP 2', name: 'A–F 현황 진단', sub: '현재 회사의 단계를 파악' },
        { no: 'STEP 3', name: '컨설턴트 탐색', sub: '진단 결과를 들고 컨설턴트를 찾는다' },
        { no: 'STEP 4', name: '의뢰 수락 · 거절', sub: '컨설턴트가 의뢰를 확인하고 결정' },
        { no: 'STEP 5', name: '무료 컨설팅 시작', sub: '수락된 의뢰만 7단계로 진행', final: true },
      ]}
    />

    <div className="cards-3">
      <div className="fcard pick">
        <div className="fcard-title">
          <span className="fcard-ic"><span className="material-symbols-outlined">co_present</span></span>
          같은 화면을 보며, 실시간으로
        </div>
        <div className="fcard-desc">
          수용가와 컨설턴트가 <b>같은 화면 위에서</b> 대화하며 컨설팅을 진행합니다.
          따로 메일을 주고받고, 자료를 정리해 보내는 방식이 아닙니다.
        </div>
      </div>
      <div className="fcard">
        <div className="fcard-title">
          <span className="fcard-ic"><span className="material-symbols-outlined">history_edu</span></span>
          모든 대화가 기록으로
        </div>
        <div className="fcard-desc">
          모든 대화가 기록으로 남고, <b>그 자리에서 바로 소통</b>되는 구조입니다.
          진행 이력이 그대로 다음 단계의 근거가 됩니다.
        </div>
      </div>
      <ImgSlot
        t="제안: 컨설팅 실시간 협업 화면 캡처"
        d="수용가·컨설턴트가 같은 화면을 보며 채팅으로 소통하는 장면 — 자료 요청 대화가 보이는 컷"
      />
    </div>
  </ContentSlide>,

  /* 6. 02 — 컨설팅 7단계 */
  <ContentSlide
    key="s-consult2"
    no="02"
    sec="컨설팅"
    title="7단계 — 단계마다 누가 무엇을 할지 정해져 있다"
    lede={
      <>수락된 컨설팅은 <b>7단계</b>로 진행됩니다. 7단계가 끝나면 이 수용가가
      <b> Lease</b>로 갈지, <b>On-site</b>로 갈지, <b>Off-site</b>로 갈지가 <span className="hl">명확해진 상태</span>가 됩니다.</>
    }
  >
    <Flow
      steps={[
        { no: 'STEP 1', name: '설문 · 자료 수집', sub: '한전 자료 등 판단에 필요한 공식 문서를 요청' },
        { no: 'STEP 2', name: '사업장 등록', sub: '기업과 실제 운영 사업장이 다를 수 있어 위치를 등록' },
        { no: 'STEP 3', name: '방문 일정 조율', sub: '등록한 사업장을 대상으로 일정 협의' },
        { no: 'STEP 4', name: '현장 방문 · 실사', sub: '조율된 일정에 맞춰 실사 — 관련 문서 생성' },
      ]}
    />
    <Flow
      steps={[
        { no: 'STEP 5', name: '계약 체결 — 2단계', sub: '① 실사값 기반 계약 → ② 실제로 쓰일 문서를 새로 작성해 양측 합의' },
        { no: 'STEP 6', name: '보고서 작성', sub: '방향 · 전략 · 최종 보고서 — 컨설턴트 혼자가 아니라 수용가와 함께 확인하며' },
        { no: 'STEP 7', name: '평가', sub: '수용가가 컨설턴트에게 평점 — 컨설턴트의 지표로 그대로 반영', final: true },
      ]}
    />

    <p className="coda">
      7단계가 끝나면 거래 방식(<b>Lease · On-site · Off-site</b>)이 확정된 상태 —
      이 결과를 그대로 들고 다음 장, <b>전력거래</b>로 넘어갑니다.
    </p>
  </ContentSlide>,

  /* 7. 03 — 전력거래 */
  <ContentSlide
    key="s-trade"
    no="03"
    sec="전력거래"
    title="컨설팅 결과를, 그대로 실제 거래로"
    lede={
      <>어떤 방식으로 갈지는 <b>이미 컨설팅에서 정해졌습니다</b>.
      오늘은 세 방식 중 <span className="hl">Lease와 Off-site 두 케이스</span>를 직접 보여드립니다.</>
    }
  >
    <div className="cards-3">
      <div className="fcard pick">
        <div className="fcard-title">
          <span className="fcard-ic"><span className="material-symbols-outlined">contract</span></span>
          Lease <span className="tag blue"><i />시연 케이스 ①</span>
        </div>
        <div className="fcard-desc">
          컨설팅에서 나온 조건을 <b>그대로 가져와</b> Lease 계약 형태로 거래를 구성합니다.
        </div>
      </div>
      <div className="fcard">
        <div className="fcard-title">
          <span className="fcard-ic"><span className="material-symbols-outlined">solar_power</span></span>
          On-site <span className="tag gray"><i />컨설팅 결과에 따라</span>
        </div>
        <div className="fcard-desc">
          사업장 안의 발전 자원을 활용하는 방식 — 오늘 시연에서는 다루지 않습니다.
        </div>
      </div>
      <div className="fcard pick">
        <div className="fcard-title">
          <span className="fcard-ic"><span className="material-symbols-outlined">cell_tower</span></span>
          Off-site <span className="tag blue"><i />시연 케이스 ②</span>
        </div>
        <div className="fcard-desc">
          사업장 <b>외부의 발전 자원</b>을 활용하는 Off-site 형태로 거래를 구성합니다.
        </div>
      </div>
    </div>

    <div>
      <div className="block-label"><b>두 케이스 모두 같은 흐름 — 등록부터 대시보드 반영까지</b></div>
      <Flow
        steps={[
          { no: '①', name: '거래 등록', sub: '컨설팅 결과의 방식으로 거래를 등록' },
          { no: '②', name: '조건 확인', sub: '컨설팅에서 나온 조건을 그대로 확인' },
          { no: '③', name: '체결', sub: '양측 합의로 거래 체결' },
          { no: '④', name: '대시보드 반영', sub: '체결 결과가 곧바로 대시보드에 반영', final: true },
        ]}
      />
    </div>

    <ImgSlot
      t="제안: 거래 체결 → 대시보드 반영 화면 캡처 (2컷)"
      d="Lease 거래 체결 화면과, 체결 직후 수용가 대시보드에 수치가 반영된 화면을 나란히"
    />
  </ContentSlide>,

  /* 8. 04 — 마무리 · 앞으로 */
  <ContentSlide
    key="s-close"
    no="04"
    sec="마무리 — 그리고 앞으로"
    title="다섯 역할, 하나의 목적 — 신뢰할 수 있는 플랫폼으로"
    lede={
      <>다섯 역할이 각자 화면에서 필요한 정보를 확인하고, <b>같은 화면에서 실시간으로 소통</b>하며,
      그 결과가 <span className="hl">곧바로 실제 거래로</span> 이어지는 플랫폼을 구성했습니다.</>
    }
  >
    <div className="press">
      <div className="press-card">
        <div className="press-ic"><span className="material-symbols-outlined">monitoring</span></div>
        <div className="press-k">모니터링 · 관리</div>
        <div className="press-d">체결 이후의 거래가 어떻게 모니터링되고 관리되는지까지 플랫폼 안에서</div>
      </div>
      <div className="press-card">
        <div className="press-ic"><span className="material-symbols-outlined">storefront</span></div>
        <div className="press-k">탄소거래 연계</div>
        <div className="press-d">이후 E-Data 마켓을 통한 탄소거래로 확장</div>
      </div>
      <div className="press-card">
        <div className="press-ic"><span className="material-symbols-outlined">engineering</span></div>
        <div className="press-k">운영 인력 절감</div>
        <div className="press-d">사업관리 측면에서 인력 소모를 줄이는 구조</div>
      </div>
      <div className="press-card">
        <div className="press-ic"><span className="material-symbols-outlined">verified</span></div>
        <div className="press-k">성과 보증</div>
        <div className="press-d">앞으로는 RMS가 성과를 직접 보증하는 플랫폼으로</div>
      </div>
    </div>

    <p className="coda">
      이 모든 흐름의 목적은 처음 말씀드린 그 하나 — <b>수용가가 RE100을 달성</b>하도록,
      사용자에게 편의성을 제공하며, <b>신뢰할 수 있는 플랫폼</b>으로 만들어가겠습니다.
    </p>
  </ContentSlide>,

  /* 9. 마무리 */
  <div className="dark-stage" key="thanks">
    <div className="thanks-inner">
      <img src="/images/logo.png" alt="RMS GROUP" />
      <div className="thanks-title">감사합니다</div>
      <div className="thanks-tagline">
        Improving the quality of life and<br />creating a sustainable &amp; resilient society
      </div>
      <div className="thanks-contact">hwbae@rms.co.kr · rmsgroup.co.kr</div>
    </div>
  </div>,
]

/* ─────────────────────────── 플레이어 ─────────────────────────── */

export default function Page() {
  const [idx, setIdx] = useState(0)
  const slides = useMemo(() => buildSlides(setIdx), [])
  const total = slides.length

  const next = useCallback(() => setIdx((i) => Math.min(total - 1, i + 1)), [total])
  const prev = useCallback(() => setIdx((i) => Math.max(0, i - 1)), [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
        case ' ':
        case 'PageDown':
          e.preventDefault(); next(); break
        case 'ArrowLeft':
        case 'PageUp':
          e.preventDefault(); prev(); break
        case 'Home':
          e.preventDefault(); setIdx(0); break
        case 'End':
          e.preventDefault(); setIdx(total - 1); break
        case 'f':
        case 'F':
          e.preventDefault()
          if (!document.fullscreenElement) document.documentElement.requestFullscreen?.()
          else document.exitFullscreen?.()
          break
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next, prev, total])

  return (
    <div className="presentation">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      {/* 고정 배경 — 슬라이드가 넘어가도 블롭은 같은 자리에서 계속 흐른다 */}
      <div className="bg-stage">
        <div className="blob b1" />
        <div className="blob b2" />
        <div className="blob b3" />
        <div className="blob b4" />
        <div className="grain" />
      </div>
      <div className="progress" style={{ width: `${((idx + 1) / total) * 100}%` }} />
      <button
        className="fs-btn"
        aria-label="풀스크린"
        onClick={() => {
          if (!document.fullscreenElement) document.documentElement.requestFullscreen?.()
          else document.exitFullscreen?.()
        }}
      >
        ⛶
      </button>

      {slides.map((s, i) => (
        <div key={i} className={`slide${i === idx ? ' active' : i < idx ? ' prev' : ''}`}>
          {s}
        </div>
      ))}

      <div className="nav">
        <button className="nav-btn" onClick={prev} disabled={idx === 0} aria-label="이전">‹</button>
        <div className="nav-dots">
          {slides.map((_, i) => (
            <button
              key={i}
              className={`nav-dot${i === idx ? ' active' : ''}`}
              aria-label={`슬라이드 ${i + 1}`}
              onClick={() => setIdx(i)}
            />
          ))}
        </div>
        <span className="nav-count">{idx + 1} / {total}</span>
        <button className="nav-btn" onClick={next} disabled={idx === total - 1} aria-label="다음">›</button>
      </div>
    </div>
  )
}
