import { useMemo, useState } from 'react'
import DOMPurify from 'dompurify'

const DEFAULT_INPUT = `<p>Hello!</p>
<p>Try payload:</p>
<pre>&lt;script&gt;alert('XSS')&lt;/script&gt;</pre>`

export function XssDemo() {
  const [mode, setMode] = useState('vulnerable') // 'vulnerable' | 'sanitized'
  const [input, setInput] = useState(DEFAULT_INPUT)

  const renderedHtml = useMemo(() => {
    if (mode === 'sanitized') return DOMPurify.sanitize(input)
    return input
  }, [input, mode])

  return (
    <section className="card">
      <div className="cardHeader">
        <div className="cardTitle">Live demo</div>
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
          <textarea
            className="textarea"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
          />
          <div className="hint">
            In <strong>Vulnerable</strong> mode, this is rendered directly via{' '}
            <code>dangerouslySetInnerHTML</code>.
          </div>
        </div>

        <div className="panel">
          <div className="panelTitle">Rendered output</div>
          <div
            className={mode === 'vulnerable' ? 'output outputDanger' : 'output outputSafe'}
            dangerouslySetInnerHTML={{ __html: renderedHtml }}
          />
          <div className="hint">
            Mode: <strong>{mode}</strong>
          </div>
        </div>
      </div>
    </section>
  )
}

