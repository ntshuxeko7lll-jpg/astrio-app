import React from 'react'

export default function TopBar({ onDiscoverClick, onNotifClick, unreadCount = 0 }) {
  return (
    <header style={{
      height: 'var(--top-h)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px',
      flexShrink: 0,
      borderBottom: '0.5px solid var(--border)',
      background: 'var(--bg)',
      zIndex: 10,
    }}>
      <span style={{
        fontFamily: 'var(--font-display)',
        fontSize: 22,
        fontWeight: 800,
        color: 'var(--accent)',
        letterSpacing: '-0.5px',
      }}>
        astrio
      </span>

      <div style={{ display: 'flex', gap: 8 }}>
        {/* Discover / Search */}
        <button onClick={onDiscoverClick} style={iconBtnStyle}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
        </button>

        {/* Notifications */}
        <button onClick={onNotifClick} style={{ ...iconBtnStyle, position: 'relative' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute',
              top: 5,
              right: 5,
              width: 8,
              height: 8,
              background: 'var(--accent)',
              borderRadius: '50%',
              border: '1.5px solid var(--bg)',
            }} />
          )}
        </button>
      </div>
    </header>
  )
}

const iconBtnStyle = {
  width: 36,
  height: 36,
  borderRadius: '50%',
  background: 'var(--bg3)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--text2)',
  border: '0.5px solid var(--border)',
  transition: 'background 0.15s',
}
