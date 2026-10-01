'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import PptExportButton from '@/components/PptExport'
import type { ReactNode } from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// 빈 템플릿 — 새 발표 시작용 (에디토리얼 표준 · 2026-07-16 확정)
//
//   이 파일을 통째로 복사해 새 발표 폴더(src/app/(main)/{지역}/{YYMMDD_주제}/page.tsx)에
//   붙여넣고, 아래 [채울 자리]만 실제 내용으로 바꾸면 된다.
//
//   설계 방향(= 기준 덱 260715_carbon 과 동일한 문법):
//   · 페이지 로컬 CSS + 자체 플레이어 — 모든 크기 vw(창 크기 무관 비율 고정)
//   · 표지·마무리 = 딥네이비 + 소프트 블롭(고정 배경 레이어라 장 넘겨도 이어짐) + 필름 그레인
//   · 목차 = 좌 네이비 패널 + 우 헤어라인 리스트, 행 클릭 시 해당 챕터로 이동
//   · 본문 = 챕터 칩 + 주장형 한 줄 제목 + 박스 없는 리드문 + 헤어라인/흰 카드/컬러 도트
//   · 표현은 글 대신 도식으로: KPI 스탯 · 점-라인 스텝 · 스윔레인 · 아이콘 타일 · 카드 · 이미지 슬롯
//   · 간지(SectionSlide) 없음 — 섹션 구분은 본문 상단 챕터 라벨로만
//
//   상세 규칙: CLAUDE.md §3.4 · docs/style-reference.md
// ─────────────────────────────────────────────────────────────────────────────

const CSS = `
:root{--accent:#2563eb;--accent-soft:#7fa8e8;--ink:#0b1526;--body:#3e4c5e;--muted:#8a94a6;--hair:#e6eaf2;--paper:#fbfcfe;--card:#ffffff;--chip:#f5f7fb;--tint:#eff6ff;--tint-line:#bfdbfe;--amber:#b45309;--green:#047857;--navy1:#0a162e;--navy2:#12264d}
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

/* ── 표지 ── */
.cover-eyebrow{color:var(--accent-soft);letter-spacing:.42em;text-transform:uppercase;font-size:.72vw;font-weight:600;margin-bottom:1.7vw;position:relative;z-index:1}
.cover-title{color:#fff;font-size:3.9vw;font-weight:900;letter-spacing:-.02em;line-height:1.18;margin-bottom:1.2vw;position:relative;z-index:1}
.cover-sub{color:rgba(191,209,238,.85);font-size:1.12vw;font-weight:300;line-height:1.75;margin-bottom:3.2vw;position:relative;z-index:1}
.cover-meta{display:flex;align-items:center;gap:1vw;color:rgba(148,168,200,.85);font-size:.82vw;position:relative;z-index:1}
.cover-meta img{height:1.35vw;filter:brightness(0) invert(1);opacity:.9}
.cover-meta i{width:3px;height:3px;border-radius:50%;background:rgba(148,168,200,.5)}

/* ── 마무리 ── */
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

/* ── KPI 스탯 (하이라인 사이 큰 숫자) ── */
.stats{display:flex;border-top:1px solid var(--hair);border-bottom:1px solid var(--hair)}
.stat{flex:1;padding:1.05vw 1.2vw}
.stat+.stat{border-left:1px solid var(--hair)}
.stat-num{color:var(--ink);font-size:1.75vw;font-weight:800;letter-spacing:-.02em;line-height:1.15}
.stat.acc .stat-num{color:var(--accent)}
.stat-label{color:var(--muted);font-size:.74vw;line-height:1.5;margin-top:.35vw}

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
.grid-4{display:grid;grid-template-columns:repeat(4,1fr);gap:.8vw}
.item{background:var(--card);border:1px solid var(--hair);border-radius:12px;padding:.72vw 1vw}
.item-k{color:var(--ink);font-size:.84vw;font-weight:700;display:flex;align-items:center;gap:.5vw;margin-bottom:.32vw}
.item-k i{width:.4vw;height:.4vw;border-radius:50%;background:var(--accent);flex-shrink:0}
.item.amber .item-k i{background:#f59e0b}
.item.green .item-k i{background:#10b981}
.item-d{color:var(--body);font-size:.77vw;line-height:1.66}

/* ── 피처 카드 (아이콘 + 제목 + 설명) ── */
.cards-2{display:grid;grid-template-columns:1fr 1fr;gap:1vw}
.cards-3{display:grid;grid-template-columns:repeat(3,1fr);gap:1vw}
.fcard{background:var(--card);border:1px solid var(--hair);border-radius:14px;padding:1.05vw 1.25vw;box-shadow:0 1px 2px rgba(11,21,38,.03)}
.fcard-title{color:var(--ink);font-size:.98vw;font-weight:700;display:flex;align-items:center;gap:.6vw;margin-bottom:.55vw;flex-wrap:wrap}
.fcard-desc{color:var(--body);font-size:.8vw;line-height:1.78}
.fcard-desc b{color:var(--ink)}
.fcard-ic{width:2.1vw;height:2.1vw;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;background:var(--tint);color:var(--accent);flex-shrink:0}
.fcard-ic .material-symbols-outlined{font-size:1.1vw}
.tag{display:inline-flex;align-items:center;gap:.38vw;border:1px solid var(--hair);border-radius:999px;padding:.15vw .7vw;font-size:.66vw;font-weight:600;color:var(--muted);background:#fff}
.tag i{width:.38vw;height:.38vw;border-radius:50%;display:inline-block}
.tag.blue{color:#1d4ed8}.tag.blue i{background:#2563eb}
.tag.green{color:var(--green)}.tag.green i{background:#10b981}
.tag.amber{color:var(--amber)}.tag.amber i{background:#f59e0b}
.tag.gray i{background:#94a3b8}

/* ── 스윔레인 (참여자별 프로세스) ── */
.lane{background:var(--card);border:1px solid var(--hair);border-radius:14px;overflow:hidden}
.lane-row{display:flex;align-items:center;border-bottom:1px solid var(--hair);padding:.6vw 1vw;gap:1vw}
.lane-row:last-child{border-bottom:none}
.lane-who{width:10.5vw;flex-shrink:0}
.lane-name{color:var(--ink);font-size:.85vw;font-weight:700;display:flex;align-items:center;gap:.5vw}
.lane-name i{width:.5vw;height:.5vw;border-radius:50%;flex-shrink:0}
.lane-sub{color:var(--muted);font-size:.66vw;margin:.15vw 0 0 1vw}
.lane-steps{flex:1;display:flex;align-items:center;gap:.5vw;flex-wrap:wrap}
.lstep{background:var(--chip);border-radius:9px;padding:.42vw .8vw}
.lstep b{display:block;color:var(--ink);font-size:.79vw;font-weight:600;white-space:nowrap}
.lstep small{display:block;color:var(--muted);font-size:.66vw;margin-top:.1vw;white-space:nowrap}
.lane-arr{color:#c3ccda;font-size:.85vw;flex-shrink:0}

/* ── 이미지 플레이스홀더 (실제 사진·캡처 넣을 자리) ── */
.imgslot{border:2px dashed #c7d2e3;border-radius:14px;background:var(--chip);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:1.1vw;gap:.35vw}
.imgslot .material-symbols-outlined{font-size:2vw;color:#94a3b8}
.imgslot-t{color:var(--muted);font-size:.78vw;font-weight:700}
.imgslot-d{color:var(--muted);font-size:.71vw;line-height:1.65}

/* ── 근거 링크 라인 · 마침 문장 ── */
.srcline{color:var(--muted);font-size:.7vw;margin-top:.7vw;line-height:1.6}
.srcline a{color:var(--accent);text-decoration:underline;text-underline-offset:2px}
.coda{color:var(--body);font-size:.95vw;line-height:1.8;border-top:1px solid var(--hair);padding-top:1vw}
.coda b{color:var(--accent);font-weight:700}

/* ── 모션 (전부 CSS — 부유하는 블롭 + 콘텐츠 스태거 등장) ── */
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
.slide.active .thanks-inner{animation:rise .8s cubic-bezier(.2,.6,.2,1) both}

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

/* ─────────────────────────── 빌딩 블록 ───────────────────────────
   본문은 아래 조각들을 조합해 만든다. 텍스트를 나열하지 말고 도식으로.
   (KPI=Stats · 흐름=Flow · 표 형태 항목=Block+Item · 카드=Fcard ·
    참여자 프로세스=LaneRow · 사진 자리=ImgSlot)
   ------------------------------------------------------------------ */

function ContentSlide({
  no,
  sec,
  title,
  lede,
  children,
}: {
  no: string // 챕터 번호 '01'
  sec: string // 챕터 이름 (목차와 일치)
  title: string // 주장형 한 줄 제목
  lede?: ReactNode // 리드문 2문장 (박스 없이)
  children: ReactNode // 도식 영역 (.area) — 2~3 블록 권장
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

function Stats({ items }: { items: { num: string; label: string; acc?: boolean }[] }) {
  return (
    <div className="stats">
      {items.map((s, i) => (
        <div className={`stat${s.acc ? ' acc' : ''}`} key={i}>
          <div className="stat-num">{s.num}</div>
          <div className="stat-label">{s.label}</div>
        </div>
      ))}
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

function Block({ label, cols, children }: { label: string; cols: 2 | 3 | 4; children: ReactNode }) {
  return (
    <div>
      <div className="block-label"><b>{label}</b></div>
      <div className={`grid-${cols}`}>{children}</div>
    </div>
  )
}

function Item({ k, d, tone }: { k: string; d: string; tone?: 'amber' | 'green' }) {
  return (
    <div className={`item${tone ? ` ${tone}` : ''}`}>
      <div className="item-k"><i />{k}</div>
      <div className="item-d">{d}</div>
    </div>
  )
}

function Fcard({ icon, title, children }: { icon: string; title: ReactNode; children: ReactNode }) {
  return (
    <div className="fcard">
      <div className="fcard-title">
        <span className="fcard-ic"><span className="material-symbols-outlined">{icon}</span></span>
        {title}
      </div>
      <div className="fcard-desc">{children}</div>
    </div>
  )
}

function LaneRow({
  color,
  name,
  sub,
  steps,
}: {
  color: string
  name: string
  sub: string
  steps: { b: string; s?: string }[]
}) {
  return (
    <div className="lane-row">
      <div className="lane-who">
        <div className="lane-name"><i style={{ background: color }} />{name}</div>
        <div className="lane-sub">{sub}</div>
      </div>
      <div className="lane-steps">
        {steps.map((st, i) => (
          <span key={i} style={{ display: 'contents' }}>
            <div className="lstep">
              <b>{st.b}</b>
              {st.s && <small>{st.s}</small>}
            </div>
            {i < steps.length - 1 && <span className="lane-arr">→</span>}
          </span>
        ))}
      </div>
    </div>
  )
}

function ImgSlot({ suggestion }: { suggestion: string }) {
  return (
    <div className="imgslot">
      <span className="material-symbols-outlined">add_photo_alternate</span>
      <div className="imgslot-t">이미지 넣을 자리</div>
      <div className="imgslot-d">제안: {suggestion}</div>
    </div>
  )
}

/* ─────────────────────────── 슬라이드 ─────────────────────────── */

// target = 각 챕터 첫 슬라이드의 인덱스 (목차에서 클릭 시 이동)
const TOC = [
  { no: '01', t: '[챕터 1 제목]', d: '[한 줄 설명 — 이 챕터에서 무엇을 다루나]', target: 2 },
  { no: '02', t: '[챕터 2 제목]', d: '[한 줄 설명]', target: 3 },
  { no: '03', t: '[챕터 3 제목]', d: '[한 줄 설명]', target: 4 },
]

// goTo = 플레이어의 슬라이드 이동 함수 — 목차 행 클릭 시 해당 챕터로 점프
const buildSlides = (goTo: (i: number) => void): ReactNode[] => [
  /* 1. 표지 — 배경 블롭은 고정 레이어(bg-stage)에 있음 */
  <div className="dark-stage" key="cover">
    <p className="cover-eyebrow">[EYEBROW · 영문 소제목]</p>
    <h1 className="cover-title">[프레젠테이션 제목]</h1>
    <p className="cover-sub">
      [부제 첫 줄 — 이 발표가 무엇을 설명하는지]<br />
      [부제 둘째 줄]
    </p>
    <div className="cover-meta">
      <img src="/images/logo.png" alt="RMS GROUP" />
      <i />
      <span>배효원 · RMS팀</span>
      <i />
      <span>[YYYY. MM. DD]</span>
    </div>
  </div>,

  /* 2. 목차 — 행 클릭 시 해당 챕터로 이동 */
  <div className="toc" key="toc">
    <div className="toc-left">
      <p className="toc-eyebrow">Contents</p>
      <h2 className="toc-title">목차</h2>
      <p className="toc-lead">
        [발표를 한 문장으로 요약하는 리드문 —<br />
        왜 이 순서로 읽어야 하는지]
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

  /* 3. 본문 예시 A — 스텝 플로우 + KPI 스탯 */
  <ContentSlide
    key="s1"
    no="01"
    sec="[챕터 1 제목]"
    title="[주장형 한 줄 제목 — 이 장이 말하는 결론]"
    lede={
      <>[리드문 첫 문장 — <b>핵심 개념</b>을 정의한다.]
      [둘째 문장 — <span className="hl">그래서 무엇이 중요한지</span> 짚는다.]</>
    }
  >
    <Flow
      steps={[
        { no: 'STEP 1', name: '[단계 이름]', sub: '[한 줄 설명]' },
        { no: 'STEP 2', name: '[단계 이름]', sub: '[한 줄 설명]' },
        { no: 'STEP 3', name: '[단계 이름]', sub: '[한 줄 설명]', final: true },
      ]}
    />

    <Stats
      items={[
        { num: '[숫자]', label: '[지표 이름]' },
        { num: '[숫자]', label: '[지표 이름]', acc: true },
        { num: '[숫자]', label: '[지표 이름]' },
        { num: '[숫자]', label: '[지표 이름]' },
      ]}
    />

    <p className="srcline">
      근거 — <a href="#" target="_blank" rel="noreferrer">[출처·법령 링크]</a> (원문 확인 후 링크 병기)
    </p>
  </ContentSlide>,

  /* 4. 본문 예시 B — 라벨 블록 + 항목 그리드 + 피처 카드 */
  <ContentSlide
    key="s2"
    no="02"
    sec="[챕터 2 제목]"
    title="[주장형 한 줄 제목]"
    lede={<>[리드문 — 이 장에서 정리할 항목들을 한 문장으로 예고한다.]</>}
  >
    <Block label="[블록 라벨 — 이 그리드가 무엇을 나열하나]" cols={3}>
      <Item k="[항목 제목]" d="[한 줄 설명]" />
      <Item k="[항목 제목]" d="[한 줄 설명]" tone="green" />
      <Item k="[항목 제목]" d="[한 줄 설명]" tone="amber" />
    </Block>

    <div className="cards-2">
      <Fcard icon="lightbulb" title={<>[카드 제목] <span className="tag blue"><i />[태그]</span></>}>
        [카드 설명 — <b>강조어</b>는 굵게. 두세 줄 이내.]
      </Fcard>
      <Fcard icon="target" title="[카드 제목]">
        [카드 설명.]
      </Fcard>
    </div>
  </ContentSlide>,

  /* 5. 본문 예시 C — 스윔레인 + 이미지 슬롯 */
  <ContentSlide
    key="s3"
    no="03"
    sec="[챕터 3 제목]"
    title="[주장형 한 줄 제목]"
    lede={<>[리드문 — 참여자별로 프로세스가 어떻게 흐르는지 예고.]</>}
  >
    <div className="lane">
      <LaneRow
        color="#10b981"
        name="[참여자 A]"
        sub="[역할]"
        steps={[{ b: '[단계]', s: '[보조]' }, { b: '[단계]' }, { b: '[단계]' }]}
      />
      <LaneRow
        color="#2563eb"
        name="[참여자 B]"
        sub="[역할]"
        steps={[{ b: '[단계]' }, { b: '[단계]', s: '[보조]' }]}
      />
    </div>

    <ImgSlot suggestion="[여기에 들어가면 좋을 실제 화면 캡처·사진을 구체적으로 적는다]" />

    <p className="coda">
      [마침 문장 — 이 발표가 남겨야 할 <b>한 줄</b>.]
    </p>
  </ContentSlide>,

  /* 6. 마무리 */
  <div className="dark-stage" key="thanks">
    <div className="thanks-inner">
      <img src="/images/logo.png" alt="RMS GROUP" />
      <div className="thanks-title">감사합니다</div>
      <div className="thanks-tagline">
        Improving the quality of life and<br />creating a sustainable &amp; resilient society
      </div>
      <div className="thanks-contact">rmsgroup.co.kr</div>
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
      <PptExportButton total={total} current={idx} goTo={setIdx} fileName="YYYYMMDD_COM_빈템플릿_v1.pptx" />

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
