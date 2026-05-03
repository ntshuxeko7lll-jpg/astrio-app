import React, { useState } from 'react'
import { useToast } from '../components/Toast'

export default function AuthScreen({ onAuth }) {
  const toast = useToast()
  const [mode, setMode] = useState('login') // login | signup
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email || !password) return toast('Fill in all fields', 'error')
    if (mode === 'signup' && !username) return toast('Choose a username', 'error')
    setLoading(true)
    try {
      await onAuth(mode, email, password, username)
    } catch (err) {
      toast(err.message || 'Something went wrong', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '32px 24px', gap: 0,
    }}>
      {/* Logo */}
      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: 52, fontWeight: 800,
        color: 'var(--accent)', letterSpacing: '-2px',
        marginBottom: 8,
      }}>
        astrio
      </div>
      <p style={{ fontSize: 15, color: 'var(--text2)', marginBottom: 40, textAlign: 'center', lineHeight: 1.6 }}>
        Intent-based video.<br />Content that means something.
      </p>

      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {mode === 'signup' && (
          <input
            style={inputStyle}
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
            autoComplete="username"
          />
        )}
        <input
          style={inputStyle}
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          autoComplete="email"
        />
        <input
          style={inputStyle}
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%', padding: '14px',
            borderRadius: 'var(--r)',
            fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700,
            background: loading ? 'var(--bg3)' : 'var(--accent)',
            color: loading ? 'var(--text3)' : '#000',
            border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
            marginTop: 4, transition: 'all 0.2s',
          }}
        >
          {loading ? 'Loading…' : mode === 'login' ? 'Sign In' : 'Create Account'}
        </button>

        <p style={{ fontSize: 13, color: 'var(--text2)', textAlign: 'center', marginTop: 4 }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <span
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            style={{ color: 'var(--accent)', fontWeight: 600, cursor: 'pointer' }}
          >
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </span>
        </p>
      </form>

      {/* Tag teaser */}
      <div style={{ display: 'flex', gap: 8, marginTop: 48, flexWrap: 'wrap', justifyContent: 'center' }}>
        {[['LEARN', '#4fffb0'], ['CHILL', '#7eb8ff'], ['FOCUS', '#f5ff7e'], ['MOTIVATE', '#ff7eb8']].map(([label, color]) => (
          <span key={label} style={{
            padding: '5px 12px', borderRadius: 20,
            background: color + '18',
            border: `1px solid ${color}40`,
            color, fontFamily: 'var(--font-display)',
            fontSize: 10, fontWeight: 700, letterSpacing: '0.5px',
          }}>
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}

const inputStyle = {
  width: '100%',
  background: 'var(--bg3)',
  border: '0.5px solid var(--border)',
  borderRadius: 'var(--r)',
  padding: '13px 16px',
  fontSize: 14,
  color: 'var(--text)',
  outline: 'none',
}
