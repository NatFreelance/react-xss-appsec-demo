import { useMemo, useState } from 'react'
import DOMPurify from 'dompurify'

const DEFAULT_INPUT = `<p>Hello!</p>
<p>Select an attack and click <strong>Run</strong>.</p>`

const ATTACK_1 = {
  id: 'attack1',
  label: 'Attack 1: <img onerror>',
  payload: `<p>DOM XSS test (Attack 1)</p><img src="x" onerror="alert('XSS: onerror executed')" />`,
  expected: `Expected behavior (Vulnerable): an alert should pop up ("XSS: onerror executed"). This indicates attacker-controlled JS execution in the browser (DOM XSS).`,
}

const ATTACK_2 = {
  id: 'attack2',
  label: 'Attack 2: <svg onload>',
  payload: `<p>DOM XSS test (Attack 2)</p><svg xmlns="http://www.w3.org/2000/svg" onload="alert('XSS: onload executed')"></svg>`,
  expected: `Expected behavior (Vulnerable): an alert should pop up ("XSS: onload executed"). This indicates attacker-controlled JS execution in the browser (DOM XSS).`,
}

export function XssDemo() {
  const [mode, setMode] = useState('vulnerable') // 'vulnerable' | 'sanitized'
  const [selectedAttackId, setSelectedAttackId] = useState(ATTACK_1.id)
  const [draftInput, setDraftInput] = useState(ATTACK_1.payload)
  const [appliedInput, setAppliedInput] = useState(DEFAULT_INPUT)
  const [runMessage, setRunMessage] = useState('')

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
    if (/\sonload\s*=/i.test(appliedInput) && !/\sonload\s*=/i.test(sanitizedHtml))
      removed.push('Removed inline event handler (onload)')
    if (/javascript:/i.test(appliedInput) && !/javascript:/i.test(sanitizedHtml))
      removed.push('Removed javascript: URL')
    if (removed.length === 0) removed.push('Sanitized output differs from input')
    return removed
  }, [changedBySanitizer, appliedInput, sanitizedHtml])

  const selectedAttack = selectedAttackId === ATTACK_2.id ? ATTACK_2 : ATTACK_1

  function selectAttack(nextId) {
    setSelectedAttackId(nextId)
    const next = nextId === ATTACK_2.id ? ATTACK_2 : ATTACK_1
    setDraftInput(next.payload)
    setRunMessage('')
  }

  function run() {
    setAppliedInput(draftInput)
    if (mode === 'vulnerable') {
      setRunMessage(`${selectedAttack.label}\n\n✅ ${selectedAttack.expected}`)
    } else {
      setRunMessage('')
    }
  }

  return (
    <section className="card">
      <div className="cardHeader">
        <div>
          <div className="cardTitle">Mode</div>
          <div className="cardSubtitle">
            Vulnerable mode renders attacker-controlled HTML. Sanitized mode uses{' '}
            <code>DOMPurify.sanitize()</code>.
          </div>
        </div>
        <div className="segmented" role="group" aria-label="Mode">
          <button
            type="button"
            className={mode === 'vulnerable' ? 'segmentedBtn active' : 'segmentedBtn'}
            onClick={() => {
              setMode('vulnerable')
              setRunMessage('')
            }}
          >
            Vulnerable
          </button>
          <button
            type="button"
            className={mode === 'sanitized' ? 'segmentedBtn active' : 'segmentedBtn'}
            onClick={() => {
              setMode('sanitized')
              setRunMessage('')
            }}
          >
            Sanitized (DOMPurify)
          </button>
        </div>
      </div>

      <div className="grid">
        <div className="panel">
          <div className="panelTitle">Input (attacker-controlled)</div>
          <div className="toolbar">
            <button
              type="button"
              className={selectedAttackId === ATTACK_1.id ? 'btn btnSelected' : 'btn'}
              onClick={() => selectAttack(ATTACK_1.id)}
              title="Uses <img onerror> which reliably executes in vulnerable mode"
            >
              Attack 1
            </button>
            <button
              type="button"
              className={selectedAttackId === ATTACK_2.id ? 'btn btnSelected' : 'btn'}
              onClick={() => selectAttack(ATTACK_2.id)}
              title="Uses <svg onload> which reliably executes in vulnerable mode"
            >
              Attack 2
            </button>
            <button
              type="button"
              className="btn btnPrimary"
              onClick={run}
              title="Apply input and render (Run)"
            >
              Run
            </button>
            <button
              type="button"
              className="btn btnGhost"
              onClick={() => {
                selectAttack(ATTACK_1.id)
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
            Flow: pick <strong>Attack 1</strong> or <strong>Attack 2</strong>, then click{' '}
            <strong>Run</strong>. In vulnerable mode you should see an alert. In sanitized mode you
            should not.
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

        {mode === 'vulnerable' && runMessage ? (
          <div className="runMessage">
            <div className="runMessageTitle">Run result</div>
            <div className="runMessageBody">{runMessage}</div>
          </div>
        ) : null}

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

