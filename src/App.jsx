import { XssDemo } from './components/XssDemo.jsx'

export default function App() {
  return (
    <div className="page">
      <header className="header">
        <div>
          <div className="title">React XSS AppSec Demo</div>
          <div className="subtitle">
            DOM-based XSS via <code>dangerouslySetInnerHTML</code> + mitigation with{' '}
            <code>DOMPurify.sanitize()</code>
          </div>
        </div>
      </header>

      <main className="content">
        <XssDemo />
      </main>

      <footer className="footer">
        Educational demo only. Do not use vulnerable patterns in production.
      </footer>
    </div>
  )
}
