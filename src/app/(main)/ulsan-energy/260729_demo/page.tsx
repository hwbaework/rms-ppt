'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// 통합에너지플랫폼 구축 현황 발표 — 2026.07.29  (에디토리얼 스타일)
// 원본 자료: "발표자료 시나리오v0.1.hwpx" (13페이지 발표 시나리오)
// 원칙: 멘트(시나리오)가 설명을 담당 → 슬라이드는 키워드 + 도식 + 이미지 슬롯만.
//        문장·리드문 최소화, 시나리오에 없는 내용 추가 금지.
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
.cover-sub{color:rgba(191,209,238,.85);font-size:1.08vw;font-weight:300;line-height:1.75;margin-bottom:2.2vw;position:relative;z-index:1}
.cover-steps{display:flex;align-items:center;gap:.7vw;margin-bottom:3vw;position:relative;z-index:1}
.cover-step{display:inline-flex;align-items:center;gap:.45vw;border:1px solid rgba(127,168,232,.35);border-radius:999px;padding:.3vw 1vw;color:rgba(191,209,238,.9);font-size:.78vw;font-weight:600}
.cover-step .material-symbols-outlined{font-size:.95vw;color:var(--accent-soft)}
.cover-step-arr{color:rgba(127,168,232,.5);font-size:.9vw}
.cover-meta{display:flex;align-items:center;gap:1vw;color:rgba(148,168,200,.85);font-size:.82vw;position:relative;z-index:1}
.cover-meta img{height:1.35vw;filter:brightness(0) invert(1);opacity:.9}
.cover-meta i{width:3px;height:3px;border-radius:50%;background:rgba(148,168,200,.5)}
.thanks-inner{text-align:center;position:relative;z-index:1;align-self:center}
.thanks-inner img{height:2.4vw;filter:brightness(0) invert(1);margin-bottom:2.6vw;opacity:.92}
.thanks-title{color:#fff;font-size:3.1vw;font-weight:800;letter-spacing:-.01em;margin-bottom:1.3vw}
.thanks-tagline{color:var(--accent-soft);font-size:1vw;font-weight:300;line-height:1.8}
.thanks-contact{color:rgba(148,168,200,.6);font-size:.82vw;margin-top:2.8vw;letter-spacing:.08em}

/* ── 목차 ── */
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
.cs-title{color:var(--ink);font-size:2.1vw;font-weight:800;letter-spacing:-.025em;line-height:1.28;margin-bottom:1.2vw}
.cs-title .hl{color:var(--accent)}
.area{flex:1;display:flex;flex-direction:column;gap:1.1vw}

/* ── 스텝 플로우 (점 + 라인) ── */
.flow{display:flex}
.step{flex:1;padding-right:1.2vw;position:relative}
.step-line{display:flex;align-items:center;gap:.55vw;margin-bottom:.55vw}
.step-dot{width:.52vw;height:.52vw;border-radius:50%;border:2px solid var(--accent);background:var(--paper);flex-shrink:0}
.step.final .step-dot{background:var(--accent)}
.step-no{color:var(--accent);font-size:.68vw;font-weight:800;letter-spacing:.1em}
.step-line:after{content:"";flex:1;height:1px;background:var(--hair)}
.step:last-child .step-line:after{display:none}
.step-name{color:var(--ink);font-size:1vw;font-weight:700;line-height:1.4;margin-bottom:.28vw}
.step.final .step-name{color:var(--accent)}
.step-sub{color:var(--muted);font-size:.78vw;line-height:1.68}

/* ── 블록 라벨 ── */
.block-label{display:flex;align-items:center;gap:.9vw;margin-bottom:.55vw}
.block-label b{color:var(--ink);font-size:.9vw;font-weight:700;white-space:nowrap}
.block-label .tag{margin-left:0}
.block-label:after{content:"";flex:1;height:1px;background:var(--hair)}

/* ── 아이콘 타일 ── */
.press{display:grid;grid-template-columns:repeat(4,1fr);gap:.8vw}
.press.p3{grid-template-columns:repeat(3,1fr)}
.press-card{background:#fff;border:1px solid var(--hair);border-radius:14px;padding:1vw .8vw;text-align:center}
.press-card.soon{background:var(--chip);border-style:dashed}
.press-ic{width:2.6vw;height:2.6vw;border-radius:50%;margin:0 auto .45vw;display:flex;align-items:center;justify-content:center;background:var(--tint);color:var(--accent)}
.press-ic .material-symbols-outlined{font-size:1.35vw}
.press-card.soon .press-ic{background:#eef1f7;color:#64748b}
.press-k{color:var(--ink);font-size:1vw;font-weight:800;letter-spacing:-.01em}
.press-d{color:var(--muted);font-size:.73vw;line-height:1.55;margin-top:.3vw}

/* ── 태그 ── */
.tag{display:inline-flex;align-items:center;gap:.38vw;border:1px solid var(--hair);border-radius:999px;padding:.15vw .7vw;font-size:.68vw;font-weight:600;color:var(--muted);background:#fff}
.tag i{width:.38vw;height:.38vw;border-radius:50%;display:inline-block}
.tag.blue{color:#1d4ed8;border-color:#bfdbfe}.tag.blue i{background:#2563eb}
.tag.gray i{background:#94a3b8}

/* ── 아이콘 노드 미니 플로우 ── */
.mflow{display:flex;align-items:center;justify-content:center;gap:.8vw;flex-wrap:wrap}
.mnode{display:flex;flex-direction:column;align-items:center;gap:.35vw;text-align:center;min-width:6.5vw}
.mnode-ic{width:3vw;height:3vw;border-radius:50%;background:var(--tint);color:var(--accent);display:flex;align-items:center;justify-content:center;box-shadow:0 3px 12px rgba(37,99,235,.08)}
.mnode-ic .material-symbols-outlined{font-size:1.45vw}
.mnode.gray .mnode-ic{background:#eef1f7;color:#64748b;box-shadow:none}
.mnode.fill .mnode-ic{background:linear-gradient(135deg,#1d4ed8,#2563eb);color:#fff;box-shadow:0 6px 18px rgba(37,99,235,.28)}
.mnode-t{font-size:.84vw;font-weight:700;color:var(--ink);line-height:1.35}
.mnode-s{font-size:.68vw;color:var(--muted);line-height:1.5}
.mflow-arr{color:#c3ccda;font-size:1.3vw;flex-shrink:0}
.mlink{display:flex;flex-direction:column;align-items:center;gap:.2vw;flex-shrink:0}
.mlink-lab{background:var(--tint);border:1px solid var(--tint-line);color:var(--accent);border-radius:999px;padding:.12vw .7vw;font-size:.66vw;font-weight:700;white-space:nowrap}

/* ── 대비 패널 (통상 방식 vs RMS 방식) ── */
.vs{display:grid;grid-template-columns:1fr 1.15fr;gap:1vw;flex:1;align-items:stretch}
.vs-panel{border:2px dashed #cbd5e1;border-radius:14px;background:#f8fafc;padding:1.1vw 1.2vw;display:flex;flex-direction:column;gap:1vw;justify-content:center}
.vs-panel.ours{border:1px solid #93c5fd;background:#fff;box-shadow:0 4px 18px rgba(37,99,235,.08)}
.vs-h{display:flex;align-items:center;gap:.5vw;font-size:.95vw;font-weight:800;color:#64748b;justify-content:center}
.vs-h .material-symbols-outlined{font-size:1.1vw}
.vs-panel.ours .vs-h{color:var(--accent)}

/* ── 페르소나 허브 (중앙 플랫폼 + 5 방사 노드) ── */
.hub{position:relative;flex:1;min-height:14vw}
.hub svg{position:absolute;inset:0;width:100%;height:100%}
.hub-c{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:9.5vw;height:9.5vw;border-radius:50%;background:linear-gradient(135deg,#1d4ed8,#2563eb);color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.25vw;box-shadow:0 10px 34px rgba(37,99,235,.28);z-index:1;text-align:center;padding:.6vw}
.hub-c .material-symbols-outlined{font-size:1.7vw}
.hub-c b{font-size:.84vw;line-height:1.35}
.hub-c small{font-size:.62vw;opacity:.75}
.pnode{position:absolute;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:.3vw;z-index:1;text-align:center}
.pnode-ic{width:3.2vw;height:3.2vw;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;box-shadow:0 5px 16px rgba(11,21,38,.16)}
.pnode-ic .material-symbols-outlined{font-size:1.5vw}
.pnode b{font-size:.82vw;color:var(--ink)}
.pnode small{font-size:.64vw;color:var(--muted)}

/* ── 질문 카드 ── */
.q3{display:grid;grid-template-columns:repeat(3,1fr);gap:1vw}
.qcard{background:#fff;border:1px solid var(--hair);border-radius:14px;padding:1.5vw 1.2vw;text-align:center}
.q-ic{width:3.2vw;height:3.2vw;border-radius:50%;margin:0 auto .7vw;background:var(--tint);color:var(--accent);display:flex;align-items:center;justify-content:center}
.q-ic .material-symbols-outlined{font-size:1.6vw}
.q-no{color:var(--accent);font-size:.72vw;font-weight:800;letter-spacing:.16em;margin-bottom:.35vw}
.q-t{font-size:1.08vw;font-weight:800;color:var(--ink);line-height:1.45}

/* ── 기능 슬라이드 분할 ── */
.feat{display:grid;grid-template-columns:1fr 1fr;gap:1.1vw;flex:1;align-items:stretch}
.fcol{display:flex;flex-direction:column;gap:1vw;justify-content:center}
.pbox{border:1.5px solid #93c5fd;border-radius:14px;background:var(--tint);padding:1.5vw 1.2vw 1.2vw;position:relative}
.pbox-tag{position:absolute;top:-.75vw;left:50%;transform:translateX(-50%);background:var(--accent);color:#fff;border-radius:999px;padding:.16vw .9vw;font-size:.7vw;font-weight:700;white-space:nowrap}

/* ── 이미지 플레이스홀더 (실제 화면 캡처 자리 — 가장 중요) ── */
.imgslot{border:2px dashed #c7d2e3;border-radius:14px;background:var(--chip);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:1.1vw;gap:.35vw;min-height:9vw}
.imgslot.tall{min-height:12vw}
.imgslot .material-symbols-outlined{font-size:2vw;color:#94a3b8}
.imgslot-t{color:var(--muted);font-size:.78vw;font-weight:700}
.imgslot-d{color:var(--muted);font-size:.71vw;line-height:1.65}

/* ── 마침 문장 ── */
.coda{color:var(--body);font-size:.92vw;line-height:1.8;border-top:1px solid var(--hair);padding-top:.9vw;text-align:center}
.coda b{color:var(--accent);font-weight:700}

/* ── 모션 ── */
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
.slide.active .cover-steps{animation:rise .65s cubic-bezier(.2,.6,.2,1) .34s both}
.slide.active .cover-meta{animation:rise .65s cubic-bezier(.2,.6,.2,1) .44s both}
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
.slide.active .area>*{animation:rise .6s cubic-bezier(.2,.6,.2,1) both}
.slide.active .area>:nth-child(1){animation-delay:.18s}
.slide.active .area>:nth-child(2){animation-delay:.3s}
.slide.active .area>:nth-child(3){animation-delay:.42s}
.slide.active .area>:nth-child(4){animation-delay:.54s}
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
  children,
}: {
  no: string
  sec: string
  title: ReactNode
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

// 아이콘 노드 미니 플로우 — 노드(아이콘+라벨)를 화살표로 잇는 그림
function MNode({ ic, t, s, tone }: { ic: string; t: string; s?: string; tone?: 'gray' | 'fill' }) {
  return (
    <div className={`mnode${tone ? ` ${tone}` : ''}`}>
      <div className="mnode-ic"><span className="material-symbols-outlined">{ic}</span></div>
      <div className="mnode-t">{t}</div>
      {s && <div className="mnode-s">{s}</div>}
    </div>
  )
}

function Arr() {
  return <span className="mflow-arr material-symbols-outlined">arrow_forward</span>
}

function Tile({ ic, k, d, soon }: { ic: string; k: string; d?: string; soon?: boolean }) {
  return (
    <div className={`press-card${soon ? ' soon' : ''}`}>
      <div className="press-ic"><span className="material-symbols-outlined">{ic}</span></div>
      <div className="press-k">{k}</div>
      {d && <div className="press-d">{d}</div>}
    </div>
  )
}

function ImgSlot({ t, d, tall }: { t: string; d: string; tall?: boolean }) {
  return (
    <div className={`imgslot${tall ? ' tall' : ''}`}>
      <span className="material-symbols-outlined">add_photo_alternate</span>
      <div className="imgslot-t">{t}</div>
      <div className="imgslot-d">{d}</div>
    </div>
  )
}

/* ─────────────────────────── 슬라이드 ─────────────────────────── */

// target = 각 챕터 첫 슬라이드의 인덱스 (목차 행 클릭 시 이동)
const TOC = [
  { no: '01', t: '사업 추진 경과', d: '1~2차년도 기반 구축 → 3차년도 핵심 기능 개발', target: 2 },
  { no: '02', t: '플랫폼 방향성', d: '납품형이 아닌, 지속가능한 하나의 플랫폼 — 5개 페르소나', target: 4 },
  { no: '03', t: '핵심 기능 다섯 가지', d: '컨설팅 · 원스톱 · 모니터링 · 전력거래 · DT', target: 7 },
  { no: '04', t: '하반기 로드맵', d: '탄소배출관리 · e데이터마켓 · VPP — 딥링크 연동', target: 12 },
  { no: '05', t: '마무리', d: '울산은 하나의 적용 범위 — 확장 가능한 플랫폼', target: 13 },
]

// 페르소나 색상 — CLAUDE.md §4.5 (발전사 emerald · 수용가 amber · 컨설턴트 violet · SPC blue · 관리자 slate)
const PERSONAS = [
  { x: '50%', y: '10%', c: '#f59e0b', ic: 'factory', t: '수요기업' },
  { x: '85%', y: '30%', c: '#10b981', ic: 'solar_power', t: '발전사업자' },
  { x: '76%', y: '86%', c: '#2563eb', ic: 'apartment', t: 'SPC' },
  { x: '24%', y: '86%', c: '#8b5cf6', ic: 'support_agent', t: '컨설턴트' },
  { x: '15%', y: '30%', c: '#64748b', ic: 'admin_panel_settings', t: '플랫폼관리자' },
]

const buildSlides = (goTo: (i: number) => void): ReactNode[] => [
  /* 0. 표지 — [1page 인사 및 발표 개요] */
  <div className="dark-stage" key="cover">
    <p className="cover-eyebrow">Ulsan-Mipo Energy Independence</p>
    <h1 className="cover-title">지속가능한<br />통합 에너지 플랫폼</h1>
    <p className="cover-sub">울산미포 에너지자급자족 인프라 구축 및 운영사업 — 플랫폼 구축 현황과 방향성</p>
    <div className="cover-steps">
      <span className="cover-step"><span className="material-symbols-outlined">co_present</span>발표</span>
      <span className="cover-step-arr">→</span>
      <span className="cover-step"><span className="material-symbols-outlined">play_circle</span>시연 영상</span>
      <span className="cover-step-arr">→</span>
      <span className="cover-step"><span className="material-symbols-outlined">computer</span>실제 플랫폼 시연</span>
    </div>
    <div className="cover-meta">
      <img src="/images/logo.png" alt="RMS GROUP" />
      <i />
      <span>2026. 07. 29</span>
    </div>
  </div>,

  /* 1. 목차 */
  <div className="toc" key="toc">
    <div className="toc-left">
      <p className="toc-eyebrow">Contents</p>
      <h2 className="toc-title">목차</h2>
      <p className="toc-lead">
        울산에 납품하고 끝나는 시스템이 아니라,<br />
        계속 자라는 하나의 플랫폼을<br />
        만들고 있습니다.
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

  /* 2. [2page 사업 추진 경과] */
  <ContentSlide key="s-history" no="01" sec="사업 추진 경과" title={<>지금은 <span className="hl">3차년도</span> — 계획대로 가고 있습니다</>}>
    <Flow
      steps={[
        { no: '1~2차년도', name: '요구사항 분석 · 설계', sub: '플랫폼 구축 기반 작업' },
        { no: '1~2차년도', name: '통합관제센터 구축', sub: '' },
        { no: '3차년도 · 올해', name: '핵심 기능 개발', sub: '계획된 일정에 따라 정상 진행 중', final: true },
      ]}
    />
    <ImgSlot
      tall
      t="제안: 통합관제센터 사진"
      d="1~2차년도에 구축한 통합관제센터 실사 — 상황판이 켜진 정면 컷"
    />
  </ContentSlide>,

  /* 3. [3page 3차년도 개발 현황 요약] */
  <ContentSlide key="s-status" no="01" sec="사업 추진 경과" title={<>상반기 <span className="hl">4</span>개 구축 중 · 하반기 <span className="hl">3</span>개 계획</>}>
    <div>
      <div className="block-label"><b>상반기 — 구축 중</b><span className="tag blue"><i />오늘 보여드리는 범위</span></div>
      <div className="press">
        <Tile ic="support_agent" k="컨설팅" />
        <Tile ic="monitoring" k="모니터링" />
        <Tile ic="swap_horiz" k="전력거래" />
        <Tile ic="view_in_ar" k="DT" d="디지털 트윈" />
      </div>
    </div>
    <div>
      <div className="block-label"><b>하반기 — 개발 계획</b><span className="tag gray"><i />로드맵에서 상세</span></div>
      <div className="press p3">
        <Tile soon ic="co2" k="탄소배출관리" />
        <Tile soon ic="storefront" k="e데이터마켓" />
        <Tile soon ic="hub" k="VPP" />
      </div>
    </div>
  </ContentSlide>,

  /* 4. [4page 방향성] */
  <ContentSlide key="s-vision" no="02" sec="플랫폼 방향성" title={<>납품하고 끝나는 시스템이 <span className="hl">아닙니다</span></>}>
    <div className="vs">
      <div className="vs-panel">
        <div className="vs-h"><span className="material-symbols-outlined">inventory_2</span>통상적인 공공 플랫폼</div>
        <div className="mflow">
          <MNode tone="gray" ic="local_shipping" t="지역에 납품" />
          <Arr />
          <MNode tone="gray" ic="flag" t="사업 종료" />
          <Arr />
          <MNode tone="gray" ic="block" t="업데이트 중단 · 방치" />
        </div>
      </div>
      <div className="vs-panel ours">
        <div className="vs-h"><span className="material-symbols-outlined">all_inclusive</span>RMS — 하나의 메인 플랫폼</div>
        <div className="mflow">
          <MNode tone="fill" ic="hub" t="메인 플랫폼" s="하나의 기반" />
          <Arr />
          <MNode ic="location_on" t="울산 사용자" s="울산 정보만 열람" />
          <Arr />
          <MNode ic="update" t="종료 후에도" s="운영 · 업데이트 지속" />
          <Arr />
          <MNode ic="person_add" t="신규 가입자" s="누구나 쉽게 접근" />
        </div>
      </div>
    </div>
  </ContentSlide>,

  /* 5. [5page 사용자 관점] */
  <ContentSlide key="s-questions" no="02" sec="플랫폼 방향성" title={<>기업이 궁금한 건 결국 <span className="hl">세 가지</span>입니다</>}>
    <div className="q3">
      <div className="qcard">
        <div className="q-ic"><span className="material-symbols-outlined">flag</span></div>
        <div className="q-no">Q1</div>
        <div className="q-t">RE100을 이행하려면<br />어떻게 해야 하나?</div>
      </div>
      <div className="qcard">
        <div className="q-ic"><span className="material-symbols-outlined">route</span></div>
        <div className="q-no">Q2</div>
        <div className="q-t">그 구체적인 방법은<br />무엇인가?</div>
      </div>
      <div className="qcard">
        <div className="q-ic"><span className="material-symbols-outlined">insights</span></div>
        <div className="q-no">Q3</div>
        <div className="q-t">태양광을 설치하면<br />효과가 얼마나 되나?</div>
      </div>
    </div>
    <p className="coda">핵심 기능 전부가 — <b>이 세 질문에 답하기 위한 서비스</b>입니다</p>
  </ContentSlide>,

  /* 6. [6page 5개 페르소나] */
  <ContentSlide key="s-persona" no="02" sec="플랫폼 방향성" title={<>하나의 플랫폼, <span className="hl">다섯 개의 화면</span></>}>
    <div className="hub">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
        {PERSONAS.map((p, i) => (
          <line key={i} x1="50" y1="50" x2={parseFloat(p.x)} y2={parseFloat(p.y)} stroke="#d5ddeb" strokeWidth=".35" strokeDasharray="1.4 1.1" />
        ))}
      </svg>
      <div className="hub-c">
        <span className="material-symbols-outlined">hub</span>
        <b>통합 에너지<br />플랫폼</b>
        <small>역할별 UI/UX · 기능</small>
      </div>
      {PERSONAS.map((p) => (
        <div className="pnode" key={p.t} style={{ left: p.x, top: p.y }}>
          <div className="pnode-ic" style={{ background: p.c }}>
            <span className="material-symbols-outlined">{p.ic}</span>
          </div>
          <b>{p.t}</b>
        </div>
      ))}
    </div>
    <div className="mflow">
      <span className="tag blue"><i />현장 시연 — 관리자 계정</span>
      <span className="tag gray"><i />페르소나별 화면 — 시연 영상으로</span>
    </div>
  </ContentSlide>,

  /* 7. [7page 핵심 기능 ① 컨설팅] */
  <ContentSlide key="s-f1" no="03 · ①" sec="핵심 기능 — 컨설팅" title={<>신청하면, <span className="hl">매칭</span>됩니다</>}>
    <div className="mflow">
      <MNode tone="gray" ic="psychology_alt" t="기존" s="어디에 문의할지조차 어려움" />
      <Arr />
      <MNode ic="edit_note" t="플랫폼 내 신청" s="수요기업" />
      <Arr />
      <MNode tone="fill" ic="handshake" t="컨설턴트 매칭" s="플랫폼에 직접 연계" />
      <Arr />
      <MNode ic="forum" t="톡으로 진행" s="일정 조율 · 질의" />
    </div>
    <ImgSlot
      tall
      t="제안: 컨설팅 신청 → 매칭 → 톡 화면 캡처"
      d="수요기업의 컨설팅 신청 화면과, 매칭된 컨설턴트와의 톡(일정 조율 대화) 화면"
    />
  </ContentSlide>,

  /* 8. [8page 핵심 기능 ② 원스톱 통합 처리] */
  <ContentSlide key="s-f2" no="03 · ②" sec="핵심 기능 — 원스톱 통합 처리" title={<>계약부터 정산까지, <span className="hl">플랫폼 안에서</span></>}>
    <div className="feat">
      <div className="fcol">
        <div className="pbox">
          <span className="pbox-tag">전부 플랫폼 안에서</span>
          <div className="mflow">
            <MNode ic="contract" t="계약" />
            <Arr />
            <MNode ic="receipt_long" t="세금계산서 발행" />
            <Arr />
            <MNode tone="fill" ic="payments" t="정산" />
          </div>
        </div>
        <div className="mflow">
          <span className="tag gray"><i />별도 수기 처리 — 없음</span>
        </div>
      </div>
      <ImgSlot
        tall
        t="제안: 세금계산서 · 정산 화면 캡처"
        d="플랫폼 안에서 세금계산서가 발행되고 정산 내역이 잡히는 화면"
      />
    </div>
  </ContentSlide>,

  /* 9. [9page 핵심 기능 ③ 모니터링 + O&M] */
  <ContentSlide key="s-f3" no="03 · ③" sec="핵심 기능 — 모니터링 + O&M" title={<>감지에서 조치까지, <span className="hl">하나의 흐름</span></>}>
    <div className="feat">
      <ImgSlot
        tall
        t="제안: 모니터링 대시보드 + O&M 접수 화면 캡처"
        d="이상상황 알림이 뜬 모니터링 화면과, 연결된 A/S · O&M 접수 · 처리 현황 화면"
      />
      <div className="fcol">
        <div className="mflow">
          <MNode ic="warning" t="이상상황 감지" />
          <Arr />
          <MNode ic="handyman" t="A/S · O&M 접수" s="플랫폼 내 바로 연계" />
        </div>
        <div className="mflow">
          <MNode ic="task_alt" t="조치" />
          <Arr />
          <MNode tone="fill" ic="sync" t="실시간 반영" s="처리 현황 업데이트" />
        </div>
        <div className="mflow">
          <span className="tag gray"><i />발전량만 보는 모니터링은 반쪽</span>
        </div>
      </div>
    </div>
  </ContentSlide>,

  /* 10. [10page 핵심 기능 ④ 전력거래] */
  <ContentSlide key="s-f4" no="03 · ④" sec="핵심 기능 — 전력거래" title={<>RE100 전력을 <span className="hl">조달하는 길</span></>}>
    <div className="feat">
      <div className="fcol">
        <div className="mflow">
          <MNode ic="solar_power" t="재생에너지 전력" s="발전사업자" />
          <Arr />
          <MNode tone="fill" ic="swap_horiz" t="전력거래" s="플랫폼이 서비스로 제공" />
          <Arr />
          <MNode ic="factory" t="수요기업" s="RE100 이행" />
        </div>
      </div>
      <ImgSlot
        tall
        t="제안: 전력거래 화면 캡처"
        d="수요기업이 재생에너지 전력을 확보하는 거래 화면"
      />
    </div>
  </ContentSlide>,

  /* 11. [11page 핵심 기능 ⑤ DT] */
  <ContentSlide key="s-f5" no="03 · ⑤" sec="핵심 기능 — DT (디지털 트윈)" title={<>설치 전에, 효과를 <span className="hl">눈으로</span></>}>
    <div className="mflow">
      <MNode ic="apartment" t="설치 전" s="우리 사업장" />
      <Arr />
      <MNode tone="fill" ic="view_in_ar" t="DT 시뮬레이션" />
      <Arr />
      <MNode ic="insights" t="예상 효과 확인" s="시각적으로" />
      <span className="tag blue" style={{ marginLeft: '1vw' }}><i />발표 후 실제 접속 시연</span>
    </div>
    <ImgSlot
      tall
      t="제안: DT 화면 캡처 (대형)"
      d="태양광 설치 전 예상 효과를 3D로 보여주는 디지털 트윈 화면 — 이 덱에서 가장 큰 이미지"
    />
  </ContentSlide>,

  /* 12. [12page 하반기 개발 로드맵] */
  <ContentSlide key="s-roadmap" no="04" sec="하반기 로드맵" title={<>딥링크로 연결되는 <span className="hl">세 개의 신규 서비스</span></>}>
    <div className="press p3">
      <Tile ic="co2" k="탄소배출관리" />
      <Tile ic="storefront" k="e데이터마켓" />
      <Tile ic="hub" k="VPP" />
    </div>
    <div className="mflow">
      <MNode tone="fill" ic="hub" t="메인 플랫폼" />
      <span className="mlink">
        <span className="mlink-lab">딥링크 연동</span>
        <span className="mflow-arr material-symbols-outlined">arrow_forward</span>
      </span>
      <MNode ic="open_in_new" t="신규 플랫폼" s="범위가 방대해 별도 구축" />
    </div>
    <p className="coda">사용자는 <b>하나의 플랫폼처럼</b> 자연스럽게 이동 — 서비스 연속성 유지</p>
  </ContentSlide>,

  /* 13. [13page 마무리] */
  <ContentSlide key="s-close" no="05" sec="마무리" title={<>울산은 <span className="hl">하나의 적용 범위</span>입니다</>}>
    <div className="mflow">
      <MNode tone="fill" ic="location_on" t="울산 에자자" s="첫 적용" />
      <Arr />
      <MNode ic="map" t="타 지역" s="동일한 플랫폼 기반" />
      <Arr />
      <MNode ic="person_add" t="신규 가입자" s="확장" />
    </div>
    <div className="mflow">
      <span className="tag blue"><i />이어서 — 시연 영상</span>
      <span className="mflow-arr material-symbols-outlined">arrow_forward</span>
      <span className="tag blue"><i />실제 플랫폼 시연</span>
    </div>
  </ContentSlide>,

  /* 14. 마무리 다크 */
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
