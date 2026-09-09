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

// const stats = [
//   { value: '100%', label: 'Source-cited answers' },
//   { value: 'Zero', label: 'Hallucinated guidance' },
//   { value: 'Real-time', label: 'Policy conflict detection' },
// ]

function LandingPage() {
  return (
    <>
      <div className="page-wrapper">
        {/* Animated background */}
        <div className="landing-hero__background" aria-hidden="true" />

        <div className="container">
          {/* Navbar */}
          <nav className="navbar">
            <div className="navbar-content">
              <Link to="/" className="navbar-brand" aria-label="VeriRule home">
                <div className="navbar-brand-icon" />
                <span>VeriRule</span>
              </Link>

              <ul className="navbar-menu" style={{ listStyle: 'none' }}>
                <li>
                  <a href="#platform" className="navbar-link">
                    Platform
                  </a>
                </li>
                <li>
                  <a href="#capabilities" className="navbar-link">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#process" className="navbar-link">
                    How it Works
                  </a>
                </li>
                <li>
                  <a href="#contact" className="navbar-link">
                    Contact
                  </a>
                </li>
              </ul>

              <div className="flex gap-2">
                <Link to="/signin" className="btn btn-secondary btn-sm">
                  Sign in
                </Link>
                <Link to="/signup" className="btn btn-primary btn-sm">
                  Get Started
                </Link>
              </div>
            </div>
          </nav>

          {/* Hero */}
          <section
            className="landing-hero"
            id="platform"
            aria-labelledby="hero-title"
          >
            <div className="hero-content">
              <div
                className="hero-badge"
                style={{ animation: 'slideUp 0.6s ease-out' }}
              >
                <span className="hero-badge-dot" />
                <span className="hero-badge-text">
                  AI-Powered Compliance Intelligence
                </span>
              </div>

              <h1
                id="hero-title"
                className="hero-title"
                style={{
                  animation: 'slideUp 0.6s ease-out 0.1s both',
                }}
              >
                Compliance decisions backed by evidence, not hunches
              </h1>

              <p
                className="hero-description"
                style={{
                  animation: 'slideUp 0.6s ease-out 0.2s both',
                }}
              >
                VeriRule gives compliance teams a secure, auditable way to ask
                questions about regulatory rules. Every answer includes source
                citations, confidence levels, and clear flagging of conflicting
                or superseded guidance. Built for banking workflows where
                precision matters.
              </p>

              <div
                className="hero-actions"
                style={{
                  animation: 'slideUp 0.6s ease-out 0.3s both',
                }}
              >
                <Link to="/signup" className="btn btn-primary btn-lg">
                  Start Your Pilot
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </Link>

                <a href="#capabilities" className="btn btn-secondary btn-lg">
                  Explore Features
                </a>
              </div>
            </div>
          </section>

          {/* Trust Indicators */}
          <div
            className="card card-featured"
            style={{
              marginTop: '4rem',
              marginBottom: '6rem',
              animation: 'slideUp 0.6s ease-out 0.4s both',
            }}
          >
            <div className="flex justify-between gap-4 flex-wrap">
              <div className="flex-col gap-1">
                <div
                  style={{
                    fontSize: '2rem',
                    fontWeight: 800,
                    color: 'var(--primary)',
                  }}
                >
                  100%
                </div>
                <div
                  style={{
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)',
                  }}
                >
                  Source-cited answers
                </div>
              </div>

              <div className="flex-col gap-1">
                <div
                  style={{
                    fontSize: '2rem',
                    fontWeight: 800,
                    color: 'var(--accent)',
                  }}
                >
                  Zero
                </div>
                <div
                  style={{
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)',
                  }}
                >
                  Hallucinated guidance
                </div>
              </div>

              <div className="flex-col gap-1">
                <div
                  style={{
                    fontSize: '2rem',
                    fontWeight: 800,
                    color: 'var(--primary)',
                  }}
                >
                  Real-time
                </div>
                <div
                  style={{
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)',
                  }}
                >
                  Policy conflict detection
                </div>
              </div>

              <div className="flex-col gap-1">
                <div
                  style={{
                    fontSize: '2rem',
                    fontWeight: 800,
                    color: 'var(--accent)',
                  }}
                >
                  Audit-ready
                </div>
                <div
                  style={{
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)',
                  }}
                >
                  Complete trails
                </div>
              </div>
            </div>
          </div>

          {/* Capabilities */}
          <section id="capabilities" style={{ scrollMarginTop: '100px' }}>
            <div className="section-header">
              <div
                className="section-header-badge"
                style={{
                  animation: 'slideUp 0.6s ease-out 0.1s both',
                }}
              >
                <span className="section-header-badge-dot" />
                <span className="section-header-badge-text">
                  Core Features
                </span>
              </div>

              <h2
                className="section-title"
                style={{
                  animation: 'slideUp 0.6s ease-out 0.2s both',
                }}
              >
                Built for compliance teams that demand precision
              </h2>

              <p
                className="section-description"
                style={{
                  animation: 'slideUp 0.6s ease-out 0.3s both',
                }}
              >
                From document ingestion to evidence-backed answers, VeriRule
                provides enterprise-grade compliance intelligence.
              </p>
            </div>

            <div className="features-grid">
              {capabilities.map((item, i) => (
                <div
                  className="feature-card"
                  key={item.title}
                  style={{
                    animation: `slideUp 0.6s ease-out ${
                      0.3 + i * 0.1
                    }s both`,
                  }}
                >
                  <div className="feature-icon">{item.icon}</div>
                  <h3 className="feature-title">{item.title}</h3>
                  <p className="feature-description">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Process */}
          <section
            id="process"
            style={{
              marginTop: '8rem',
              scrollMarginTop: '100px',
            }}
          >
            <div className="section-header">
              <div
                className="section-header-badge"
                style={{
                  animation: 'slideUp 0.6s ease-out 0.1s both',
                }}
              >
                <span className="section-header-badge-dot" />
                <span className="section-header-badge-text">
                  How It Works
                </span>
              </div>

              <h2
                className="section-title"
                style={{
                  animation: 'slideUp 0.6s ease-out 0.2s both',
                }}
              >
                A proven four-stage compliance intelligence pipeline
              </h2>

              <p
                className="section-description"
                style={{
                  animation: 'slideUp 0.6s ease-out 0.3s both',
                }}
              >
                A proven four-stage compliance intelligence pipeline
              </p>
            </div>

            <div
              className="features-grid"
              style={{ marginTop: '3rem' }}
            >
              {stages.map((item, i) => (
                <div
                  className="feature-card"
                  key={item.step}
                  style={{
                    animation: `slideUp 0.6s ease-out ${
                      0.3 + i * 0.1
                    }s both`,
                  }}
                >
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background:
                        'linear-gradient(135deg, var(--primary), var(--accent))',
                      color: '#FFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '1.1rem',
                      marginBottom: 'var(--space-4)',
                      boxShadow: '0 0 25px rgba(77, 133, 255, 0.3)',
                    }}
                  >
                    {item.step}
                  </div>

                  <h3 className="feature-title">{item.title}</h3>
                  <p className="feature-description">{item.text}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Target Audience */}
          <section
            style={{
              marginTop: '8rem',
              marginBottom: '6rem',
            }}
          >
            <div className="section-header">
              <div
                className="section-header-badge"
                style={{
                  animation: 'slideUp 0.6s ease-out 0.1s both',
                }}
              >
                <span className="section-header-badge-dot" />
                <span className="section-header-badge-text">
                  Who Benefits
                </span>
              </div>

              <h2
                className="section-title"
                style={{
                  animation: 'slideUp 0.6s ease-out 0.2s both',
                }}
              >
                Built for every compliance decision maker
              </h2>

              <p
                className="section-description"
                style={{
                  animation: 'slideUp 0.6s ease-out 0.3s both',
                }}
              >
                Risk officers, compliance managers, and audit teams all
                benefit from evidence-backed, verifiable answers.
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '2rem',
              }}
            >
              {audience.map((item, i) => (
                <div
                  className="card"
                  key={item.role}
                  style={{
                    animation: `slideUp 0.6s ease-out ${
                      0.3 + i * 0.1
                    }s both`,
                    borderLeft: '4px solid var(--primary)',
                  }}
                >
                  <div
                    style={{
                      display: 'inline-block',
                      background: 'rgba(77, 133, 255, 0.1)',
                      border: '1px solid rgba(77, 133, 255, 0.2)',
                      borderRadius: '999px',
                      padding: '0.4rem 0.9rem',
                      marginBottom: '0.8rem',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        color: 'var(--primary)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {item.tag}
                    </span>
                  </div>

                  <h3 style={{ marginBottom: '0.6rem' }}>
                    {item.role}
                  </h3>

                  <p
                    style={{
                      fontSize: '0.95rem',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section
            id="contact"
            style={{
              marginBottom: '6rem',
              scrollMarginTop: '100px',
            }}
          >
            <div
              className="card card-featured"
              style={{
                animation: 'slideUp 0.6s ease-out 0.2s both',
                padding: 'var(--space-12) var(--space-8)',
                textAlign: 'center',
              }}
            >
              <div
                className="section-header-badge"
                style={{
                  justifyContent: 'center',
                  marginBottom: '1.5rem',
                }}
              >
                <span className="section-header-badge-dot" />
                <span className="section-header-badge-text">
                  Ready to Launch
                </span>
              </div>

              <h2
                className="section-title"
                style={{ marginBottom: '1rem' }}
              >
                Transform compliance verification with AI you can trust
              </h2>

              <p
                className="section-description"
                style={{
                  maxWidth: '600px',
                  margin: '0 auto 2rem',
                }}
              >
                Start with a controlled pilot of VeriRule. We'll help you
                upload your regulatory documents, test retrieval quality,
                and demonstrate evidence-backed answers in your next audit.
              </p>

              <div
                className="flex gap-4 justify-center flex-wrap"
                style={{ marginTop: '2rem' }}
              >
                <Link to="/signup" className="btn btn-primary btn-lg">
                  Get Pilot Access
                </Link>

                <a
                  href="mailto:contact@verirule.ai"
                  className="btn btn-secondary btn-lg"
                >
                  Contact Sales
                </a>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer
            style={{
              borderTop: '1px solid var(--border-light)',
              paddingTop: 'var(--space-12)',
              paddingBottom: 'var(--space-8)',
              marginTop: 'var(--space-20)',
            }}
          >
            <div className="flex justify-between items-start gap-8 flex-wrap">
              <div>
                <Link
                  to="/"
                  className="navbar-brand"
                  style={{ marginBottom: '1rem' }}
                >
                  <div className="navbar-brand-icon" />
                  <span>VeriRule</span>
                </Link>

                <p
                  style={{
                    fontSize: '0.9rem',
                    color: 'var(--text-secondary)',
                    maxWidth: '300px',
                  }}
                >
                  AI-powered regulatory compliance intelligence for banking
                  and financial services.
                </p>
              </div>

              <div>
                <h4
                  style={{
                    marginBottom: '1rem',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: 'var(--text-tertiary)',
                  }}
                >
                  Platform
                </h4>

                <div className="flex flex-col gap-2">
                  <a
                    href="#platform"
                    style={{
                      fontSize: '0.9rem',
                      color: 'var(--text-secondary)',
                    }}
                    className="hover:text-primary"
                  >
                    Platform
                  </a>

                  <a
                    href="#capabilities"
                    style={{
                      fontSize: '0.9rem',
                      color: 'var(--text-secondary)',
                    }}
                    className="hover:text-primary"
                  >
                    Features
                  </a>

                  <a
                    href="#process"
                    style={{
                      fontSize: '0.9rem',
                      color: 'var(--text-secondary)',
                    }}
                    className="hover:text-primary"
                  >
                    How it works
                  </a>
                </div>
              </div>

              <div>
                <h4
                  style={{
                    marginBottom: '1rem',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: 'var(--text-tertiary)',
                  }}
                >
                  Legal
                </h4>

                <div className="flex flex-col gap-2">
                  <a
                    href="#"
                    style={{
                      fontSize: '0.9rem',
                      color: 'var(--text-secondary)',
                    }}
                    className="hover:text-primary"
                  >
                    Privacy
                  </a>

                  <a
                    href="#"
                    style={{
                      fontSize: '0.9rem',
                      color: 'var(--text-secondary)',
                    }}
                    className="hover:text-primary"
                  >
                    Terms
                  </a>

                  <a
                    href="#"
                    style={{
                      fontSize: '0.9rem',
                      color: 'var(--text-secondary)',
                    }}
                    className="hover:text-primary"
                  >
                    Security
                  </a>
                </div>
              </div>
            </div>

            <div
              style={{
                borderTop: '1px solid var(--border-light)',
                marginTop: 'var(--space-8)',
                paddingTop: 'var(--space-6)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.85rem',
                color: 'var(--text-quaternary)',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <span>&copy; 2024 VeriRule. All rights reserved.</span>
              <span>Built with intelligence. Audited for compliance.</span>
            </div>
          </footer>
        </div>
      </div>
    </>
  )
}

export default LandingPage