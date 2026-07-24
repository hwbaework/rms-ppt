'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import 'maplibre-gl/dist/maplibre-gl.css'

// ─────────────────────────────────────────────────────────────────────────────
// 통합에너지플랫폼 구축 현황 발표 — 2026.07.30  (에디토리얼 스타일)
// ★ 작업본(v2) — 260730_demo(고정 스냅샷)에서 분기. 이미지는 /images/260730_demo/ 공유.
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
/* 본문 블록을 세로로 고르게 분산해 하단까지 채운다(빈 공간 방지) */
.area.fill{justify-content:space-between;gap:0}

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
/* 타일 상단 실제 화면 썸네일 — 구축 결과물의 증거 */
.press-thumb{height:5vw;border-radius:10px;overflow:hidden;border:1px solid var(--hair);margin-bottom:.55vw;background:#0a1220}
.press-thumb img{width:100%;height:100%;object-fit:cover;object-position:top center;display:block}
.press-thumb.empty{display:flex;align-items:center;justify-content:center;border-style:dashed;border-color:#c7d2e3;background:var(--chip);color:#94a3b8}
.press-thumb.empty .material-symbols-outlined{font-size:1.4vw}
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
/* ── 3P 타일: 자연 높이 · 상단 아이콘·이름 정렬 · 하단 바·태그 고정 ── */
.split43.fill{margin-top:0;align-items:stretch}
.split43.fill .press-card{padding:1vw .95vw;text-align:left;gap:0}
.press-main{flex:1;display:flex;flex-direction:column;gap:.9vw}
.press-top{display:flex;align-items:center;gap:.6vw;margin-bottom:.7vw}
.press-top .press-ic{width:2.2vw;height:2.2vw;margin:0;flex-shrink:0}
.press-top .press-ic .material-symbols-outlined{font-size:1.15vw}
.press-top .press-k{font-size:.98vw;text-align:left;white-space:nowrap}
.press-feats{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:.7vw}
.press-feats li{position:relative;padding-left:.85vw;color:var(--body);font-size:.83vw;line-height:1.55;word-break:keep-all}
.press-feats li:before{content:"";position:absolute;left:0;top:.55vw;width:.32vw;height:.32vw;border-radius:50%;background:var(--accent)}
.press-card.soon .press-feats li:before{background:#94a3b8}
/* 하반기 구성 중 상태 — 지어낸 기능 대신 정직하게 표시 */
.press-plan{display:flex;flex-direction:column;gap:.5vw;align-items:flex-start}
.press-plan-badge{display:inline-flex;align-items:center;gap:.35vw;background:#eef1f7;border:1px solid #dbe1ea;border-radius:999px;padding:.25vw .75vw;color:#64748b;font-size:.78vw;font-weight:700}
.press-plan-badge .material-symbols-outlined{font-size:.95vw}
.press-plan-d{color:var(--muted);font-size:.79vw;line-height:1.6;word-break:keep-all}
.press-bottom{margin-top:.7vw}
.split43.fill .wip-done,.split43.fill .wip-empty{width:100%;margin:0 0 .5vw}
.split43.fill .press-st{justify-content:flex-start}
/* ── 3P 하단 설명 스트립 ── */
.p3sum{background:var(--card);border:1px solid var(--hair);border-radius:14px;padding:.95vw 1.4vw;display:flex;align-items:center;gap:1vw}
.p3sum-ic{width:2.4vw;height:2.4vw;border-radius:50%;background:var(--tint);color:var(--accent);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.p3sum-ic .material-symbols-outlined{font-size:1.25vw}
.p3sum p{color:var(--body);font-size:.86vw;line-height:1.65}
.p3sum p b{color:var(--ink);font-weight:700}
.p3sum p .hl{color:var(--accent);font-weight:700}
/* ── 3P 하단 내용 블록 — 4개 기능이 하나로 연결됨을 설명 ── */
.p3note{background:var(--card);border:1px solid var(--hair);border-radius:14px;padding:1vw 1.4vw;display:flex;align-items:center;gap:1.1vw}
.p3note-ic{width:2.6vw;height:2.6vw;border-radius:50%;background:var(--tint);color:var(--accent);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.p3note-ic .material-symbols-outlined{font-size:1.35vw}
.p3note-t{flex:1}
.p3note-t b{display:block;color:var(--ink);font-size:.95vw;font-weight:800;margin-bottom:.22vw}
.p3note-t p{color:var(--body);font-size:.82vw;line-height:1.7}
.p3note-t p .hl{color:var(--accent);font-weight:700}
/* 구축 중 — 움직이는 작업 스트라이프 (진행률 주장 없이 "작업 중" 상태 표시) */
.wip{height:.4vw;border-radius:999px;overflow:hidden;background:#e6ecf7;margin-top:.55vw}
.wip i{display:block;height:100%;border-radius:999px;background:repeating-linear-gradient(-45deg,#2563eb 0 .45vw,#60a5fa .45vw .9vw);background-size:1.28vw 100%;animation:crawl 1.1s linear infinite}
@keyframes crawl{to{background-position:1.28vw 0}}
.wip-empty{height:.4vw;border-radius:999px;border:1.5px dashed #c9d3e2;margin-top:.55vw}
/* 하반기 — 미착수 아님, 일부 구성 진행(옅은 회색 부분 채움) */
.wip-early{height:.4vw;border-radius:999px;background:#eef1f7;overflow:hidden;margin-top:.55vw}
.wip-early i{display:block;height:100%;width:30%;border-radius:999px;background:linear-gradient(90deg,#94a3b8,#c4cdda)}
/* 구축 완료 — 꽉 찬 바 + 은은한 스윕 (지금은 QA·안정화 단계) */
.wip-done{height:.4vw;border-radius:999px;background:linear-gradient(90deg,#1d4ed8,#3b82f6);position:relative;overflow:hidden;margin-top:.55vw}
.wip-done:after{content:"";position:absolute;inset:0;background:linear-gradient(100deg,transparent 30%,rgba(255,255,255,.5) 50%,transparent 70%);transform:translateX(-100%);animation:sheen 2.4s ease-in-out infinite}
.press-st{margin-top:.45vw;display:flex;justify-content:center}
.tag.live i{animation:livepulse 1.6s ease-in-out infinite}
@keyframes livepulse{0%,100%{opacity:.4}50%{opacity:1}}

/* ── 연차별 경과 카드 — 완료 / 올해 진행 / 예정 상태를 확실히 구분 ── */
.years{display:grid;grid-template-columns:repeat(4,1fr);gap:1vw;flex:1;align-items:stretch;margin-top:1vw}
.ycard{border:1px solid var(--hair);border-radius:14px;padding:1vw 1.1vw;background:#fff;display:flex;flex-direction:column;gap:.7vw}
.ycard.done{background:linear-gradient(180deg,#ffffff,#f7faff)}
.ycard.now{border:1.5px solid #93c5fd;box-shadow:0 10px 28px rgba(37,99,235,.14);position:relative}
.ycard.todo{border-style:dashed;background:var(--chip)}
.y-head{display:flex;align-items:center;justify-content:space-between;gap:.5vw}
.y-year{font-size:1.05vw;font-weight:800;color:var(--ink);letter-spacing:-.01em}
.y-year small{font-size:.74vw;color:var(--muted);font-weight:600;margin-left:.3vw}
.ycard.todo .y-year{color:#64748b}
.y-items{display:flex;flex-direction:column;gap:.5vw;flex:1}
.y-item{display:flex;align-items:flex-start;gap:.45vw;font-size:.81vw;color:var(--body);line-height:1.55}
.y-item .material-symbols-outlined{font-size:.98vw;color:#10b981;margin-top:.08vw;flex-shrink:0}
.ycard.now .y-item .material-symbols-outlined{color:var(--accent)}
.ycard.todo .y-item .material-symbols-outlined{color:#94a3b8}
.y-badge{position:absolute;top:-.85vw;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#1d4ed8,#3b82f6);color:#fff;border-radius:999px;padding:.18vw .95vw;font-size:.72vw;font-weight:700;box-shadow:0 4px 12px rgba(29,78,216,.35);white-space:nowrap;z-index:1}

/* ── 단계 레인 (트랙 라벨 + 스텝 칩 체인 — 사업계획서 세부추진일정 재구성) ── */
.glanes{background:var(--card);border:1px solid var(--hair);border-radius:14px;overflow:hidden}
.glane{display:flex;align-items:center;gap:1.2vw;padding:.95vw 1.2vw;border-bottom:1px solid var(--hair)}
.glane:last-child{border-bottom:none}
.glane-who{width:13.5vw;flex-shrink:0;display:flex;align-items:center;gap:.5vw;color:var(--ink);font-size:.88vw;font-weight:700}
.glane-who .material-symbols-outlined{font-size:1.05vw;color:var(--accent)}
.glane-steps{flex:1;display:flex;align-items:center;gap:.45vw;flex-wrap:wrap}
.gchip{background:var(--chip);border-radius:8px;padding:.42vw .85vw;color:var(--ink);font-size:.81vw;font-weight:600;white-space:nowrap}
.glane-steps{gap:.65vw}
.gchip.on{background:var(--tint);border:1px solid var(--tint-line);color:#1d4ed8}
.garr{color:#c3ccda;font-size:.85vw;flex-shrink:0}

/* ── 구축률 누적 바 (연차별 목표 세그먼트) ── */
/* 표와 붙지 않게 별도 패널로 분리 */
.pbar-block{margin-top:1.5vw;background:#f7f9fc;border:1px solid var(--hair);border-radius:14px;padding:1vw 1.2vw .9vw}
.pbar-block .block-label{margin-bottom:.7vw}
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
/* 확장 히어로 — 지도가 무대 중앙, 주위에 확장 메시지 카드가 떠 있다 */
.finale2{position:relative;flex:1;min-height:0;display:flex;align-items:center;justify-content:center}
/* ── 12P: 관제 대시보드 틀 + 가운데 실제 MapLibre fly-to 지도 ── */
.finctl{position:relative;flex:1;min-height:0;border-radius:16px;overflow:hidden;border:1px solid #1e3358;box-shadow:0 16px 44px rgba(4,12,28,.35);background:#0a1424}
/* 프로젝터에서 다크 타일이 까맣게 죽어 보여서 밝기·대비 보정 */
.finctl-map{position:absolute;inset:0;width:100%;height:100%;filter:brightness(2.1) contrast(1.02) saturate(1.2)}
.finctl-map canvas{outline:none}
/* 지도 로드 실패 시 폴백 — 통합관제 대시보드 이미지 */
.finctl-fallback{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center}
/* 좌측 그라데이션 스크림 — 카피 가독 확보(지도는 우측으로 갈수록 선명) */
.finctl-scrim{position:absolute;inset:0;z-index:1;pointer-events:none;background:linear-gradient(90deg,rgba(6,14,30,.82) 0%,rgba(6,14,30,.35) 32%,rgba(6,14,30,0) 55%,rgba(6,14,30,0) 100%)}
/* 중앙 락온 프레임 — 지도가 도착한 지역을 잠근다 */
.finctl-lock{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);z-index:2;width:6.5vw;height:4.6vw;pointer-events:none;transition:width .5s,height .5s}
.finctl-lock.wide{width:11vw;height:8vw}
.finctl-lock .rc{position:absolute;width:1vw;height:1vw;border:2px solid rgba(96,165,250,.95)}
.finctl-lock .rc.tl{left:0;top:0;border-right:none;border-bottom:none}
.finctl-lock .rc.tr{right:0;top:0;border-left:none;border-bottom:none}
.finctl-lock .rc.bl{left:0;bottom:0;border-right:none;border-top:none}
.finctl-lock .rc.br{right:0;bottom:0;border-left:none;border-top:none}
/* (구) 위성 이미지 배경 방식 — MapLibre로 대체, 스타일만 잔존 참조용 */
.finale3{position:relative;flex:1;min-height:0;border-radius:16px;overflow:hidden;border:1px solid #1e3358;box-shadow:0 16px 44px rgba(4,12,28,.35)}
.finale3 .fin-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;animation:finKen 24s ease-in-out infinite alternate}
/* 배경 미세 줌·팬 — 화면이 살아 움직이는 느낌 */
@keyframes finKen{from{transform:scale(1.06)}to{transform:scale(1.13) translate(-1.5%,-1%)}}
/* 조준 뷰파인더 — 위치 사이를 부드럽게 이동(위치가 바뀌는 확장 연출) */
.fin-reticle{position:absolute;transform:translate(-50%,-50%);z-index:2;width:7vw;height:4.8vw;pointer-events:none;transition:left 1.1s cubic-bezier(.45,.05,.2,1),top 1.1s cubic-bezier(.45,.05,.2,1)}
.fin-reticle .rc{position:absolute;width:1vw;height:1vw;border:2px solid rgba(96,165,250,.95)}
.fin-reticle .rc.tl{left:0;top:0;border-right:none;border-bottom:none}
.fin-reticle .rc.tr{right:0;top:0;border-left:none;border-bottom:none}
.fin-reticle .rc.bl{left:0;bottom:0;border-right:none;border-top:none}
.fin-reticle .rc.br{right:0;bottom:0;border-left:none;border-top:none}
.fin-reticle.ghost .rc{border-color:rgba(127,168,232,.75);border-style:dashed}
.fin-ret-dot{position:absolute;left:50%;top:50%;width:.55vw;height:.55vw;border-radius:50%;background:#60a5fa;transform:translate(-50%,-50%);box-shadow:0 0 12px rgba(96,165,250,.9);animation:finpulse 1.6s ease-in-out infinite}
.fin-ret-lab{position:absolute;left:50%;top:calc(100% + .35vw);transform:translateX(-50%);white-space:nowrap;text-align:center;background:rgba(8,18,36,.82);border:1px solid rgba(127,168,232,.4);border-radius:8px;padding:.3vw .85vw;-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}
.fin-ret-lab b{color:#fff;font-size:.9vw;font-weight:800}
.fin-ret-lab small{display:block;color:var(--accent-soft);font-size:.7vw;margin-top:.08vw}
/* 어둡게 + 좌측 그라데이션으로 텍스트 가독 확보 */
.finale3 .fin-scrim{position:absolute;inset:0;background:linear-gradient(90deg,rgba(6,14,30,.9) 0%,rgba(6,14,30,.6) 42%,rgba(6,14,30,.15) 100%)}
/* 라이브 관제 배지 (좌상단, 깜빡이지 않는 은은한 점) */
.fin-live{position:absolute;top:1.1vw;left:1.3vw;z-index:2;display:flex;align-items:center;gap:.5vw;background:rgba(8,18,36,.72);border:1px solid rgba(127,168,232,.3);border-radius:999px;padding:.32vw 1vw;color:#cdddf7;font-size:.82vw;font-weight:700;-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}
.fin-live i{width:.5vw;height:.5vw;border-radius:50%;background:#22c55e;box-shadow:0 0 8px rgba(34,197,94,.8);animation:finpulse 2.4s ease-in-out infinite}
@keyframes finpulse{0%,100%{opacity:.5}50%{opacity:1}}
/* 스캔 라인 — 관제 화면 느낌(가로선이 아래로 천천히 흐름) */
.fin-scan{position:absolute;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,rgba(96,165,250,.55),transparent);z-index:2;pointer-events:none;animation:finscan 6s linear infinite}
@keyframes finscan{0%{top:0;opacity:0}8%{opacity:1}92%{opacity:1}100%{top:100%;opacity:0}}
/* 좌측 오버레이 텍스트 블록 */
.fin-copy{position:absolute;left:2.4vw;top:50%;transform:translateY(-50%);z-index:2;max-width:34%}
.fin-eyebrow{color:var(--accent-soft);letter-spacing:.28em;text-transform:uppercase;font-size:.72vw;font-weight:700;margin-bottom:.9vw}
.fin-title{color:#fff;font-size:2vw;font-weight:900;letter-spacing:-.02em;line-height:1.28;margin-bottom:1.1vw}
.fin-title .hl{color:var(--accent-soft)}
.fin-steps{display:flex;flex-direction:column;gap:.55vw}
.fin-step{display:flex;align-items:center;gap:.7vw;background:rgba(12,24,46,.6);border:1px solid rgba(127,168,232,.22);border-radius:11px;padding:.55vw .9vw;-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px)}
.fin-step .fs-no{width:1.5vw;height:1.5vw;border-radius:50%;background:linear-gradient(135deg,#1d4ed8,#3b82f6);color:#fff;font-size:.72vw;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.fin-step.next .fs-no{background:transparent;border:1.5px dashed rgba(127,168,232,.6);color:var(--accent-soft)}
.fin-step b{color:#fff;font-size:.92vw;font-weight:700}
.fin-step small{color:rgba(191,209,238,.7);font-size:.72vw;margin-left:.35vw}
/* 뷰파인더가 그 지역에 있을 때 해당 스텝이 켜진다 */
.fin-step{transition:border-color .4s,box-shadow .4s,background .4s}
.fin-step.on{border-color:rgba(96,165,250,.7);background:rgba(37,99,235,.28);box-shadow:0 6px 20px rgba(37,99,235,.28)}
.fnote{position:absolute;background:#fff;border:1px solid var(--hair);border-radius:12px;padding:.75vw 1.05vw;box-shadow:0 8px 24px rgba(11,21,38,.08);max-width:17vw;z-index:1}
.fnote b{display:flex;align-items:center;gap:.45vw;font-size:.94vw;color:var(--ink);font-weight:700}
.fnote b .material-symbols-outlined{font-size:1.05vw;color:var(--accent)}
.fnote small{display:block;font-size:.76vw;color:var(--muted);margin-top:.2vw;line-height:1.6}
.kpin.ghost i{background:#fff;border:2px dashed #93c5fd;box-shadow:none}
.kpin.ghost b{color:#1d4ed8;border-style:dashed;border-color:#bfdbfe}
.karc.ghosted{stroke:#c9d8f0;stroke-dasharray:1.6 2.2}
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
/* 캡처 미첨부 시 자리 표시 (WIP — 파일 넣으면 자동 교체) */
.shot-ph{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.5vw;background:#0e1a30;color:#5b6b86;opacity:0;transition:opacity .7s ease}
.shot-ph.on{opacity:1}
.shot-ph .material-symbols-outlined{font-size:2.4vw}
.shot-ph span:last-child{font-size:.9vw;font-weight:600;letter-spacing:.02em}
.shot img.on{opacity:1}
.shot-dots{position:absolute;bottom:.7vw;left:50%;transform:translateX(-50%);display:flex;gap:.4vw;z-index:1}
.shot-dots i{width:.45vw;height:.45vw;border-radius:50%;background:rgba(255,255,255,.35);transition:background .3s,transform .3s}
.shot-dots i.on{background:#fff;transform:scale(1.25)}

/* ── 좌측 컬럼 (7~12P) — 절차·카드는 자연 높이 유지(강제로 늘리지 않음), 컬럼 안에서 세로 중앙 ── */
.proc{display:flex;flex-direction:column}

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

/* ── 경과(3P) 연차 그리드 — 위(연차 카드) + 아래(할 일)를 같은 열에 정렬 ── */
/* 열: 1차 · 화살표 · 2차 · 화살표 · 3차(넓게) · 화살표 · 4차 */
.yrgrid{flex:1;min-height:0;display:grid;grid-template-columns:11.5vw 1.6vw 11.5vw 1.6vw 1fr 1.6vw 8.5vw;grid-template-rows:auto 1fr;column-gap:.55vw;row-gap:.7vw;align-items:stretch}
.gc1{grid-column:1}.gc2{grid-column:2}.gc3{grid-column:3}.gc4{grid-column:4}.gc5{grid-column:5}.gc6{grid-column:6}.gc7{grid-column:7}
/* 1행 — 연차 카드 */
.yr-mini,.yr-hero,.yr-next,.yr-arr{grid-row:1}
.yr-mini{background:#f5f7fb;border:1px solid var(--hair);border-radius:12px;padding:.7vw .85vw;display:flex;flex-direction:column;justify-content:center;gap:.24vw}
.yr-mini .yr-yr{display:flex;align-items:center;gap:.35vw;color:#64748b;font-size:.76vw;font-weight:800}
.yr-mini .yr-yr .material-symbols-outlined{font-size:.9vw;color:#10b981}
.yr-mini .yr-nm{color:var(--ink);font-size:.85vw;font-weight:700}
.yr-arr{align-self:center;justify-self:center;color:#c3ccda;font-size:1.1vw}
.yr-hero{border:1.5px solid #7fb0f5;border-radius:14px;background:linear-gradient(135deg,#eaf2ff,#f5f9ff);padding:.8vw 1.1vw;display:flex;flex-direction:column;justify-content:center;gap:.22vw;box-shadow:0 8px 24px rgba(37,99,235,.14);position:relative}
.yr-hero-badge{position:absolute;top:-.7vw;left:1.1vw;background:linear-gradient(135deg,#1d4ed8,#3b82f6);color:#fff;font-size:.72vw;font-weight:800;border-radius:999px;padding:.18vw .8vw;display:inline-flex;align-items:center;gap:.3vw}
.yr-hero-badge i{width:.42vw;height:.42vw;border-radius:50%;background:#fff;animation:livepulse 1.6s ease-in-out infinite}
.yr-hero-yr{color:var(--accent);font-size:.82vw;font-weight:800}
.yr-hero-nm{color:var(--ink);font-size:1.2vw;font-weight:800;letter-spacing:-.02em}
.yr-next{border:1.5px dashed #cbd5e1;border-radius:12px;background:var(--chip);padding:.7vw .8vw;display:flex;flex-direction:column;justify-content:center;gap:.22vw}
.yr-next .yr-yr{color:#94a3b8;font-size:.74vw;font-weight:800}
.yr-next .yr-nm{color:#64748b;font-size:.8vw;font-weight:700}
/* 2행 — 각 연차 아래 할 일(같은 열 폭) */
.yrtasks{grid-row:2;margin:0;list-style:none;border:1px solid var(--hair);border-radius:12px;background:#fbfcfe;padding:.75vw .8vw;display:flex;flex-direction:column;justify-content:center;gap:.7vw}
.yrtasks li{display:flex;align-items:center;gap:.5vw;color:var(--ink);font-size:.82vw;font-weight:600;line-height:1.2;word-break:keep-all}
.yrtasks li .material-symbols-outlined{font-size:1.25vw;color:#94a3b8;flex-shrink:0}
.yrtasks.done{opacity:.96}
.yrtasks.now{border:1.5px solid #7fb0f5;background:linear-gradient(180deg,#eff6ff,#fbfdff);box-shadow:0 8px 22px rgba(37,99,235,.12)}
.yrtasks.now li .material-symbols-outlined{color:var(--accent)}
.yrtasks.next{border:1.5px dashed #cbd5e1;background:#f9fafb}
.yrtasks.next li{color:#94a3b8}
.yrtasks.next li .material-symbols-outlined{color:#cbd5e1}

/* ── RMS 방향성(2P) — 좌 설명 텍스트 / 우 도식(하나의 플랫폼 → 확장) ── */
.v2grid{flex:1;min-height:0;display:grid;grid-template-columns:.82fr 1.18fr;align-items:center;gap:2.4vw}
/* 좌 — 깔끔한 설명 문단(제목처럼 안 보이게 본문 크기) */
.v2txt{display:flex;flex-direction:column;gap:1.1vw}
.v2txt p{color:var(--body);font-size:.98vw;line-height:1.9;word-break:keep-all}
.v2txt p b{color:var(--ink);font-weight:800}
.v2txt p .hl{color:var(--accent);font-weight:800}
.v2txt-tags{display:flex;gap:.55vw;margin-top:.3vw}
.v2txt-tags span{background:var(--tint);border:1px solid var(--tint-line);color:#1d4ed8;font-size:.85vw;font-weight:800;border-radius:999px;padding:.32vw 1.05vw}
/* 우 — 도식 컬럼(코어 세로 + 확장) */
.v2dia{align-self:stretch;display:flex;flex-direction:column;justify-content:center}
.v2core{position:relative;display:flex;flex-direction:column;gap:.75vw;border:1.5px solid #b9d2f8;border-radius:20px;background:linear-gradient(160deg,#f4f9ff,#e7f0ff);padding:2vw 1.5vw 1.4vw;box-shadow:0 12px 30px rgba(37,99,235,.12)}
.v2core-tab{position:absolute;top:-.95vw;left:1.5vw;background:linear-gradient(135deg,#1d4ed8,#3b82f6);color:#fff;font-size:.92vw;font-weight:800;border-radius:999px;padding:.34vw 1.1vw;box-shadow:0 6px 16px rgba(29,78,216,.32);display:inline-flex;align-items:center;gap:.45vw}
.v2core-tab .material-symbols-outlined{font-size:1.05vw}
.v2node{display:flex;align-items:center;gap:.9vw;background:#fff;border:1px solid var(--tint-line);border-radius:13px;padding:.85vw 1.1vw;box-shadow:0 2px 8px rgba(11,21,38,.05)}
.v2node.done{border-color:#7fb0f5;background:linear-gradient(135deg,#ffffff,#e9f1ff);box-shadow:0 8px 22px rgba(37,99,235,.15)}
.v2node-ic{width:2.7vw;height:2.7vw;border-radius:50%;background:var(--tint);color:var(--accent);display:grid;place-items:center;flex-shrink:0}
.v2node.done .v2node-ic{background:linear-gradient(135deg,#1d4ed8,#3b82f6);color:#fff;box-shadow:0 6px 16px rgba(37,99,235,.32)}
.v2node-ic .material-symbols-outlined{font-size:1.4vw}
.v2node-t b{display:block;font-size:1.02vw;color:var(--ink);font-weight:800}
.v2node-t small{display:block;font-size:.82vw;color:var(--muted);margin-top:.12vw;line-height:1.4}
.v2core-seam{display:flex;justify-content:flex-start;padding-left:2.45vw}
.v2core-seam:before{content:"";width:2px;height:.95vw;background:#bcd3f5;border-radius:2px}
/* 코어 → 확장 다리(아래로) */
.v2bridge{display:flex;align-items:center;justify-content:center;gap:.5vw;padding:.7vw 0;color:#7ba7ea}
.v2bridge .material-symbols-outlined{font-size:1.7vw}
.v2bridge span{font-size:.8vw;font-weight:800;color:#94a3b8;white-space:nowrap}
/* 확장 — 코어 밖, 점선 */
.v2exp{position:relative;display:flex;flex-direction:column;gap:.75vw;border:1.5px dashed #a9c4ef;border-radius:20px;background:repeating-linear-gradient(135deg,#fbfdff 0 12px,#f3f8ff 12px 24px);padding:2vw 1.4vw 1.4vw}
.v2exp-tab{position:absolute;top:-.95vw;left:1.4vw;background:#fff;border:1.5px solid #a9c4ef;color:#1d4ed8;font-size:.92vw;font-weight:800;border-radius:999px;padding:.32vw 1.1vw;display:inline-flex;align-items:center;gap:.4vw}
.v2exp-tab .material-symbols-outlined{font-size:1.05vw}
.v2exp-row{display:flex;gap:.8vw}
.v2exp-item{flex:1;display:flex;align-items:center;gap:.6vw;background:#fff;border:1px solid var(--tint-line);border-radius:11px;padding:.7vw .85vw;color:var(--ink);font-size:.9vw;font-weight:700;line-height:1.25;word-break:keep-all}
.v2exp-item .material-symbols-outlined{font-size:1.3vw;color:var(--accent);flex-shrink:0}
.v2exp-item small{display:block;color:var(--muted);font-size:.74vw;font-weight:600;margin-top:.1vw}
.v2exp-grow{display:flex;align-items:center;gap:.5vw;justify-content:center;color:#1d4ed8;font-size:.9vw;font-weight:800}
.v2exp-grow .material-symbols-outlined{font-size:1.15vw}

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
  fill,
}: {
  no: string
  sec: string
  title: ReactNode
  lede?: ReactNode
  children: ReactNode
  /** true면 본문 블록을 세로로 고르게 분산해 하단까지 채운다 */
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
  feats,
  planning,
  soon,
  bar,
  st,
  thumb,
}: {
  ic: string
  k: string
  d?: string
  /** 기능 목록 — 타일 안에 어떤 기능이 있는지 몇 줄로 정리 */
  feats?: string[]
  /** 아직 세부 기능 미확정(구성 중) — 지어낸 기능 대신 구성 중 표시 */
  planning?: string
  soon?: boolean
  bar?: 'wip' | 'todo' | 'done' | 'early'
  st?: ReactNode
  /** 실제 화면 썸네일 경로 — 빈 문자열이면 점선 자리 표시 */
  thumb?: string
}) {
  return (
    <div className={`press-card${soon ? ' soon' : ''}`}>
      <div className="press-main">
        <div className="press-top">
          {thumb !== undefined ? (
            thumb ? (
              <div className="press-thumb"><img src={thumb} alt={`${k} 화면`} /></div>
            ) : (
              <div className="press-thumb empty"><span className="material-symbols-outlined">add_photo_alternate</span></div>
            )
          ) : (
            <div className="press-ic"><span className="material-symbols-outlined">{ic}</span></div>
          )}
          <div className="press-k">{k}</div>
        </div>
        {feats && (
          <ul className="press-feats">
            {feats.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        )}
        {planning && (
          <div className="press-plan">
            <span className="press-plan-badge"><span className="material-symbols-outlined">pending</span>지금 구성 중</span>
            <span className="press-plan-d">{planning}</span>
          </div>
        )}
        {d && <div className="press-d">{d}</div>}
      </div>
      <div className="press-bottom">
        {bar === 'wip' && <div className="wip"><i /></div>}
        {bar === 'done' && <div className="wip-done" />}
        {bar === 'early' && <div className="wip-early"><i /></div>}
        {bar === 'todo' && <div className="wip-empty" />}
        {st && <div className="press-st">{st}</div>}
      </div>
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
  const [failed, setFailed] = useState<Record<number, boolean>>({})
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % srcs.length), interval)
    return () => clearInterval(t)
  }, [srcs.length, interval])
  // 하이드레이션 전 404는 img onError를 놓치므로 클라이언트에서 프리로드로 재확인
  useEffect(() => {
    srcs.forEach((s, idx) => {
      const im = new window.Image()
      im.onerror = () => setFailed((f) => ({ ...f, [idx]: true }))
      im.src = s
    })
  }, [srcs])
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
      {srcs.map((s, idx) =>
        failed[idx] ? (
          <div key={s} className={`shot-ph${idx === i ? ' on' : ''}`}>
            <span className="material-symbols-outlined">add_photo_alternate</span>
            <span>화면 캡처 대기</span>
          </div>
        ) : (
          <img
            key={s}
            src={s}
            alt="플랫폼 화면 캡처"
            className={idx === i ? 'on' : ''}
            onError={() => setFailed((f) => ({ ...f, [idx]: true }))}
          />
        )
      )}
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

// 마무리 확장 — 관제 대시보드 틀(좌 카피 · 우 발전소 목록)은 유지, 가운데는 실제 MapLibre 지도가
// 울산 → 사천 → 후평 → 전국으로 카메라를 날려(flyTo) "위치가 바뀌는" 확장을 실제로 보여준다
const FIN_STOPS = [
  { center: [129.311, 35.539] as [number, number], zoom: 8.8, name: '울산', sub: '첫 적용', step: 0 },
  { center: [126.705, 37.456] as [number, number], zoom: 8.8, name: '인천', sub: '확산 적용', step: 1 },
  { center: [128.064, 35.004] as [number, number], zoom: 8.8, name: '사천', sub: '확산 적용', step: 2 },
  { center: [127.734, 37.874] as [number, number], zoom: 8.8, name: '후평', sub: '확산 적용', step: 3 },
  { center: [127.8, 36.3] as [number, number], zoom: 6.1, name: '전국단위 확산', sub: '같은 플랫폼 기반 위에서', step: 4, wide: true },
]
function FinaleExpand() {
  const mapRef = useRef<HTMLDivElement>(null)
  const [i, setI] = useState(0)
  const [mapFailed, setMapFailed] = useState(false)
  const iRef = useRef(0)

  useEffect(() => {
    let map: import('maplibre-gl').Map | undefined
    let timer: ReturnType<typeof setInterval> | undefined
    let loaded = false
    let cancelled = false
    // 지도가 일정 시간 내 안 뜨면(오프라인·타일 지연 등) 대시보드 이미지로 폴백
    const fallbackTimer = setTimeout(() => {
      if (!loaded && !cancelled) setMapFailed(true)
    }, 6000)
    ;(async () => {
      try {
        const maplibregl = await import('maplibre-gl')
        if (cancelled || !mapRef.current) return
        map = new maplibregl.Map({
          container: mapRef.current,
          // 벡터(worker 파싱)보다 안정적인 래스터 다크 타일 — 파이프라인 단순, load 빠름
          style: {
            version: 8,
            sources: {
              carto: {
                type: 'raster',
                tiles: [
                  'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
                  'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
                  'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
                ],
                tileSize: 256,
                attribution: '© CARTO © OpenStreetMap',
              },
            },
            layers: [{ id: 'carto', type: 'raster', source: 'carto' }],
          },
          center: FIN_STOPS[0].center,
          zoom: FIN_STOPS[0].zoom,
          interactive: false,
          attributionControl: false,
        })
        map.on('error', (e) => console.error('[MAPLIBRE]', (e as { error?: Error })?.error?.message || e))
        map.on('load', () => {
          loaded = true
          setMapFailed(false)
          map!.resize()
          timer = setInterval(() => {
            const next = (iRef.current + 1) % FIN_STOPS.length
            iRef.current = next
            setI(next)
            const s = FIN_STOPS[next]
            map!.flyTo({ center: s.center, zoom: s.zoom, speed: 0.7, curve: 1.5, essential: true })
          }, 3400)
        })
      } catch (err) {
        console.error('[MAPLIBRE import]', err)
        if (!cancelled) setMapFailed(true)
      }
    })()
    return () => {
      cancelled = true
      clearTimeout(fallbackTimer)
      if (timer) clearInterval(timer)
      map?.remove()
    }
  }, [])

  const cur = FIN_STOPS[i]
  return (
    <div className="finctl">
      <div ref={mapRef} className="finctl-map" style={{ visibility: mapFailed ? 'hidden' : 'visible' }} />
      {mapFailed && (
        <img className="finctl-fallback" src="/images/260730_demo/monitoring-dashboard.png" alt="통합관제 대시보드" />
      )}
      <div className="finctl-scrim" />

      {/* 중앙 조준 락온 — 지도가 날아와 도착한 지역을 잠근다 */}
      <div className={`finctl-lock${cur.wide ? ' wide' : ''}`}>
        <span className="rc tl" /><span className="rc tr" /><span className="rc bl" /><span className="rc br" />
        <span className="fin-ret-dot" />
        <div className="fin-ret-lab"><b>{cur.name}</b><small>{cur.sub}</small></div>
      </div>

      {/* 좌측 확장 카피 */}
      <div className="fin-copy">
        <p className="fin-eyebrow">Sustainable &amp; Expandable</p>
        <h3 className="fin-title">울산 · 사천 · 후평 —<br /><span className="hl">전국단위 확산</span></h3>
        <div className="fin-steps">
          <div className={`fin-step${cur.step === 0 ? ' on' : ''}`}><span className="fs-no">1</span><b>울산</b><small>첫 적용</small></div>
          <div className={`fin-step${cur.step === 1 ? ' on' : ''}`}><span className="fs-no">2</span><b>인천</b><small>확산 적용</small></div>
          <div className={`fin-step${cur.step === 2 ? ' on' : ''}`}><span className="fs-no">3</span><b>사천</b><small>확산 적용</small></div>
          <div className={`fin-step${cur.step === 3 ? ' on' : ''}`}><span className="fs-no">4</span><b>후평</b><small>확산 적용</small></div>
          <div className={`fin-step next${cur.step === 4 ? ' on' : ''}`}><span className="fs-no">→</span><b>전국단위 확산</b><small>같은 플랫폼 기반 위에서</small></div>
        </div>
      </div>

    </div>
  )
}

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

  /* ── 2page : RMS의 방향성 (표지 다음 개요 — 이후 페이지 한 칸씩 밀림) ── */
  <ContentSlide
    key="p-vision"
    no=""
    sec="RMS의 방향성"
    title={<>지속가능한, <span className="hl">미래 확장형 플랫폼</span></>}
    lede={<>납품하고 끝나는 시스템이 아니라 — <b>수요기업이 RE100을 시작부터 끝까지 이행</b>하고, 울산을 넘어 <b>계속 확장</b>하는 플랫폼을 지향합니다.</>}
    fill
  >
    <div className="v2grid">
      {/* 좌 — 설명 텍스트 */}
      <div className="v2txt">
        <p>
          <b>컨설팅</b>을 통해 접근성을 높이고, <b>컨설턴트</b>가 RE100 이행 수단을 제공합니다.
          이 과정을 <b className="hl">하나의 플랫폼 안에서 시작부터 끝까지</b> 이행할 수 있도록 구성했습니다.
        </p>
        <p>
          나아가 <b>e데이터마켓</b>은 울산에 한정된 데이터에 머물지 않고, <b>신규 플랫폼과 연동</b>해
          실제 필요한 데이터까지 <b className="hl">서비스 범위를 대폭 확장</b>합니다.
        </p>
        <div className="v2txt-tags"><span>지속가능</span><span>미래 확장형</span></div>
      </div>

      {/* 우 — 도식: 하나의 플랫폼(코어) → 확장 */}
      <div className="v2dia">
        <div className="v2core">
          <span className="v2core-tab"><span className="material-symbols-outlined">hub</span>하나의 플랫폼</span>
          <div className="v2node">
            <span className="v2node-ic"><span className="material-symbols-outlined">support_agent</span></span>
            <div className="v2node-t"><b>컨설팅</b><small>접근성 향상 · 진입장벽 해소</small></div>
          </div>
          <div className="v2core-seam" />
          <div className="v2node">
            <span className="v2node-ic"><span className="material-symbols-outlined">handshake</span></span>
            <div className="v2node-t"><b>컨설턴트</b><small>RE100 이행 수단 제공</small></div>
          </div>
          <div className="v2core-seam" />
          <div className="v2node done">
            <span className="v2node-ic"><span className="material-symbols-outlined">task_alt</span></span>
            <div className="v2node-t"><b>시작부터 끝까지 이행</b><small>한 플랫폼에서 RE100 완결</small></div>
          </div>
        </div>

        <div className="v2bridge">
          <span className="material-symbols-outlined">arrow_downward</span>
          <span>밖으로 확장</span>
        </div>

        <div className="v2exp">
          <span className="v2exp-tab"><span className="material-symbols-outlined">rocket_launch</span>미래 확장</span>
          <div className="v2exp-row">
            <div className="v2exp-item">
              <span className="material-symbols-outlined">storefront</span>
              <div><b>e데이터마켓</b><small>실제 필요한 데이터까지</small></div>
            </div>
            <div className="v2exp-item">
              <span className="material-symbols-outlined">device_hub</span>
              <div><b>신규 플랫폼 연동</b><small>울산 데이터를 넘어</small></div>
            </div>
          </div>
          <div className="v2exp-grow"><span className="material-symbols-outlined">public</span>울산 → 전국으로 범위 확장</div>
        </div>
      </div>
    </div>
  </ContentSlide>,

  /* ── 3page : 사업 추진 경과 (1~2차년도) ── */
  /*    연차별 단계·3차년도 할 일·구축률: [울산미포에자자] 3차년도 사업계획서(2026.03) 재구성 */
  <ContentSlide
    key="p2"
    no="01"
    sec="사업 추진 경과 — 1~2차년도"
    title={<>3차년도 — <span className="hl">핵심 기능 개발</span></>}
    lede={<>1~2차년도에 다진 기반 위에서, <b>계획된 일정에 따라 정상적으로</b> 개발을 진행하고 있습니다.</>}
    fill
  >
    {/* 위(연차 카드) + 아래(할 일)를 같은 그리드 열에 정렬 — 1·2차 절제 · 3차 강조 */}
    <div className="yrgrid">
      {/* 1행 — 연차 카드 */}
      <div className="yr-mini gc1">
        <span className="yr-yr"><span className="material-symbols-outlined">check_circle</span>1차년도 · 2024</span>
        <span className="yr-nm">현황조사 · 요구 정의</span>
      </div>
      <span className="yr-arr gc2 material-symbols-outlined">arrow_forward</span>
      <div className="yr-mini gc3">
        <span className="yr-yr"><span className="material-symbols-outlined">check_circle</span>2차년도 · 2025</span>
        <span className="yr-nm">플랫폼 · 인프라 설계</span>
      </div>
      <span className="yr-arr gc4 material-symbols-outlined">arrow_forward</span>
      <div className="yr-hero gc5">
        <span className="yr-hero-badge"><i />올해 · 진행 중</span>
        <span className="yr-hero-yr">3차년도 · 2026</span>
        <span className="yr-hero-nm">핵심 기능 개발</span>
      </div>
      <span className="yr-arr gc6 material-symbols-outlined">arrow_forward</span>
      <div className="yr-next gc7">
        <span className="yr-yr">4차년도 · 2027</span>
        <span className="yr-nm">고도화 · 이관</span>
      </div>

      {/* 2행 — 각 연차 아래 할 일(같은 열 폭에 정렬) */}
      <ul className="yrtasks done gc1">
        <li><span className="material-symbols-outlined">assessment</span>에너지 현황조사</li>
        <li><span className="material-symbols-outlined">groups</span>신재생 수요 발굴</li>
        <li><span className="material-symbols-outlined">architecture</span>요구 · 아키텍처 설계</li>
        <li><span className="material-symbols-outlined">schema</span>관제 시나리오 설계</li>
      </ul>
      <ul className="yrtasks done gc3">
        <li><span className="material-symbols-outlined">design_services</span>플랫폼 프로세스 설계</li>
        <li><span className="material-symbols-outlined">draw</span>플랫폼 개발 설계</li>
        <li><span className="material-symbols-outlined">lan</span>상황실 서버 · 인프라 설계</li>
      </ul>
      <ul className="yrtasks now gc5">
        <li><span className="material-symbols-outlined">build_circle</span>핵심 기능 개발</li>
        <li><span className="material-symbols-outlined">dns</span>상황실 서버 · 데이터센터 구축</li>
        <li><span className="material-symbols-outlined">monitoring</span>통합관제 모니터링</li>
        <li><span className="material-symbols-outlined">tune</span>통합 · 안정화</li>
      </ul>
      <ul className="yrtasks next gc7">
        <li><span className="material-symbols-outlined">rocket_launch</span>기능 고도화</li>
        <li><span className="material-symbols-outlined">move_up</span>운영 이관</li>
      </ul>
    </div>

    <div className="pbar-block">
      <div className="block-label"><b>ESG 에너지 플랫폼 구축률 — 연차별 목표</b></div>
      <div className="pbar">
        <div className="pseg y1" style={{ width: '20%' }}>1차 20%</div>
        <div className="pseg y2" style={{ width: '40%' }}>2차 40%</div>
        <div className="pseg y3" style={{ width: '30%' }}>3차 30%</div>
        <div className="pseg y4" style={{ width: '10%' }}>4차 · 고도화</div>
      </div>
      <div className="pbar-cap">
        <span className="pbar-mark" style={{ left: '90%' }}>3차년도 말 누적 90%</span>
      </div>
    </div>
  </ContentSlide>,

  /* ── 3page : 3차년도 개발 현황 요약 ── */
  <ContentSlide
    key="p3"
    no="01"
    sec="사업 추진 경과 — 3차년도 개발 현황"
    title={<>상반기 <span className="hl">4</span>개 구축 완료 — <span className="hl">QA · 안정화</span></>}
    lede={<>지금 보여드리는 것은 <b>현재까지의 구축 결과물</b>입니다.</>}
    fill
  >
    <div>
      <div className="yeartrack">
        <div className="yt-h1"><span className="material-symbols-outlined">task_alt</span>상반기 — 4개 구축 완료 · 안정화</div>
        <div className="yt-h2">하반기 — 3개 개발 계획 (12p 로드맵)</div>
        <span className="yt-now" style={{ left: '58%' }}>지금 · 7월</span>
      </div>
    </div>
    <div className="split43 fill">
      <div className="press">
        <Tile ic="support_agent" k="컨설팅" feats={['무료 진단 (A~F 등급)', '컨설턴트 매칭', '톡 상담 · 자료 요청', 'RE100 이행 7단계']} bar="done" st={<span className="tag blue live"><i />QA · 안정화</span>} />
        <Tile ic="monitoring" k="모니터링" feats={['통합관제 대시보드', '발전량 실시간 감시', '이상 감지 · 알림', 'A/S · O&M 접수']} bar="done" st={<span className="tag blue live"><i />QA · 안정화</span>} />
        <Tile ic="swap_horiz" k="전력거래" feats={['재생에너지 전력 조회', '거래 등록 · 체결', 'Lease · On/Off-site', '전력 확보']} bar="done" st={<span className="tag blue live"><i />QA · 안정화</span>} />
        <Tile ic="view_in_ar" k="DT" feats={['설치 전 3D 시뮬레이션', '예상 발전량 · 효과 확인']} bar="done" st={<span className="tag blue live"><i />QA · 안정화</span>} />
      </div>
      <div className="press p3">
        <Tile soon ic="co2" k="탄소배출관리" planning="탄소 배출 현황 파악 · 감축 관리 영역" bar="early" st={<span className="tag gray"><i />일부 구성 · 하반기 확대</span>} />
        <Tile soon ic="storefront" k="e데이터마켓" planning="에너지 데이터 · 탄소배출권 거래 영역" bar="early" st={<span className="tag gray"><i />일부 구성 · 하반기 확대</span>} />
        <Tile soon ic="hub" k="VPP" planning="분산자원 통합 가상발전소 영역" bar="early" st={<span className="tag gray"><i />일부 구성 · 하반기 확대</span>} />
      </div>
    </div>
    <div className="p3sum">
      <span className="p3sum-ic"><span className="material-symbols-outlined">deployed_code</span></span>
      <p>
        상반기 <b>컨설팅 · 모니터링 · 전력거래 · DT</b> 4대 서비스는 구축을 마치고 <span className="hl">QA · 안정화</span> 단계에 있으며,
        하반기에는 <b>탄소배출관리 · e데이터마켓 · VPP</b>를 더해 진단부터 거래 · 관리까지 하나의 플랫폼으로 완성해 나갑니다.
      </p>
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
    title={<>단순 모니터링을 넘어 — <span className="hl">통합관제</span></>}
    lede={<>발전량만 보는 모니터링은 <b>반쪽짜리</b>입니다 — 전체 발전소를 한 화면에서 관제하고, 감지·조치·결과까지 하나로 잇습니다.</>}
  >
    <AutoShots
      side
      steps={[
        { b: '통합관제', s: '전체 발전소를 한 화면에서 관제' },
        { b: '이상상황 감지', s: '모니터링 알림' },
        { b: 'A/S · O&M 접수', s: '플랫폼 내에서 바로 연계' },
        { b: '조치', s: '처리 진행' },
      ]}
      srcs={[
        '/images/260730_demo/monitoring-dashboard.png',
        '/images/260730_demo/monitoring-01.png',
        '/images/260730_demo/monitoring-02.png',
        '/images/260730_demo/monitoring-03.png',
      ]}
      extra={
        <Effects
          items={[
            '전체 발전소를 한 화면에서 통합관제',
            '감지에서 결과 확인까지 하나의 흐름으로 완결',
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
    <FinaleExpand />
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
