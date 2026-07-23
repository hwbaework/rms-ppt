'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// LASEE 설치기업 — 페르소나 · 프로세스 재구성  (2026.07.23)
// 원본: LASEE_설치기업_페르소나_프로세스.pptx (7슬라이드)
// 디자인: docs/style-reference.md — 260715_carbon 에디토리얼 표준 계승
//   · 딥네이비 표지·마무리(고정 블롭 배경) · vw 단위 · 자체 플레이어
//   · 주장형 한 줄 제목 + 박스 없는 리드문 · 헤어라인 · 페르소나 색 도식
// 페르소나 색 (분산에너지 도메인, §4.5 준용):
//   소유주=emerald · 플랫폼=blue(Primary) · 설치기업=violet(주인공) · 관리자=slate
// ─────────────────────────────────────────────────────────────────────────────

const C = { owner: '#059669', sys: '#2563eb', inst: '#7c3aed', admin: '#64748b' }

const CSS = `
:root{--accent:#2563eb;--accent-soft:#7fa8e8;--ink:#0b1526;--body:#3e4c5e;--muted:#8a94a6;--hair:#e6eaf2;--paper:#fbfcfe;--card:#ffffff;--chip:#f5f7fb;--tint:#eff4ff;--tint-line:#dbe6fb;--owner:#059669;--sys:#2563eb;--inst:#7c3aed;--admin:#64748b;--navy1:#0a162e;--navy2:#12264d}
.presentation{position:fixed;inset:0;z-index:50;background:#081120;overflow:hidden;font-family:Pretendard,'Noto Sans KR',-apple-system,BlinkMacSystemFont,sans-serif;-webkit-font-smoothing:antialiased}
.presentation *{box-sizing:border-box;margin:0;padding:0}
.slide{opacity:0;pointer-events:none;flex-direction:column;transition:opacity .5s,transform .5s;display:flex;position:absolute;inset:0;transform:translate(48px)}
.slide>*{flex:1}
.slide.active{opacity:1;pointer-events:all;transform:translate(0)}
.slide.prev{opacity:0;transform:translate(-48px)}

/* ── 고정 배경 레이어 (표지·마무리에서 비침) ── */
.bg-stage{position:absolute;inset:0;background:radial-gradient(130% 150% at 82% -30%,var(--navy2) 0%,var(--navy1) 55%,#081120 100%);overflow:hidden;pointer-events:none}
.dark-stage{background:transparent;position:relative;overflow:hidden;display:flex;flex-direction:column;justify-content:center;padding:0 7.5%}
.blob{position:absolute;border-radius:50%;pointer-events:none}
.blob.b1{width:36vw;height:36vw;right:-10vw;top:-14vw;background:radial-gradient(circle at 30% 26%,rgba(255,255,255,.16) 0%,transparent 32%),radial-gradient(circle at 64% 70%,rgba(8,17,32,.32) 0%,transparent 54%),radial-gradient(circle at 38% 42%,rgba(140,120,240,.22) 0%,rgba(90,70,190,.14) 46%,transparent 72%)}
.blob.b2{width:28vw;height:28vw;left:-9vw;bottom:-11vw;background:radial-gradient(circle at 34% 30%,rgba(255,255,255,.12) 0%,transparent 30%),radial-gradient(circle at 68% 72%,rgba(8,17,32,.30) 0%,transparent 55%),radial-gradient(circle at 58% 36%,rgba(96,140,220,.20) 0%,rgba(52,90,170,.11) 55%,transparent 76%)}
.blob.b3{width:14vw;height:14vw;right:13vw;bottom:-4vw;background:radial-gradient(circle at 30% 26%,rgba(160,140,240,.13) 0%,transparent 36%),radial-gradient(circle,rgba(4,10,28,.55) 0%,rgba(4,10,28,.22) 55%,transparent 75%)}
.blob.b4{width:9vw;height:9vw;left:16vw;top:9vw;background:radial-gradient(circle at 32% 30%,rgba(255,255,255,.15) 0%,transparent 38%),radial-gradient(circle,rgba(127,168,232,.17) 0%,transparent 70%)}
.grain{position:absolute;inset:0;opacity:.05;mix-blend-mode:overlay;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");background-size:180px 180px;pointer-events:none}

/* ── 표지 ── */
.cover-eyebrow{color:var(--accent-soft);letter-spacing:.4em;text-transform:uppercase;font-size:.72vw;font-weight:600;margin-bottom:1.7vw;position:relative;z-index:1}
.cover-title{color:#fff;font-size:3.9vw;font-weight:900;letter-spacing:-.02em;line-height:1.18;margin-bottom:1.2vw;position:relative;z-index:1}
.cover-sub{color:rgba(191,209,238,.85);font-size:1.12vw;font-weight:300;line-height:1.75;margin-bottom:2vw;position:relative;z-index:1}
.cover-actors{display:flex;gap:1.4vw;margin-bottom:2.6vw;position:relative;z-index:1;flex-wrap:wrap}
.cact{display:flex;align-items:center;gap:.45vw;color:rgba(191,209,238,.82);font-size:.78vw;font-weight:500}
.cact i{width:.55vw;height:.55vw;border-radius:50%;flex-shrink:0}
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
.toc-left:before{content:"";position:absolute;left:-10vw;bottom:-14vw;width:30vw;height:30vw;border:1px solid rgba(140,120,240,.16);border-radius:50%}
.toc-eyebrow{color:var(--accent-soft);letter-spacing:.4em;text-transform:uppercase;font-size:.68vw;font-weight:600;margin-bottom:1.1vw}
.toc-title{color:#fff;font-size:2.7vw;font-weight:800;letter-spacing:-.01em;margin-bottom:1.2vw}
.toc-lead{color:rgba(191,209,238,.72);font-size:.92vw;font-weight:300;line-height:1.8}
.toc-right{flex:1;background:var(--paper);display:flex;flex-direction:column;justify-content:center;padding:0 3.6vw}
.trow{display:flex;align-items:center;gap:1.6vw;padding:1.02vw .4vw;border-bottom:1px solid var(--hair);transition:background .2s;cursor:pointer}
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
.lede{color:var(--body);font-size:.94vw;line-height:1.8;max-width:82%;margin-bottom:1.15vw}
.lede b{color:var(--ink);font-weight:700}
.lede .hl{color:var(--accent);font-weight:700}
.lede .hv{color:var(--inst);font-weight:700}
.area{flex:1;display:flex;flex-direction:column;gap:1.1vw;justify-content:center}

/* ── 스텝 플로우 (점 + 라인) ── */
.flow{display:flex}
.step{flex:1;padding-right:1.2vw;position:relative}
.step-line{display:flex;align-items:center;gap:.55vw;margin-bottom:.55vw}
.step-dot{width:.52vw;height:.52vw;border-radius:50%;border:2px solid var(--inst);background:var(--paper);flex-shrink:0}
.step.final .step-dot{background:var(--inst)}
.step-no{color:var(--inst);font-size:.66vw;font-weight:800;letter-spacing:.06em}
.step-line:after{content:"";flex:1;height:1px;background:var(--hair)}
.step:last-child .step-line:after{display:none}
.step-name{color:var(--ink);font-size:.93vw;font-weight:700;line-height:1.4;margin-bottom:.28vw}
.step.final .step-name{color:var(--inst)}
.step-sub{color:var(--muted);font-size:.76vw;line-height:1.6}

/* ── 블록 (라벨 + 그리드) ── */
.block-label{display:flex;align-items:center;gap:.9vw;margin-bottom:.6vw}
.block-label b{color:var(--ink);font-size:.9vw;font-weight:700;white-space:nowrap}
.block-label:after{content:"";flex:1;height:1px;background:var(--hair)}
.grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:.8vw}
.item{background:var(--card);border:1px solid var(--hair);border-radius:12px;padding:.8vw 1vw}
.item-k{color:var(--ink);font-size:.86vw;font-weight:700;display:flex;align-items:center;gap:.5vw;margin-bottom:.34vw}
.item-k i{width:1.35vw;height:1.35vw;border-radius:50%;background:#fffbeb;color:#b45309;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0}
.item-k i .material-symbols-outlined{font-size:.85vw}
.item-d{color:var(--body);font-size:.78vw;line-height:1.66}

/* ── 끊긴 프로세스 (문제 슬라이드) ── */
.gapflow{display:flex;align-items:stretch;gap:.5vw}
.gnode{flex:1;background:var(--card);border:1px solid var(--hair);border-radius:14px;padding:1vw;text-align:center;display:flex;flex-direction:column;align-items:center;gap:.35vw}
.gnode .gic{width:2.5vw;height:2.5vw;border-radius:50%;display:flex;align-items:center;justify-content:center;background:var(--tint);color:var(--accent)}
.gnode .gic .material-symbols-outlined{font-size:1.3vw}
.gnode b{color:var(--ink);font-size:.95vw;font-weight:800}
.gnode small{color:var(--muted);font-size:.74vw}
.gnode.miss{border:1.5px dashed #f0b26b;background:#fffdf6}
.gnode.miss .gic{background:#fef3c7;color:#b45309}
.gnode.miss b{color:#b45309}
.gnode.miss small{color:#b45309;font-weight:700}
.garrow{align-self:center;color:#c3ccda;font-size:1.3vw;flex-shrink:0;font-weight:300}

/* ── 페르소나 히어로 ── */
.phero{display:flex;align-items:center;gap:1.3vw;background:var(--card);border:1px solid var(--hair);border-radius:16px;padding:1vw 1.4vw;box-shadow:0 1px 2px rgba(11,21,38,.03)}
.pav{width:3.6vw;height:3.6vw;border-radius:50%;background:linear-gradient(135deg,#8b5cf6,#6d28d9);color:#fff;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.pav .material-symbols-outlined{font-size:1.9vw}
.pdef-name{display:flex;align-items:center;gap:.6vw;flex-wrap:wrap;margin-bottom:.3vw}
.pdef-name b{color:var(--inst);font-size:1.1vw;font-weight:800}
.pdef-desc{color:var(--body);font-size:.85vw;line-height:1.7}
.pdef-desc b{color:var(--ink)}

/* ── 페르소나 3열 (목표/페인/기능) ── */
.pcols{display:grid;grid-template-columns:repeat(3,1fr);gap:1vw}
.pcol{background:var(--card);border:1px solid var(--hair);border-radius:14px;padding:.9vw 1.05vw;display:flex;flex-direction:column}
.pcol-h{display:flex;align-items:center;gap:.5vw;margin-bottom:.6vw;padding-bottom:.5vw;border-bottom:1px solid var(--hair)}
.pcol-h .material-symbols-outlined{font-size:1.05vw}
.pcol-h b{font-size:.9vw;font-weight:800}
.pcol.goal .pcol-h{color:var(--owner)}
.pcol.pain .pcol-h{color:#b45309}
.pcol.func .pcol-h{color:var(--sys)}
.plist{display:flex;flex-direction:column;gap:.42vw}
.pli{display:flex;gap:.5vw;color:var(--body);font-size:.79vw;line-height:1.55}
.pli:before{content:"";width:.36vw;height:.36vw;border-radius:50%;background:#cbd5e1;margin-top:.5vw;flex-shrink:0}
.pcol.goal .pli:before{background:var(--owner)}
.pcol.pain .pli:before{background:#f59e0b}
.pcol.func .pli:before{background:var(--sys)}

/* ── 5단계 파이프라인 ── */
.pflow{display:flex;align-items:stretch;gap:.4vw}
.pcell{flex:1;background:var(--card);border:1px solid var(--hair);border-radius:13px;padding:.85vw .9vw;display:flex;flex-direction:column;gap:.3vw}
.pno{font-size:1.35vw;font-weight:900;letter-spacing:-.02em;line-height:1}
.pname{color:var(--ink);font-size:.9vw;font-weight:800;line-height:1.25}
.pactor{display:inline-flex;align-items:center;gap:.35vw;font-size:.68vw;font-weight:700;margin:.05vw 0 .15vw}
.pactor i{width:.42vw;height:.42vw;border-radius:50%;flex-shrink:0}
.pdesc{color:var(--muted);font-size:.73vw;line-height:1.5}
.parr{align-self:center;color:#c9d2e0;font-size:1vw;flex-shrink:0}

/* ── 액터 범례 ── */
.legend{display:flex;gap:1.2vw;flex-wrap:wrap;align-items:center}
.leg{display:flex;align-items:center;gap:.4vw;color:var(--body);font-size:.76vw;font-weight:600}
.leg i{width:.55vw;height:.55vw;border-radius:50%;flex-shrink:0}

/* ── 정상 시퀀스 (번호 노드 흐름) ── */
.seq{display:flex;flex-wrap:wrap;gap:.5vw;align-items:stretch}
.snode{display:flex;align-items:center;gap:.6vw;background:var(--card);border:1px solid var(--hair);border-radius:12px;padding:.55vw .8vw .55vw .55vw;position:relative}
.snode.gate{border:1.5px solid #93c5fd;box-shadow:0 3px 12px rgba(37,99,235,.1)}
.snum{width:1.7vw;height:1.7vw;border-radius:8px;color:#fff;font-size:.82vw;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.sname{color:var(--ink);font-size:.82vw;font-weight:700;line-height:1.25;white-space:nowrap}
.sactor{color:var(--muted);font-size:.66vw;font-weight:600;margin-top:.06vw}
.sarr{align-self:center;color:#c9d2e0;font-size:.9vw;flex-shrink:0}
.gate-tag{position:absolute;top:-.62vw;right:.5vw;background:var(--accent);color:#fff;font-size:.58vw;font-weight:800;padding:.05vw .5vw;border-radius:999px;letter-spacing:.03em}

/* ── 이상감지 포크 (병렬 대응) ── */
.fork{display:flex;flex-direction:column;gap:.55vw}
.fbar{background:var(--card);border:1px solid var(--hair);border-radius:13px;padding:.7vw 1.1vw;display:flex;align-items:center;gap:.8vw}
.fbar .fbic{width:2.1vw;height:2.1vw;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.fbar .fbic .material-symbols-outlined{font-size:1.15vw}
.fbar b{color:var(--ink);font-size:.9vw;font-weight:800}
.fbar span{color:var(--muted);font-size:.77vw}
.fbar.trigger{border-color:#bfdbfe;background:var(--tint)}
.fbar.trigger .fbic{background:#dbeafe;color:var(--sys)}
.fbar.trigger b{color:var(--sys)}
.fbar.done{border-color:#a7f3d0;background:#f0fdf9}
.fbar.done .fbic{background:#d1fae5;color:var(--owner)}
.fbar.done b{color:var(--owner)}
.fbadge{margin-left:auto;background:#fff;border:1px solid var(--hair);border-radius:999px;font-size:.66vw;font-weight:800;padding:.12vw .7vw;color:var(--ink)}
.flanes{display:grid;grid-template-columns:1fr 1fr;gap:1vw;position:relative}
.flane{background:var(--card);border:1px solid var(--hair);border-radius:13px;padding:.75vw .95vw}
.flane-h{display:flex;align-items:center;gap:.5vw;font-size:.85vw;font-weight:800;margin-bottom:.55vw;padding-bottom:.4vw;border-bottom:1px solid var(--hair)}
.flane-h i{width:.55vw;height:.55vw;border-radius:50%;flex-shrink:0}
.flane.inst .flane-h{color:var(--inst)}
.flane.admin .flane-h{color:var(--admin)}
.fsteps{display:flex;flex-direction:column;gap:.34vw}
.fstep{display:flex;align-items:center;gap:.5vw;color:var(--body);font-size:.78vw;line-height:1.4}
.fstep .fn{width:1.15vw;height:1.15vw;border-radius:50%;font-size:.62vw;font-weight:800;color:#fff;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.flane.inst .fn{background:var(--inst)}
.flane.admin .fn{background:var(--admin)}
.fpar{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);background:#fff;border:1.5px dashed #c4b5fd;color:var(--inst);font-size:.66vw;font-weight:800;padding:.15vw .6vw;border-radius:999px;z-index:2;white-space:nowrap}
.fowner{display:flex;align-items:center;gap:.55vw;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:11px;padding:.5vw .95vw}
.fowner i{width:.5vw;height:.5vw;border-radius:50%;background:var(--owner);flex-shrink:0}
.fowner b{color:var(--owner);font-size:.8vw;font-weight:800}
.fowner span{color:var(--body);font-size:.76vw}

/* ── 상태 머신 ── */
.states{display:flex;flex-wrap:wrap;align-items:center;gap:.4vw}
.schip{display:inline-flex;align-items:center;gap:.4vw;background:var(--chip);border:1px solid var(--hair);border-radius:999px;padding:.35vw .85vw;color:var(--ink);font-size:.8vw;font-weight:700;white-space:nowrap}
.schip .sd{width:.45vw;height:.45vw;border-radius:50%;flex-shrink:0}
.schip.cyc{background:#fffbeb;border-color:#fde68a;color:#b45309}
.schip.cyc .sd{background:#f59e0b}
.sarw{color:#c9d2e0;font-size:.82vw;flex-shrink:0}
.cyc-note{display:flex;align-items:center;gap:.5vw;color:#b45309;font-size:.77vw;font-weight:600;margin-top:.7vw}
.cyc-note .material-symbols-outlined{font-size:1vw}

/* ── 주체별 기능 3열 ── */
.funcs{display:grid;grid-template-columns:repeat(3,1fr);gap:1vw}
.fcol{background:var(--card);border:1px solid var(--hair);border-radius:14px;padding:.95vw 1.1vw}
.fcol-h{display:flex;align-items:center;gap:.55vw;margin-bottom:.6vw}
.fcol-ic{width:1.9vw;height:1.9vw;border-radius:9px;display:flex;align-items:center;justify-content:center;color:#fff;flex-shrink:0}
.fcol-ic .material-symbols-outlined{font-size:1.05vw}
.fcol-h b{color:var(--ink);font-size:.92vw;font-weight:800}
.fcol-h small{color:var(--muted);font-size:.68vw;font-weight:600;display:block;margin-top:.05vw}
.fitem{display:flex;flex-direction:column;gap:.05vw;padding:.4vw 0;border-top:1px solid var(--hair)}
.fitem b{color:var(--ink);font-size:.79vw;font-weight:700}
.fitem span{color:var(--muted);font-size:.72vw;line-height:1.5}

/* ── 마침 문장 / 근거 ── */
.coda{color:var(--body);font-size:.9vw;line-height:1.75;border-top:1px solid var(--hair);padding-top:.9vw}
.coda b{color:var(--accent);font-weight:700}
.coda .num{display:inline-flex;align-items:center;justify-content:center;width:1.15vw;height:1.15vw;border-radius:50%;background:var(--accent);color:#fff;font-size:.66vw;font-weight:800;margin-right:.3vw;vertical-align:middle}
.next{display:flex;align-items:flex-start;gap:.9vw;background:var(--tint);border:1px solid var(--tint-line);border-radius:13px;padding:.85vw 1.2vw}
.next-ic{width:2vw;height:2vw;border-radius:50%;background:#dbeafe;color:var(--sys);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.next-ic .material-symbols-outlined{font-size:1.05vw}
.next-t{color:var(--sys);font-size:.72vw;font-weight:800;letter-spacing:.06em;margin-bottom:.15vw}
.next-d{color:var(--body);font-size:.8vw;line-height:1.65}
.next-d b{color:var(--ink)}

/* ── 문제 슬라이드 2단 구성 (원본 도식 재현) ── */
.prob{display:grid;grid-template-columns:1.12fr 1fr;gap:1vw}
.prob-left{background:var(--card);border:1px solid var(--hair);border-radius:16px;padding:1.1vw 1.35vw;display:flex;flex-direction:column}
.prob-left-h{color:var(--ink);font-size:.98vw;font-weight:800;margin-bottom:1.1vw}
.bflow{display:flex;align-items:center;gap:.5vw;margin-bottom:1.1vw}
.bnode{flex:1;border-radius:12px;padding:.85vw .5vw;text-align:center;min-height:3.6vw;display:flex;align-items:center;justify-content:center}
.bnode b{font-size:.9vw;font-weight:800;line-height:1.32}
.bnode.reg{background:#eef4ff;border:1px solid #cfe0fb}
.bnode.reg b{color:#1d4ed8}
.bnode.miss{background:#fff5f5;border:1.5px dashed #eda0a0}
.bnode.miss b{color:#dc4a54}
.bnode.det{background:#f3efff;border:1px solid #ddd0f5}
.bnode.det b{color:#6d28d9}
.barrow{color:#c3ccda;font-size:1.05vw;flex-shrink:0}
.barrow.dash{color:#e0a0a0}
.prob-note{color:var(--body);font-size:.81vw;line-height:1.72;margin-top:auto}
.prob-note b{color:var(--ink)}
.prob-right{display:flex;flex-direction:column;gap:.75vw}
.pncard{flex:1;background:var(--card);border:1px solid var(--hair);border-radius:14px;padding:.9vw 1.1vw;display:flex;align-items:center;gap:.95vw}
.pncard-no{width:1.95vw;height:1.95vw;border-radius:50%;background:#e0556b;color:#fff;font-size:.88vw;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.pncard-t{color:var(--ink);font-size:.93vw;font-weight:800;margin-bottom:.24vw}
.pncard-d{color:var(--body);font-size:.79vw;line-height:1.58}
.prob-sol{background:#f0fdf9;border:1px solid #a7e0cf;border-radius:14px;padding:.95vw 1.3vw}
.prob-sol-h{color:var(--owner);font-size:.82vw;font-weight:800;margin-bottom:.3vw}
.prob-sol-d{color:var(--ink);font-size:.9vw;font-weight:600;line-height:1.72}
.prob-sol-d b{color:var(--owner)}

/* ── 스윔레인 (원본 도표 ①·② 재현) ── */
.swim{display:flex;gap:.55vw;flex:1;min-height:0}
.swim-labels{display:grid;gap:.5vw;width:7.2vw;flex-shrink:0}
.swim-label{border-radius:11px;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;font-size:.82vw;font-weight:800;line-height:1.28;text-align:center;padding:.4vw}
.swim-canvas{flex:1;position:relative}
.swim-bands{position:absolute;inset:0;display:grid;gap:.5vw}
.swim-band{border:1px solid var(--hair);border-radius:11px;background:var(--card)}
.swim-band:nth-child(even){background:#f7f9fc}
.swim-lines{position:absolute;inset:0;pointer-events:none}
.swl-h{position:absolute;height:2px;background:#c4cdda;transform:translateY(-1px)}
.swl-v{position:absolute;width:2px;background:#c4cdda;transform:translateX(-1px)}
.swl-h.fork,.swl-v.fork{background:#b79df0}
.swim-mark{position:absolute;transform:translate(-50%,-50%);background:#fff;border:1.5px dashed #c4b5fd;color:var(--inst);font-size:.68vw;font-weight:800;padding:.14vw .65vw;border-radius:999px;white-space:nowrap;z-index:3}
.swnode{position:absolute;transform:translateY(-50%);padding:0 .35vw;box-sizing:border-box;z-index:2}
.swnode-in{position:relative;background:#fff;border:1.5px solid;border-radius:11px;padding:.5vw .55vw;box-shadow:0 2px 8px rgba(11,21,38,.07)}
.swbadge{position:absolute;top:-.7vw;left:-.35vw;width:1.5vw;height:1.5vw;border-radius:50%;color:#fff;font-size:.76vw;font-weight:800;display:flex;align-items:center;justify-content:center;box-shadow:0 1px 4px rgba(0,0,0,.18)}
.swgate{position:absolute;top:-.6vw;right:-.35vw;background:var(--accent);color:#fff;font-size:.55vw;font-weight:800;padding:.06vw .45vw;border-radius:999px;letter-spacing:.03em}
.swname{color:var(--ink);font-size:.75vw;font-weight:700;line-height:1.3}
.swsub{color:var(--muted);font-size:.66vw;line-height:1.36;margin-top:.08vw}
.swnode.gate .swnode-in{border-width:2px;box-shadow:0 3px 12px rgba(37,99,235,.2)}
.swim-cap{color:var(--muted);font-size:.8vw;line-height:1.62}
.swim-cap b{color:var(--ink)}

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
.slide.active .cover-actors{animation:rise .65s cubic-bezier(.2,.6,.2,1) .34s both}
.slide.active .cover-meta{animation:rise .65s cubic-bezier(.2,.6,.2,1) .44s both}
.slide.active .toc-left>*{animation:rise .6s cubic-bezier(.2,.6,.2,1) both}
.slide.active .toc-left>:nth-child(2){animation-delay:.1s}
.slide.active .toc-left>:nth-child(3){animation-delay:.2s}
.slide.active .trow{animation:rise .5s cubic-bezier(.2,.6,.2,1) both}
.slide.active .trow:nth-child(2){animation-delay:.07s}
.slide.active .trow:nth-child(3){animation-delay:.14s}
.slide.active .trow:nth-child(4){animation-delay:.21s}
.slide.active .trow:nth-child(5){animation-delay:.28s}
.slide.active .trow:nth-child(6){animation-delay:.35s}
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

/* ─────────────────────────── 빌딩 블록 ─────────────────────────── */

function ContentSlide({
  no, sec, title, lede, children,
}: {
  no: string; sec: string; title: string; lede?: ReactNode; children: ReactNode
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

const Legend = () => (
  <div className="legend">
    <span className="leg"><i style={{ background: C.owner }} />발전소 소유주</span>
    <span className="leg"><i style={{ background: C.sys }} />플랫폼 (시스템)</span>
    <span className="leg"><i style={{ background: C.inst }} />LASEE 설치기업</span>
    <span className="leg"><i style={{ background: C.admin }} />관리자 (운영기관)</span>
  </div>
)

// 스윔레인 — 레인(주체)별 가로 밴드에 번호 노드를 시점 열에 배치하고 직교 연결선으로 흐름 연결
type Lane = { name: string[]; c: string }
type SwStep = { id: string | number; n?: number; lane: number; col: number; name: string; sub?: string; c: string; gate?: boolean }
type SwEdge = { from: string | number; to: string | number; fork?: boolean }

function Swimlane({
  lanes, steps, edges, ncol, markers = [],
}: {
  lanes: Lane[]; steps: SwStep[]; edges: SwEdge[]; ncol: number
  markers?: { left: string; top: string; text: string }[]
}) {
  const L = lanes.length
  const cx = (c: number) => ((c + 0.5) / ncol) * 100
  const cy = (l: number) => ((l + 0.5) / L) * 100
  const byId: Record<string, SwStep> = {}
  steps.forEach((s) => { byId[String(s.id)] = s })
  const normalEdges = edges.filter((e) => !e.fork)
  const forkMap: Record<string, SwEdge[]> = {}
  edges.filter((e) => e.fork).forEach((e) => { (forkMap[String(e.from)] ||= []).push(e) })
  const forkGroups = Object.entries(forkMap).map(([from, es]) => ({ from, es }))
  return (
    <div className="swim">
      <div className="swim-labels" style={{ gridTemplateRows: `repeat(${L},1fr)` }}>
        {lanes.map((l, i) => (
          <div key={i} className="swim-label" style={{ background: l.c }}>
            {l.name.map((t, j) => <div key={j}>{t}</div>)}
          </div>
        ))}
      </div>
      <div className="swim-canvas">
        <div className="swim-bands" style={{ gridTemplateRows: `repeat(${L},1fr)` }}>
          {lanes.map((_, i) => <div key={i} className="swim-band" />)}
        </div>
        <div className="swim-lines">
          {normalEdges.map((e, i) => {
            const a = byId[String(e.from)], b = byId[String(e.to)]
            const xa = cx(a.col), ya = cy(a.lane), xb = cx(b.col), yb = cy(b.lane)
            if (Math.abs(ya - yb) < 0.01)
              return <div key={i} className="swl-h" style={{ left: `${Math.min(xa, xb)}%`, top: `${ya}%`, width: `${Math.abs(xb - xa)}%` }} />
            const ym = (ya + yb) / 2
            return (
              <span key={i} style={{ display: 'contents' }}>
                <div className="swl-v" style={{ left: `${xa}%`, top: `${Math.min(ya, ym)}%`, height: `${Math.abs(ym - ya)}%` }} />
                <div className="swl-h" style={{ left: `${Math.min(xa, xb)}%`, top: `${ym}%`, width: `${Math.abs(xb - xa)}%` }} />
                <div className="swl-v" style={{ left: `${xb}%`, top: `${Math.min(ym, yb)}%`, height: `${Math.abs(yb - ym)}%` }} />
              </span>
            )
          })}
          {/* fork = 빗(comb) 모양: 소스에서 세로 버스 하나를 뽑아 각 레인으로 동시 분기 */}
          {forkGroups.map((g, gi) => {
            const s = byId[g.from]
            const sx = cx(s.col), sy = cy(s.lane)
            const tcols = g.es.map((e) => byId[String(e.to)].col)
            const busX = (sx + cx(Math.min(...tcols))) / 2
            const ys = [sy, ...g.es.map((e) => cy(byId[String(e.to)].lane))]
            const top = Math.min(...ys), bot = Math.max(...ys)
            return (
              <span key={`f${gi}`} style={{ display: 'contents' }}>
                <div className="swl-h fork" style={{ left: `${Math.min(sx, busX)}%`, top: `${sy}%`, width: `${Math.abs(busX - sx)}%` }} />
                <div className="swl-v fork" style={{ left: `${busX}%`, top: `${top}%`, height: `${bot - top}%` }} />
                {g.es.map((e, ei) => {
                  const t = byId[String(e.to)]
                  const tx = cx(t.col), ty = cy(t.lane)
                  return <div key={ei} className="swl-h fork" style={{ left: `${Math.min(busX, tx)}%`, top: `${ty}%`, width: `${Math.abs(tx - busX)}%` }} />
                })}
              </span>
            )
          })}
        </div>
        {markers.map((m, i) => (
          <div key={i} className="swim-mark" style={{ left: m.left, top: m.top }}>{m.text}</div>
        ))}
        {steps.map((s) => (
          <div
            key={String(s.id)}
            className={`swnode${s.gate ? ' gate' : ''}`}
            style={{ left: `${(s.col / ncol) * 100}%`, width: `${(1 / ncol) * 100}%`, top: `${cy(s.lane)}%` }}
          >
            <div className="swnode-in" style={{ borderColor: s.c }}>
              {s.n != null && <span className="swbadge" style={{ background: s.c }}>{s.n}</span>}
              {s.gate && <span className="swgate">GATE</span>}
              <div className="swname">{s.name}</div>
              {s.sub && <div className="swsub">{s.sub}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const LANES4: Lane[] = [
  { name: ['발전소', '소유주'], c: C.owner },
  { name: ['플랫폼', '(시스템)'], c: C.sys },
  { name: ['LASEE', '설치기업'], c: C.inst },
  { name: ['관리자', '(운영기관)'], c: C.admin },
]

/* ─────────────────────────── 목차 데이터 ─────────────────────────── */

const TOC = [
  { no: '01', t: '왜 설치기업 페르소나인가', d: '등록 이후 끊긴 프로세스 — 설치·검증·대응의 주체 부재', target: 2 },
  { no: '02', t: 'LASEE 설치기업 페르소나', d: '설치·시공을 넘어 O&M(이상감지 대응)까지 맡는 파트너', target: 3 },
  { no: '03', t: '전체 프로세스 · 5단계', d: '등록부터 이상감지 운영까지 하나의 파이프라인', target: 4 },
  { no: '04', t: '정상 플로우 — 등록에서 활성화까지', d: '검수 승인 이후에만 모니터링이 켜진다 (8단계)', target: 5 },
  { no: '05', t: '이상감지 — 동시 대응', d: '설치기업 조치와 관리자 확인이 병렬로 진행', target: 6 },
  { no: '06', t: '상태 정의와 주체별 기능', d: '9개 상태 흐름 + 설치기업·관리자·플랫폼 화면 요구', target: 7 },
]

/* ─────────────────────────── 슬라이드 ─────────────────────────── */

const buildSlides = (goTo: (i: number) => void): ReactNode[] => [
  /* 1. 표지 */
  <div className="dark-stage" key="cover">
    <p className="cover-eyebrow">Distributed Energy · RMS Platform</p>
    <h1 className="cover-title">
      LASEE 설치기업,<br />프로세스 안으로
    </h1>
    <p className="cover-sub">
      발전소 등록 → 자동 배정 → 설치 · 완료 검수 → 이상감지 운영까지 —<br />
      설치기업을 포함한 End-to-End 프로세스 정의
    </p>
    <div className="cover-actors">
      <span className="cact"><i style={{ background: C.owner }} />발전소 소유주</span>
      <span className="cact"><i style={{ background: C.sys }} />플랫폼 (시스템)</span>
      <span className="cact"><i style={{ background: C.inst }} />LASEE 설치기업</span>
      <span className="cact"><i style={{ background: C.admin }} />관리자 (운영기관)</span>
    </div>
    <div className="cover-meta">
      <img src="/images/logo.png" alt="RMS GROUP" />
      <i />
      <span>울산미포 에너지 자급자족 · 분산에너지 사업부</span>
      <i />
      <span>2026. 07</span>
    </div>
  </div>,

  /* 2. 목차 */
  <div className="toc" key="toc">
    <div className="toc-left">
      <p className="toc-eyebrow">Contents</p>
      <h2 className="toc-title">목차</h2>
      <p className="toc-lead">
        발전소가 등록되어도 설치할 주체가 없다면,<br />
        운영 데이터는 시작되지 않습니다.<br />
        설치기업을 프로세스 안으로 들여옵니다.
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

  /* 3. 01 — 왜 필요한가 (문제) */
  <ContentSlide
    key="s1"
    no="01"
    sec="문제 정의"
    title="왜 설치기업 페르소나가 필요한가"
    lede={
      <>발전소가 등록되어도 <b>설치 · 검증 · 현장 대응의 주체</b>가 프로세스에 없다.</>
    }
  >
    <div className="prob">
      <div className="prob-left">
        <div className="prob-left-h">현재 프로세스 — 등록 이후 단절</div>
        <div className="bflow">
          <div className="bnode reg"><b>발전소<br />등록</b></div>
          <span className="barrow">→</span>
          <div className="bnode miss"><b>설치·검증<br />주체 없음 ?</b></div>
          <span className="barrow dash">⇢</span>
          <div className="bnode det"><b>이상<br />감지</b></div>
        </div>
        <div className="prob-note">
          <b>LASEE가 설치되지 않으면 이상감지 데이터 자체가 발생하지 않는다.</b> 등록과 운영 사이의
          연결 고리가 프로세스 밖(전화 · 수기)에 존재한다.
        </div>
      </div>
      <div className="prob-right">
        <div className="pncard">
          <span className="pncard-no">1</span>
          <div>
            <div className="pncard-t">배정 프로세스 부재</div>
            <div className="pncard-d">등록 승인 후 어느 설치기업이 언제 시공할지 시스템상 정의 · 추적 불가</div>
          </div>
        </div>
        <div className="pncard">
          <span className="pncard-no">2</span>
          <div>
            <div className="pncard-t">완료 검증 단계 부재</div>
            <div className="pncard-d">설치 품질 · 완료 증빙(사진 · 체크리스트)을 남기고 승인하는 절차 없음</div>
          </div>
        </div>
        <div className="pncard">
          <span className="pncard-no">3</span>
          <div>
            <div className="pncard-t">이상감지 대응 주체 불명확</div>
            <div className="pncard-d">이상 알림 이후 누가 점검 · 조치하고 결과를 남기는지 정의되지 않음</div>
          </div>
        </div>
      </div>
    </div>

    <div className="prob-sol">
      <div className="prob-sol-h">해결 방향</div>
      <div className="prob-sol-d">
        &lsquo;LASEE 설치기업&rsquo; 페르소나를 추가하고, 등록 → 자동 배정 → 설치 → 완료 검수 →
        이상감지 대응을 <b>플랫폼 안의 하나의 파이프라인</b>으로 연결한다.
      </div>
    </div>
  </ContentSlide>,

  /* 4. 02 — 페르소나 정의 */
  <ContentSlide
    key="s2"
    no="02"
    sec="페르소나"
    title="설치를 넘어, 이상감지 대응까지 맡는 파트너"
    lede={
      <>플랫폼에서 발전소를 <span className="hv">자동 배정</span>받아 LASEE를 설치 · 완료 보고하고,
      검수 이후에도 <b>이상감지 발생 시 점검 · 조치</b>를 수행하는 설치 · O&amp;M 파트너 기업.</>
    }
  >
    <div className="phero">
      <div className="pav"><span className="material-symbols-outlined">engineering</span></div>
      <div>
        <div className="pdef-name"><b>LASEE 설치기업</b>
          <span className="leg"><i style={{ background: C.inst, width: '.45vw', height: '.45vw', borderRadius: '50%', display: 'inline-block' }} />설치 · O&amp;M 파트너</span>
        </div>
        <div className="pdef-desc">
          핵심 여정 —{' '}
          <b>배정 수락</b> → <b>일정 협의</b> → <b>설치 · 완료 보고</b> → <b>검수</b> → <b>이상 대응</b>
        </div>
      </div>
    </div>

    <div className="pcols">
      <div className="pcol goal">
        <div className="pcol-h"><span className="material-symbols-outlined">flag</span><b>목표 (Goals)</b></div>
        <div className="plist">
          <div className="pli">배정 물량을 안정적으로 확보하고 이동 · 일정을 효율화</div>
          <div className="pli">설치 → 검수 → 정산 리드타임 단축</div>
          <div className="pli">조치 이력 · 실적을 축적해 재배정 우선순위 확보</div>
        </div>
      </div>
      <div className="pcol pain">
        <div className="pcol-h"><span className="material-symbols-outlined">warning</span><b>페인포인트</b></div>
        <div className="plist">
          <div className="pli">배정 · 일정 협의가 전화 · 엑셀로 분산되어 누락 발생</div>
          <div className="pli">완료 증빙 기준이 없어 검수 반려 · 분쟁 소지</div>
          <div className="pli">이상 발생 시 대응 범위 · 책임이 불명확</div>
        </div>
      </div>
      <div className="pcol func">
        <div className="pcol-h"><span className="material-symbols-outlined">grid_view</span><b>필요 화면 · 기능</b></div>
        <div className="plist">
          <div className="pli">배정 알림함 · 수락/반려, 작업 일정 관리</div>
          <div className="pli">설치 완료 보고 (사진 · 체크리스트 업로드)</div>
          <div className="pli">이상 알림 수신, 조치 결과 등록, 실적 대시보드</div>
        </div>
      </div>
    </div>
  </ContentSlide>,

  /* 5. 03 — 전체 5단계 */
  <ContentSlide
    key="s3"
    no="03"
    sec="프로세스"
    title="등록부터 운영까지, 하나의 파이프라인"
    lede={
      <>설치기업 추가로 <b>등록 · 배정 · 설치 · 검수 · 운영</b>을 끊김 없이 연결한다.
      각 단계의 <span className="hl">주체가 시스템 안에서 분명해진다.</span></>
    }
  >
    <Legend />
    <div className="pflow">
      {[
        { no: '01', name: '발전소 등록', who: '소유주', c: C.owner, d: '발전소 · 설비 정보 등록, 관리자 검토 후 승인' },
        { no: '02', name: '자동 배정', who: '플랫폼', c: C.sys, d: '지역 · 용량 · 가용성 기준 설치기업 자동 매칭 · 알림' },
        { no: '03', name: 'LASEE 설치', who: '설치기업', c: C.inst, d: '배정 수락 → 현장 실사 → 설치 → 완료 보고 등록' },
        { no: '04', name: '완료 검수', who: '관리자', c: C.admin, d: '완료 증빙 검수 · 승인, 모니터링 활성화 전환' },
        { no: '05', name: '이상감지 운영', who: '설치기업+관리자', c: C.inst, d: '동시 알림 → 점검 · 조치와 확인 · 전달 병행' },
      ].map((s, i, arr) => (
        <span key={s.no} style={{ display: 'contents' }}>
          <div className="pcell">
            <span className="pno" style={{ color: s.c }}>{s.no}</span>
            <span className="pname">{s.name}</span>
            <span className="pactor" style={{ color: s.c }}><i style={{ background: s.c }} />{s.who}</span>
            <span className="pdesc">{s.d}</span>
          </div>
          {i < arr.length - 1 && <span className="parr">→</span>}
        </span>
      ))}
    </div>

    <div className="coda">
      <b>핵심 변경점</b>{'  '}
      <span className="num">1</span>02단계 자동 배정 엔진 신설(수동 배정 없음){'   '}
      <span className="num">2</span>04단계 검수 통과 시에만 모니터링 활성{'   '}
      <span className="num">3</span>05단계는 설치기업 · 관리자에게 <b>동시 알림</b>(순차 전달 아님)
    </div>
  </ContentSlide>,

  /* 6. 04 — 정상 플로우 스윔레인 (원본 도표 ① 재현) */
  <ContentSlide
    key="s4"
    no="04"
    sec="프로세스 · 도표 ①"
    title="등록 → 배정 → 설치 → 모니터링 활성화"
    lede={
      <>설치기업 추가로 <b>등록 신청부터 개시 알림 확인까지 9단계</b>를 하나로 잇는다.
      각 단계의 <span className="hl">주체가 레인 위에서 분명해진다.</span></>
    }
  >
    <Swimlane
      ncol={9}
      lanes={LANES4}
      steps={[
        { id: 1, n: 1, lane: 0, col: 0, name: '발전소 등록 신청', c: C.owner },
        { id: 2, n: 2, lane: 3, col: 1, name: '등록 검토 · 승인', c: C.admin },
        { id: 3, n: 3, lane: 1, col: 2, name: '설치기업 자동 배정', sub: '지역·용량·가용성', c: C.sys },
        { id: 4, n: 4, lane: 2, col: 3, name: '배정 수락 · 일정 협의', c: C.inst },
        { id: 5, n: 5, lane: 2, col: 4, name: '현장 실사 · 설치', c: C.inst },
        { id: 6, n: 6, lane: 2, col: 5, name: '설치 완료 보고', sub: '사진·체크리스트', c: C.inst },
        { id: 7, n: 7, lane: 3, col: 6, name: '완료 검수 · 승인', c: C.admin, gate: true },
        { id: 8, n: 8, lane: 1, col: 7, name: '모니터링 활성화', sub: '개시 알림', c: C.sys },
        { id: 9, n: 9, lane: 0, col: 8, name: '개시 알림 확인', sub: '소유주 통보', c: C.owner },
      ]}
      edges={[
        { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4 }, { from: 4, to: 5 },
        { from: 5, to: 6 }, { from: 6, to: 7 }, { from: 7, to: 8 }, { from: 8, to: 9 },
      ]}
    />

    <p className="swim-cap">
      <b>완료 검수 · 승인(7)</b>이라는 관문을 통과해야 모니터링이 활성화되며, 이때부터 이상감지
      프로세스(도표 ②)가 동작한다. 활성화 후 <b>개시 알림(8)</b>은 발전소 소유주에게 통보(9)된다.
    </p>
  </ContentSlide>,

  /* 7. 05 — 이상감지 병렬 대응 스윔레인 (원본 도표 ② 재현) */
  <ContentSlide
    key="s5"
    no="05"
    sec="프로세스 · 도표 ②"
    title="이상감지 — 설치기업 · 관리자 동시 대응"
    lede={
      <>동시 알림 이후 설치기업의 <span className="hv">점검 · 조치</span>와 관리자의 <b>확인 · 전달</b>이
      순차가 아닌 <b>병렬</b>로 진행된다. 조치 결과는 관리자 검수 후 정상화 · 실적 반영된다.</>
    }
  >
    <Swimlane
      ncol={6}
      lanes={LANES4}
      markers={[{ left: '33.3%', top: '50%', text: '동시 · 병렬' }]}
      steps={[
        { id: 'a', lane: 1, col: 0, name: '이상감지 발생', sub: '임계치·패턴 분석', c: C.sys },
        { id: 'b', lane: 1, col: 1, name: '동시 알림 발송', sub: '푸시·SMS', c: C.sys },
        // ── 동시 · 병렬: 세 주체가 알림을 확인 (같은 열) ──
        { id: 'o', lane: 0, col: 2, name: '알림 수신 · 진행 확인', c: C.owner },
        { id: 'i1', lane: 2, col: 2, name: '알림 수신 · 원격 점검', c: C.inst },
        { id: 'm1', lane: 3, col: 2, name: '이상 내용 확인', c: C.admin },
        // ── 이후는 시간순 스텝 (열이 오른쪽으로 이동) ──
        { id: 'i2', lane: 2, col: 3, name: '조치 · 결과 등록', sub: '현장 조치 후 등록', c: C.inst },
        { id: 'm2', lane: 3, col: 4, name: '조치 결과 검수 · 승인', c: C.admin },
        { id: 'done', lane: 1, col: 5, name: '정상화 · 이력 반영', sub: '설치기업 실적 반영', c: C.sys },
      ]}
      edges={[
        { from: 'a', to: 'b' },
        // ㄱ자 빗 모양 동시 분기: 소유주(위) · 설치기업 · 관리자(아래)
        { from: 'b', to: 'o', fork: true }, { from: 'b', to: 'i1', fork: true }, { from: 'b', to: 'm1', fork: true },
        // 시간순: 설치기업 확인 → 조치·등록 → 관리자 검수 → 정상화
        { from: 'i1', to: 'i2' }, { from: 'i2', to: 'm2' },
        { from: 'm1', to: 'm2' }, { from: 'm2', to: 'done' },
      ]}
    />

    <p className="swim-cap">
      알림은 <b>세 주체가 동시에</b> 확인한다(발전소 소유주는 진행 상황만 통보받음). 이후
      <b> 설치기업 조치 · 등록 → 관리자 검수 · 승인 → 정상화</b>는 동시가 아니라 <b>시간순으로</b>
      진행되고, 결과는 설치기업 실적 이력에 반영된다.
    </p>
  </ContentSlide>,

  /* 8. 06 — 상태 정의 + 주체별 기능 */
  <ContentSlide
    key="s6"
    no="06"
    sec="상태 · 기능"
    title="9개 상태와, 주체별로 필요한 화면"
    lede={
      <>플랫폼이 관리해야 할 발전소 <b>상태 흐름</b>과 주체별 <b>화면 요구사항</b>.
      마지막 세 상태는 모니터링 활성 이후 <span className="hl">반복 발생하는 순환</span>이다.</>
    }
  >
    <div>
      <div className="block-label"><b>발전소 상태 머신</b></div>
      <div className="states">
        {['등록요청', '승인완료', '배정완료', '설치중', '설치완료', '모니터링 활성'].map((s, i) => (
          <span key={s} style={{ display: 'contents' }}>
            <span className="schip"><span className="sd" style={{ background: C.sys }} />{s}</span>
            <span className="sarw">→</span>
          </span>
        ))}
        {['이상감지', '조치중', '정상화'].map((s, i, a) => (
          <span key={s} style={{ display: 'contents' }}>
            <span className="schip cyc"><span className="sd" />{s}</span>
            {i < a.length - 1 && <span className="sarw">→</span>}
          </span>
        ))}
      </div>
      <div className="cyc-note">
        <span className="material-symbols-outlined">cached</span>
        이상감지 → 조치중 → 정상화는 &lsquo;모니터링 활성&rsquo; 이후 반복 발생하는 순환 상태
      </div>
    </div>

    <div className="funcs">
      <div className="fcol">
        <div className="fcol-h">
          <div className="fcol-ic" style={{ background: C.inst }}><span className="material-symbols-outlined">engineering</span></div>
          <div><b>LASEE 설치기업</b><small>설치 · O&amp;M 파트너</small></div>
        </div>
        <div className="fitem"><b>배정 알림함</b><span>수락 / 반려, 마감시한 표시</span></div>
        <div className="fitem"><b>작업 관리</b><span>일정 · 현장 실사 · 설치 체크리스트</span></div>
        <div className="fitem"><b>완료 보고</b><span>사진 · 시리얼 등록, 검수 요청</span></div>
        <div className="fitem"><b>이상 대응</b><span>알림 수신, 조치 결과 등록, 실적 조회</span></div>
      </div>
      <div className="fcol">
        <div className="fcol-h">
          <div className="fcol-ic" style={{ background: C.admin }}><span className="material-symbols-outlined">admin_panel_settings</span></div>
          <div><b>관리자</b><small>운영기관</small></div>
        </div>
        <div className="fitem"><b>등록 승인</b><span>발전소 정보 검토 · 반려 사유 관리</span></div>
        <div className="fitem"><b>검수</b><span>완료 증빙 확인, 모니터링 활성 승인</span></div>
        <div className="fitem"><b>이상 현황</b><span>전체 이상 목록, 소유주 전달 · 안내</span></div>
        <div className="fitem"><b>설치기업 관리</b><span>실적 · 조치 이력 · 재배정 기준</span></div>
      </div>
      <div className="fcol">
        <div className="fcol-h">
          <div className="fcol-ic" style={{ background: C.sys }}><span className="material-symbols-outlined">settings_suggest</span></div>
          <div><b>플랫폼</b><small>시스템</small></div>
        </div>
        <div className="fitem"><b>자동 배정 엔진</b><span>지역 · 용량 · 가용성 매칭 규칙</span></div>
        <div className="fitem"><b>동시 알림</b><span>설치기업 + 관리자 푸시 · SMS 발송</span></div>
        <div className="fitem"><b>상태 머신</b><span>위 9단계 상태 전이 · 이력 관리</span></div>
        <div className="fitem"><b>통계</b><span>조치 소요시간 · 재발률 등 운영 지표</span></div>
      </div>
    </div>

    <div className="next">
      <div className="next-ic"><span className="material-symbols-outlined">arrow_forward</span></div>
      <div>
        <div className="next-t">NEXT STEP</div>
        <div className="next-d">
          현행 이상감지 상세 화면(모니터링 &gt; 이상감지)에 <b>&lsquo;조치 결과 등록 · 담당 설치기업&rsquo;</b> 영역을
          추가하고, <b>자동 배정 매칭 규칙</b>(지역 · 용량 · 가용성 가중치)을 별도 정책으로 정의
        </div>
      </div>
    </div>
  </ContentSlide>,

  /* 9. 마무리 */
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
