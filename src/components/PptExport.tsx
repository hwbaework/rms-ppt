'use client'

// ── 공용 PPT 내보내기 버튼 ──
// 슬라이드를 한 장씩 넘기며 화면을 사진처럼 캡처해 16:9 .pptx로 저장한다.
// 사용(모든 플레이어 공통): <PptExportButton total={total} current={idx} goTo={setIdx} fileName="....pptx" />
// 캡처 대상은 document.body — 네비·버튼류 UI는 SKIP 클래스 또는 data-noexport 속성으로 캡처에서 제외.

import { useCallback, useEffect, useState } from 'react'

// 캡처에서 제외할 클래스 (각 덱 플레이어의 네비 · 진행바 · 버튼 관례 이름)
const SKIP = ['nav', 'fs-btn', 'ppt-btn', 'progress', 'export-veil', 'pex-btn', 'pex-veil']

const PEX_CSS = `
.pex-btn{color:#fff;cursor:pointer;z-index:1001;opacity:.35;background:rgba(0,0,0,.45);border:none;border-radius:8px;justify-content:center;align-items:center;height:34px;padding:0 10px;font-size:11px;font-weight:800;letter-spacing:.04em;transition:opacity .3s;display:flex;position:fixed;top:12px;right:56px}
.pex-btn:hover{background:rgba(0,0,0,.7);opacity:1}
.pex-btn:disabled{cursor:default;opacity:.25}
.pex-veil{position:fixed;top:12px;left:50%;transform:translateX(-50%);z-index:1002;background:rgba(10,18,32,.88);border:1px solid rgba(255,255,255,.14);border-radius:999px;padding:7px 18px;color:#fff;font-size:13px;font-weight:700;display:flex;align-items:center;gap:8px;-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px)}
.pex-veil i{width:7px;height:7px;border-radius:50%;background:#60a5fa;animation:pexpulse 1.2s ease-in-out infinite}
@keyframes pexpulse{0%,100%{opacity:.35}50%{opacity:1}}
`

export default function PptExportButton({
  total,
  current,
  goTo,
  fileName,
  delay = 1100,
}: {
  total: number
  current: number
  goTo: (i: number) => void
  /** 저장 파일명 — 생략 시 오늘 날짜 기반 기본값 */
  fileName?: string
  /** 장당 대기(ms) — 등장 애니메이션이 끝나길 기다렸다 캡처 */
  delay?: number
}) {
  const [prog, setProg] = useState<{ done: number; total: number } | null>(null)

  // iframe 원격 조종 수신부 — 이 컴포넌트는 iframe 안에 뜬 덱에도 렌더되므로,
  // 부모 창이 보내는 슬라이드 이동 메시지를 받아 자기 플레이어의 goTo를 호출한다.
  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      const d = e.data as { __pptGoto?: number } | null
      if (d && typeof d.__pptGoto === 'number') goTo(d.__pptGoto)
    }
    window.addEventListener('message', onMsg)
    return () => window.removeEventListener('message', onMsg)
  }, [goTo])

  const run = useCallback(async () => {
    if (prog) return
    setProg({ done: 0, total })
    // 창 크기와 무관하게 항상 같은 결과가 나오도록 — 화면 밖에 1920×1080 고정 iframe으로
    // 같은 덱을 하나 더 띄워 그쪽을 캡처한다. (vw 기반 덱이라 iframe 뷰포트 기준으로 렌더됨)
    const W = 1920
    const H = 1080
    const frame = document.createElement('iframe')
    frame.style.cssText = `position:fixed;left:-${W + 100}px;top:0;width:${W}px;height:${H}px;border:0;visibility:visible;pointer-events:none`
    frame.src = window.location.pathname + window.location.search
    document.body.appendChild(frame)
    try {
      const { domToPng } = await import('modern-screenshot')
      await new Promise<void>((resolve) => {
        frame.onload = () => resolve()
        setTimeout(resolve, 15000) // 로드가 늦어도 계속 진행
      })
      // 하이드레이션(클라이언트 렌더) 대기
      await new Promise((r) => setTimeout(r, 1500))
      const win = frame.contentWindow
      const doc = frame.contentDocument
      if (!win || !doc) throw new Error('iframe 문서에 접근할 수 없습니다')
      const filter = (node: Node) => {
        const el = node as HTMLElement
        if (el.getAttribute?.('data-noexport') != null) return false
        const cl = el.classList
        return !(cl && SKIP.some((c) => cl.contains(c)))
      }
      // 워밍업 패스 — 전 슬라이드를 빠르게 한 바퀴 돌아 폰트 서브셋·이미지를 미리 로딩.
      // (Pretendard는 글자가 처음 화면에 나올 때 조각을 받아와서, 이 과정 없이 찍으면
      //  일부 글자가 대체 폰트 폭으로 계산돼 줄바꿈이 미묘하게 밀린다)
      for (let i = 0; i < total; i++) {
        win.postMessage({ __pptGoto: i }, '*')
        await new Promise((r) => setTimeout(r, 300))
      }
      await doc.fonts?.ready
      const shots: string[] = []
      for (let i = 0; i < total; i++) {
        win.postMessage({ __pptGoto: i }, '*')
        await new Promise((r) => setTimeout(r, delay))
        await doc.fonts?.ready
        shots.push(await domToPng(doc.body, { scale: 2560 / W, filter }))
        setProg({ done: i + 1, total })
      }
      const PptxGenJS = (await import('pptxgenjs')).default
      const pptx = new PptxGenJS()
      pptx.defineLayout({ name: 'WIDE', width: 13.333, height: 7.5 })
      pptx.layout = 'WIDE'
      // 1920×1080 = 정확히 16:9 → 슬라이드에 여백 없이 꽉 참
      for (const data of shots) {
        const s = pptx.addSlide()
        s.background = { color: '0B1220' }
        s.addImage({ data, x: 0, y: 0, w: 13.333, h: 7.5 })
      }
      const t = new Date()
      const ymd = `${t.getFullYear()}${String(t.getMonth() + 1).padStart(2, '0')}${String(t.getDate()).padStart(2, '0')}`
      await pptx.writeFile({ fileName: fileName ?? `${ymd}_slides_v1.pptx` })
    } catch (err) {
      console.error('[PPT EXPORT]', err)
      alert('PPT 내보내기에 실패했습니다. 콘솔을 확인해주세요.')
    } finally {
      frame.remove()
      setProg(null)
    }
  }, [prog, total, fileName, delay])

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: PEX_CSS }} />
      <button className="pex-btn" aria-label="PPT로 내보내기" disabled={!!prog} onClick={run}>
        PPT
      </button>
      {prog && (
        <div className="pex-veil">
          <i />
          PPT 내보내는 중 — {prog.done} / {prog.total}
        </div>
      )}
    </>
  )
}
