import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

interface FormState {
  fullName: string
  email: string
  password: string
  confirmPassword: string
  agreeTerms: boolean
}

interface FormErrors {
  fullName?: string
  email?: string
  password?: string
  confirmPassword?: string
  agreeTerms?: string
  general?: string
}

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

function getPasswordStrength(password: string): { score: number; label: string } {
  if (!password) return { score: 0, label: '' }
  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong']
  return { score, label: labels[score] }
}

function getSegmentClass(score: number, segmentIndex: number): string {
  if (score === 0 || segmentIndex >= score) return ''
  if (score === 1) return 'weak'
  if (score === 2) return 'fair'
  if (score === 3) return 'good'
  return 'strong'
}

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {}
  if (!form.fullName.trim()) {
    errors.fullName = 'Full name is required'
  } else if (form.fullName.trim().length < 2) {
    errors.fullName = 'Name must be at least 2 characters'
  }
  if (!form.email.trim()) {
    errors.email = 'Work email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Enter a valid email address'
  }
  if (!form.password) {
    errors.password = 'Password is required'
  } else if (form.password.length < 8) {
    errors.password = 'Password must be at least 8 characters'
  }
  if (!form.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password'
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match'
  }
  if (!form.agreeTerms) {
    errors.agreeTerms = 'You must accept the terms to continue'
  }
  return errors
}

function SignUpPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState<FormState>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  const strength = getPasswordStrength(form.password)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const validation = validate(form)
    if (Object.keys(validation).length > 0) {
      setErrors(validation)
      return
    }
    setLoading(true)
    setErrors({})
    try {
      // Simulate API call
      await new Promise((res) => setTimeout(res, 1500))
      // TODO: replace with real auth API call
      navigate('/signin')
    } catch {
      setErrors({ general: 'Something went wrong. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="bg-mesh" aria-hidden="true">
        <div className="bg-mesh-mid" />
      </div>
      <div className="bg-grid" aria-hidden="true" />

      <div className="auth-shell">
        <div className="auth-card glass animate-up delay-1">
          {/* Logo */}
          <Link to="/" className="auth-logo" aria-label="Return to VeriRule home">
            <img src="/logo.svg" alt="VeriRule logo" className="auth-logo-icon" />
            <span className="auth-logo-name">VeriRule</span>
          </Link>

          {/* Headings */}
          <h1 className="auth-heading">Create your account</h1>
          <p className="auth-subheading">
            Get pilot access to VeriRule's AI-powered compliance intelligence platform for your team.
          </p>

          {/* General error */}
          {errors.general && (
            <div
              role="alert"
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: 'var(--radius-sm)',
                padding: '0.75rem 1rem',
                marginBottom: '1rem',
                fontSize: '0.85rem',
                color: '#991b1b',
              }}
            >
              {errors.general}
            </div>
          )}

          {/* Google OAuth */}
          <button
            type="button"
            id="signup-google"
            className="btn-oauth"
            style={{ marginBottom: '1.25rem' }}
            onClick={() => alert('Google OAuth – connect to your backend auth provider.')}
          >
            <GoogleIcon />
            Sign up with Google
          </button>

          <div className="divider" style={{ marginBottom: '1.25rem' }}>or sign up with email</div>

          {/* Form */}
          <form className="auth-form" onSubmit={handleSubmit} noValidate aria-label="Sign up form">
            {/* Full Name */}
            <div className="form-group">
              <label htmlFor="signup-name" className="form-label">Full Name</label>
              <input
                id="signup-name"
                type="text"
                name="fullName"
                className={`form-input${errors.fullName ? ' error' : ''}`}
                placeholder="Jane Smith"
                value={form.fullName}
                onChange={handleChange}
                autoComplete="name"
                aria-describedby={errors.fullName ? 'signup-name-error' : undefined}
                aria-invalid={!!errors.fullName}
              />
              {errors.fullName && (
                <span id="signup-name-error" className="form-error" role="alert">
                  ⚠ {errors.fullName}
                </span>
              )}
            </div>

            {/* Work Email */}
            <div className="form-group">
              <label htmlFor="signup-email" className="form-label">Work Email</label>
              <input
                id="signup-email"
                type="email"
                name="email"
                className={`form-input${errors.email ? ' error' : ''}`}
                placeholder="you@yourbank.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                aria-describedby={errors.email ? 'signup-email-error' : undefined}
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <span id="signup-email-error" className="form-error" role="alert">
                  ⚠ {errors.email}
                </span>
              )}
            </div>

            {/* Password */}
            <div className="form-group">
              <label htmlFor="signup-password" className="form-label">Password</label>
              <div className="input-wrapper">
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className={`form-input${errors.password ? ' error' : ''}`}
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  style={{ paddingRight: '2.8rem' }}
                  aria-describedby="signup-password-strength"
                  aria-invalid={!!errors.password}
                />
                <button
                  type="button"
                  className="input-icon-right"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
              {errors.password && (
                <span className="form-error" role="alert">⚠ {errors.password}</span>
              )}
              {/* Strength meter */}
              {form.password && (
                <div id="signup-password-strength" aria-label={`Password strength: ${strength.label}`}>
                  <div className="strength-bar">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`strength-bar-segment ${getSegmentClass(strength.score, i)}`}
                      />
                    ))}
                  </div>
                  <span className="strength-label">Strength: {strength.label}</span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label htmlFor="signup-confirm" className="form-label">Confirm Password</label>
              <div className="input-wrapper">
                <input
                  id="signup-confirm"
                  type={showConfirm ? 'text' : 'password'}
                  name="confirmPassword"
                  className={`form-input${errors.confirmPassword ? ' error' : ''}`}
                  placeholder="Re-enter your password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  style={{ paddingRight: '2.8rem' }}
                  aria-describedby={errors.confirmPassword ? 'signup-confirm-error' : undefined}
                  aria-invalid={!!errors.confirmPassword}
                />
                <button
                  type="button"
                  className="input-icon-right"
                  onClick={() => setShowConfirm((v) => !v)}
                  aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                >
                  <EyeIcon open={showConfirm} />
                </button>
              </div>
              {errors.confirmPassword && (
                <span id="signup-confirm-error" className="form-error" role="alert">
                  ⚠ {errors.confirmPassword}
                </span>
              )}
            </div>

            {/* Terms checkbox */}
            <div className="form-group">
              <label className="checkbox-group" htmlFor="signup-terms">
                <input
                  id="signup-terms"
                  type="checkbox"
                  name="agreeTerms"
                  checked={form.agreeTerms}
                  onChange={handleChange}
                  aria-describedby={errors.agreeTerms ? 'signup-terms-error' : undefined}
                  aria-invalid={!!errors.agreeTerms}
                />
                <span className="checkbox-label">
                  I agree to VeriRule's{' '}
                  <a href="#" onClick={(e) => e.preventDefault()}>Terms of Service</a>
                  {' '}and{' '}
                  <a href="#" onClick={(e) => e.preventDefault()}>Privacy Policy</a>
                </span>
              </label>
              {errors.agreeTerms && (
                <span id="signup-terms-error" className="form-error" role="alert">
                  ⚠ {errors.agreeTerms}
                </span>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              id="signup-submit"
              className={`btn btn-primary btn-full${loading ? ' btn-loading' : ''}`}
              disabled={loading}
              aria-busy={loading}
            >
              {!loading && 'Create account'}
            </button>
          </form>

          {/* Footer link */}
          <p className="auth-footer-text">
            Already have an account?{' '}
            <Link to="/signin">Sign in</Link>
          </p>
        </div>
      </div>
    </>
  )
}

export default SignUpPage
