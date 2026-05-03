import React, { useState, useEffect, useRef } from 'react'
import { useChat, useMessages } from '../hooks/useChat'
import Avatar from '../components/Avatar'
import { useToast } from '../components/Toast'

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = (Date.now() - new Date(dateStr)) / 1000
  if (diff < 60) return 'now'
  if (diff < 3600) return Math.floor(diff / 60) + 'm'
  if (diff < 86400) return Math.floor(diff / 3600) + 'h'
  return Math.floor(diff / 86400) + 'd'
}

export default function ChatScreen({ userId }) {
  const [thread, setThread] = useState(null) // { id, profile }
  const { conversations, loadingConvos, reloadConversations } = useChat(userId)

  if (thread) {
    return (
      <Conversation
        userId={userId}
        other={thread}
        onBack={() => { setThread(null); reloadConversations() }}
      />
    )
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto' }}>
      <div style={{ padding: '16px 16px 8px', fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800 }}>
        Messages
      </div>

      {loadingConvos ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
          <div style={loaderStyle} />
        </div>
      ) : conversations.length === 0 ? (
        <div style={{ padding: '48px 32px', textAlign: 'center' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="1.2" strokeLinecap="round" style={{ marginBottom: 16, display: 'block', margin: '0 auto 16px' }}>
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, marginBottom: 8 }}>No messages yet</p>
          <p style={{ fontSize: 13, color: 'var(--text2)' }}>Find someone in Discover to start a conversation.</p>
        </div>
      ) : (
        conversations.map(c => (
          <button
            key={c.id}
            onClick={() => setThread(c)}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 16px', width: '100%', textAlign: 'left',
              background: 'none', border: 'none', cursor: 'pointer',
              borderBottom: '0.5px solid var(--border)',
            }}
          >
            <Avatar url={c.profile?.avatar_url} name={c.profile?.username} size={48} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>@{c.profile?.username}</div>
              <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {c.lastMessage?.text || 'Start a conversation'}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
              <span style={{ fontSize: 11, color: 'var(--text3)' }}>{timeAgo(c.lastMessage?.created_at)}</span>
              {c.lastMessage && !c.lastMessage.read && c.lastMessage.sender_id !== userId && (
                <div style={{ width: 8, height: 8, background: 'var(--accent)', borderRadius: '50%' }} />
              )}
            </div>
          </button>
        ))
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

function Conversation({ userId, other, onBack }) {
  const toast = useToast()
  const { messages, loading, sendMessage } = useMessages(userId, other.id)
  const [text, setText] = useState('')
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  async function handleSend() {
    const t = text.trim()
    if (!t) return
    setText('')
    const ok = await sendMessage(t)
    if (!ok) toast('Failed to send', 'error')
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '10px 16px', borderBottom: '0.5px solid var(--border)', flexShrink: 0,
      }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', padding: 4 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <Avatar url={other.profile?.avatar_url} name={other.profile?.username} size={36} />
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>
            @{other.profile?.username}
          </div>
          <div style={{ fontSize: 11, color: 'var(--learn)' }}>active now</div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 32 }}><div style={loaderStyle} /></div>
        ) : messages.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text3)', fontSize: 13, marginTop: 48 }}>Say hello 👋</p>
        ) : (
          messages.map(m => {
            const mine = m.sender_id === userId
            return (
              <div key={m.id} style={{
                alignSelf: mine ? 'flex-end' : 'flex-start',
                maxWidth: '72%',
                padding: '10px 14px',
                borderRadius: 14,
                borderBottomRightRadius: mine ? 4 : 14,
                borderBottomLeftRadius: mine ? 14 : 4,
                background: mine ? 'var(--accent)' : 'var(--bg3)',
                color: mine ? '#000' : 'var(--text)',
                fontSize: 14, lineHeight: 1.5,
              }}>
                {m.text}
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        display: 'flex', gap: 8, padding: '12px 16px',
        borderTop: '0.5px solid var(--border)', flexShrink: 0,
        alignItems: 'flex-end',
      }}>
        <textarea
          ref={inputRef}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message…"
          rows={1}
          style={{
            flex: 1, background: 'var(--bg3)',
            border: '0.5px solid var(--border)', borderRadius: 20,
            padding: '10px 16px', fontSize: 14, color: 'var(--text)',
            outline: 'none', resize: 'none', maxHeight: 100,
          }}
          onFocus={e => e.target.style.borderColor = 'rgba(200,255,0,0.3)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />
        <button
          onClick={handleSend}
          style={{
            width: 40, height: 40, borderRadius: '50%',
            background: text.trim() ? 'var(--accent)' : 'var(--bg3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: 'none', cursor: 'pointer', flexShrink: 0,
            transition: 'background 0.2s',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={text.trim() ? '#000' : 'var(--text3)'} strokeWidth="2" strokeLinecap="round">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
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
