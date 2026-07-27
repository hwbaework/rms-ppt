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

/* ── 분기 단계 (일정 슬라이드) — 점·라인 레일이 컬럼을 관통하고, 아래 카드가 내용 ── */
.grow{flex:1;min-height:0;display:flex;flex-direction:column}
.phrow{display:flex;gap:.9vw;flex:1;min-height:0;align-items:stretch}
.phcol{flex:1;display:flex;flex-direction:column;min-width:0}
.phcol.now{flex:.62}
.step-line{display:flex;align-items:center;gap:.55vw;margin-bottom:.65vw}
.step-dot{width:.55vw;height:.55vw;border-radius:50%;border:2px solid var(--accent);background:var(--paper);flex-shrink:0}
.step-dot.fill{background:var(--accent)}
.step-dot.gray{border-color:#b6c2d6}
.step-no{color:var(--accent);font-size:.78vw;font-weight:800;letter-spacing:.06em;white-space:nowrap}
.step-no.gray{color:var(--muted)}
.step-line:after{content:"";flex:1;height:1px;background:var(--hair)}
.phcol:last-child .step-line:after{display:none}
.ph{flex:1;border:1px solid var(--hair);border-radius:14px;background:#fff;padding:1.2vw 1.3vw;display:flex;flex-direction:column;gap:.8vw;justify-content:center}
.ph.final{border:1.5px solid #93c5fd;background:linear-gradient(180deg,#ffffff,#f7faff);box-shadow:0 8px 24px rgba(37,99,235,.12)}
.ph.nowcard{background:var(--chip);border-style:dashed;box-shadow:none}
.ph-t{color:var(--ink);font-size:1.05vw;font-weight:800;letter-spacing:-.01em;line-height:1.35}
.ph.nowcard .ph-t{color:#475569}
.ph-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:.6vw}
.ph-list li{position:relative;padding-left:.85vw;color:var(--body);font-size:.87vw;line-height:1.62;word-break:keep-all}
.ph-list li:before{content:"";position:absolute;left:0;top:.55vw;width:.32vw;height:.32vw;border-radius:50%;background:var(--accent)}
.ph.nowcard .ph-list li:before{background:#94a3b8}
/* 사업 영향 — 체크 행 3개 가로 스트립 */
.fxrow3{display:grid;grid-template-columns:repeat(3,1fr);gap:.9vw}

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
/* ── 누적 목표 바 — 전체 목표 하나의 막대: 구축 완료 + 준비 중(잔여) ── */
.cum{display:flex;flex-direction:column;gap:.35vw}
.cum-head{display:flex;justify-content:space-between;align-items:baseline;gap:1vw}
.cum-head b{color:var(--ink);font-size:.9vw;font-weight:800}
.cum-head small{color:var(--muted);font-size:.74vw}
.cum-bar{position:relative;display:flex;height:1.6vw;border-radius:9px;overflow:hidden;background:#e9edf5}
.cum-done{background:linear-gradient(90deg,#1d4ed8,#3b82f6);display:flex;align-items:center;justify-content:center;color:#fff;font-size:.72vw;font-weight:800;white-space:nowrap;flex-shrink:0}
/* 준비 중(잔여) — 진행률 주장 없이 움직이는 스트라이프 */
.cum-prep{flex:1;background:repeating-linear-gradient(-45deg,#cfdff9 0 .5vw,#e9f1fd .5vw 1vw);background-size:1.42vw 100%;animation:crawl 1.1s linear infinite;display:flex;align-items:center;justify-content:center;color:#2c4f96;font-size:.74vw;font-weight:700;white-space:nowrap}
@keyframes crawl{to{background-position:1.42vw 0}}
/* 이월분 — 구축과 준비 사이의 중간 톤 세그먼트 */
.cum-mid{background:linear-gradient(90deg,#7ea8ec,#9fc0f3);display:flex;align-items:center;justify-content:center;color:#fff;font-size:.72vw;font-weight:700;white-space:nowrap;flex-shrink:0}
/* 연차 목표 경계선(2차 0.9 | 3차 +2.1) */
.cum-sep{position:absolute;top:0;bottom:0;width:0;border-left:2px dashed rgba(255,255,255,.75);z-index:1}
.cum-cap{position:relative;height:1.15vw}
.cum-mark{position:absolute;transform:translateX(-50%);color:var(--muted);font-size:.72vw;font-weight:700;white-space:nowrap}
.cum-mark:before{content:"▲";display:block;text-align:center;font-size:.5vw;line-height:1;color:#b6c2d6}
.cum-mark.acc{color:var(--accent)}
.cum-mark.acc:before{color:var(--accent)}
.cum-mark.end{transform:none;right:0}
.cum-mark.end:before{text-align:right}
.srcline{color:var(--muted);font-size:.74vw;line-height:1.6;margin-top:.6vw}

/* ── 체크 행 ── */
.fx-row{display:flex;align-items:flex-start;gap:.6vw;background:var(--chip);border:1px solid var(--hair);border-radius:10px;padding:.65vw .95vw}
.fx-row .material-symbols-outlined{font-size:1.05vw;color:#10b981;flex-shrink:0;margin-top:.1vw}
.fx-row span:last-child{font-size:.87vw;color:var(--ink);font-weight:600;line-height:1.55;word-break:keep-all}

/* ── SPC 역할 — 기능 3타일 + 수익 활용 각주 ── */
.role-intro{color:var(--body);font-size:.9vw;line-height:1.7;word-break:keep-all;margin-bottom:.8vw}
.role-intro b{color:var(--ink);font-weight:700}
.role-intro .hl{color:var(--accent);font-weight:700}
.role3{display:grid;grid-template-columns:repeat(3,1fr);gap:.7vw}
.role{background:#fff;border:1px solid var(--hair);border-radius:11px;padding:.75vw .95vw;display:flex;align-items:center;gap:.65vw}
.role .role-no{width:1.4vw;height:1.4vw;border-radius:50%;background:var(--tint);color:var(--accent);font-size:.7vw;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.role .material-symbols-outlined{font-size:1.2vw;color:var(--accent);flex-shrink:0}
.role b{font-size:.84vw;color:var(--ink);font-weight:700;line-height:1.5;word-break:keep-all}
.role-ft{display:flex;align-items:flex-start;gap:.55vw;margin-top:.7vw;color:var(--body);font-size:.82vw;line-height:1.6;word-break:keep-all}
.role-ft .material-symbols-outlined{font-size:1vw;color:var(--accent);flex-shrink:0;margin-top:.1vw}
.role-ft b{color:var(--ink);font-weight:700}

/* ── 추진 단계(결론) — 번호 행 ── */
.concl{display:flex;flex-direction:column;gap:.5vw}
.concl-row{display:flex;align-items:center;gap:.7vw;background:#fff;border:1px solid var(--hair);border-radius:11px;padding:.6vw 1vw}
.concl-no{width:1.55vw;height:1.55vw;border-radius:50%;background:linear-gradient(135deg,#1d4ed8,#3b82f6);color:#fff;font-size:.74vw;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.concl-row span:last-child{font-size:.87vw;color:var(--ink);font-weight:600;line-height:1.55;word-break:keep-all}

/* ── 정상화 계획 — 좌 계획 레인 3행(번호·아이콘·스탯) / 우 딥네이비 KPI 카드 ── */
.norm{display:grid;grid-template-columns:1.22fr .78fr;gap:1.2vw;flex:1;min-height:0;align-items:stretch}
.plan{background:#fff;border:1px solid var(--hair);border-radius:16px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 6px 24px rgba(11,21,38,.05)}
.plan-row{flex:1;display:flex;align-items:center;gap:1.1vw;padding:1vw 1.5vw;border-bottom:1px solid var(--hair)}
.plan-row:last-child{border-bottom:none}
.plan-no{color:#c3ccda;font-size:1.45vw;font-weight:300;letter-spacing:.02em;width:2.2vw;flex-shrink:0}
.plan-ic{width:2.8vw;height:2.8vw;border-radius:50%;background:linear-gradient(180deg,#ffffff,#f6f9ff);border:1px solid #e3ebf7;color:var(--accent);display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 2px 5px rgba(11,21,38,.05),0 8px 18px rgba(37,99,235,.09)}
.plan-ic .material-symbols-outlined{font-size:1.35vw}
.plan-t{flex:1;min-width:0}
.plan-t b{display:block;color:var(--ink);font-size:1vw;font-weight:800;letter-spacing:-.01em}
.plan-t small{display:block;color:var(--muted);font-size:.8vw;line-height:1.6;margin-top:.18vw;word-break:keep-all}
.plan-meta{flex-shrink:0;text-align:right;display:flex;flex-direction:column;align-items:flex-end;gap:.2vw}
.plan-meta b{color:var(--accent);font-size:1.25vw;font-weight:900;letter-spacing:-.02em;line-height:1.1}
.plan-meta small{color:var(--muted);font-size:.7vw;font-weight:600}
/* 관리 체계 — 주간 운영 루프: 받아서(취합) → 하고(점검·보고) → 될거다(보완 반영) */
.plan-t .tag{margin-left:.5vw;vertical-align:middle}
.wflow{display:flex;align-items:center;gap:.4vw;flex-wrap:wrap;margin-top:.5vw}
.wchip{background:var(--chip);border:1px solid transparent;border-radius:9px;padding:.34vw .75vw}
.wchip b{display:block;color:var(--ink);font-size:.76vw;font-weight:700;white-space:nowrap}
.wchip small{display:block;color:var(--muted);font-size:.64vw;font-weight:600;white-space:nowrap;margin-top:.05vw}
.wchip.acc{background:var(--tint);border-color:var(--tint-line)}
.wchip.acc b{color:#1d4ed8}
.wflow>.material-symbols-outlined{font-size:.92vw;color:#c3ccda;flex-shrink:0}
/* 루프 종착 강조 — 3차년도 성과 달성 집중 */
.wgoal{background:linear-gradient(135deg,#1d4ed8,#3b82f6);color:#fff;border-radius:999px;padding:.36vw .95vw;font-size:.76vw;font-weight:800;white-space:nowrap;box-shadow:0 4px 12px rgba(29,78,216,.3);align-self:center}
/* 우측 — 딥네이비 KPI 카드 (표지 톤과 이어지는 고급 카드) */
.mcard{position:relative;overflow:hidden;border-radius:18px;background:radial-gradient(120% 140% at 82% -20%,#1d3f7d 0%,#102a58 55%,#0a1732 100%);padding:1.7vw 1.6vw;display:flex;flex-direction:column;justify-content:center;gap:.85vw;box-shadow:0 16px 40px rgba(8,17,32,.3)}
.mcard:before{content:"";position:absolute;width:15vw;height:15vw;border-radius:50%;right:-5vw;top:-6vw;background:radial-gradient(circle at 35% 32%,rgba(255,255,255,.13),transparent 62%)}
.mcard>*{position:relative}
.mcard-eyebrow{color:var(--accent-soft);letter-spacing:.32em;text-transform:uppercase;font-size:.64vw;font-weight:700}
.mcard-n{color:#fff;font-size:3.1vw;font-weight:900;letter-spacing:-.03em;line-height:1}
.mcard-n small{font-size:1.25vw;font-weight:800;margin-left:.2vw}
.mcard-l{color:rgba(191,209,238,.85);font-size:.84vw;line-height:1.6}
.mcard-cmp{display:flex;flex-direction:column;gap:.45vw;margin:.2vw 0}
.mcard-cmp-row{display:flex;align-items:center;gap:.55vw}
.mcard-cmp-row i{height:.55vw;border-radius:999px;background:rgba(255,255,255,.2);display:block;flex-shrink:0}
.mcard-cmp-row.big i{background:linear-gradient(90deg,#60a5fa,#93c5fd);box-shadow:0 0 12px rgba(96,165,250,.45)}
.mcard-cmp-row span{color:rgba(191,209,238,.75);font-size:.7vw;font-weight:600;white-space:nowrap}
.mcard-cmp-row.big span{color:#fff;font-weight:800}
.mcard-hr{height:1px;background:rgba(127,168,232,.25)}
.mstep{background:rgba(255,255,255,.06);border:1px solid rgba(127,168,232,.3);border-radius:12px;padding:.65vw 1.05vw;-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px)}
.mstep b{display:block;color:#fff;font-size:.9vw;font-weight:700}
.mstep small{display:block;color:rgba(191,209,238,.75);font-size:.74vw;margin-top:.1vw;line-height:1.55}
.mstep.acc{background:rgba(37,99,235,.32);border-color:rgba(96,165,250,.6);box-shadow:0 6px 20px rgba(37,99,235,.28)}
.mstep-arr{align-self:center;color:rgba(127,168,232,.65);font-size:1.05vw}

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

// 분기 단계 컬럼 (일정 슬라이드) — 상단 점·라인 레일 + 아래 내용 카드
function Phase({
  q,
  t,
  items,
  final,
  now,
}: {
  q: string
  t: string
  items: string[]
  final?: boolean
  /** 현재 상태 노드 — 회색 점선 카드 */
  now?: boolean
}) {
  return (
    <div className={`phcol${now ? ' now' : ''}`}>
      <div className="step-line">
        <span className={`step-dot${final ? ' fill' : ''}${now ? ' gray' : ''}`} />
        <span className={`step-no${now ? ' gray' : ''}`}>{q}</span>
      </div>
      <div className={`ph${final ? ' final' : ''}${now ? ' nowcard' : ''}`}>
        <div className="ph-t">{t}</div>
        <ul className="ph-list">
          {items.map((it) => (
            <li key={it}>{it}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}

/* ─────────────────────────── 슬라이드 — 시나리오 5페이지 1:1 (목차 없음 — 사용자 지시) ─────────────────────────── */

const SLIDES: ReactNode[] = [
    /* ── 표지 ── */
    <div className="dark-stage" key="cover">
      <p className="cover-eyebrow">Ulsan-Mipo Energy Independence</p>
      <h1 className="cover-title">
        3차년도 사업 변경 신청 사전 보고
        <br />
        <span style={{ fontSize: '2.3vw', fontWeight: 300, opacity: 0.85 }}>(태양광 SPC 설립)</span>
      </h1>
      <p className="cover-sub">
        울산미포 에너지자급자족 인프라 구축 및 운영사업<br />
        태양광 SPC 설립 시기 — 3차년도(2026)에서 4차년도(2027년 상반기)로 조정
      </p>
      <div className="cover-meta">
        <img src="/images/rmsplatform-logo-white.png" alt="RMS PLATFORM" />
        <i />
        <span>2026. 07. 30</span>
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
          태양광 SPC 설립 시기를 <b>3차년도(2026년)에서 4차년도(2027년 상반기)로 조정</b>하고자 합니다.
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
          <p className="shift-d">협약상 당초 SPC 설립 예정 시기 — 지금 설립하면</p>
          <div className="shift-hr" />
          <div className="shift-li">
            <span className="material-symbols-outlined">search_off</span>
            <span>수요물량 미확보</span>
          </div>
          <div className="shift-li">
            <span className="material-symbols-outlined">money_off</span>
            <span>조기 설립 시 비효율 발생</span>
          </div>
          <div className="shift-li">
            <span className="material-symbols-outlined">warning</span>
            <span>본 사업 수요모집 차질</span>
          </div>
        </div>
        <div className="shift-mid">
          <span className="material-symbols-outlined">east</span>
        </div>
        <div className="shift-card now">
          <span className="shift-tag">변경 후</span>
          <div className="shift-yr">
            4차년도<small>2027년 상반기</small>
          </div>
          <p className="shift-d">사업 운영 기반 마련 후 설립</p>
          <div className="shift-hr" />
          <div className="shift-li">
            <span className="material-symbols-outlined">foundation</span>
            <span>발전물량 확보 등 사업 운영 기반이 마련되는 시점에 SPC 설립</span>
          </div>
          <div className="shift-li">
            <span className="material-symbols-outlined">autorenew</span>
            <span>안정적인 수익 창출 기반 위에 SPC 중심의 발전사업 운영 체계로 전환</span>
          </div>
        </div>
      </div>
      <div className="panel">
        <div className="block-label">
          <b>SPC의 역할</b>
        </div>
        <p className="role-intro">
          본 사업으로 구축된 태양광 발전시설(<b>전력거래형 4.2MW · 자가소비형 0.9MW</b>)의 지속적이고 안정적인{' '}
          <b>운영(20년)</b>과 장기적 수익관리 체계 확보를 위해 <span className="hl">독립 SPC 설립</span>을 추진 —{' '}
          <b>VPP 플랫폼 기반</b>으로 발전사업 운영과 데이터 관리 기능을 수행할 예정입니다.
        </p>
        <div className="role3">
          <div className="role">
            <span className="role-no">①</span>
            <span className="material-symbols-outlined">swap_horiz</span>
            <b>PPA(전력구매계약) 거래 및 정산관리</b>
          </div>
          <div className="role">
            <span className="role-no">②</span>
            <span className="material-symbols-outlined">monitoring</span>
            <b>주요 설비 운전상태 · 실시간 계측정보 모니터링</b>
          </div>
          <div className="role">
            <span className="role-no">③</span>
            <span className="material-symbols-outlined">query_stats</span>
            <b>설비 정보 관리 · 발전량 / 효율 분석</b>
          </div>
        </div>
        <div className="role-ft">
          <span className="material-symbols-outlined">payments</span>
          <span>
            ④ 발전 · PPA 거래로 발생하는 <b>전력판매 수익은 투자자금 상환과 운영비용으로 활용</b>하며, 설비의 장기적
            안정운영을 위해 <b>O&amp;M 수행 역량을 SPC 운영체계 내 반영</b>
          </span>
        </div>
      </div>
    </ContentSlide>,

    /* ── 2page : 변경 신청 요청 사유 ── */
    <ContentSlide
      key="p2"
      no="02"
      sec="변경 신청 사유"
      title={<>물량 없는 조기 설립 — <span className="hl">비용 부담과 수요모집 차질</span></>}
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
              전력거래용 태양광은 2차년도까지 0.33MW 구축. 3차년도 목표 2.1MW의 신규 계약을 준비 중 — 현재 컨소시엄
              전원이 수요모집에 집중
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
            본 사업 <span className="hl">수요모집 차질</span>
            <span className="q-cap">
              3차년도 설립 강행 시 역량이 분산 — 본 사업의 안정성 저하로 이어질 우려
            </span>
          </div>
        </div>
      </div>
      <div className="panel">
        <div className="block-label">
          <b>태양광 구축 실적 — 전체 목표 중 얼마나 했나</b>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1vw' }}>
          {/* 전력거래용 — SPC 관리 대상: 구축 0.33 + 이월분 0.57 + 3차 목표 2.1 준비 중 */}
          <div className="cum">
            <div className="cum-head">
              <b>전력거래용 태양광 (SPC 관리 대상)</b>
            </div>
            <div className="cum-bar">
              <div className="cum-done" style={{ width: '11%' }} />
              <div className="cum-mid" style={{ width: '19%' }}>이월분 0.57MW</div>
              <div className="cum-prep">준비 중 — 26년 하반기 수용가 확보 및 구축</div>
              <span className="cum-sep" style={{ left: '30%' }} />
            </div>
            <div className="cum-cap">
              <span className="cum-mark acc" style={{ left: '11%' }}>구축 0.33MW · 11%</span>
              <span className="cum-mark" style={{ left: '30%' }}>2차년도 목표 0.9MW</span>
              <span className="cum-mark end">전체 목표 3.0MW</span>
            </div>
          </div>
          {/* 자가소비형 — 참고: 전체 목표 0.9MW 기준 */}
          <div className="cum">
            <div className="cum-head">
              <b>자가소비형 태양광 (참고)</b>
            </div>
            <div className="cum-bar">
              <div className="cum-done" style={{ width: '64.4%' }} />
              <div className="cum-prep">잔여 0.32MW — 26년 하반기 확보 · 구축</div>
            </div>
            <div className="cum-cap">
              <span className="cum-mark acc" style={{ left: '64.4%' }}>구축 0.58MW · 64.4%</span>
              <span className="cum-mark end">전체 목표 0.9MW</span>
            </div>
          </div>
        </div>
        <p className="srcline">각 막대 = 해당 유형의 전체 목표(100%) 기준 · 출처: SPC 4차년도 변경 사유 보고서 — 태양광 수요발굴 추진 현황</p>
      </div>
    </ContentSlide>,

    /* ── 3page : 변경 후 추진 일정 및 사업 영향 ── */
    <ContentSlide
      key="p3"
      no="03"
      sec="변경 후 추진 일정"
      title={<>태양광 발전 물량 확보 우선(~26년) → <span className="hl">SPC 설립(27년~)</span></>}
      lede={
        <>
          발전 물량 확보에 우선 집중한 뒤, <b>안정적인 수익 창출 기반을 바탕으로 SPC 중심의 발전사업 운영 체계</b>로
          전환합니다.
        </>
      }
      fill
    >
      <div className="grow">
        <div className="block-label">
          <b>SPC 설립 추진 일정 (변경 후)</b>
        </div>
        <div className="phrow">
          <Phase
            now
            q="현재 · 26년 7월"
            t="태양광 수요모집"
            items={['태양광 발전시설 구축기관이 수용가 모집 추진']}
          />
          <Phase
            q="26년 3~4분기"
            t="태양광 발전 물량 확보 · SPC 설립 사전 검토"
            items={['구축 참여기관 외에도 PMO 기관을 중심으로 전 참여기관이 수용가 모집에 집중']}
          />
          <Phase
            final
            q="27년"
            t="SPC 설립 · SPC 중심 전력거래 개시"
            items={[
              '태양광 발전시설 구축 완료 (성과 목표 달성)',
              '태양광 발전사업 SPC 설립',
              '구축설비 이관 및 전력거래 개시 준비',
            ]}
          />
        </div>
      </div>
      <div>
        <div className="block-label">
          <b>추진 단계 (결론)</b>
        </div>
        <div className="concl">
          <div className="concl-row">
            <span className="concl-no">1</span>
            <span>
              SPC 설립 · 안정적 운영의 <b>핵심 선행조건</b>으로 태양광 수요 발굴 및 발전물량 확보 집중 추진
            </span>
          </div>
          <div className="concl-row">
            <span className="concl-no">2</span>
            <span>
              확보된 발전물량으로 발생하는 <b>안정적 수익 창출 기반</b>의 SPC 설립 및 발전사업 운영체계 구축
            </span>
          </div>
          <div className="concl-row">
            <span className="concl-no">3</span>
            <span>
              태양광 발전 설비 이관 및 <b>SPC 중심 운영체계 전환</b> 추진
            </span>
          </div>
        </div>
        <p className="srcline" style={{ marginTop: '.6vw' }}>
          ※ SPC 설립 관련 참여기관 간 협의 내용은 회의록 · 협약서 등으로 체계적으로 관리하고, 지분구조 · 출자방식 · 정관
          등 주요사항을 문서화하여 발전설비 구축 이후 SPC 운영 과정에서 발생할 수 있는 이슈를 최소화
        </p>
      </div>
    </ContentSlide>,

    /* ── 4page : 수요모집 정상화 계획 ── */
    <ContentSlide
      key="p4"
      no="04"
      sec="수요모집 정상화 계획"
      title={<>수요모집 <span className="hl">정상화 계획</span></>}
      lede={
        <>
          타겟 선별 · 유관기관 공동 대응 · PMO 관리 체계로 <b>3차년도 목표 2.67MW</b>를 달성하겠습니다.
        </>
      }
      fill
    >
      <div className="norm">
        {/* 좌 — 정상화 계획 4행 */}
        <div className="plan">
          <div className="plan-row">
            <span className="plan-no">01</span>
            <span className="plan-ic">
              <span className="material-symbols-outlined">ads_click</span>
            </span>
            <div className="plan-t">
              <b>산단 내 우선 접촉</b>
              <small>울산 미포국가산단 소재 기업을 우선 접촉하여 수용가 확보</small>
            </div>
          </div>
          <div className="plan-row">
            <span className="plan-no">02</span>
            <span className="plan-ic">
              <span className="material-symbols-outlined">travel_explore</span>
            </span>
            <div className="plan-t">
              <b>인근 산단 연계 검토</b>
              <small>산단 내부 수용가만으로 목표 달성이 어려울 가능성에 대비 — 필요 시 인근 산단과 연계한 수용가 확보 방안 검토</small>
            </div>
          </div>
          <div className="plan-row">
            <span className="plan-no">03</span>
            <span className="plan-ic">
              <span className="material-symbols-outlined">handshake</span>
            </span>
            <div className="plan-t">
              <b>공동 대응</b>
              <small>산업단지공단 울산지역본부 · 울산광역시 협력 — 입주기업 대상 합동 사업설명회 개최</small>
            </div>
          </div>
          <div className="plan-row">
            <span className="plan-no">04</span>
            <span className="plan-ic">
              <span className="material-symbols-outlined">fact_check</span>
            </span>
            <div className="plan-t">
              <b>관리 체계 — 주 단위 점검</b>
              <div className="wflow">
                <span className="wchip">
                  <b>영업 실적 취합</b>
                  <small>태양광 수용가 영업</small>
                </span>
                <span className="material-symbols-outlined">arrow_forward</span>
                <span className="wchip">
                  <b>주 단위 점검</b>
                  <small>기존 영업활동 범위 · 접촉 업체 수 · 상담 결과 · 전환 가능 물량 정량 파악</small>
                </span>
                <span className="material-symbols-outlined">arrow_forward</span>
                <span className="wchip acc">
                  <b>결과 반영 — 신규 수용가 물색 · 적극 영업</b>
                  <small>PMO 기관 · 태양광 구축 참여기관 협업 추진</small>
                </span>
                <span className="material-symbols-outlined">arrow_forward</span>
                <span className="wgoal">3차년도 성과 달성에 집중!</span>
              </div>
            </div>
          </div>
        </div>
        {/* 우 — 딥네이비 KPI 카드 (잔여 물량 + 마일스톤) */}
        <div className="mcard">
          <span className="mcard-eyebrow">Remaining Target</span>
          <div className="mcard-n">
            2.67<small>MW</small>
          </div>
          <p className="mcard-l">3차년도에 확보할 잔여 전력거래 물량 — 전체 목표 3.0MW 중 구축 0.33MW</p>
          <div className="mcard-hr" />
          <div className="mstep">
            <b>26년 하반기 — 수용가 확보 및 구축</b>
            <small>산단 내 우선 접촉 · 인근 산단 연계 · 유관기관 합동 수요모집</small>
          </div>
          <span className="mstep-arr material-symbols-outlined">arrow_downward</span>
          <div className="mstep acc">
            <b>3차년도 성과 목표 달성</b>
            <small>PMO · 태양광 구축 참여기관 협업 — 성과 달성에 집중</small>
          </div>
        </div>
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
