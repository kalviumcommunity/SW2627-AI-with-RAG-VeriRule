import React, { createContext, useContext, useState, useEffect } from 'react'

export interface User {
  name: string
  email: string
  role: string
}

interface AuthContextType {
  user: User
  login: (email: string, password?: string) => void
  signup: (name: string, email: string) => void
  updateUser: (updates: Partial<User>) => void
  logout: () => void
}

const DEFAULT_USER: User = {
  name: 'Alex Morgan',
  email: 'alex.morgan@verirule.bank',
  role: 'Compliance Officer',
}

const STORAGE_KEY = 'verirule_user_session'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed && parsed.name && parsed.email) {
          return parsed
        }
      }
    } catch {
      // ignore
    }
    return DEFAULT_USER
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    } catch {
      // ignore
    }
  }, [user])

  // Helper to derive a clean display name from email if name is not explicitly given
  const deriveNameFromEmail = (email: string): string => {
    if (!email) return 'User'
    const prefix = email.split('@')[0]
    const parts = prefix.split(/[._-]/).filter(Boolean)
    if (parts.length >= 2) {
      return parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ')
    } else if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase() + parts[0].slice(1)
    }
    return 'User'
  }

  const login = (email: string, _password?: string) => {
    const derivedName = deriveNameFromEmail(email)
    const newUser: User = {
      name: derivedName,
      email: email,
      role: 'Compliance Officer',
    }
    setUser(newUser)
  }

  const signup = (name: string, email: string) => {
    const newUser: User = {
      name: name.trim() || deriveNameFromEmail(email),
      email: email.trim(),
      role: 'Compliance Officer',
    }
    setUser(newUser)
  }

  const updateUser = (updates: Partial<User>) => {
    setUser((prev) => ({ ...prev, ...updates }))
  }

  const logout = () => {
    setUser(DEFAULT_USER)
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
