'use client'

import { Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// 울산미포 에자자 3차년도 중간점검 — 2026.07.30  (에디토리얼 스타일)
// 원본 자료: "[울산미포에자자] 3차년도 킥오프 발표자료_v1.0.pptx" · "킥오프 발표 시나리오.docx"
//   · "에자자 중간점검 일정통보(공문).pdf" ('26.6월 말 기준 실적 점검, 7.30 13:30)
// 구성(사용자 지정): 표지 → ①추진일정(원본 4p) → ②2차년도 추진성과(원본 5~7p) + 성과지표(원본 8p)
//   → ③3차년도 성과지표(원본 9p) → ④3차년도 추진현황 5개 사진(원본 11~15p) → 마무리. 목차 없음.
// 사진: /images/260730_midterm/{fuelcell,solar,orc,platform,v2g}.png 를 넣으면 자동 표시
//   (없으면 점선 플레이스홀더 — 260730_demo-v2 방식)
// 디자인: 260730_spc/demo-v2와 동일 — 페이지 로컬 CSS + 자체 플레이어(딥네이비 블롭
//   고정 배경 · 상단 진행바 · 하단 도트 네비 · 풀스크린 F)
// ─────────────────────────────────────────────────────────────────────────────

const CSS = `
:root{--accent:#2563eb;--accent-soft:#7fa8e8;--ink:#0b1526;--body:#3e4c5e;--muted:#8a94a6;--hair:#e6eaf2;--paper:#fbfcfe;--card:#ffffff;--chip:#f5f7fb;--tint:#eff6ff;--tint-line:#bfdbfe;--navy1:#0a162e;--navy2:#12264d}
.presentation{position:fixed;inset:0;z-index:50;background:#081120;overflow:hidden;font-family:Pretendard,'Noto Sans KR',-apple-system,BlinkMacSystemFont,sans-serif;-webkit-font-smoothing:antialiased}
.presentation *{box-sizing:border-box;margin:0;padding:0}
.slide{opacity:0;pointer-events:none;flex-direction:column;transition:opacity .5s,transform .5s;display:flex;position:absolute;inset:0;transform:translate(48px)}
.slide>*{flex:1}
.slide.active{opacity:1;pointer-events:all;transform:translate(0)}
.slide.prev{opacity:0;transform:translate(-48px)}

/* ── 고정 배경 레이어 ── */
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
.cover-title{color:#fff;font-size:3.7vw;font-weight:900;letter-spacing:-.02em;line-height:1.18;margin-bottom:1.2vw;position:relative;z-index:1}
.cover-sub{color:rgba(191,209,238,.85);font-size:1.15vw;font-weight:300;line-height:1.8;margin-bottom:2.2vw;position:relative;z-index:1}
.cover-sub b{color:#fff;font-weight:600}
.cover-meta{display:flex;align-items:center;gap:1vw;color:rgba(148,168,200,.85);font-size:.9vw;position:relative;z-index:1}
.cover-meta img{height:1.5vw;opacity:1}
.cover-meta i{width:3px;height:3px;border-radius:50%;background:rgba(148,168,200,.5)}

/* ── 본문 공통 ── */
.cs{background:var(--paper);display:flex;flex-direction:column}
.cs-body{flex:1;display:flex;flex-direction:column;padding:3% 6.5% 72px}
.cs-head{display:flex;align-items:center;gap:.9vw;margin-bottom:1.1vw}
.cs-no{color:var(--accent);font-size:.85vw;font-weight:800;letter-spacing:.14em}
.cs-sec{color:var(--muted);font-size:.85vw;font-weight:500}
.cs-hair{flex:1;height:1px;background:var(--hair)}
.cs-title{color:var(--ink);font-size:2.05vw;font-weight:800;letter-spacing:-.025em;line-height:1.28;margin-bottom:.6vw}
.cs-title .hl{color:var(--accent)}
.lede{color:var(--body);font-size:.97vw;line-height:1.7;margin-bottom:1vw}
.lede b{color:var(--ink);font-weight:700}
.area{flex:1;display:flex;flex-direction:column;gap:1.1vw;min-height:0}
.area.fill{justify-content:space-between;gap:1.1vw}

/* ── 블록 라벨 ── */
.block-label{display:flex;align-items:center;gap:.9vw;margin-bottom:.55vw}
.block-label b{color:var(--ink);font-size:.95vw;font-weight:700;white-space:nowrap}
.block-label:after{content:"";flex:1;height:1px;background:var(--hair)}

/* ── 태그 ── */
.tag{display:inline-flex;align-items:center;gap:.38vw;border:1px solid var(--hair);border-radius:999px;padding:.14vw .7vw;font-size:.7vw;font-weight:600;color:var(--muted);background:#fff;white-space:nowrap}
.tag i{width:.38vw;height:.38vw;border-radius:50%;display:inline-block}
.tag.blue{color:#1d4ed8;border-color:#bfdbfe}.tag.blue i{background:#2563eb}
.tag.green{color:#047857;border-color:#a7f3d0}.tag.green i{background:#10b981}
.tag.amber{color:#b45309;border-color:#fde68a}.tag.amber i{background:#f59e0b}
.tag.gray i{background:#94a3b8}
.tag.live i{animation:livepulse 1.6s ease-in-out infinite}
@keyframes livepulse{0%,100%{opacity:.4}50%{opacity:1}}

/* ── 연차 로드맵 스트립 (추진일정 상단) ── */
.rmrow{display:flex;gap:.9vw;align-items:stretch}
.rmcol{flex:1;display:flex;flex-direction:column;min-width:0}
.step-line{display:flex;align-items:center;gap:.55vw;margin-bottom:.5vw}
.step-dot{width:.55vw;height:.55vw;border-radius:50%;border:2px solid var(--accent);background:var(--paper);flex-shrink:0}
.step-dot.fill{background:var(--accent)}
.step-no{color:var(--accent);font-size:.76vw;font-weight:800;letter-spacing:.06em;white-space:nowrap}
.step-line:after{content:"";flex:1;height:1px;background:var(--hair)}
.rmcol:last-child .step-line:after{display:none}
.rm{flex:1;border:1px solid var(--hair);border-radius:12px;background:#fff;padding:.75vw 1vw;display:flex;flex-direction:column;gap:.3vw;justify-content:center}
.rm.done{background:var(--chip)}
.rm.cur{border:1.5px solid #93c5fd;background:linear-gradient(180deg,#ffffff,#f7faff);box-shadow:0 8px 24px rgba(37,99,235,.12)}
.rm-t{color:var(--ink);font-size:.92vw;font-weight:800;letter-spacing:-.01em;line-height:1.35;display:flex;align-items:center;gap:.5vw;flex-wrap:wrap}
.rm-d{color:var(--body);font-size:.78vw;line-height:1.55;word-break:keep-all}

/* ── 간트 (추진일정 하단) ── */
.gantt{flex:1;min-height:0;display:flex;flex-direction:column;gap:.55vw}
.g-years{display:flex;margin-left:11.1vw}
.g-years span{flex:1;text-align:center;font-size:.76vw;font-weight:800;color:var(--muted);letter-spacing:.02em;padding:.28vw 0;border-left:1px solid var(--hair)}
.g-years span:first-child{border-left:none}
.g-years span.cur{color:#1d4ed8;background:var(--tint);border-radius:8px 8px 0 0}
.g-years span small{font-weight:600;margin-left:.3vw;color:inherit;opacity:.75}
.g-bodywrap{position:relative;flex:1;min-height:0;display:flex;flex-direction:column;justify-content:space-between;gap:.5vw}
.g-grp-t{display:flex;align-items:center;gap:.7vw;margin-bottom:.3vw}
.g-grp-t b{color:#1d4ed8;font-size:.76vw;font-weight:800;white-space:nowrap;background:var(--tint);border:1px solid var(--tint-line);border-radius:999px;padding:.1vw .7vw}
.g-grp-t:after{content:"";flex:1;height:1px;background:var(--hair)}
.g-row{display:flex;align-items:center;gap:.6vw;margin-top:.32vw}
.g-lab{width:10.5vw;flex-shrink:0;text-align:right;line-height:1.25}
.g-lab b{display:block;color:var(--ink);font-size:.78vw;font-weight:700}
.g-lab small{display:block;color:var(--muted);font-size:.64vw;font-weight:600}
.g-track{position:relative;flex:1;height:1.72vw;background:#eef1f7;border-radius:6px;background-image:linear-gradient(90deg,transparent calc(33.33% - 1px),#dde3ee calc(33.33% - 1px),#dde3ee 33.33%,transparent 33.33%),linear-gradient(90deg,transparent calc(66.66% - 1px),#dde3ee calc(66.66% - 1px),#dde3ee 66.66%,transparent 66.66%)}
.g-seg{position:absolute;top:0;bottom:0;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:.64vw;font-weight:700;white-space:nowrap;overflow:hidden;padding:0 .35vw;letter-spacing:-.01em}
.g-seg.plan{background:#dbe7f8;color:#2c4f96}
.g-seg.build{background:linear-gradient(90deg,#1d4ed8,#3b82f6);color:#fff}
.g-seg.run{background:#0f2a5f;color:#cfe0fb}
.g-seg.float{top:14%;bottom:14%;background:linear-gradient(90deg,#1d4ed8,#3b82f6);color:#fff;border:1.5px solid #fff;z-index:2;box-shadow:0 2px 8px rgba(29,78,216,.35)}
.g-now{position:absolute;top:-.2vw;bottom:0;width:0;border-left:2px dashed #f59e0b;z-index:3;left:calc(11.1vw + (100% - 11.1vw)*.513)}
.g-now:after{content:"현재";position:absolute;bottom:-1.35vw;left:50%;transform:translateX(-50%);background:#f59e0b;color:#fff;font-size:.62vw;font-weight:800;border-radius:999px;padding:.08vw .55vw;white-space:nowrap}
.g-legend{display:flex;gap:1vw;justify-content:flex-end;margin-top:1vw}
.g-legend span{display:inline-flex;align-items:center;gap:.4vw;color:var(--muted);font-size:.68vw;font-weight:600}
.g-legend i{width:.85vw;height:.55vw;border-radius:3px;display:inline-block}
.g-legend i.plan{background:#dbe7f8}
.g-legend i.build{background:linear-gradient(90deg,#1d4ed8,#3b82f6)}
.g-legend i.run{background:#0f2a5f}

/* ── 2차년도 추진성과 — 좌 2/3 성과 블록 + 우 1/3 성과지표 패널 ── */
.perf{display:grid;grid-template-columns:2fr 1fr;gap:1.1vw;flex:1;min-height:0;align-items:stretch}
.perf-l{display:flex;flex-direction:column;gap:.8vw;min-width:0}
.dom{flex:1;border:1px solid var(--hair);border-radius:14px;background:#fff;padding:.85vw 1.15vw;display:flex;flex-direction:column;justify-content:center;gap:.55vw}
.dom-h{display:flex;align-items:center;gap:.6vw}
.dom-h .material-symbols-outlined{font-size:1.05vw;color:var(--accent)}
.dom-h b{color:var(--ink);font-size:.92vw;font-weight:800;white-space:nowrap}
.dom-h:after{content:"";flex:1;height:1px;background:var(--hair)}
.dom-item{display:flex;align-items:baseline;gap:.6vw;flex-wrap:wrap}
.dom-item>b{color:var(--ink);font-size:.85vw;font-weight:800;white-space:nowrap}
.dom-item>b .hl{color:var(--accent)}
.dom-ms{color:var(--body);font-size:.75vw;line-height:1.6;word-break:keep-all}
.dom-ms i{font-style:normal;color:#c3ccda;margin:0 .3vw}

/* 우측 — 성과지표 게이지 패널 */
.kpanel{border:1px solid var(--hair);border-radius:14px;background:#f7f9fc;padding:1vw 1.15vw;display:flex;flex-direction:column;justify-content:space-between;gap:.65vw}
.kpanel .block-label{margin-bottom:0}
.kg{display:flex;flex-direction:column;gap:.3vw}
.kg-head{display:flex;justify-content:space-between;align-items:baseline;gap:.6vw}
.kg-head b{color:var(--ink);font-size:.8vw;font-weight:700}
.kg-head b small{color:var(--muted);font-weight:600;font-size:.66vw;margin-left:.35vw}
.kg-val{font-size:.74vw;font-weight:800;color:var(--accent);white-space:nowrap}
.kg-val.full{color:#047857}
.kg-bar{position:relative;height:.85vw;border-radius:6px;background:#e9edf5;overflow:hidden}
.kg-fill{position:absolute;top:0;bottom:0;left:0;border-radius:6px;background:linear-gradient(90deg,#1d4ed8,#3b82f6)}
.kg-fill.full{background:linear-gradient(90deg,#047857,#10b981)}
.kg-bar.wip{background:repeating-linear-gradient(-45deg,#cfdff9 0 .5vw,#e9f1fd .5vw 1vw);background-size:1.42vw 100%;animation:crawl 1.1s linear infinite}
@keyframes crawl{to{background-position:1.42vw 0}}
.kg-note{color:var(--muted);font-size:.66vw;line-height:1.5}
.srcline{color:var(--muted);font-size:.7vw;line-height:1.6}

/* ── 3차년도 성과지표 표 ── */
.tblwrap{flex:1;min-height:0;border:1px solid var(--hair);border-radius:14px;overflow:hidden;background:#fff;box-shadow:0 6px 20px rgba(11,21,38,.04)}
.tbl{width:100%;height:100%;border-collapse:collapse;table-layout:fixed}
.tbl th{background:var(--accent);color:#fff;font-size:.74vw;font-weight:700;padding:.4vw .7vw;text-align:left;letter-spacing:.01em}
.tbl th.c,.tbl td.c{text-align:center}
.tbl td{font-size:.74vw;color:var(--body);padding:.28vw .7vw;border-top:1px solid var(--hair);line-height:1.4;word-break:keep-all}
.tbl td b{color:var(--ink);font-weight:700}
.tbl td .pre{color:var(--muted);font-size:.64vw;font-weight:700;margin-right:.4vw}
.tbl tr.grp td{background:var(--tint);color:#1d4ed8;font-size:.74vw;font-weight:800;padding:.32vw .7vw;border-top:1px solid var(--tint-line)}
.tbl td.num{text-align:center;font-variant-numeric:tabular-nums}
.tbl td.num.goal{color:var(--accent);font-weight:800}
.tbl td.num.carry{color:#b45309;font-weight:700}
.tbl td.dim{color:#b6c2d6;text-align:center}
.tbl td.scope{color:var(--muted);font-size:.68vw}

/* ── 3차년도 추진현황 — 사진 타일 5 ── */
.ptgrid{flex:1;min-height:0;display:grid;grid-template-columns:repeat(6,1fr);grid-template-rows:1fr 1fr;gap:.9vw}
.pt{border:1px solid var(--hair);border-radius:14px;overflow:hidden;background:#fff;display:flex;flex-direction:column;box-shadow:0 6px 20px rgba(11,21,38,.05);min-height:0}
.pt.w2{grid-column:span 2}
.pt.w3{grid-column:span 3}
.pt-img{position:relative;flex:1;min-height:0;background:var(--chip)}
.pt-img img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.pt-ph{position:absolute;inset:.45vw;border:2px dashed #c7d2e3;border-radius:10px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.25vw;color:#94a3b8;text-align:center;padding:.5vw}
.pt-ph .material-symbols-outlined{font-size:1.7vw}
.pt-ph b{font-size:.72vw;font-weight:700;color:var(--muted)}
.pt-ph small{font-size:.64vw;line-height:1.5;color:var(--muted)}
.pt-cap{padding:.5vw .85vw .6vw;display:flex;flex-direction:column;gap:.22vw;flex-shrink:0}
.pt-cap-line{display:flex;align-items:center;gap:.5vw;flex-wrap:wrap}
.pt-cap-line b{color:var(--ink);font-size:.84vw;font-weight:800;white-space:nowrap}
.pt-cap small{color:var(--body);font-size:.7vw;line-height:1.5;word-break:keep-all}

/* ── 감사합니다 ── */
.thanks-inner{text-align:center;position:relative;z-index:1;align-self:center}
.thanks-inner img{height:2.4vw;margin-bottom:2.6vw;opacity:.95}
.thanks-title{color:#fff;font-size:3.1vw;font-weight:800;letter-spacing:-.01em;margin-bottom:1.3vw}
.thanks-tagline{color:var(--accent-soft);font-size:1.05vw;font-weight:300;line-height:1.8}

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
.slide.active .cover-meta{animation:rise .65s cubic-bezier(.2,.6,.2,1) .44s both}
.slide.active .thanks-inner{animation:rise .8s cubic-bezier(.2,.6,.2,1) both}
.slide.active .cs-head{animation:rise .5s cubic-bezier(.2,.6,.2,1) both}
.slide.active .cs-title{animation:rise .55s cubic-bezier(.2,.6,.2,1) .08s both}
.slide.active .lede{animation:rise .6s cubic-bezier(.2,.6,.2,1) .14s both}
.slide.active .area>*{animation:rise .6s cubic-bezier(.2,.6,.2,1) both}
.slide.active .area>:nth-child(1){animation-delay:.2s}
.slide.active .area>:nth-child(2){animation-delay:.32s}
.slide.active .area>:nth-child(3){animation-delay:.44s}
.slide.active .area>:nth-child(4){animation-delay:.56s}
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
  fill,
}: {
  no: string
  sec: string
  title: ReactNode
  lede?: ReactNode
  children: ReactNode
  fill?: boolean
}) {
  return (
    <div className="cs">
      <div className="cs-body">
        <div className="cs-head">
          {no && <span className="cs-no">{no}</span>}
          <span className="cs-sec">{sec}</span>
          <span className="cs-hair" />
        </div>
        <h2 className="cs-title">{title}</h2>
        {lede && <p className="lede">{lede}</p>}
        <div className={`area${fill ? ' fill' : ''}`}>{children}</div>
      </div>
    </div>
  )
}

/* ── 간트 세그먼트 — l/w 는 2025.01~2027.12(36개월) 구간의 % ── */
type Seg = { l: number; w: number; t: string; tone: 'plan' | 'build' | 'run' | 'float' }

function GanttRow({ b, s, segs }: { b: string; s?: string; segs: Seg[] }) {
  return (
    <div className="g-row">
      <div className="g-lab">
        <b>{b}</b>
        {s && <small>{s}</small>}
      </div>
      <div className="g-track">
        {segs.map((g) => (
          <span key={g.t + g.l} className={`g-seg ${g.tone}`} style={{ left: `${g.l}%`, width: `${g.w}%` }}>
            {g.t}
          </span>
        ))}
      </div>
    </div>
  )
}

/* ── 사진 타일 — /images/260730_midterm/{file} 을 넣으면 자동 표시, 없으면 점선 플레이스홀더 ── */
function PhotoTile({
  w,
  file,
  name,
  tag,
  tagTone,
  status,
  suggest,
}: {
  w: 2 | 3
  file: string
  name: string
  tag: string
  tagTone: 'blue' | 'green' | 'amber'
  status: ReactNode
  suggest: string
}) {
  const src = `/images/260730_midterm/${file}`
  const [ok, setOk] = useState(false)
  // 하이드레이션 전 404는 img onError를 놓치므로 클라이언트 프리로드로 확인 (demo-v2 방식)
  useEffect(() => {
    const im = new window.Image()
    im.onload = () => setOk(true)
    im.src = src
  }, [src])
  return (
    <div className={`pt w${w}`}>
      <div className="pt-img">
        {ok ? (
          <img src={src} alt={`${name} 현장 사진`} />
        ) : (
          <div className="pt-ph">
            <span className="material-symbols-outlined">add_photo_alternate</span>
            <b>{suggest}</b>
            <small>{file}</small>
          </div>
        )}
      </div>
      <div className="pt-cap">
        <div className="pt-cap-line">
          <b>{name}</b>
          <span className={`tag ${tagTone} live`}>
            <i />
            {tag}
          </span>
        </div>
        <small>{status}</small>
      </div>
    </div>
  )
}

/* ── 2차년도 성과 도메인 블록 ── */
function Dom({
  ic,
  t,
  children,
}: {
  ic: string
  t: string
  children: ReactNode
}) {
  return (
    <div className="dom">
      <div className="dom-h">
        <span className="material-symbols-outlined">{ic}</span>
        <b>{t}</b>
      </div>
      {children}
    </div>
  )
}

/* ── 성과지표 게이지 (2차년도 실적) ── */
function Gauge({
  b,
  s,
  pct,
  val,
  note,
  wip,
}: {
  b: string
  s: string
  pct?: number
  val?: string
  note?: string
  /** 유찰 등 — 수치 주장 없이 '재추진 준비 중' 스트라이프 */
  wip?: string
}) {
  const full = pct === 100
  return (
    <div className="kg">
      <div className="kg-head">
        <b>
          {b}
          <small>{s}</small>
        </b>
        {wip ? <span className="kg-val" style={{ color: '#b45309' }}>{wip}</span> : <span className={`kg-val${full ? ' full' : ''}`}>{val}</span>}
      </div>
      <div className={`kg-bar${wip ? ' wip' : ''}`}>
        {!wip && <span className={`kg-fill${full ? ' full' : ''}`} style={{ width: `${pct}%` }} />}
      </div>
      {note && <div className="kg-note">{note}</div>}
    </div>
  )
}

/* ─────────────────────────── 3차년도 성과지표 표 데이터 (원본 9p 그대로) ─────────────────────────── */

type IndRow = {
  pre?: string
  name: string
  org: string
  unit: string
  carry: string
  goal: string
  scope: string
}
type IndGroup = { g: string; rows: IndRow[] }

const IND: IndGroup[] = [
  {
    g: '신재생에너지 인프라 조성 — 1) 신재생에너지 인프라 구축',
    rows: [
      { name: '연료전지발전', org: '롯데SK에너루트', unit: 'MW', carry: '', goal: '19.8', scope: '발전시설의 설치 여부' },
      { name: '태양광발전 (자가소비형)', org: '에스에너지', unit: 'MW', carry: '0.32', goal: '', scope: '발전시설의 설치 여부' },
      { name: '태양광발전 (전력거래형)', org: '에스에너지', unit: 'MW', carry: '0.57', goal: '2.1', scope: '발전시설의 설치 여부' },
    ],
  },
  {
    g: '통합 에너지관리 시스템 구축',
    rows: [
      { pre: '5)', name: 'ESG 에너지 플랫폼 구축률', org: '알엠에쓰플렛폼', unit: '%', carry: '', goal: '30', scope: 'WBS 계획 대비 공정률' },
      { pre: '6)', name: '모집 수용가 플랫폼 누적 이용률', org: '알엠에쓰플렛폼', unit: '%', carry: '', goal: '30', scope: '플랫폼 가입률' },
      { pre: '7)', name: '데이터 수집 인프라 구축률', org: '아이티공간', unit: '%', carry: '', goal: '35', scope: '목표구축률(%) 대비 달성률' },
    ],
  },
  {
    g: '탄소저감 지원',
    rows: [
      { pre: '8)', name: '온실가스 감축량 — 연료전지발전', org: '롯데SK에너루트', unit: 'tCO₂eq.', carry: '', goal: '79,196', scope: '발전시설의 설치 여부' },
      { pre: '8)', name: '온실가스 감축량 — 태양광발전', org: '에스에너지', unit: 'tCO₂eq.', carry: '532', goal: '1,246', scope: '발전시설의 설치 여부' },
      { pre: '8)', name: '온실가스 감축량 — 신재생 연계 생산', org: '울산미포ORC발전', unit: 'tCO₂eq.', carry: '', goal: '5,040', scope: '발전시설의 설치 여부' },
      { pre: '9)', name: '통합 에너지 컨설팅', org: '전문기관용역', unit: '건', carry: '', goal: '10', scope: '컨설팅 수행 여부' },
      { pre: '9)', name: '성과 홍보', org: '울산테크노파크', unit: '건', carry: '', goal: '2', scope: '홍보활동 수행 여부' },
      { pre: '9)', name: '신재생에너지 확대', org: '울산EID센터', unit: '건', carry: '', goal: '', scope: '규제 샌드박스 추진 여부' },
      { pre: '9)', name: '탄소중립형 모델 개발', org: '울산EID센터', unit: '건', carry: '', goal: '1', scope: '사업모델 개발 여부' },
      { pre: '10)', name: '연료전지 발전배열 활용', org: '울산미포ORC발전', unit: 'MW', carry: '', goal: '1.8', scope: '발전시설의 설치 여부' },
      { pre: '10)', name: '재생에너지 생산 전력 활용', org: '에스에너지', unit: 'MWh', carry: '43', goal: '2,885', scope: '생산전력의 사용 여부' },
      { pre: '10)', name: 'ESS 시스템 (PCS)', org: '울산테크노파크', unit: 'kW', carry: '', goal: '', scope: '시스템 설치 여부' },
      { pre: '10)', name: 'ESS 시스템 (Battery)', org: '울산테크노파크', unit: 'kWh', carry: '90', goal: '180', scope: '시스템 설치 여부' },
      { pre: '10)', name: '양방향 EV 충전기', org: '울산테크노파크', unit: '대', carry: '4', goal: '2', scope: '충전기 설치 여부' },
    ],
  },
]

/* ─────────────────────────── 슬라이드 (목차 없음 — 사용자 지정 4페이지 구성) ─────────────────────────── */

const SLIDES: ReactNode[] = [
  /* ── 표지 ── */
  <div className="dark-stage" key="cover">
    <p className="cover-eyebrow">Ulsan-Mipo Energy Independence</p>
    <h1 className="cover-title">
      3차년도 중간점검
      <br />
      추진실적 보고
    </h1>
    <p className="cover-sub">
      울산미포국가산단 <b>에너지 자급자족 인프라 구축 및 운영사업</b>
      <br />
      ’26년 6월 말 기준 사업추진 실적 · 성과지표 목표달성 방안
    </p>
    <div className="cover-meta">
      <img src="/images/rmsplatform-logo-white.png" alt="RMS PLATFORM" />
      <i />
      <span>2026. 07. 30</span>
    </div>
  </div>,

  /* ── 01 추진일정 (원본 4p — 로드맵 + 인프라별 간트) ── */
  <ContentSlide
    key="p1"
    no="01"
    sec="추진일정"
    title={
      <>
        일부 인프라 구축 완료 — <span className="hl">3차년도 운영 및 플랫폼 연계</span> 진행 중
      </>
    }
    lede={
      <>
        분석 · 설계 단계 완료 후 구축 단계를 진행하고 있습니다. 연료전지 · 태양광은 일부 구축을 완료하고 시운전 중이며,
        구축된 인프라의 <b>운영 및 플랫폼 연계</b>를 3차년도에 추진합니다.
      </>
    }
    fill
  >
    {/* 연차 로드맵 — 신재생에너지 자급자족 및 탄소중립 산업단지 실현 */}
    <div className="rmrow">
      <div className="rmcol">
        <div className="step-line">
          <span className="step-dot fill" />
          <span className="step-no">1차년도 · 2024</span>
        </div>
        <div className="rm done">
          <div className="rm-t">구축 기반 마련</div>
          <p className="rm-d">분석 &amp; 검토 &amp; 협의 등 인프라 구축 기반 마련</p>
        </div>
      </div>
      <div className="rmcol">
        <div className="step-line">
          <span className="step-dot fill" />
          <span className="step-no">2차년도 · 2025</span>
        </div>
        <div className="rm done">
          <div className="rm-t">설계 및 구축</div>
          <p className="rm-d">산단 내 예정부지 대상 인프라 설계 및 구축</p>
        </div>
      </div>
      <div className="rmcol">
        <div className="step-line">
          <span className="step-dot fill" />
          <span className="step-no">3차년도 · 2026</span>
        </div>
        <div className="rm cur">
          <div className="rm-t">
            운영 및 플랫폼 연계
            <span className="tag blue live">
              <i />
              진행 중
            </span>
          </div>
          <p className="rm-d">에너지 자급자족 인프라 운영 및 플랫폼 연계</p>
        </div>
      </div>
      <div className="rmcol">
        <div className="step-line">
          <span className="step-dot" />
          <span className="step-no">4차년도 · 2027~</span>
        </div>
        <div className="rm">
          <div className="rm-t">고도화 · 지속</div>
          <p className="rm-d">인프라 운영 및 특화모델 발굴, 플랫폼 고도화</p>
        </div>
      </div>
    </div>

    {/* 인프라별 추진 간트 — 2차년도(2025)~4차년도(2027) */}
    <div className="gantt">
      <div className="g-years">
        <span>
          2차년도<small>2025</small>
        </span>
        <span className="cur">
          3차년도<small>2026</small>
        </span>
        <span>
          4차년도<small>2027</small>
        </span>
      </div>
      <div className="g-bodywrap">
        <span className="g-now" />
        <div>
          <div className="g-grp-t">
            <b>신재생에너지 인프라</b>
          </div>
          <GanttRow
            b="연료전지 발전"
            s="RPS형 · 울산하이드로젠파워 1호"
            segs={[
              { l: 0, w: 43, t: '설치 및 시운전', tone: 'build' },
              { l: 44, w: 56, t: '상업운전', tone: 'run' },
            ]}
          />
          <GanttRow
            b="연료전지 발전"
            s="CHPS형 · 울산하이드로젠파워 3호"
            segs={[
              { l: 22, w: 42, t: '설치 및 시운전', tone: 'build' },
              { l: 65, w: 35, t: '상업운전', tone: 'run' },
            ]}
          />
          <GanttRow
            b="태양광 발전"
            s="자가소비형 · 전력거래형"
            segs={[
              { l: 0, w: 25, t: '대상지 선정 & 설계', tone: 'plan' },
              { l: 26, w: 15, t: '구축(1차)', tone: 'build' },
              { l: 45, w: 26, t: '구축(2차모집대상)', tone: 'build' },
              { l: 72, w: 28, t: '운영', tone: 'run' },
              { l: 80, w: 18, t: '구축(3차)', tone: 'float' },
            ]}
          />
        </div>
        <div>
          <div className="g-grp-t">
            <b>통합에너지 관리 시스템</b>
          </div>
          <GanttRow
            b="ESG 에너지 플랫폼"
            segs={[
              { l: 0, w: 25, t: '분석 & 설계', tone: 'plan' },
              { l: 26, w: 31, t: '구축(개발)', tone: 'build' },
              { l: 58, w: 42, t: '운영 및 고도화', tone: 'run' },
            ]}
          />
        </div>
        <div>
          <div className="g-grp-t">
            <b>신재생인프라 연계 탄소중립 지원</b>
          </div>
          <GanttRow
            b="ORC 발전"
            s="연료전지 발전배열 활용"
            segs={[
              { l: 0, w: 33, t: '제조사 선정 & 발주 및 제작', tone: 'plan' },
              { l: 34, w: 30, t: '구축 및 시운전', tone: 'build' },
              { l: 65, w: 35, t: '상업운전', tone: 'run' },
            ]}
          />
          <GanttRow
            b="양방향 EV충전"
            s="V2G · ESS"
            segs={[
              { l: 0, w: 12, t: '분석 & 검토', tone: 'plan' },
              { l: 13, w: 10, t: '설계', tone: 'plan' },
              { l: 24, w: 29, t: '구축', tone: 'build' },
              { l: 56, w: 16, t: '구축(증설)', tone: 'build' },
              { l: 73, w: 27, t: '운영', tone: 'run' },
            ]}
          />
        </div>
      </div>
      <div className="g-legend">
        <span>
          <i className="plan" />
          분석 · 설계
        </span>
        <span>
          <i className="build" />
          구축 · 시운전
        </span>
        <span>
          <i className="run" />
          운영 · 상업운전
        </span>
      </div>
    </div>
  </ContentSlide>,

  /* ── 02 2차년도 추진성과 (원본 5~7p) + 성과지표 검토 (원본 8p) ── */
  <ContentSlide
    key="p2"
    no="02"
    sec="2차년도 추진성과 · 성과지표 검토"
    title={
      <>
        2차년도 추진성과 — 대부분 지표 <span className="hl">목표 대비 100% 달성</span>
      </>
    }
    lede={
      <>
        연료전지 <b>19.8MW</b> · 태양광 <b>0.91MW</b> 구축을 완료하고 플랫폼 개발 · 상황실 구축 등 계획된 일정에 따라
        추진했습니다. 일부 이월 지표는 <b>집중관리를 통한 이월 목표 달성</b>을 준비하고 있습니다.
      </>
    }
    fill
  >
    <div className="perf">
      {/* 좌 2/3 — 원본 5 · 6 · 7p 세 영역 */}
      <div className="perf-l">
        <Dom ic="solar_power" t="신재생에너지 인프라 조성">
          <div className="dom-item">
            <b>
              연료전지 <span className="hl">19.8MW</span> 구축 완료 — 시운전 진입
            </b>
            <span className="tag blue">
              <i />
              RPS형 1호 · CHPS형 3호
            </span>
          </div>
          <p className="dom-ms">
            연료전지동 설치 · 연료전지 입고 완료(’25.10)<i>·</i>시운전 시작(’25.10)<i>·</i>송전선로 공사 완료(’25.11)
            <i>·</i>CHPS형 연료전지동 구축 공사 진행(’25.11)
          </p>
          <div className="dom-item">
            <b>
              태양광 <span className="hl">0.91MW</span> 구축 완료 — 수요기업 모집 · 공사 지속
            </b>
            <span className="tag blue">
              <i />
              자가소비 5개 · 자가소비+PPA 1개
            </span>
          </div>
          <p className="dom-ms">
            5개 업체 계약 완료(’25.06)<i>·</i>현장검토 및 설계 완료 — 총 0.91MW(’25.10)<i>·</i>착공(’25.11)
          </p>
        </Dom>
        <Dom ic="monitoring" t="통합 에너지관리 시스템">
          <div className="dom-item">
            <b>ESG 에너지 플랫폼 — 설계 완료 후 개발 단계 진입, 모듈별 선개발</b>
            <span className="tag green">
              <i />
              상황실 구축 완료
            </span>
          </div>
          <p className="dom-ms">
            정보구조도 · 메뉴구조도 설계(’25.04~06)<i>·</i>화면 디자인 및 퍼블리싱(’25.09)<i>·</i>플랫폼 개발
            구축(’25.10~11)<i>·</i>상황실 · 서버 현장 구축 완료(’25.11)
          </p>
        </Dom>
        <Dom ic="co2" t="탄소저감 지원">
          <div className="dom-item">
            <b>ORC 발전시설 — 3차년도 운영 목표로 구축 진행 중</b>
            <span className="tag blue">
              <i />
              모듈 FAT 완료
            </span>
          </div>
          <p className="dom-ms">
            특수목적법인 설립(’25.02~04)<i>·</i>기본 · 상세설계(’25.01~12)<i>·</i>ORC 모듈 FAT(’25.11)<i>·</i>
            수요기업 발굴 및 계약 진행(’25.03~12)
          </p>
          <div className="dom-item">
            <b>양방향 EV충전(V2G) — 유찰에 따라 ’26년 재추진 준비 중</b>
            <span className="tag amber">
              <i />
              PCS 납품 완료
            </span>
          </div>
          <p className="dom-ms">
            기본 · 실시설계(’25.06)<i>·</i>장비심의 · 실시설계 준공 및 보완 완료(’25.09)<i>·</i>PCS 구매 및 납품
            완료(’25.12)
          </p>
        </Dom>
      </div>

      {/* 우 1/3 — 원본 8p 성과지표 달성률 */}
      <div className="kpanel">
        <div className="block-label">
          <b>성과지표 검토 (2차년도)</b>
        </div>
        <Gauge b="연료전지발전" s="롯데SK에너루트" pct={100} val="19.8 / 19.8 MW · 100%" />
        <Gauge
          b="태양광 · 자가소비형"
          s="에스에너지"
          pct={64}
          val="0.58 / 0.9 MW · 64%"
          note="목표 이월 — 수용가 발굴 추진"
        />
        <Gauge
          b="태양광 · 전력거래형"
          s="에스에너지"
          pct={37}
          val="0.33 / 0.9 MW · 37%"
          note="목표 이월 — 수용가 발굴 추진"
        />
        <Gauge b="ESG 에너지 플랫폼 구축률" s="알엠에쓰플렛폼" pct={100} val="35 / 35% · 100%" />
        <Gauge
          b="양방향 EV 충전기"
          s="울산테크노파크"
          wip="’26년 재추진"
          note="유찰에 따른 목표 이월(4대) — 재추진 준비 중"
        />
        <p className="srcline">실적 ’25.12 기준 · 이월 지표는 3차년도 목표와 연계 달성</p>
      </div>
    </div>
  </ContentSlide>,

  /* ── 03 성과지표 검토 (3차년도 — 원본 9p) ── */
  <ContentSlide
    key="p3"
    no="03"
    sec="3차년도 성과지표"
    title={
      <>
        3차년도 성과지표 — <span className="hl">이월 목표 연계</span> 연내 달성 추진
      </>
    }
    lede={
      <>
        사업계획에 따른 주요 과업을 정상 추진하고 있습니다. 2차년도 이월 목표는 3차년도 목표와 연계하여{' '}
        <b>추진일정 관리를 통해 연내 달성</b>을 추진합니다.
      </>
    }
    fill
  >
    <div className="tblwrap">
      <table className="tbl">
        <colgroup>
          <col style={{ width: '31%' }} />
          <col style={{ width: '14%' }} />
          <col style={{ width: '8%' }} />
          <col style={{ width: '10%' }} />
          <col style={{ width: '12%' }} />
          <col style={{ width: '25%' }} />
        </colgroup>
        <thead>
          <tr>
            <th>성과지표</th>
            <th>수행기관</th>
            <th className="c">단위</th>
            <th className="c">이월 목표</th>
            <th className="c">3차년도 목표</th>
            <th>비고 (성과 범위)</th>
          </tr>
        </thead>
        <tbody>
          {IND.map((grp) => (
            <Fragment key={grp.g}>
              <tr className="grp">
                <td colSpan={6}>{grp.g}</td>
              </tr>
              {grp.rows.map((r) => (
                <tr key={grp.g + r.name}>
                  <td>
                    {r.pre && <span className="pre">{r.pre}</span>}
                    <b>{r.name}</b>
                  </td>
                  <td>{r.org}</td>
                  <td className="c">{r.unit}</td>
                  {r.carry ? <td className="num carry">{r.carry}</td> : <td className="dim">–</td>}
                  {r.goal ? <td className="num goal">{r.goal}</td> : <td className="dim">–</td>}
                  <td className="scope">{r.scope}</td>
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  </ContentSlide>,

  /* ── 04 3차년도 추진현황 — 5개 인프라 사진 (원본 11~15p) ── */
  <ContentSlide
    key="p4"
    no="04"
    sec="3차년도 추진현황"
    title={
      <>
        3차년도 추진현황 — 5개 인프라 <span className="hl">구축 · 운영 진행 중</span>
      </>
    }
    lede={
      <>
        연료전지 RPS형은 <b>상업운전을 개시</b>했고 CHPS형 · ORC · V2G는 연내 구축을 목표로 진행 중입니다. 태양광
        신규 수용가 발굴과 플랫폼 개발도 병행하고 있습니다.
      </>
    }
    fill
  >
    <div className="ptgrid">
      <PhotoTile
        w={2}
        file="fuelcell.png"
        name="연료전지 발전"
        tag="상업운전 · 건설 중"
        tagTone="blue"
        status={
          <>
            RPS형 1호 상업운전 개시(’26.04) · REC 발급 — CHPS형 3호 8월 시운전 착수, <b>12월 상업운전</b> 예정
          </>
        }
        suggest="제안: 연료전지동 전경 · 설비 사진"
      />
      <PhotoTile
        w={2}
        file="solar.png"
        name="태양광 발전"
        tag="수용가 발굴 중"
        tagTone="blue"
        status={
          <>
            0.91MW 구축 완료 · 운영 — 잔여 <b>2.99MW</b> 확보 위한 신규 수요기업 발굴 · 사업성 검토(’26.06~)
          </>
        }
        suggest="제안: 수용가 지붕 태양광 설치 현장"
      />
      <PhotoTile
        w={2}
        file="orc.png"
        name="ORC 발전"
        tag="구축 중"
        tagTone="blue"
        status={
          <>
            모듈 운송 · 토목 · 철골 · Dry Cooler 설치 완료, 배관 자재 입고 중 — 1MW 상업운전 후 <b>1.8MW</b> 구축 완료
          </>
        }
        suggest="제안: ORC 발전시설 공사 현장"
      />
      <PhotoTile
        w={3}
        file="platform.png"
        name="통합에너지관리 시스템"
        tag="개발 추진 중"
        tagTone="blue"
        status={
          <>
            페르소나별 화면 기획 · 구성 — <b>RE100 이행관리 · ESG 성과관리</b> 등 주요 기능 기획 및 개발 추진
          </>
        }
        suggest="제안: ESG 에너지 플랫폼 화면 캡처"
      />
      <PhotoTile
        w={3}
        file="v2g.png"
        name="V2G · ESS 분산에너지 실증"
        tag="발주 추진"
        tagTone="amber"
        status={
          <>
            장비심의 완료(’26.07) · 조달공고 — 10~11월 <b>V2G 충전기 6기 · ESS</b> 설치, 12월 실증운영 개시
          </>
        }
        suggest="제안: 통합안전관리센터 설치 예정지"
      />
    </div>
  </ContentSlide>,

  /* ── 감사합니다 ── */
  <div className="dark-stage" key="thanks">
    <div className="thanks-inner">
      <img src="/images/rmsplatform-logo-white.png" alt="RMS PLATFORM" />
      <div className="thanks-title">감사합니다</div>
      <div className="thanks-tagline">
        Improving the quality of life and
        <br />
        creating a sustainable &amp; resilient society
      </div>
    </div>
  </div>,
]

/* ─────────────────────────── 플레이어 ─────────────────────────── */

export default function Page() {
  const [idx, setIdx] = useState(0)
  const slides = useMemo(() => SLIDES, [])
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
