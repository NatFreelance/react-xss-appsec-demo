import { useMemo, useState } from 'react'
import DOMPurify from 'dompurify'

const DEFAULT_INPUT = `<p>Hello!</p>
<p>Try payload:</p>
<pre>&lt;script&gt;alert('XSS')&lt;/script&gt;</pre>`

const PAYLOAD_SCRIPT = `<p>DOM XSS test:</p><script>alert('XSS')</script>`
const PAYLOAD_IMG_ONERROR = `<p>DOM XSS test:</p><img src="x" onerror="alert('XSS via onerror')" />`

export function XssDemo() {
  const [mode, setMode] = useState('vulnerable') // 'vulnerable' | 'sanitized'
  const [draftInput, setDraftInput] = useState(DEFAULT_INPUT)
  const [appliedInput, setAppliedInput] = useState(DEFAULT_INPUT)

  const sanitizedHtml = useMemo(() => DOMPurify.sanitize(appliedInput), [appliedInput])
  const renderedHtml = mode === 'sanitized' ? sanitizedHtml : appliedInput
  const changedBySanitizer = sanitizedHtml !== appliedInput
  const removedChars = Math.max(0, appliedInput.length - sanitizedHtml.length)
  const reducedPercent =
    appliedInput.length > 0 ? Math.round((removedChars / appliedInput.length) * 100) : 0

  const changeSummary = useMemo(() => {
    if (!changedBySanitizer) return []
    const removed = []
    if (/<script[\s>]/i.test(appliedInput) && !/<script[\s>]/i.test(sanitizedHtml))
      removed.push('Removed <script> tag')
    if (/\sonerror\s*=/i.test(appliedInput) && !/\sonerror\s*=/i.test(sanitizedHtml))
      removed.push('Removed inline event handler (onerror)')
    if (/javascript:/i.test(appliedInput) && !/javascript:/i.test(sanitizedHtml))
      removed.push('Removed javascript: URL')
    if (removed.length === 0) removed.push('Sanitized output differs from input')
    return removed
  }, [changedBySanitizer, appliedInput, sanitizedHtml])

  return (
    <section className="card">
      <div className="cardHeader">
        <div>
          <div className="cardTitle">Mode</div>
          <div className="cardSubtitle">
            Choose render mode, then click <strong>Submit</strong>.
          </div>
        </div>
        <div className="segmented" role="group" aria-label="Mode">
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
            <button type="button" className="btn" onClick={() => setDraftInput(PAYLOAD_SCRIPT)}>
              Insert &lt;script&gt;
            </button>
            <button type="button" className="btn" onClick={() => setDraftInput(PAYLOAD_IMG_ONERROR)}>
              Insert onerror
            </button>
            <button
              type="button"
              className="btn btnPrimary"
              onClick={() => setAppliedInput(draftInput)}
              title="Apply input and render"
            >
              Submit
            </button>
            <button
              type="button"
              className="btn btnGhost"
              onClick={() => {
                setDraftInput(DEFAULT_INPUT)
                setAppliedInput(DEFAULT_INPUT)
              }}
            >
              Reset
            </button>
          </div>
          <textarea
            className="textarea"
            value={draftInput}
            onChange={(e) => setDraftInput(e.target.value)}
            spellCheck={false}
          />
          <div className="hint">
            Rendering uses <code>dangerouslySetInnerHTML</code>. In sanitized mode,{' '}
            <code>DOMPurify.sanitize()</code> is applied before rendering.
          </div>
        </div>

        <div className="panel">
          <div className="panelTitle">Rendered output</div>
          <div
            className={mode === 'vulnerable' ? 'output outputDanger' : 'output outputSafe'}
            dangerouslySetInnerHTML={{ __html: renderedHtml }}
          />
          <div className="splitTitle">Raw vs sanitized (for screenshots)</div>
          <div className="split">
            <div className="splitBox">
              <div className="splitLabel">Applied input (raw)</div>
              <pre className="codeBox">{appliedInput}</pre>
            </div>
            <div className="splitBox">
              <div className="splitLabel">Sanitized output</div>
              <pre className="codeBox">{sanitizedHtml}</pre>
            </div>
          </div>
        </div>
      </div>

      <div className="cardFooter">
        <div className="statusRow">
          <span className={mode === 'sanitized' ? 'badge badgeOk' : 'badge badgeDanger'}>
            Sanitization: {mode === 'sanitized' ? 'ON' : 'OFF'}
          </span>
          <span className="badge badgeNeutral">
            {changedBySanitizer ? 'DOMPurify changed the applied input' : 'No sanitizer changes detected'}
          </span>
          {changedBySanitizer ? (
            <span className="badge badgeNeutral">
              Δ chars: -{removedChars} ({reducedPercent}%)
            </span>
          ) : null}
        </div>

        {changedBySanitizer ? (
          <div className="notice">
            <div className="noticeTitle">What DOMPurify changed (high level)</div>
            <ul className="noticeList">
              {changeSummary.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  )
}

