import { Link } from 'react-router-dom'

const capabilities = [
  {
    icon: '⚖️',
    title: 'Current Rule Engine',
    description:
      'Resolves conflicts between old and new circulars using status, date, and authority metadata — so your team always acts on the right version.',
  },
  {
    icon: '🔍',
    title: 'Evidence-First Answers',
    description:
      'Every answer includes source title, section, and page number so officers can verify before acting. No black-box conclusions.',
  },
  {
    icon: '🛡️',
    title: 'Insufficient Evidence Guard',
    description:
      'If the knowledge base cannot support a claim, VeriRule reports uncertainty instead of hallucinating — protecting you from false confidence.',
  },
  {
    icon: '📋',
    title: 'Audit-Ready Trail',
    description:
      'Query, retrieved chunks, and citations are logged for transparent internal and external audits. Every decision is traceable.',
  },
]

const audience = [
  {
    tag: 'Risk',
    role: 'Risk Officers',
    value:
      'Find governing rules faster with explainable answers and direct source proof. Reduce time spent manually searching policy documents.',
  },
  {
    tag: 'Compliance',
    role: 'Compliance Managers',
    value:
      'Track policy usage patterns and catch dependence on superseded guidance before it becomes a regulatory liability.',
  },
  {
    tag: 'Audit',
    role: 'Internal Audit Teams',
    value:
      'Trace each compliance conclusion to approved documents and evidence snapshots. Present audit-ready trails with confidence.',
  },
]

const stages = [
  {
    step: '01',
    title: 'Ingest',
    text: 'Upload circulars, policy docs, regulatory updates, and audit reports with rich metadata tagging.',
  },
  {
    step: '02',
    title: 'Retrieve',
    text: 'Hybrid semantic retrieval finds the most relevant chunks for each user question, ranked by authority.',
  },
  {
    step: '03',
    title: 'Resolve',
    text: 'Status and supersession logic determines which rule is currently applicable, surfacing conflicts clearly.',
  },
  {
    step: '04',
    title: 'Answer',
    text: 'A grounded response is generated with citations and confidence-aware behavior — never a guess.',
  },
]

const stats = [
  { value: '100%', label: 'Source-cited answers' },
  { value: 'Zero', label: 'Hallucinated guidance' },
  { value: 'Real-time', label: 'Policy conflict detection' },
]

function LandingPage() {
  return (
    <>
      {/* Animated background */}
      <div className="bg-mesh" aria-hidden="true">
        <div className="bg-mesh-mid" />
      </div>
      <div className="bg-grid" aria-hidden="true" />

      <div className="landing-shell">
        {/* ── Navbar ─────────────────────────────────────────── */}
        <header className="topbar">
          <Link to="/" className="logo-wrap" aria-label="VeriRule home">
            <img src="/logo.svg" alt="VeriRule shield logo" className="logo-icon" />
            <span className="logo-name">
              Veri<span>Rule</span>
            </span>
          </Link>

          <nav className="desktop-nav" aria-label="Primary navigation">
            <a href="#platform">Platform</a>
            <a href="#capabilities">Capabilities</a>
            <a href="#process">Process</a>
            <a href="#contact">Contact</a>
          </nav>

          <div className="topbar-actions">
            <Link to="/signin" className="btn btn-secondary btn-sm">
              Sign in
            </Link>
            <Link to="/signup" className="btn btn-primary btn-sm">
              Get access
            </Link>
          </div>
        </header>

        {/* ── Hero ───────────────────────────────────────────── */}
        <section className="hero" id="platform" aria-labelledby="hero-title">
          <div className="nav-pill animate-up delay-1">AI-Powered · Banking Grade</div>

          <h1 id="hero-title" className="hero-headline animate-up delay-2">
            Compliance decisions
            <br />
            <span className="gradient-text">with source confidence</span>
          </h1>

          <p className="hero-description animate-up delay-3">
            VeriRule gives your team a single place to ask, verify, and explain compliance rules. Built for banking
            workflows where evidence quality matters more than confident-sounding text.
          </p>

          <div className="hero-actions animate-up delay-3">
            <Link to="/signup" className="btn btn-primary btn-lg">
              Start free pilot
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </Link>
            <a href="#capabilities" className="btn btn-ghost btn-lg">
              See capabilities
            </a>
          </div>

          {/* Stats strip */}
          <div className="stats-strip animate-up delay-4">
            {stats.map((s) => (
              <div className="stat-item" key={s.label}>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Trust strip ────────────────────────────────────── */}
        <div className="trust-strip animate-up delay-2" aria-label="Trust indicators">
          {[
            'Built for regulated banking environments',
            'Explainability and traceability first',
            'Supports compliance, risk, and audit',
          ].map((item) => (
            <div className="trust-item" key={item}>
              <span className="trust-dot" aria-hidden="true" />
              {item}
            </div>
          ))}
        </div>

        {/* ── Capabilities ───────────────────────────────────── */}
        <section className="section" id="capabilities" aria-labelledby="cap-title">
          <div className="section-header">
            <p className="eyebrow animate-up delay-1">Core capabilities</p>
            <h2 id="cap-title" className="section-title animate-up delay-2">
              Everything for compliance-focused
              <br />AI retrieval
            </h2>
            <p className="section-desc animate-up delay-3">
              From ingestion to citation, VeriRule is purpose-built for the precision that regulated environments demand.
            </p>
          </div>

          <div className="capability-grid">
            {capabilities.map((item, i) => (
              <article
                className={`capability-card glass animate-up delay-${(i % 3) + 2}`}
                key={item.title}
              >
                <div className="cap-icon" aria-hidden="true">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ── Process ────────────────────────────────────────── */}
        <section className="section" id="process" aria-labelledby="process-title">
          <div className="section-header">
            <p className="eyebrow animate-up delay-1">How it works</p>
            <h2 id="process-title" className="section-title animate-up delay-2">
              A four-stage compliance
              <br />intelligence flow
            </h2>
          </div>

          <div className="stage-grid">
            {stages.map((item, i) => (
              <article
                className={`stage-card glass animate-up delay-${i + 1}`}
                key={item.step}
              >
                <div className="stage-number" aria-label={`Step ${item.step}`}>{item.step}</div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ── Audience ───────────────────────────────────────── */}
        <section className="section" aria-labelledby="audience-title">
          <div className="section-header">
            <p className="eyebrow animate-up delay-1">Who benefits</p>
            <h2 id="audience-title" className="section-title animate-up delay-2">
              Designed for every decision maker
              <br />in the compliance chain
            </h2>
          </div>

          <div className="audience-grid">
            {audience.map((item, i) => (
              <article
                className={`audience-card glass animate-up delay-${(i % 3) + 1}`}
                key={item.role}
              >
                <div className="audience-tag">{item.tag}</div>
                <h3>{item.role}</h3>
                <p>{item.value}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ── CTA ────────────────────────────────────────────── */}
        <section className="cta-section" id="contact" aria-labelledby="cta-title">
          <div className="cta-card animate-up delay-2">
            <p className="eyebrow" style={{ justifyContent: 'center' }}>Sprint demo ready</p>
            <h2 id="cta-title">
              Launch VeriRule with your
              <br />
              <span className="gradient-text">compliance document set</span>
            </h2>
            <p>
              Start with a controlled pilot, validate retrieval quality, and present evidence-backed answers in your next
              regulatory review.
            </p>
            <div className="cta-email-row">
              <input type="email" placeholder="your.email@bank.com" aria-label="Work email address" />
              <Link to="/signup" className="btn btn-primary">
                Get pilot access
              </Link>
            </div>
          </div>
        </section>

        {/* ── Footer ─────────────────────────────────────────── */}
        <footer>
          <div className="footer-inner">
            <div className="footer-left">
              <Link to="/" className="logo-wrap" aria-label="VeriRule home">
                <img src="/logo.svg" alt="" className="logo-icon" style={{ width: 28, height: 28 }} />
                <span className="logo-name" style={{ fontSize: '1rem' }}>
                  Veri<span>Rule</span>
                </span>
              </Link>
              <p>AI-Powered Regulatory Compliance Intelligence</p>
            </div>

            <nav className="footer-links" aria-label="Footer navigation">
              <a href="#platform">Platform</a>
              <a href="#capabilities">Capabilities</a>
              <a href="#process">Process</a>
              <Link to="/signin">Sign in</Link>
            </nav>

            <span className="footer-badge">Team 01 · Sprint 2 · Campus Apollo</span>
          </div>
        </footer>
      </div>
    </>
  )
}

export default LandingPage
