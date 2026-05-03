import React, { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const show = useCallback((msg, type = 'info') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, msg, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 2800)
  }, [])

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div style={{
        position: 'fixed',
        bottom: 'calc(var(--nav-h) + 16px)',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        alignItems: 'center',
        zIndex: 9999,
        pointerEvents: 'none',
      }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            background: t.type === 'error' ? 'rgba(255,77,109,0.15)' : 'var(--surface)',
            border: `0.5px solid ${t.type === 'error' ? 'rgba(255,77,109,0.4)' : 'var(--border)'}`,
            color: t.type === 'error' ? '#ff4d6d' : 'var(--text)',
            padding: '10px 20px',
            borderRadius: 20,
            fontSize: 13,
            fontWeight: 500,
            whiteSpace: 'nowrap',
            animation: 'fadeUp 0.25s ease',
          }}>
            {t.msg}
          </div>
        ))}
      </div>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be inside ToastProvider')
  return ctx
}
