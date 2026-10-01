'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import PptExportButton from '@/components/PptExport'
import type { ReactNode } from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// 에너지 개념 정리 (2026-10-01) — 개인 학습 · 개념 정리 (지역 무관, 공부용)
//
//   원천 ① 사용자 설명(2026-10-01) ② '태양광·ESS 통합 설계 가이드.pdf'(2p) — PDF 두 장은 구성·문구를 그대로 옮김
//        ③ '전건호와 함께한 에너지 개념정리'(2026-10-01 구두 설명 전사, 24분) — 비유·설명을 그대로 옮김
//     00 기본 원칙 — 모든 판단의 첫 질문은 "탄소가 배출되는가"                      (①)
//     01 태양광   — (a) 발전설비: 햇빛에서 전력 사용까지 — 5설비 흐름·DC/AC·설치 유형·용어   (PDF p1)
//                   (b) DC와 AC — 태양광은 DC, 쓰는 전기는 AC, 인버터가 바꾼다               (③)
//                   (c) 전기실(수배전반·계량기)과 분기점 — 자가소비 / 계통 송전              (③)
//                   (d) 자가소비 · 리스 · PPA, 온사이트/오프사이트(한전 망 사용 여부)         (①)
//                   (e) kW와 kWh — 설치한 크기와 만들어 낸 양, 왜 kWh를 보나                 (③)
//     02 태양열   — 집열판+축열탱크(사진). 공공시설·요양원·어린이집: 전기 절감보다 24시간 온수 (①)
//     03 지열     — 땅속 평균 13℃를 열원으로 쓰는 냉난방(에어컨 원리). 실외기 없음 → 공공·신축 (①)
//     04 연료전지 — 가스(바이오 등) → 수소 100%로 구동. 수소 구매도 쟁점. 가스 요금·입찰시장 링크 (①)
//     05 ESS      — (a) 구성 5요소 · 24시간 충·방전 곡선 · 활용 4 · 수집 데이터              (PDF p2)
//                   (b) 대용량 핸드폰 배터리, 다른 점은 '연결' — 랙·PCS·BMS·PMS·EMS 심화     (③)
//                   (c) 왜 선 하나로 양방향인가 — 전력 = 전압 × 전류                        (③)
//                   (d) 경·중간·최대부하와 EMS의 시나리오 판단 — 규칙이 아니라 AI            (③)
//                   (e) 수집 데이터 6가지가 각각 어떤 판단에 쓰이나                         (③)
//
//   삽화: PDF에서 잘라낸 아이소메트릭 설비 그림 — public/images/261001/guide/*.png
//   표기: "전달값" = 사용자가 현장에서 들은 수치(원문 미확인) · 링크 = 공식 사이트에서 확인한 값
//   상세 규칙: CLAUDE.md §3.4 · docs/style-reference.md · 빈 템플릿 common/260430_blank
// ─────────────────────────────────────────────────────────────────────────────

const CSS = `
:root{--accent:#2563eb;--accent-soft:#7fa8e8;--ink:#0b1526;--body:#3e4c5e;--muted:#8a94a6;--hair:#e6eaf2;--paper:#fbfcfe;--card:#ffffff;--chip:#f5f7fb;--tint:#eff6ff;--tint-line:#bfdbfe;--amber:#b45309;--green:#047857;--violet:#6d28d9;--navy1:#0a162e;--navy2:#12264d}
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

/* ── 표지 ── */
.cover-eyebrow{color:var(--accent-soft);letter-spacing:.42em;text-transform:uppercase;font-size:.72vw;font-weight:600;margin-bottom:1.7vw;position:relative;z-index:1}
.cover-title{color:#fff;font-size:3.9vw;font-weight:900;letter-spacing:-.02em;line-height:1.18;margin-bottom:1.2vw;position:relative;z-index:1}
.cover-sub{color:rgba(191,209,238,.85);font-size:1.12vw;font-weight:300;line-height:1.75;margin-bottom:3.2vw;position:relative;z-index:1}
.cover-meta{display:flex;align-items:center;gap:1vw;color:rgba(148,168,200,.85);font-size:.82vw;position:relative;z-index:1}
.cover-meta img{height:1.35vw;filter:brightness(0) invert(1);opacity:.9}
.cover-meta i{width:3px;height:3px;border-radius:50%;background:rgba(148,168,200,.5)}

/* ── 마무리 ── */
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
.trow{display:flex;align-items:center;gap:1.6vw;padding:.85vw .4vw;border-bottom:1px solid var(--hair);transition:background .2s;cursor:pointer}
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

/* ── 탄소 축 (첫 질문) — 질문 노드 + 세 갈래 ── */
.axis{display:grid;grid-template-columns:1fr 1.1fr 1fr;gap:1vw}
.axis-col{background:var(--card);border:1px solid var(--hair);border-radius:14px;padding:1.1vw 1.25vw;display:flex;flex-direction:column}
.axis-h{display:flex;align-items:center;gap:.5vw;margin-bottom:.3vw}
.axis-h b{color:var(--ink);font-size:.95vw;font-weight:800}
.axis-h i{width:.5vw;height:.5vw;border-radius:50%}
.axis-col.yes .axis-h i{background:#10b981}
.axis-col.dep .axis-h i{background:#f59e0b}
.axis-col.cond .axis-h i{background:#94a3b8}
.axis-d{color:var(--muted);font-size:.74vw;line-height:1.6;margin-bottom:.9vw}
.axis-list{display:flex;flex-direction:column;gap:.5vw;flex:1}
.src{display:flex;align-items:center;gap:.7vw;background:var(--chip);border-radius:10px;padding:.55vw .8vw}
.src .material-symbols-outlined{font-size:1.2vw;color:var(--accent)}
.src b{color:var(--ink);font-size:.84vw;font-weight:700;display:block}
.src small{color:var(--muted);font-size:.68vw;display:block;margin-top:.08vw}
.q{display:flex;align-items:center;gap:1vw;background:var(--tint);border:1px solid var(--tint-line);border-radius:14px;padding:.9vw 1.3vw}
.q-ic{width:2.6vw;height:2.6vw;border-radius:50%;background:var(--accent);color:#fff;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.q-ic .material-symbols-outlined{font-size:1.4vw}
.q-t{color:var(--ink);font-size:1.15vw;font-weight:800}
.q-d{color:var(--body);font-size:.8vw;margin-top:.15vw}

/* ── 모델 카드 (태양광 3모델) ── */
.models{display:grid;grid-template-columns:repeat(3,1fr);gap:1vw}
.model{background:var(--card);border:1px solid var(--hair);border-radius:14px;padding:1vw 1.2vw}
.model-h{display:flex;align-items:center;gap:.6vw;margin-bottom:.6vw}
.model-h .fcard-ic{width:2vw;height:2vw}
.model-h b{color:var(--ink);font-size:.98vw;font-weight:800}
.spec-row{display:flex;gap:.8vw;font-size:.78vw;line-height:1.55;padding:.3vw 0;border-bottom:1px solid var(--hair)}
.spec-row:last-child{border-bottom:none}
.spec-k{width:3.6vw;flex-shrink:0;color:var(--muted);font-weight:700}
.spec-v{color:var(--body)}
.spec-v b{color:var(--ink)}

/* ── 경로 다이어그램 (온사이트/오프사이트) ── */
.routes{display:grid;grid-template-columns:1fr 1fr;gap:1vw}
.route{background:var(--card);border:1px solid var(--hair);border-radius:14px;padding:.9vw 1.2vw}
.route-h{display:flex;align-items:center;justify-content:space-between;margin-bottom:.7vw}
.route-h b{color:var(--ink);font-size:.92vw;font-weight:800}
.route-line{display:flex;align-items:center;gap:.4vw}
.node{flex:1;display:flex;flex-direction:column;align-items:center;gap:.25vw;background:var(--chip);border-radius:10px;padding:.6vw .4vw;text-align:center}
.node .material-symbols-outlined{font-size:1.4vw;color:var(--accent)}
.node b{color:var(--ink);font-size:.78vw;font-weight:700}
.node small{color:var(--muted);font-size:.64vw}
.node.grid{background:var(--tint);border:1px solid var(--tint-line)}
.node.grid .material-symbols-outlined{color:#1d4ed8}
.node.off{background:transparent;border:1.5px dashed #c7d2e3}
.node.off .material-symbols-outlined{color:#c3ccda}
.node.off b{color:#94a3b8;text-decoration:line-through}
.node.off small{color:#b6bfcf}
.arr{color:#c3ccda;font-size:1vw;flex-shrink:0}
.arr.dash{color:#dde3ee}
.route-note{color:var(--body);font-size:.76vw;line-height:1.6;margin-top:.7vw}
.route-note b{color:var(--accent)}

/* ── 사진 + 설명 2단 ── */
.photo-split{display:grid;grid-template-columns:1fr 1.15fr;gap:1.2vw;flex:1;min-height:0}
.photo{border-radius:14px;overflow:hidden;border:1px solid var(--hair);position:relative;min-height:0;background:#0b1526}
.photo img{width:100%;height:100%;object-fit:cover;display:block}
.photo-cap{position:absolute;left:0;right:0;bottom:0;padding:.6vw .9vw;background:linear-gradient(transparent,rgba(11,21,38,.78));color:#fff;font-size:.72vw;line-height:1.5}
.photo-cap b{font-weight:700}
.stack{display:flex;flex-direction:column;gap:.9vw;min-height:0}
.stack>.fill{flex:1}

/* ── KPI 스탯 (하이라인 사이 큰 숫자) ── */
.stats{display:flex;border-top:1px solid var(--hair);border-bottom:1px solid var(--hair)}
.stat{flex:1;padding:.9vw 1.1vw}
.stat+.stat{border-left:1px solid var(--hair)}
.stat-num{color:var(--ink);font-size:1.6vw;font-weight:800;letter-spacing:-.02em;line-height:1.15}
.stat.acc .stat-num{color:var(--accent)}
.stat.dim .stat-num{color:var(--muted)}
.stat-label{color:var(--muted);font-size:.72vw;line-height:1.5;margin-top:.35vw}

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

/* ── 계절 다이어그램 (지열) ── */
.seasons{display:grid;grid-template-columns:1fr 1fr;gap:1vw}
.season{background:var(--card);border:1px solid var(--hair);border-radius:14px;padding:1vw 1.2vw}
.season-h{display:flex;align-items:center;gap:.5vw;margin-bottom:.8vw}
.season-h .material-symbols-outlined{font-size:1.3vw}
.season.hot .season-h .material-symbols-outlined{color:#f59e0b}
.season.cold .season-h .material-symbols-outlined{color:#2563eb}
.season-h b{color:var(--ink);font-size:.95vw;font-weight:800}
.season-h small{color:var(--muted);font-size:.72vw;margin-left:auto}
.gx{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:.6vw}
.gx-box{background:var(--chip);border-radius:10px;padding:.7vw .6vw;text-align:center}
.gx-box .material-symbols-outlined{font-size:1.5vw;color:var(--accent);display:block;margin-bottom:.2vw}
.gx-box b{display:block;color:var(--ink);font-size:.8vw;font-weight:700}
.gx-box small{display:block;color:var(--muted);font-size:.66vw;margin-top:.1vw}
.gx-box.ground{background:#f1f5f9}
.gx-box.ground .material-symbols-outlined{color:#475569}
.gx-arrow{display:flex;flex-direction:column;align-items:center;gap:.15vw;color:var(--muted);font-size:.66vw;font-weight:700;white-space:nowrap}
.gx-arrow span{font-size:1.3vw;line-height:1}
.season.hot .gx-arrow span{color:#f59e0b}
.season.cold .gx-arrow span{color:#2563eb}

/* ── 블록 (라벨 + 그리드) · 항목 ── */
.block-label{display:flex;align-items:center;gap:.9vw;margin-bottom:.55vw}
.block-label b{color:var(--ink);font-size:.9vw;font-weight:700;white-space:nowrap}
.block-label:after{content:"";flex:1;height:1px;background:var(--hair)}
.grid-2{display:grid;grid-template-columns:1fr 1fr;gap:.8vw}
.grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:.8vw}
.item{background:var(--card);border:1px solid var(--hair);border-radius:12px;padding:.72vw 1vw}
.item-k{color:var(--ink);font-size:.84vw;font-weight:700;display:flex;align-items:center;gap:.5vw;margin-bottom:.32vw}
.item-k i{width:.4vw;height:.4vw;border-radius:50%;background:var(--accent);flex-shrink:0}
.item.amber .item-k i{background:#f59e0b}
.item.green .item-k i{background:#10b981}
.item.gray .item-k i{background:#94a3b8}
.item-d{color:var(--body);font-size:.77vw;line-height:1.66}
.item-d a{color:var(--accent);text-decoration:underline;text-underline-offset:2px}
.item-ref{color:var(--muted);font-size:.66vw;margin-top:.3vw}

/* ── 피처 카드 ── */
.cards-3{display:grid;grid-template-columns:repeat(3,1fr);gap:1vw}
.fcard{background:var(--card);border:1px solid var(--hair);border-radius:14px;padding:1.05vw 1.25vw;box-shadow:0 1px 2px rgba(11,21,38,.03)}
.fcard-title{color:var(--ink);font-size:.98vw;font-weight:700;display:flex;align-items:center;gap:.6vw;margin-bottom:.55vw;flex-wrap:wrap}
.fcard-desc{color:var(--body);font-size:.8vw;line-height:1.78}
.fcard-desc b{color:var(--ink)}
.fcard-ic{width:2.1vw;height:2.1vw;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;background:var(--tint);color:var(--accent);flex-shrink:0}
.fcard-ic .material-symbols-outlined{font-size:1.1vw}
.tag{display:inline-flex;align-items:center;gap:.38vw;border:1px solid var(--hair);border-radius:999px;padding:.15vw .7vw;font-size:.66vw;font-weight:600;color:var(--muted);background:#fff}
.tag i{width:.38vw;height:.38vw;border-radius:50%;display:inline-block}
.tag.blue{color:#1d4ed8}.tag.blue i{background:#2563eb}
.tag.green{color:var(--green)}.tag.green i{background:#10b981}
.tag.amber{color:var(--amber)}.tag.amber i{background:#f59e0b}
.tag.gray i{background:#94a3b8}

/* ── 이미지 플레이스홀더 ── */
.imgslot{border:2px dashed #c7d2e3;border-radius:14px;background:var(--chip);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:1.1vw;gap:.35vw}
.imgslot .material-symbols-outlined{font-size:2vw;color:#94a3b8}
.imgslot-t{color:var(--muted);font-size:.78vw;font-weight:700}
.imgslot-d{color:var(--muted);font-size:.71vw;line-height:1.65}

/* ── 근거 링크 라인 · 마침 문장 ── */
.srcline{color:var(--muted);font-size:.7vw;margin-top:.4vw;line-height:1.6}
.srcline a{color:var(--accent);text-decoration:underline;text-underline-offset:2px}
.coda{color:var(--body);font-size:.95vw;line-height:1.8;border-top:1px solid var(--hair);padding-top:1vw}
.coda b{color:var(--accent);font-weight:700}

/* ── [PDF p1] 설비 흐름 — 5설비 + 분기 ── */
.eqflow{display:flex;align-items:flex-start}
.eq{flex:1;display:flex;flex-direction:column;align-items:center;text-align:center;position:relative}
.eq-img{height:5.6vw;display:flex;align-items:center;justify-content:center}
.eq-img img{height:100%;width:auto;display:block}
.eq-name{display:flex;align-items:center;gap:.4vw;color:var(--ink);font-size:.86vw;font-weight:800;margin-top:.3vw}
.num{width:1.1vw;height:1.1vw;border-radius:50%;background:var(--accent);color:#fff;font-size:.62vw;font-weight:800;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0}
.num.amber{background:#f59e0b}
.eq-sub{color:var(--muted);font-size:.7vw;line-height:1.55;margin-top:.25vw}
.eq-sub b{color:var(--ink)}
.eq-call{margin-top:.45vw;background:var(--navy1);color:#fff;font-size:.66vw;font-weight:700;border-radius:6px;padding:.28vw .7vw;white-space:nowrap;position:relative}
.eq-call:before{content:"";position:absolute;left:50%;top:-.3vw;transform:translateX(-50%);border:.3vw solid transparent;border-bottom-color:var(--navy1);border-top:none}
.eq-link{width:3.2vw;flex-shrink:0;height:0;margin-top:2.8vw;border-top:2px dashed #f59e0b}
.eq-link.ac{border-top-color:#3b82f6}
.branch{flex:1.15;display:flex;align-items:center;gap:.5vw;margin-top:1.4vw}
.branch-fork{width:1.6vw;height:4.6vw;border:2px dashed #3b82f6;border-left:none;border-radius:0 1vw 1vw 0;flex-shrink:0;position:relative}
.branch-fork:before{content:"";position:absolute;left:-2.4vw;top:50%;width:2.4vw;border-top:2px dashed #3b82f6}
.branch-out{display:flex;flex-direction:column;gap:1.2vw}
.bout{display:flex;align-items:center;gap:.5vw}
.bout .material-symbols-outlined{font-size:1.4vw;color:var(--ink)}
.bout b{display:block;color:var(--ink);font-size:.82vw;font-weight:800}
.bout small{display:block;color:var(--muted);font-size:.66vw}

/* ── DC/AC 구간 바 ── */
.bars{display:grid;grid-template-columns:1fr 1fr;gap:.8vw}
.bar{display:flex;align-items:center;gap:.9vw;border-radius:8px;padding:.5vw 1vw;font-size:.76vw;color:var(--body)}
.bar b{font-size:.82vw;font-weight:800;padding-right:.9vw;border-right:1px solid rgba(0,0,0,.08)}
.bar.dc{background:#f6eedc}.bar.dc b{color:#b45309}
.bar.ac{background:#e0ebfa}.bar.ac b{color:#1d4ed8}

/* ── 설치 유형 카드 + 용어 패널 ── */
.types{display:grid;grid-template-columns:repeat(4,1fr) 1.9fr;gap:.8vw}
.tcard{background:var(--card);border:1px solid var(--hair);border-radius:12px;padding:.8vw 1vw;display:flex;flex-direction:column}
.tcard img{height:3.2vw;width:auto;align-self:flex-start;margin-bottom:.4vw}
.tcard b{color:var(--ink);font-size:.9vw;font-weight:800}
.tcard p{color:var(--muted);font-size:.7vw;line-height:1.55;margin-top:.2vw;flex:1}
.tcard .req{align-self:flex-start;margin-top:.6vw;background:var(--chip);border:1px solid var(--hair);border-radius:4px;color:var(--body);font-size:.64vw;font-weight:600;padding:.12vw .5vw}
.terms{background:#0a1f3a;border-radius:12px;padding:.9vw 1.2vw;color:#fff;display:flex;flex-direction:column}
.terms-h{font-size:.9vw;font-weight:800;margin-bottom:.4vw}
.term{display:flex;align-items:baseline;gap:.9vw;padding:.28vw 0;font-size:.74vw;color:rgba(191,209,238,.85)}
.term b{color:#fff;font-size:.86vw;font-weight:800;width:3.2vw;flex-shrink:0}
.terms-hr{height:1px;background:rgba(255,255,255,.12);margin:.5vw 0 .4vw}
.analogy{display:grid;grid-template-columns:1fr 1fr;gap:.6vw;flex:1;align-items:end}
.analogy>div{display:flex;flex-direction:column;align-items:center;gap:.15vw}
.analogy img{height:2.4vw;width:auto}
.analogy small{font-size:.66vw;font-weight:700}
.analogy .kw{color:#f59e0b}.analogy .kwh{color:#2dd4bf}

/* ── 플랫폼 수집 데이터 스트립 ── */
.strip{display:flex;align-items:center;gap:1.2vw;background:var(--card);border:1px solid var(--hair);border-radius:10px;padding:.55vw 1.1vw}
.strip-l{color:var(--muted);font-size:.7vw;font-weight:700;padding-right:1.1vw;border-right:1px solid var(--hair);white-space:nowrap}
.strip-i{display:flex;align-items:center;gap:.4vw;color:var(--ink);font-size:.76vw;font-weight:600}
.strip-i .material-symbols-outlined{font-size:1vw;color:var(--accent)}
.strip-i.amber .material-symbols-outlined{color:#f59e0b}
.strip-i.teal .material-symbols-outlined{color:#14b8a6}

/* ── [PDF p2] ESS — 좌 구성도 / 우 차트 + 활용 ── */
.ess{display:grid;grid-template-columns:1fr 1.55fr;gap:1vw;align-items:start}
.ess-left{display:flex;flex-direction:column;gap:.7vw}
.ess-fig{background:var(--card);border:1px solid var(--hair);border-radius:12px;padding:.8vw;display:flex;align-items:center;justify-content:center}
.ess-fig img{height:10.2vw;width:auto}
.legend{display:grid;grid-template-columns:1fr 1fr;gap:.35vw .8vw}
.lg{display:flex;align-items:center;gap:.45vw;font-size:.7vw;color:var(--muted)}
.lg .num{width:1vw;height:1vw;font-size:.58vw;background:var(--navy1)}
.lg .num.teal{background:#14b8a6}.lg .num.blue{background:#2563eb}
.lg b{color:var(--ink);font-size:.76vw;font-weight:800;margin-right:.15vw}
.ess-ex{align-self:flex-start;background:var(--navy1);color:#fff;font-size:.7vw;font-weight:700;border-radius:6px;padding:.3vw .8vw}
.ess-right{display:flex;flex-direction:column;gap:.8vw}
.chart{background:var(--card);border:1px solid var(--hair);border-radius:12px;padding:.8vw 1vw .6vw}
.chart-h{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:.4vw}
.chart-h b{color:var(--ink);font-size:.92vw;font-weight:800}
.chart-h small{color:var(--muted);font-size:.66vw}
.chart svg{width:100%;height:auto;display:block}
.chart-lg{display:flex;gap:1.2vw;margin-top:.35vw;font-size:.66vw;color:var(--body)}
.chart-lg span{display:inline-flex;align-items:center;gap:.35vw}
.chart-lg i{width:1vw;height:.5vw;border-radius:2px;display:inline-block}
.uses{display:grid;grid-template-columns:repeat(4,1fr);gap:.8vw}
.use{background:var(--card);border:1px solid var(--hair);border-radius:12px;padding:.8vw 1vw}
.use .material-symbols-outlined{font-size:1.2vw;color:#14b8a6;display:block;margin-bottom:.35vw}
.use b{display:block;color:var(--ink);font-size:.88vw;font-weight:800;margin-bottom:.25vw}
.use p{color:var(--muted);font-size:.7vw;line-height:1.55}

/* ── 비교 2단 (DC vs AC · kW vs kWh) ── */
.duo{display:grid;grid-template-columns:1fr 1fr;gap:1vw}
.duo-col{background:var(--card);border:1px solid var(--hair);border-radius:14px;padding:1vw 1.2vw}
.duo-h{display:flex;align-items:center;gap:.6vw;margin-bottom:.5vw}
.duo-h b{color:var(--ink);font-size:1vw;font-weight:800}
.duo-h .tag{margin-left:auto}
.duo-wave{height:2.2vw;margin:.2vw 0 .6vw}
.duo-wave svg{width:100%;height:100%;display:block}
.duo-list{display:flex;flex-direction:column;gap:.4vw}
.duo-li{display:flex;gap:.5vw;font-size:.78vw;color:var(--body);line-height:1.6}
.duo-li i{width:.4vw;height:.4vw;border-radius:50%;margin-top:.5vw;flex-shrink:0;background:var(--accent)}
.duo-col.dc .duo-li i{background:#f59e0b}.duo-col.ac .duo-li i{background:#3b82f6}
.duo-li b{color:var(--ink)}
.duo-big{color:var(--ink);font-size:1.5vw;font-weight:800;letter-spacing:-.02em;margin:.1vw 0 .3vw}
.duo-big small{color:var(--muted);font-size:.74vw;font-weight:600;margin-left:.5vw}

/* ── 수식·비유 배너 ── */
.formula{display:flex;align-items:center;gap:1.4vw;background:var(--tint);border:1px solid var(--tint-line);border-radius:14px;padding:.9vw 1.4vw}
.formula-eq{color:var(--ink);font-size:1.45vw;font-weight:800;letter-spacing:-.01em;white-space:nowrap}
.formula-eq span{color:var(--accent)}
.formula-d{color:var(--body);font-size:.8vw;line-height:1.65}
.formula-d b{color:var(--ink)}
.analogy-row{display:flex;align-items:center;gap:2.4vw;background:#0a1f3a;border-radius:12px;padding:.7vw 1.4vw}
.analogy-row>div{display:flex;align-items:center;gap:.7vw;color:#fff;font-size:.78vw}
.analogy-row img{height:2.2vw;width:auto}
.analogy-row b{font-weight:800}
.analogy-row .kw b{color:#f59e0b}.analogy-row .kwh b{color:#2dd4bf}
.analogy-row small{color:rgba(191,209,238,.75);font-size:.7vw}

/* ── 5열 그리드 · 시나리오 카드 ── */
.five{display:grid;grid-template-columns:repeat(5,1fr);gap:.8vw}
.scen{display:grid;grid-template-columns:repeat(4,1fr);gap:.8vw}
.sc{background:var(--card);border:1px solid var(--hair);border-radius:12px;padding:.8vw 1vw}
.sc-t{color:var(--muted);font-size:.66vw;font-weight:700;letter-spacing:.06em;margin-bottom:.25vw;display:flex;align-items:center;gap:.4vw}
.sc-t:before{content:"";width:.4vw;height:.4vw;border-radius:50%;background:#c3ccda;flex-shrink:0}
.sc.charge .sc-t:before{background:#14b8a6}.sc.disch .sc-t:before{background:#ef4444}.sc.mix .sc-t:before{background:#f59e0b}
.sc-k{color:var(--ink);font-size:.86vw;font-weight:800;margin-bottom:.3vw}
.sc-d{color:var(--body);font-size:.74vw;line-height:1.6}
.sc-d b{color:var(--ink)}

/* ── 트리(분기점) · 2단 ── */
.split2{display:grid;grid-template-columns:1.35fr 1fr;gap:1.2vw;align-items:start}
.tree{display:flex;flex-direction:column;align-items:center}
.tnode{background:var(--card);border:1px solid var(--hair);border-radius:12px;padding:.7vw 1.3vw;text-align:center;display:flex;flex-direction:column;align-items:center;gap:.12vw;min-width:13vw}
.tnode .material-symbols-outlined{font-size:1.5vw;color:var(--accent);margin-bottom:.15vw}
.tnode b{color:var(--ink);font-size:.92vw;font-weight:800}
.tnode small{color:var(--muted);font-size:.7vw;line-height:1.5}
.tnode.root{background:var(--navy1);border-color:var(--navy1);min-width:24vw}
.tnode.root .material-symbols-outlined{color:#7fa8e8}.tnode.root b{color:#fff}.tnode.root small{color:rgba(191,209,238,.8)}
.tnode.green{background:#ecfdf5;border-color:#a7f3d0}.tnode.green .material-symbols-outlined{color:#047857}
.tnode.blue{background:var(--tint);border-color:var(--tint-line)}
.tlink{width:26vw;height:2.6vw;display:block}
.trow2{display:flex;gap:1.6vw}
.trow3{display:flex;gap:.8vw}
.tchip{background:var(--chip);border:1px solid var(--hair);border-radius:999px;padding:.3vw 1vw;color:var(--body);font-size:.76vw;font-weight:700}
.tcap{color:var(--muted);font-size:.72vw;margin-top:.7vw;text-align:center;line-height:1.6}
.tcap b{color:var(--ink)}
.node.dc{background:#fff7ed;border:1px solid #fed7aa}.node.dc .material-symbols-outlined{color:#b45309}
.arr.dc{color:#f59e0b}

/* ── PCS 양방향 그림 ── */
.pcs{display:grid;grid-template-columns:1fr 1.2fr .9fr 1.2fr 1fr;align-items:center;gap:.4vw;background:var(--card);border:1px solid var(--hair);border-radius:14px;padding:1vw 1.4vw}
.pnode{display:flex;flex-direction:column;align-items:center;text-align:center;gap:.15vw;border-radius:12px;padding:.9vw .6vw}
.pnode .material-symbols-outlined{font-size:2.2vw}
.pnode b{color:var(--ink);font-size:.95vw;font-weight:800}
.pnode small{color:var(--muted);font-size:.7vw}
.pnode.dc{background:#fff7ed}.pnode.dc .material-symbols-outlined{color:#b45309}
.pnode.ac{background:var(--tint)}.pnode.ac .material-symbols-outlined{color:#1d4ed8}
.pnode.hub{background:var(--navy1)}.pnode.hub .material-symbols-outlined{color:#7fa8e8}.pnode.hub b{color:#fff}.pnode.hub small{color:rgba(191,209,238,.8)}
.parr{width:100%;height:auto;display:block}
.cmp{display:grid;grid-template-columns:14vw 1fr;gap:1vw;align-items:center;background:var(--chip);border-radius:12px;padding:.6vw 1vw}
.cmp-l b{display:block;color:var(--ink);font-size:.86vw;font-weight:800}
.cmp-l small{display:block;color:var(--muted);font-size:.7vw;margin-top:.1vw}
.cmp-r .node{padding:.45vw .4vw}

/* ── 호스·펌프 비유 ── */
.hoses{display:grid;grid-template-columns:1fr 1fr;gap:1vw}
.hose{background:var(--card);border:1px solid var(--hair);border-radius:14px;padding:.9vw 1.2vw;display:flex;flex-direction:column;gap:.5vw}
.hose svg{width:100%;height:auto;display:block}
.hose p{color:var(--body);font-size:.78vw;line-height:1.65}
.hose p b{color:var(--ink)}
.tag.red{color:#b91c1c}.tag.red i{background:#ef4444}

/* ── 부하 구간 띠 ── */
.band svg{width:100%;height:auto;display:block}

/* ── 데이터 → EMS → 판단 허브 ── */
.hub{display:grid;grid-template-columns:1.3fr 3vw auto 3vw 1fr;align-items:center;gap:.3vw}
.hub-in{display:flex;flex-direction:column;gap:.45vw}
.hchip{display:flex;align-items:center;gap:.6vw;background:var(--card);border:1px solid var(--hair);border-radius:10px;padding:.45vw .8vw}
.hchip .material-symbols-outlined{font-size:1.15vw;color:#14b8a6;flex-shrink:0}
.hchip.warn .material-symbols-outlined{color:#f59e0b}
.hchip b{display:block;color:var(--ink);font-size:.8vw;font-weight:800}
.hchip small{display:block;color:var(--muted);font-size:.66vw;line-height:1.45}
.hub-arr{width:100%;height:100%;display:block}
.hub-core{display:flex;flex-direction:column;align-items:center;gap:.25vw;text-align:center;padding:0 .6vw}
.q-ic.big{width:4.4vw;height:4.4vw}.q-ic.big .material-symbols-outlined{font-size:2.3vw}
.hub-core b{color:var(--ink);font-size:1.05vw;font-weight:800}
.hub-core small{color:var(--muted);font-size:.7vw;line-height:1.45;max-width:9vw}
.hub-out{display:flex;flex-direction:column;gap:.8vw}
.hout{display:flex;align-items:center;gap:.6vw;border-radius:12px;padding:.7vw 1vw}
.hout .material-symbols-outlined{font-size:1.5vw}
.hout b{display:block;font-size:.95vw;font-weight:800;color:var(--ink)}
.hout small{display:block;color:var(--muted);font-size:.68vw}
.hout.charge{background:#ecfdf5}.hout.charge .material-symbols-outlined{color:#047857}
.hout.disch{background:#fef2f2}.hout.disch .material-symbols-outlined{color:#b91c1c}
.hout.stop{background:#f1f5f9}.hout.stop .material-symbols-outlined{color:#475569}
.analogy-row.big{padding:1.1vw 2vw;gap:4vw}
.analogy-row.big img{height:3.4vw}

/* ── 탄소 배출 두 갈래 ── */
.co2{display:grid;grid-template-columns:2.2fr 1fr;gap:1vw}
.co2-col{background:var(--card);border:1px solid var(--hair);border-radius:14px;padding:1vw 1.25vw;display:flex;flex-direction:column}
.co2-h{display:flex;align-items:center;gap:.5vw;margin-bottom:.7vw;flex-wrap:wrap}
.co2-h i{width:.5vw;height:.5vw;border-radius:50%}
.co2-col.no .co2-h i{background:#10b981}.co2-col.yes .co2-h i{background:#ef4444}
.co2-h b{color:var(--ink);font-size:.98vw;font-weight:800}
.co2-h small{color:var(--muted);font-size:.72vw;margin-left:.3vw}
.co2-chips{display:grid;grid-template-columns:1fr 1fr;gap:.5vw;flex:1;align-content:center}
.co2-col.yes .co2-chips{grid-template-columns:1fr}
.src.more{background:transparent;border:1.5px dashed #c7d2e3}
.src.more .material-symbols-outlined{color:#94a3b8}

/* ── DC/AC 파형 그래프 ── */
.wave{background:var(--card);border:1px solid var(--hair);border-radius:14px;padding:.9vw 1.3vw .7vw}
.wave svg{width:100%;height:auto;display:block}
.wave-lg{display:flex;gap:2vw;margin-top:.5vw;font-size:.76vw;color:var(--body);flex-wrap:wrap}
.wave-lg span{display:inline-flex;align-items:center;gap:.45vw}
.wave-lg i{width:1.1vw;height:.35vw;border-radius:2px;display:inline-block;flex-shrink:0}
.wave-lg b{color:var(--ink);margin-right:.2vw}

/* ── 모션 (전부 CSS — 부유하는 블롭 + 콘텐츠 스태거 등장) ── */
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
.slide.active .trow:nth-child(7){animation-delay:.42s}
.slide.active .cs-head{animation:rise .5s cubic-bezier(.2,.6,.2,1) both}
.slide.active .cs-title{animation:rise .55s cubic-bezier(.2,.6,.2,1) .08s both}
.slide.active .lede{animation:rise .6s cubic-bezier(.2,.6,.2,1) .16s both}
.slide.active .area>*{animation:rise .6s cubic-bezier(.2,.6,.2,1) both}
.slide.active .area>:nth-child(1){animation-delay:.24s}
.slide.active .area>:nth-child(2){animation-delay:.36s}
.slide.active .area>:nth-child(3){animation-delay:.48s}
.slide.active .area>:nth-child(4){animation-delay:.6s}
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
  no,
  sec,
  title,
  lede,
  children,
}: {
  no: string
  sec: string
  title: string // 주장형 한 줄 제목 (명사형 종결)
  lede: ReactNode // 서브타이틀 — 모든 본문에 필수
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
        <p className="lede">{lede}</p>
        <div className="area">{children}</div>
      </div>
    </div>
  )
}

function Stats({ items }: { items: { num: string; label: string; acc?: boolean; dim?: boolean }[] }) {
  return (
    <div className="stats">
      {items.map((s, i) => (
        <div className={`stat${s.acc ? ' acc' : ''}${s.dim ? ' dim' : ''}`} key={i}>
          <div className="stat-num">{s.num}</div>
          <div className="stat-label">{s.label}</div>
        </div>
      ))}
    </div>
  )
}

function Flow({ steps }: { steps: { no: string; name: string; sub: string; final?: boolean }[] }) {
  return (
    <div className="flow">
      {steps.map((s, i) => (
        <div key={i} className={`step${s.final ? ' final' : ''}`}>
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

function Block({ label, cols, children }: { label: string; cols: 2 | 3; children: ReactNode }) {
  return (
    <div className="blk">
      <div className="block-label"><b>{label}</b></div>
      <div className={`grid-${cols}`}>{children}</div>
    </div>
  )
}

function Item({ k, d, cite, tone }: { k: string; d: ReactNode; cite?: string; tone?: 'amber' | 'green' | 'gray' }) {
  return (
    <div className={`item${tone ? ` ${tone}` : ''}`}>
      <div className="item-k"><i />{k}</div>
      <div className="item-d">{d}</div>
      {cite && <div className="item-ref">{cite}</div>}
    </div>
  )
}

function Fcard({ icon, title, children }: { icon: string; title: ReactNode; children: ReactNode }) {
  return (
    <div className="fcard">
      <div className="fcard-title">
        <span className="fcard-ic"><span className="material-symbols-outlined">{icon}</span></span>
        {title}
      </div>
      <div className="fcard-desc">{children}</div>
    </div>
  )
}

/** 에너지원 칩 (탄소 축 분류용) */
function Src({ icon, name, sub }: { icon: string; name: string; sub: string }) {
  return (
    <div className="src">
      <span className="material-symbols-outlined">{icon}</span>
      <div><b>{name}</b><small>{sub}</small></div>
    </div>
  )
}

/** 사업모델 카드 — 같은 축(소유·투자·전기·대가)으로 정렬 */
function Model({ icon, name, rows }: { icon: string; name: string; rows: { k: string; v: ReactNode }[] }) {
  return (
    <div className="model">
      <div className="model-h">
        <span className="fcard-ic"><span className="material-symbols-outlined">{icon}</span></span>
        <b>{name}</b>
      </div>
      {rows.map((r, i) => (
        <div className="spec-row" key={i}>
          <span className="spec-k">{r.k}</span>
          <span className="spec-v">{r.v}</span>
        </div>
      ))}
    </div>
  )
}

function Node({ icon, name, sub, kind }: { icon: string; name: string; sub?: string; kind?: 'grid' | 'off' | 'dc' }) {
  return (
    <div className={`node${kind ? ` ${kind}` : ''}`}>
      <span className="material-symbols-outlined">{icon}</span>
      <b>{name}</b>
      {sub && <small>{sub}</small>}
    </div>
  )
}

function ImgSlot({ suggestion }: { suggestion: string }) {
  return (
    <div className="imgslot">
      <span className="material-symbols-outlined">add_photo_alternate</span>
      <div className="imgslot-t">이미지 넣을 자리</div>
      <div className="imgslot-d">제안: {suggestion}</div>
    </div>
  )
}

/* ─────────── [PDF] 설비 흐름 · 설치 유형 · 데이터 스트립 · ESS 차트 ─────────── */

const G = '/images/261001/guide'

function Eq({ n, img, name, l1, l2, strongL2, call }: { n: number; img: string; name: string; l1: string; l2: string; strongL2?: boolean; call?: string }) {
  return (
    <div className="eq">
      <div className="eq-img"><img src={`${G}/${img}.png`} alt={name} /></div>
      <div className="eq-name"><span className={`num${n <= 2 ? ' amber' : ''}`}>{n}</span>{name}</div>
      <div className="eq-sub">{l1}<br />{strongL2 ? <b>{l2}</b> : l2}</div>
      {call && <div className="eq-call">{call}</div>}
    </div>
  )
}

function TypeCard({ img, name, desc, req }: { img: string; name: string; desc: string; req: string }) {
  return (
    <div className="tcard">
      <img src={`${G}/${img}.png`} alt={name} />
      <b>{name}</b>
      <p>{desc}</p>
      <span className="req">{req}</span>
    </div>
  )
}

function Strip({ items }: { items: { icon: string; t: string; tone?: 'amber' | 'teal' }[] }) {
  return (
    <div className="strip">
      <span className="strip-l">플랫폼 수집 데이터</span>
      {items.map((it, i) => (
        <span className={`strip-i${it.tone ? ` ${it.tone}` : ''}`} key={i}>
          <span className="material-symbols-outlined">{it.icon}</span>{it.t}
        </span>
      ))}
    </div>
  )
}

/** 24시간 부하 곡선 — PDF p2 차트의 개념 곡선을 SVG로 재현 (수치는 예시) */
function EssChart() {
  const W = 600, H = 250, L = 40, R = 8, T = 34, B = 26
  const x = (h: number) => L + (h / 24) * (W - L - R)
  const y = (v: number) => T + (1 - v / 1200) * (H - T - B)
  const ease = (a: number, b: number, t: number) => a + (b - a) * (1 - Math.cos(Math.PI * Math.min(1, Math.max(0, t)))) / 2
  const load = (h: number) =>
    h < 6 ? 350 : h < 9 ? ease(350, 1000, (h - 6) / 3) : h < 15 ? 1000 + 40 * Math.sin((h - 9) * 1.4) : h < 18 ? ease(1040, 800, (h - 15) / 3) : ease(800, 380, (h - 18) / 6)
  const pv = (h: number) => (h <= 6 || h >= 18 ? 0 : 700 * Math.pow(Math.sin((Math.PI * (h - 6)) / 12), 1.3))
  const pts = (f: (h: number) => number) => Array.from({ length: 97 }, (_, i) => `${x(i / 4).toFixed(1)},${y(f(i / 4)).toFixed(1)}`)
  const loadPath = 'M' + pts(load).join(' L')
  const pvPath = 'M' + pts(pv).join(' L') + ` L${x(24).toFixed(1)},${y(0)} L${x(0)},${y(0)} Z`
  const bands = [
    { a: 0, b: 9, t: '경부하', dark: false },
    { a: 9, b: 12, t: '중간부하', dark: false },
    { a: 12, b: 16, t: '최대부하', dark: true },
    { a: 16, b: 24, t: '중간부하', dark: false },
  ]
  const charge = [[0, 6], [11, 15]]
  const discharge = [[17, 21]]
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="24시간 부하 곡선과 충·방전 구간">
      {bands.map((b, i) => (
        <g key={i}>
          <rect x={x(b.a)} y={6} width={x(b.b) - x(b.a)} height={16} fill={b.dark ? '#334155' : '#e2e8f0'} />
          <text x={(x(b.a) + x(b.b)) / 2} y={17.5} textAnchor="middle" fontSize="9" fontWeight="700" fill={b.dark ? '#fff' : '#475569'}>{b.t}</text>
        </g>
      ))}
      {charge.map(([a, b], i) => <rect key={`c${i}`} x={x(a)} y={T} width={x(b) - x(a)} height={H - T - B} fill="#14b8a6" opacity=".16" />)}
      {discharge.map(([a, b], i) => <rect key={`d${i}`} x={x(a)} y={T} width={x(b) - x(a)} height={H - T - B} fill="#ef4444" opacity=".13" />)}
      {[0, 300, 600, 900, 1200].map((v) => (
        <g key={v}>
          <line x1={L} x2={W - R} y1={y(v)} y2={y(v)} stroke="#e6eaf2" strokeWidth="1" />
          <text x={L - 6} y={y(v) + 3} textAnchor="end" fontSize="8.5" fill="#8a94a6">{v}</text>
        </g>
      ))}
      {[0, 3, 6, 9, 12, 15, 18, 21, 24].map((h) => (
        <text key={h} x={x(h)} y={H - 8} textAnchor="middle" fontSize="8.5" fill="#8a94a6">{h === 24 ? '24시' : h}</text>
      ))}
      <path d={pvPath} fill="#f59e0b" opacity=".38" stroke="#f59e0b" strokeWidth="1.5" />
      <path d={loadPath} fill="none" stroke="#0f172a" strokeWidth="2.2" strokeLinejoin="round" />
      {charge.map(([a, b], i) => (
        <g key={`cl${i}`}>
          <rect x={(x(a) + x(b)) / 2 - 24} y={T + 6} width={48} height={15} rx="3" fill="#14b8a6" />
          <text x={(x(a) + x(b)) / 2} y={T + 17} textAnchor="middle" fontSize="9" fontWeight="800" fill="#fff">충전</text>
        </g>
      ))}
      {discharge.map(([a, b], i) => (
        <g key={`dl${i}`}>
          <rect x={(x(a) + x(b)) / 2 - 24} y={H - B - 22} width={48} height={15} rx="3" fill="#ef4444" />
          <text x={(x(a) + x(b)) / 2} y={H - B - 11} textAnchor="middle" fontSize="9" fontWeight="800" fill="#fff">방전</text>
        </g>
      ))}
    </svg>
  )
}

/* ─────────────────────────── 출처 링크 (공식 사이트에서 확인) ─────────────────────────── */
const LINK = {
  kepcoTariff: 'https://cyber.kepco.co.kr/ckepco/front/jsp/CY/E/E/CYEEHP00101.jsp', // 한전 전기요금표 (계약종별)
  kogasTariff: 'https://www.kogas.or.kr/site/koGas/1040401000000', // 가스공사 도시가스용 도매요금 (연료전지용 행)
  kpxH2Notice: 'https://kpx.or.kr/board.es?mid=a11201000000&bid=0042&list_no=75083&act=view', // 2025 일반수소발전시장 경쟁입찰 공고
  kpxH2Result: 'https://www.kpx.or.kr/board.es?mid=a11201000000&bid=0042&list_no=73886&act=view', // 2024 청정수소발전시장 결과
  chps: 'https://kchps.kmos.kr', // 수소발전입찰시장 시스템
}

/* ─────────────────────────── 슬라이드 ─────────────────────────── */

const TOC = [
  { no: '00', t: '기본 원칙', d: '모든 판단의 첫 질문 — 탄소가 배출되는가', target: 2 },
  { no: '01', t: '태양광', d: '설비 흐름 · DC와 AC · 전기실과 분기점 · 자가소비/리스/PPA · kW와 kWh', target: 3 },
  { no: '02', t: '태양열', d: '공공시설·요양원·어린이집 — 전기 절감이 아닌 24시간 온수', target: 8 },
  { no: '03', t: '지열', d: '땅속 13℃를 열원으로 쓰는 냉난방, 실외기 없는 건물', target: 9 },
  { no: '04', t: '연료전지', d: '가스에서 수소로 — 수소 구매 쟁점과 가스 요금·입찰시장', target: 10 },
  { no: '05', t: 'ESS', d: '구성과 충방전 곡선 · 핸드폰 배터리 비유 · 전압×전류 · 부하 구간과 AI 판단 · 데이터', target: 11 },
]

const buildSlides = (goTo: (i: number) => void): ReactNode[] => [
  /* 1. 표지 */
  <div className="dark-stage" key="cover">
    <p className="cover-eyebrow">Energy Concepts · Reference</p>
    <h1 className="cover-title">에너지 개념 정리</h1>
    <p className="cover-sub">
      탄소 배출 여부에서 출발해 태양광 · 태양열 · 지열 · 연료전지 · ESS까지<br />
      설비 흐름과 사업 구조를 한 벌로
    </p>
    <div className="cover-meta">
      <img src="/images/logo.png" alt="RMS GROUP" />
      <i />
      <span>배효원 · RMS팀</span>
      <i />
      <span>2026. 10. 01</span>
    </div>
  </div>,

  /* 2. 목차 */
  <div className="toc" key="toc">
    <div className="toc-left">
      <p className="toc-eyebrow">Contents</p>
      <h2 className="toc-title">목차</h2>
      <p className="toc-lead">
        쓰는 에너지든 만드는 에너지든<br />
        첫 질문은 하나 — 탄소가 나오는가.<br />
        그 축 위에 다섯 에너지원을 놓는다.
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

  /* 3. 기본 원칙 — 탄소 축 */
  <ContentSlide
    key="s0"
    no="00"
    sec="기본 원칙"
    title="모든 에너지 판단의 첫 질문 — 탄소가 배출되는가"
    lede={<>에너지원을 볼 때 가장 먼저 확인할 것은 <span className="hl">탄소 배출 여부</span>다. 에너지원은 훨씬 많지만, 이 자료는 그중 다섯 가지만 다룬다.</>}
  >
    <div className="q">
      <span className="q-ic"><span className="material-symbols-outlined">co2</span></span>
      <div>
        <div className="q-t">이 에너지는 탄소를 배출하는가?</div>
        <div className="q-d">배출하지 않으면 재생에너지 사용 자체가 목적이 되고, 배출하면 연료가 무엇인지가 먼저다.</div>
      </div>
    </div>

    <div className="co2">
      <div className="co2-col no">
        <div className="co2-h"><i /><b>배출 없음 — 재생에너지</b><small>이 자료가 다루는 네 가지는 모두 여기</small></div>
        <div className="co2-chips">
          <Src icon="solar_power" name="태양광" sub="전기를 만든다" />
          <Src icon="water_heater" name="태양열" sub="온수를 만든다" />
          <Src icon="device_thermostat" name="지열" sub="냉난방 열을 얻는다" />
          <Src icon="propane_tank" name="연료전지" sub="수소 100%로 전기를 만든다 — 수소를 어디서 얻느냐가 관건" />
          <div className="src more"><span className="material-symbols-outlined">more_horiz</span><div><b>그 외 다수</b><small>여러 재생에너지 중 이 자료에서는 다루지 않음</small></div></div>
        </div>
      </div>
      <div className="co2-col yes">
        <div className="co2-h"><i /><b>배출 있음</b></div>
        <div className="co2-chips">
          <div className="src more"><span className="material-symbols-outlined">more_horiz</span><div><b>이 자료에서는 다루지 않음</b><small>탄소가 나오는 에너지는 범위 밖</small></div></div>
        </div>
      </div>
    </div>

    <p className="coda">
      <b>ESS</b>는 에너지를 만드는 게 아니라 <b>담아 두는</b> 설비다 — 무엇으로 채우느냐에 따라 탄소의 답이 정해진다.
    </p>
  </ContentSlide>,

  /* 5. [전사] DC와 AC */
  <ContentSlide
    key="s1b"
    no="01"
    sec="태양광 · 전기의 기본"
    title="전기의 기본 — 태양광은 직류(DC)로 받아 교류(AC)로 보낸다"
    lede={<>태양광 모듈이 만드는 전기는 <b>직류(DC)</b>, 공장과 건물이 실제로 쓰는 전기는 <b>교류(AC)</b>다. 그 사이를 바꿔 주는 장치가 <span className="hl">인버터</span>다.</>}
  >
    <div className="wave">
      <svg viewBox="0 0 900 230" aria-hidden>
        <line x1="60" y1="20" x2="60" y2="210" stroke="#c3ccda" strokeWidth="1.5" />
        <line x1="60" y1="115" x2="880" y2="115" stroke="#c3ccda" strokeWidth="1.5" />
        <text x="18" y="24" fontSize="12" fontWeight="700" fill="#8a94a6">전압</text>
        <text x="48" y="119" fontSize="11" fill="#8a94a6" textAnchor="end">0</text>
        <text x="880" y="134" fontSize="12" fontWeight="700" fill="#8a94a6" textAnchor="end">시간 →</text>
        <line x1="60" y1="55" x2="880" y2="55" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
        <text x="880" y="46" fontSize="14" fontWeight="800" fill="#b45309" textAnchor="end">DC · 직류 — 한 방향으로 일정하게</text>
        <path d="M60 115 C 112 20, 164 20, 216 115 S 320 210, 372 115 S 476 20, 528 115 S 632 210, 684 115 S 788 20, 840 115" fill="none" stroke="#2563eb" strokeWidth="4" strokeLinecap="round" />
        <text x="880" y="200" fontSize="14" fontWeight="800" fill="#1d4ed8" textAnchor="end">AC · 교류 — 방향이 주기적으로 바뀜 (국내 60Hz)</text>
      </svg>
      <div className="wave-lg">
        <span><i style={{ background: '#f59e0b' }} /><b>DC</b> 태양광 모듈이 만드는 전기 · 배터리(ESS)에 담기는 전기 · 그대로는 공장에서 못 쓴다</span>
        <span><i style={{ background: '#2563eb' }} /><b>AC</b> 콘센트 · 공장 부하 · 한전 계통 — 실제로 쓰는 전기는 전부 AC</span>
      </div>
    </div>

    <div className="route" style={{ padding: '1vw 1.4vw' }}>
      <div className="route-line">
        <Node icon="solar_power" name="태양광 모듈" sub="빛 → 직류(DC)" kind="dc" />
        <span className="arr dc">⟶</span>
        <Node icon="input" name="접속반 → 인버터 입력" sub="몰라도 된다 — 입력으로만" kind="dc" />
        <span className="arr dc">⟶</span>
        <Node icon="swap_horiz" name="인버터" sub="DC → AC 변환 · 모니터링 설치 지점" kind="grid" />
        <div className="branch" style={{ marginTop: 0 }}>
          <span className="branch-fork" />
          <div className="branch-out">
            <div className="bout"><span className="material-symbols-outlined">factory</span><div><b>자가소비</b><small>공장 부하에 직접 공급 (AC)</small></div></div>
            <div className="bout"><span className="material-symbols-outlined">cell_tower</span><div><b>한전 계통 연계</b><small>잉여 전력 송전 (AC)</small></div></div>
          </div>
        </div>
      </div>
      <p className="route-note"><b style={{ color: '#b45309' }}>주황 = DC</b> 구간 · <b>파랑 = AC</b> 구간 — 인버터를 기준으로 색이 바뀐다.</p>
    </div>

    <p className="coda">
      모니터링(RTU)이 인버터에 붙기 때문에 플랫폼에 들어오는 데이터에는 <b>DC 값과 AC 값이 함께</b> 있다 — 인버터 앞은 DC, 뒤는 AC. 울산 데이터의 DC·AC 구분이 여기서 나온다.
    </p>
  </ContentSlide>,

  /* 4. [PDF p1] 태양광 발전설비 — 햇빛에서 전력 사용까지 */
  <ContentSlide
    key="s1a"
    no="01"
    sec="태양광 · 발전설비"
    title="태양광 발전설비 — 햇빛에서 전력 사용까지"
    lede={<>발전 → 변환 → 연계 → 사용 흐름 이해</>}
  >
    <div className="eqflow">
      <Eq n={1} img="eq1-module" name="태양광 모듈 어레이" l1="빛 → 직류(DC) 발전" l2="공장 지붕 위 설치" />
      <span className="eq-link" />
      <Eq n={2} img="eq2-junction" name="접속반" l1="여러 모듈 선로 취합" l2="DC 측 보호·차단" />
      <span className="eq-link" />
      <Eq n={3} img="eq3-inverter" name="인버터" l1="직류(DC) → 교류(AC) 변환" l2="설비 핵심" strongL2 call="고장 시 발전 중단 → 모니터링 1순위" />
      <span className="eq-link ac" />
      <Eq n={4} img="eq4-switchgear" name="수배전반 · 계량기" l1="전력 계측 · 보호" l2="계통 연계점 관리" />
      <span className="eq-link ac" />
      <Eq n={5} img="eq5-branch" name="분기점" l1="자가소비 · 계통 송전" l2="2방향 분배" />
      <div className="branch">
        <span className="branch-fork" />
        <div className="branch-out">
          <div className="bout"><span className="material-symbols-outlined">factory</span><div><b>자가소비</b><small>공장 부하 직접 공급</small></div></div>
          <div className="bout"><span className="material-symbols-outlined">cell_tower</span><div><b>한전 계통 연계</b><small>잉여 전력 송전</small></div></div>
        </div>
      </div>
    </div>

    <div className="bars">
      <div className="bar dc"><b>DC 구간</b>모듈 → 접속반 → 인버터 입력 · 직류</div>
      <div className="bar ac"><b>AC 구간</b>인버터 출력 → 수배전반 → 부하 · 계통 · 교류</div>
    </div>

    <div className="types">
      <TypeCard img="type1-roof" name="지붕형" desc="공장·창고 지붕 활용, 산단 주력 유형" req="구조안전진단 필요" />
      <TypeCard img="type2-ground" name="지상형" desc="유휴 부지 활용, 대용량 구성 가능" req="부지 인허가" />
      <TypeCard img="type3-carport" name="주차장형(카포트)" desc="주차 공간 + 차양 겸용" req="구조물 설계" />
      <TypeCard img="type4-float" name="수상형" desc="저수지·유수지 수면 활용" req="환경 협의" />
      <div className="terms">
        <div className="terms-h">핵심 용어</div>
        <div className="term"><b>kW</b>설비용량 · 순간 출력 크기</div>
        <div className="term"><b>kWh</b>발전량 · 시간 동안 생산한 에너지</div>
        <div className="term"><b>이용률</b>설비용량 대비 실제 발전 비율</div>
        <div className="terms-hr" />
        <div className="analogy">
          <div><img src={`${G}/kw-pipe.png`} alt="kW = 굵기" /><small className="kw">kW = 굵기</small></div>
          <div><img src={`${G}/kwh-bucket.png`} alt="kWh = 받은 물의 양" /><small className="kwh">kWh = 받은 물의 양</small></div>
        </div>
      </div>
    </div>

    <Strip
      items={[
        { icon: 'bolt', t: '발전량' },
        { icon: 'notifications', t: '인버터 상태 · 알람', tone: 'amber' },
        { icon: 'wb_sunny', t: '일사량', tone: 'amber' },
        { icon: 'device_thermostat', t: '모듈 온도', tone: 'amber' },
        { icon: 'cell_tower', t: '계통 송전량' },
      ]}
    />
  </ContentSlide>,

  /* 6. [전사] 전기실(수배전반·계량기)과 분기점 — 트리 */
  <ContentSlide
    key="s1c"
    no="01"
    sec="태양광 · 전기실과 분기점"
    title="전기실(수배전반·계량기)과 분기점 — 저장이 아니라 흐름의 시작점"
    lede={<>태양광이 만든 전기는 건물의 <b>전기실</b>로 들어가야 공장이 쓸 수 있다. 전기실은 전기를 담는 곳이 아니라 <span className="hl">모든 전기 경로의 시작점</span>이고, 그 뒤에서 자가소비와 계통 송전으로 갈린다.</>}
  >
    <div className="split2">
      <div className="tree">
        <div className="tnode root">
          <span className="material-symbols-outlined">electrical_services</span>
          <b>전기실 — 수배전반 · 계량기</b>
          <small>태양광 전기가 들어오는 곳 · 공장 모든 전기 경로의 시작점</small>
        </div>
        <svg className="tlink" viewBox="0 0 400 60" preserveAspectRatio="none" aria-hidden>
          <path d="M200 0 V22 M200 22 H100 V60 M200 22 H300 V60" fill="none" stroke="#c3ccda" strokeWidth="2" />
        </svg>
        <div className="trow2">
          <div className="tnode green">
            <span className="material-symbols-outlined">home</span>
            <b>자가소비</b>
            <small>내가 쓴다 — 계통으로 보내지 않고 끝</small>
          </div>
          <div className="tnode blue">
            <span className="material-symbols-outlined">cell_tower</span>
            <b>계통 송전</b>
            <small>내가 쓰지 않는 전기는 전부 한전 계통으로</small>
          </div>
        </div>
        <svg className="tlink" viewBox="0 0 400 44" preserveAspectRatio="none" aria-hidden>
          <path d="M100 0 V16 M300 0 V16 M60 16 H340 M80 16 V44 M200 16 V44 M320 16 V44" fill="none" stroke="#c3ccda" strokeWidth="2" strokeDasharray="4 4" />
        </svg>
        <div className="trow3">
          <div className="tchip">리스</div>
          <div className="tchip">PPA</div>
          <div className="tchip">RPS (한전 판매)</div>
        </div>
        <p className="tcap">리스·PPA·RPS는 <b>그 아래 단계의 사업 방식</b> — 어느 쪽으로 흐르느냐(자가소비 / 계통 송전)가 먼저다.</p>
      </div>

      <div className="stack">
        <Fcard icon="moving" title="저장이 아니라 흐름">
          ESS가 아닌 이상 전기는 <b>한 방향으로 흐르고 멈출 수 없다</b>. 들어온 전기를 그 순간 바로 쓰게 보내는 곳 — 흔히 <b>'전기실'</b>이라 부른다.
        </Fcard>
        <Fcard icon="power_off" title="정전이 나면">
          집의 두꺼비집처럼 공장은 <b>전기실의 차단기가 떨어진다</b>. 모든 전기의 경로와 시작점이 여기이기 때문.
        </Fcard>
        <Fcard icon="sync_alt" title="발전 · 사용 · 수전은 동시에">
          발전이 사용량에 못 미치면 부족분은 <b>그 순간 한전에서 받아</b> 쓰고, 남으면 계통으로 보낸다. 자가소비든 송전이든 공장은 늘 한전에서 전기를 받고 있다.
        </Fcard>
      </div>
    </div>
  </ContentSlide>,

  /* 7. 태양광 — 3모델 + 온/오프사이트 */
  <ContentSlide
    key="s1"
    no="01"
    sec="태양광 · 사업모델"
    title="태양광 — 세 가지 사업모델, 그리고 한전 망을 쓰느냐의 갈림"
    lede={<>태양광은 <b>자가소비 · 리스 · PPA</b> 세 모델로 나뉘고, PPA는 다시 <span className="hl">한전 망 사용 여부</span>로 온사이트와 오프사이트가 갈린다.</>}
  >
    <div className="models">
      <Model
        icon="home"
        name="자가소비"
        rows={[
          { k: '소유', v: <b>수용가</b> },
          { k: '투자', v: '수용가가 설치비 부담' },
          { k: '전기', v: '생산한 전기를 직접 사용' },
          { k: '대가', v: '없음 — 전기요금 절감으로 회수' },
        ]}
      />
      <Model
        icon="real_estate_agent"
        name="리스"
        rows={[
          { k: '소유', v: <b>리스 사업자</b> },
          { k: '투자', v: '사업자가 설치, 수용가 초기비용 없음' },
          { k: '전기', v: '수용가가 설비 사용 · 전기 사용' },
          { k: '대가', v: '수용가 → 사업자 리스료' },
        ]}
      />
      <Model
        icon="handshake"
        name="PPA"
        rows={[
          { k: '소유', v: <b>발전사업자</b> },
          { k: '투자', v: '발전사업자가 설치·운영' },
          { k: '전기', v: '생산 전기를 수용가에 판매' },
          { k: '대가', v: '수용가 → 발전사업자 전력 단가' },
        ]}
      />
    </div>

    <div className="routes">
      <div className="route">
        <div className="route-h"><b>온사이트 PPA</b><span className="tag green"><i />한전 망 미사용</span></div>
        <div className="route-line">
          <Node icon="solar_power" name="발전설비" sub="수용가 부지 안" />
          <span className="arr">→</span>
          <Node icon="cell_tower" name="한전 망" sub="거치지 않음" kind="off" />
          <span className="arr dash">→</span>
          <Node icon="factory" name="수용가" sub="직접 연결" />
        </div>
        <p className="route-note">같은 부지 안에서 <b>직접 연결</b> — 망을 거치지 않는다.</p>
      </div>
      <div className="route">
        <div className="route-h"><b>오프사이트 PPA</b><span className="tag blue"><i />한전 망 사용</span></div>
        <div className="route-line">
          <Node icon="solar_power" name="발전설비" sub="떨어진 부지" />
          <span className="arr">→</span>
          <Node icon="cell_tower" name="한전 망" sub="송·배전 경유" kind="grid" />
          <span className="arr">→</span>
          <Node icon="factory" name="수용가" sub="망을 통해 수전" />
        </div>
        <p className="route-note">멀리 있는 발전소 전기를 <b>한전 망을 통해</b> 받는다.</p>
      </div>
    </div>
  </ContentSlide>,

  /* 8. [전사] kW와 kWh */
  <ContentSlide
    key="s1e"
    no="01"
    sec="태양광 · 단위"
    title="kW와 kWh — 설치한 크기와 만들어 낸 양"
    lede={<><b>kW</b>는 설치한 설비의 용량이자 순간 출력의 크기, <b>kWh</b>는 시간 동안 생산한 에너지(발전량)다. 결국 <span className="hl">돈으로 환산되는 것은 kWh</span>다.</>}
  >
    <div className="duo">
      <div className="duo-col dc">
        <div className="duo-h"><b>kW · 설비용량</b><span className="tag amber"><i />순간 출력의 크기</span></div>
        <div className="duo-big">kW<small>설치한 설비의 크기</small></div>
        <div className="duo-list">
          <div className="duo-li"><i /><span>말 그대로 <b>설치한 용량</b>이자 순간 출력의 크기</span></div>
          <div className="duo-li"><i /><span>그 자체로는 <b>큰 의미가 있는 지표는 아니다</b> — 얼마나 큰 설비인지를 말할 뿐</span></div>
        </div>
      </div>
      <div className="duo-col ac">
        <div className="duo-h"><b>kWh · 발전량</b><span className="tag blue"><i />시간 동안 생산한 에너지</span></div>
        <div className="duo-big">kWh<small>시간 동안 만들어 낸 양</small></div>
        <div className="duo-list">
          <div className="duo-li"><i /><span>어떤 시간 동안 <b>얼마만큼의 kW를 만들어 냈는가</b> — 그 합이 발전량</span></div>
          <div className="duo-li"><i /><span>발전량은 <b>시간으로밖에 표현이 안 되기</b> 때문에 kWh를 쓴다</span></div>
        </div>
      </div>
    </div>

    <div className="analogy-row big">
      <div className="kw"><img src={`${G}/kw-pipe.png`} alt="" /><div><b>kW = 굵기</b><br /><small>파이프가 얼마나 굵은가 — 순간에 흐를 수 있는 양</small></div></div>
      <div className="kwh"><img src={`${G}/kwh-bucket.png`} alt="" /><div><b>kWh = 받은 물의 양</b><br /><small>시간 동안 통에 얼마나 담겼나 — 돈이 되는 쪽</small></div></div>
    </div>

    <Block label="왜 kWh를 보나 — 누가 무엇이 궁금한가" cols={2}>
      <Item k="자가소비" d="내 태양광이 얼마만큼 발전이 됐나." tone="green" />
      <Item k="온사이트 PPA" d="얼마만큼 발전이 됐고, 그걸 돈으로 환산했을 때 얼마인가 — 우리 기준에서 가장 중요한 질문." />
    </Block>
  </ContentSlide>,

  /* 9. 태양열 — 사진 + 왜 공공시설인가 */
  <ContentSlide
    key="s2"
    no="02"
    sec="태양열"
    title="태양열 — 전기 절감이 아니라 24시간 온수를 재생에너지로"
    lede={<>태양열은 집열판으로 물을 데워 <b>온수</b>를 만드는 설비다. 주 설치처는 <span className="hl">공공시설 · 요양원 · 어린이집</span> — 이유는 전기요금이 아니라 온수에 있다.</>}
  >
    <div className="photo-split">
      <div className="photo">
        <img src="/images/261001/solar-thermal.png" alt="옥상에 설치된 태양열 집열판과 축열탱크" />
        <div className="photo-cap"><b>태양열 설비</b> — 평판형 집열판 3매 + 상부 축열탱크. 집열판이 데운 물이 탱크에 저장돼 온수로 공급된다.</div>
      </div>
      <div className="stack">
        <Flow
          steps={[
            { no: '01', name: '집열', sub: '평판 집열판이 햇빛으로 물을 데운다' },
            { no: '02', name: '축열', sub: '데운 물을 상부 탱크에 저장' },
            { no: '03', name: '온수 공급', sub: '건물 급탕으로 24시간 사용', final: true },
          ]}
        />
        <Stats
          items={[
            { num: '190~210원', label: '공장 전기요금 (원/kWh · 전달값)', dim: true },
            { num: '70원대', label: '공공시설 전기요금 (원/kWh · 전달값)', dim: true },
            { num: '24시간', label: '요양원·어린이집의 온수 수요', acc: true },
          ]}
        />
        <div className="fill">
          <Block label="왜 공공시설인가" cols={2}>
            <Item k="전기 절감은 동기가 약함" d="공공시설 전기요금이 낮아 전기를 줄여도 체감이 작다." tone="gray" />
            <Item k="온수는 멈출 수 없음" d="요양원·어린이집은 온수를 24시간 쓴다 — 그 온수를 재생에너지로 만드는 것이 핵심." tone="green" />
          </Block>
        </div>
        <p className="srcline">
          요금은 현장 전달값 — 계약종별 단가는 <a href={LINK.kepcoTariff} target="_blank" rel="noreferrer">한전 전기요금표</a>에서 확인 후 교체.
        </p>
      </div>
    </div>
  </ContentSlide>,

  /* 10. 지열 — 계절 다이어그램 */
  <ContentSlide
    key="s3"
    no="03"
    sec="지열"
    title="지열 — 연중 13℃인 땅을 열원으로 쓰는 에어컨"
    lede={<>땅을 깊게 파면 온도가 <b>연평균 약 13℃</b>로 일정하다. 이 온도차를 이용해 여름엔 열을 땅으로 보내고, 겨울엔 땅의 열을 끌어 올린다 — <span className="hl">에어컨과 같은 원리</span>다.</>}
  >
    <div className="seasons">
      <div className="season hot">
        <div className="season-h"><span className="material-symbols-outlined">sunny</span><b>더운 날 — 냉방</b><small>건물 열 → 땅</small></div>
        <div className="gx">
          <div className="gx-box"><span className="material-symbols-outlined">apartment</span><b>건물</b><small>실내 열을 모아</small></div>
          <div className="gx-arrow"><span>→</span>열을 보냄</div>
          <div className="gx-box ground"><span className="material-symbols-outlined">landscape</span><b>땅속 13℃</b><small>열을 받아 식힘</small></div>
        </div>
      </div>
      <div className="season cold">
        <div className="season-h"><span className="material-symbols-outlined">ac_unit</span><b>추운 날 — 난방</b><small>땅 열 → 건물</small></div>
        <div className="gx">
          <div className="gx-box ground"><span className="material-symbols-outlined">landscape</span><b>땅속 13℃</b><small>바깥보다 따뜻함</small></div>
          <div className="gx-arrow"><span>→</span>열을 끌어옴</div>
          <div className="gx-box"><span className="material-symbols-outlined">apartment</span><b>건물</b><small>실내 온도를 올림</small></div>
        </div>
      </div>
    </div>

    <Block label="특징과 설치처" cols={3}>
      <Item k="땅이 열 저장고" d="연중 온도가 거의 일정한 땅을 냉방 시엔 열 버리는 곳, 난방 시엔 열 가져오는 곳으로 쓴다." />
      <Item k="실외기가 보이지 않음" d="열교환이 땅속에서 일어나 옥상·외벽에 실외기가 드러나지 않는다." tone="green" />
      <Item k="공공시설 · 신축" d="실외기 없는 외관과 냉난방 통합이 맞는 공공시설과 신축 건물에 주로 적용." tone="amber" />
    </Block>
  </ContentSlide>,

  /* 11. 연료전지 — 연료 체인 + 가격·입찰 링크 */
  <ContentSlide
    key="s4"
    no="04"
    sec="연료전지"
    title="연료전지 — 가스에서 수소를 얻어 100% 수소로 구동, 쟁점은 조달"
    lede={<>연료전지는 <b>가스</b>(LNG·바이오가스 등)에서 수소를 얻어 <b>수소 100%</b>로 전기를 만든다. 문제는 그 <span className="hl">수소를 사오는 것 자체</span>도 쉽지 않다는 점이다.</>}
  >
    <Flow
      steps={[
        { no: '01', name: '가스 조달', sub: 'LNG · 바이오가스 등 — 가스공사 연료전지용 요금 적용' },
        { no: '02', name: '개질 → 수소', sub: '가스에서 수소를 뽑아낸다 (또는 수소를 직접 구매)' },
        { no: '03', name: '연료전지 구동', sub: '수소 100%로 전기화학 반응 → 전기 생산' },
        { no: '04', name: '전력 판매', sub: '수소발전 입찰시장 등 통해 거래', final: true },
      ]}
    />

    <Block label="가격 — 공식 사이트에서 확인한 값과 전달값" cols={3}>
      <Item
        k="연료전지용 천연가스 도매요금"
        d={<><b>24.4693원/MJ</b> (원료비 23.7889 + 공급비 0.6804, 부가세 별도) — <a href={LINK.kogasTariff} target="_blank" rel="noreferrer">한국가스공사 도매요금표</a></>}
        cite="2026.10.01 적용 · 가스공사 요금표 '연료전지용' 행"
        tone="green"
      />
      <Item
        k="수소발전 입찰시장 (전력거래소)"
        d={<>연료전지가 참여하는 전력 판매 입찰 — 일반수소 · 청정수소 두 시장. <a href={LINK.kpxH2Notice} target="_blank" rel="noreferrer">2025 일반수소 입찰 공고</a> · <a href={LINK.kpxH2Result} target="_blank" rel="noreferrer">2024 청정수소 결과</a> · <a href={LINK.chps} target="_blank" rel="noreferrer">입찰 시스템</a></>}
        cite="고정비·연료비를 원/kWh로 환산해 입찰, 20년 고정 정산 구조"
      />
      <Item
        k="전달값 400~500원"
        d="현장에서 들은 '가스 구매 입찰 가격'. 보도된 청정수소 낙찰단가(약 470원대/kWh)와 맞닿으나 어느 시장·어느 단위(원/kWh vs 원/m³)인지 원문 확인 필요."
        cite="미확인 — 확인 후 위 두 값 중 하나로 정리"
        tone="amber"
      />
    </Block>
  </ContentSlide>,

  /* 12. [PDF p2] ESS — 저장했다가 필요할 때 사용 */
  <ContentSlide
    key="s5"
    no="05"
    sec="ESS"
    title="ESS(에너지저장장치) — 저장했다가 필요할 때 사용"
    lede={<>싸고 남을 때 충전, 비싸고 부족할 때 방전</>}
  >
    <div className="ess">
      <div className="ess-left">
        <div className="ess-fig"><img src={`${G}/ess-container.png`} alt="ESS 컨테이너 구성 — 배터리 랙·PCS·BMS·EMS·공조소방" /></div>
        <div className="legend">
          <div className="lg"><span className="num">1</span><div><b>배터리 랙</b>전기 저장 · 용량 kWh</div></div>
          <div className="lg"><span className="num">2</span><div><b>PCS</b>충·방전 양방향 변환 · 출력 kW</div></div>
          <div className="lg"><span className="num teal">3</span><div><b>BMS</b>셀 전압·온도 감시, 배터리 보호</div></div>
          <div className="lg"><span className="num blue">4</span><div><b>EMS</b>충·방전 시점 결정하는 두뇌</div></div>
          <div className="lg"><span className="num">5</span><div><b>공조 · 소방</b>열 관리 · 화재 대응</div></div>
        </div>
        <span className="ess-ex">예) 1MW / 4MWh = 1MW로 4시간 방전</span>
      </div>
      <div className="ess-right">
        <div className="chart">
          <div className="chart-h"><b>24시간 부하 곡선과 충·방전 구간</b><small>전력 kW · 개념 곡선(예시)</small></div>
          <EssChart />
          <div className="chart-lg">
            <span><i style={{ background: '#0f172a', height: '2px' }} />공장 전력사용</span>
            <span><i style={{ background: 'rgba(245,158,11,.5)' }} />태양광 발전</span>
            <span><i style={{ background: 'rgba(20,184,166,.3)' }} />충전 구간</span>
            <span><i style={{ background: 'rgba(239,68,68,.25)' }} />방전 구간</span>
          </div>
        </div>
        <div className="uses">
          <div className="use"><span className="material-symbols-outlined">trending_down</span><b>피크 저감</b><p>최대수요 전력 감소 → 기본요금 절감</p></div>
          <div className="use"><span className="material-symbols-outlined">swap_horiz</span><b>부하 이동</b><p>경부하 충전·최대부하 방전 → 요금 차익</p></div>
          <div className="use"><span className="material-symbols-outlined">solar_power</span><b>재생에너지 연계</b><p>태양광 잉여 저장, 출력 변동 완화</p></div>
          <div className="use"><span className="material-symbols-outlined">hub</span><b>VPP 자원</b><p>여러 ESS를 묶어 하나의 발전소처럼 운영</p></div>
        </div>
      </div>
    </div>

    <Strip
      items={[
        { icon: 'battery_std', t: 'SOC 충전 상태 %', tone: 'teal' },
        { icon: 'monitor_heart', t: 'SOH 수명 상태 %', tone: 'teal' },
        { icon: 'swap_vert', t: '충 · 방전량', tone: 'teal' },
        { icon: 'notifications', t: 'PCS 상태 · 알람', tone: 'teal' },
        { icon: 'device_thermostat', t: '배터리 온도', tone: 'teal' },
        { icon: 'factory', t: '공장 전력사용량', tone: 'teal' },
      ]}
    />
  </ContentSlide>,

  /* 13. [전사] ESS 구성 심화 — PCS 양방향 그림 */
  <ContentSlide
    key="s5b"
    no="05"
    sec="ESS · 구성 요소"
    title="ESS는 대용량 배터리 — 다른 점은 늘 연결되어 있고, 한 곳에서 충전과 방전이 함께 일어난다는 것"
    lede={<>저장했다가 필요할 때 쓴다는 점은 배터리와 같다. 하지만 ESS는 계통·부하와 <b>실시간으로 연결</b>되어 있어 그 흐름을 <span className="hl">컨트롤하는 것</span>이 핵심이고, 그 자리가 PCS다.</>}
  >
    <div className="pcs">
      <div className="pnode dc">
        <span className="material-symbols-outlined">battery_charging_full</span>
        <b>배터리 랙</b>
        <small>DC · 전기를 담는 곳</small>
      </div>
      <svg className="parr" viewBox="0 0 200 120" aria-hidden>
        <defs>
          <marker id="ah-l" viewBox="0 0 10 10" refX="2" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M10 0 L0 5 L10 10 z" fill="#14b8a6" /></marker>
          <marker id="ah-r" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#ef4444" /></marker>
        </defs>
        <line x1="195" y1="38" x2="8" y2="38" stroke="#14b8a6" strokeWidth="4" markerEnd="url(#ah-l)" />
        <text x="100" y="26" textAnchor="middle" fontSize="13" fontWeight="800" fill="#0f766e">충전 · AC → DC</text>
        <line x1="5" y1="84" x2="192" y2="84" stroke="#ef4444" strokeWidth="4" markerEnd="url(#ah-r)" />
        <text x="100" y="108" textAnchor="middle" fontSize="13" fontWeight="800" fill="#b91c1c">방전 · DC → AC</text>
      </svg>
      <div className="pnode hub">
        <span className="material-symbols-outlined">swap_horiz</span>
        <b>PCS</b>
        <small>양방향 변환 · 24시간</small>
      </div>
      <svg className="parr" viewBox="0 0 200 120" aria-hidden>
        <line x1="195" y1="38" x2="8" y2="38" stroke="#14b8a6" strokeWidth="4" markerEnd="url(#ah-l)" />
        <line x1="5" y1="84" x2="192" y2="84" stroke="#ef4444" strokeWidth="4" markerEnd="url(#ah-r)" />
      </svg>
      <div className="pnode ac">
        <span className="material-symbols-outlined">factory</span>
        <b>공장 부하 · 한전 계통</b>
        <small>AC · 실제로 쓰는 전기</small>
      </div>
    </div>

    <div className="cmp">
      <div className="cmp-l"><b>비교 — 태양광 인버터</b><small>DC → AC 한 방향만 · 해가 떠 있는 낮에만 동작</small></div>
      <div className="route-line cmp-r">
        <Node icon="solar_power" name="태양광 모듈" sub="DC" kind="dc" />
        <span className="arr">⟶</span>
        <Node icon="swap_horiz" name="인버터" sub="DC → AC 단방향" kind="grid" />
        <span className="arr">⟶</span>
        <Node icon="factory" name="부하 · 계통" sub="AC" />
      </div>
    </div>

    <div className="five">
      <div className="sc"><div className="sc-t">1 · 저장</div><div className="sc-k">배터리 랙</div><div className="sc-d">컨테이너 안에 <b>랙마다 배터리</b>를 꽂는다(서버랙에 서버를 넣듯). 용량은 kWh.</div></div>
      <div className="sc mix"><div className="sc-t">2 · 변환</div><div className="sc-k">PCS</div><div className="sc-d">충전과 방전이 <b>같은 포인트</b>에서 일어나는 양방향 변환. 인버터와 구분해 이름을 따로 붙였다.</div></div>
      <div className="sc charge"><div className="sc-t">3 · 보호</div><div className="sc-k">BMS</div><div className="sc-d">배터리는 <b>셀 수십·수백 개의 합</b>. 셀의 전압·온도를 감시해 터지지 않게 보호.</div></div>
      <div className="sc"><div className="sc-t">+ · 그림에 빠진 것</div><div className="sc-k">PMS</div><div className="sc-d"><b>PCS를 관리</b>하는 시스템. 가이드 그림에는 없지만 따로 있다.</div></div>
      <div className="sc disch"><div className="sc-t">4 · 두뇌</div><div className="sc-k">EMS</div><div className="sc-d"><b>BMS와 PMS를 함께 관리</b>하며 충·방전 시점을 결정하고 명령한다. AI 기반이어야 한다.</div></div>
    </div>
  </ContentSlide>,

  /* 14. [전사] 왜 선 하나로 양방향인가 — 전압 × 전류, 호스·펌프 그림 */
  <ContentSlide
    key="s5c"
    no="05"
    sec="ESS · 전기의 특성"
    title="왜 선 하나로 양방향인가 — 전력은 전압 × 전류, 선이 하나면 전류만 키우면 된다"
    lede={<>선이 하나면 <b>전압은 고정</b>이고 전류만 바꾸면 된다. 급속 충전도 선을 늘리는 게 아니라 <span className="hl">전류를 늘리는 것</span> — 선을 둘로 하면 전기를 배로 쓰는 셈이 된다.</>}
  >
    <div className="formula">
      <div className="formula-eq">전력 = 전압 <span>×</span> 전류</div>
      <div className="formula-d">인버터에서 들어오는 값에도 <b>전압과 전류</b>가 있고, 그 곱이 전력(kW)이다. 선이 하나면 전압은 정해져 있으니 <b>흘려보내는 양(전류)</b>만 늘리면 더 많은 전력이 간다.</div>
    </div>

    <div className="hoses">
      <div className="hose ok">
        <div className="hose-h"><span className="tag green"><i />한 방향 · 펌프를 키운다</span></div>
        <svg viewBox="0 0 320 150" aria-hidden>
          <rect x="200" y="40" width="100" height="90" rx="8" fill="#eff6ff" stroke="#bfdbfe" strokeWidth="2" />
          <rect x="206" y="80" width="88" height="44" rx="4" fill="#93c5fd" opacity=".7" />
          <text x="250" y="68" textAnchor="middle" fontSize="12" fontWeight="700" fill="#1d4ed8">물탱크</text>
          <rect x="20" y="70" width="60" height="40" rx="8" fill="#0a162e" />
          <text x="50" y="95" textAnchor="middle" fontSize="12" fontWeight="800" fill="#fff">펌프↑</text>
          <path d="M80 90 H200" stroke="#14b8a6" strokeWidth="18" strokeLinecap="round" />
          <path d="M100 90 H185" stroke="#fff" strokeWidth="3" strokeDasharray="10 8" />
          <text x="140" y="60" textAnchor="middle" fontSize="12" fontWeight="800" fill="#0f766e">선 하나 · 전류만 ↑</text>
        </svg>
        <p>호스는 그대로 두고 <b>펌프를 좋은 걸 써서</b> 보내는 양만 늘린다. 공사도 없고, 집(설비)도 한 군데서만 받으니 오래 버틴다.</p>
      </div>
      <div className="hose bad">
        <div className="hose-h"><span className="tag red"><i />두 방향 · 호스를 하나 더</span></div>
        <svg viewBox="0 0 320 150" aria-hidden>
          <rect x="200" y="40" width="100" height="90" rx="8" fill="#eff6ff" stroke="#bfdbfe" strokeWidth="2" />
          <rect x="206" y="80" width="88" height="44" rx="4" fill="#93c5fd" opacity=".7" />
          <text x="250" y="68" textAnchor="middle" fontSize="12" fontWeight="700" fill="#1d4ed8">물탱크</text>
          <rect x="20" y="40" width="60" height="32" rx="8" fill="#0a162e" />
          <rect x="20" y="100" width="60" height="32" rx="8" fill="#0a162e" />
          <text x="50" y="61" textAnchor="middle" fontSize="11" fontWeight="800" fill="#fff">펌프</text>
          <text x="50" y="121" textAnchor="middle" fontSize="11" fontWeight="800" fill="#fff">펌프</text>
          <path d="M80 56 H200" stroke="#ef4444" strokeWidth="10" strokeLinecap="round" />
          <path d="M80 116 H200" stroke="#ef4444" strokeWidth="10" strokeLinecap="round" strokeDasharray="6 6" />
          <text x="140" y="90" textAnchor="middle" fontSize="12" fontWeight="800" fill="#b91c1c">선 둘 · 에너지 ×2</text>
        </svg>
        <p>호스(망)를 하나 더 놓으려면 <b>관 공사</b>를 새로 해야 하고, 두 줄이 충돌하지 않게 끊어 줘야 하며, 여러 군데서 동시에 들어오면 <b>설비가 빨리 늙는다</b>.</p>
      </div>
    </div>
  </ContentSlide>,

  /* 15. [전사] 부하 구간 띠 + EMS 시나리오 */
  <ContentSlide
    key="s5d"
    no="05"
    sec="ESS · 부하 구간과 판단"
    title="경부하·중간부하·최대부하 — 한전이 정한 요금 구간 위에서 EMS가 실시간으로 판단한다"
    lede={<>전기를 많이 쓰는 시간엔 요금을 더 부과한다. 한 선을 여럿이 쓰는 계통이 불안해지고 설비가 빨리 늙기 때문이다. EMS는 이 구간과 태양광·부하·배터리 상태를 보고 <span className="hl">충·방전을 그때그때 결정</span>한다.</>}
  >
    <div className="band">
      <svg viewBox="0 0 960 86" preserveAspectRatio="none" aria-hidden>
        <rect x="0" y="22" width="360" height="30" fill="#d1fae5" />
        <rect x="360" y="22" width="120" height="30" fill="#fef3c7" />
        <rect x="480" y="22" width="160" height="30" fill="#334155" />
        <rect x="640" y="22" width="320" height="30" fill="#fef3c7" />
        <text x="180" y="42" textAnchor="middle" fontSize="14" fontWeight="800" fill="#047857">경부하 — 전기를 안 쓸 때 · 요금 가장 낮음</text>
        <text x="420" y="42" textAnchor="middle" fontSize="14" fontWeight="800" fill="#b45309">중간부하</text>
        <text x="560" y="42" textAnchor="middle" fontSize="14" fontWeight="800" fill="#fff">최대부하 — 가장 높음</text>
        <text x="800" y="42" textAnchor="middle" fontSize="14" fontWeight="800" fill="#b45309">중간부하 — 적절히 쓰는 때</text>
        {[0, 3, 6, 9, 12, 15, 18, 21, 24].map((h) => (
          <g key={h}>
            <line x1={h * 40} y1="52" x2={h * 40} y2="60" stroke="#c3ccda" strokeWidth="1.5" />
            <text x={h * 40} y="76" textAnchor="middle" fontSize="12" fill="#8a94a6">{h === 24 ? '24시' : h}</text>
          </g>
        ))}
        <text x="0" y="14" fontSize="12" fontWeight="700" fill="#8a94a6">한전이 지정한 구간 — 많이 쓰면 선이 노후화되므로 그 비용을 요금으로</text>
      </svg>
    </div>

    <div className="scen">
      <div className="sc charge"><div className="sc-t">밤 · 경부하</div><div className="sc-k">충전</div><div className="sc-d">해가 없고 전기도 많이 안 쓴다. <b>방전할 필요가 전혀 없으니</b> 충전만.</div></div>
      <div className="sc mix"><div className="sc-t">낮 · 발전 + 사용</div><div className="sc-k">방전, 또는 충전하며 방전</div><div className="sc-d">기본은 방전. <b>배터리에 남은 용량이 없으면</b> 충전하면서 방전해야 할 수도 — 배터리 상태에 따라.</div></div>
      <div className="sc charge"><div className="sc-t">최대부하 · 발전 많음</div><div className="sc-k">그림은 '충전'을 택했다</div><div className="sc-d">보통은 방전이 낫다. 그런데 충전을 택했다면 <b>왜인지 생각해야 한다</b> — 배터리가 비어 있었을 것.</div></div>
      <div className="sc disch"><div className="sc-t">날씨 변동</div><div className="sc-k">실시간 재판단</div><div className="sc-d">비·눈·구름이면 태양광 곡선이 <b>완만해진다</b>. 그때도 즉각 다시 판단 — 하나의 시나리오로 끝나지 않는다.</div></div>
    </div>

    <p className="coda">
      "몇 시부터 몇 시까지 충전, 용량이 얼마일 때 충전" 같은 <b>코딩 규칙으로는 안 된다</b>. 예전엔 그렇게 했고 화재가 났다. 언제 어느 방향으로 바꿀지 모르기 때문에 EMS는 <b>AI로 즉각 판단</b>해야 한다 — ESS가 어렵다고 하는 이유.
    </p>
  </ContentSlide>,

  /* 16. [전사] 수집 데이터 → EMS → 판단 (허브 그림) */
  <ContentSlide
    key="s5e"
    no="05"
    sec="ESS · 수집 데이터"
    title="수집 데이터 여섯 가지 — 전부 EMS로 모여 충전·방전·차단을 결정하는 근거가 된다"
    lede={<>데이터는 그 자체가 목적이 아니다. 여섯 가지를 <b>한 번에 보고</b> 충전할지, 방전할지, 멈출지를 <span className="hl">즉각 결정</span>하는 것이 EMS의 일이다.</>}
  >
    <div className="hub">
      <div className="hub-in">
        <div className="hchip"><span className="material-symbols-outlined">battery_std</span><div><b>SOC · 충전 상태 %</b><small>지금 얼마나 차 있나 — 판단의 출발점</small></div></div>
        <div className="hchip"><span className="material-symbols-outlined">monitor_heart</span><div><b>SOH · 수명 상태 %</b><small>설치 후 얼마나 버티고 효율이 어떤지</small></div></div>
        <div className="hchip"><span className="material-symbols-outlined">swap_vert</span><div><b>충 · 방전량</b><small>지금 충전·방전이 각각 얼마나 — 동시에 일어난다</small></div></div>
        <div className="hchip"><span className="material-symbols-outlined">notifications</span><div><b>PCS 상태 · 알람</b><small>PMS가 보는 값</small></div></div>
        <div className="hchip warn"><span className="material-symbols-outlined">device_thermostat</span><div><b>배터리 온도</b><small>과열이면 충전을 계속할 수 없다</small></div></div>
        <div className="hchip"><span className="material-symbols-outlined">factory</span><div><b>공장 전력사용량</b><small>전기가 부족한지 알아야 방전을 정한다</small></div></div>
      </div>
      <svg className="hub-arr" viewBox="0 0 120 400" preserveAspectRatio="none" aria-hidden>
        {[33, 100, 167, 233, 300, 367].map((y) => <path key={y} d={`M0 ${y} C 60 ${y}, 60 200, 120 200`} fill="none" stroke="#c3ccda" strokeWidth="2" />)}
      </svg>
      <div className="hub-core">
        <div className="q-ic big"><span className="material-symbols-outlined">psychology</span></div>
        <b>EMS</b>
        <small>BMS + PMS를 함께 보는 두뇌 · AI</small>
      </div>
      <svg className="hub-arr" viewBox="0 0 120 400" preserveAspectRatio="none" aria-hidden>
        {[110, 200, 290].map((y) => <path key={y} d={`M0 200 C 60 200, 60 ${y}, 120 ${y}`} fill="none" stroke="#c3ccda" strokeWidth="2" />)}
      </svg>
      <div className="hub-out">
        <div className="hout charge"><span className="material-symbols-outlined">battery_charging_full</span><b>충전</b><small>싸고 남을 때</small></div>
        <div className="hout disch"><span className="material-symbols-outlined">bolt</span><b>방전</b><small>비싸고 부족할 때</small></div>
        <div className="hout stop"><span className="material-symbols-outlined">block</span><b>차단</b><small>과열 · 이상 — 화재 예방</small></div>
      </div>
    </div>
  </ContentSlide>,

  /* 17. 마무리 */
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
      <PptExportButton total={total} current={idx} goTo={setIdx} fileName="20261001_COM_학습_개념_에너지개념정리_v1.pptx" />

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
