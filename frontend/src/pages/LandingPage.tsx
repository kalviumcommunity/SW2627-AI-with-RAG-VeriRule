const capabilities = [
  {
    title: 'Current Rule Engine',
    description: 'Resolves conflicts between old and new circulars using status, date, and authority metadata.',
  },
  {
    title: 'Evidence-First Answers',
    description: 'Every answer includes source title, section, and page so officers can verify before acting.',
  },
  {
    title: 'Insufficient Evidence Guard',
    description: 'If the knowledge base cannot support a claim, VeriRule reports uncertainty instead of guessing.',
  },
  {
    title: 'Audit-Ready Trail',
    description: 'Query, retrieved chunks, and citations are logged for transparent internal and external audits.',
  },
]

const audience = [
  {
    role: 'Risk Officers',
    value: 'Find governing rules faster with explainable answers and direct source proof.',
  },
  {
    role: 'Compliance Managers',
    value: 'Track policy usage patterns and catch dependence on superseded guidance.',
  },
  {
    role: 'Internal Audit Teams',
    value: 'Trace each compliance conclusion to approved documents and evidence snapshots.',
  },
]

const stages = [
  {
    step: '01',
    title: 'Ingest',
    text: 'Upload circulars, policy docs, regulatory updates, and audit reports with metadata.',
  },
  {
    step: '02',
    title: 'Retrieve',
    text: 'Hybrid semantic retrieval finds the most relevant chunks for the user question.',
  },
  {
    step: '03',
    title: 'Resolve',
    text: 'Status and supersession logic determines which rule is currently applicable.',
  },
  {
    step: '04',
    title: 'Answer',
    text: 'A grounded response is generated with citations and confidence-aware behavior.',
  },
]

function LandingPage() {
  return (
    <div className="landing-shell">
      <div className="bg-gradient bg-a" aria-hidden="true" />
      <div className="bg-gradient bg-b" aria-hidden="true" />

      <header className="topbar">
        <div className="logo-wrap">
          <div className="logo-badge">V</div>
          <div>
            <p className="logo-title">VeriRule</p>
            <p className="logo-subtitle">Regulatory Intelligence Platform</p>
          </div>
        </div>

        <nav className="desktop-nav" aria-label="Primary navigation">
          <a href="#platform">Platform</a>
          <a href="#capabilities">Capabilities</a>
          <a href="#process">Process</a>
          <a href="#contact">Contact</a>
        </nav>

        <div className="topbar-actions">
          <button className="btn btn-ghost">Sign in</button>
          <button className="btn btn-solid">Get pilot access</button>
        </div>
      </header>

      <main>
        <section className="hero" id="platform">
          <div className="hero-left animate-up delay-1">
            <p className="eyebrow">Compliance decisions with source confidence</p>
            <h1>The landing page for a safer way to answer regulatory questions</h1>
            <p className="hero-description">
              VeriRule gives your team a single place to ask, verify, and explain compliance rules. It is built for
              banking workflows where evidence quality matters more than confident sounding text.
            </p>
            <div className="hero-actions">
              <button className="btn btn-solid">Explore product</button>
              <button className="btn btn-ghost">Read architecture</button>
            </div>
            <div className="metric-row">
              <article>
                <h3>Top source match</h3>
                <p>Optimized retrieval for authoritative policy documents</p>
              </article>
              <article>
                <h3>Current over historical</h3>
                <p>Prioritizes active rules over superseded guidance</p>
              </article>
            </div>
          </div>

          <aside className="hero-right animate-up delay-2" aria-label="Highlights">
            <h2>Why teams trust VeriRule</h2>
            <ul>
              <li>
                <strong>Grounded by design:</strong> Answers only from approved internal knowledge.
              </li>
              <li>
                <strong>Conflict aware:</strong> Clearly marks when a previous requirement is superseded.
              </li>
              <li>
                <strong>Actionable citations:</strong> Direct section and page references for audit traceability.
              </li>
              <li>
                <strong>Safe fallback:</strong> Returns insufficient evidence when support is missing.
              </li>
            </ul>
            <div className="hero-tag-grid">
              <span>RAG retrieval</span>
              <span>Metadata ranking</span>
              <span>Supersession logic</span>
              <span>Audit logging</span>
            </div>
          </aside>
        </section>

        <section className="trust-strip animate-up delay-2" aria-label="Trust indicators">
          <p>Built for regulated banking environments</p>
          <p>Designed with explainability and traceability first</p>
          <p>Supports compliance, risk, and audit workflows</p>
        </section>

        <section className="section" id="capabilities">
          <div className="section-header animate-up delay-1">
            <p className="eyebrow">Core capabilities</p>
            <h2>Everything needed for compliance-focused AI retrieval</h2>
          </div>
          <div className="capability-grid">
            {capabilities.map((item, index) => (
              <article className={`capability-card animate-up delay-${(index % 3) + 1}`} key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section" id="process">
          <div className="section-header animate-up delay-1">
            <p className="eyebrow">How it works</p>
            <h2>A practical four-stage compliance intelligence flow</h2>
          </div>
          <div className="stage-grid">
            {stages.map((item) => (
              <article className="stage-card animate-up delay-2" key={item.step}>
                <span className="stage-number">{item.step}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section audience-section">
          <div className="section-header animate-up delay-1">
            <p className="eyebrow">Who benefits</p>
            <h2>Designed for every decision maker in the compliance chain</h2>
          </div>
          <div className="audience-grid">
            {audience.map((item, index) => (
              <article className={`audience-card animate-up delay-${(index % 3) + 1}`} key={item.role}>
                <h3>{item.role}</h3>
                <p>{item.value}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section cta" id="contact">
          <div className="cta-card animate-up delay-2">
            <p className="eyebrow">Sprint demo ready</p>
            <h2>Launch VeriRule with your compliance document set</h2>
            <p>
              Start with a controlled pilot, validate retrieval quality, and present evidence-backed answers in your next
              review.
            </p>
            <div className="cta-actions">
              <button className="btn btn-solid">Book walkthrough</button>
              <button className="btn btn-ghost">Contact team</button>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <p>VeriRule | AI-Powered Regulatory Compliance Intelligence</p>
        <p>Team 01 | Sprint 2 | Campus Apollo</p>
      </footer>
    </div>
  )
}

export default LandingPage
