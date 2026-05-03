import React, { useRef, useEffect, useState, useCallback } from 'react'
import TagPill from './TagPill'
import Avatar from './Avatar'

function fmtNum(n) {
  if (!n) return '0'
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
  return String(n)
}

export default function VideoCard({ post, isActive, muted, onToggleMute, onLike }) {
  const videoRef = useRef(null)
  const [showPause, setShowPause] = useState(false)
  const [paused, setPaused] = useState(false)
  const pauseTimerRef = useRef(null)

  // Play / pause when active state changes
  useEffect(() => {
    const v = videoRef.current
    if (!v) return

    v.muted = muted

    if (isActive) {
      v.play().catch(() => {})
      setPaused(false)
    } else {
      v.pause()
    }
  }, [isActive, muted])

  // Sync mute without re-triggering play/pause
  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = muted
  }, [muted])

  const handleTap = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) {
      v.play().catch(() => {})
      setPaused(false)
    } else {
      v.pause()
      setPaused(true)
    }
    setShowPause(true)
    clearTimeout(pauseTimerRef.current)
    pauseTimerRef.current = setTimeout(() => setShowPause(false), 800)
  }, [])

  return (
    <div style={{ height: '100%', position: 'relative', background: '#000', overflow: 'hidden', scrollSnapAlign: 'start', flexShrink: 0 }}>
      {/* Video */}
      {post.video_url ? (
        <video
          ref={videoRef}
          src={post.video_url}
          loop
          playsInline
          muted={muted}
          preload="metadata"
          onClick={handleTap}
          onCanPlay={() => { if (isActive) videoRef.current?.play().catch(() => {}) }}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      ) : (
        // Placeholder gradient when no video URL (demo content)
        <div
          onClick={handleTap}
          style={{
            width: '100%',
            height: '100%',
            background: GRADIENTS[post.id % GRADIENTS.length] || GRADIENTS[0],
          }}
        />
      )}

      {/* Play/Pause flash overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: showPause ? 1 : 0,
        transition: 'opacity 0.3s',
        pointerEvents: 'none',
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {paused
            ? <svg width="28" height="28" viewBox="0 0 24 24" fill="white" stroke="none"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            : <svg width="28" height="28" viewBox="0 0 24 24" fill="white" stroke="none"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
          }
        </div>
      </div>

      {/* Bottom gradient */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 45%)',
        pointerEvents: 'none',
      }} />

      {/* Video info — bottom left */}
      <div style={{
        position: 'absolute', bottom: 20, left: 16, right: 72,
        pointerEvents: 'none',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <Avatar url={post.profiles?.avatar_url} name={post.profiles?.username} size={34} style={{ border: '2px solid var(--accent)' }} />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13 }}>
            @{post.profiles?.username || 'user'}
          </span>
        </div>
        <p style={{ fontSize: 13, lineHeight: 1.5, color: 'rgba(255,255,255,0.92)', marginBottom: 8 }}>
          {post.caption}
        </p>
        <TagPill tag={post.tag} />
      </div>

      {/* Actions — right side */}
      <div style={{
        position: 'absolute', right: 12, bottom: 24,
        display: 'flex', flexDirection: 'column', gap: 22, alignItems: 'center',
      }}>
        <ActionBtn
          icon={
            <svg width="26" height="26" viewBox="0 0 24 24"
              fill={post.liked ? '#ff4d6d' : 'none'}
              stroke={post.liked ? '#ff4d6d' : '#fff'}
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          }
          label={fmtNum(post.likes_count)}
          onClick={() => onLike(post.id)}
        />
        <ActionBtn
          icon={
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          }
          label={fmtNum(post.comments_count)}
          onClick={() => {}}
        />
        <ActionBtn
          icon={
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
          }
          label="Share"
          onClick={() => {
            if (navigator.share) navigator.share({ title: post.caption, url: window.location.href }).catch(() => {})
          }}
        />
      </div>

      {/* Mute toggle */}
      <button
        onClick={onToggleMute}
        style={{
          position: 'absolute', top: 12, right: 12,
          width: 34, height: 34, borderRadius: '50%',
          background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: 'none', cursor: 'pointer', color: '#fff',
        }}
      >
        {muted
          ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
          : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
        }
      </button>
    </div>
  )
}

function ActionBtn({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
        background: 'none', border: 'none', cursor: 'pointer',
        filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.6))',
      }}
    >
      {icon}
      <span style={{ fontSize: 11, color: '#fff', fontWeight: 500 }}>{label}</span>
    </button>
  )
}

const GRADIENTS = [
  'linear-gradient(135deg,#0d1117 0%,#1a0533 50%,#050a1a 100%)',
  'linear-gradient(135deg,#0a2818 0%,#004d2e 50%,#001a0f 100%)',
  'linear-gradient(135deg,#1a1200 0%,#3d2d00 50%,#1a0e00 100%)',
  'linear-gradient(135deg,#1a0014 0%,#3d0033 50%,#0a000c 100%)',
  'linear-gradient(135deg,#00101a 0%,#003366 50%,#000d1a 100%)',
]
