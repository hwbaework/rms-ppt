'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// 통합에너지플랫폼 구축 현황 발표 — 2026.07.30  (에디토리얼 스타일)
// 원본 자료: "발표자료 시나리오v0.1.hwpx"
// 구성 원칙: 시나리오 13페이지 = 슬라이드 13장, 순서·페이지 번호 1:1 그대로.
//   임의 재편성(목차 추가·챕터 묶기) 금지 — 사용자 페이지 구성을 그대로 따른다.
//   멘트가 설명을 담당 → 화면은 각 페이지의 포인트를 도식·이미지 슬롯으로.
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
.cover-title{color:#fff;font-size:3.7vw;font-weight:900;letter-spacing:-.02em;line-height:1.18;margin-bottom:1.2vw;position:relative;z-index:1}
.cover-sub{color:rgba(191,209,238,.85);font-size:1.15vw;font-weight:300;line-height:1.8;margin-bottom:2.2vw;position:relative;z-index:1}
.cover-sub b{color:#fff;font-weight:600}
.cover-steps{display:flex;align-items:center;gap:.7vw;margin-bottom:3vw;position:relative;z-index:1;flex-wrap:wrap}
.cover-step{display:inline-flex;align-items:center;gap:.5vw;border:1px solid rgba(127,168,232,.35);border-radius:999px;padding:.34vw 1vw;color:rgba(191,209,238,.9);font-size:.78vw;font-weight:600}
.cover-step .material-symbols-outlined{font-size:.95vw;color:var(--accent-soft)}
.cover-step small{font-weight:400;opacity:.75}
.cover-step-arr{color:rgba(127,168,232,.5);font-size:.9vw}
.cover-meta{display:flex;align-items:center;gap:1vw;color:rgba(148,168,200,.85);font-size:.9vw;position:relative;z-index:1}
.cover-meta img{height:1.35vw;filter:brightness(0) invert(1);opacity:.9}
.cover-meta i{width:3px;height:3px;border-radius:50%;background:rgba(148,168,200,.5)}

/* ── 목차 (좌 네이비 패널 + 우 에디토리얼 리스트) ── */
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

/* ── 아이콘 타일 ── */
.press{display:grid;grid-template-columns:repeat(4,1fr);gap:.8vw}
.press.p3{grid-template-columns:repeat(3,1fr)}
.press-card{background:#fff;border:1px solid var(--hair);border-radius:14px;padding:1vw .8vw;text-align:center;display:flex;flex-direction:column}
/* 상태 바·태그는 카드 하단에 정렬 — 타일마다 줄 수가 달라도 라인이 맞도록 */
.press-card .wip,.press-card .wip-done,.press-card .wip-empty{margin-top:auto}
.press-card .press-k+.wip,.press-card .press-k+.wip-done,.press-card .press-k+.wip-empty{padding-top:.55vw}
.press-card.soon{background:var(--chip);border-style:dashed}
.press-ic{width:2.6vw;height:2.6vw;border-radius:50%;margin:0 auto .45vw;display:flex;align-items:center;justify-content:center;background:var(--tint);color:var(--accent)}
.press-ic .material-symbols-outlined{font-size:1.35vw}
.press-card.soon .press-ic{background:#eef1f7;color:#64748b}
.press-k{color:var(--ink);font-size:1.08vw;font-weight:800;letter-spacing:-.01em}
.press-d{color:var(--muted);font-size:.8vw;line-height:1.55;margin-top:.3vw}

/* ── 태그 ── */
.tag{display:inline-flex;align-items:center;gap:.38vw;border:1px solid var(--hair);border-radius:999px;padding:.16vw .75vw;font-size:.74vw;font-weight:600;color:var(--muted);background:#fff}
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
.mnode-t{font-size:.92vw;font-weight:700;color:var(--ink);line-height:1.35}
.mnode-s{font-size:.74vw;color:var(--muted);line-height:1.5}
.mflow-arr{color:#c3ccda;font-size:1.3vw;flex-shrink:0}
.mlink{display:flex;flex-direction:column;align-items:center;gap:.2vw;flex-shrink:0}
.mlink-lab{background:var(--tint);border:1px solid var(--tint-line);color:var(--accent);border-radius:999px;padding:.13vw .75vw;font-size:.72vw;font-weight:700;white-space:nowrap}

/* ── 대비 패널 (통상 방식 vs RMS 방식) ── */
.vs{display:grid;grid-template-columns:1fr 1.15fr;gap:1vw;flex:1;align-items:stretch}
.vs-panel{border:2px dashed #cbd5e1;border-radius:14px;background:#f8fafc;padding:1.1vw 1.2vw;display:flex;flex-direction:column;gap:1vw;justify-content:center}
.vs-panel.ours{border:1px solid #b9d2f8;background:linear-gradient(180deg,#ffffff 0%,#f7faff 100%);box-shadow:0 6px 24px rgba(37,99,235,.09)}
.vs-h{display:flex;align-items:center;gap:.5vw;font-size:1.02vw;font-weight:800;color:#64748b;justify-content:center}
.vs-h .material-symbols-outlined{font-size:1.1vw}
.vs-panel.ours .vs-h{color:var(--accent)}

/* ── 순환 사이클 (메인 플랫폼 중심 — 가입→참여→수익→관리가 고리로 돈다) ──
   정사각(aspect-ratio 1) 영역에 그린다 — 비정사각이면 선·화살촉이 늘어나 왜곡됨 */
.cyc{position:relative;width:100%;max-width:23.5vw;aspect-ratio:1;align-self:center;margin:1.8vw auto 0}
.cyc svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible}
.cyc-glow{position:absolute;left:50%;top:47%;transform:translate(-50%,-50%);width:15vw;height:15vw;border-radius:50%;background:radial-gradient(circle,rgba(37,99,235,.10),transparent 65%);pointer-events:none}
/* 죽은 납품형 — 세로 타임라인 (아래로 흘러가 끊긴다) */
.dead{display:flex;flex-direction:column;align-self:center}
.dead-row{display:flex;align-items:center;gap:.9vw}
.dead-ic{width:2.6vw;height:2.6vw;border-radius:50%;background:#eef1f5;border:1px solid #e2e8f0;color:#64748b;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.dead-ic .material-symbols-outlined{font-size:1.2vw}
.dead-row.stop .dead-ic{background:#fef2f2;border-color:#fecaca;color:#dc2626}
.dead-row b{font-size:.92vw;color:#475569;font-weight:700}
.dead-row small{display:block;font-size:.72vw;color:#94a3b8;margin-top:.1vw}
.dead-link{width:2px;height:2.1vw;margin-left:1.3vw;background:repeating-linear-gradient(180deg,#cbd5e1 0 4px,transparent 4px 8px)}
.cyc-seg{fill:none;stroke:#aac3ee;stroke-width:1.3;stroke-linecap:round}
/* 빛나는 점 — CSS motion path로 각 호를 따라 이동 (SMIL은 이 환경에서 타임라인이 멈춰 있어 사용 불가) */
.cyc-dot{fill:#3b82f6;offset-rotate:0deg;animation:travel 3s linear infinite}
@keyframes travel{0%{offset-distance:0%;opacity:0}12%{opacity:1}88%{opacity:1}100%{offset-distance:100%;opacity:0}}
.cnode{position:absolute;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:.24vw;text-align:center;z-index:1}
.cnode-ic{position:relative;width:2.6vw;height:2.6vw;border-radius:50%;background:linear-gradient(180deg,#ffffff,#f6f9ff);border:1px solid #e3ebf7;color:var(--accent);display:flex;align-items:center;justify-content:center;box-shadow:0 2px 5px rgba(11,21,38,.05),0 10px 22px rgba(37,99,235,.10)}
.cnode-ic .material-symbols-outlined{font-size:1.2vw}
.cnode-no{position:absolute;top:-.35vw;right:-.42vw;width:1.1vw;height:1.1vw;border-radius:50%;background:linear-gradient(135deg,#1d4ed8,#3b82f6);border:2px solid #fff;color:#fff;font-size:.56vw;font-weight:800;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(29,78,216,.35)}
.cnode b{font-size:.98vw;color:var(--ink);white-space:nowrap;letter-spacing:-.01em}
.cnode small{font-size:.8vw;color:var(--muted);white-space:nowrap}
/* 라벨에 종이색 배경 — 궤도 선이 근처를 지나도 글자를 가리지 않는다 */
.cnode-tx{display:flex;flex-direction:column;gap:.12vw;align-items:center;background:var(--paper);padding:.15vw .55vw;border-radius:9px}
/* 좌우 노드 — 라벨을 원 바깥쪽으로 빼서 궤도 선이 글자를 가리지 않게 */
.cnode.hr{flex-direction:row;gap:.75vw;transform:translate(-1.3vw,-50%)}
.cnode.hr .cnode-tx{align-items:flex-start;text-align:left}
.cnode.hl2{flex-direction:row-reverse;gap:.75vw;transform:translate(calc(-100% + 1.3vw),-50%)}
.cnode.hl2 .cnode-tx{align-items:flex-end;text-align:right}
/* 살아있는 허브 — 유리질감 구체 + 은은한 펄스 */
.ihub-wrap{position:absolute;left:50%;top:47%;transform:translate(-50%,-50%);width:5.8vw;height:5.8vw;z-index:1}
.ihub-c{position:absolute;inset:0;border-radius:50%;background:
  radial-gradient(circle at 30% 24%,rgba(255,255,255,.38) 0%,transparent 42%),
  linear-gradient(135deg,#1e40af 0%,#2563eb 55%,#3b82f6 100%);
  border:1px solid rgba(255,255,255,.22);color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.12vw;box-shadow:0 12px 32px rgba(30,64,175,.35),inset 0 1px 0 rgba(255,255,255,.28);z-index:1;text-align:center}
.ihub-c .material-symbols-outlined{font-size:1.4vw}
.ihub-c b{font-size:.8vw;line-height:1.3;letter-spacing:-.01em}
.ihub-ring{position:absolute;inset:0;border-radius:50%;border:1.5px solid rgba(37,99,235,.32);animation:ringout 3s ease-out infinite}
.ihub-ring.r2{animation-delay:1.5s}
@keyframes ringout{from{transform:scale(1);opacity:.65}to{transform:scale(1.9);opacity:0}}

/* ── 페르소나 허브 (중앙 플랫폼 + 5 방사 노드) ── */
.hub{position:relative;flex:1;min-height:13vw}
.hub svg{position:absolute;inset:0;width:100%;height:100%}
.hub-c{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:9.5vw;height:9.5vw;border-radius:50%;background:linear-gradient(135deg,#1d4ed8,#2563eb);color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.25vw;box-shadow:0 10px 34px rgba(37,99,235,.28);z-index:1;text-align:center;padding:.6vw}
.hub-c .material-symbols-outlined{font-size:1.7vw}
.hub-c b{font-size:.84vw;line-height:1.35}
.hub-c small{font-size:.62vw;opacity:.75}
.pnode{position:absolute;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:.3vw;z-index:1;text-align:center}
.pnode-ic{width:3.2vw;height:3.2vw;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;box-shadow:0 5px 16px rgba(11,21,38,.16);animation:personaPop 7.5s ease-in-out infinite}
@keyframes personaPop{0%,14%,100%{transform:scale(1)}4%,10%{transform:scale(1.16);box-shadow:0 8px 24px rgba(37,99,235,.32)}}
/* 연결선 대시가 허브 쪽으로 계속 흘러들어온다 */
.hub svg line{animation:lineflow 1.4s linear infinite}
@keyframes lineflow{to{stroke-dashoffset:2.5}}
/* 허브 주위로 퍼지는 링 */
.hub-ring{position:absolute;left:50%;top:50%;width:9.5vw;height:9.5vw;border-radius:50%;border:1.5px solid rgba(37,99,235,.3);animation:hubring 3s ease-out infinite;pointer-events:none}
.hub-ring.r2{animation-delay:1.5s}
@keyframes hubring{from{transform:translate(-50%,-50%) scale(1);opacity:.6}to{transform:translate(-50%,-50%) scale(1.6);opacity:0}}
.pnode-ic .material-symbols-outlined{font-size:1.5vw}
.pnode b{font-size:.82vw;color:var(--ink)}

/* ── 질문 3단 (에디토리얼 — 고스트 숫자 + 헤어라인 + 수렴선) ── */
.qrow{display:grid;grid-template-columns:repeat(3,1fr);flex:1;align-content:center}
.qcol{position:relative;padding:2.2vw 1.8vw 2vw;display:flex;flex-direction:column;gap:.9vw;justify-content:center}
.qcol+.qcol{border-left:1px solid var(--hair)}
.q-ghost{position:absolute;top:0;right:1.2vw;font-size:6vw;font-weight:900;line-height:1;letter-spacing:-.04em;user-select:none;background:linear-gradient(180deg,#b9cff0 0%,#e2ecfb 85%);-webkit-background-clip:text;background-clip:text;color:transparent}
.q-chip{width:2.6vw;height:2.6vw;border-radius:50%;background:var(--tint);color:var(--accent);display:flex;align-items:center;justify-content:center;position:relative;z-index:1}
.q-chip .material-symbols-outlined{font-size:1.3vw}
.q-text{position:relative;z-index:1;font-size:1.3vw;font-weight:800;color:var(--ink);line-height:1.55;letter-spacing:-.015em}
.q-text .hl{color:var(--accent)}
.q-cap{display:block;font-size:.85vw;color:var(--muted);font-weight:500;margin-top:.5vw;letter-spacing:0}
.qcol:after{content:"";position:absolute;left:50%;bottom:-1.15vw;width:1.5px;height:1.15vw;background:linear-gradient(180deg,#dbe3f0,#93c5fd)}
.ans{margin-top:1.15vw;background:linear-gradient(90deg,#0f2a5f,#1d4ed8 55%,#2563eb);border-radius:14px;padding:1vw 1.6vw;display:flex;align-items:center;gap:1.1vw;color:#fff;box-shadow:0 10px 28px rgba(30,64,175,.25)}
.ans>.material-symbols-outlined{font-size:1.35vw;color:#bcd3fa}
.ans-t{font-size:1.05vw;font-weight:700;flex:1}
.ans-fn{display:flex;gap:.45vw;flex-wrap:wrap;justify-content:flex-end}
.ans-pill{border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.08);border-radius:999px;padding:.2vw .85vw;font-size:.76vw;font-weight:600;color:#dbe7ff;white-space:nowrap}
.ans-arr{color:#9db9e8;font-size:.9vw;font-weight:700}

/* ── 기능 슬라이드 분할 ── */
.feat{display:grid;grid-template-columns:1fr 1fr;gap:1.1vw;flex:1;align-items:stretch}
.fcol{display:flex;flex-direction:column;gap:1vw;justify-content:center}
.pbox{border:1.5px solid #93c5fd;border-radius:14px;background:var(--tint);padding:1.5vw 1.2vw 1.2vw;position:relative}
.pbox-tag{position:absolute;top:-.75vw;left:50%;transform:translateX(-50%);background:var(--accent);color:#fff;border-radius:999px;padding:.16vw .9vw;font-size:.7vw;font-weight:700;white-space:nowrap}

/* ── 2026 연간 트랙 (상반기 진행 → 하반기 예정 + 현재 마커) ── */
.yeartrack{position:relative;height:2.3vw;display:flex}
.yt-h1{width:53%;background:linear-gradient(90deg,#1d4ed8,#3b82f6);border-radius:999px 0 0 999px;color:#fff;display:flex;align-items:center;justify-content:center;gap:.5vw;font-size:.87vw;font-weight:700;position:relative;overflow:hidden}
.yt-h1 .material-symbols-outlined{font-size:.95vw}
.yt-h1:after{content:"";position:absolute;inset:0;background:linear-gradient(100deg,transparent 30%,rgba(255,255,255,.35) 50%,transparent 70%);transform:translateX(-100%);animation:sheen 2.6s ease-in-out infinite}
@keyframes sheen{to{transform:translateX(100%)}}
.yt-h2{flex:1;border:1.5px dashed #b9c6dd;border-left:none;border-radius:0 999px 999px 0;background:var(--chip);color:var(--muted);display:flex;align-items:center;justify-content:center;font-size:.87vw;font-weight:700}
.yt-now{position:absolute;top:-1.3vw;transform:translateX(-50%);color:var(--accent);font-size:.72vw;font-weight:800;display:flex;flex-direction:column;align-items:center;line-height:1.2;z-index:1}
.yt-now:after{content:"";width:2px;height:3.3vw;background:var(--accent);border-radius:2px;margin-top:.15vw;box-shadow:0 0 8px rgba(37,99,235,.45)}
.split43{display:grid;grid-template-columns:53fr 47fr;gap:1vw}
/* 구축 중 — 움직이는 작업 스트라이프 (진행률 주장 없이 "작업 중" 상태 표시) */
.wip{height:.4vw;border-radius:999px;overflow:hidden;background:#e6ecf7;margin-top:.55vw}
.wip i{display:block;height:100%;border-radius:999px;background:repeating-linear-gradient(-45deg,#2563eb 0 .45vw,#60a5fa .45vw .9vw);background-size:1.28vw 100%;animation:crawl 1.1s linear infinite}
@keyframes crawl{to{background-position:1.28vw 0}}
.wip-empty{height:.4vw;border-radius:999px;border:1.5px dashed #c9d3e2;margin-top:.55vw}
/* 구축 완료 — 꽉 찬 바 + 은은한 스윕 (지금은 QA·안정화 단계) */
.wip-done{height:.4vw;border-radius:999px;background:linear-gradient(90deg,#1d4ed8,#3b82f6);position:relative;overflow:hidden;margin-top:.55vw}
.wip-done:after{content:"";position:absolute;inset:0;background:linear-gradient(100deg,transparent 30%,rgba(255,255,255,.5) 50%,transparent 70%);transform:translateX(-100%);animation:sheen 2.4s ease-in-out infinite}
.press-st{margin-top:.45vw;display:flex;justify-content:center}
.tag.live i{animation:livepulse 1.6s ease-in-out infinite}
@keyframes livepulse{0%,100%{opacity:.4}50%{opacity:1}}

/* ── 단계 레인 (트랙 라벨 + 스텝 칩 체인 — 사업계획서 세부추진일정 재구성) ── */
.glanes{background:var(--card);border:1px solid var(--hair);border-radius:14px;overflow:hidden}
.glane{display:flex;align-items:center;gap:1vw;padding:.6vw 1vw;border-bottom:1px solid var(--hair)}
.glane:last-child{border-bottom:none}
.glane-who{width:13.5vw;flex-shrink:0;display:flex;align-items:center;gap:.5vw;color:var(--ink);font-size:.88vw;font-weight:700}
.glane-who .material-symbols-outlined{font-size:1.05vw;color:var(--accent)}
.glane-steps{flex:1;display:flex;align-items:center;gap:.45vw;flex-wrap:wrap}
.gchip{background:var(--chip);border-radius:8px;padding:.34vw .75vw;color:var(--ink);font-size:.81vw;font-weight:600;white-space:nowrap}
.gchip.on{background:var(--tint);border:1px solid var(--tint-line);color:#1d4ed8}
.garr{color:#c3ccda;font-size:.85vw;flex-shrink:0}

/* ── 구축률 누적 바 (연차별 목표 세그먼트) ── */
.pbar{display:flex;height:1.5vw;border-radius:8px;overflow:hidden}
.pseg{display:flex;align-items:center;justify-content:center;color:#fff;font-size:.74vw;font-weight:700;white-space:nowrap}
.pseg.y1{background:#93c5fd}
.pseg.y2{background:#60a5fa}
.pseg.y3{background:var(--accent)}
.pseg.y4{background:#e2e8f0;color:#64748b}
.pbar-cap{position:relative;height:1.2vw;margin-top:.3vw}
.pbar-mark{position:absolute;transform:translateX(-50%);color:var(--accent);font-size:.76vw;font-weight:800;white-space:nowrap}
.pbar-mark:before{content:"▲";display:block;text-align:center;font-size:.55vw;line-height:1}

/* ── 근거 캡션 ── */
.srcline{color:var(--muted);font-size:.74vw;line-height:1.6}

/* ── 딥링크 연동 다이어그램 (허브 → 트렁크·분기선 → 신규 플랫폼 3) ── */
.lk-panel{background:linear-gradient(180deg,#ffffff,#f7faff);border:1px solid #dbe6f5;border-radius:16px;padding:1.5vw 1.8vw;display:flex;flex-direction:column;gap:1.2vw;flex:1;justify-content:center;box-shadow:0 6px 24px rgba(37,99,235,.07)}
.lk-grid{display:grid;grid-template-columns:auto 7vw 1fr;align-items:center}
.lk-hub{width:10vw;padding:1.4vw .9vw;border-radius:18px;background:
  radial-gradient(circle at 30% 22%,rgba(255,255,255,.35) 0%,transparent 45%),
  linear-gradient(135deg,#1e40af 0%,#2563eb 55%,#3b82f6 100%);
  border:1px solid rgba(255,255,255,.22);color:#fff;display:flex;flex-direction:column;align-items:center;gap:.35vw;text-align:center;box-shadow:0 12px 30px rgba(30,64,175,.32),inset 0 1px 0 rgba(255,255,255,.28)}
.lk-hub .material-symbols-outlined{font-size:1.7vw}
.lk-hub b{font-size:.98vw;letter-spacing:-.01em}
.lk-hub small{font-size:.72vw;opacity:.8;line-height:1.5}
.lkc{position:relative;align-self:stretch}
.lkc:before{content:"";position:absolute;left:0;right:50%;top:50%;height:2px;margin-top:-1px;background:#c9d8f0}
.lk-trunk{position:absolute;left:50%;top:15%;bottom:15%;width:2px;margin-left:-1px;background:#c9d8f0;border-radius:2px}
.lk-branch{position:absolute;left:50%;right:.35vw;height:2px;margin-top:-1px;background:linear-gradient(90deg,#c9d8f0,#aac3ee)}
.lk-branch:after{content:"";position:absolute;right:-1px;top:50%;width:.5vw;height:.5vw;border-top:2px solid #aac3ee;border-right:2px solid #aac3ee;transform:translateY(-50%) rotate(45deg)}
.lk-branch i{position:absolute;top:50%;left:0;width:.5vw;height:.5vw;border-radius:50%;background:#3b82f6;box-shadow:0 0 8px rgba(59,130,246,.75);transform:translate(-50%,-50%);animation:lkdot 2.2s linear infinite}
@keyframes lkdot{0%{left:0;opacity:0}15%{opacity:1}85%{opacity:1}100%{left:100%;opacity:0}}
.lk-lab{position:absolute;left:50%;top:31%;transform:translate(-50%,-50%);background:var(--tint);border:1px solid var(--tint-line);color:var(--accent);border-radius:999px;padding:.16vw .8vw;font-size:.74vw;font-weight:700;white-space:nowrap;z-index:1}
.lk-cards{display:flex;flex-direction:column;gap:.85vw}
.lk-card{display:flex;align-items:center;gap:.95vw;background:#fff;border:1px solid var(--hair);border-radius:14px;padding:.95vw 1.15vw;box-shadow:0 2px 5px rgba(11,21,38,.04),0 10px 22px rgba(37,99,235,.07);transition:border-color .35s,box-shadow .35s,background .35s}
/* 현재 보이는 캡처와 동기화되는 활성 카드 */
.lk-card.on{border-color:#93c5fd;background:linear-gradient(180deg,#ffffff,#f5f9ff);box-shadow:0 8px 24px rgba(37,99,235,.16)}
.lk-ic{width:2.7vw;height:2.7vw;border-radius:50%;background:var(--tint);color:var(--accent);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.lk-ic .material-symbols-outlined{font-size:1.35vw}
.lk-card b{display:block;font-size:1vw;color:var(--ink);font-weight:800;letter-spacing:-.01em}
.lk-card small{display:block;font-size:.76vw;color:var(--muted);margin-top:.14vw;line-height:1.5}
.lk-card .tag{margin-left:auto;flex-shrink:0}
.lk-note{display:flex;align-items:center;justify-content:center;gap:.6vw;border-top:1px solid var(--hair);padding-top:1vw;color:var(--body);font-size:.98vw}
.lk-note .material-symbols-outlined{font-size:1.15vw;color:var(--accent)}
.lk-note b{color:var(--ink);font-weight:700}

/* ── 압축 프로세스 스트립 (캡처에 최대 높이를 주기 위한 한 줄 칩 플로우) ── */
.pstrip{display:flex;align-items:center;gap:.6vw;flex-wrap:wrap;justify-content:center}
.pchip{background:var(--chip);border:1px solid transparent;border-radius:10px;padding:.45vw 1vw;text-align:left;transition:background .35s,border-color .35s,box-shadow .35s}
.pchip b{display:block;font-size:.88vw;color:var(--ink);font-weight:700;white-space:nowrap;transition:color .35s}
.pchip small{display:block;font-size:.72vw;color:var(--muted);margin-top:.08vw;white-space:nowrap}
.pchip.gray{background:#f1f5f9}
.pchip.gray b{color:#64748b}
/* 현재 보이는 캡처와 동기화되는 활성 칩 */
.pchip.on{background:var(--tint);border-color:var(--tint-line);box-shadow:0 4px 14px rgba(37,99,235,.14)}
.pchip.on b{color:#1d4ed8}
/* 세로 스트립 — 좌측 텍스트 열에서 위→아래로 흐르는 단계 (8~13P 공통 레이아웃) */
.pstrip.v{flex-direction:column;align-items:stretch;gap:.5vw}
.pstrip.v .mflow-arr{align-self:center;font-size:1.15vw}
.pstrip.v .pchip{padding:.6vw 1.1vw}
.pstrip.v .pchip b,.pstrip.v .pchip small{white-space:normal}

/* ── 확장 지도 (대한민국 실루엣 단순화 — 울산 → 사천 · 후평) ── */
.kmap{position:relative;width:15.5vw;aspect-ratio:100/130;align-self:center;margin:0 auto}
/* 마무리 풀하이트 지도 — 본문 높이 전체를 차지 */
.finale{display:grid;grid-template-columns:1fr auto;gap:2.6vw;flex:1;min-height:0;align-items:stretch}
.kmap.big{width:auto;height:100%;max-width:none;align-self:stretch;margin:0}
/* 울산 → 사천 → 후평 순차 점등 */
.kmap.big .kpin i{animation:pinlight 6s ease-in-out infinite}
@keyframes pinlight{0%,22%,100%{transform:scale(1)}6%,14%{transform:scale(1.4);box-shadow:0 0 0 .5vw rgba(37,99,235,.18),0 0 16px rgba(59,130,246,.65)}}
.kmap svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible}
.kland{fill:#eaf1fb;stroke:#c9d8f0;stroke-width:1}
.karc{fill:none;stroke:#aac3ee;stroke-width:1.3;stroke-dasharray:3 2.4;stroke-linecap:round}
.kdot{fill:#3b82f6;offset-rotate:0deg;animation:travel 3s linear infinite}
.kpin{position:absolute;transform:translate(-50%,-50%);z-index:1;display:flex;flex-direction:column;align-items:center;gap:.3vw}
.kpin i{width:1vw;height:1vw;border-radius:50%;background:#fff;border:2px solid var(--accent);box-shadow:0 2px 8px rgba(37,99,235,.25);display:block}
.kpin.main i{width:1.3vw;height:1.3vw;background:linear-gradient(135deg,#1d4ed8,#3b82f6);border:2px solid #fff;box-shadow:0 0 0 .35vw rgba(37,99,235,.15),0 4px 12px rgba(37,99,235,.4)}
.kpin b{font-size:.85vw;color:var(--ink);white-space:nowrap;background:#fff;padding:.12vw .6vw;border-radius:999px;border:1px solid var(--hair);box-shadow:0 2px 6px rgba(11,21,38,.08)}
.kpin small{font-size:.68vw;color:var(--accent);font-weight:700;white-space:nowrap}

/* ── 실제 화면 캡처 자동 순환 뷰어 ── */
.shot{position:relative;border-radius:14px;overflow:hidden;border:1px solid var(--hair);background:#0a1220;box-shadow:0 10px 28px rgba(11,21,38,.12);min-height:11vw}
.shot img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center;opacity:0;transition:opacity .7s ease}
.shot img.on{opacity:1}
.shot-dots{position:absolute;bottom:.7vw;left:50%;transform:translateX(-50%);display:flex;gap:.4vw;z-index:1}
.shot-dots i{width:.45vw;height:.45vw;border-radius:50%;background:rgba(255,255,255,.35);transition:background .3s,transform .3s}
.shot-dots i.on{background:#fff;transform:scale(1.25)}

/* ── 좌측 컬럼 높이 통일 (7~12P) — 칩·카드 박스 자체가 커져서 남는 높이를 채운다
   (간격을 벌리는 방식 금지 — 3P 타일처럼 박스가 늘어나야 함) ── */
.proc{flex:1;display:flex;flex-direction:column;min-height:0}
.proc .pstrip.v{flex:1}
.proc .pstrip.v .pchip{flex:1;display:flex;flex-direction:column;justify-content:center}
.fcol>.lk-cards{flex:1}
.fcol>.lk-cards .lk-card{flex:1}

/* ── 기대효과 리스트 (7~12P 공통 — 절차 아래 체크 행) ── */
.fx{display:flex;flex-direction:column;gap:.45vw}
.fx-row{display:flex;align-items:center;gap:.6vw;background:#fff;border:1px solid var(--hair);border-radius:10px;padding:.5vw .9vw}
.fx-row .material-symbols-outlined{font-size:1.05vw;color:#10b981;flex-shrink:0}
.fx-row span:last-child{font-size:.87vw;color:var(--ink);font-weight:600;line-height:1.5}
.lk-cards.sm .lk-card{padding:.6vw .95vw}
.lk-cards.sm .lk-card b{font-size:.92vw}
.lk-cards.sm .lk-card small{font-size:.72vw}

/* ── 이미지 플레이스홀더 (실제 화면 캡처 자리 — 가장 중요) ── */
.imgslot{border:2px dashed #c7d2e3;border-radius:14px;background:var(--chip);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:1.1vw;gap:.35vw;min-height:9vw}
.imgslot.tall{min-height:12vw}
.imgslot .material-symbols-outlined{font-size:2vw;color:#94a3b8}
.imgslot-t{color:var(--muted);font-size:.85vw;font-weight:700}
.imgslot-d{color:var(--muted);font-size:.77vw;line-height:1.65}

/* ── 마침 문장 ── */
.coda{color:var(--body);font-size:1vw;line-height:1.8;border-top:1px solid var(--hair);padding-top:.9vw;text-align:center}
.coda b{color:var(--accent);font-weight:700}

/* ── 확장 리플 (울산 코어에서 타 지역·신규 가입자로 퍼져나간다 — 라이트 톤) ── */
.ripple{position:relative;width:21.5vw;height:21.5vw;flex-shrink:0;margin:0 auto;align-self:center}
.rip{position:absolute;border-radius:50%;border:1px solid #c9d8f0}
.rip.r2{inset:22%}
.rip.r3{inset:4%;border-color:#dfe8f6}
.rip-core{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:6vw;height:6vw;border-radius:50%;background:
  radial-gradient(circle at 32% 26%,rgba(255,255,255,.32) 0%,transparent 45%),
  linear-gradient(135deg,#2563eb,#3b82f6);
  box-shadow:0 10px 30px rgba(37,99,235,.3),inset 0 1px 0 rgba(255,255,255,.3);display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;text-align:center;z-index:1}
.rip-core b{font-size:.85vw;line-height:1.3}
.rip-core small{font-size:.64vw;opacity:.8;margin-top:.1vw}
.rip-wave{position:absolute;inset:38.5%;border-radius:50%;border:1.5px solid rgba(37,99,235,.4);animation:ripwave 3.8s ease-out infinite;pointer-events:none}
.rip-wave.w2{animation-delay:1.9s}
@keyframes ripwave{from{transform:scale(1);opacity:.6}to{transform:scale(4);opacity:0}}
.rip-lab{position:absolute;transform:translate(-50%,-50%);background:#fff;border:1px solid var(--tint-line);border-radius:999px;padding:.26vw .95vw;color:#1d4ed8;font-size:.82vw;font-weight:700;white-space:nowrap;z-index:1;box-shadow:0 2px 8px rgba(37,99,235,.1)}
.rip-dot{position:absolute;width:.5vw;height:.5vw;border-radius:50%;background:#60a5fa;box-shadow:0 0 8px rgba(96,165,250,.55);transform:translate(-50%,-50%)}
.rip-dot.dim{opacity:.55;width:.4vw;height:.4vw}

/* ── 감사합니다 (마지막 다크) ── */
.thanks-inner{text-align:center;position:relative;z-index:1;align-self:center}
.thanks-inner img{height:2.4vw;filter:brightness(0) invert(1);margin-bottom:2.6vw;opacity:.92}
.thanks-title{color:#fff;font-size:3.1vw;font-weight:800;letter-spacing:-.01em;margin-bottom:1.3vw}
.thanks-tagline{color:var(--accent-soft);font-size:1.05vw;font-weight:300;line-height:1.8}
.thanks-contact{color:rgba(148,168,200,.6);font-size:.9vw;margin-top:2.8vw;letter-spacing:.08em}

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
}: {
  no: string
  sec: string
  title: ReactNode
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

function Tile({
  ic,
  k,
  d,
  soon,
  bar,
  st,
}: {
  ic: string
  k: string
  d?: string
  soon?: boolean
  bar?: 'wip' | 'todo' | 'done'
  st?: ReactNode
}) {
  return (
    <div className={`press-card${soon ? ' soon' : ''}`}>
      <div className="press-ic"><span className="material-symbols-outlined">{ic}</span></div>
      <div className="press-k">{k}</div>
      {d && <div className="press-d">{d}</div>}
      {bar === 'wip' && <div className="wip"><i /></div>}
      {bar === 'done' && <div className="wip-done" />}
      {bar === 'todo' && <div className="wip-empty" />}
      {st && <div className="press-st">{st}</div>}
    </div>
  )
}

// 실제 화면 캡처 자동 순환 — 여러 장을 일정 간격으로 크로스페이드 (읽을 시간 고려 4초)
// steps를 주면 위 칩 스트립이 현재 캡처와 동기화되어 하이라이트된다
function AutoShots({
  srcs,
  steps,
  lead,
  interval = 4000,
  side,
  extra,
  map,
}: {
  srcs: string[]
  steps?: { b: string; s: string }[]
  lead?: { b: string; s: string }
  interval?: number
  side?: boolean
  extra?: ReactNode
  /** 캡처 i가 보일 때 하이라이트할 단계 인덱스들 (생략 시 1:1) */
  map?: number[][]
}) {
  const [i, setI] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % srcs.length), interval)
    return () => clearInterval(t)
  }, [srcs.length, interval])
  const arrow = (
    <span className="mflow-arr material-symbols-outlined">{side ? 'arrow_downward' : 'arrow_forward'}</span>
  )
  const strip = steps ? (
    <div className={`pstrip${side ? ' v' : ''}`}>
      {lead && (
        <>
          <span className="pchip gray"><b>{lead.b}</b><small>{lead.s}</small></span>
          {arrow}
        </>
      )}
      {steps.map((st, idx) => {
        const on = map ? (map[i] || []).includes(idx) : idx === i
        return (
          <span key={st.b} style={{ display: 'contents' }}>
            {idx > 0 && arrow}
            <span className={`pchip${on ? ' on' : ''}`}><b>{st.b}</b><small>{st.s}</small></span>
          </span>
        )
      })}
    </div>
  ) : null
  const shot = (
    <div className="shot" style={side ? undefined : { flex: 1 }}>
      {srcs.map((s, idx) => (
        <img key={s} src={s} alt="플랫폼 화면 캡처" className={idx === i ? 'on' : ''} />
      ))}
      <div className="shot-dots">
        {srcs.map((_, idx) => (
          <i key={idx} className={idx === i ? 'on' : ''} />
        ))}
      </div>
    </div>
  )
  // side: 좌 텍스트(절차 + 기대효과) / 우 이미지 — 7~12P 공통 레이아웃
  if (side) {
    return (
      <div className="feat">
        <div className="fcol">
          <div className="proc">
            <div className="block-label"><b>절차</b></div>
            {strip}
          </div>
          {extra}
        </div>
        {shot}
      </div>
    )
  }
  return (
    <>
      {strip}
      {shot}
    </>
  )
}

// 로드맵 쇼케이스 — 신규 서비스 3종 캡처가 순환하고, 보이는 화면의 카드가 함께 하이라이트
function RoadmapShowcase() {
  const [i, setI] = useState(0)
  const items = [
    { ic: 'co2', t: '탄소배출관리', s: '배출 현황 파악 · 감축 관리', src: '/images/260730_demo/carbon.png' },
    { ic: 'storefront', t: 'e데이터마켓', s: '에너지 데이터 · 탄소배출권 거래', src: '/images/260730_demo/e-data.png' },
    { ic: 'bolt', t: 'VPP', s: '분산자원 통합 가상발전소', src: '/images/260730_demo/vpp.png' },
  ]
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % items.length), 4000)
    return () => clearInterval(t)
  }, [items.length])
  return (
    <div className="feat">
      <div className="fcol">
        <div className="lk-cards">
          {items.map((it, idx) => (
            <div className={`lk-card${idx === i ? ' on' : ''}`} key={it.t}>
              <span className="lk-ic"><span className="material-symbols-outlined">{it.ic}</span></span>
              <span><b>{it.t}</b><small>{it.s}</small></span>
              <span className="tag blue"><i />내부 검토중</span>
            </div>
          ))}
        </div>
        <div className="lk-note" style={{ borderTop: 'none', paddingTop: 0, justifyContent: 'flex-start' }}>
          <span className="material-symbols-outlined">rate_review</span>
          세 서비스 모두 <b>화면 구성 완료</b> — 현재 내부 검토 진행 중
        </div>
      </div>
      <div className="shot">
        {items.map((it, idx) => (
          <img key={it.src} src={it.src} alt={`${it.t} 화면 캡처`} className={idx === i ? 'on' : ''} />
        ))}
        <div className="shot-dots">
          {items.map((_, idx) => (
            <i key={idx} className={idx === i ? 'on' : ''} />
          ))}
        </div>
      </div>
    </div>
  )
}

// 기대효과 블록 — 7~12P 공통 (절차 아래)
function Effects({ items }: { items: string[] }) {
  return (
    <div>
      <div className="block-label"><b>기대효과</b></div>
      <div className="fx">
        {items.map((t) => (
          <div className="fx-row" key={t}>
            <span className="material-symbols-outlined">check_circle</span>
            <span>{t}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// 세로 단계 열 — 좌측 텍스트/우측 이미지 공통 레이아웃의 왼쪽에 쓰는 단계 칩
function StepCol({ steps }: { steps: { b: string; s?: string; tone?: 'gray' | 'acc' }[] }) {
  return (
    <div className="pstrip v">
      {steps.map((st, idx) => (
        <span key={st.b} style={{ display: 'contents' }}>
          {idx > 0 && <span className="mflow-arr material-symbols-outlined varr">arrow_downward</span>}
          <span className={`pchip${st.tone === 'gray' ? ' gray' : st.tone === 'acc' ? ' on' : ''}`}>
            <b>{st.b}</b>
            {st.s && <small>{st.s}</small>}
          </span>
        </span>
      ))}
    </div>
  )
}

function ImgSlot({ t, d, tall, grow }: { t: string; d: string; tall?: boolean; grow?: boolean }) {
  return (
    <div className={`imgslot${tall ? ' tall' : ''}`} style={grow ? { flex: 1 } : undefined}>
      <span className="material-symbols-outlined">add_photo_alternate</span>
      <div className="imgslot-t">{t}</div>
      <div className="imgslot-d">{d}</div>
    </div>
  )
}

/* ─────────────────────────── 슬라이드 — 시나리오 13페이지 1:1 ─────────────────────────── */

// 페르소나 색상 — CLAUDE.md §4.5 (발전사 emerald · 수용가 amber · 컨설턴트 violet · SPC blue · 관리자 slate)
// 순서는 시나리오 6페이지 그대로: 발전사업자, 수요기업, SPC, 플랫폼관리자, 컨설턴트
const PERSONAS = [
  { x: '50%', y: '10%', c: '#10b981', ic: 'solar_power', t: '발전사업자' },
  { x: '85%', y: '30%', c: '#f59e0b', ic: 'factory', t: '수요기업' },
  { x: '76%', y: '86%', c: '#2563eb', ic: 'apartment', t: 'SPC' },
  { x: '24%', y: '86%', c: '#64748b', ic: 'admin_panel_settings', t: '플랫폼관리자' },
  { x: '15%', y: '30%', c: '#8b5cf6', ic: 'support_agent', t: '컨설턴트' },
]

// ※ 이 덱은 사용자 지시로 목차 슬라이드 제외 ("이번에만 해당" — 2026-07 피드백 2번)
const SLIDES: ReactNode[] = [
  /* ── 1page : 인사 및 발표 개요 ── */
  <div className="dark-stage" key="p1">
    <p className="cover-eyebrow">Ulsan-Mipo Energy Independence · RMS</p>
    <h1 className="cover-title">지속가능한<br />통합 에너지 플랫폼</h1>
    <p className="cover-sub">
      울산미포 에너지자급자족 인프라 구축 및 운영사업<br />
      통합에너지플랫폼 구축 현황과 방향성
    </p>
    <div className="cover-meta">
      <img src="/images/logo.png" alt="RMS GROUP" />
      <i />
      <span>RMS</span>
      <i />
      <span>2026. 07. 30</span>
    </div>
  </div>,

  /* ── 2page : 사업 추진 경과 (1~2차년도) ── */
  /*    연차별 단계·3차년도 할 일·구축률: [울산미포에자자] 3차년도 사업계획서(2026.03) 재구성 */
  <ContentSlide
    key="p2"
    no="01"
    sec="사업 추진 경과 — 1~2차년도"
    title={<>3차년도 — <span className="hl">핵심 기능 개발</span></>}
    lede={<>1~2차년도에 다진 기반 위에서, <b>계획된 일정에 따라 정상적으로</b> 개발을 진행하고 있습니다.</>}
  >
    <Flow
      steps={[
        { no: '1차년도 · 2024', name: '요구사항 분석 · 설계', sub: '프로세스 · 아키텍처 설계, 관제 시나리오 분석' },
        { no: '2차년도 · 2025', name: '기반 구축', sub: '네트워크 · 데이터센터 설계, 통합관제센터(상황실) 구축' },
        { no: '3차년도 · 올해', name: '핵심 기능 개발', sub: '계획된 일정에 따라 정상 진행 중', final: true },
        { no: '4차년도 · 2027', name: '고도화 · 이관', sub: '테스트 · 교육 · 시스템 이관, 플랫폼 고도화' },
      ]}
    />

    <div>
      <div className="block-label"><b>3차년도 — ESG 에너지 플랫폼, 단계별로 해야 할 일</b></div>
      <div className="glanes">
        <div className="glane">
          <div className="glane-who"><span className="material-symbols-outlined">dns</span>수집인프라 · 데이터센터</div>
          <div className="glane-steps">
            <span className="gchip">현장 설치</span><span className="garr">→</span>
            <span className="gchip">단위 · 통합 테스트</span><span className="garr">→</span>
            <span className="gchip on">운영 · 안정화</span>
          </div>
        </div>
        <div className="glane">
          <div className="glane-who"><span className="material-symbols-outlined">hub</span>ESG 에너지 플랫폼</div>
          <div className="glane-steps">
            <span className="gchip">프로세스 설계</span><span className="garr">→</span>
            <span className="gchip">개발 설계</span><span className="garr">→</span>
            <span className="gchip">플랫폼 구축</span><span className="garr">→</span>
            <span className="gchip on">테스트 · 안정화</span>
          </div>
        </div>
        <div className="glane">
          <div className="glane-who"><span className="material-symbols-outlined">monitoring</span>통합관제센터</div>
          <div className="glane-steps">
            <span className="gchip">디버깅</span><span className="garr">→</span>
            <span className="gchip on">안정화</span>
          </div>
        </div>
      </div>
    </div>

    <div>
      <div className="block-label"><b>ESG 에너지 플랫폼 구축률 — 연차별 목표</b></div>
      <div className="pbar">
        <div className="pseg y1" style={{ width: '15%' }}>1차 15%</div>
        <div className="pseg y2" style={{ width: '35%' }}>2차 35%</div>
        <div className="pseg y3" style={{ width: '30%' }}>3차 30%</div>
        <div className="pseg y4" style={{ width: '20%' }}>4차 20%</div>
      </div>
      <div className="pbar-cap">
        <span className="pbar-mark" style={{ left: '80%' }}>3차년도 말 누적 80%</span>
      </div>
      <p className="srcline">근거 — [울산미포에자자] 3차년도 사업계획서(2026.03) 성과지표 · 추진일정 총괄계획 재구성</p>
    </div>
  </ContentSlide>,

  /* ── 3page : 3차년도 개발 현황 요약 ── */
  <ContentSlide
    key="p3"
    no="01"
    sec="사업 추진 경과 — 3차년도 개발 현황"
    title={<>상반기 <span className="hl">4</span>개 구축 완료 — <span className="hl">QA · 안정화</span></>}
    lede={<>지금 보여드리는 것은 <b>현재까지의 구축 결과물</b>입니다.</>}
  >
    <div style={{ paddingTop: '1.3vw' }}>
      <div className="yeartrack">
        <div className="yt-h1"><span className="material-symbols-outlined">task_alt</span>상반기 — 4개 구축 완료 · 안정화</div>
        <div className="yt-h2">하반기 — 3개 개발 계획 (12p 로드맵)</div>
        <span className="yt-now" style={{ left: '58%' }}>지금 · 7월</span>
      </div>
    </div>
    <div className="split43">
      <div className="press">
        <Tile ic="support_agent" k="컨설팅" bar="done" st={<span className="tag blue live"><i />QA · 안정화</span>} />
        <Tile ic="monitoring" k="모니터링" bar="done" st={<span className="tag blue live"><i />QA · 안정화</span>} />
        <Tile ic="swap_horiz" k="전력거래" bar="done" st={<span className="tag blue live"><i />QA · 안정화</span>} />
        <Tile ic="view_in_ar" k="DT(디지털트윈)" bar="done" st={<span className="tag blue live"><i />QA · 안정화</span>} />
      </div>
      <div className="press p3">
        <Tile soon ic="co2" k="탄소배출관리" bar="todo" st={<span className="tag gray"><i />하반기 착수</span>} />
        <Tile soon ic="storefront" k="e데이터마켓" bar="todo" st={<span className="tag gray"><i />하반기 착수</span>} />
        <Tile soon ic="hub" k="VPP" bar="todo" st={<span className="tag gray"><i />하반기 착수</span>} />
      </div>
    </div>
  </ContentSlide>,

  /* ── 4page : RMS가 추구하는 플랫폼 방향성 ── */
  <ContentSlide
    key="p4"
    no="02"
    sec="플랫폼 방향성"
    title={<>납품형이 아닌, <span className="hl">지속가능한 메인 플랫폼</span></>}
    lede={<>통상적인 공공 플랫폼은 사업이 끝나면 방치됩니다 — 저희는 <b>처음부터 다르게 설계</b>했습니다.</>}
  >
    <div className="vs">
      <div className="vs-panel">
        <div className="vs-h"><span className="material-symbols-outlined">inventory_2</span>통상적인 지자체 · 공공 플랫폼</div>
        <div className="dead">
          <div className="dead-row">
            <span className="dead-ic"><span className="material-symbols-outlined">local_shipping</span></span>
            <span><b>지역에 납품</b><small>시스템 구축 · 인도</small></span>
          </div>
          <span className="dead-link" />
          <div className="dead-row">
            <span className="dead-ic"><span className="material-symbols-outlined">flag</span></span>
            <span><b>사업 종료</b><small>계약 기간 만료</small></span>
          </div>
          <span className="dead-link" />
          <div className="dead-row stop">
            <span className="dead-ic"><span className="material-symbols-outlined">block</span></span>
            <span><b>업데이트 중단 · 방치</b><small>여기서 끝난다</small></span>
          </div>
        </div>
      </div>
      <div className="vs-panel ours">
        <div className="vs-h"><span className="material-symbols-outlined">all_inclusive</span>RMS — 하나의 메인 플랫폼</div>
        <div className="cyc">
          <div className="cyc-glow" />
          {/* 순환 화살표 — 정사각 viewBox라 원호·화살촉이 왜곡 없이 균일하다 */}
          <svg viewBox="0 0 100 100" aria-hidden>
            <defs>
              <marker id="cycArr" viewBox="0 0 10 10" refX="7.5" refY="5" markerWidth="5.5" markerHeight="5.5" orient="auto">
                <path d="M 1.5 1 L 8 5 L 1.5 9" fill="none" stroke="#aac3ee" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </marker>
              <filter id="cycGlow" x="-200%" y="-200%" width="500%" height="500%">
                <feGaussianBlur stdDeviation="1" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            <path className="cyc-seg" markerEnd="url(#cycArr)" d="M 70.0 9.4 A 40 40 0 0 1 89.0 35.0" />
            <path className="cyc-seg" markerEnd="url(#cycArr)" d="M 89.0 53.0 A 40 40 0 0 1 63.7 81.6" />
            <path className="cyc-seg" markerEnd="url(#cycArr)" d="M 36.3 81.6 A 40 40 0 0 1 11.0 53.0" />
            <path className="cyc-seg" markerEnd="url(#cycArr)" d="M 11.0 35.0 A 40 40 0 0 1 30.0 9.4" />
            {/* 빛나는 점이 각 곡선을 미끄러지듯 이동 — 시차를 두고 물결처럼 */}
            {[
              "M 70.0 9.4 A 40 40 0 0 1 89.0 35.0",
              "M 89.0 53.0 A 40 40 0 0 1 63.7 81.6",
              "M 36.3 81.6 A 40 40 0 0 1 11.0 53.0",
              "M 11.0 35.0 A 40 40 0 0 1 30.0 9.4",
            ].map((d, i) => (
              <circle
                key={i}
                r="1"
                className="cyc-dot"
                filter="url(#cycGlow)"
                style={{ offsetPath: `path('${d}')`, animationDelay: `${-i * 0.6}s` }}
              />
            ))}
          </svg>
          <div className="ihub-wrap">
            <span className="ihub-ring" />
            <span className="ihub-ring r2" />
            <div className="ihub-c">
              <span className="material-symbols-outlined">hub</span>
              <b>메인<br />플랫폼</b>
            </div>
          </div>
          {[
            { x: '50%', y: '4%', no: '1', ic: 'location_on', t: '울산 에자자 사업', s: '여기서 시작', v: '' },
            { x: '90%', y: '44%', no: '2', ic: 'touch_app', t: '참여 · 이용', s: '필요한 기능 사용', v: ' hr' },
            { x: '50%', y: '84%', no: '3', ic: 'settings_suggest', t: '관리 · 운영', s: '종료 후에도 업데이트', v: '' },
            { x: '10%', y: '44%', no: '4', ic: 'travel_explore', t: '타 지역 확산', s: '사천 · 후평 — 이후로도 계속', v: ' hl2' },
          ].map((n) => (
            <div className={`cnode${n.v}`} key={n.no} style={{ left: n.x, top: n.y }}>
              <span className="cnode-ic">
                <span className="material-symbols-outlined">{n.ic}</span>
                <span className="cnode-no">{n.no}</span>
              </span>
              <span className="cnode-tx">
                <b>{n.t}</b>
                <small>{n.s}</small>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </ContentSlide>,

  /* ── 5page : 사용자 관점에서의 설계 ── */
  <ContentSlide
    key="p5"
    no="02"
    sec="플랫폼 방향성 — 사용자 관점에서의 설계"
    title={<>수요기업에게 필요한 <span className="hl">세 가지</span></>}
    lede={<>플랫폼의 핵심 기능은 <b>수요기업에게 실제로 필요한 것</b>을 기준으로 구성했습니다.</>}
  >
    <div className="qrow">
      <div className="qcol">
        <span className="q-ghost">01</span>
        <span className="q-chip"><span className="material-symbols-outlined">flag</span></span>
        <div className="q-text"><span className="hl">RE100 이행</span> 방향<span className="q-cap">어떻게 이행할 것인가</span></div>
      </div>
      <div className="qcol">
        <span className="q-ghost">02</span>
        <span className="q-chip"><span className="material-symbols-outlined">route</span></span>
        <div className="q-text">구체적인 <span className="hl">실행 방법</span><span className="q-cap">무엇부터 시작할 것인가</span></div>
      </div>
      <div className="qcol">
        <span className="q-ghost">03</span>
        <span className="q-chip"><span className="material-symbols-outlined">insights</span></span>
        <div className="q-text">태양광 <span className="hl">설치 효과 검증</span><span className="q-cap">실제 효과가 얼마나 되는가</span></div>
      </div>
    </div>
    <div className="ans">
      <span className="material-symbols-outlined">hub</span>
      <span className="ans-t">네 가지 핵심 기능은, 이 세 가지를 해결하기 위한 서비스입니다</span>
      <span className="ans-fn">
        <span className="ans-pill">컨설팅</span>
        <span className="ans-pill">모니터링</span>
        <span className="ans-pill">전력거래</span>
        <span className="ans-pill">DT</span>
      </span>
    </div>
  </ContentSlide>,

  /* ── 6page : 플랫폼 구조 — 5개 페르소나 ── */
  <ContentSlide
    key="p6"
    no="02"
    sec="플랫폼 방향성 — 5개 페르소나"
    title={<>하나의 플랫폼, <span className="hl">다섯 개의 화면</span></>}
    lede={<>페르소나별로 UI/UX와 제공 기능이 다르게 설계 — <b>본인 역할에 필요한 기능만 간결하게</b> 사용합니다.</>}
  >
    <div className="hub">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
        {PERSONAS.map((p, i) => (
          <line key={i} x1="50" y1="50" x2={parseFloat(p.x)} y2={parseFloat(p.y)} stroke="#d5ddeb" strokeWidth=".35" strokeDasharray="1.4 1.1" />
        ))}
      </svg>
      <span className="hub-ring" />
      <span className="hub-ring r2" />
      <div className="hub-c">
        <span className="material-symbols-outlined">hub</span>
        <b>통합 에너지<br />플랫폼</b>
        <small>역할별 UI/UX · 기능</small>
      </div>
      {PERSONAS.map((p, i) => (
        <div className="pnode" key={p.t} style={{ left: p.x, top: p.y }}>
          <div className="pnode-ic" style={{ background: p.c, animationDelay: `${i * 1.5}s` }}>
            <span className="material-symbols-outlined">{p.ic}</span>
          </div>
          <b>{p.t}</b>
        </div>
      ))}
    </div>
    <div className="mflow">
      <span className="tag gray"><i />현장에서 5개 계정 로그인은 제약 — 페르소나별 화면 · 기능은 시연 영상으로</span>
      <span className="tag blue"><i />현장 시연 — 관리자 계정 기준</span>
    </div>
  </ContentSlide>,

  /* ── 7page : 핵심 기능 ① 컨설팅 ── */
  <ContentSlide
    key="p7"
    no="03"
    sec="핵심 기능 ① 컨설팅"
    title={<>신청하면 매칭 — <span className="hl">진입장벽 없는 컨설팅</span></>}
    lede={<>기존에는 RE100 컨설팅을 <b>어디에 문의해야 할지조차</b> 알기 어려웠습니다.</>}
  >
    <AutoShots
      side
      steps={[
        { b: '무료 진단', s: '기본정보 입력 — AI 기반 진단' },
        { b: '진단 결과 확인', s: '성숙도 등급 · RE 비율' },
        { b: '컨설턴트 선택 · 신청', s: '마켓플레이스에서 비교' },
        { b: '매칭 — 컨설팅 진행 · 톡', s: '7단계 진행, 일정 조율 · 질의' },
      ]}
      map={[[0, 1], [2], [3]]}
      srcs={[
        '/images/260730_demo/consulting-01.png',
        '/images/260730_demo/consulting-02.png',
        '/images/260730_demo/consulting-03.png',
      ]}
      extra={
        <Effects
          items={[
            'RE100 컨설팅 진입장벽 해소',
            '메일 · 전화 없이 플랫폼 안에서 소통 완결',
          ]}
        />
      }
    />
  </ContentSlide>,

  /* ── 9page : 핵심 기능 ② 모니터링 + O&M 연계 (※ 원스톱은 사용자 지시로 제외) ── */
  <ContentSlide
    key="p9"
    no="03"
    sec="핵심 기능 ② 모니터링 + O&M 연계"
    title={<>감지에서 조치 · 결과까지, <span className="hl">하나의 흐름</span></>}
    lede={<>단순 발전량 모니터링은 시중에 이미 많습니다 — 그것만으로는 <b>반쪽짜리</b>라고 판단했습니다.</>}
  >
    <AutoShots
      side
      steps={[
        { b: '이상상황 감지', s: '모니터링 알림' },
        { b: 'A/S · O&M 접수', s: '플랫폼 내에서 바로 연계' },
        { b: '조치', s: '처리 진행' },
        { b: '처리 현황 실시간 반영', s: '업데이트까지 완결' },
      ]}
      srcs={[
        '/images/260730_demo/monitoring-01.png',
        '/images/260730_demo/monitoring-02.png',
        '/images/260730_demo/monitoring-03.png',
        '/images/260730_demo/monitoring-04.png',
      ]}
      extra={
        <Effects
          items={[
            '감지에서 결과 확인까지 하나의 흐름으로 완결',
            '처리 현황을 실시간으로 확인',
          ]}
        />
      }
    />
  </ContentSlide>,

  /* ── 10page : 핵심 기능 ④ 전력거래 ── */
  <ContentSlide
    key="p10"
    no="03"
    sec="핵심 기능 ③ 전력거래"
    title={<>RE100 이행을 위한 <span className="hl">재생에너지 전력 조달 서비스</span></>}
    lede={<>수요기업의 RE100 이행에는 <b>재생에너지 전력</b>이 필요하고, 조달 과정이 원활해야 합니다.</>}
  >
    <AutoShots
      side
      steps={[
        { b: '재생에너지 전력 조회', s: '발전사업자가 공급하는 전력' },
        { b: '거래 체결', s: '플랫폼에서 계약' },
        { b: '전력 확보', s: '수요기업의 RE100 이행' },
      ]}
      srcs={[
        '/images/260730_demo/trading-01.png',
        '/images/260730_demo/trading-02.png',
        '/images/260730_demo/trading-03.png',
      ]}
      extra={
        <Effects
          items={[
            '재생에너지 전력 조달 원활화',
            '수요기업의 RE100 이행 지원',
          ]}
        />
      }
    />
  </ContentSlide>,

  /* ── 11page : 핵심 기능 ⑤ DT(디지털 트윈) ── */
  <ContentSlide
    key="p11"
    no="03"
    sec="핵심 기능 ④ DT (디지털 트윈)"
    title={<>설치 전에 눈으로 확인하는 <span className="hl">예상 효과</span></>}
    lede={<>신규 가입 기업에 가장 효과적인 것 — 태양광 설치 효과를 <b>직접 눈으로 확인</b>하는 것입니다.</>}
  >
    <div className="feat">
      <div className="fcol">
        <div className="proc">
          <div className="block-label"><b>절차</b></div>
          <StepCol
            steps={[
              { b: '설치 전', s: '우리 사업장' },
              { b: 'DT 시뮬레이션', tone: 'acc' },
              { b: '예상 효과 확인', s: '시각적으로' },
            ]}
          />
        </div>
        <Effects
          items={[
            '설치 전 도입 의사결정 지원',
            '신규 가입 기업에 가장 효과적인 소구점',
          ]}
        />
        <div className="mflow">
          <span className="tag blue"><i />발표 후 실제 플랫폼 접속 — 직접 시연</span>
        </div>
      </div>
      <ImgSlot
        tall
        t="제안: DT 화면 캡처"
        d="태양광 설치 전 예상 효과를 3D로 보여주는 디지털 트윈 화면 — 캡처를 넣으면 자동 순환 뷰어로 교체"
      />
    </div>
  </ContentSlide>,

  /* ── 12page : 하반기 개발 로드맵 ── */
  <ContentSlide
    key="p12"
    no="04"
    sec="하반기 개발 로드맵"
    title={<>화면까지 구성된 <span className="hl">세 개의 신규 서비스</span></>}
    lede={<>세 기능은 범위가 방대해 <b>신규 플랫폼 연동(딥링크)</b>으로 서비스하며 — 화면을 구성해 검토하고 있습니다.</>}
  >
    <RoadmapShowcase />
  </ContentSlide>,

  /* ── 13page : 마무리 — 지속가능하고 확장 가능한 플랫폼 ── */
  <ContentSlide
    key="p13"
    no="05"
    sec="마무리 — 지속가능하고 확장 가능한 플랫폼"
    title={<>울산에서 <span className="hl">사천 · 후평으로</span> — 전국 확장</>}
    lede={
      <>울산 에자자 사업에 국한된 시스템이 아니라 — 동일한 플랫폼 기반 위에서
      <b> 타 지역과 신규 가입자로 확장하는, 지속가능하고 실효성 있는 서비스</b>입니다.</>
    }
  >
    <div className="finale">
      <div className="fcol">
        <div className="proc">
          <div className="block-label"><b>확장 로드맵</b></div>
          <StepCol
            steps={[
              { b: '울산 에자자', s: '첫 적용', tone: 'acc' },
              { b: '사천 · 후평', s: '확산 적용' },
              { b: '이후 — 신규 지역 · 신규 가입자', s: '동일한 플랫폼 기반 위에서 계속 확장' },
            ]}
          />
        </div>
        <div>
          <div className="block-label"><b>이어서</b></div>
          <div className="pstrip">
            <span className="pchip on"><b>시연 영상</b><small>페르소나별 화면 · 기능</small></span>
            <span className="mflow-arr material-symbols-outlined">arrow_forward</span>
            <span className="pchip"><b>실제 플랫폼 시연</b><small>관리자 계정 · DT</small></span>
          </div>
        </div>
      </div>
      {/* 확장 지도 — 울산에서 사천 · 후평으로. 경계는 Natural Earth 10m(최고 해상도 · 퍼블릭 도메인) 실데이터 투영 — 울릉도 · 독도 · 백령도 포함,
          핀 좌표도 실제 경위도(울산 129.31E/35.54N · 사천 128.06E/35.00N · 춘천 후평 127.73E/37.87N) 투영값 */}
      <div className="kmap big">
        <svg viewBox="0 0 100 130" aria-hidden>
          <path
            className="kland"
            d="M58.7 15.9L59.2 16.7L59.8 18.0L60.0 18.6L60.3 19.5L61.6 22.0L62.6 24.6L63.3 25.5L63.5 26.0L65.9 29.4L66.9 30.8L68.0 32.0L68.9 33.0L69.0 33.4L69.0 33.8L69.1 34.2L69.6 34.5L70.1 36.1L70.3 36.5L70.8 36.8L71.4 38.1L71.8 38.6L72.0 39.1L72.8 40.2L73.0 40.8L73.2 42.2L73.5 42.9L74.3 44.0L74.2 44.4L74.0 44.8L74.1 45.5L74.2 47.1L74.4 47.9L74.9 49.4L74.9 50.2L74.7 50.9L74.4 51.5L74.1 52.2L74.2 53.0L74.4 53.7L74.5 54.5L74.4 56.0L73.9 56.9L73.7 57.2L73.6 57.5L73.6 59.7L73.7 60.2L74.0 61.0L74.1 61.4L74.2 61.9L73.9 62.1L73.6 62.4L73.8 62.9L74.3 63.5L75.0 63.2L75.9 62.2L76.3 62.1L76.5 62.7L76.5 63.1L76.3 63.4L75.8 64.5L75.8 65.0L75.6 66.2L75.2 67.3L75.2 68.0L74.9 69.1L74.6 69.7L74.6 70.3L74.8 70.6L74.7 71.0L74.7 71.5L74.6 72.2L74.2 72.8L73.9 72.6L73.8 72.2L73.6 71.9L73.3 72.2L73.6 72.4L73.7 72.9L73.5 73.2L73.2 73.4L73.3 74.1L73.0 74.6L73.3 74.8L72.9 75.2L72.3 75.8L71.8 76.0L71.7 76.5L71.7 76.9L71.5 77.4L71.3 77.9L71.1 78.2L70.8 78.7L70.4 78.7L70.1 78.7L69.7 79.0L69.9 79.4L69.5 79.8L69.2 79.6L68.9 79.3L68.5 79.7L68.4 80.0L68.3 80.4L67.9 80.1L68.0 80.7L67.6 80.6L67.3 80.2L67.3 79.8L67.4 79.3L66.8 80.0L66.6 79.7L66.5 79.3L66.3 80.0L65.9 80.0L64.9 80.0L64.8 79.5L64.7 80.0L64.2 79.9L63.8 79.6L63.6 79.0L63.3 79.4L62.9 78.9L62.4 78.9L62.4 78.3L62.3 77.7L61.8 78.1L62.0 78.6L62.1 79.1L62.3 79.5L62.5 79.8L62.5 80.3L62.9 80.4L62.4 80.5L62.1 80.1L61.1 79.6L60.4 79.7L60.4 80.1L59.6 80.4L59.1 80.6L59.0 81.1L60.3 80.6L60.6 80.9L60.7 81.3L60.4 81.7L59.8 81.7L59.8 82.1L59.8 82.7L59.7 83.5L60.1 83.4L60.1 83.8L59.7 84.3L59.0 84.4L59.3 84.1L58.6 83.9L58.2 83.5L58.6 83.1L58.3 82.4L57.8 83.2L57.2 82.8L56.7 82.6L56.4 82.9L56.4 83.5L55.4 83.4L55.1 83.2L55.0 82.8L54.7 82.8L54.2 82.7L54.2 82.3L54.2 80.8L54.3 80.4L54.4 80.0L54.2 80.3L54.0 80.6L53.4 80.9L53.7 81.5L53.1 81.6L52.7 81.9L52.6 81.4L52.3 81.1L52.3 81.7L52.1 82.2L51.8 82.5L51.4 82.5L51.0 82.4L50.6 82.3L49.9 82.2L49.6 82.0L49.3 81.7L49.3 82.0L49.2 82.5L48.5 83.2L47.9 83.1L47.7 82.6L47.3 82.7L47.2 83.1L47.4 83.7L47.6 84.1L47.8 84.4L48.2 84.8L49.0 84.3L49.6 84.4L50.1 84.2L50.1 84.6L49.9 85.3L49.7 86.2L49.1 86.6L48.7 86.4L48.1 86.9L48.1 87.4L48.2 88.3L47.8 88.1L47.4 88.0L47.0 87.6L46.9 87.2L47.0 86.8L47.2 86.4L47.3 86.1L47.2 85.6L46.9 85.1L46.6 84.9L46.5 84.2L46.5 83.8L46.0 84.2L45.3 84.6L44.4 84.6L44.7 85.0L45.0 85.2L44.4 85.4L44.1 85.6L44.2 85.9L44.6 85.9L44.7 86.9L45.2 87.3L45.6 87.6L45.9 88.1L45.5 88.0L46.0 88.3L46.2 88.9L45.9 89.2L45.4 89.2L44.7 88.8L44.3 88.7L43.9 89.0L44.0 89.6L44.4 89.7L44.9 89.5L45.2 89.8L44.5 90.5L44.3 90.8L43.6 91.0L43.8 91.5L43.4 91.5L42.8 90.7L42.6 90.3L42.1 89.7L41.3 90.0L41.0 90.2L40.6 89.8L40.7 89.4L41.0 89.2L41.4 88.7L41.6 88.3L41.9 88.1L41.8 88.7L41.6 89.2L42.1 89.2L42.4 89.0L42.6 88.7L42.6 88.2L42.4 87.9L42.3 87.4L42.8 86.8L43.1 87.2L43.1 87.6L43.4 87.8L43.7 87.6L43.9 87.1L43.8 86.6L43.6 86.2L43.4 86.4L42.8 86.3L42.4 85.7L42.2 86.0L41.9 86.8L41.5 87.2L41.0 87.1L40.6 87.3L40.4 87.6L39.7 88.1L39.4 88.3L39.1 88.4L38.9 88.9L38.8 89.2L38.6 89.6L37.9 90.6L37.9 91.4L37.4 91.3L37.2 91.6L37.3 92.0L36.7 91.7L36.2 91.5L35.9 91.1L36.0 90.2L35.9 89.8L36.0 89.3L35.7 88.9L35.4 89.1L35.2 89.5L35.4 90.0L34.9 90.3L35.3 90.9L34.8 91.2L34.8 91.7L34.5 91.7L34.2 92.1L33.6 92.3L33.1 93.8L33.0 94.1L32.7 94.1L32.0 94.3L31.9 93.6L31.8 93.3L31.2 93.3L31.3 92.7L31.7 92.3L31.7 91.9L31.3 91.8L31.2 91.3L31.1 90.6L31.4 90.4L31.8 90.3L32.1 90.3L31.9 90.0L32.1 89.6L31.7 89.5L31.3 89.4L31.0 89.8L30.6 89.8L30.1 89.8L29.8 89.5L29.4 89.3L29.0 89.3L28.6 88.9L28.6 88.6L28.5 88.2L28.2 88.0L28.2 87.4L28.3 86.9L28.4 86.5L28.5 86.0L28.9 86.1L29.4 86.9L29.2 87.3L29.3 87.7L29.6 88.6L30.5 88.8L30.8 89.0L31.1 88.7L30.6 88.6L30.2 88.2L30.3 87.8L30.0 88.1L29.8 87.7L29.7 87.3L29.7 86.7L30.1 86.7L30.8 86.8L30.8 87.2L31.0 87.5L31.3 87.8L31.7 88.1L32.0 88.3L31.8 87.8L32.2 87.9L32.6 88.1L33.0 88.3L32.8 88.0L32.3 87.6L32.1 87.2L31.6 86.6L31.0 86.4L30.6 86.4L30.3 86.2L29.9 86.3L29.6 86.2L29.7 85.8L30.4 85.7L30.9 85.5L31.6 86.0L32.0 86.1L32.0 85.4L32.5 85.1L33.2 85.3L33.7 85.0L33.4 84.6L32.6 84.7L32.6 84.3L32.8 83.9L32.7 83.3L32.3 83.4L32.1 83.8L32.2 84.2L32.0 84.6L31.9 85.2L31.4 85.5L31.5 85.1L31.1 85.0L30.5 85.0L30.1 85.2L29.7 85.3L29.7 84.9L30.0 84.6L30.2 84.2L30.2 83.8L30.4 83.5L30.1 83.0L30.0 82.7L30.2 82.2L30.6 81.8L30.2 81.7L29.9 81.9L29.7 82.2L29.7 82.6L29.3 82.8L28.8 82.6L28.7 82.1L29.0 81.9L29.3 82.0L29.3 81.6L29.7 81.2L29.6 80.8L29.2 80.2L28.9 80.0L28.7 80.3L28.4 80.5L28.4 80.1L28.0 79.6L28.1 79.0L28.7 79.1L29.1 79.1L29.2 78.6L29.3 79.0L29.2 79.5L29.5 80.0L29.7 80.3L30.1 80.3L30.2 80.8L30.4 81.1L30.8 80.3L30.8 79.7L30.5 79.5L30.1 78.9L29.6 78.3L29.6 78.0L29.7 77.7L29.5 77.2L29.1 77.3L28.7 77.3L29.2 77.0L29.7 76.9L29.5 76.6L29.8 76.3L29.8 76.0L29.8 75.6L30.2 74.8L30.5 75.2L30.9 75.2L30.4 74.5L30.4 73.9L30.7 73.4L31.1 72.5L31.4 72.0L31.9 71.8L32.4 71.7L32.9 71.7L33.3 71.2L33.9 71.4L34.1 71.7L34.1 71.1L33.8 70.7L31.7 71.0L31.0 70.6L31.0 70.1L31.4 69.7L31.7 69.4L32.0 69.1L32.4 68.9L32.9 68.6L33.3 68.0L33.4 67.5L33.8 67.2L34.4 67.1L34.9 67.1L35.2 67.4L35.6 67.7L35.7 67.4L35.6 67.0L35.2 66.8L34.8 66.6L34.4 66.3L34.6 66.0L35.7 65.9L36.1 65.6L36.4 65.4L36.2 65.1L34.9 65.5L34.6 65.5L33.9 65.4L33.2 65.4L33.1 64.6L32.5 64.4L31.9 64.5L31.8 63.9L33.2 63.8L33.9 63.7L34.6 63.6L35.1 63.6L35.9 63.0L36.6 62.7L36.9 62.5L36.1 62.5L35.5 62.8L35.0 63.2L34.3 63.4L34.0 63.2L33.9 62.8L33.6 62.2L33.6 61.9L33.3 61.7L32.8 61.0L32.4 61.0L31.9 60.6L31.6 61.0L31.5 60.5L32.0 60.2L32.4 60.1L33.0 60.3L32.8 59.9L32.5 59.7L32.1 59.5L32.3 58.6L32.5 58.2L31.9 57.7L32.6 57.2L32.6 56.8L31.9 56.7L31.6 56.4L31.5 55.8L32.1 55.5L32.3 55.1L32.9 55.0L32.4 54.8L31.9 55.4L31.5 55.3L31.3 54.9L31.3 54.6L31.6 54.0L31.3 53.7L31.0 53.4L31.0 52.8L31.4 52.5L31.7 52.3L31.7 51.9L31.3 51.6L31.6 51.3L31.1 50.9L31.2 50.4L31.3 50.0L30.9 50.2L30.6 50.4L30.7 51.0L30.6 51.4L30.7 51.8L30.5 52.2L30.1 52.2L29.6 52.0L29.6 51.0L29.7 50.7L29.6 50.1L29.2 50.0L29.1 50.5L28.6 50.7L29.0 51.4L29.0 51.9L29.2 52.3L28.8 52.5L28.5 52.8L28.5 52.5L28.6 51.9L28.2 51.2L28.3 50.9L28.2 50.4L27.6 51.0L27.1 51.1L26.6 51.1L26.5 50.7L27.2 50.6L27.3 50.2L27.0 49.8L26.5 49.6L26.4 50.3L26.2 50.6L26.1 50.0L26.1 49.6L26.5 49.0L26.6 48.6L26.7 49.0L27.1 49.2L27.0 48.8L27.4 48.9L27.7 48.6L27.4 48.6L27.1 48.3L27.3 47.9L27.0 47.6L27.3 47.2L27.6 47.0L27.5 47.5L28.1 47.6L28.4 47.0L28.3 46.4L28.4 46.0L28.7 45.9L28.7 46.5L28.8 46.9L28.9 47.4L28.7 47.7L28.7 48.3L28.4 48.6L28.4 49.0L28.8 48.8L29.4 49.1L29.1 48.5L29.0 48.1L29.4 48.2L29.8 48.0L29.7 47.5L30.1 47.4L30.3 47.1L30.3 46.7L30.1 46.4L29.7 46.3L29.4 46.1L29.7 45.7L29.4 45.5L29.8 45.4L30.5 45.1L30.8 45.5L30.6 45.8L30.6 46.3L30.9 46.1L31.1 46.3L31.1 46.8L31.0 47.7L31.2 48.1L31.4 47.6L31.7 46.8L31.7 46.3L32.2 46.6L32.4 47.0L32.5 46.5L31.5 45.4L32.0 45.6L32.4 45.8L32.3 45.4L31.7 45.0L31.6 44.6L31.8 44.3L32.2 44.6L32.5 44.8L32.9 45.1L33.4 45.4L33.4 45.9L33.5 46.4L33.4 46.9L33.7 46.5L33.6 46.0L33.9 45.5L34.4 45.4L34.9 45.5L35.3 45.6L35.8 46.1L35.9 46.5L35.6 47.3L36.1 46.8L36.4 47.2L36.4 47.7L36.3 48.1L36.5 48.6L36.6 49.1L36.3 49.4L36.5 49.7L36.7 49.3L36.9 48.8L36.8 48.4L37.4 48.5L36.9 48.0L37.1 47.5L38.0 47.2L38.4 46.9L38.8 46.6L38.9 46.1L39.2 45.7L39.4 45.4L38.6 45.6L38.5 46.4L38.0 46.6L37.5 46.6L37.0 46.2L36.4 45.7L36.2 45.2L37.1 45.1L37.5 45.0L37.4 44.7L37.3 44.4L37.1 44.0L37.2 43.6L36.8 43.9L36.7 44.5L36.2 44.5L35.2 44.4L35.2 44.0L35.2 43.5L35.4 43.2L35.8 42.8L36.4 42.7L36.8 42.6L36.9 42.1L36.3 42.4L35.9 42.2L35.3 42.3L34.8 42.9L34.3 43.0L34.3 42.6L34.5 42.3L34.1 42.4L34.0 41.9L34.4 41.8L34.7 41.4L34.3 41.4L34.0 41.2L33.8 40.7L34.3 40.6L34.8 40.6L35.2 40.8L35.4 41.1L35.8 41.2L35.9 40.7L36.2 40.3L36.6 40.5L36.7 40.1L36.2 39.9L35.8 40.0L35.4 39.9L34.9 39.7L34.3 39.3L34.5 38.7L33.9 38.2L33.6 38.7L33.2 38.4L33.3 38.1L33.4 37.6L32.9 37.3L32.9 36.7L33.5 36.4L33.1 36.3L33.0 35.8L33.0 35.3L32.8 34.9L32.6 34.5L32.4 34.1L32.3 33.7L32.2 33.1L32.0 31.6L32.2 31.3L33.0 31.6L33.5 31.5L33.9 31.6L34.0 32.1L33.9 32.7L33.9 33.1L34.3 33.5L34.9 33.7L35.2 33.7L35.0 33.5L34.1 32.9L34.4 32.2L34.4 31.8L34.2 31.3L34.2 30.9L34.3 30.6L34.3 30.1L34.0 30.3L33.9 28.7L33.9 28.3L34.4 28.2L34.8 28.0L35.3 27.6L36.6 25.7L36.8 25.5L37.4 25.0L37.6 24.8L37.9 24.0L38.1 23.6L38.4 23.2L39.2 22.6L40.1 22.0L41.1 21.6L42.0 21.5L42.5 21.6L44.3 21.4L45.7 21.8L46.1 21.8L47.0 21.5L49.8 21.3L50.1 21.6L50.5 21.9L51.5 21.7L53.0 21.8L54.0 21.7L55.0 21.3L55.9 20.7L56.7 20.0L57.0 19.5L57.3 19.0L57.5 18.4L57.6 17.8L57.4 17.2L57.5 16.6L57.9 16.3L58.7 15.9ZM38.0 109.0L37.9 109.4L37.9 109.8L37.7 110.2L37.5 110.5L37.0 110.9L36.8 111.3L36.6 111.7L36.5 112.1L36.1 112.1L35.6 112.2L35.0 112.6L33.6 112.9L33.1 113.3L32.5 113.5L31.8 113.4L31.1 113.5L30.5 113.4L29.1 113.4L28.7 113.6L28.4 114.1L27.9 114.0L27.6 113.4L27.2 113.3L26.7 112.8L26.6 112.2L26.8 111.5L27.1 111.0L27.7 110.6L28.2 109.8L28.6 109.7L28.8 109.3L29.4 109.0L30.9 108.6L31.3 108.3L32.7 108.1L33.7 107.7L35.1 107.5L35.8 107.5L36.2 107.6L36.6 108.0L37.3 108.3L37.7 109.1ZM64.3 83.9L64.2 84.3L64.0 84.6L64.2 85.0L63.8 85.2L63.4 85.0L63.3 85.4L63.1 85.7L63.2 86.0L63.5 86.3L62.2 86.8L62.4 86.5L62.1 86.2L62.2 85.7L61.8 85.9L61.6 85.6L62.0 85.3L62.1 84.8L62.0 84.3L61.3 84.8L60.9 84.7L60.6 84.2L60.6 83.7L61.0 83.3L61.8 83.1L62.2 83.2L62.5 83.4L62.4 82.9L62.3 82.3L63.5 81.7L63.3 81.4L63.6 80.9L64.0 81.1L63.9 82.0L64.0 82.5L64.1 82.9L63.8 83.7L64.3 83.5ZM29.8 90.6L29.8 91.1L29.4 92.0L29.1 92.3L28.8 92.0L28.7 92.3L27.3 93.1L26.5 93.2L26.4 92.9L26.0 92.3L26.0 92.7L25.7 92.3L25.9 91.7L26.3 91.2L26.7 91.2L26.9 90.8L27.1 90.5L27.5 90.3L27.9 90.3L28.2 89.9L27.7 89.3L28.1 89.2L28.5 89.5L28.8 89.8L29.3 89.7L29.8 90.6ZM54.4 84.8L54.4 85.2L54.3 85.7L54.4 86.0L54.1 86.4L54.3 86.8L54.0 87.0L53.5 86.8L53.0 86.9L52.9 86.6L52.7 85.8L52.3 85.8L52.1 86.5L51.6 86.6L51.4 86.2L51.3 85.8L50.9 84.5L50.9 83.9L51.1 83.5L51.4 83.4L51.5 83.0L51.8 82.7L52.2 82.6L52.5 83.0L52.3 83.5L52.0 83.9L52.1 84.3L52.7 84.7L52.8 85.0L53.5 84.8L54.3 84.8ZM31.6 34.5L31.3 34.3L30.2 34.4L29.6 33.9L30.1 33.8L30.3 33.4L29.6 32.3L29.6 31.1L30.2 30.4L30.7 30.5L31.1 31.0L31.6 31.2L31.8 31.7L31.7 32.1L31.9 32.6L32.0 33.3L32.1 33.8L31.8 34.4ZM32.4 36.0L32.7 36.3L32.5 36.6L32.1 36.6L31.6 36.9L31.3 37.2L30.7 37.7L30.3 37.4L30.0 37.2L29.5 37.3L29.4 36.9L30.3 36.3L30.8 36.2L31.4 36.1L31.5 35.7L31.9 35.8L32.2 35.9ZM30.1 55.1L30.2 55.4L30.4 55.7L29.7 56.0L29.5 55.7L29.7 55.3L29.4 55.5L29.3 55.2L29.5 54.8L29.2 54.8L29.1 54.4L29.0 53.8L29.0 53.4L28.8 52.9L29.2 52.5L29.7 52.7L29.5 53.0L29.8 53.7L29.8 54.1L30.1 54.5L30.1 54.8ZM35.4 94.0L35.4 94.4L35.0 94.2L34.5 94.2L34.3 94.0L33.9 93.7L33.6 93.5L33.6 93.1L33.6 92.6L33.9 92.4L34.4 92.4L34.8 92.7L34.9 93.0L35.0 93.5L35.4 94.0ZM95.8 35.4L96.0 36.1L95.8 36.6L95.7 36.9L95.0 37.0L94.6 36.8L94.4 36.5L94.3 36.1L94.7 35.7L95.2 35.6L95.6 35.4ZM41.3 90.8L41.8 90.8L42.2 90.9L42.3 91.5L41.9 91.9L41.3 92.0L40.9 91.9L40.5 91.7L40.6 91.3L40.9 90.9L41.3 90.8ZM50.2 87.2L50.5 87.5L50.7 88.2L50.7 88.7L50.4 89.1L49.6 88.5L49.6 87.9L50.0 87.6L50.1 87.1L49.9 86.7L50.3 86.6L50.4 87.0ZM5.7 27.5L5.9 28.0L5.4 28.0L5.0 28.0L5.3 28.3L5.0 28.6L4.4 28.6L4.0 28.2L4.2 27.5L4.5 27.7L5.3 27.4L5.7 27.5ZM54.5 84.3L53.8 84.3L53.4 84.4L53.0 84.3L53.0 83.7L53.3 83.2L53.7 83.0L53.6 83.5L53.6 83.9L53.9 83.4L54.3 83.7L54.4 84.2ZM28.5 30.8L29.1 30.8L29.1 31.3L28.5 31.5L27.9 31.4L27.5 31.5L27.6 30.8L28.0 30.5L28.5 30.8ZM25.8 80.6L25.4 80.5L25.2 79.8L25.5 79.5L25.8 79.1L26.4 78.8L26.2 79.2L26.1 79.5L26.3 80.0L26.0 80.2L25.8 80.6ZM29.2 83.9L29.5 84.4L29.2 84.7L28.7 84.1L28.3 84.2L27.9 84.3L28.2 83.9L28.5 83.6L28.5 83.2L28.8 83.0L29.3 83.4L28.9 83.6L29.2 83.9ZM35.3 92.7L35.4 92.1L35.9 91.7L36.4 91.7L36.4 92.0L36.8 92.4L36.4 92.4L35.8 92.7L35.6 93.1L35.4 92.7ZM24.3 85.5L24.3 85.8L23.9 85.9L23.5 85.8L23.3 86.3L23.0 86.6L22.7 86.3L22.7 85.8L23.0 85.5L23.3 85.5L24.1 85.3ZM25.0 83.1L25.4 82.9L25.6 83.4L25.4 83.8L25.0 84.0L24.7 83.9L24.2 84.0L24.4 83.3L24.9 83.2ZM26.8 86.3L26.8 86.7L26.4 86.7L26.1 86.5L25.7 86.4L25.3 85.8L25.8 85.6L26.2 85.8L26.6 85.9L26.8 86.3Z"
          />
          <path className="karc" d="M 72.5 71.7 Q 64 84 56.3 81.2" />
          <path className="karc" d="M 72.5 71.7 Q 77 46 51.8 30.3" />
          {["M 72.5 71.7 Q 64 84 56.3 81.2", "M 72.5 71.7 Q 77 46 51.8 30.3"].map((d, i) => (
            <circle key={i} r="1.2" className="kdot" style={{ offsetPath: `path('${d}')`, animationDelay: `${-i * 1.5}s` }} />
          ))}
        </svg>
        <div className="kpin main" style={{ left: '72.5%', top: '55.2%' }}>
          <i />
          <b>울산</b>
          <small>첫 적용</small>
        </div>
        <div className="kpin" style={{ left: '54.3%', top: '62.6%' }}>
          <i style={{ animationDelay: '2s' }} />
          <b>사천</b>
          <small>확산 적용</small>
        </div>
        <div className="kpin" style={{ left: '49.5%', top: '22.7%' }}>
          <i style={{ animationDelay: '4s' }} />
          <b>후평</b>
          <small>확산 적용</small>
        </div>
      </div>
    </div>
  </ContentSlide>,

  /* ── 감사합니다 ── */
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
