'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// 울산미포 에자자 3차년도 중간점검 — 2026.07.30  (에디토리얼 스타일)
// 원본 자료: "[울산미포에자자] 3차년도 킥오프 발표자료_v1.0.pptx" · "킥오프 발표 시나리오.docx"
//   · "에자자 중간점검 일정통보(공문).pdf" ('26.6월 말 기준 실적 점검, 7.30 13:30)
// 구성(사용자 지정): 표지 → ①추진일정(원본 4p) → ②2차년도 추진성과(원본 5~7p) + 성과지표(원본 8p)
//   → ③3차년도 성과지표(원본 9p 중 1)·5)·10)만) → ④3차년도 추진현황 5개(좌 카드 + 우 순환 사진) → 마무리
// 피드백 반영(2026-07-27 2차):
//   · 추진일정: 간트의 연차 헤더 제거(위 로드맵 카드가 헤더) — 트랙 전폭으로 위 카드 열과 정렬,
//     행 라벨은 트랙 위 한 줄. 연료전지 = 라벨 1개 + RPS/CHPS 2트랙(계약 체결 세로 스팬 · 유형 라벨은 막대 앞)
//   · 2차년도 성과: 원본 표 구조(구분/추진경과/비고) 그대로 — RPS · CHPS 분리 6행, 비고 열 복원,
//     ESG 플랫폼은 원본 8단계 전부. 박스 나열 대신 헤어라인 행 구조
//   · 5페이지: 좌우 1:1 (demo-v2 .feat와 동일 비율)
// 사진: /images/260730_midterm/ — 원본은 images/3차년도(사용자 제공), 플랫폼 2장은 260730_demo에서 복사
//   fuelcell · solar-01/02 · orc-01/02 · platform-01/02 · v2g (SHOW_ITEMS.files에 등록하면 자동 순환)
// 디자인: 260730_spc/demo-v2와 동일 — 페이지 로컬 CSS + 자체 플레이어
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

/* ── 연차 로드맵 스트립 = 간트의 연차 헤더 (아래 트랙과 같은 4열 축) ── */
.rmrow{display:flex;gap:.9vw;align-items:stretch}
.rmcol{flex:1;display:flex;flex-direction:column;min-width:0}
.step-line{display:flex;align-items:center;gap:.55vw;margin-bottom:.5vw}
.step-dot{width:.55vw;height:.55vw;border-radius:50%;border:2px solid var(--accent);background:var(--paper);flex-shrink:0}
.step-dot.fill{background:var(--accent)}
.step-no{color:var(--accent);font-size:.76vw;font-weight:800;letter-spacing:.06em;white-space:nowrap}
.step-line:after{content:"";flex:1;height:1px;background:var(--hair)}
.rmcol:last-child .step-line:after{display:none}
.rm{flex:1;border:1px solid var(--hair);border-radius:12px;background:#fff;padding:.7vw 1vw;display:flex;flex-direction:column;gap:.3vw;justify-content:center}
.rm.done{background:var(--chip)}
.rm.cur{border:1.5px solid #93c5fd;background:linear-gradient(180deg,#ffffff,#f7faff);box-shadow:0 8px 24px rgba(37,99,235,.12)}
.rm-t{color:var(--ink);font-size:.92vw;font-weight:800;letter-spacing:-.01em;line-height:1.35;display:flex;align-items:center;gap:.5vw;flex-wrap:wrap}
.rm-d{color:var(--body);font-size:.78vw;line-height:1.55;word-break:keep-all}
/* 1차년도는 원본처럼 좁게 — 아래 간트의 13% 열과 같은 축 */
.rmcol.y1{flex:.45}

/* ── 간트 — 트랙 전폭(위 로드맵 카드와 같은 축), 행 라벨은 트랙 위 한 줄 ── */
.gantt{flex:1;min-height:0;display:flex;flex-direction:column;gap:.4vw}
.g-bodywrap{position:relative;flex:1;min-height:0;display:flex;flex-direction:column;justify-content:space-between;gap:.45vw}
.g-curband{position:absolute;top:-.3vw;bottom:-.3vw;left:42%;width:29%;background:rgba(37,99,235,.05);border-radius:10px;pointer-events:none}
.g-grp-t{display:flex;align-items:center;gap:.7vw;margin-bottom:.15vw;position:relative}
.g-grp-t b{color:#1d4ed8;font-size:.74vw;font-weight:800;white-space:nowrap;background:var(--tint);border:1px solid var(--tint-line);border-radius:999px;padding:.08vw .7vw}
.g-grp-t:after{content:"";flex:1;height:1px;background:var(--hair)}
.g-item{position:relative;margin-top:.3vw}
.g-name{display:flex;align-items:baseline;gap:.5vw;margin-bottom:.22vw}
.g-name b{color:var(--ink);font-size:.76vw;font-weight:800}
.g-name small{color:var(--muted);font-size:.62vw;font-weight:600}
.g-stack{position:relative;display:flex;flex-direction:column;gap:.26vw}
.g-track{position:relative;height:1.58vw;background:#eef1f7;border-radius:6px;background-image:linear-gradient(90deg,transparent calc(13% - 1px),#dde3ee calc(13% - 1px),#dde3ee 13%,transparent 13%),linear-gradient(90deg,transparent calc(42% - 1px),#dde3ee calc(42% - 1px),#dde3ee 42%,transparent 42%),linear-gradient(90deg,transparent calc(71% - 1px),#dde3ee calc(71% - 1px),#dde3ee 71%,transparent 71%)}
.g-seg{position:absolute;top:0;bottom:0;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:.63vw;font-weight:700;white-space:nowrap;overflow:hidden;padding:0 .35vw;letter-spacing:-.01em}
.g-seg.plan{background:#dbe7f8;color:#2c4f96}
.g-seg.build{background:linear-gradient(90deg,#1d4ed8,#3b82f6);color:#fff}
.g-seg.run{background:#0f2a5f;color:#cfe0fb}
.g-seg.float{top:14%;bottom:14%;background:linear-gradient(90deg,#1d4ed8,#3b82f6);color:#fff;border:1.5px solid #fff;z-index:2;box-shadow:0 2px 8px rgba(29,78,216,.35)}
.g-seg.ghost{background:transparent;color:var(--muted);font-weight:800;justify-content:flex-end;overflow:visible}
.g-seg.type{background:#1e40af;color:#fff;font-weight:800;letter-spacing:.02em}
/* 구축 완료 시점 마커 — 원본의 빨간 '구축' 벌룬 */
.g-mark{position:absolute;top:50%;transform:translate(-50%,-50%);z-index:4;background:#ef4444;color:#fff;font-size:.58vw;font-weight:800;border-radius:999px;padding:.1vw .5vw;border:1.5px solid #fff;box-shadow:0 2px 8px rgba(239,68,68,.45);white-space:nowrap}
.g-dots{position:absolute;top:50%;border-top:2px dotted #b6c2d6;z-index:1}
.g-cross{position:absolute;top:4%;bottom:4%;border-radius:6px;background:#dbe7f8;color:#2c4f96;display:flex;align-items:center;justify-content:center;font-size:.66vw;font-weight:800;z-index:2;box-shadow:0 2px 6px rgba(11,21,38,.08)}
.g-now{position:absolute;top:-.35vw;bottom:-.1vw;width:0;border-left:2px dashed #f59e0b;z-index:3;left:57.7%}
.g-now:after{content:"현재";position:absolute;bottom:-1.3vw;left:50%;transform:translateX(-50%);background:#f59e0b;color:#fff;font-size:.62vw;font-weight:800;border-radius:999px;padding:.08vw .55vw;white-space:nowrap}
.g-legend{display:flex;gap:1vw;justify-content:flex-end;margin-top:.9vw}
.g-legend span{display:inline-flex;align-items:center;gap:.4vw;color:var(--muted);font-size:.68vw;font-weight:600}
.g-legend i{width:.85vw;height:.55vw;border-radius:3px;display:inline-block}
.g-legend i.plan{background:#dbe7f8}
.g-legend i.build{background:linear-gradient(90deg,#1d4ed8,#3b82f6)}
.g-legend i.run{background:#0f2a5f}
.g-legend i.mark{background:#ef4444;border-radius:999px;width:.65vw;height:.65vw}

/* ── 2차년도 추진성과 — 원본 표 구조(구분 · 추진경과 · 비고)를 헤어라인 행으로 ── */
.perf{display:grid;grid-template-columns:2fr 1fr;gap:1.1vw;flex:1;min-height:0;align-items:stretch}
.exp{border:1px solid var(--hair);border-radius:14px;background:#fff;padding:.2vw 1.2vw .4vw;display:flex;flex-direction:column;min-width:0;box-shadow:0 6px 20px rgba(11,21,38,.04)}
.exp-r{display:grid;grid-template-columns:9.8vw 1fr 10.6vw;gap:1.1vw;align-items:center;padding:.5vw 0;border-top:1px solid var(--hair);flex:1;min-height:0}
.exp-r.hd{border-top:none;flex:0 0 auto;padding:.5vw 0 .3vw}
.exp-r.hd span{font-size:.64vw;color:var(--muted);font-weight:800;letter-spacing:.1em}
.exp-cat{display:block;font-size:.58vw;color:var(--accent);font-weight:800;letter-spacing:.05em;margin-bottom:.14vw}
.exp-name b{display:block;font-size:.84vw;color:var(--ink);font-weight:800;line-height:1.3;letter-spacing:-.01em}
.exp-name small{display:block;font-size:.64vw;color:var(--muted);font-weight:600;margin-top:.1vw}
.ms{display:flex;flex-wrap:wrap;gap:.45vw 1.2vw;min-width:0;align-content:center}
.ms-i{min-width:0}
.ms-i b{display:block;font-size:.6vw;color:var(--accent);font-weight:800;letter-spacing:.02em}
.ms-i span{display:block;font-size:.71vw;color:var(--body);font-weight:600;line-height:1.4;margin-top:.08vw;word-break:keep-all}
.ms-i.warn b{color:#b45309}
.ms-i.warn span{color:#92400e}
.exp-note{border-left:1px solid var(--hair);padding-left:1vw;font-size:.7vw;color:var(--body);line-height:1.6;word-break:keep-all;align-self:center}
.exp-note b{color:var(--ink);font-weight:700}
.exp-note .tag{margin-top:.3vw}

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

/* ── 3차년도 성과지표 표 (1) · 5) · 10) 만) ── */
.tblwrap{flex:1;min-height:0;border:1px solid var(--hair);border-radius:14px;overflow:hidden;background:#fff;box-shadow:0 6px 20px rgba(11,21,38,.04)}
.tbl{width:100%;height:100%;border-collapse:collapse;table-layout:fixed}
.tbl th{background:var(--accent);color:#fff;font-size:.82vw;font-weight:700;padding:.55vw .9vw;text-align:left;letter-spacing:.01em}
.tbl th.c,.tbl td.c{text-align:center}
.tbl td{font-size:.84vw;color:var(--body);padding:.5vw .9vw;border-top:1px solid var(--hair);line-height:1.45;word-break:keep-all}
.tbl td b{color:var(--ink);font-weight:700}
.tbl tr.grp td{background:var(--tint);color:#1d4ed8;font-size:.8vw;font-weight:800;padding:.45vw .9vw;border-top:1px solid var(--tint-line)}
.tbl td.num{text-align:center;font-variant-numeric:tabular-nums;font-size:.95vw}
.tbl td.num.goal{color:var(--accent);font-weight:800}
.tbl td.num.carry{color:#b45309;font-weight:700;font-size:.88vw}
.tbl td.dim{color:#b6c2d6;text-align:center}
.tbl td.scope{color:var(--muted);font-size:.76vw}

/* ── 3차년도 추진현황 — 좌 카드 5 + 우 순환 사진 (demo-v2와 동일 1:1) ── */
.feat{display:grid;grid-template-columns:1fr 1fr;gap:1.1vw;flex:1;min-height:0;align-items:stretch}
.lk-cards{display:flex;flex-direction:column;gap:.6vw;justify-content:center;min-width:0}
.lk-card{display:flex;align-items:center;gap:.85vw;background:#fff;border:1px solid var(--hair);border-radius:13px;padding:.6vw 1vw;box-shadow:0 2px 5px rgba(11,21,38,.04),0 10px 22px rgba(37,99,235,.07);transition:border-color .35s,box-shadow .35s,background .35s;flex:1;min-height:0}
.lk-card.on{border-color:#93c5fd;background:linear-gradient(180deg,#ffffff,#f5f9ff);box-shadow:0 8px 24px rgba(37,99,235,.16)}
.lk-ic{width:2.4vw;height:2.4vw;border-radius:50%;background:var(--tint);color:var(--accent);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.lk-ic .material-symbols-outlined{font-size:1.2vw}
.lk-t{flex:1;min-width:0}
.lk-t b{display:block;font-size:.9vw;color:var(--ink);font-weight:800;letter-spacing:-.01em}
.lk-t small{display:block;font-size:.72vw;color:var(--body);margin-top:.14vw;line-height:1.5;word-break:keep-all}
.lk-card .tag{flex-shrink:0}
/* 우측 — 사진 크로스페이드 (dots 포함) */
.shot{position:relative;border-radius:14px;overflow:hidden;border:1px solid var(--hair);background:#0a1220;box-shadow:0 10px 28px rgba(11,21,38,.12);min-height:0}
.shot img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;opacity:0;transition:opacity .7s ease}
.shot img.on{opacity:1}
.shot-ph{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.5vw;background:#0e1a30;color:#5b6b86;opacity:0;transition:opacity .7s ease;text-align:center;padding:1.5vw}
.shot-ph.on{opacity:1}
.shot-ph .material-symbols-outlined{font-size:2.4vw}
.shot-ph b{font-size:.9vw;font-weight:700;color:#8194b3}
.shot-ph small{font-size:.76vw;letter-spacing:.02em}
.shot-cap{position:absolute;left:0;right:0;bottom:0;padding:1.6vw 1.2vw .65vw;background:linear-gradient(180deg,transparent,rgba(4,10,25,.82));display:flex;align-items:center;gap:.7vw;z-index:1}
.shot-cap b{color:#fff;font-size:.9vw;font-weight:800}
.shot-cap small{color:rgba(191,209,238,.8);font-size:.72vw}
.shot-dots{position:absolute;bottom:.7vw;right:.9vw;display:flex;gap:.4vw;z-index:2}
.shot-dots i{width:.45vw;height:.45vw;border-radius:50%;background:rgba(255,255,255,.35);transition:background .3s,transform .3s}
.shot-dots i.on{background:#fff;transform:scale(1.25)}

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

/* ── 간트 세그먼트 — 축: 1차년도(2024) 0~13% · 이후 연 29%씩 (위 로드맵 카드와 같은 비율) ── */
type Seg = { l: number; w: number; t: string; tone: 'plan' | 'build' | 'run' | 'float' | 'ghost' | 'type' }

// marks: 구축 완료 시점(%) — 원본의 빨간 '구축' 벌룬
function Track({ segs, marks }: { segs: Seg[]; marks?: number[] }) {
  return (
    <div className="g-track">
      {segs.map((g) => (
        <span key={g.t + g.l} className={`g-seg ${g.tone}`} style={{ left: `${g.l}%`, width: `${g.w}%` }}>
          {g.t}
        </span>
      ))}
      {marks?.map((m) => (
        <span key={m} className="g-mark" style={{ left: `${m}%` }}>
          구축
        </span>
      ))}
    </div>
  )
}

function GanttItem({ b, s, segs, marks }: { b: string; s?: string; segs: Seg[]; marks?: number[] }) {
  return (
    <div className="g-item">
      <div className="g-name">
        <b>{b}</b>
        {s && <small>{s}</small>}
      </div>
      <Track segs={segs} marks={marks} />
    </div>
  )
}

/* ── 2차년도 경과 행 — 원본 표 구조: 구분(명칭) · 추진경과(월별) · 비고 ── */
function ExpRow({
  cat,
  name,
  sub,
  steps,
  note,
}: {
  cat: string
  name: string
  sub?: string
  steps: { m: string; t: string; warn?: boolean }[]
  note: ReactNode
}) {
  return (
    <div className="exp-r">
      <div className="exp-name">
        <span className="exp-cat">{cat}</span>
        <b>{name}</b>
        {sub && <small>{sub}</small>}
      </div>
      <div className="ms">
        {steps.map((st) => (
          <div key={st.m + st.t} className={`ms-i${st.warn ? ' warn' : ''}`}>
            <b>{st.m}</b>
            <span>{st.t}</span>
          </div>
        ))}
      </div>
      <div className="exp-note">{note}</div>
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

/* ── 3차년도 추진현황 — 좌 카드 5개가 우측 순환 사진과 동기 하이라이트 (demo-v2 방식) ── */
// files: 항목당 여러 장 가능 — 전부 순환하고, 보이는 사진의 카드가 하이라이트된다
const SHOW_ITEMS = [
  {
    ic: 'bolt',
    t: '연료전지 발전',
    s: 'RPS형 1호 상업운전 개시(’26.04) · REC 발급 — CHPS형 3호 8월 시운전, 12월 상업운전 예정',
    tag: '상업운전 · 건설 중',
    tone: 'blue' as const,
    files: ['fuelcell.png'],
    suggest: '연료전지동 전경 · 설비 사진',
  },
  {
    ic: 'solar_power',
    t: '태양광 발전',
    s: '0.91MW 구축 완료 · 운영 — 잔여 2.99MW 확보 위한 신규 수요기업 발굴 · 사업성 검토',
    tag: '수용가 발굴 중',
    tone: 'blue' as const,
    files: ['solar-01.png', 'solar-02.png'],
    suggest: '수용가 지붕 태양광 설치 현장',
  },
  {
    ic: 'device_thermostat',
    t: 'ORC 발전',
    s: '모듈 운송 · 토목 · 철골 · Dry Cooler 설치 완료, 배관 자재 입고 중 — 1MW 상업운전 후 1.8MW 구축',
    tag: '구축 중',
    tone: 'blue' as const,
    files: ['orc-01.png', 'orc-02.jpg'],
    suggest: 'ORC 발전시설 공사 현장',
  },
  {
    ic: 'monitoring',
    t: '통합에너지관리 시스템',
    s: '페르소나별 화면 기획 · 구성 — RE100 이행관리 · ESG 성과관리 등 주요 기능 기획 및 개발',
    tag: '개발 추진 중',
    tone: 'blue' as const,
    files: ['platform-01.png', 'platform-02.png'],
    suggest: 'ESG 에너지 플랫폼 화면 캡처',
  },
  {
    ic: 'ev_station',
    t: 'V2G · ESS 분산에너지 실증',
    s: '장비심의 완료(’26.07) · 조달공고 — 10~11월 V2G 6기 · ESS 설치, 12월 실증운영 개시',
    tag: '발주 추진',
    tone: 'amber' as const,
    files: ['v2g.png'],
    suggest: '통합안전관리센터 설치 예정지',
  },
]

// 항목별 files를 프레임 시퀀스로 평탄화 — 프레임이 넘어가면 해당 항목 카드가 켜진다
const FRAMES = SHOW_ITEMS.flatMap((it, item) =>
  it.files.map((f) => ({ item, src: `/images/260730_midterm/${f}`, file: f }))
)

function Showcase() {
  const [i, setI] = useState(0)
  const [failed, setFailed] = useState<Record<number, boolean>>({})
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % FRAMES.length), 4000)
    return () => clearInterval(t)
  }, [])
  // 하이드레이션 전 404는 img onError를 놓치므로 클라이언트 프리로드로 확인 (demo-v2 방식)
  useEffect(() => {
    FRAMES.forEach((fr, idx) => {
      const im = new window.Image()
      im.onerror = () => setFailed((f) => ({ ...f, [idx]: true }))
      im.src = fr.src
    })
  }, [])
  const cur = SHOW_ITEMS[FRAMES[i].item]
  return (
    <div className="feat">
      <div className="lk-cards">
        {SHOW_ITEMS.map((it, idx) => (
          <div className={`lk-card${idx === FRAMES[i].item ? ' on' : ''}`} key={it.t}>
            <span className="lk-ic">
              <span className="material-symbols-outlined">{it.ic}</span>
            </span>
            <span className="lk-t">
              <b>{it.t}</b>
              <small>{it.s}</small>
            </span>
            <span className={`tag ${it.tone} live`}>
              <i />
              {it.tag}
            </span>
          </div>
        ))}
      </div>
      <div className="shot">
        {FRAMES.map((fr, idx) =>
          failed[idx] ? (
            <div key={fr.file} className={`shot-ph${idx === i ? ' on' : ''}`}>
              <span className="material-symbols-outlined">add_photo_alternate</span>
              <b>사진 대기 — {SHOW_ITEMS[fr.item].suggest}</b>
              <small>/images/260730_midterm/{fr.file}</small>
            </div>
          ) : (
            <img
              key={fr.file}
              src={fr.src}
              alt={`${SHOW_ITEMS[fr.item].t} 현장 사진`}
              className={idx === i ? 'on' : ''}
              onError={() => setFailed((f) => ({ ...f, [idx]: true }))}
            />
          )
        )}
        <div className="shot-cap">
          <b>{cur.t}</b>
          <small>{cur.tag}</small>
        </div>
        <div className="shot-dots">
          {FRAMES.map((_, idx) => (
            <i key={idx} className={idx === i ? 'on' : ''} />
          ))}
        </div>
      </div>
    </div>
  )
}

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

  /* ── 01 추진일정 (원본 4p) — 로드맵 카드가 연차 헤더, 아래 간트가 같은 4열 축으로 정렬 ── */
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
    {/* 연차 로드맵 = 간트 헤더 — 아래 트랙과 같은 축 (1차년도는 원본처럼 좁게) */}
    <div className="rmrow">
      <div className="rmcol y1">
        <div className="step-line">
          <span className="step-dot fill" />
          <span className="step-no">1차년도 · 2024</span>
        </div>
        <div className="rm done">
          <p className="rm-d">분석 &amp; 검토 &amp; 협의 등 인프라 구축 기반 마련</p>
        </div>
      </div>
      <div className="rmcol">
        <div className="step-line">
          <span className="step-dot fill" />
          <span className="step-no">2차년도 · 2025</span>
        </div>
        <div className="rm done">
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
            에너지 자급자족 인프라 운영 및 플랫폼 연계
            <span className="tag blue live">
              <i />
              진행 중
            </span>
          </div>
        </div>
      </div>
      <div className="rmcol">
        <div className="step-line">
          <span className="step-dot" />
          <span className="step-no">4차년도 · 2027~</span>
        </div>
        <div className="rm">
          <p className="rm-d">인프라 운영 및 특화모델 발굴, 플랫폼 고도화 · 지속</p>
        </div>
      </div>
    </div>

    {/* 인프라별 추진 간트 — 위 로드맵 카드와 같은 1~4차년도 축 (연차 표기는 위에서 한 번만) */}
    <div className="gantt">
      <div className="g-bodywrap">
        <span className="g-curband" />
        <span className="g-now" />
        <div>
          <div className="g-grp-t">
            <b>신재생에너지 인프라</b>
          </div>
          {/* 연료전지 — 항목은 하나: RPS/CHPS 2트랙(각 막대 앞 유형 칩), 계약 체결(1차년도)은 두 트랙에 걸침 */}
          <div className="g-item">
            <div className="g-name">
              <b>연료전지 발전</b>
              <small>울산하이드로젠파워 1호 · 3호</small>
            </div>
            <div className="g-stack">
              <span className="g-dots" style={{ left: '0%', width: '2.5%' }} />
              <span className="g-cross" style={{ left: '3%', width: '9%' }}>
                계약 체결
              </span>
              <Track
                segs={[
                  { l: 13, w: 4.2, t: 'RPS', tone: 'type' },
                  { l: 17.4, w: 33.1, t: '설치 및 시운전', tone: 'build' },
                  { l: 50.7, w: 49.3, t: '상업운전', tone: 'run' },
                ]}
                marks={[50.7]}
              />
              <Track
                segs={[
                  { l: 32.3, w: 4.8, t: 'CHPS', tone: 'type' },
                  { l: 37.3, w: 31.3, t: '설치 및 시운전', tone: 'build' },
                  { l: 68.8, w: 31.2, t: '상업운전', tone: 'run' },
                ]}
                marks={[68.8]}
              />
            </div>
          </div>
          {/* 태양광 — 운영 막대 배경 + 구축(3차모집대상) 겹침 (원본 방식) */}
          <GanttItem
            b="태양광 발전"
            s="자가소비형 · 전력거래형"
            segs={[
              { l: 13, w: 21.8, t: '대상지 선정 & 설계', tone: 'plan' },
              { l: 34.8, w: 6, t: '구축(1차)', tone: 'build' },
              { l: 46.8, w: 19.4, t: '구축(2차모집대상)', tone: 'build' },
              { l: 66.2, w: 33.8, t: '운영', tone: 'run' },
              { l: 73, w: 17, t: '구축(3차모집대상)', tone: 'float' },
            ]}
            marks={[40.8]}
          />
        </div>
        <div>
          <div className="g-grp-t">
            <b>통합에너지 관리 시스템</b>
          </div>
          <GanttItem
            b="ESG 에너지 플랫폼"
            segs={[
              { l: 13, w: 19.3, t: '분석 & 설계', tone: 'plan' },
              { l: 32.3, w: 24.2, t: '구축(개발)', tone: 'build' },
              { l: 56.5, w: 43.5, t: '운영 및 고도화', tone: 'run' },
            ]}
            marks={[56.5]}
          />
        </div>
        <div>
          <div className="g-grp-t">
            <b>신재생인프라 연계 탄소중립 지원</b>
          </div>
          <GanttItem
            b="ORC 발전"
            s="연료전지 발전배열 활용"
            segs={[
              { l: 13, w: 29, t: '제조사 선정 & 발주 및 제작', tone: 'plan' },
              { l: 42, w: 24.2, t: '구축 및 시운전', tone: 'build' },
              { l: 66.2, w: 33.8, t: '상업운전', tone: 'run' },
            ]}
            marks={[66.2]}
          />
          {/* 양방향 EV충전 — 운영 배경 + 구축(증설) 겹침 (원본 방식) */}
          <GanttItem
            b="양방향 EV충전"
            s="V2G · ESS"
            segs={[
              { l: 13, w: 9.7, t: '분석 & 검토', tone: 'plan' },
              { l: 22.7, w: 9.6, t: '설계', tone: 'plan' },
              { l: 32.3, w: 36.5, t: '구축', tone: 'build' },
              { l: 68.8, w: 31.2, t: '운영', tone: 'run' },
              { l: 72, w: 14, t: '구축(증설)', tone: 'float' },
            ]}
            marks={[68.8]}
          />
        </div>
      </div>
      <div className="g-legend">
        <span>
          <i className="plan" />
          분석 · 설계 · 계약
        </span>
        <span>
          <i className="build" />
          구축 · 시운전
        </span>
        <span>
          <i className="run" />
          운영 · 상업운전
        </span>
        <span>
          <i className="mark" />
          구축 완료 시점
        </span>
      </div>
    </div>
  </ContentSlide>,

  /* ── 02 2차년도 추진성과 (원본 5~7p 표 구조 그대로: 구분 · 추진경과 · 비고) + 성과지표 (원본 8p) ── */
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
      {/* 좌 2/3 — 원본 5 · 6 · 7p 표(구분/추진경과/비고)를 헤어라인 행으로 */}
      <div className="exp">
        <div className="exp-r hd">
          <span>구분</span>
          <span>추진경과</span>
          <span style={{ paddingLeft: '1vw' }}>비고</span>
        </div>
        <ExpRow
          cat="신재생에너지 인프라"
          name="연료전지 · RPS형"
          sub="울산하이드로젠파워 1호"
          steps={[
            { m: '’25.10', t: '연료전지동 설치 · 입고 완료' },
            { m: '’25.10', t: '시운전 시작' },
            { m: '’25.11', t: '송전선로 공사 완료' },
          ]}
          note={
            <>
              <b>19.8MW</b> 구축 후 시운전
            </>
          }
        />
        <ExpRow
          cat="신재생에너지 인프라"
          name="연료전지 · CHPS형"
          sub="울산하이드로젠파워 3호"
          steps={[
            { m: '’25.09', t: '기초 토목공사 진행' },
            { m: '’25.11', t: '연료전지동 구축 공사 진행' },
          ]}
          note={
            <>
              <b>19.8MW</b> 착공
            </>
          }
        />
        <ExpRow
          cat="신재생에너지 인프라"
          name="태양광 발전"
          sub="에스에너지"
          steps={[
            { m: '’25.06', t: '5개 업체 계약 완료' },
            { m: '’25.10', t: '현장검토 · 설계 완료 (총 0.91MW)' },
            { m: '’25.11', t: '착공 — 연내 구축 완료' },
          ]}
          note={
            <>
              <b>0.91MW</b> 구축 — 자가소비 5개 · 자가소비+PPA형 1개 업체
            </>
          }
        />
        <ExpRow
          cat="통합 에너지관리 시스템"
          name="ESG 에너지 플랫폼"
          sub="알엠에쓰플렛폼"
          steps={[
            { m: '’25.04~06', t: '정보구조도 · 메뉴구조도 설계' },
            { m: '’25.05~07', t: '디자인 시안 · 시각 가이드라인' },
            { m: '’25.06~08', t: '세부 프로세스(통합관제 · 컨설팅) 설계' },
            { m: '’25.08', t: '개발환경 설정 · 인터페이스 정의' },
            { m: '’25.09', t: '화면 디자인 · 퍼블리싱' },
            { m: '’25.10~11', t: '플랫폼 개발 구축' },
            { m: '’25.11', t: '테스트 시나리오 작성 · 수행' },
            { m: '’25.11', t: '상황실 구축 완료' },
          ]}
          note={
            <>
              모듈별 개발 방식 적용 — <b>일부 모듈 선개발</b> 진행
            </>
          }
        />
        <ExpRow
          cat="탄소저감 지원"
          name="ORC 발전시설"
          sub="울산미포ORC발전"
          steps={[
            { m: '’25.01~12', t: '기본 · 상세설계' },
            { m: '’25.01~', t: '모듈 · Dry cooler 등 주요 설비 제작' },
            { m: '’25.11', t: '모듈 FAT' },
            { m: '’25.03~12', t: '수요기업 발굴 · 계약 진행' },
          ]}
          note={
            <>
              특수목적법인 설립 및 수행기관 참여(’25.02~04)
            </>
          }
        />
        <ExpRow
          cat="탄소저감 지원"
          name="양방향 EV충전"
          sub="울산테크노파크"
          steps={[
            { m: '’25.06', t: '기본 · 실시설계' },
            { m: '’25.09', t: '장비심의 · 실시설계 준공 및 보완' },
            { m: '’25.12', t: 'PCS 구매 · 납품 완료' },
            { m: '유찰', t: '’26년 재추진 준비', warn: true },
          ]}
          note={
            <>
              V2G 충전기 · ESS <b>유찰에 따른 재추진(’26년)</b> 예정
            </>
          }
        />
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

  /* ── 03 성과지표 검토 (3차년도 — 원본 9p 중 1) · 5) · 10) 만) ── */
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
          <col style={{ width: '29%' }} />
          <col style={{ width: '15%' }} />
          <col style={{ width: '8%' }} />
          <col style={{ width: '11%' }} />
          <col style={{ width: '13%' }} />
          <col style={{ width: '24%' }} />
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
          <tr className="grp">
            <td colSpan={6}>신재생에너지 인프라 조성 — 1) 신재생에너지 인프라 구축</td>
          </tr>
          <tr>
            <td>
              <b>연료전지발전</b>
            </td>
            <td>롯데SK에너루트</td>
            <td className="c">MW</td>
            <td className="dim">–</td>
            <td className="num goal">19.8</td>
            <td className="scope">발전시설의 설치 여부</td>
          </tr>
          <tr>
            <td>
              <b>태양광발전 (자가소비형)</b>
            </td>
            <td>에스에너지</td>
            <td className="c">MW</td>
            <td className="num carry">0.32</td>
            <td className="dim">–</td>
            <td className="scope">발전시설의 설치 여부</td>
          </tr>
          <tr>
            <td>
              <b>태양광발전 (전력거래형)</b>
            </td>
            <td>에스에너지</td>
            <td className="c">MW</td>
            <td className="num carry">0.57</td>
            <td className="num goal">2.1</td>
            <td className="scope">발전시설의 설치 여부</td>
          </tr>
          <tr className="grp">
            <td colSpan={6}>통합 에너지관리 시스템 구축 — 5) 통합 에너지관리시스템 구축</td>
          </tr>
          <tr>
            <td>
              <b>ESG 에너지 플랫폼 구축률</b>
            </td>
            <td>알엠에쓰플렛폼</td>
            <td className="c">%</td>
            <td className="dim">–</td>
            <td className="num goal">30</td>
            <td className="scope">WBS 계획 대비 공정률</td>
          </tr>
          <tr className="grp">
            <td colSpan={6}>탄소저감 지원 — 10) 신재생에너지 인프라 연계</td>
          </tr>
          <tr>
            <td>
              <b>연료전지 발전배열 활용</b>
            </td>
            <td>울산미포ORC발전</td>
            <td className="c">MW</td>
            <td className="dim">–</td>
            <td className="num goal">1.8</td>
            <td className="scope">발전시설의 설치 여부</td>
          </tr>
          <tr>
            <td>
              <b>양방향 EV 충전기</b>
            </td>
            <td>울산테크노파크</td>
            <td className="c">대</td>
            <td className="num carry">4</td>
            <td className="num goal">2</td>
            <td className="scope">충전기 설치 여부</td>
          </tr>
        </tbody>
      </table>
    </div>
  </ContentSlide>,

  /* ── 04 3차년도 추진현황 — 좌 카드 5 + 우 순환 사진 (원본 11~15p) ── */
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
    <Showcase />
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
