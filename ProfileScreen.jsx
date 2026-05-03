import React, { useState, useEffect } from 'react'
import { supabase } from '../supabase'
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
]

export default function ProfileScreen({ session, profile, onSignOut }) {
  const toast = useToast()
  const [posts, setPosts] = useState([])
  const [loadingPosts, setLoadingPosts] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editBio, setEditBio] = useState(profile?.bio || '')
  const [editName, setEditName] = useState(profile?.display_name || '')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!profile?.id) return
    setLoadingPosts(true)
    supabase
      .from('posts')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => { setPosts(data || []); setLoadingPosts(false) })
  }, [profile?.id])

  async function saveProfile() {
    if (!session) return
    setSaving(true)
    try {
      await supabase.from('profiles').update({ display_name: editName, bio: editBio }).eq('id', session.user.id)
      toast('Profile updated!')
      setEditing(false)
    } catch (_) {
      toast('Failed to save', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (!profile) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={loaderStyle} />
      </div>
    )
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto' }}>
      {/* Header */}
      <div style={{ padding: '20px 16px 0', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        <Avatar
          url={profile.avatar_url}
          name={profile.username}
          size={72}
          style={{ border: '2.5px solid var(--accent)' }}
        />
        <div style={{ flex: 1 }}>
          {editing ? (
            <input
              value={editName}
              onChange={e => setEditName(e.target.value)}
              style={{
                fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18,
                background: 'var(--bg3)', border: '0.5px solid var(--border)',
                borderRadius: 8, padding: '4px 10px', color: 'var(--text)', width: '100%',
              }}
            />
          ) : (
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20 }}>
              {profile.display_name || profile.username}
            </div>
          )}
          <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 3 }}>@{profile.username}</div>
          {editing ? (
            <textarea
              value={editBio}
              onChange={e => setEditBio(e.target.value)}
              rows={2}
              placeholder="Add a bio…"
              style={{
                marginTop: 8, width: '100%', fontSize: 13,
                background: 'var(--bg3)', border: '0.5px solid var(--border)',
                borderRadius: 8, padding: '6px 10px', color: 'var(--text)', resize: 'none',
              }}
            />
          ) : (
            <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 6, lineHeight: 1.5 }}>
              {profile.bio || 'No bio yet.'}
            </div>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div style={{
        display: 'flex', margin: '16px 0 0',
        borderTop: '0.5px solid var(--border)', borderBottom: '0.5px solid var(--border)',
      }}>
        {[
          { label: 'Posts',     value: posts.length },
          { label: 'Followers', value: profile.followers_count || 0 },
          { label: 'Following', value: profile.following_count || 0 },
        ].map((s, i, arr) => (
          <div key={s.label} style={{
            flex: 1, padding: '14px 0',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            borderRight: i < arr.length - 1 ? '0.5px solid var(--border)' : 'none',
          }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700 }}>{fmtNum(s.value)}</span>
            <span style={{ fontSize: 11, color: 'var(--text2)' }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, padding: '12px 16px' }}>
        {editing ? (
          <>
            <button onClick={saveProfile} disabled={saving} style={{ ...btnStyle, background: 'var(--accent)', color: '#000', flex: 1 }}>
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button onClick={() => setEditing(false)} style={{ ...btnStyle, background: 'var(--bg3)', flex: 1 }}>
              Cancel
            </button>
          </>
        ) : (
          <>
            <button onClick={() => { setEditing(true); setEditBio(profile.bio || ''); setEditName(profile.display_name || '') }} style={{ ...btnStyle, background: 'var(--accent)', color: '#000', flex: 1 }}>
              Edit Profile
            </button>
            <button onClick={onSignOut} style={{ ...btnStyle, background: 'var(--bg3)', flex: 1 }}>
              Sign Out
            </button>
          </>
        )}
      </div>

      {/* Posts grid */}
      {loadingPosts ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
          <div style={loaderStyle} />
        </div>
      ) : posts.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, marginBottom: 8 }}>No posts yet</p>
          <p style={{ fontSize: 13, color: 'var(--text2)' }}>Hit the + button to upload your first video.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 2 }}>
          {posts.map((p, i) => (
            <div key={p.id} style={{
              aspectRatio: '9/16',
              background: GRADIENTS[i % GRADIENTS.length],
              position: 'relative', overflow: 'hidden', cursor: 'pointer',
            }}>
              {p.video_url && (
                <video src={p.video_url} muted preload="metadata"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              )}
              {/* Tag + likes overlay */}
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent)',
                padding: '12px 4px 4px',
                display: 'flex', alignItems: 'center', gap: 3,
              }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="#fff" stroke="none">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                <span style={{ fontSize: 10, color: '#fff', fontWeight: 600 }}>{fmtNum(p.likes_count)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const btnStyle = {
  padding: '10px 0', borderRadius: 'var(--r-sm)',
  fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700,
  border: '0.5px solid var(--border)', cursor: 'pointer', textAlign: 'center',
}

const loaderStyle = {
  width: 28, height: 28,
  border: '2px solid var(--bg3)',
  borderTopColor: 'var(--accent)',
  borderRadius: '50%',
  animation: 'spin 0.8s linear infinite',
}
