'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// SPC 설립 시기 변경 신청 보고 — 2026.07.30  (에디토리얼 스타일)
// 원본 자료: "SPC 4차년도 시나리오v0.1.hwpx" · "SPC 4차년도 변경 사유 보고서.hwpx"
// 구성 원칙: 시나리오 5페이지 = 본문 슬라이드 5장, 순서·제목 1:1 그대로.
//   수치·문구는 두 원본에서 확인된 것만 사용(근거 없는 추정 금지).
// 디자인: 260730_demo-v2와 동일 — 페이지 로컬 CSS + 자체 플레이어(딥네이비 블롭
//   고정 배경 · 상단 진행바 · 하단 도트 네비 · 풀스크린 F · 목차 행 클릭 이동)
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
.cover-title{color:#fff;font-size:3.7vw;font-weight:900;letter-spacing:-.02em;line-height:1.18;margin-bottom:1.2vw;position:relative;z-index:1}
.cover-sub{color:rgba(191,209,238,.85);font-size:1.15vw;font-weight:300;line-height:1.8;margin-bottom:2.2vw;position:relative;z-index:1}
.cover-sub b{color:#fff;font-weight:600}
.cover-meta{display:flex;align-items:center;gap:1vw;color:rgba(148,168,200,.85);font-size:.9vw;position:relative;z-index:1}
.cover-meta img{height:1.5vw;opacity:1}
.cover-meta i{width:3px;height:3px;border-radius:50%;background:rgba(148,168,200,.5)}

/* ── 목차 (좌 네이비 패널 + 우 에디토리얼 리스트 — 행 클릭 시 해당 장으로 이동) ── */
.toc{display:flex}
.toc-left{width:35%;background:transparent;position:relative;overflow:hidden;display:flex;flex-direction:column;justify-content:center;padding:0 3.6vw}
.toc-left:before{content:"";position:absolute;left:-10vw;bottom:-14vw;width:30vw;height:30vw;border:1px solid rgba(127,168,232,.15);border-radius:50%}
.toc-eyebrow{color:var(--accent-soft);letter-spacing:.4em;text-transform:uppercase;font-size:.72vw;font-weight:600;margin-bottom:1.1vw}
.toc-title{color:#fff;font-size:2.7vw;font-weight:800;letter-spacing:-.01em;margin-bottom:1.2vw}
.toc-lead{color:rgba(191,209,238,.72);font-size:1vw;font-weight:300;line-height:1.8}
.toc-right{flex:1;background:var(--paper);display:flex;flex-direction:column;justify-content:center;padding:0 3.6vw}
.trow{display:flex;align-items:center;gap:1.6vw;padding:1.1vw .4vw;border-bottom:1px solid var(--hair);transition:background .2s;cursor:pointer}
.trow:first-child{border-top:1px solid var(--hair)}
.trow:hover{background:#f4f7fd}
.trow-no{color:#c3ccda;font-size:1.5vw;font-weight:300;letter-spacing:.02em;width:2.9vw;flex-shrink:0;transition:color .2s}
.trow:hover .trow-no{color:var(--accent)}
.trow-t{color:var(--ink);font-size:1.08vw;font-weight:700;margin-bottom:.22vw}
.trow-d{color:var(--muted);font-size:.85vw;line-height:1.5}

/* ── 본문 공통 ── */
.cs{background:var(--paper);display:flex;flex-direction:column}
.cs-body{flex:1;display:flex;flex-direction:column;padding:3% 6.5% 80px}
.cs-head{display:flex;align-items:center;gap:.9vw;margin-bottom:1.1vw}
.cs-no{color:var(--accent);font-size:.85vw;font-weight:800;letter-spacing:.14em}
.cs-sec{color:var(--muted);font-size:.85vw;font-weight:500}
.cs-hair{flex:1;height:1px;background:var(--hair)}
.cs-title{color:var(--ink);font-size:2.25vw;font-weight:800;letter-spacing:-.025em;line-height:1.28;margin-bottom:.7vw}
.cs-title .hl{color:var(--accent)}
.lede{color:var(--body);font-size:1vw;line-height:1.75;margin-bottom:1vw}
.lede b{color:var(--ink);font-weight:700}
.area{flex:1;display:flex;flex-direction:column;gap:1.1vw}
.area.fill{justify-content:space-between;gap:1.1vw}

/* ── 스텝 플로우 (점 + 라인) ── */
.flow{display:flex}
.step{flex:1;padding-right:1.2vw;position:relative}
.step-line{display:flex;align-items:center;gap:.55vw;margin-bottom:.55vw}
.step-dot{width:.52vw;height:.52vw;border-radius:50%;border:2px solid var(--accent);background:var(--paper);flex-shrink:0}
.step.final .step-dot{background:var(--accent)}
.step-no{color:var(--accent);font-size:.74vw;font-weight:800;letter-spacing:.1em}
.step-line:after{content:"";flex:1;height:1px;background:var(--hair)}
.step:last-child .step-line:after{display:none}
.step-name{color:var(--ink);font-size:1.08vw;font-weight:700;line-height:1.4;margin-bottom:.28vw}
.step.final .step-name{color:var(--accent)}
.step-sub{color:var(--muted);font-size:.85vw;line-height:1.68}

/* ── 블록 라벨 ── */
.block-label{display:flex;align-items:center;gap:.9vw;margin-bottom:.55vw}
.block-label b{color:var(--ink);font-size:.97vw;font-weight:700;white-space:nowrap}
.block-label:after{content:"";flex:1;height:1px;background:var(--hair)}

/* ── 태그 ── */
.tag{display:inline-flex;align-items:center;gap:.38vw;border:1px solid var(--hair);border-radius:999px;padding:.16vw .75vw;font-size:.74vw;font-weight:600;color:var(--muted);background:#fff}
.tag i{width:.38vw;height:.38vw;border-radius:50%;display:inline-block}
.tag.blue{color:#1d4ed8;border-color:#bfdbfe}.tag.blue i{background:#2563eb}
.tag.gray i{background:#94a3b8}
.tag.live i{animation:livepulse 1.6s ease-in-out infinite}
@keyframes livepulse{0%,100%{opacity:.4}50%{opacity:1}}

/* ── 시기 이동 도식 (당초 → 변경) ── */
.shift{display:grid;grid-template-columns:1fr auto 1fr;gap:1.4vw;align-items:stretch;flex:1;min-height:0}
.shift-card{border-radius:18px;padding:1.6vw 1.4vw;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.5vw;text-align:center}
.shift-card.was{border:2px dashed #cbd5e1;background:#f8fafc}
.shift-card.now{border:1.5px solid #b9d2f8;background:linear-gradient(180deg,#ffffff 0%,#f7faff 100%);box-shadow:0 10px 30px rgba(37,99,235,.12)}
.shift-tag{display:inline-flex;align-items:center;gap:.4vw;border-radius:999px;padding:.24vw .95vw;font-size:.78vw;font-weight:800}
.shift-card.was .shift-tag{background:#eef1f7;color:#64748b}
.shift-card.now .shift-tag{background:linear-gradient(135deg,#1d4ed8,#3b82f6);color:#fff;box-shadow:0 5px 14px rgba(29,78,216,.3)}
.shift-yr{font-size:2.5vw;font-weight:900;letter-spacing:-.03em;color:#64748b;line-height:1.15}
.shift-card.now .shift-yr{color:var(--accent)}
.shift-yr small{display:block;font-size:1vw;font-weight:700;letter-spacing:0;margin-top:.25vw;color:var(--muted)}
.shift-card.now .shift-yr small{color:var(--ink)}
.shift-d{color:var(--muted);font-size:.84vw;line-height:1.6}
.shift-hr{width:62%;height:1px;background:var(--hair);margin:.55vw 0}
.shift-card.was .shift-hr{background:#dde3ec}
.shift-li{display:flex;align-items:center;gap:.5vw;color:var(--body);font-size:.85vw;font-weight:600;line-height:1.5;word-break:keep-all}
.shift-li .material-symbols-outlined{font-size:1.02vw;color:#94a3b8;flex-shrink:0}
.shift-card.now .shift-li .material-symbols-outlined{color:var(--accent)}
.shift-mid{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.35vw;color:var(--accent)}
.shift-mid .material-symbols-outlined{font-size:2.1vw;animation:nudge 1.8s ease-in-out infinite}
@keyframes nudge{0%,100%{transform:translateX(0)}50%{transform:translateX(.4vw)}}
.shift-mid b{font-size:.8vw;font-weight:800;color:var(--accent);white-space:nowrap}

/* ── 무변경 스트립 (협약 핵심 목표 유지) ── */
.keep{background:var(--card);border:1px solid var(--hair);border-radius:14px;padding:.95vw 1.4vw;display:flex;align-items:center;gap:1vw}
.keep-ic{width:2.4vw;height:2.4vw;border-radius:50%;background:#e7f6ee;color:#0f9d58;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.keep-ic .material-symbols-outlined{font-size:1.25vw}
.keep>b{color:var(--ink);font-size:.95vw;font-weight:800;white-space:nowrap}
.keep p{color:var(--body);font-size:.88vw;line-height:1.65;word-break:keep-all}
.keep p b{color:var(--ink);font-weight:700}
.keep-ic.blue{background:var(--tint);color:var(--accent)}
.keep-items{display:flex;gap:.55vw;flex-wrap:wrap;margin-left:auto;flex-shrink:0}
.keep-items span{background:var(--tint);border:1px solid var(--tint-line);color:#1d4ed8;font-size:.8vw;font-weight:700;border-radius:999px;padding:.26vw .95vw}

/* ── 사유 3단 (고스트 숫자 + 헤어라인) — 컬럼이 본문 높이를 채우고 내용은 세로 중앙 ── */
.qrow{display:grid;grid-template-columns:repeat(3,1fr);flex:1;min-height:0}
.qcol{position:relative;padding:1.6vw 1.8vw 1.4vw;display:flex;flex-direction:column;gap:.9vw;justify-content:center}
.qcol+.qcol{border-left:1px solid var(--hair)}
.q-ghost{position:absolute;top:0;right:1.2vw;font-size:5.2vw;font-weight:900;line-height:1;letter-spacing:-.04em;user-select:none;background:linear-gradient(180deg,#b9cff0 0%,#e2ecfb 85%);-webkit-background-clip:text;background-clip:text;color:transparent}
.q-chip{width:2.6vw;height:2.6vw;border-radius:50%;background:var(--tint);color:var(--accent);display:flex;align-items:center;justify-content:center;position:relative;z-index:1}
.q-chip .material-symbols-outlined{font-size:1.3vw}
.q-text{position:relative;z-index:1;font-size:1.18vw;font-weight:800;color:var(--ink);line-height:1.5;letter-spacing:-.015em}
.q-text .hl{color:var(--accent)}
.q-cap{display:block;font-size:.85vw;color:var(--body);font-weight:500;margin-top:.5vw;line-height:1.7;letter-spacing:0;word-break:keep-all}

/* ── 실적 게이지 패널 (목표 대비 실적 — 막대 하나에 통합) ── */
.panel{background:#f7f9fc;border:1px solid var(--hair);border-radius:14px;padding:1vw 1.3vw .9vw}
.panel .block-label{margin-bottom:.8vw}
.mrows{display:flex;flex-direction:column;gap:.85vw}
.mrow{display:grid;grid-template-columns:12.5vw 1fr 14.5vw;gap:1.1vw;align-items:center}
.mrow-l b{display:block;color:var(--ink);font-size:.88vw;font-weight:700}
.mrow-l small{display:block;color:var(--muted);font-size:.72vw;margin-top:.08vw}
/* 트랙 길이 = 목표 물량(MW) 동일 축 — 3차년도 2.1MW가 기존 0.9MW보다 큰 물량임이 보인다 */
.mtrack-wrap{display:flex;align-items:center;gap:.6vw;min-width:0}
.mtrack{position:relative;height:1.15vw;border-radius:999px;background:#e9edf5;overflow:hidden;flex-shrink:0}
.mfill{position:absolute;top:0;bottom:0;left:0;border-radius:999px;background:linear-gradient(90deg,#93c5fd,#60a5fa)}
.mfill.acc{background:linear-gradient(90deg,#1d4ed8,#3b82f6)}
/* 준비 중 — 진행률 주장 없이 "작업 중" 상태를 움직이는 스트라이프로 */
.mfill.prep{width:100%;background:repeating-linear-gradient(-45deg,#bfd7f8 0 .5vw,#e6effc .5vw 1vw);background-size:1.42vw 100%;animation:crawl 1.1s linear infinite}
@keyframes crawl{to{background-position:1.42vw 0}}
.mgoal{color:var(--muted);font-size:.72vw;font-weight:600;white-space:nowrap}
.mrow-v{text-align:right;font-size:.84vw;color:var(--body);font-variant-numeric:tabular-nums}
.mrow-v b{color:var(--ink);font-weight:800}
.mrow-v .pct{color:var(--accent);font-weight:800}
.mrow-v .prep-t{color:var(--accent);font-weight:800}
.srcline{color:var(--muted);font-size:.74vw;line-height:1.6;margin-top:.6vw}

/* ── 영향 카드 2단 — 카드가 남는 높이를 채우고 내용은 세로 중앙 ── */
.imp{display:grid;grid-template-columns:1fr 1fr;gap:1.1vw;flex:1;min-height:0;align-items:stretch}
.imp-card{background:#fff;border:1px solid var(--hair);border-radius:14px;padding:1.2vw 1.4vw;display:flex;flex-direction:column;gap:.8vw;justify-content:center}
.imp-h{display:flex;align-items:center;gap:.55vw;font-size:.98vw;font-weight:800;color:var(--ink)}
.imp-h .material-symbols-outlined{font-size:1.15vw;color:var(--accent)}
.imp-h .tag{margin-left:auto}
.fx{display:flex;flex-direction:column;gap:.45vw}
.fx-row{display:flex;align-items:flex-start;gap:.6vw;background:var(--chip);border:1px solid var(--hair);border-radius:10px;padding:.65vw .95vw}
.fx-row .material-symbols-outlined{font-size:1.05vw;color:#10b981;flex-shrink:0;margin-top:.1vw}
.fx-row span:last-child{font-size:.87vw;color:var(--ink);font-weight:600;line-height:1.55;word-break:keep-all}

/* ── 정상화 계획 타일 — 타일이 남는 높이를 채우고 내용은 세로 중앙 ── */
.press{display:grid;grid-template-columns:repeat(3,1fr);gap:.9vw;flex:1;min-height:0;align-items:stretch}
.press-card{background:#fff;border:1px solid var(--hair);border-radius:14px;padding:1.3vw 1.2vw;display:flex;flex-direction:column;justify-content:center}
.press-ic{width:2.6vw;height:2.6vw;border-radius:50%;margin-bottom:.6vw;display:flex;align-items:center;justify-content:center;background:var(--tint);color:var(--accent)}
.press-ic .material-symbols-outlined{font-size:1.35vw}
.press-k{color:var(--ink);font-size:1.05vw;font-weight:800;letter-spacing:-.01em}
.press-feats{list-style:none;margin:.65vw 0 0;padding:0;display:flex;flex-direction:column;gap:.6vw}
.press-feats li{position:relative;padding-left:.85vw;color:var(--body);font-size:.85vw;line-height:1.65;word-break:keep-all}
.press-feats li:before{content:"";position:absolute;left:0;top:.55vw;width:.32vw;height:.32vw;border-radius:50%;background:var(--accent)}
.press-st{padding-top:.8vw;display:flex}

/* ── KPI 스탯 (하이라인 사이 큰 숫자) + 마일스톤 ── */
.mile{display:grid;grid-template-columns:15vw 1fr;gap:2.4vw;align-items:center}
.kpi{display:flex;flex-direction:column;justify-content:center;gap:.3vw;border-top:2px solid var(--ink);border-bottom:1px solid var(--hair);padding:1vw .2vw}
.kpi-n{font-size:3vw;font-weight:900;color:var(--accent);letter-spacing:-.03em;line-height:1.05}
.kpi-n small{font-size:1.2vw;font-weight:800;margin-left:.15vw}
.kpi-l{color:var(--ink);font-size:.92vw;font-weight:700}
.kpi-s{color:var(--muted);font-size:.78vw;line-height:1.6}
/* 목표 규모 비교 미니 바 — 2.1MW가 기존 연간 목표(0.9MW)보다 큰 물량임을 한눈에 */
.kpi-cmp{display:flex;flex-direction:column;gap:.4vw;margin-top:.45vw}
.kpi-cmp-row{display:flex;align-items:center;gap:.5vw}
.kpi-cmp-row i{height:.55vw;border-radius:999px;background:#c9d8f0;display:block;flex-shrink:0}
.kpi-cmp-row.big i{background:linear-gradient(90deg,#1d4ed8,#3b82f6)}
.kpi-cmp-row span{color:var(--muted);font-size:.7vw;font-weight:600;white-space:nowrap}
.kpi-cmp-row.big span{color:var(--accent);font-weight:800}

/* ── 요약 대비 패널 (조기 설립 vs 물량 확보 후 설립) — 본문 높이를 채운다 ── */
.vs{display:grid;grid-template-columns:1fr 1.12fr;gap:1vw;flex:1;min-height:0;align-items:stretch}
.vs-panel{border:2px dashed #cbd5e1;border-radius:14px;background:#f8fafc;padding:1.2vw 1.5vw;display:flex;flex-direction:column;gap:.9vw;justify-content:center}
.vs-panel.ours{border:1px solid #b9d2f8;background:linear-gradient(180deg,#ffffff 0%,#f7faff 100%);box-shadow:0 6px 24px rgba(37,99,235,.09)}
.vs-h{display:flex;align-items:center;gap:.5vw;font-size:.98vw;font-weight:800;color:#64748b;justify-content:center}
.vs-h .material-symbols-outlined{font-size:1.1vw}
.vs-panel.ours .vs-h{color:var(--accent)}
.vs-li{display:flex;align-items:flex-start;gap:.55vw;color:var(--body);font-size:.85vw;line-height:1.6;word-break:keep-all}
.vs-li .material-symbols-outlined{font-size:1vw;flex-shrink:0;margin-top:.12vw;color:#94a3b8}
.vs-panel.ours .vs-li .material-symbols-outlined{color:#10b981}
.vs-li b{color:var(--ink)}

/* ── 마침 요청 바 ── */
.ans{background:linear-gradient(90deg,#0f2a5f,#1d4ed8 55%,#2563eb);border-radius:14px;padding:1vw 1.6vw;display:flex;align-items:center;gap:1.1vw;color:#fff;box-shadow:0 10px 28px rgba(30,64,175,.25)}
.ans>.material-symbols-outlined{font-size:1.35vw;color:#bcd3fa}
.ans-t{font-size:1.02vw;font-weight:700;flex:1;line-height:1.6}
.ans-fn{display:flex;gap:.45vw;flex-wrap:wrap;justify-content:flex-end}
.ans-pill{border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.08);border-radius:999px;padding:.2vw .85vw;font-size:.76vw;font-weight:600;color:#dbe7ff;white-space:nowrap}

/* ── 감사합니다 (마지막 다크) ── */
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

// no = 시나리오 페이지 번호, sec = 시나리오 페이지 제목 (사용자 구성 그대로)
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

function Flow({ steps }: { steps: { no: string; name: string; sub: string; final?: boolean }[] }) {
  return (
    <div className="flow">
      {steps.map((s) => (
        <div key={s.no + s.name} className={`step${s.final ? ' final' : ''}`}>
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

// 목표 대비 실적 게이지 행 — 트랙 길이 = 목표 물량(MW, 동일 축), 채움 = 실적(달성률)
// goal: 목표 MW · maxGoal: 축 최대값(가장 큰 목표) → 목표가 클수록 트랙이 길어진다
function MRow({
  l,
  s,
  goal,
  maxGoal,
  pct,
  v,
  acc,
  prep,
}: {
  l: string
  s: string
  goal: number
  maxGoal: number
  pct: number
  v: ReactNode
  acc?: boolean
  /** 준비 중 — 진행률 대신 움직이는 스트라이프 */
  prep?: boolean
}) {
  return (
    <div className="mrow">
      <div className="mrow-l">
        <b>{l}</b>
        <small>{s}</small>
      </div>
      <div className="mtrack-wrap">
        <div className="mtrack" style={{ width: `${(goal / maxGoal) * 100 * 0.82}%` }}>
          {prep ? <div className="mfill prep" /> : pct > 0 && <div className={`mfill${acc ? ' acc' : ''}`} style={{ width: `${pct}%` }} />}
        </div>
        <span className="mgoal">목표 {goal}MW</span>
      </div>
      <div className="mrow-v">{v}</div>
    </div>
  )
}

/* ─────────────────────────── 슬라이드 — 시나리오 5페이지 1:1 ─────────────────────────── */

// 목차 행 클릭 → 해당 장으로 이동해야 하므로 슬라이드 배열을 함수로 생성
function makeSlides(goTo: (i: number) => void): ReactNode[] {
  const TOC = [
    { no: '01', t: '보고 개요', d: 'SPC 설립 시기 — 3차년도(2026) → 4차년도(2027년 상반기) 조정', at: 2 },
    { no: '02', t: '변경 신청 사유', d: '수요물량 미확보 · 조기 설립 시 비효율 · 본 사업 리스크', at: 3 },
    { no: '03', t: '변경 후 추진 일정 · 사업 영향', d: '26년 3~4분기 사전 검토 → 27년 상반기 설립 — 설치 일정 영향 없음', at: 4 },
    { no: '04', t: '수요모집 정상화 계획', d: '우선 타겟 50개사 · 유관기관 공동 대응 · PMO 관리 체계', at: 5 },
    { no: '05', t: '요약 및 요청사항', d: '협약 핵심 목표 변경 없음 — 변경 사업계획서 반영 계획', at: 6 },
  ]

  return [
    /* ── 표지 ── */
    <div className="dark-stage" key="cover">
      <p className="cover-eyebrow">Ulsan-Mipo Energy Independence</p>
      <h1 className="cover-title">SPC 설립 시기<br />변경 신청 보고</h1>
      <p className="cover-sub">
        울산미포 에너지자급자족 인프라 구축 및 운영사업<br />
        전력거래용 태양광 발전사업 SPC — 3차년도에서 4차년도로 조정
      </p>
      <div className="cover-meta">
        <img src="/images/rmsplatform-logo-white.png" alt="RMS PLATFORM" />
        <i />
        <span>2026. 07. 30</span>
      </div>
    </div>,

    /* ── 목차 ── */
    <div className="toc" key="toc">
      <div className="toc-left">
        <p className="toc-eyebrow">Contents</p>
        <h2 className="toc-title">목차</h2>
        <p className="toc-lead">
          SPC 설립 시기를 4차년도(2027년 상반기)로
          <br />
          조정하고자 하는 변경 신청 건 보고입니다.
        </p>
      </div>
      <div className="toc-right">
        {TOC.map((r) => (
          <div className="trow" key={r.no} onClick={() => goTo(r.at)}>
            <span className="trow-no">{r.no}</span>
            <div>
              <div className="trow-t">{r.t}</div>
              <div className="trow-d">{r.d}</div>
            </div>
          </div>
        ))}
      </div>
    </div>,

    /* ── 1page : 인사 및 보고 개요 ── */
    <ContentSlide
      key="p1"
      no="01"
      sec="보고 개요"
      title={<>SPC 설립 시기 — <span className="hl">3차년도에서 4차년도 상반기로</span> 조정</>}
      lede={
        <>
          통합에너지플랫폼 구축 및 사업관리를 담당하는 <b>RMS</b>입니다. 전력거래용 태양광 발전사업 수행을 위한{' '}
          <b>SPC 설립 시기 변경 신청 건</b>을 보고드립니다.
        </>
      }
      fill
    >
      <div className="shift">
        <div className="shift-card was">
          <span className="shift-tag">당초 계획</span>
          <div className="shift-yr">
            3차년도<small>2026년</small>
          </div>
          <p className="shift-d">협약상 당초 SPC 설립 예정 시기</p>
          <div className="shift-hr" />
          <div className="shift-li">
            <span className="material-symbols-outlined">hourglass_top</span>
            <span>3차년도 신규 계약 물량 준비 중 (미확정)</span>
          </div>
          <div className="shift-li">
            <span className="material-symbols-outlined">payments</span>
            <span>지금 설립 시 매출 기반 없이 고정비만 발생</span>
          </div>
        </div>
        <div className="shift-mid">
          <span className="material-symbols-outlined">east</span>
          <b>변경 신청</b>
        </div>
        <div className="shift-card now">
          <span className="shift-tag">변경 후</span>
          <div className="shift-yr">
            4차년도<small>2027년 상반기</small>
          </div>
          <p className="shift-d">수요물량 확보 후 설립</p>
          <div className="shift-hr" />
          <div className="shift-li">
            <span className="material-symbols-outlined">account_balance</span>
            <span>SPC 재무 건전성 확보</span>
          </div>
          <div className="shift-li">
            <span className="material-symbols-outlined">pie_chart</span>
            <span>출자구조를 실제 물량 기준으로 확정</span>
          </div>
        </div>
      </div>
      <div className="keep">
        <span className="keep-ic blue">
          <span className="material-symbols-outlined">apartment</span>
        </span>
        <b>SPC의 역할</b>
        <p>
          전력거래용 태양광 발전설비의 <b>소유 · 운영</b>과 <b>전력 판매 수익 관리</b>를 담당하는 발전사업 법인 —
          설립의 실익은 관리 대상 발전물량이 확보된 이후에 발생
        </p>
      </div>
      <div className="keep">
        <span className="keep-ic">
          <span className="material-symbols-outlined">verified</span>
        </span>
        <b>협약상 핵심 목표 변경 없음</b>
        <div className="keep-items">
          <span>설치 목표량</span>
          <span>총사업비</span>
          <span>사업기간</span>
        </div>
      </div>
    </ContentSlide>,

    /* ── 2page : 변경 신청 요청 사유 ── */
    <ContentSlide
      key="p2"
      no="02"
      sec="변경 신청 사유"
      title={<>물량 없는 조기 설립 — <span className="hl">비용과 리스크만 발생</span></>}
      lede={
        <>
          변경 신청 사유는 세 가지입니다. SPC의 핵심 기능(발전사업허가 · 계통연계 · 지분 확정)은 모두{' '}
          <b>발전물량 확정을 선행조건</b>으로 합니다.
        </>
      }
      fill
    >
      <div className="qrow">
        <div className="qcol">
          <span className="q-ghost">01</span>
          <span className="q-chip">
            <span className="material-symbols-outlined">search_off</span>
          </span>
          <div className="q-text">
            수요물량 <span className="hl">미확보</span>
            <span className="q-cap">
              전력거래용 태양광은 2차년도까지 0.33MW 구축. 3차년도 목표는 기존 연간 목표보다 큰 2.1MW로, 신규 계약을{' '}
              준비 중 — 현재 컨소시엄 전원이 수요모집에 집중
            </span>
          </div>
        </div>
        <div className="qcol">
          <span className="q-ghost">02</span>
          <span className="q-chip">
            <span className="material-symbols-outlined">money_off</span>
          </span>
          <div className="q-text">
            조기 설립 시 <span className="hl">비효율 발생</span>
            <span className="q-cap">
              매출 기반 없이 법인 설립비용과 운영 고정비(회계 · 세무 · 공시, 관리인력)만 발생 — 국비가 투입되는 본 사업의
              재정 건전성 저해
            </span>
          </div>
        </div>
        <div className="qcol">
          <span className="q-ghost">03</span>
          <span className="q-chip">
            <span className="material-symbols-outlined">warning</span>
          </span>
          <div className="q-text">
            본 사업 <span className="hl">리스크</span>
            <span className="q-cap">
              3차년도 설립 강행 시 역량이 분산되어 태양광 수요모집 자체에 차질 — 본 사업의 안정성 저하로 이어질 우려
            </span>
          </div>
        </div>
      </div>
      <div className="panel">
        <div className="block-label">
          <b>태양광 구축 목표 대비 실적</b>
        </div>
        <div className="mrows">
          <MRow l="2차년도 · 자가소비" s="2025년" goal={0.9} maxGoal={2.1} pct={64.4} v={<><b>0.58</b> / 0.9MW · <span className="pct">64.4%</span> <small>(이월 0.32MW)</small></>} />
          <MRow l="2차년도 · 전력거래" s="2025년" goal={0.9} maxGoal={2.1} pct={36.7} acc v={<><b>0.33</b> / 0.9MW · <span className="pct">36.7%</span> <small>(이월 0.57MW)</small></>} />
          <MRow l="3차년도 · 전력거래" s="2026년 — 기존 연간 목표의 2.3배" goal={2.1} maxGoal={2.1} pct={0} prep v={<span className="prep-t">신규 계약 준비 중</span>} />
        </div>
        <p className="srcline">막대 길이 = 목표 물량(MW) 동일 축 · 출처: SPC 4차년도 변경 사유 보고서 — 태양광 수요발굴 추진 현황</p>
      </div>
    </ContentSlide>,

    /* ── 3page : 변경 후 추진 일정 및 사업 영향 ── */
    <ContentSlide
      key="p3"
      no="03"
      sec="변경 후 추진 일정 및 사업 영향"
      title={<>물량 확보 → 설립 — <span className="hl">설치 일정 영향 없는</span> 추진</>}
      lede={
        <>
          26년 하반기에 수요물량 확보와 설립 사전 검토를 병행하고, <b>27년 상반기에 설립부터 전력거래 개시 준비까지</b>{' '}
          완료합니다.
        </>
      }
      fill
    >
      <div>
        <div className="block-label">
          <b>SPC 설립 추진 일정 (변경 후)</b>
        </div>
        <Flow
          steps={[
            {
              no: '26년 3~4분기',
              name: '수요물량 확보 집중 · 설립 사전 검토',
              sub: '출자구조 · 정관 · 자본금 산정 등 병행 검토',
            },
            {
              no: '27년 1분기',
              name: '발전설비 설치 · 법인 설립 등기',
              sub: '태양광 발전설비 설치, 출자자 협약 체결, 법인 설립 등기 완료',
            },
            {
              no: '27년 2분기',
              name: '발전사업허가 · 전력거래 개시 준비',
              sub: '발전사업허가 신청, 구축 설비 이관, 전력거래 개시 준비',
              final: true,
            },
          ]}
        />
      </div>
      <div className="imp">
        <div className="imp-card">
          <div className="imp-h">
            <span className="material-symbols-outlined">event_available</span>설치 일정 — 영향 없음
          </div>
          <div className="fx">
            <div className="fx-row">
              <span className="material-symbols-outlined">check_circle</span>
              <span>3차년도 중 확보 물량은 컨소시엄 참여기업이 즉시 설치 착수</span>
            </div>
            <div className="fx-row">
              <span className="material-symbols-outlined">check_circle</span>
              <span>설립 전 구축 설비는 설립 후 SPC로 이관하는 방식으로 처리</span>
            </div>
          </div>
        </div>
        <div className="imp-card">
          <div className="imp-h">
            <span className="material-symbols-outlined">trending_up</span>사업 안정성 — 오히려 제고
          </div>
          <div className="fx">
            <div className="fx-row">
              <span className="material-symbols-outlined">check_circle</span>
              <span>물량 확보 후 설립 — SPC의 재무 건전성 확보</span>
            </div>
            <div className="fx-row">
              <span className="material-symbols-outlined">check_circle</span>
              <span>출자구조를 실제 물량 기준으로 확정 가능</span>
            </div>
          </div>
        </div>
      </div>
    </ContentSlide>,

    /* ── 4page : 수요모집 정상화 계획 ── */
    <ContentSlide
      key="p4"
      no="04"
      sec="수요모집 정상화 계획"
      title={<>우선 타겟 <span className="hl">50개사</span> 집중 — 2.1MW 달성 계획</>}
      lede={
        <>
          타겟 선별 · 유관기관 공동 대응 · PMO 관리 체계로 <b>3차년도 목표 2.1MW</b>를 달성하겠습니다.
        </>
      }
      fill
    >
      <div className="press">
        <div className="press-card">
          <span className="press-ic">
            <span className="material-symbols-outlined">ads_click</span>
          </span>
          <div className="press-k">타겟 집중</div>
          <ul className="press-feats">
            <li>울산미포산단 입주기업 중 지붕면적 · 계약전력 기준 선별</li>
            <li>우선 타겟 50개사 집중 공략</li>
          </ul>
        </div>
        <div className="press-card">
          <span className="press-ic">
            <span className="material-symbols-outlined">handshake</span>
          </span>
          <div className="press-k">공동 대응</div>
          <ul className="press-feats">
            <li>산업단지공단 울산지역본부 · 울산광역시 협력</li>
            <li>입주기업 합동 사업설명회 개최</li>
            <li>공단 명의 안내 공문 발송</li>
          </ul>
        </div>
        <div className="press-card">
          <span className="press-ic">
            <span className="material-symbols-outlined">fact_check</span>
          </span>
          <div className="press-k">관리 체계</div>
          <ul className="press-feats">
            <li>PMO 주관 주 단위 수요발굴 실적 점검</li>
            <li>울산지역본부 주간보고 체계</li>
          </ul>
          <div className="press-st">
            <span className="tag blue live">
              <i />기 운영 중
            </span>
          </div>
        </div>
      </div>
      <div className="panel">
        <div className="block-label">
          <b>마일스톤</b>
        </div>
        <div className="mile">
          <div className="kpi">
            <div className="kpi-n">
              2.1<small>MW</small>
            </div>
            <div className="kpi-l">3차년도 전력거래 목표</div>
            <div className="kpi-cmp">
              <div className="kpi-cmp-row">
                <i style={{ width: '39%' }} />
                <span>기존 연간 목표 0.9MW</span>
              </div>
              <div className="kpi-cmp-row big">
                <i style={{ width: '91%' }} />
                <span>2.1MW</span>
              </div>
            </div>
            <div className="kpi-s">기존 연간 목표의 2.3배 물량 — 집중 대응으로 달성</div>
          </div>
          <Flow
            steps={[
              { no: '26년 하반기', name: '계약 집중', sub: '우선 타겟 50개사 · 유관기관 합동 수요모집' },
              { no: '27년 상반기', name: '설치 완료', sub: '확보 물량 즉시 설치 착수 — 목표 2.1MW 달성', final: true },
            ]}
          />
        </div>
      </div>
    </ContentSlide>,

    /* ── 5page : 요약 및 요청사항 ── */
    <ContentSlide
      key="p5"
      no="05"
      sec="요약 및 요청사항"
      title={<>핵심 목표 변경 없는 시기 조정 — <span className="hl">사업 안정성 제고</span></>}
      lede={
        <>
          SPC 설립 시기를 <b>4차년도(2027년 상반기)로 조정</b>하는 건으로, 목표 · 총사업비 · 사업기간 등 협약상 핵심
          목표의 변경은 없습니다.
        </>
      }
      fill
    >
      <div className="vs">
        <div className="vs-panel">
          <div className="vs-h">
            <span className="material-symbols-outlined">money_off</span>미확보 상태의 조기 설립
          </div>
          <div className="vs-li">
            <span className="material-symbols-outlined">remove_circle_outline</span>
            <span>
              매출 기반 없는 <b>고정비 지출</b> — 국비 집행의 효율성 저해
            </span>
          </div>
          <div className="vs-li">
            <span className="material-symbols-outlined">remove_circle_outline</span>
            <span>역량 분산으로 수요모집 차질 우려</span>
          </div>
        </div>
        <div className="vs-panel ours">
          <div className="vs-h">
            <span className="material-symbols-outlined">task_alt</span>물량 확보 후 설립
          </div>
          <div className="vs-li">
            <span className="material-symbols-outlined">check_circle</span>
            <span>
              SPC <b>재무 건전성</b> 확보 · 실 물량 기준 <b>출자구조 확정</b>
            </span>
          </div>
          <div className="vs-li">
            <span className="material-symbols-outlined">check_circle</span>
            <span>
              3차년도는 수요모집에 집중 — 2.1MW <b>26년 하반기 계약 · 27년 상반기 설치 완료</b>
            </span>
          </div>
        </div>
      </div>
      <div className="ans">
        <span className="material-symbols-outlined">edit_document</span>
        <span className="ans-t">
          변경 사업계획서에 <b>4차년도 SPC 설립계획(안)과 지분계획 등 세부내용</b>을 반영하겠습니다
        </span>
        <span className="ans-fn">
          <span className="ans-pill">설립계획(안)</span>
          <span className="ans-pill">지분계획</span>
        </span>
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
}

/* ─────────────────────────── 플레이어 ─────────────────────────── */

export default function Page() {
  const [idx, setIdx] = useState(0)
  const goTo = useCallback((i: number) => setIdx(i), [])
  const slides = useMemo(() => makeSlides(goTo), [goTo])
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
