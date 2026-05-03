import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useFeed } from '../hooks/useFeed'
import VideoCard from '../components/VideoCard'
import TagPill from '../components/TagPill'
import { useToast } from '../components/Toast'

const MODES = ['all', 'learn', 'chill', 'focus', 'motivate']

// Demo posts shown while real data loads (solves cold-start)
const DEMO_POSTS = [
  { id: 0, video_url: null, caption: 'How neural networks actually learn — explained in 30 seconds', tag: 'learn',    likes_count: 2841, comments_count: 134, profiles: { username: 'nova_learns' } },
  { id: 1, video_url: null, caption: 'lofi beats + this view = perfect evening 🌙',                  tag: 'chill',    likes_count: 1209, comments_count: 87,  profiles: { username: 'chill.waves' } },
  { id: 2, video_url: null, caption: 'pomodoro technique: why 25 minutes changes everything',          tag: 'focus',    likes_count: 3542, comments_count: 201, profiles: { username: 'deep_focus' } },
  { id: 3, video_url: null, caption: 'You are one decision away from a completely different life',     tag: 'motivate', likes_count: 8903, comments_count: 456, profiles: { username: 'rise_daily' } },
  { id: 4, video_url: null, caption: 'CSS grid in 30 seconds — the only guide you need',              tag: 'learn',    likes_count: 4120, comments_count: 311, profiles: { username: 'code_craft' } },
]

export default function FeedScreen({ userId }) {
  const toast = useToast()
  const [mode, setMode] = useState('all')
  const [activeIdx, setActiveIdx] = useState(0)
  const [muted, setMuted] = useState(true)
  const scrollRef = useRef(null)
  const debounceRef = useRef(null)

  const { posts: realPosts, loading, toggleLike } = useFeed(mode, userId)

  // Show demo posts while loading, then real posts once ready
  const posts = loading ? DEMO_POSTS : (realPosts.length > 0 ? realPosts : DEMO_POSTS)

  // Handle scroll snap — detect active video index
  const handleScroll = useCallback(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      if (!scrollRef.current) return
      const h = scrollRef.current.clientHeight
      const idx = Math.round(scrollRef.current.scrollTop / h)
      setActiveIdx(idx)
    }, 80)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => el.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  // Reset to top when mode changes
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 })
    setActiveIdx(0)
  }, [mode])

  async function handleLike(postId) {
    if (!userId) { toast('Sign in to like videos', 'error'); return }
    await toggleLike(postId)
  }

  return (
    <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Mode strip */}
      <div style={{
        display: 'flex', gap: 8, padding: '10px 16px',
        overflowX: 'auto', flexShrink: 0,
        borderBottom: '0.5px solid var(--border)',
      }}>
        {MODES.map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            style={{
              padding: '6px 14px',
              borderRadius: 20,
              border: `1px solid ${mode === m ? (m === 'all' ? 'var(--text)' : 'transparent') : 'var(--border)'}`,
              background: mode === m
                ? m === 'all' ? 'var(--text)' : MODE_COLORS[m]
                : MODE_BG[m] || 'var(--bg3)',
              color: mode === m ? (m === 'all' ? 'var(--bg)' : '#000') : MODE_TEXT[m] || 'var(--text2)',
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 12,
              whiteSpace: 'nowrap',
              letterSpacing: '0.3px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              flexShrink: 0,
            }}
          >
            {m === 'all' ? 'All' : m.charAt(0).toUpperCase() + m.slice(1)}
          </button>
        ))}
      </div>

      {/* Feed */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: 'scroll',
          scrollSnapType: 'y mandatory',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {posts.map((post, i) => (
          <div key={post.id} style={{ height: '100%', scrollSnapAlign: 'start', flexShrink: 0 }}>
            <VideoCard
              post={post}
              isActive={i === activeIdx}
              muted={muted}
              onToggleMute={() => setMuted(m => !m)}
              onLike={handleLike}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

const MODE_COLORS = { learn: 'var(--learn)', chill: 'var(--chill)', focus: 'var(--focus)', motivate: 'var(--motivate)' }
const MODE_BG     = { learn: 'rgba(79,255,176,0.08)', chill: 'rgba(126,184,255,0.08)', focus: 'rgba(245,255,126,0.08)', motivate: 'rgba(255,126,184,0.08)' }
const MODE_TEXT   = { learn: 'var(--learn)', chill: 'var(--chill)', focus: 'var(--focus)', motivate: 'var(--motivate)' }
