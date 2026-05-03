import React from 'react'

const TAGS = {
  learn:    { label: 'LEARN',    color: '#4fffb0', bg: 'rgba(79,255,176,0.15)' },
  chill:    { label: 'CHILL',    color: '#7eb8ff', bg: 'rgba(126,184,255,0.15)' },
  focus:    { label: 'FOCUS',    color: '#f5ff7e', bg: 'rgba(245,255,126,0.15)' },
  motivate: { label: 'MOTIVATE', color: '#ff7eb8', bg: 'rgba(255,126,184,0.15)' },
}

export default function TagPill({ tag, size = 'sm', selected = false, onClick }) {
  const t = TAGS[tag] || TAGS.learn
  const isLg = size === 'lg'

  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: isLg ? '8px 18px' : '3px 10px',
        borderRadius: 20,
        border: `1px solid ${selected ? t.color : t.color + '40'}`,
        background: selected ? t.color : t.bg,
        color: selected ? '#000' : t.color,
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        fontSize: isLg ? 12 : 10,
        letterSpacing: '0.5px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.15s',
        whiteSpace: 'nowrap',
      }}
    >
      {t.label}
    </button>
  )
}

export { TAGS }
