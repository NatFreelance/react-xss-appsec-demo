import { useMemo, useState } from 'react'
import DOMPurify from 'dompurify'

const DEFAULT_INPUT = `<p>Hello!</p>
<p>Try payload:</p>
<pre>&lt;script&gt;alert('XSS')&lt;/script&gt;</pre>`

const PAYLOAD_SCRIPT = `<p>DOM XSS test:</p><script>alert('XSS')</script>`
const PAYLOAD_IMG_ONERROR = `<p>DOM XSS test:</p><img src="x" onerror="alert('XSS via onerror')" />`

export function XssDemo() {
  const [mode, setMode] = useState('vulnerable') // 'vulnerable' | 'sanitized'
  const [input, setInput] = useState(DEFAULT_INPUT)

  const sanitizedHtml = useMemo(() => DOMPurify.sanitize(input), [input])
  const renderedHtml = mode === 'sanitized' ? sanitizedHtml : input
  const changedBySanitizer = sanitizedHtml !== input
  const removedChars = Math.max(0, input.length - sanitizedHtml.length)
  const reducedPercent = input.length > 0 ? Math.round((removedChars / input.length) * 100) : 0

  const changeSummary = useMemo(() => {
    if (!changedBySanitizer) return []
    const removed = []
    if (/<script[\s>]/i.test(input) && !/<script[\s>]/i.test(sanitizedHtml)) removed.push('Removed <script> tag')
    if (/\sonerror\s*=/i.test(input) && !/\sonerror\s*=/i.test(sanitizedHtml)) removed.push('Removed inline event handler (onerror)')
    if (/javascript:/i.test(input) && !/javascript:/i.test(sanitizedHtml)) removed.push('Removed javascript: URL')
    if (removed.length === 0) removed.push('Sanitized output differs from input')
    return removed
  }, [changedBySanitizer, input, sanitizedHtml])

  return (
    <section className="card">
      <div className="cardHeader">
        <div>
          <div className="cardTitle">Live demo</div>
          <div className="statusRow">
            <span className={mode === 'sanitized' ? 'badge badgeOk' : 'badge badgeDanger'}>
              Sanitization: {mode === 'sanitized' ? 'ON' : 'OFF'}
            </span>
            <span className="badge badgeNeutral">
              {changedBySanitizer ? 'Input contains risky HTML' : 'No sanitizer changes detected'}
            </span>
            {changedBySanitizer ? (
              <span className="badge badgeNeutral">
                Δ chars: -{removedChars} ({reducedPercent}%)
              </span>
            ) : null}
          </div>
        </div>
        <div className="segmented" role="group" aria-label="Render mode">
          <button
            type="button"
            className={mode === 'vulnerable' ? 'segmentedBtn active' : 'segmentedBtn'}
            onClick={() => setMode('vulnerable')}
          >
            Vulnerable
          </button>
          <button
            type="button"
            className={mode === 'sanitized' ? 'segmentedBtn active' : 'segmentedBtn'}
            onClick={() => setMode('sanitized')}
          >
            Sanitized (DOMPurify)
          </button>
        </div>
      </div>

      <div className="grid">
        <div className="panel">
          <div className="panelTitle">Input (attacker-controlled)</div>
          <div className="toolbar">
            <button type="button" className="btn" onClick={() => setInput(PAYLOAD_SCRIPT)}>
              Insert &lt;script&gt; payload
            </button>
            <button type="button" className="btn" onClick={() => setInput(PAYLOAD_IMG_ONERROR)}>
              Insert onerror payload
            </button>
            <button type="button" className="btn btnGhost" onClick={() => setInput(DEFAULT_INPUT)}>
              Reset
            </button>
          </div>
          <textarea
            className="textarea"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
          />
          <div className="hint">
            In <strong>Vulnerable</strong> mode, this is rendered directly via{' '}
            <code>dangerouslySetInnerHTML</code>. Switch to <strong>Sanitized</strong> to apply{' '}
            <code>DOMPurify.sanitize()</code>.
          </div>

          {changedBySanitizer ? (
            <div className="notice">
              <div className="noticeTitle">What DOMPurify would change</div>
              <ul className="noticeList">
                {changeSummary.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <div className="panel">
          <div className="panelTitle">Rendered output</div>
          <div
            className={mode === 'vulnerable' ? 'output outputDanger' : 'output outputSafe'}
            dangerouslySetInnerHTML={{ __html: renderedHtml }}
          />
          <div className="hint">Mode: <strong>{mode}</strong></div>

          <div className="splitTitle">Raw vs sanitized (for screenshots)</div>
          <div className="split">
            <div className="splitBox">
              <div className="splitLabel">Raw input</div>
              <pre className="codeBox">{input}</pre>
            </div>
            <div className="splitBox">
              <div className="splitLabel">Sanitized output</div>
              <pre className="codeBox">{sanitizedHtml}</pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

