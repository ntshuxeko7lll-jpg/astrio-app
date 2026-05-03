import React from 'react'

const TAG_COLORS = {
  learn:    '#4fffb0',
  chill:    '#7eb8ff',
  focus:    '#f5ff7e',
  motivate: '#ff7eb8',
}

export default function Avatar({ url, name = '', size = 40, style = {} }) {
  const initials = name ? name.slice(0, 2).toUpperCase() : '??'
  const color = TAG_COLORS[name?.[0]?.toLowerCase()] || '#555'

  if (url) {
    return (
      <img
        src={url}
        alt={name}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          objectFit: 'cover',
          flexShrink: 0,
          ...style,
        }}
      />
    )
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'var(--bg3)',
        border: '1.5px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        fontSize: size * 0.35,
        color: 'var(--text2)',
        flexShrink: 0,
        ...style,
      }}
    >
      {initials}
    </div>
  )
}
