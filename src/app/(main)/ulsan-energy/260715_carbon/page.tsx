'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// 탄소거래 개념 정리 — 2026.07.15  (에디토리얼 리디자인)
// 원본 자료: RMS.work/★PPT/260715_탄소/탄소거래_개념정리.md
// 디자인 방향: docs/style-reference.md — 프로세스맵 덱의 "구조 문법"은 유지하되,
//   스킨은 에디토리얼 미니멀리즘으로 재해석:
//   · 주장형 한 줄 제목 + 짧은 리드문 (박스 없는 본문형 lede)
//   · 헤어라인 구분선 · 큰 여백 · 절제된 색 (잉크 네이비 + 블루 액센트 1색)
//   · KPI는 박스 없이 하이라인 사이 큰 숫자, 파이프라인은 점-라인 스텝 플로우
//   · 표지·마무리 = 딥네이비 에디토리얼 (16:9 Main.png 완성 시 표지 교체 가능)
// ─────────────────────────────────────────────────────────────────────────────

const CSS = `
:root{--accent:#2563eb;--accent-soft:#7fa8e8;--ink:#0b1526;--body:#3e4c5e;--muted:#8a94a6;--hair:#e6eaf2;--paper:#fbfcfe;--card:#ffffff;--chip:#f5f7fb;--amber:#b45309;--green:#047857;--navy1:#0a162e;--navy2:#12264d}
.presentation{position:fixed;inset:0;z-index:50;background:#081120;overflow:hidden;font-family:Pretendard,'Noto Sans KR',-apple-system,BlinkMacSystemFont,sans-serif;-webkit-font-smoothing:antialiased}
.presentation *{box-sizing:border-box;margin:0;padding:0}
.slide{opacity:0;pointer-events:none;flex-direction:column;transition:opacity .5s,transform .5s;display:flex;position:absolute;inset:0;transform:translate(48px)}
.slide>*{flex:1}
.slide.active{opacity:1;pointer-events:all;transform:translate(0)}
.slide.prev{opacity:0;transform:translate(-48px)}

/* ── 고정 배경 레이어 — 슬라이드가 넘어가도 블롭은 끊기지 않고 이어진다 ── */
.bg-stage{position:absolute;inset:0;background:radial-gradient(130% 150% at 82% -30%,var(--navy2) 0%,var(--navy1) 55%,#081120 100%);overflow:hidden;pointer-events:none}
/* ── 표지 · 마무리 — 배경은 투명(뒤의 고정 레이어가 비침) ── */
.dark-stage{background:transparent;position:relative;overflow:hidden;display:flex;flex-direction:column;justify-content:center;padding:0 7.5%}
.blob{position:absolute;border-radius:50%;pointer-events:none}
/* 질감: 좌상단 하이라이트(빛) + 우하단 음영(그늘) + 본체 그라데이션 → 구체 볼륨감 */
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
/* 필름 그레인 — 미세 노이즈로 그라데이션의 밴딩을 지우고 질감을 더함 */
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

/* ── KPI (하이라인 사이 큰 숫자) ── */
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

/* ── 피처 카드 ── */
.cards-2{display:grid;grid-template-columns:1fr 1fr;gap:1vw}
.cards-3{display:grid;grid-template-columns:repeat(3,1fr);gap:1vw}
.fcard{background:var(--card);border:1px solid var(--hair);border-radius:14px;padding:1.05vw 1.25vw;box-shadow:0 1px 2px rgba(11,21,38,.03)}
.fcard-title{color:var(--ink);font-size:.98vw;font-weight:700;display:flex;align-items:center;gap:.6vw;margin-bottom:.55vw;flex-wrap:wrap}
.fcard-desc{color:var(--body);font-size:.8vw;line-height:1.78}
.fcard-desc b{color:var(--ink)}
.pcode{font-size:1.35vw;font-weight:900;color:var(--accent);letter-spacing:-.01em;line-height:1}
.fcard-ic{width:2.1vw;height:2.1vw;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;background:var(--tint);color:var(--accent);flex-shrink:0}
.fcard-ic .material-symbols-outlined{font-size:1.1vw}
.spec{display:flex;flex-direction:column;gap:.45vw;margin-top:.65vw}
.spec-row{display:flex;gap:.75vw;font-size:.8vw;line-height:1.55}
.spec-k{width:2.4vw;flex-shrink:0;color:var(--muted);font-weight:700}
.spec-v{color:var(--body)}
.spec-v b{color:var(--ink)}
.tag{display:inline-flex;align-items:center;gap:.38vw;border:1px solid var(--hair);border-radius:999px;padding:.15vw .7vw;font-size:.66vw;font-weight:600;color:var(--muted);background:#fff}
.tag i{width:.38vw;height:.38vw;border-radius:50%;display:inline-block}
.tag.blue{color:#1d4ed8}.tag.blue i{background:#2563eb}
.tag.green{color:var(--green)}.tag.green i{background:#10b981}
.tag.amber{color:var(--amber)}.tag.amber i{background:#f59e0b}
.tag.gray i{background:#94a3b8}
.chip-row{display:flex;flex-wrap:wrap;gap:.4vw;margin-top:.6vw}

/* ── 스윔레인 ── */
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

/* ── 할당 비율 바 ── */
.alloc{background:var(--card);border:1px solid var(--hair);border-radius:14px;padding:1.05vw 1.4vw}
.alloc-row{display:flex;align-items:center;gap:1vw;margin-bottom:.6vw}
.alloc-row:last-of-type{margin-bottom:0}
.alloc-label{color:var(--ink);text-align:right;min-width:8.6vw;font-size:.79vw;font-weight:600}
.alloc-track{flex:1;height:1.25vw;background:#eef1f7;border-radius:999px;display:flex;overflow:hidden}
.alloc-free{background:var(--accent);display:flex;align-items:center;justify-content:center;color:#fff;font-size:.66vw;font-weight:600}
.alloc-paid{background:#f59e0b;display:flex;align-items:center;justify-content:center;color:#fff;font-size:.66vw;font-weight:600;min-width:4vw}
.alloc-note{color:var(--muted);font-size:.71vw;line-height:1.65;margin-top:.85vw}

/* ── 압박 타일 — 아이콘 + 큰 키워드 (글 최소화) ── */
.press{display:grid;grid-template-columns:repeat(4,1fr);gap:.8vw}
.press-card{background:#fff;border:1px solid var(--hair);border-radius:14px;padding:.8vw .8vw;text-align:center}
.press-ic{width:2.4vw;height:2.4vw;border-radius:50%;margin:0 auto .4vw;display:flex;align-items:center;justify-content:center;background:var(--tint);color:var(--accent)}
.press-ic .material-symbols-outlined{font-size:1.25vw}
.press-card.warn .press-ic{background:#fffbeb;color:#b45309}
.press-k{color:var(--ink);font-size:.98vw;font-weight:800;letter-spacing:-.01em}
.press-card.warn .press-k{color:#b45309}
.press-d{color:var(--muted);font-size:.73vw;line-height:1.55;margin-top:.35vw}

/* ── 제도 비교 그림 (ETS: 공장+CO₂ 티켓+CAP 아치 / TAX: 공장→동전→정부) ── */
.duo{display:grid;grid-template-columns:1fr 1fr;gap:1vw}
.duo-panel{position:relative;background:var(--card);border:1px solid var(--hair);border-radius:14px;padding:1vw 1.2vw 1.2vw;text-align:center;display:flex;flex-direction:column;overflow:hidden}
.duo-panel.pick{border-color:#93c5fd;box-shadow:0 4px 18px rgba(37,99,235,.08)}
.duo-capword{color:var(--accent);font-size:.72vw;font-weight:800;letter-spacing:.1em}
.duo-cap{width:82%;height:2.2vw;margin:0 auto}
.duo-scene{display:flex;align-items:flex-end;justify-content:center;gap:2.4vw;flex:1;padding:.5vw 0 .9vw}
.duo-fac{display:flex;flex-direction:column;align-items:center;gap:.45vw}
.tik-grid{display:grid;grid-template-columns:repeat(3,auto);gap:.25vw;justify-content:center}
.tik{background:#dbeafe;color:#1d4ed8;border:1px solid #bfdbfe;border-radius:4px;font-size:.58vw;font-weight:800;padding:.08vw .34vw}
.coin{width:1.1vw;height:1.1vw;border-radius:50%;background:#fde68a;color:#92400e;font-size:.62vw;font-weight:800;display:flex;align-items:center;justify-content:center;border:1px solid #fcd34d}
.duo-fic{font-size:3vw!important;color:#475569;line-height:1}
.duo-sub{color:var(--muted);font-size:.68vw}
.duo-arrow{color:#cbd5e1;font-size:1.6vw!important;align-self:center;padding-bottom:1.4vw}
.cloud-row{display:flex;gap:.3vw;justify-content:center}
.cloud-row .material-symbols-outlined{font-size:1vw;color:#b6bfcc}
.formula{display:flex;align-items:center;justify-content:center;gap:.4vw;color:var(--muted);font-size:.72vw;font-weight:600;margin-bottom:.45vw}
.f-pill{display:inline-flex;align-items:center;gap:.25vw;background:var(--chip);border:1px solid var(--hair);border-radius:999px;padding:.14vw .6vw;color:var(--ink)}
.f-pill .material-symbols-outlined{font-size:.85vw;color:#94a3b8}
.f-pill.gold{background:#fef3c7;border-color:#fde68a;color:#92400e}
.pay-mid{display:flex;flex-direction:column;align-items:center;gap:.4vw;padding-bottom:1.8vw;pointer-events:none}
.pay-coins{display:flex;gap:.45vw}
.pay-coins .coin{animation:coinpass 1.8s ease-in-out infinite}
.pay-arrow{color:#cbd5e1;font-size:1.7vw!important}
@keyframes coinpass{0%,100%{opacity:.35;transform:translateY(0)}40%{opacity:1;transform:translateY(-.28vw)}}
.duo-name{color:var(--ink);font-size:.98vw;font-weight:800;display:flex;align-items:center;justify-content:center;gap:.5vw;flex-wrap:wrap}
.duo-desc{color:var(--muted);font-size:.76vw;margin-top:.3vw}
.third{display:flex;align-items:center;gap:1vw;background:#fffbeb;border:1px solid #fde68a;border-radius:14px;padding:.85vw 1.3vw;text-align:left}
.third-ic{width:2.6vw;height:2.6vw;border-radius:50%;background:#fef3c7;color:#b45309;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.third-ic .material-symbols-outlined{font-size:1.3vw}
.third-t{color:var(--ink);font-size:.9vw;font-weight:800}
.third-d{color:var(--muted);font-size:.76vw;margin-top:.15vw;line-height:1.5}

/* ── 법령 문서 패널 (법률 화면처럼) ── */
.lawdoc{background:#fff;border:1px solid var(--hair);border-radius:14px;padding:1.05vw 1.3vw;display:flex;flex-direction:column}
.lawdoc-head{display:flex;align-items:center;gap:.5vw;border-bottom:1px solid var(--hair);padding-bottom:.55vw;margin-bottom:.65vw}
.lawdoc-head .material-symbols-outlined{color:var(--accent);font-size:1vw}
.lawdoc-title{color:var(--ink);font-size:.78vw;font-weight:700;flex:1}
.lawdoc-link{color:var(--accent);font-size:.66vw;font-weight:600;text-decoration:underline;text-underline-offset:2px;white-space:nowrap}
.lawdoc-body{color:var(--body);font-size:.73vw;line-height:1.8}
.lawdoc-art{color:var(--ink);font-weight:800}
.lawdoc-body p+p{margin-top:.45vw}

/* ── 좌 콘텐츠 + 우 대형 라이브 화면 분할 ── */
.grid-side{display:grid;grid-template-columns:1.05fr 1fr;gap:1vw;align-items:stretch;flex:1}
.side-col{display:flex;flex-direction:column;gap:1vw}
.grid-v{display:flex;flex-direction:column;gap:.6vw}

/* ── 월별 경매 일정·수량 미니 차트 ── */
.msched{display:flex;align-items:flex-end;gap:.4vw;height:6.5vw;padding:.2vw .2vw 0}
.ms-col{flex:1;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:.15vw}
.ms-val{color:var(--muted);font-size:.58vw;font-weight:700;white-space:nowrap}
.ms-bar{width:100%;border-radius:4px 4px 0 0;background:var(--accent)}
.ms-bar.v26{background:#8b5cf6}
.ms-m{color:var(--muted);font-size:.58vw;white-space:nowrap}
.ms-head{display:flex;align-items:center;gap:.6vw;flex-wrap:wrap}
.ms-total{margin-left:auto;color:var(--ink);font-size:.85vw;font-weight:800}

/* ── 미니 월력 (일자 그리드 + 경매일 하이라이트) ── */
.mcal-grid{display:grid;grid-template-columns:repeat(6,1fr);gap:.7vw}
.mcal{background:#fff;border:1px solid var(--hair);border-radius:12px;padding:.55vw .6vw}
.mcal-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:.28vw}
.mcal-head b{color:var(--ink);font-size:.72vw}
.mcal-days{display:grid;grid-template-columns:repeat(7,1fr);gap:.05vw;text-align:center}
.mcal-wd{color:#b6bfcc;font-size:.48vw;font-weight:700;padding-bottom:.08vw}
.mcal-d{color:var(--body);font-size:.54vw;line-height:1.6;border-radius:50%}
.mcal-d.hit{background:var(--accent);color:#fff;font-weight:800}
.mcal-d.hit.v26{background:#8b5cf6}

/* ── 경매 캘린더 타일 ── */
.cal{display:grid;grid-template-columns:repeat(6,1fr);gap:.7vw}
.cal-tile{background:#fff;border:1px solid var(--hair);border-radius:12px;padding:.65vw .5vw;text-align:center}
.cal-mon{color:var(--muted);font-size:.66vw;font-weight:700}
.cal-day{color:var(--ink);font-size:1.2vw;font-weight:800;line-height:1.2;margin:.12vw 0}
.cal-day small{color:var(--muted);font-size:.6vw;font-weight:600}
.cal-vol{display:inline-block;border-radius:999px;padding:.08vw .5vw;font-size:.62vw;font-weight:700;margin-top:.12vw}
.cal-vol.k25{background:#dbeafe;color:#1d4ed8}
.cal-vol.k26{background:#ede9fe;color:#6d28d9}

/* ── 낙찰 사다리 (공고 예시 시각화) ── */
.bid-row{display:flex;align-items:center;gap:.8vw;margin-bottom:.36vw}
.bid-price{width:5.5vw;flex-shrink:0;text-align:right;color:var(--ink);font-size:.76vw;font-weight:700}
.bid-track{flex:1;height:1.1vw;background:var(--hair);border-radius:6px;display:flex;overflow:hidden}
.bid-seg{display:flex;align-items:center;justify-content:center;font-size:.56vw;font-weight:700;color:#fff}
.bid-seg.win{background:var(--accent)}
.bid-seg.lose{background:#cbd5e1;color:#475569}
.bid-seg.void{background:#fee2e2;color:#b91c1c}
.bid-who{width:9.5vw;flex-shrink:0;color:var(--muted);font-size:.7vw}
.bid-floor{display:flex;align-items:center;gap:.6vw;margin:.45vw 0;color:#b45309;font-size:.72vw;font-weight:700}
.bid-floor:before,.bid-floor:after{content:"";flex:1;border-top:2px dashed rgba(245,158,11,.45)}
.bid-final{background:var(--tint);border:1px solid var(--tint-line);border-radius:10px;padding:.55vw 1vw;color:var(--ink);font-size:.85vw;font-weight:700;text-align:center;margin-top:.5vw}

/* ── 비교 표 (규제 vs 자발적) ── */
.cmp{width:100%;background:#fff;border:1px solid var(--hair);border-radius:14px;border-collapse:separate;border-spacing:0;overflow:hidden}
.cmp th{background:var(--chip);color:var(--ink);font-size:.8vw;font-weight:700;text-align:left;padding:.5vw 1vw;border-bottom:1px solid var(--hair)}
.cmp td{color:var(--body);font-size:.75vw;line-height:1.55;padding:.45vw 1vw;border-bottom:1px solid var(--hair);vertical-align:top}
.cmp tr:last-child td{border-bottom:none}
.cmp .k{width:6.5vw;background:var(--chip);color:var(--muted);font-weight:700;white-space:nowrap}
.cmp .good{color:#047857;font-weight:700}
.cmp .bad{color:#b45309;font-weight:700}

/* ── 발표 중 라이브 시연 버튼 — 클릭 시 새 창 풀스크린 (임베드 축소 화면보다 낫다) ── */
.live-dot{width:.45vw;height:.45vw;border-radius:50%;background:#10b981;flex-shrink:0;animation:livepulse 2s ease-in-out infinite}
@keyframes livepulse{0%,100%{opacity:.5}50%{opacity:1}}
.demo-row{display:grid;grid-template-columns:1fr 1fr;gap:1vw}
.demo-btn{display:flex;align-items:center;gap:.85vw;background:var(--card);border:1px solid var(--hair);border-radius:14px;padding:.85vw 1.15vw;text-decoration:none;transition:all .2s}
.demo-btn:hover{border-color:#bfdbfe;box-shadow:0 6px 18px rgba(37,99,235,.10);transform:translateY(-2px)}
.demo-ic{width:2.4vw;height:2.4vw;border-radius:50%;background:var(--tint);color:var(--accent);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.demo-ic .material-symbols-outlined{font-size:1.2vw}
.demo-t{color:var(--ink);font-size:.84vw;font-weight:700;display:flex;align-items:center;gap:.4vw}
.demo-d{color:var(--muted);font-size:.7vw;margin-top:.15vw;line-height:1.5}
.demo-arr{margin-left:auto;color:var(--accent);font-size:1vw;font-weight:700}

/* ── 이미지 플레이스홀더 (실제 화면 캡처 넣을 자리) ── */
.imgslot{border:2px dashed #c7d2e3;border-radius:14px;background:var(--chip);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:1.1vw;gap:.35vw}
.imgslot .material-symbols-outlined{font-size:2vw;color:#94a3b8}
.imgslot-t{color:var(--muted);font-size:.78vw;font-weight:700}
.imgslot-d{color:var(--muted);font-size:.71vw;line-height:1.65}

/* ── 근거 링크 라인 ── */
.srcline{color:var(--muted);font-size:.7vw;margin-top:.7vw;line-height:1.6}
.srcline a{color:var(--accent);text-decoration:underline;text-underline-offset:2px}

/* ── 탄소 비용 누적 막대 (돈이 불어나는 예시) ── */
.cost-row{display:flex;align-items:center;gap:.9vw;margin-bottom:.4vw}
.cost-row:last-of-type{margin-bottom:0}
.cost-label{width:11.5vw;flex-shrink:0;text-align:right;color:var(--ink);font-size:.78vw;font-weight:600}
.cost-track{flex:1;display:flex;height:1.2vw;border-radius:7px;overflow:hidden;background:var(--hair)}
.cost-seg{display:flex;align-items:center;justify-content:center;color:#fff;font-size:.64vw;font-weight:600;white-space:nowrap}
.cost-seg.base{background:#94a3b8}
.cost-seg.buy{background:var(--accent)}
.cost-seg.fine{background:#f59e0b}
.cost-seg.cbam{background:#8b5cf6}
.cost-seg.zero{background:#10b981;border-radius:6px}
.cost-total{width:5.5vw;flex-shrink:0;color:var(--ink);font-size:.92vw;font-weight:800}
.cost-total.warn{color:#b45309}

/* ── 거래 메커니즘 다이어그램 — 레퍼런스 구도 재현 (양쪽 패널 + 중앙 거래소 + 곡선 화살표) ── */
.dia{position:relative;height:15.5vw;background:var(--card);border:1px solid var(--hair);border-radius:14px;overflow:hidden}
.dia-arrows{position:absolute;inset:0;width:100%;height:100%}
.dia-panel{position:absolute;top:9%;bottom:9%;width:22%;background:var(--chip);border-radius:12px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.3vw;text-align:center;padding:.8vw}
.dia-panel.left{left:4%}
.dia-panel.right{right:4%}
.dia-badge{background:#fff;border:1px solid var(--hair);border-radius:999px;padding:.2vw .8vw;font-size:.7vw;font-weight:700;color:var(--ink);display:inline-flex;align-items:center;gap:.35vw;margin-bottom:.3vw}
.dia-badge .material-symbols-outlined{font-size:.9vw}
.dia-panel.left .dia-badge .material-symbols-outlined{color:#10b981}
.dia-panel.right .dia-badge .material-symbols-outlined{color:#f59e0b}
.dia-fac{font-size:2.3vw!important;line-height:1}
.dia-panel.left .dia-fac{color:#047857}
.dia-panel.right .dia-fac{color:#b45309}
.dia-name{color:var(--ink);font-size:.95vw;font-weight:700;margin-top:.25vw}
.dia-sub{color:var(--muted);font-size:.7vw}
.dia-note{color:var(--ink);font-size:.78vw;font-weight:700;margin-top:.45vw}
.dia-note.ok{color:#047857}
.dia-note.bad{color:#b45309}
/* 할당·배출·잔여를 막대 하나로 — 할당 한계선 마커 + 분할 세그먼트 */
.gauge{position:relative;width:100%;margin-top:1.15vw}
.g-caplab{position:absolute;top:-.95vw;transform:translateX(-50%);color:var(--accent);font-size:.62vw;font-weight:800;white-space:nowrap}
.g-track{position:relative;height:1.05vw;background:var(--hair);border-radius:6px;display:flex;overflow:visible}
.g-fill{display:flex;align-items:center;justify-content:center;color:#fff;font-size:.6vw;font-weight:700}
.g-fill:first-child{border-radius:6px 0 0 6px}
.g-fill.emit{background:#94a3b8}
.g-fill.spare{background:#10b981;border-radius:0 6px 6px 0}
.g-fill.over{background:#f59e0b;border-radius:0 6px 6px 0}
.g-cap{position:absolute;top:-.3vw;bottom:-.3vw;width:2px;background:var(--accent);border-radius:2px}
.dia-hub{position:absolute;left:50%;top:50%;transform:translate(-50%,-58%);width:6.2vw;height:6.2vw;border:1.5px dashed #93c5fd;border-radius:50%;display:flex;align-items:center;justify-content:center}
.dia-hub-inner{width:4.4vw;height:4.4vw;background:#fff;border:1px solid var(--tint-line);border-radius:50%;display:flex;align-items:center;justify-content:center;color:var(--accent);box-shadow:0 2px 12px rgba(37,99,235,.10)}
.dia-hub-inner .material-symbols-outlined{font-size:2vw}
.dia-hub-name{position:absolute;left:50%;top:50%;transform:translate(-50%,1.5vw);color:var(--ink);font-size:.82vw;font-weight:700;white-space:nowrap}
.dia-pill{position:absolute;left:50%;transform:translateX(-50%);padding:.24vw 1vw;border-radius:999px;font-size:.73vw;font-weight:700;white-space:nowrap;z-index:1}
.dia-pill.top{top:8%;background:#d1fae5;color:#047857;border:1px solid #a7f3d0}
.dia-pill.bot{bottom:8%;background:#fef3c7;color:#b45309;border:1px solid #fde68a}

/* ── 시장 성장 비교 (2016 → 2024, 뉴스 그래픽 구도: 큰 연도 패널 2개) ── */
.gcmp{display:grid;grid-template-columns:1fr 7vw 1fr auto;column-gap:.9vw;align-items:stretch;padding:.2vw 0}
.gpanel{border:1px solid var(--hair);border-radius:14px;padding:.7vw 1.1vw;text-align:center;background:var(--chip)}
.gpanel.now{background:var(--tint);border-color:#bfdbfe}
.gp-year{color:var(--muted);font-size:1.05vw;font-weight:800;height:1.7vw;display:flex;align-items:center;justify-content:center}
.gpanel.now .gp-year{color:var(--accent)}
.gp-val{height:2.4vw;display:flex;align-items:center;justify-content:center;color:var(--muted);font-size:1.35vw;font-weight:800;letter-spacing:-.01em}
.gpanel.now .gp-val{color:var(--ink);font-size:1.65vw}
.gp-div{border-top:2px dashed #c9d3e2;margin:.18vw 0}
.gmidcol,.gbcol{display:flex;flex-direction:column;text-align:center;padding:.7vw 0}
.gm-sp{height:1.7vw}
.gm-k{height:2.4vw;display:flex;align-items:center;justify-content:center;color:var(--muted);font-size:.88vw;font-weight:700}
.gm-div{height:calc(.36vw + 2px)}
.gc-x{background:var(--accent);color:#fff;padding:0 .85vw 0 1.15vw;height:1.7vw;display:flex;align-items:center;font-size:.88vw;font-weight:800;clip-path:polygon(0 50%,16% 0,100% 0,100% 100%,16% 100%)}
.gb-slot{height:2.4vw;display:flex;align-items:center}
.grow-src{color:var(--muted);font-size:.68vw;margin-top:.6vw}

/* ── 마침 문장 ── */
.coda{color:var(--body);font-size:.95vw;line-height:1.8;border-top:1px solid var(--hair);padding-top:1vw}
.coda b{color:var(--accent);font-weight:700}

/* ── 모션 (전부 CSS — 부유하는 탄소 블롭 + 콘텐츠 스태거 등장) ── */
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
.slide.active .trow:nth-child(6){animation-delay:.35s}
.slide.active .cs-head{animation:rise .5s cubic-bezier(.2,.6,.2,1) both}
.slide.active .cs-title{animation:rise .55s cubic-bezier(.2,.6,.2,1) .08s both}
.slide.active .lede{animation:rise .6s cubic-bezier(.2,.6,.2,1) .16s both}
.slide.active .area>*{animation:rise .6s cubic-bezier(.2,.6,.2,1) both}
.slide.active .area>:nth-child(1){animation-delay:.24s}
.slide.active .area>:nth-child(2){animation-delay:.36s}
.slide.active .area>:nth-child(3){animation-delay:.48s}
.slide.active .thanks-inner{animation:rise .8s cubic-bezier(.2,.6,.2,1) both}
/* ※ prefers-reduced-motion 스위치 제거 — OS에서 "애니메이션 효과"를 꺼둔 PC에서
   모든 모션이 죽는 원인이었음. 발표 덱은 모션이 디자인의 일부라 항상 재생. */

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

/* ─────────────────────────── 슬라이드 ─────────────────────────── */

// target = 각 챕터 첫 슬라이드의 인덱스 (목차에서 클릭 시 이동)
const TOC = [
  { no: '01', t: '탄소거래란 무엇인가', d: '탄소의 정체, 값을 매기는 두 방법, 그리고 거래가 일어나는 이유', target: 2 },
  { no: '02', t: '시장은 어떻게 나뉘는가', d: '규제·자발적 시장 — 배출권(KAU·KCU)과 감축실적(KOC·CER)', target: 5 },
  { no: '03', t: '누가 움직이는가', d: '다섯 참여자가 만드는 하나의 사이클', target: 8 },
  { no: '04', t: '한국은 어떻게 운영하는가', d: '무상으로 주는 몫, 경매로 파는 몫 — 그리고 거래 인프라', target: 9 },
  { no: '05', t: '시장은 지금 어디에 있는가', d: '4차 계획기간 원년, 2026년의 숫자들', target: 13 },
  { no: '06', t: '무엇부터 시작하는가', d: '측정과 MRV, 그리고 CBAM이라는 외부 압력', target: 14 },
]

// goTo = 플레이어의 슬라이드 이동 함수 — 목차 행 클릭 시 해당 챕터로 점프
const buildSlides = (goTo: (i: number) => void): ReactNode[] => [
  /* 1. 표지 — 배경 블롭은 고정 레이어(bg-stage)에 있음 */
  <div className="dark-stage" key="cover">
    <p className="cover-eyebrow">Carbon Market Brief</p>
    <h1 className="cover-title">탄소에 가격을 매기다</h1>
    <p className="cover-sub">
      탄소배출권 거래의 구조, 그리고 한국 K-ETS의 작동 방식 —<br />
      여섯 가지 질문으로 읽는 탄소시장
    </p>
    <div className="cover-meta">
      <img src="/images/logo.png" alt="RMS GROUP" />
      <i />
      <span>배효원 · RMS팀</span>
      <i />
      <span>2026. 07. 15</span>
    </div>
  </div>,

  /* 2. 목차 */
  <div className="toc" key="toc">
    <div className="toc-left">
      <p className="toc-eyebrow">Contents</p>
      <h2 className="toc-title">목차</h2>
      <p className="toc-lead">
        배출에 가격이 붙는 순간,<br />
        감축은 비용이 아니라 전략이 됩니다.<br />
        여섯 가지 질문으로 그 구조를 읽습니다.
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

  /* 3. 01 — 탄소란 무엇이고, 왜 거래하게 됐나 */
  <ContentSlide
    key="s0"
    no="01"
    sec="탄소거래란 무엇인가"
    title="탄소는 어쩌다 사고파는 것이 되었나"
    lede={
      <>탄소 = <b>온실가스 전체</b>(CO₂·CH₄·N₂O → <b>tCO₂e</b> 환산).
      기후위기가 감축을 <span className="hl">의무</span>로 만들었고, 의무가 <span className="hl">시장</span>을 만들었다.</>
    }
  >
    <Flow
      steps={[
        { no: '산업화', name: '화석연료의 200년', sub: 'CO₂ 농도, 산업화 이전 대비 +50%' },
        { no: '기후위기', name: '이상기후의 일상화', sub: '감축이 전 지구의 과제로' },
        { no: '1997', name: '교토의정서', sub: '감축 의무 + 배출량 거래 명문화 (제17조)' },
        { no: '2015', name: '파리협정', sub: '모든 국가가 감축 목표(NDC) 제출' },
        { no: '확산', name: 'ETS의 시대', sub: 'EU 2005 · 한국 2015 — 세계 배출량 ¼에 탄소 가격', final: true },
      ]}
    />

    <Block label="기업을 움직이는 네 개의 압박 — 안 하면 더 비싸진다" cols={4}>
      <div className="press-card">
        <div className="press-ic"><span className="material-symbols-outlined">gavel</span></div>
        <div className="press-k">감축은 법적 의무</div>
        <div className="press-d">배출권거래법 — 할당대상업체는 측정·보고·제출 의무</div>
      </div>
      <div className="press-card warn">
        <div className="press-ic"><span className="material-symbols-outlined">receipt_long</span></div>
        <div className="press-k">과징금 ×3</div>
        <div className="press-d">미이행 시 1톤당 평균 시장가격의 3배 이하 — 상한 없음</div>
      </div>
      <div className="press-card">
        <div className="press-ic"><span className="material-symbols-outlined">public</span></div>
        <div className="press-k">국경조정세 = 관세</div>
        <div className="press-d">EU 2026 시행 — 탄소비용을 국경에서 징수</div>
      </div>
      <div className="press-card warn">
        <div className="press-ic"><span className="material-symbols-outlined">crisis_alert</span></div>
        <div className="press-k">미국 · 중국 확산</div>
        <div className="press-d">미국은 철강 겨냥 — 중국까지 가면 수출국 한국엔 최대 위협</div>
      </div>
    </Block>

    <div>
      <div className="block-label"><b>그래서 한국의 숙제 — 매년 이만큼만 허용된다 (4차 연도별 배출권 총수량)</b></div>
      <div className="cost-row">
        <div className="cost-label">2026년</div>
        <div className="cost-track">
          <div className="cost-seg buy" style={{ width: '100%' }}>4억 7,626만 톤</div>
        </div>
        <div className="cost-total">기준</div>
      </div>
      <div className="cost-row">
        <div className="cost-label">2027년</div>
        <div className="cost-track">
          <div className="cost-seg buy" style={{ width: '94.8%' }}>4억 5,135만 톤</div>
        </div>
        <div className="cost-total warn">▼ 2,491만</div>
      </div>
      <div className="cost-row">
        <div className="cost-label">2028년</div>
        <div className="cost-track">
          <div className="cost-seg buy" style={{ width: '88.2%' }}>4억 1,990만 톤</div>
        </div>
        <div className="cost-total warn">▼ 3,145만</div>
      </div>
      <div className="cost-row">
        <div className="cost-label">2029년</div>
        <div className="cost-track">
          <div className="cost-seg buy" style={{ width: '82.2%' }}>3억 9,138만 톤</div>
        </div>
        <div className="cost-total warn">▼ 2,852만</div>
      </div>
      <div className="cost-row">
        <div className="cost-label">2030년</div>
        <div className="cost-track">
          <div className="cost-seg buy" style={{ width: '76.8%' }}>3억 6,587만 톤</div>
        </div>
        <div className="cost-total warn">▼ 2,551만</div>
      </div>
    </div>

    <p className="srcline">
      근거 —{' '}
      <a href="https://www.law.go.kr/LSW/lsInfoP.do?lsId=011612" target="_blank" rel="noreferrer">
        「온실가스 배출권의 할당 및 거래에 관한 법률」 제33조
      </a>
      : 미제출 부족분에 1톤당 평균 시장가격의 3배 이하 과징금 (2025.10 개정으로 톤당 10만 원 상한 삭제) ·{' '}
      <a href="https://taxation-customs.ec.europa.eu/carbon-border-adjustment-mechanism_en" target="_blank" rel="noreferrer">
        EU CBAM (Regulation 2023/956)
      </a>
      {' '}· 연도별 총수량(예비분 미포함):{' '}
      <a href="https://etrs.gir.go.kr/" target="_blank" rel="noreferrer">ETRS 정보공개 — 4차</a>
      {' '}— 2030년은 2026년 대비 −23%
    </p>
  </ContentSlide>,

  /* 4. 01 — 탄소에 값을 매기는 방법 둘 + 국경세 (그림 비교) */
  <ContentSlide
    key="s0c"
    no="01"
    sec="탄소거래란 무엇인가"
    title="탄소에 값을 매기는 방법은 둘 — 그리고 국경에 하나 더"
    lede={
      <>사고파는 <b>배출권거래제</b>, 내는 <b>탄소세</b> — 한국은 <span className="hl">사고파는 쪽(K-ETS)</span>을 골랐다.
      우리가 들어가야 할 시장이 바로 여기다.</>
    }
  >
    <div className="duo">
      {/* ETS — 공장 + CO₂ 티켓 + CAP 아치 */}
      <div className="duo-panel pick">
        <div className="duo-capword">CAP — 총량은 정해져 있다</div>
        <svg className="duo-cap" viewBox="0 0 400 44" preserveAspectRatio="none" fill="none" aria-hidden>
          <path d="M 12 40 Q 200 -18 388 40" stroke="#2563eb" strokeWidth="2.5" strokeOpacity=".65" />
          <path d="M 20 30 L 10 42 L 26 42 Z" fill="#2563eb" fillOpacity=".65" />
          <path d="M 380 30 L 390 42 L 374 42 Z" fill="#2563eb" fillOpacity=".65" />
        </svg>
        <div className="duo-scene">
          <div className="duo-fac">
            <div className="tik-grid">
              {Array.from({ length: 6 }).map((_, i) => <span className="tik" key={i}>CO₂</span>)}
            </div>
            <span className="material-symbols-outlined duo-fic">factory</span>
          </div>
          <div className="duo-fac">
            <div className="tik-grid">
              {Array.from({ length: 6 }).map((_, i) => <span className="tik" key={i}>CO₂</span>)}
            </div>
            <span className="material-symbols-outlined duo-fic">factory</span>
          </div>
        </div>
        <div className="duo-name">
          탄소배출권거래제 · ETS <span className="tag blue"><i />한국의 선택 — K-ETS</span>
        </div>
        <div className="duo-desc">총량 안에서 배출권을 &ldquo;사고판다&rdquo; — 가격은 시장이 정한다</div>
      </div>

      {/* TAX — 공장과 정부 사이로 동전이 순차적으로 전달된다 */}
      <div className="duo-panel">
        <div className="duo-capword" style={{ color: 'var(--muted)' }}>TAX — 세율은 정해져 있다</div>
        <div className="duo-scene" style={{ gap: '1.6vw' }}>
          <div className="duo-fac">
            <div className="cloud-row" aria-hidden>
              {Array.from({ length: 3 }).map((_, i) => (
                <span className="material-symbols-outlined" key={i}>cloud</span>
              ))}
            </div>
            <span className="material-symbols-outlined duo-fic">factory</span>
            <span className="duo-sub">기업</span>
          </div>
          <div className="pay-mid" aria-hidden>
            <div className="pay-coins">
              {Array.from({ length: 3 }).map((_, i) => (
                <span className="coin" key={i} style={{ animationDelay: `${i * 0.2}s` }}>₩</span>
              ))}
            </div>
            <span className="material-symbols-outlined pay-arrow">arrow_forward</span>
          </div>
          <div className="duo-fac">
            <span className="material-symbols-outlined duo-fic">account_balance</span>
            <span className="duo-sub">정부</span>
          </div>
        </div>
        <div className="formula">
          <span className="f-pill"><span className="material-symbols-outlined">cloud</span>배출량 tCO₂</span>
          ×
          <span className="f-pill">정해진 세율</span>
          =
          <span className="f-pill gold">₩ 낼 돈</span>
        </div>
        <div className="duo-name">탄소세 · Carbon Tax</div>
        <div className="duo-desc">정부가 정한 세율대로 &ldquo;낸다&rdquo; — 거래는 없다 (스웨덴·스위스)</div>
      </div>
    </div>

    <div className="third">
      <div className="third-ic"><span className="material-symbols-outlined">public</span></div>
      <div>
        <div className="third-t">여기에 하나 더 — 탄소국경세 · CBAM</div>
        <div className="third-d">
          국경을 넘는 제품에 탄소비용을 물린다 (EU 2026~) — 어느 제도를 쓰든 수출하는 순간 만나게 되는 세 번째 장치. 대응은 06장에서
        </div>
      </div>
    </div>
  </ContentSlide>,

  /* 5. 01 — 그래서, 이런 거래가 일어난다 */
  <ContentSlide
    key="s0b"
    no="01"
    sec="탄소거래란 무엇인가"
    title="그래서, 이런 거래가 일어난다"
    lede={
      <>과징금과 국경 비용 앞에서 기업의 선택지는 둘 — <b>직접 줄이거나, 줄인 곳에서 사 오거나</b>.
      감축이 싼 기업은 팔고, 비싼 기업은 산다. <span className="hl">배출권은 남는 곳에서 모자란 곳으로 흐른다.</span></>
    }
  >
    <div>
      <div className="block-label"><b>배출권 거래제 메커니즘 — 1장 = 1 tCO₂</b></div>
      <div className="dia">
        {/* 곡선 화살표 — 위: 배출권 판매(좌→우), 아래: 거래 대금(우→좌) */}
        <svg className="dia-arrows" viewBox="0 0 1160 200" preserveAspectRatio="none" fill="none" aria-hidden>
          <path d="M 320 72 Q 580 26 836 72" stroke="#64748b" strokeWidth="2" strokeOpacity=".55" />
          <path d="M 828 62 L 846 74 L 826 80 Z" fill="#64748b" fillOpacity=".55" />
          <path d="M 840 128 Q 580 174 324 128" stroke="#64748b" strokeWidth="2" strokeOpacity=".55" />
          <path d="M 332 118 L 314 126 L 334 136 Z" fill="#64748b" fillOpacity=".55" />
        </svg>
        <span className="dia-pill top">배출권 판매</span>
        <span className="dia-pill bot">거래 대금</span>

        <div className="dia-panel left">
          <span className="dia-badge"><span className="material-symbols-outlined">check_circle</span>배출권 여유분</span>
          <span className="material-symbols-outlined dia-fac">factory</span>
          <div className="dia-name">저배출 기업</div>
          <div className="gauge">
            <span className="g-caplab" style={{ left: '75%' }}>할당 6장</span>
            <div className="g-track">
              <div className="g-fill emit" style={{ width: '50%' }}>배출 4장</div>
              <div className="g-fill spare" style={{ width: '25%' }}>+2 남음</div>
              <span className="g-cap" style={{ left: '75%' }} />
            </div>
          </div>
          <div className="dia-note ok">+2장 남는다 → 판다</div>
        </div>

        <div className="dia-hub">
          <div className="dia-hub-inner"><span className="material-symbols-outlined">currency_exchange</span></div>
        </div>
        <div className="dia-hub-name">탄소 거래소 (KRX)</div>

        <div className="dia-panel right">
          <span className="dia-badge"><span className="material-symbols-outlined">error</span>배출권 부족분</span>
          <span className="material-symbols-outlined dia-fac">factory</span>
          <div className="dia-name">고배출 기업</div>
          <div className="gauge">
            <span className="g-caplab" style={{ left: '75%' }}>할당 6장</span>
            <div className="g-track">
              <div className="g-fill emit" style={{ width: '75%' }}>배출 8장</div>
              <div className="g-fill over" style={{ width: '25%' }}>+2 초과</div>
              <span className="g-cap" style={{ left: '75%' }} />
            </div>
          </div>
          <div className="dia-note bad">−2장 모자란다 → 산다</div>
        </div>
      </div>
    </div>

    <div>
      <div className="block-label"><b>돈으로 보면 — CO₂ 1톤의 가격표 (단순화 예시)</b></div>
      <div className="cost-row">
        <div className="cost-label">이행 — 시장에서 산다</div>
        <div className="cost-track">
          <div className="cost-seg buy" style={{ width: '25%' }}>배출권 2.5만 원</div>
        </div>
        <div className="cost-total">2.5만 원</div>
      </div>
      <div className="cost-row">
        <div className="cost-label">미이행 — 과징금 ×3</div>
        <div className="cost-track">
          <div className="cost-seg fine" style={{ width: '75%' }}>최대 7.5만 원 — 시장가격의 3배, 상한 없음</div>
        </div>
        <div className="cost-total warn">최대 7.5만 원</div>
      </div>
      <div className="cost-row">
        <div className="cost-label">EU 수출 — CBAM</div>
        <div className="cost-track">
          <div className="cost-seg buy" style={{ width: '25%' }}>국내 2.5만</div>
          <div className="cost-seg cbam" style={{ width: '50%' }}>+ 차액 약 7.5만 (EU 가격까지 채움)</div>
        </div>
        <div className="cost-total warn">약 10만 원</div>
      </div>
      <p className="srcline">
        가정(예시) — 배출권(KAU) 평균 시장가격 2.5만 원/톤(2026.7 시세 수준) · EU 탄소가격 약 10만 원/톤(국내 기지불분 공제) ·
        과징금은{' '}
        <a href="https://www.law.go.kr/LSW/lsInfoP.do?lsId=011612" target="_blank" rel="noreferrer">제33조</a>
        (1톤당 평균 시장가격의 3배 이하 — 2025.10 개정으로 10만 원 상한 삭제) ·{' '}
        <a href="https://taxation-customs.ec.europa.eu/carbon-border-adjustment-mechanism_en" target="_blank" rel="noreferrer">EU CBAM</a>
        {' '}— 결국 가장 싼 선택은 시장에서 사거나, 그보다 싸게 직접 줄이는 것
      </p>
    </div>
  </ContentSlide>,

  /* 6. 02 — 그래서 시장이 만들어졌다 */
  <ContentSlide
    key="s2"
    no="02"
    sec="시장은 어떻게 나뉘는가"
    title="그래서 시장이 만들어졌다 — 의무의 시장, 자발의 시장"
    lede={
      <>거래가 가장 싼 선택이 되자, <b>거래할 곳</b>이 필요해졌다.
      정부가 상한을 정해 만든 <span className="hl">규제시장</span>,
      그리고 기업이 스스로 찾아온 <span className="hl">자발적 시장</span> — 탄소시장은 이 두 축으로 움직인다.</>
    }
  >
    <table className="cmp">
      <thead>
        <tr>
          <th className="k"></th>
          <th>규제시장 · Compliance — 정부 주도</th>
          <th>자발적 시장 · Voluntary — 민간 자율</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="k">참여</td>
          <td>법으로 지정된 할당대상업체 — <b>의무</b></td>
          <td>스스로 찾아온 기업 — <b>자율</b> (ESG · RE100 · 브랜드)</td>
        </tr>
        <tr>
          <td className="k">방식</td>
          <td><b>Cap-and-Trade</b> 총량 거래(EU·한국·캘리포니아) · <b>Baseline-and-Credit</b> 기준 대비 감축분 크레딧(외부사업)</td>
          <td>인증기관(Verra·Gold Standard)이 검증·발행한 크레딧을 구매해 상쇄</td>
        </tr>
        <tr>
          <td className="k">상품</td>
          <td>KAU · KCU (+ 전환 전 실적 KOC)</td>
          <td>VCS · GS 등 자발적 크레딧</td>
        </tr>
        <tr>
          <td className="k">가격</td>
          <td>KAU 톤당 2만 원대 중반 (2026.7)</td>
          <td>대체로 더 낮음 — 사업 유형·품질(ICVCM 4대 기준)에 따라 편차 큼</td>
        </tr>
        <tr>
          <td className="k">의무 이행</td>
          <td className="good">가능 — K-ETS 제출은 KAU·KCU만 인정 (배출권거래법 제27·29조)</td>
          <td className="bad">불가 — 싸도 K-ETS에 낼 수 없다</td>
        </tr>
      </tbody>
    </table>

    <Block label="자발적 크레딧이 더 싼데, 왜 거기서 안 사나 — 그리고 실제로는 어떻게 사나" cols={3}>
      <Item
        tone="amber"
        k="① 효력이 없다"
        d="K-ETS 의무 이행에 낼 수 있는 건 KAU·KCU뿐(법 제27·29조) — 싸도 과징금은 못 막는 돈이다"
      />
      <Item
        k="② 문턱이 있다"
        d="KCU가 되려면 국내법 인증(KOC·CER)을 거쳐야 하고, 제출한도(3차 기준 5%)도 있다"
      />
      <Item
        k="③ 실제 구매 경로"
        d="장내 KRX(거래는 당해연도물에 집중) · 장외 상대거래 · 매월 유상 경매 — 자발적 크레딧은 ESG·자발 상쇄 목적일 때"
      />
    </Block>
  </ContentSlide>,

  /* 5. 02 — 상품 3종 */
  <ContentSlide
    key="s3"
    no="02"
    sec="시장은 어떻게 나뉘는가"
    title="배출권은 둘뿐 — 크레딧은 배출권이 아니다"
    lede={
      <>정부에 제출할 수 있는 배출권은 <b>KAU</b>와 <b>KCU</b> 두 가지.
      <b> KOC·CER</b>은 감축 <span className="hl">&ldquo;실적&rdquo;</span>이라 그대로 못 내고,
      인증을 거쳐 KCU로 바꿔야 한다 — 그마저도 <span className="hl">제출량의 일부만</span>(3차 기준 5%).</>
    }
  >
    <div className="cards-3">
      <div className="fcard">
        <div className="fcard-title">
          <span className="pcode">KAU</span> 할당배출권 <span className="tag blue"><i />배출권 ①</span>
        </div>
        <div className="spec">
          <div className="spec-row"><span className="spec-k">출처</span><span className="spec-v">정부 할당 — 계획기간 5개년치 선할당</span></div>
          <div className="spec-row"><span className="spec-k">연도</span><span className="spec-v">Vintage 부여 — <b>KAU25 = 2025년도분</b></span></div>
          <div className="spec-row"><span className="spec-k">쓰임</span><span className="spec-v"><b>의무 이행의 기본</b> · 거래 주력</span></div>
        </div>
      </div>
      <div className="fcard">
        <div className="fcard-title">
          <span className="pcode">KCU</span> 상쇄배출권 <span className="tag blue"><i />배출권 ②</span>
        </div>
        <div className="spec">
          <div className="spec-row"><span className="spec-k">출처</span><span className="spec-v">KOC·CER을 인증 거쳐 <b>전환</b> (법 제29조)</span></div>
          <div className="spec-row"><span className="spec-k">한도</span><span className="spec-v">제출량의 일부만 인정 — <b>3차 기준 5%</b></span></div>
          <div className="spec-row"><span className="spec-k">쓰임</span><span className="spec-v">KAU를 <b>갈음해 제출</b> — 전환 시 Vintage 부여</span></div>
        </div>
      </div>
      <div className="fcard amber">
        <div className="fcard-title">
          <span className="pcode" style={{ color: '#b45309' }}>KOC·CER</span> 감축실적 <span className="tag amber"><i />배출권 아님</span>
        </div>
        <div className="spec">
          <div className="spec-row"><span className="spec-k">출처</span><span className="spec-v"><b>조직경계 밖</b> 감축사업 (법 제30조 인증) — 기준 대비 감축분을 실적으로 인정(Baseline-and-Credit)</span></div>
          <div className="spec-row"><span className="spec-k">성격</span><span className="spec-v">Vintage 없는 &ldquo;실적&rdquo; — 흔히 배출권으로 오해</span></div>
          <div className="spec-row"><span className="spec-k">쓰임</span><span className="spec-v">그대로 제출 불가 → <b>KCU 전환 필요</b></span></div>
        </div>
      </div>
    </div>

    <div className="grid-2">
      {/* 좌: 법령 문서 */}
      <div className="lawdoc">
          <div className="lawdoc-head">
            <span className="material-symbols-outlined">balance</span>
            <span className="lawdoc-title">온실가스 배출권의 할당 및 거래에 관한 법률</span>
            <a
              className="lawdoc-link"
              href="https://www.law.go.kr/LSW/lsInfoP.do?lsId=011612"
              target="_blank"
              rel="noreferrer"
            >
              전문 보기 — law.go.kr
            </a>
          </div>
          <div className="lawdoc-body">
            <p>
              <span className="lawdoc-art">제29조(상쇄)</span> ① 할당대상업체는 외부사업 온실가스 감축량을
              보유·취득한 경우 <b>배출권으로 전환하여 줄 것</b>을 신청할 수 있다 ③ 상쇄배출권은 배출권 제출을{' '}
              <b>갈음하여</b> 제출할 수 있으며, <b>제출한도·유효기간을 제한</b>할 수 있다
            </p>
            <p>
              <span className="lawdoc-art">제30조</span> 감축량의 인증 ·{' '}
              <span className="lawdoc-art">제31조</span> 상쇄등록부(배출권등록부와 연계)
            </p>
          </div>
        </div>

      {/* 우: Vintage + 근거 */}
      <div className="side-col">
        <div>
          <div className="block-label"><b>Vintage — 배출권에는 연도가 붙는다</b></div>
          <div className="grid-v">
            <Item k="제출" d="2025년 배출분은 KAU25로만 — 이듬해 제출" />
            <Item k="이월" d="남으면 다음 해로 — KAU25 → KAU26 (승인제 — 법 제28조)" />
            <Item k="부족" d="모자라면 답은 하나 — 시장·경매에서 매입한다" />
          </div>
        </div>

        <p className="srcline" style={{ marginTop: 0 }}>
          근거 —{' '}
          <a href="https://www.law.go.kr/LSW/lsInfoP.do?lsId=011612" target="_blank" rel="noreferrer">
            배출권거래법 제28~31조 (이월 · 상쇄 · 인증 · 상쇄등록부)
          </a>
          {' '}·{' '}
          <a href="https://bsbibv.tistory.com/entry/%EA%B5%AD%EB%82%B4%EB%B0%B0%EC%B6%9C%EA%B6%8C%EC%9D%98-%EC%A2%85%EB%A5%98-%ED%95%A0%EB%8B%B9%EB%B0%B0%EC%B6%9C%EA%B6%8CKAU%EC%83%81%EC%87%84%EB%B0%B0%EC%B6%9C%EA%B6%8CKCU-%EC%99%B8%EB%B6%80%EC%82%AC%EC%97%85%EA%B0%90%EC%B6%95%EC%8B%A4%EC%A0%81KOC-CER%EC%9D%98-%EC%9A%A9%EB%8F%84%EC%B0%A8%EC%9D%B4%EC%A0%90%ED%8A%B9%EC%A7%95%EA%B4%80%EB%A0%A8%EA%B7%9C%EC%A0%95" target="_blank" rel="noreferrer">
            참고: 국내 배출권의 종류 — KAU · KCU · KOC · CER
          </a>
        </p>
      </div>
    </div>

    {/* 발표 중 라이브 시연 — 클릭하면 새 창 풀스크린 */}
    <div className="demo-row">
      <a className="demo-btn" href="https://etrs.gir.go.kr/" target="_blank" rel="noreferrer">
        <span className="demo-ic"><span className="material-symbols-outlined">monitoring</span></span>
        <span>
          <span className="demo-t"><span className="live-dot" />ETRS 배출권등록부 — 라이브 시연</span>
          <span className="demo-d">정보공개 메뉴 — 연도별 총수량 · 이월량 · 차입량 통계 (새 창)</span>
        </span>
        <span className="demo-arr">↗</span>
      </a>
      <a className="demo-btn" href="https://ets.krx.co.kr/contents/ETS/03/03010000/ETS03010000.jsp" target="_blank" rel="noreferrer">
        <span className="demo-ic"><span className="material-symbols-outlined">candlestick_chart</span></span>
        <span>
          <span className="demo-t"><span className="live-dot" />KRX 배출권시장 시세 — 라이브 시연</span>
          <span className="demo-d">KAU25 현재가·거래량을 실제 화면으로 (새 창)</span>
        </span>
        <span className="demo-arr">↗</span>
      </a>
    </div>
  </ContentSlide>,

  /* 02 — 사는 곳: 장내 vs 장외 */
  <ContentSlide
    key="s3b"
    no="02"
    sec="시장은 어떻게 나뉘는가"
    title="사는 곳도 둘 — 장내와 장외"
    lede={
      <>같은 배출권이라도 사는 길은 둘이다. 거래소를 거치면 <b>장내</b>,
      당사자끼리 직접 계약하면 <b>장외</b>다.</>
    }
  >
    <div className="cards-2">
      <div className="fcard">
        <div className="fcard-title">
          <span className="fcard-ic"><span className="material-symbols-outlined">candlestick_chart</span></span>
          장내 · KRX 배출권시장 <span className="tag blue"><i />거래소</span>
        </div>
        <div className="spec">
          <div className="spec-row"><span className="spec-k">방식</span><span className="spec-v">호가 경쟁매매 — 주식처럼, 회원 증권사 경유</span></div>
          <div className="spec-row"><span className="spec-k">가격</span><span className="spec-v"><b>공개 시장가</b> — 시세가 그대로 공표된다</span></div>
          <div className="spec-row"><span className="spec-k">상품</span><span className="spec-v">KAU(주력) · KCU · KOC — 거래는 당해연도물에 집중</span></div>
          <div className="spec-row"><span className="spec-k">비용</span><span className="spec-v">위탁·거래 수수료</span></div>
          <div className="spec-row"><span className="spec-k">결제</span><span className="spec-v">거래소가 청산·결제를 보증</span></div>
        </div>
      </div>
      <div className="fcard">
        <div className="fcard-title">
          <span className="fcard-ic" style={{ background: '#f5f3ff', color: '#6d28d9' }}><span className="material-symbols-outlined">handshake</span></span>
          장외 · 상대거래 (OTC) <span className="tag gray"><i />직접 계약</span>
        </div>
        <div className="spec">
          <div className="spec-row"><span className="spec-k">방식</span><span className="spec-v">당사자 간 직접 계약 — 브로커 중개 포함</span></div>
          <div className="spec-row"><span className="spec-k">가격</span><span className="spec-v"><b>당사자 협의</b>로 결정 — 공표되지 않는다</span></div>
          <div className="spec-row"><span className="spec-k">비용</span><span className="spec-v">상대 탐색·협상, 중개 시 수수료</span></div>
          <div className="spec-row"><span className="spec-k">결제</span><span className="spec-v">당사자 간 계약 조건에 따름</span></div>
        </div>
      </div>
    </div>

    <div>
      <div className="block-label"><b>장내 하루의 흐름 — 매매거래시간 10:00~12:00 (KRX 운영제도)</b></div>
      <Flow
        steps={[
          { no: '경로', name: '증권사 경유', sub: '회원·거래중개회원의 HTS 또는 거래소 호가입력프로그램' },
          { no: '09:00~', name: '호가 접수 시작', sub: '접수는 09:00~12:00' },
          { no: '10:00', name: '시가 단일가 체결', sub: '9~10시 접수분을 하나의 가격으로 — 시가 결정' },
          { no: '~11:30', name: '접속매매', sub: '실시간 복수가격 체결 — 주식처럼' },
          { no: '12:00', name: '종가 단일가 체결', sub: '11:30~12시 접수분 — 종가 결정, 장 종료', final: true },
        ]}
      />
      <p className="srcline">
        출처 —{' '}
        <a href="https://ets.krx.co.kr/contents/RGL/04/04030203/RGL04030203.jsp" target="_blank" rel="noreferrer">
          KRX 배출권시장 정보플랫폼 · 매매제도(거래일·매매거래시간)
        </a>
      </p>
    </div>

    <p className="coda" style={{ paddingTop: '.7vw' }}>
      어느 길로 사든 <b>ETRS 등록을 마쳐야 효력</b> — 결국 모든 거래는 등록부로 모인다.
    </p>
  </ContentSlide>,

  /* 03 — 참여자 스윔레인 */
  <ContentSlide
    key="s4"
    no="03"
    sec="누가 움직이는가"
    title="다섯 참여자, 하나의 사이클"
    lede={
      <>공급자가 만들고, 수요자가 사고, 인프라가 잇는다.
      그리고 <b>규제와 인증이 이 모든 거래에 신뢰를 만든다</b>.</>
    }
  >
    <div className="lane">
      <LaneRow
        color="#8b5cf6" name="정부 · 규제기관" sub="시장 설계와 감독"
        steps={[
          { b: 'Cap 설정', s: '배출허용총량' },
          { b: '할당계획 수립', s: '무상 · 유상 비율' },
          { b: '유상 경매', s: '매월 둘째 주 수요일' },
          { b: '이행 확인', s: '미이행 시 과징금' },
        ]}
      />
      <LaneRow
        color="#2563eb" name="할당대상업체" sub="수요 — 약 700곳"
        steps={[
          { b: '배출량 측정', s: 'GHG 인벤토리' },
          { b: '명세서 제출·검증', s: 'MRV' },
          { b: '부족 매수 · 잉여 매도', s: 'KRX · 위탁거래' },
          { b: '의무 이행', s: 'KAU · KCU 제출' },
        ]}
      />
      <LaneRow
        color="#f59e0b" name="외부사업자" sub="공급 — 크레딧 개발"
        steps={[
          { b: '감축사업 개발', s: '재생에너지 · 메탄 회수' },
          { b: '실적 인증', s: 'KOC 발급 · 에너지공단' },
          { b: 'KOC 판매', s: '수익화' },
        ]}
      />
      <LaneRow
        color="#ec4899" name="인증기관" sub="신뢰 — 국제 VCM"
        steps={[
          { b: '프로젝트 검증', s: '방법론 심사' },
          { b: '크레딧 발행', s: 'Verra · Gold Standard' },
          { b: '레지스트리 추적', s: '이중계상 방지' },
        ]}
      />
      <LaneRow
        color="#10b981" name="거래 인프라" sub="중개 — 브로커 · 거래소"
        steps={[
          { b: 'ETRS 등록', s: '보유 · 이전 관리' },
          { b: 'KRX 장내거래', s: '회원 증권사 경유' },
          { b: '국제 거래소', s: 'CBL · ICE · CME' },
        ]}
      />
    </div>

    <Block label="가격 변동에 대비하는 금융 수단" cols={3}>
      <Item k="장기 구매계약 · Offtake" d="미래 물량을 미리 확보해 공급 불확실성을 없앤다" />
      <Item k="선물 · Futures" d="정해진 가격과 시점에 매매 — 한국은 2028년 도입 목표" />
      <Item k="옵션 · Options" d="매매 권리만 확보해 급등락 리스크를 헤지한다" />
    </Block>
  </ContentSlide>,

  /* 7. 04 — 할당 */
  <ContentSlide
    key="s5"
    no="04"
    sec="한국은 어떻게 운영하는가"
    title="대부분은 거저 주고, 나머지는 판다"
    lede={
      <>정부는 할당총량의 <b>약 89%를 기업에 무상으로 나눠준다</b>(무상할당).
      나머지 <b>약 11%는 주지 않고 경매로 판다</b>(유상할당) — <span className="hl">기업이 돈 내고 사야 하는 몫</span>이고,
      이 몫이 계획기간마다 커진다.</>
    }
  >
    <div className="cards-2">
      <div className="fcard">
        <div className="fcard-title">
          <span className="fcard-ic"><span className="material-symbols-outlined">redeem</span></span>
          무상할당 · Free <span className="tag blue"><i />약 89%</span>
        </div>
        <div className="spec">
          <div className="spec-row"><span className="spec-k">방식</span><span className="spec-v">과거 배출량·업종 기준 <b>무료 배분</b> (배출권거래법 제12조)</span></div>
          <div className="spec-row"><span className="spec-k">보호</span><span className="spec-v">비용발생도 × 무역집약도 ≥ 0.2%면 <b>100% 무상</b> — 수출 경쟁력</span></div>
          <div className="spec-row"><span className="spec-k">업종</span><span className="spec-v">철강 · 석유화학 · 시멘트 · 정유 · 반도체 · 디스플레이</span></div>
        </div>
      </div>
      <div className="fcard">
        <div className="fcard-title">
          <span className="fcard-ic" style={{ background: '#fffbeb', color: '#b45309' }}><span className="material-symbols-outlined">gavel</span></span>
          유상할당 · 경매 <span className="tag amber"><i />약 11%</span>
        </div>
        <div className="spec">
          <div className="spec-row"><span className="spec-k">일정</span><span className="spec-v"><b>매월 둘째 주 수요일</b> 14~15시 — 2026년 12회</span></div>
          <div className="spec-row"><span className="spec-k">물량</span><span className="spec-v">2026년 총 <b>2,400만 톤</b> (월 100만~285만)</span></div>
          <div className="spec-row"><span className="spec-k">낙찰</span><span className="spec-v"><b>단일가격</b> = 유효응찰 중 최저가 · 하한가 미달 무효(계산식 비공개)</span></div>
          <div className="spec-row"><span className="spec-k">한도</span><span className="spec-v">업체별 해당일 물량의 <b>15~30%</b> · 수수료 0.11%</span></div>
        </div>
      </div>
    </div>

    <div className="alloc">
      {[
        { label: '1차 · 2015–2017', free: 100, paid: 0 },
        { label: '2차 · 2018–2020', free: 97, paid: 3 },
        { label: '3차 · 2021–2025', free: 90, paid: 10 },
        { label: '4차 · 2026–2030', free: 89, paid: 11 },
      ].map((p) => (
        <div className="alloc-row" key={p.label}>
          <div className="alloc-label">{p.label}</div>
          <div className="alloc-track">
            <div className="alloc-free" style={{ width: `${p.free}%` }}>무상 {p.free === 89 ? '약 89%' : `${p.free}%`}</div>
            {p.paid > 0 && <div className="alloc-paid" style={{ width: `${p.paid}%` }}>유상 {p.paid === 11 ? '약 11%' : `${p.paid}%`}</div>}
          </div>
        </div>
      ))}
      <div className="alloc-note">
        발전 부문 유상할당은 2026년 15% → 2030년 50%로 단계 상향 · 비발전(산업)은 15% 수준, 수출 주력 업종은 100% 무상 유지
        — 계획기간별 국가 배출권 할당계획 (4차는 기본계획 근사치) · 경매 세부:{' '}
        <a href="/docs/notice-2026-591-auction.pdf" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', textDecoration: 'underline', textUnderlineOffset: 2 }}>
          기후에너지환경부공고 제2026-591호 (PDF)
        </a>
      </div>
    </div>
  </ContentSlide>,

  /* 04 — 경매 ① 언제: 2026 캘린더 */
  <ContentSlide
    key="s5b"
    no="04"
    sec="한국은 어떻게 운영하는가"
    title="경매는 언제 열리나 — 2026 캘린더"
    lede={
      <>경매는 <b>매월 둘째 주 수요일 14~15시</b>, KRX <b>K-ETS 시스템</b>에서 한 시간 동안 열린다.
      아래 열두 날짜와 수량은 공고 원문 그대로다.</>
    }
  >
    <div className="ms-head">
      <div className="block-label" style={{ marginBottom: 0 }}><b>2026년 정기입찰일 · 입찰수량</b></div>
      <span className="tag blue"><i />KAU25 (1~8월)</span>
      <span className="tag"><i style={{ background: '#8b5cf6' }} />KAU26 (9~12월)</span>
      <span className="ms-total">합계 2,400만 톤</span>
    </div>
    <div className="mcal-grid">
      {[
        { mon: '1월', days: 31, first: 4, day: 14, v: '100만 톤', k26: false },
        { mon: '2월', days: 28, first: 0, day: 11, v: '120만 톤', k26: false },
        { mon: '3월', days: 31, first: 0, day: 11, v: '120만 톤', k26: false },
        { mon: '4월', days: 30, first: 3, day: 8, v: '120만 톤', k26: false },
        { mon: '5월', days: 31, first: 5, day: 13, v: '120만 톤', k26: false },
        { mon: '6월', days: 30, first: 1, day: 10, v: '120만 톤', k26: false },
        { mon: '7월', days: 31, first: 3, day: 8, v: '283만 톤', k26: false },
        { mon: '8월', days: 31, first: 6, day: 12, v: '283만 톤', k26: false },
        { mon: '9월', days: 30, first: 2, day: 9, v: '283만 톤', k26: true },
        { mon: '10월', days: 31, first: 4, day: 14, v: '283만 톤', k26: true },
        { mon: '11월', days: 30, first: 0, day: 11, v: '283만 톤', k26: true },
        { mon: '12월', days: 31, first: 2, day: 9, v: '285만 톤', k26: true },
      ].map((m) => (
        <div className="mcal" key={m.mon}>
          <div className="mcal-head">
            <b>{m.mon}</b>
            <span className={`cal-vol ${m.k26 ? 'k26' : 'k25'}`}>{m.v}</span>
          </div>
          <div className="mcal-days">
            {['일', '월', '화', '수', '목', '금', '토'].map((d) => (
              <span className="mcal-wd" key={d}>{d}</span>
            ))}
            {Array.from({ length: m.first }).map((_, i) => <span key={`e${i}`} />)}
            {Array.from({ length: m.days }).map((_, i) => {
              const d = i + 1
              return (
                <span key={d} className={`mcal-d${d === m.day ? (m.k26 ? ' hit v26' : ' hit') : ''}`}>
                  {d}
                </span>
              )
            })}
          </div>
        </div>
      ))}
    </div>
    <p className="srcline">
      출처 —{' '}
      <a href="/docs/notice-2026-591-auction.pdf" target="_blank" rel="noreferrer">
        기후에너지환경부공고 제2026-591호 (PDF)
      </a>
      {' '}· 시장 상황에 따라 월 2회 이상 추가 경매 가능 · 일정·수량은 조정될 수 있음(공고 명시)
    </p>
  </ContentSlide>,

  /* 04 — 경매 ② 어떻게: 절차 */
  <ContentSlide
    key="s5c"
    no="04"
    sec="한국은 어떻게 운영하는가"
    title="경매는 이렇게 진행된다"
    lede={<>참가부터 결제까지 다섯 걸음 — 전부 공고에 적힌 그대로다.</>}
  >
    <Flow
      steps={[
        { no: 'STEP 1', name: '자격 확인', sub: '유상할당 규정 제5조의 입찰참가자' },
        { no: 'STEP 2', name: '보증금 납부', sub: '응찰가 × 수량 + 수수료·VAT — 경매일 12:00까지' },
        { no: 'STEP 3', name: '응찰', sub: 'K-ETS 경매창 — 14~15시, 호가 제출' },
        { no: 'STEP 4', name: '낙찰 결정', sub: '높은 가격순 소진 — 낙찰가 = 유효응찰 중 최저가' },
        { no: 'STEP 5', name: '결제', sub: '전원 단일가 결제 · 수수료 0.11%', final: true },
      ]}
    />

    <Block label="입찰 기준 — 공고가 정한 규칙" cols={3}>
      <Item k="호가는 1개만" d="경매참가자는 응찰호가 1개만 제시 — 정정하려면 원호가 취소 후 새로 제출" />
      <Item k="수량 단위" d="최저 응찰 1,000톤 · 응찰 단위 100톤" />
      <Item k="입찰보증금" d="응찰가 × 수량 + 수수료·VAT를 경매일 12:00까지 거래소에 납부" />
    </Block>

    <p className="srcline">
      출처 —{' '}
      <a href="/docs/notice-2026-591-auction.pdf" target="_blank" rel="noreferrer">
        기후에너지환경부공고 제2026-591호 (PDF)
      </a>
      {' '}· 호가 가격 단위는 한국거래소 「배출권거래시장 운영규정」 제34조에 따름
    </p>
  </ContentSlide>,

  /* 04 — 경매 ③ 낙찰: 공고 예시 ① 시각화 */
  <ContentSlide
    key="s5d"
    no="04"
    sec="한국은 어떻게 운영하는가"
    title="낙찰은 이렇게 결정된다 — 전원, 같은 가격"
    lede={
      <>높은 가격부터 물량이 찰 때까지 낙찰시키되, 결제는 <b>전원이 유효응찰 중 최저가</b>로 —
      아래는 공고의 낙찰 예시 ①을 그대로 그린 것이다.</>
    }
  >
    <div>
      <div className="block-label"><b>공고 예시 ① — 입찰수량 100만 톤 · 업체별 한도 15% · 낙찰하한가 20,000원</b></div>
      {[
        { p: '23,000', who: 'A — 낙찰 15만', win: 60, lose: 40, loseLabel: '한도 초과 10만' },
        { p: '21,000', who: 'B — 낙찰 15만', win: 60, lose: 20, loseLabel: '+5만' },
        { p: '20,900', who: 'C — 낙찰 15만', win: 60, lose: 20, loseLabel: '+5만' },
        { p: '20,800', who: 'D — 낙찰 15만', win: 60, lose: 0, loseLabel: '' },
        { p: '20,700', who: 'E — 낙찰 15만', win: 60, lose: 0, loseLabel: '' },
        { p: '20,500', who: 'G — 낙찰 15만', win: 60, lose: 20, loseLabel: '+5만' },
        { p: '20,300', who: 'F — 낙찰 10만 (잔여)', win: 40, lose: 40, loseLabel: '미배정 10만' },
      ].map((b) => (
        <div className="bid-row" key={b.p}>
          <span className="bid-price">{b.p}원</span>
          <div className="bid-track">
            <div className="bid-seg win" style={{ width: `${b.win}%` }}>낙찰</div>
            {b.lose > 0 && <div className="bid-seg lose" style={{ width: `${b.lose}%` }}>{b.loseLabel}</div>}
          </div>
          <span className="bid-who">{b.who}</span>
        </div>
      ))}
      <div className="bid-floor">낙찰하한가 20,000원 — 이 아래 응찰은 무효</div>
      <div className="bid-row">
        <span className="bid-price" style={{ color: '#b91c1c' }}>19,500원</span>
        <div className="bid-track">
          <div className="bid-seg void" style={{ width: '100%' }}>응찰 50만 톤 — 전량 무효 (하한가 미달)</div>
        </div>
        <span className="bid-who" style={{ color: '#b91c1c' }}>C — 낙찰 없음 (예시②)</span>
      </div>
      <div className="bid-final">
        낙찰가 = 20,300원, 전원 동일 (유효응찰 중 최저가) — 비싸게 부른 회사도 같은 값에 산다
      </div>
    </div>

    <Block label="낙찰을 둘러싼 세 가지 장치" cols={3}>
      <Item k="낙찰한도 15~30%" d="업체별 낙찰수량은 해당일 입찰수량의 15~30%까지 — 독식 방지" />
      <Item k="낙찰하한가" d="기준가격에서 할인율을 공제해 설정 — 계산식 비공개, 미만 응찰은 무효" />
      <Item k="유찰 물량 이월" d="낙찰 총합이 입찰수량에 못 미치면 초과 수량은 차월 경매로 이월 가능" />
    </Block>

    <Block label="그럼 5만 원을 써내면 무조건 낙찰인데, 왜 아무도 안 그럴까" cols={2}>
      <Item
        tone="amber"
        k="보증금이 응찰가에 비례"
        d="입찰보증금 = 응찰가 × 수량 + 수수료·VAT, 경매일 12시까지 납부(공고 명시) — 비싸게 쓸수록 현금이 그만큼 묶인다"
      />
      <Item
        k="응찰가는 &ldquo;그 값까지 내겠다&rdquo;는 약속"
        d="응찰이 몰리면 낙찰가(최저 유효가)도 올라간다 — 장내에서 2만 원대에 살 수 있는데 5만 원 상한을 걸 이유가 없다"
      />
    </Block>

    <p className="srcline">
      출처 —{' '}
      <a href="/docs/notice-2026-591-auction.pdf" target="_blank" rel="noreferrer">
        기후에너지환경부공고 제2026-591호, 4~5쪽 낙찰결정방법·예시 (PDF)
      </a>
    </p>
  </ContentSlide>,

  /* 05 — 2026 현황 */
  <ContentSlide
    key="s7"
    no="05"
    sec="시장은 지금 어디에 있는가"
    title="2026, 닫혀 있던 시장이 열리기 시작했다"
    lede={
      <>4차 계획기간 원년. 유상 확대가 실수요를 깨우며 가격은 연초 전망(1만 원대)을 넘어
      <b> 2만 원대 중반</b>까지 올랐다. 남은 숙제는 <span className="hl">유동성</span>이다.</>
    }
  >
    <div className="stats">
      <div className="stat acc"><div className="stat-num">25.4억 t</div><div className="stat-label">배출허용총량 (2026–2030)</div></div>
      <div className="stat"><div className="stat-num">2만 원대</div><div className="stat-label">KAU25 톤당 중반 (2026.7) ▲</div></div>
      <div className="stat"><div className="stat-num">15→50%</div><div className="stat-label">발전 부문 유상 비중 (2026→2030)</div></div>
      <div className="stat"><div className="stat-num">2028</div><div className="stat-label">배출권 선물시장 개장 목표</div></div>
      <div className="stat"><div className="stat-num">K-MSR</div><div className="stat-label">시장안정화예비분 — 수급 조절</div></div>
    </div>

    <div>
      <div className="block-label"><b>유동성 확충 로드맵 — 참여자가 단계적으로 열린다</b></div>
      <Flow
        steps={[
          { no: '~2023', name: '직접거래만', sub: '할당대상업체 + 시장조성자' },
          { no: '2024', name: '위탁거래 개방', sub: '증권사 계좌 — 금융기관 · 연기금' },
          { no: '2028', name: '선물시장', sub: '가격 헤지 수단 (개장 목표)' },
          { no: '이후', name: 'ETF · ETN', sub: '금융상품화 — 일반 자금 유입' },
          { no: '2028~29', name: '개인 투자자', sub: '선물 · ETF 이후 검토', final: true },
        ]}
      />
    </div>

    <div className="panel">
      <div className="panel-title">시장은 실제로 커지고 있다 — KRX 배출권시장 거래 규모</div>
      <div className="gcmp">
        <div className="gpanel">
          <div className="gp-year">2016</div>
          <div className="gp-val">5,108천 톤</div>
          <div className="gp-div" />
          <div className="gp-val">906억 원</div>
        </div>
        <div className="gmidcol">
          <div className="gm-sp" />
          <div className="gm-k">거래량</div>
          <div className="gm-div" />
          <div className="gm-k">거래대금</div>
        </div>
        <div className="gpanel now">
          <div className="gp-year">2024</div>
          <div className="gp-val">99,080천 톤</div>
          <div className="gp-div" />
          <div className="gp-val">9,434억 원</div>
        </div>
        <div className="gbcol">
          <div className="gm-sp" />
          <div className="gb-slot"><span className="gc-x">20배</span></div>
          <div className="gm-div" />
          <div className="gb-slot"><span className="gc-x">10배</span></div>
        </div>
      </div>
      <div className="grow-src">
        출처: 한국거래소 — 거래량 5,108천 톤(약 511만) → 99,080천 톤(약 9,908만), 8년 새 20배 · 거래대금 10배.
        &ldquo;유동성 부족&rdquo;은 남은 과제이지, 시장이 멈춰 있다는 뜻이 아니다
      </div>
    </div>
  </ContentSlide>,

  /* 10. 06 — 측정과 CBAM */
  <ContentSlide
    key="s8"
    no="06"
    sec="무엇부터 시작하는가"
    title="측정 없이는 거래도 없다"
    lede={
      <><b>측정할 수 없으면 관리할 수 없고, 관리할 수 없으면 거래할 수 없다.</b>
      할당도, 손익 판단도, 감축 증명도 — 모든 것이 배출량 숫자에서 시작한다.</>
    }
  >
    <Flow
      steps={[
        { no: 'STEP 1', name: '측정 — GHG 인벤토리', sub: 'Scope 1·2·3 산정 = 배출량 관리 플랫폼의 영역', final: true },
        { no: 'STEP 2', name: '보고 · 검증 — MRV', sub: '정부 명세서 · 고객사 보고 · 제3자 검증' },
        { no: 'STEP 3', name: '거래 · 대응', sub: '부족하면 KAU 구매 · 남으면 KOC 판매 · CBAM 대응' },
      ]}
    />

    <Block label="측정 단계에서 정확해야 하는 것들" cols={3}>
      <Item k="Scope 1 · 2 · 3" d="직접배출 · 전기/열 간접배출 · 가치사슬 — 조직 경계(통제 vs 지분)를 먼저 정한다" />
      <Item k="산정 공식" d="활동자료 × 배출계수 → 가스별(CO₂·CH₄·N₂O) GWP 환산 → tCO₂e로 통합" />
      <Item k="검산" d="단위·배출계수 오류는 이후 모든 단계를 무너뜨린다 — 반드시 재검산한다" />
    </Block>

    <Block label="CBAM — 2026년 1월, EU가 국경에서 탄소 가격을 묻는다" cols={2}>
      <Item tone="amber" k="무엇을 요구하나" d="EU로 수입되는 탄소집약 제품에 내재 배출량만큼 인증서 구매를 요구 — 배출이 곧 수출 원가가 된다" />
      <Item tone="amber" k="한국 기업에 주는 의미" d="철강 · 시멘트 · 알루미늄 · 비료 · 전기 · 수소 수출기업에 감축 압박 — 정확한 배출량 산정이 대응의 전제" />
    </Block>
  </ContentSlide>,

  /* 11. 마무리 */
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
