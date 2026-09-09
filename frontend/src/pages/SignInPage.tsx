import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface FormState {
  email: string
  password: string
}

interface FormErrors {
  email?: string
  password?: string
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

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {}
  if (!form.email.trim()) {
    errors.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Enter a valid email address'
  }
  if (!form.password) {
    errors.password = 'Password is required'
  } else if (form.password.length < 6) {
    errors.password = 'Password must be at least 6 characters'
  }
  return errors
}

function SignInPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState<FormState>({ email: '', password: '' })
  const [errors, setErrors] = useState<FormErrors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
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
      await new Promise((res) => setTimeout(res, 800))
      login(form.email, form.password)
      navigate('/dashboard')
    } catch {
      setErrors({ general: 'Invalid credentials. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      {/* Background decoration */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)',
        zIndex: -1,
      }} />

      <div style={{
        position: 'fixed',
        top: '10%',
        right: '-5%',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(77, 133, 255, 0.08) 0%, transparent 70%)',
        borderRadius: '50%',
        zIndex: -1,
      }} />

      <div className="auth-container">
        <div className="auth-card" style={{ animation: 'slideUp 0.6s ease-out' }}>
          {/* Logo & Brand */}
          <Link to="/" className="auth-logo" aria-label="Return to VeriRule home">
            <div className="navbar-brand-icon" />
            <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>VeriRule</span>
          </Link>

          {/* Headings */}
          <div style={{ marginBottom: '2rem' }}>
            <h1 className="auth-heading">Welcome back</h1>
            <p className="auth-subheading">
              Sign in to your account to access your compliance intelligence workspace.
            </p>
          </div>

          {/* Error Alert */}
          {errors.general && (
            <div
              role="alert"
              className="card"
              style={{
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                borderLeft: '4px solid #EF4444',
                color: '#991B1B',
                marginBottom: '1.5rem',
                padding: '1rem',
                fontSize: '0.9rem',
              }}
            >
              ⚠️ {errors.general}
            </div>
          )}

          {/* Form */}
          <form className="auth-form" onSubmit={handleSubmit} noValidate aria-label="Sign in form">
            {/* Email Field */}
            <div className="form-group">
              <label htmlFor="signin-email" className="form-label">Work Email</label>
              <input
                id="signin-email"
                type="email"
                name="email"
                className={`form-input${errors.email ? ' error' : ''}`}
                placeholder="you@yourbank.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                aria-describedby={errors.email ? 'signin-email-error' : undefined}
                aria-invalid={!!errors.email}
                style={{
                  fontSize: '1rem',
                }}
              />
              {errors.email && (
                <span id="signin-email-error" className="form-error" role="alert">
                  {errors.email}
                </span>
              )}
            </div>

            {/* Password Field */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label htmlFor="signin-password" className="form-label">Password</label>
                <a href="#" style={{
                  fontSize: '0.8rem',
                  color: 'var(--primary)',
                  fontWeight: 600,
                  textDecoration: 'underline',
                }}>
                  Forgot password?
                </a>
              </div>
              <div className="input-wrapper">
                <input
                  id="signin-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className={`form-input${errors.password ? ' error' : ''}`}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  style={{ paddingRight: '2.8rem' }}
                  aria-describedby={errors.password ? 'signin-password-error' : undefined}
                  aria-invalid={!!errors.password}
                />
                <button
                  type="button"
                  style={{
                    position: 'absolute',
                    right: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-quaternary)',
                    padding: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
              {errors.password && (
                <span id="signin-password-error" className="form-error" role="alert">
                  {errors.password}
                </span>
              )}
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              id="signin-submit"
              className={`btn btn-primary btn-full btn-lg${loading ? ' btn-loading' : ''}`}
              disabled={loading}
              aria-busy={loading}
              style={{ marginTop: '0.5rem' }}
            >
              {!loading && 'Sign in'}
            </button>
          </form>

          {/* Divider */}
          <div className="auth-divider" style={{ margin: '2rem 0' }}>
            <span>or continue with</span>
          </div>

          {/* Google OAuth Button */}
          <button
            type="button"
            id="signin-google"
            className="btn btn-secondary btn-full btn-lg"
            onClick={() => alert('Google OAuth – connect to your backend auth provider.')}
            style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}
          >
            <GoogleIcon />
            <span>Continue with Google</span>
          </button>

          {/* Sign Up Link */}
          <div className="auth-footer" style={{ marginTop: '1.5rem' }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{ fontWeight: 700 }}>Create one free</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignInPage
