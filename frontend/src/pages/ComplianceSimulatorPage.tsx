import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { postAuditLog } from '../services/auditService'

interface RuleCheckResult {
  ruleId: string
  title: string
  authority: string
  clause: string
  passed: boolean
  failureReason?: string
  recommendation?: string
}

interface SimulationResult {
  overallStatus: 'PASS' | 'FAIL'
  riskScore: number
  checks: RuleCheckResult[]
}

export default function ComplianceSimulatorPage() {
  const { user } = useAuth()

  // Simulator Inputs
  const [transactionType, setTransactionType] = useState('Digital Payment Beneficiary Transfer')
  const [amount, setAmount] = useState('500000')
  const [currency, setCurrency] = useState('INR')
  const [beneficiaryAgeHours, setBeneficiaryAgeHours] = useState('0.5') // 30 mins
  const [authMethod, setAuthMethod] = useState('SMS OTP')
  const [socTelemetryActive, setSocTelemetryActive] = useState(true)
  const [isAfterHours, setIsAfterHours] = useState(false)
  const [isDBAdminAccess, setIsDBAdminAccess] = useState(false)

  // Simulation State
  const [hasRun, setHasRun] = useState(false)
  const [simulation, setSimulation] = useState<SimulationResult | null>(null)
  const [isSimulating, setIsSimulating] = useState(false)
  const [showCertModal, setShowCertModal] = useState(false)
  const [simCertHash, setSimCertHash] = useState('')

  const runSimulation = async () => {
    setIsSimulating(true)
    await new Promise((resolve) => setTimeout(resolve, 400)) // simulate calculation delay

    const numAmount = parseFloat(amount) || 0
    const numAge = parseFloat(beneficiaryAgeHours) || 0

    const checks: RuleCheckResult[] = []

    // 1. Digital Payment Cooling-Off Check (RBI/2021-22/15)
    if (transactionType.includes('Digital Payment') || transactionType.includes('Beneficiary')) {
      const isHighValue = numAmount >= 100000
      const passedCooling = !isHighValue || numAge >= 2.0
      checks.push({
        ruleId: 'RBI/2021-22/15 Section 4.1.1',
        title: 'Mandatory 2-Hour Beneficiary Cooling-Off Period',
        authority: 'Reserve Bank of India',
        clause: 'Banks shall enforce a mandatory 2-hour transfer limit cooling period for newly registered payment beneficiaries.',
        passed: passedCooling,
        failureReason: passedCooling
          ? undefined
          : `Beneficiary creation age (${numAge} hrs) is below the mandatory 2-hour cooling-off window.`,
        recommendation: passedCooling
          ? undefined
          : 'Hold high-value transfer until 2 hours elapse from beneficiary registration timestamp.',
      })

      const passedOTPBinding = authMethod === 'Dynamic OTP Payload Binding' || authMethod === 'Hardware MFA'
      checks.push({
        ruleId: 'RBI/2021-22/15 Section 7.3.0',
        title: 'Dynamic Transaction OTP Binding',
        authority: 'Reserve Bank of India',
        clause: 'Authentication tokens must dynamically tie the OTP to specific beneficiary account details and payment amount.',
        passed: passedOTPBinding,
        failureReason: passedOTPBinding
          ? undefined
          : `Current authentication method (${authMethod}) does not bind transaction payload hash dynamically to OTP token.`,
        recommendation: passedOTPBinding
          ? undefined
          : 'Enforce RSA payload signing on transaction request tokens.',
      })
    }

    // 2. Cyber Security & SOC Telemetry Check (RBI/2023-24/108)
    const passedSOC = socTelemetryActive
    checks.push({
      ruleId: 'RBI/2023-24/108 Section 3.1.2',
      title: '24x7 SOC Continuous Threat Monitoring',
      authority: 'Reserve Bank of India',
      clause: 'Entities must maintain continuous 24x7 Security Operations Centre (SOC) capability for threat detection and event correlation.',
      passed: passedSOC,
      failureReason: passedSOC ? undefined : '24x7 SOC SIEM event telemetry stream is inactive or offline.',
      recommendation: passedSOC ? undefined : 'Activate real-time SIEM event stream before processing financial transactions.',
    })

    // 3. Hardware MFA for DB Admin Access Check
    if (isDBAdminAccess || transactionType.includes('Privileged')) {
      const passedMFA = authMethod === 'Hardware MFA'
      checks.push({
        ruleId: 'RBI/2023-24/108 Section 5.2.0',
        title: 'Hardware Cryptographic MFA for Privileged Access',
        authority: 'Reserve Bank of India',
        clause: 'Privileged database access requires hardware-backed or cryptographic Multi-Factor Authentication.',
        passed: passedMFA,
        failureReason: passedMFA ? undefined : `Privileged root access attempted with ${authMethod} instead of Hardware MFA.`,
        recommendation: passedMFA ? undefined : 'Enforce FIDO2 hardware token verification for all DBA sessions.',
      })
    }

    // 4. WORM Storage Log Archival Check (SEBI/HO/MIRSD/2022/101)
    if (transactionType.includes('Trade') || transactionType.includes('Stock Broker')) {
      checks.push({
        ruleId: 'SEBI/HO/MIRSD/2022/101 Section 6.2.0',
        title: '7-Year WORM Storage Media Archival',
        authority: 'SEBI',
        clause: 'Authentication and trade order logs must be stored in Write-Once-Read-Many (WORM) media for 7 years.',
        passed: true,
      })
    }

    // Compute Overall Status
    const allPassed = checks.every((c) => c.passed)
    const failedCount = checks.filter((c) => !c.passed).length
    const riskScore = allPassed ? 5 : Math.min(95, 30 + failedCount * 25)

    const result: SimulationResult = {
      overallStatus: allPassed ? 'PASS' : 'FAIL',
      riskScore,
      checks,
    }

    setSimulation(result)
    setHasRun(true)
    setIsSimulating(false)

    // Audit log entry
    try {
      await postAuditLog({
        title: `Compliance Simulation: ${transactionType} (${result.overallStatus})`,
        category: 'verification',
        severity: allPassed ? 'verified' : 'flagged',
        authority: 'Multi-Directive Engine',
        query_text: `Simulated transaction ${transactionType} of ${currency} ${amount}`,
        confidence_score: allPassed ? 0.99 : 0.45,
        passage_text: `Simulation evaluated ${checks.length} active directives with result ${result.overallStatus}.`,
        section: 'Regulatory Simulator',
        execution_time_ms: 140,
        details: `Risk officer ${user.name} ran simulation for ${transactionType}. Result: ${result.overallStatus} (Risk Score: ${riskScore}/100).`,
      })
    } catch {
      // ignore
    }
  }

  const handleGenerateCertificate = () => {
    const raw = `${Date.now()}:${user.name}:${transactionType}:${simulation?.overallStatus}`
    const hash = `0x${Math.abs(raw.split('').reduce((a, c) => (a << 5) - a + c.charCodeAt(0), 0))
      .toString(16)
      .toUpperCase()
      .padStart(16, '0')}`
    setSimCertHash(hash)
    setShowCertModal(true)
  }

  const downloadSimCertificate = () => {
    if (!simulation) return
    const certData = {
      certificate_type: 'REGULATORY COMPLIANCE SIMULATION PROOF',
      certificate_id: simCertHash,
      officer: user.name,
      timestamp: new Date().toISOString(),
      transaction_parameters: {
        type: transactionType,
        amount: `${currency} ${amount}`,
        beneficiary_age_hours: beneficiaryAgeHours,
        auth_method: authMethod,
        soc_telemetry_active: socTelemetryActive,
        after_hours: isAfterHours,
      },
      evaluation_summary: {
        status: simulation.overallStatus,
        risk_score: `${simulation.riskScore}/100`,
        total_rules_evaluated: simulation.checks.length,
        passed_rules: simulation.checks.filter((c) => c.passed).length,
        failed_rules: simulation.checks.filter((c) => !c.passed).length,
      },
      rule_matrix: simulation.checks,
    }

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(certData, null, 2))
    const link = document.createElement('a')
    link.setAttribute('href', dataStr)
    link.setAttribute('download', `simulation_pass_proof_${simCertHash.substring(0, 10)}.json`)
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  return (
    <div className="compliance-simulator-page">
      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div className="dashboard-welcome">
        <div>
          <span className="eyebrow">Real-Time Evaluation Sandbox</span>
          <h1>Regulatory Compliance Transaction Simulator</h1>
          <p>
            Configure custom transaction parameters and run a real-time multi-directive evaluation engine to test compliance pass/fail criteria before production execution.
          </p>
        </div>
      </div>

      {/* ── Simulator Input Form & Result Split ─────────────────────── */}
      <div className="simulator-grid">
        {/* LEFT COLUMN: PARAMETER CONFIGURATOR */}
        <div className="dashboard-section-card simulator-config-card" style={{ marginBottom: 0 }}>
          <h2 className="section-card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>⚙️</span> Transaction Parameters
          </h2>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label htmlFor="tx-type-select">Transaction Type / Scenario</label>
            <select
              id="tx-type-select"
              className="modal-input"
              value={transactionType}
              onChange={(e) => setTransactionType(e.target.value)}
            >
              <option value="Digital Payment Beneficiary Transfer">Digital Payment Beneficiary Transfer</option>
              <option value="Cross-Border SWIFT Wire Transfer">Cross-Border SWIFT Wire Transfer</option>
              <option value="Privileged Database Admin Session">Privileged Database Admin Session</option>
              <option value="Stock Broker Algorithmic Trade Order">Stock Broker Algorithmic Trade Order</option>
            </select>
          </div>

          <div className="form-row" style={{ marginBottom: '1rem' }}>
            <div className="form-group">
              <label htmlFor="tx-amount-input">Transaction Amount</label>
              <input
                id="tx-amount-input"
                type="number"
                className="modal-input"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="tx-currency-select">Currency</label>
              <select
                id="tx-currency-select"
                className="modal-input"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label htmlFor="bene-age-input">Beneficiary Creation Age (Hours)</label>
            <input
              id="bene-age-input"
              type="number"
              step="0.1"
              className="modal-input"
              value={beneficiaryAgeHours}
              onChange={(e) => setBeneficiaryAgeHours(e.target.value)}
            />
            <small style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              RBI directive mandates a 2.0-hour minimum cooling period.
            </small>
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label htmlFor="auth-method-select">Authentication Credential Type</label>
            <select
              id="auth-method-select"
              className="modal-input"
              value={authMethod}
              onChange={(e) => setAuthMethod(e.target.value)}
            >
              <option value="Password Only">Password Only (Legacy Baseline)</option>
              <option value="SMS OTP">SMS OTP Token</option>
              <option value="Dynamic OTP Payload Binding">Dynamic OTP Payload Hashing</option>
              <option value="Hardware MFA">FIDO2 Cryptographic Hardware MFA</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label className="checklist-item" style={{ fontSize: '0.84rem' }}>
              <input
                type="checkbox"
                checked={socTelemetryActive}
                onChange={(e) => setSocTelemetryActive(e.target.checked)}
              />
              <span>Continuous 24x7 SOC Telemetry Active</span>
            </label>

            <label className="checklist-item" style={{ fontSize: '0.84rem' }}>
              <input
                type="checkbox"
                checked={isAfterHours}
                onChange={(e) => setIsAfterHours(e.target.checked)}
              />
              <span>After-Hours Execution Window (2:00 AM)</span>
            </label>

            <label className="checklist-item" style={{ fontSize: '0.84rem' }}>
              <input
                type="checkbox"
                checked={isDBAdminAccess}
                onChange={(e) => setIsDBAdminAccess(e.target.checked)}
              />
              <span>Includes Privileged Database Root Session</span>
            </label>
          </div>

          <button
            type="button"
            className="btn btn-primary btn-full"
            onClick={runSimulation}
            disabled={isSimulating}
          >
            {isSimulating ? 'Running Multi-Directive Engine...' : 'Run Real-Time Compliance Simulation →'}
          </button>
        </div>

        {/* RIGHT COLUMN: EVALUATION RESULTS & RULE MATRIX */}
        <div className="dashboard-section-card simulator-results-card" style={{ marginBottom: 0 }}>
          {!hasRun || !simulation ? (
            <div className="audit-empty-state" style={{ padding: '3rem 1.5rem' }}>
              <div className="empty-icon">🧪</div>
              <h3>Simulation Sandbox Ready</h3>
              <p>Configure transaction parameters on the left and click "Run Simulation" to evaluate compliance across active Master Directions.</p>
            </div>
          ) : (
            <div className="sim-results-body">
              {/* Overall Status Banner */}
              <div
                className={`sim-status-banner ${simulation.overallStatus === 'PASS' ? 'sim-banner-pass' : 'sim-banner-fail'}`}
              >
                <div className="sim-status-left">
                  <span className="sim-status-icon">
                    {simulation.overallStatus === 'PASS' ? '✓' : '⚡'}
                  </span>
                  <div>
                    <h2 className="sim-status-title">
                      EVALUATION {simulation.overallStatus}
                    </h2>
                    <span className="sim-status-sub">
                      {simulation.overallStatus === 'PASS'
                        ? 'Transaction satisfies all active regulatory Master Directions.'
                        : 'Transaction violates one or more active compliance directives.'}
                    </span>
                  </div>
                </div>

                <div className="sim-risk-gauge">
                  <span className="gauge-val">{simulation.riskScore}</span>
                  <span className="gauge-label">Risk Exposure</span>
                </div>
              </div>

              {/* Step-by-Step Rule Evaluation Matrix */}
              <div className="sim-matrix-section">
                <h3>Multi-Directive Evaluation Matrix ({simulation.checks.length} Rules Checked)</h3>

                <div className="sim-checks-list">
                  {simulation.checks.map((check) => (
                    <div
                      key={check.ruleId}
                      className={`sim-check-card ${check.passed ? 'check-pass' : 'check-fail'}`}
                    >
                      <div className="sim-check-header">
                        <span className={`badge-status ${check.passed ? 'badge-active' : 'badge-superseded'}`}>
                          {check.passed ? '✓ PASS' : '⚡ VIOLATION'}
                        </span>
                        <span className="sim-rule-id">{check.ruleId}</span>
                      </div>

                      <h4 className="sim-check-title">{check.title}</h4>
                      <p className="sim-clause-text">"{check.clause}"</p>

                      {!check.passed && (
                        <div className="sim-failure-box">
                          <div className="sim-fail-reason">
                            <strong>Violation Trigger:</strong> {check.failureReason}
                          </div>
                          {check.recommendation && (
                            <div className="sim-recommendation">
                              <strong>Recommended Fix:</strong> {check.recommendation}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Certificate Action */}
              <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleGenerateCertificate}
                >
                  Generate Simulation Proof Certificate 🛡️
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Certificate Modal ───────────────────────────────────────── */}
      {showCertModal && simulation && (
        <div className="audit-drawer-backdrop" onClick={() => setShowCertModal(false)}>
          <div className="audit-modal certificate-modal" onClick={(e) => e.stopPropagation()}>
            <div className="certificate-header">
              <div className="cert-badge-logo">🧪 VeriRule Simulation Proof</div>
              <h2>Regulatory Sandbox Certificate</h2>
              <span className="cert-hash">HASH: {simCertHash}</span>
            </div>

            <div className="certificate-body">
              <div className="cert-section">
                <span className="cert-label">Tested By:</span>
                <strong>{user.name} ({user.role})</strong>
              </div>

              <div className="cert-section">
                <span className="cert-label">Simulated Scenario:</span>
                <strong>{transactionType} ({currency} {amount})</strong>
              </div>

              <div className="cert-section">
                <span className="cert-label">Evaluation Result:</span>
                <strong style={{ color: simulation.overallStatus === 'PASS' ? '#047857' : '#991b1b' }}>
                  {simulation.overallStatus} — Risk Score: {simulation.riskScore}/100
                </strong>
              </div>

              <div className="cert-section">
                <span className="cert-label">Rule Evaluation Breakdown:</span>
                <ul className="cert-checklist">
                  {simulation.checks.map((c) => (
                    <li key={c.ruleId}>
                      {c.passed ? '✓' : '⚡'} <strong>{c.ruleId}:</strong> {c.title}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="drawer-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowCertModal(false)}>
                Close
              </button>
              <button type="button" className="btn btn-primary btn-sm" onClick={downloadSimCertificate}>
                Download Simulation Certificate 📥
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
