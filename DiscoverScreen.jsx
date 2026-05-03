import React, { useEffect, useRef } from 'react'
import { useDiscover } from '../hooks/useDiscover'
import Avatar from '../components/Avatar'
import TagPill from '../components/TagPill'
import { useToast } from '../components/Toast'

function fmtNum(n) {
  if (!n) return '0'
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
  return String(n)
}

const GRADIENTS = [
  'linear-gradient(135deg,#0d1117,#1a0533)',
  'linear-gradient(135deg,#0a2818,#004d2e)',
  'linear-gradient(135deg,#1a1200,#3d2d00)',
  'linear-gradient(135deg,#1a0014,#3d0033)',
  'linear-gradient(135deg,#00101a,#003366)',
  'linear-gradient(135deg,#1a0d00,#4d2000)',
]

export default function DiscoverScreen({ userId }) {
  const toast = useToast()
  const searchRef = useRef(null)
  const debounceRef = useRef(null)

  const { users, trending, searching, query, searchUsers, loadTrending, toggleFollow } = useDiscover(userId)

  useEffect(() => { loadTrending() }, [loadTrending])

  function handleSearchChange(e) {
    const v = e.target.value
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => searchUsers(v), 300)
  }

  async function handleFollow(user) {
    if (!userId) { toast('Sign in to follow', 'error'); return }
    await toggleFollow(user.id)
    toast(user.following ? `Unfollowed @${user.username}` : `Following @${user.username}`)
  }

  const showUsers = query.trim().length > 0

  return (
    <div style={{ flex: 1, overflowY: 'auto' }}>
      {/* Search input */}
      <div style={{ padding: '12px 16px', position: 'relative' }}>
        <div style={{ position: 'absolute', left: 28, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
        </div>
        <input
          ref={searchRef}
          onChange={handleSearchChange}
          placeholder="Search users…"
          style={{
            width: '100%', background: 'var(--bg3)',
            border: '0.5px solid var(--border)', borderRadius: 'var(--r)',
            padding: '10px 16px 10px 40px', fontSize: 14, color: 'var(--text)',
            outline: 'none',
          }}
          onFocus={e => e.target.style.borderColor = 'rgba(200,255,0,0.3)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />
      </div>

      {/* User search results */}
      {showUsers && (
        <>
          <SectionLabel>{searching ? 'Searching…' : `Results for "${query}"`}</SectionLabel>
          {users.length === 0 && !searching && (
            <p style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text2)' }}>No users found.</p>
          )}
          {users.map(u => (
            <UserRow key={u.id} user={u} onFollow={() => handleFollow(u)} />
          ))}
        </>
      )}

      {/* Trending */}
      {!showUsers && (
        <>
          <SectionLabel>Trending this week</SectionLabel>
          {trending.length === 0 ? (
            <p style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text2)' }}>No trending posts yet.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, paddingBottom: 16 }}>
              {trending.map((p, i) => (
                <div key={p.id} style={{
                  aspectRatio: '9/16',
                  background: p.video_url ? undefined : GRADIENTS[i % GRADIENTS.length],
                  position: 'relative', overflow: 'hidden', cursor: 'pointer',
                }}>
                  {p.video_url && (
                    <video src={p.video_url} muted preload="metadata"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 55%)',
                    display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                    padding: 8,
                  }}>
                    <TagPill tag={p.tag} />
                    <p style={{ fontSize: 11, fontWeight: 500, marginTop: 4, lineHeight: 1.3, color: '#fff' }}>
                      {(p.caption || '').slice(0, 50)}{p.caption?.length > 50 ? '…' : ''}
                    </p>
                    <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', marginTop: 3 }}>
                      ❤️ {fmtNum(p.likes_count)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function UserRow({ user, onFollow }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '10px 16px', borderBottom: '0.5px solid var(--border)',
    }}>
      <Avatar url={user.avatar_url} name={user.username} size={44} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 14 }}>{user.display_name || user.username}</div>
        <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>
          @{user.username} · {fmtNum(user.followers_count)} followers
        </div>
      </div>
      <button
        onClick={onFollow}
        style={{
          padding: '6px 14px', borderRadius: 8,
          fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700,
          background: user.following ? 'var(--bg3)' : 'var(--accent)',
          color: user.following ? 'var(--text2)' : '#000',
          border: user.following ? '0.5px solid var(--border)' : 'none',
          cursor: 'pointer', whiteSpace: 'nowrap',
        }}
      >
        {user.following ? 'Following' : 'Follow'}
      </button>
    </div>
  )
}

function SectionLabel({ children }) {
  return (
    <div style={{
      padding: '14px 16px 8px',
      fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700,
      color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.5px',
    }}>
      {children}
    </div>
  )
}
