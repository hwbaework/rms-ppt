'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// 통합에너지플랫폼 구축 현황 발표 — 2026.07.29  (에디토리얼 스타일)
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
.cover-sub{color:rgba(191,209,238,.85);font-size:1.05vw;font-weight:300;line-height:1.8;margin-bottom:2.2vw;position:relative;z-index:1}
.cover-sub b{color:#fff;font-weight:600}
.cover-steps{display:flex;align-items:center;gap:.7vw;margin-bottom:3vw;position:relative;z-index:1;flex-wrap:wrap}
.cover-step{display:inline-flex;align-items:center;gap:.5vw;border:1px solid rgba(127,168,232,.35);border-radius:999px;padding:.34vw 1vw;color:rgba(191,209,238,.9);font-size:.78vw;font-weight:600}
.cover-step .material-symbols-outlined{font-size:.95vw;color:var(--accent-soft)}
.cover-step small{font-weight:400;opacity:.75}
.cover-step-arr{color:rgba(127,168,232,.5);font-size:.9vw}
.cover-meta{display:flex;align-items:center;gap:1vw;color:rgba(148,168,200,.85);font-size:.82vw;position:relative;z-index:1}
.cover-meta img{height:1.35vw;filter:brightness(0) invert(1);opacity:.9}
.cover-meta i{width:3px;height:3px;border-radius:50%;background:rgba(148,168,200,.5)}

/* ── 본문 공통 ── */
.cs{background:var(--paper);display:flex;flex-direction:column}
.cs-body{flex:1;display:flex;flex-direction:column;padding:3% 6.5% 58px}
.cs-head{display:flex;align-items:center;gap:.9vw;margin-bottom:1.1vw}
.cs-no{color:var(--accent);font-size:.78vw;font-weight:800;letter-spacing:.14em}
.cs-sec{color:var(--muted);font-size:.78vw;font-weight:500}
.cs-hair{flex:1;height:1px;background:var(--hair)}
.cs-title{color:var(--ink);font-size:2.1vw;font-weight:800;letter-spacing:-.025em;line-height:1.28;margin-bottom:.7vw}
.cs-title .hl{color:var(--accent)}
.lede{color:var(--body);font-size:.92vw;line-height:1.75;margin-bottom:1vw}
.lede b{color:var(--ink);font-weight:700}
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
.vs-panel.ours{border:1px solid #b9d2f8;background:linear-gradient(180deg,#ffffff 0%,#f7faff 100%);box-shadow:0 6px 24px rgba(37,99,235,.09)}
.vs-h{display:flex;align-items:center;gap:.5vw;font-size:.95vw;font-weight:800;color:#64748b;justify-content:center}
.vs-h .material-symbols-outlined{font-size:1.1vw}
.vs-panel.ours .vs-h{color:var(--accent)}

/* ── 순환 사이클 (메인 플랫폼 중심 — 가입→참여→수익→관리가 고리로 돈다) ── */
.cyc{position:relative;flex:1;min-height:13.5vw}
.cyc svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible}
.cyc-seg{fill:none;stroke:#aac3ee;stroke-width:1.3;stroke-linecap:round}
/* 빛나는 점 — CSS motion path로 각 호를 따라 이동 (SMIL은 이 환경에서 타임라인이 멈춰 있어 사용 불가) */
.cyc-dot{fill:#3b82f6;offset-rotate:0deg;animation:travel 3s linear infinite}
@keyframes travel{0%{offset-distance:0%;opacity:0}12%{opacity:1}88%{opacity:1}100%{offset-distance:100%;opacity:0}}
.cnode{position:absolute;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:.24vw;text-align:center;z-index:1}
.cnode-ic{position:relative;width:2.6vw;height:2.6vw;border-radius:50%;background:linear-gradient(180deg,#ffffff,#f6f9ff);border:1px solid #e3ebf7;color:var(--accent);display:flex;align-items:center;justify-content:center;box-shadow:0 2px 5px rgba(11,21,38,.05),0 10px 22px rgba(37,99,235,.10)}
.cnode-ic .material-symbols-outlined{font-size:1.2vw}
.cnode-no{position:absolute;top:-.35vw;right:-.42vw;width:1.1vw;height:1.1vw;border-radius:50%;background:linear-gradient(135deg,#1d4ed8,#3b82f6);border:2px solid #fff;color:#fff;font-size:.56vw;font-weight:800;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(29,78,216,.35)}
.cnode b{font-size:.77vw;color:var(--ink);white-space:nowrap;letter-spacing:-.01em}
.cnode small{font-size:.62vw;color:var(--muted);white-space:nowrap}
/* 살아있는 허브 — 유리질감 구체 + 은은한 펄스 */
.ihub-wrap{position:absolute;left:50%;top:44%;transform:translate(-50%,-50%);width:5.8vw;height:5.8vw;z-index:1}
.ihub-c{position:absolute;inset:0;border-radius:50%;background:
  radial-gradient(circle at 30% 24%,rgba(255,255,255,.38) 0%,transparent 42%),
  linear-gradient(135deg,#1e40af 0%,#2563eb 55%,#3b82f6 100%);
  border:1px solid rgba(255,255,255,.22);color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.12vw;box-shadow:0 12px 32px rgba(30,64,175,.35),inset 0 1px 0 rgba(255,255,255,.28);z-index:1;text-align:center}
.ihub-c .material-symbols-outlined{font-size:1.4vw}
.ihub-c b{font-size:.74vw;line-height:1.3;letter-spacing:-.01em}
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
.pnode-ic{width:3.2vw;height:3.2vw;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;box-shadow:0 5px 16px rgba(11,21,38,.16)}
.pnode-ic .material-symbols-outlined{font-size:1.5vw}
.pnode b{font-size:.82vw;color:var(--ink)}

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

/* ── 2026 연간 트랙 (상반기 진행 → 하반기 예정 + 현재 마커) ── */
.yeartrack{position:relative;height:2.3vw;display:flex}
.yt-h1{width:53%;background:linear-gradient(90deg,#1d4ed8,#3b82f6);border-radius:999px 0 0 999px;color:#fff;display:flex;align-items:center;justify-content:center;gap:.5vw;font-size:.8vw;font-weight:700;position:relative;overflow:hidden}
.yt-h1 .material-symbols-outlined{font-size:.95vw}
.yt-h1:after{content:"";position:absolute;inset:0;background:linear-gradient(100deg,transparent 30%,rgba(255,255,255,.35) 50%,transparent 70%);transform:translateX(-100%);animation:sheen 2.6s ease-in-out infinite}
@keyframes sheen{to{transform:translateX(100%)}}
.yt-h2{flex:1;border:1.5px dashed #b9c6dd;border-left:none;border-radius:0 999px 999px 0;background:var(--chip);color:var(--muted);display:flex;align-items:center;justify-content:center;font-size:.8vw;font-weight:700}
.yt-now{position:absolute;top:-1.25vw;transform:translateX(-50%);color:var(--accent);font-size:.66vw;font-weight:800;display:flex;flex-direction:column;align-items:center;line-height:1.2;z-index:1}
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
.glane-who{width:12.5vw;flex-shrink:0;display:flex;align-items:center;gap:.5vw;color:var(--ink);font-size:.8vw;font-weight:700}
.glane-who .material-symbols-outlined{font-size:1.05vw;color:var(--accent)}
.glane-steps{flex:1;display:flex;align-items:center;gap:.45vw;flex-wrap:wrap}
.gchip{background:var(--chip);border-radius:8px;padding:.32vw .7vw;color:var(--ink);font-size:.74vw;font-weight:600;white-space:nowrap}
.gchip.on{background:var(--tint);border:1px solid var(--tint-line);color:#1d4ed8}
.garr{color:#c3ccda;font-size:.85vw;flex-shrink:0}

/* ── 구축률 누적 바 (연차별 목표 세그먼트) ── */
.pbar{display:flex;height:1.5vw;border-radius:8px;overflow:hidden}
.pseg{display:flex;align-items:center;justify-content:center;color:#fff;font-size:.68vw;font-weight:700;white-space:nowrap}
.pseg.y1{background:#93c5fd}
.pseg.y2{background:#60a5fa}
.pseg.y3{background:var(--accent)}
.pseg.y4{background:#e2e8f0;color:#64748b}
.pbar-cap{position:relative;height:1.2vw;margin-top:.3vw}
.pbar-mark{position:absolute;transform:translateX(-50%);color:var(--accent);font-size:.7vw;font-weight:800;white-space:nowrap}
.pbar-mark:before{content:"▲";display:block;text-align:center;font-size:.55vw;line-height:1}

/* ── 근거 캡션 ── */
.srcline{color:var(--muted);font-size:.68vw;line-height:1.6}

/* ── 이미지 플레이스홀더 (실제 화면 캡처 자리 — 가장 중요) ── */
.imgslot{border:2px dashed #c7d2e3;border-radius:14px;background:var(--chip);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:1.1vw;gap:.35vw;min-height:9vw}
.imgslot.tall{min-height:12vw}
.imgslot .material-symbols-outlined{font-size:2vw;color:#94a3b8}
.imgslot-t{color:var(--muted);font-size:.78vw;font-weight:700}
.imgslot-d{color:var(--muted);font-size:.71vw;line-height:1.65}

/* ── 마침 문장 ── */
.coda{color:var(--body);font-size:.92vw;line-height:1.8;border-top:1px solid var(--hair);padding-top:.9vw;text-align:center}
.coda b{color:var(--accent);font-weight:700}

/* ── 마무리(13p) 다크 ── */
.close-title{color:#fff;font-size:2.9vw;font-weight:900;letter-spacing:-.02em;line-height:1.25;margin-bottom:1.1vw;position:relative;z-index:1}
.close-title .hl{color:var(--accent-soft)}
.close-sub{color:rgba(191,209,238,.85);font-size:1.02vw;font-weight:300;line-height:1.85;margin-bottom:2.4vw;position:relative;z-index:1}
.close-sub b{color:#fff;font-weight:600}
.close-flow{display:flex;align-items:center;gap:.8vw;margin-bottom:3vw;position:relative;z-index:1;flex-wrap:wrap}
.close-node{display:inline-flex;align-items:center;gap:.5vw;border:1px solid rgba(127,168,232,.35);border-radius:999px;padding:.38vw 1.1vw;color:rgba(191,209,238,.92);font-size:.82vw;font-weight:600}
.close-node .material-symbols-outlined{font-size:1vw;color:var(--accent-soft)}
.close-node.on{background:rgba(37,99,235,.28);border-color:rgba(127,168,232,.6);color:#fff}
.close-thanks{color:rgba(148,168,200,.75);font-size:.9vw;position:relative;z-index:1;display:flex;align-items:center;gap:1vw}
.close-thanks img{height:1.3vw;filter:brightness(0) invert(1);opacity:.85}

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
.slide.active .cover-title,.slide.active .close-title{animation:rise .65s cubic-bezier(.2,.6,.2,1) .12s both}
.slide.active .cover-sub,.slide.active .close-sub{animation:rise .65s cubic-bezier(.2,.6,.2,1) .24s both}
.slide.active .cover-steps,.slide.active .close-flow{animation:rise .65s cubic-bezier(.2,.6,.2,1) .34s both}
.slide.active .cover-meta,.slide.active .close-thanks{animation:rise .65s cubic-bezier(.2,.6,.2,1) .44s both}
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
          <span className="cs-no">{no}p</span>
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

function ImgSlot({ t, d, tall }: { t: string; d: string; tall?: boolean }) {
  return (
    <div className={`imgslot${tall ? ' tall' : ''}`}>
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
      <span>2026. 07. 29</span>
    </div>
  </div>,

  /* ── 2page : 사업 추진 경과 (1~2차년도) ── */
  /*    연차별 단계·3차년도 할 일·구축률: [울산미포에자자] 3차년도 사업계획서(2026.03) 재구성 */
  <ContentSlide key="p2" no="02" sec="사업 추진 경과 (1~2차년도)" title={<>지금은 <span className="hl">3차년도</span> — 계획대로 진행 중입니다</>}>
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
    no="03"
    sec="3차년도 개발 현황 요약"
    title={<>상반기 <span className="hl">4</span>개는 구축을 마치고 <span className="hl">QA · 안정화</span> 중입니다</>}
    lede={<>지금 보여드리는 것은 <b>현재까지의 구축 결과물</b>입니다.</>}
  >
    <div style={{ paddingTop: '1.3vw' }}>
      <div className="yeartrack">
        <div className="yt-h1"><span className="material-symbols-outlined">task_alt</span>상반기 — 4개 구축 완료 · QA 중</div>
        <div className="yt-h2">하반기 — 3개 개발 계획 (12p 로드맵)</div>
        <span className="yt-now" style={{ left: '58%' }}>지금 · 7월</span>
      </div>
    </div>
    <div className="split43">
      <div className="press">
        <Tile ic="support_agent" k="컨설팅" bar="done" st={<span className="tag blue live"><i />QA · 안정화 중</span>} />
        <Tile ic="monitoring" k="모니터링" bar="done" st={<span className="tag blue live"><i />QA · 안정화 중</span>} />
        <Tile ic="swap_horiz" k="전력거래" bar="done" st={<span className="tag blue live"><i />QA · 안정화 중</span>} />
        <Tile ic="view_in_ar" k="DT(디지털트윈)" bar="done" st={<span className="tag blue live"><i />QA · 안정화 중</span>} />
      </div>
      <div className="press p3">
        <Tile soon ic="co2" k="탄소배출관리" bar="todo" st={<span className="tag gray"><i />하반기 착수</span>} />
        <Tile soon ic="storefront" k="e데이터마켓" bar="todo" st={<span className="tag gray"><i />하반기 착수</span>} />
        <Tile soon ic="hub" k="VPP" bar="todo" st={<span className="tag gray"><i />하반기 착수</span>} />
      </div>
    </div>
  </ContentSlide>,

  /* ── 4page : RMS가 추구하는 플랫폼 방향성 ── */
  <ContentSlide key="p4" no="04" sec="RMS가 추구하는 플랫폼 방향성" title={<>납품하고 끝나는 시스템이 <span className="hl">아닙니다</span></>}>
    <div className="vs">
      <div className="vs-panel">
        <div className="vs-h"><span className="material-symbols-outlined">inventory_2</span>통상적인 지자체 · 공공 플랫폼</div>
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
        <div className="cyc">
          {/* 순환 화살표 — 노드 사이를 호 5개가 잇고, 대시가 화살촉 방향으로 흐른다.
              viewBox 126×100 = 컨테이너 실측 비율(≈1.26)로, 화살촉 왜곡 없이 % 좌표와 일치 */}
          <svg viewBox="0 0 126 100" preserveAspectRatio="none" aria-hidden>
            <defs>
              {/* 가는 셰브런 화살촉 — 채운 삼각형보다 절제된 인상 */}
              <marker id="cycArr" viewBox="0 0 10 10" refX="7.5" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 1.5 1 L 8 5 L 1.5 9" fill="none" stroke="#aac3ee" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </marker>
              <filter id="cycGlow" x="-200%" y="-200%" width="500%" height="500%">
                <feGaussianBlur stdDeviation="1" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            {/* 깊이감용 안쪽 헤어라인 링 */}
            <ellipse cx="63" cy="44" rx="27" ry="19" fill="none" stroke="#e9f0fa" strokeWidth="1" />
            <path id="cycs1" className="cyc-seg" markerEnd="url(#cycArr)" d="M 73.8 10.9 A 47.9 34 0 0 1 104.1 26.5" />
            <path id="cycs2" className="cyc-seg" markerEnd="url(#cycArr)" d="M 110.7 41.0 A 47.9 34 0 0 1 99.2 66.3" />
            <path id="cycs3" className="cyc-seg" markerEnd="url(#cycArr)" d="M 81.7 75.3 A 47.9 34 0 0 1 44.3 75.3" />
            <path id="cycs4" className="cyc-seg" markerEnd="url(#cycArr)" d="M 26.9 66.3 A 47.9 34 0 0 1 15.3 41.0" />
            <path id="cycs5" className="cyc-seg" markerEnd="url(#cycArr)" d="M 21.9 26.5 A 47.9 34 0 0 1 52.2 10.9" />
            {/* 빛나는 점이 각 곡선을 미끄러지듯 이동 — 시차를 두고 물결처럼 */}
            {[
              "M 73.8 10.9 A 47.9 34 0 0 1 104.1 26.5",
              "M 110.7 41.0 A 47.9 34 0 0 1 99.2 66.3",
              "M 81.7 75.3 A 47.9 34 0 0 1 44.3 75.3",
              "M 26.9 66.3 A 47.9 34 0 0 1 15.3 41.0",
              "M 21.9 26.5 A 47.9 34 0 0 1 52.2 10.9",
            ].map((d, i) => (
              <circle
                key={i}
                r="1.1"
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
            { x: '50%', y: '10%', no: '1', ic: 'location_on', t: '울산 에자자 사업', s: '여기서 시작' },
            { x: '86%', y: '33%', no: '2', ic: 'person_add', t: '신규 가입', s: '참여 기업이 아니어도' },
            { x: '72%', y: '72%', no: '3', ic: 'touch_app', t: '참여 · 이용', s: '필요한 기능 사용' },
            { x: '28%', y: '72%', no: '4', ic: 'payments', t: '수익 창출', s: '플랫폼 위에서 거래' },
            { x: '14%', y: '33%', no: '5', ic: 'settings_suggest', t: '관리 · 운영', s: '종료 후에도 업데이트' },
          ].map((n) => (
            <div className="cnode" key={n.no} style={{ left: n.x, top: n.y }}>
              <span className="cnode-ic">
                <span className="material-symbols-outlined">{n.ic}</span>
                <span className="cnode-no">{n.no}</span>
              </span>
              <b>{n.t}</b>
              <small>{n.s}</small>
            </div>
          ))}
        </div>
      </div>
    </div>
    <p className="coda">목표는 — <b>지속가능한 플랫폼</b>입니다</p>
  </ContentSlide>,

  /* ── 5page : 사용자 관점에서의 설계 ── */
  <ContentSlide
    key="p5"
    no="05"
    sec="사용자 관점에서의 설계"
    title={<>기업이 궁금한 건 결국 <span className="hl">세 가지</span>입니다</>}
    lede={<>플랫폼 기능은 <b>실제 수요기업의 관심사</b>에서 출발했습니다.</>}
  >
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
        <div className="q-t">태양광을 설치하면<br />실제 효과가 얼마나 되나?</div>
      </div>
    </div>
    <p className="coda">핵심 기능 전부가 — <b>이 세 질문에 답하기 위한 서비스</b>입니다</p>
  </ContentSlide>,

  /* ── 6page : 플랫폼 구조 — 5개 페르소나 ── */
  <ContentSlide
    key="p6"
    no="06"
    sec="플랫폼 구조 — 5개 페르소나"
    title={<>하나의 플랫폼, <span className="hl">다섯 개의 화면</span></>}
    lede={<>페르소나별로 UI/UX와 제공 기능이 다르게 설계 — <b>본인 역할에 필요한 기능만 간결하게</b> 사용합니다.</>}
  >
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
      <span className="tag gray"><i />현장에서 5개 계정 로그인은 제약 — 페르소나별 화면 · 기능은 시연 영상으로</span>
      <span className="tag blue"><i />현장 시연 — 관리자 계정 기준</span>
    </div>
  </ContentSlide>,

  /* ── 7page : 핵심 기능 ① 컨설팅 ── */
  <ContentSlide
    key="p7"
    no="07"
    sec="핵심 기능 ① 컨설팅"
    title={<>신청하면 매칭 — 진입장벽을 <span className="hl">크게 낮췄습니다</span></>}
  >
    <div className="mflow">
      <MNode tone="gray" ic="psychology_alt" t="기존" s="어디에 문의해야 할지조차 알기 어려움" />
      <Arr />
      <MNode ic="edit_note" t="플랫폼 내 컨설팅 신청" s="수요기업" />
      <Arr />
      <MNode tone="fill" ic="handshake" t="컨설턴트 매칭" s="컨설턴트가 플랫폼에 직접 연계" />
      <Arr />
      <MNode ic="forum" t="톡 기능" s="일정 조율 · 질의를 플랫폼 안에서 처리" />
    </div>
    <ImgSlot
      tall
      t="제안: 컨설팅 신청 → 매칭 → 톡 화면 캡처"
      d="수요기업의 컨설팅 신청 화면과, 매칭된 컨설턴트와의 톡(일정 조율 · 질의) 화면"
    />
  </ContentSlide>,

  /* ── 8page : 핵심 기능 ② 원스톱 통합 처리 ── */
  <ContentSlide
    key="p8"
    no="08"
    sec="핵심 기능 ② 원스톱 통합 처리"
    title={<>반쪽짜리가 아닌, <span className="hl">플랫폼 안에서 전부</span></>}
    lede={<>계약은 플랫폼에서 하고 정산 · 세금계산서는 수기로 — 그런 <b>반쪽짜리 서비스가 아닙니다</b>.</>}
  >
    <div className="feat">
      <div className="fcol">
        <div className="pbox">
          <span className="pbox-tag">거래에 수반되는 업무 전체 — 하나의 플랫폼 안에서</span>
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

  /* ── 9page : 핵심 기능 ③ 모니터링 + O&M 연계 ── */
  <ContentSlide
    key="p9"
    no="09"
    sec="핵심 기능 ③ 모니터링 + O&M 연계"
    title={<>감지에서 조치 · 결과까지, <span className="hl">하나의 흐름</span></>}
    lede={<>단순 발전량 모니터링은 시중에 이미 많습니다 — 그것만으로는 <b>반쪽짜리</b>라고 판단했습니다.</>}
  >
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
          <MNode ic="handyman" t="A/S · O&M 접수" s="플랫폼 내에서 바로 연계" />
        </div>
        <div className="mflow">
          <MNode ic="task_alt" t="조치" />
          <Arr />
          <MNode tone="fill" ic="sync" t="처리 현황 실시간 반영" s="업데이트까지 완결" />
        </div>
        <div className="mflow">
          <span className="tag blue"><i />실효적인 모니터링 시스템</span>
        </div>
      </div>
    </div>
  </ContentSlide>,

  /* ── 10page : 핵심 기능 ④ 전력거래 ── */
  <ContentSlide
    key="p10"
    no="10"
    sec="핵심 기능 ④ 전력거래"
    title={<>RE100 이행에 필요한 전력, <span className="hl">조달을 서비스로</span></>}
    lede={<>수요기업의 RE100 이행에는 <b>재생에너지 전력</b>이 필요하고, 조달 과정이 원활해야 합니다.</>}
  >
    <div className="feat">
      <div className="fcol">
        <div className="mflow">
          <MNode ic="solar_power" t="재생에너지 전력" s="발전사업자" />
          <Arr />
          <MNode tone="fill" ic="swap_horiz" t="전력거래" s="확보 과정을 서비스로 제공" />
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

  /* ── 11page : 핵심 기능 ⑤ DT(디지털 트윈) ── */
  <ContentSlide
    key="p11"
    no="11"
    sec="핵심 기능 ⑤ DT (디지털 트윈)"
    title={<>설치 전에, 효과를 <span className="hl">눈으로 확인</span></>}
    lede={<>신규 가입 기업에 가장 효과적인 것 — 태양광 설치 효과를 <b>직접 눈으로 확인</b>하는 것입니다.</>}
  >
    <div className="mflow">
      <MNode ic="apartment" t="설치 전" s="우리 사업장" />
      <Arr />
      <MNode tone="fill" ic="view_in_ar" t="DT 시뮬레이션" />
      <Arr />
      <MNode ic="insights" t="예상 효과를 시각적으로" />
      <span className="tag blue" style={{ marginLeft: '1vw' }}><i />발표 후 실제 플랫폼 접속 — 직접 시연</span>
    </div>
    <ImgSlot
      tall
      t="제안: DT 화면 캡처 (대형)"
      d="태양광 설치 전 예상 효과를 3D로 보여주는 디지털 트윈 화면 — 이 덱에서 가장 큰 이미지"
    />
  </ContentSlide>,

  /* ── 12page : 하반기 개발 로드맵 ── */
  <ContentSlide
    key="p12"
    no="12"
    sec="하반기 개발 로드맵"
    title={<>딥링크로 연동되는 <span className="hl">세 개의 신규 서비스</span></>}
    lede={<>세 기능은 각각 범위가 매우 방대해 — 기존 플랫폼 내 탑재가 아닌 <b>신규 플랫폼 연동</b>으로 서비스합니다.</>}
  >
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
      <MNode ic="open_in_new" t="신규 플랫폼" />
    </div>
    <p className="coda">사용자는 <b>하나의 플랫폼에서 자연스럽게 이동</b> — 서비스 연속성에는 영향 없음</p>
  </ContentSlide>,

  /* ── 13page : 마무리 — 지속가능하고 확장 가능한 플랫폼 ── */
  <div className="dark-stage" key="p13">
    <p className="cover-eyebrow">Sustainable &amp; Expandable</p>
    <h1 className="close-title">울산은 <span className="hl">하나의 적용 범위</span>입니다</h1>
    <p className="close-sub">
      울산 에자자 사업에 국한된 시스템이 아니라 — 동일한 플랫폼 기반 위에서<br />
      <b>타 지역과 신규 가입자로 확장 가능한, 지속가능하고 실효성 있는 서비스</b>를 목표로 구축하고 있습니다
    </p>
    <div className="close-flow">
      <span className="close-node on"><span className="material-symbols-outlined">location_on</span>울산 에자자 — 첫 적용</span>
      <span className="cover-step-arr">→</span>
      <span className="close-node"><span className="material-symbols-outlined">map</span>타 지역</span>
      <span className="cover-step-arr">→</span>
      <span className="close-node"><span className="material-symbols-outlined">person_add</span>신규 가입자</span>
    </div>
    <div className="close-flow">
      <span className="close-node"><span className="material-symbols-outlined">play_circle</span>이어서 — 시연 영상</span>
      <span className="cover-step-arr">→</span>
      <span className="close-node"><span className="material-symbols-outlined">computer</span>실제 플랫폼 시연</span>
    </div>
    <div className="close-thanks">
      <img src="/images/logo.png" alt="RMS GROUP" />
      <span>감사합니다 · rmsgroup.co.kr</span>
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
