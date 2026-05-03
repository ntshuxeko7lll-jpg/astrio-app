import React, { useEffect } from 'react'
import { useNotifications } from '../hooks/useNotifications'
import Avatar from '../components/Avatar'

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = (Date.now() - new Date(dateStr)) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return Math.floor(diff / 60) + 'm ago'
  if (diff < 86400) return Math.floor(diff / 3600) + 'h ago'
  return Math.floor(diff / 86400) + 'd ago'
}

const TYPE_ICON = {
  like: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#ff4d6d" stroke="none">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  ),
  follow: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <line x1="19" y1="8" x2="19" y2="14"/>
      <line x1="22" y1="11" x2="16" y2="11"/>
    </svg>
  ),
  comment: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--chill)" strokeWidth="2" strokeLinecap="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
}

const TYPE_TEXT = {
  like: 'liked your video',
  follow: 'started following you',
  comment: 'commented on your video',
}

export default function NotificationsScreen({ userId }) {
  const { notifications, loading, markAllRead } = useNotifications(userId)

  useEffect(() => {
    // Mark all as read when screen opens
    const timer = setTimeout(markAllRead, 1000)
    return () => clearTimeout(timer)
  }, [markAllRead])

  return (
    <div style={{ flex: 1, overflowY: 'auto' }}>
      <div style={{ padding: '16px 16px 8px', fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800 }}>
        Notifications
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
          <div style={loaderStyle} />
        </div>
      ) : notifications.length === 0 ? (
        <div style={{ padding: '48px 32px', textAlign: 'center' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="1.2" strokeLinecap="round" style={{ display: 'block', margin: '0 auto 16px' }}>
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, marginBottom: 8 }}>All caught up</p>
          <p style={{ fontSize: 13, color: 'var(--text2)' }}>Notifications will appear here when people engage with your content.</p>
        </div>
      ) : (
        notifications.map(n => (
          <div key={n.id} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 16px',
            borderBottom: '0.5px solid var(--border)',
            background: n.read ? 'transparent' : 'rgba(200,255,0,0.03)',
          }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <Avatar url={n.actor?.avatar_url} name={n.actor?.username} size={40} />
              <div style={{
                position: 'absolute', bottom: -2, right: -2,
                width: 18, height: 18, borderRadius: '50%',
                background: 'var(--bg)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {TYPE_ICON[n.type]}
              </div>
            </div>

            <div style={{ flex: 1, fontSize: 13, lineHeight: 1.5 }}>
              <strong style={{ fontWeight: 600 }}>@{n.actor?.username}</strong>{' '}
              <span style={{ color: 'var(--text2)' }}>{TYPE_TEXT[n.type] || n.type}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
              <span style={{ fontSize: 11, color: 'var(--text3)' }}>{timeAgo(n.created_at)}</span>
              {n.post && (
                <div style={{
                  width: 36, height: 48, borderRadius: 6,
                  background: 'var(--bg3)', overflow: 'hidden',
                }}>
                  {n.post.video_url && (
                    <video src={n.post.video_url} muted preload="metadata"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}
                </div>
              )}
            </div>
          </div>
        ))
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

const loaderStyle = {
  width: 28, height: 28,
  border: '2px solid var(--bg3)',
  borderTopColor: 'var(--accent)',
  borderRadius: '50%',
  animation: 'spin 0.8s linear infinite',
}
