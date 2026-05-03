import React, { useState, useRef } from 'react'
import { useUpload } from '../hooks/useUpload'
import { useToast } from '../components/Toast'
import TagPill from '../components/TagPill'

const TAGS = ['learn', 'chill', 'focus', 'motivate']

export default function CreateScreen({ userId, onPostSuccess }) {
  const toast = useToast()
  const fileInputRef = useRef(null)

  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [caption, setCaption] = useState('')
  const [tag, setTag] = useState('learn')

  const { upload, progress, status, error, reset } = useUpload(userId)

  function handleFileChange(e) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setPreviewUrl(URL.createObjectURL(f))
  }

  function handleRemoveFile() {
    setFile(null)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    reset()
  }

  async function handlePost() {
    if (!userId) { toast('Sign in to post', 'error'); return }
    if (!file)    { toast('Select a video first', 'error'); return }
    if (!caption.trim()) { toast('Add a caption', 'error'); return }

    const ok = await upload(file, caption, tag)
    if (ok) {
      toast('Posted! 🎉')
      setFile(null)
      setPreviewUrl(null)
      setCaption('')
      setTag('learn')
      reset()
      onPostSuccess?.()
    } else if (error) {
      toast(error, 'error')
    }
  }

  const busy = status === 'compressing' || status === 'uploading'

  return (
    <div style={{
      flex: 1, overflowY: 'auto',
      padding: '20px 16px 32px',
      display: 'flex', flexDirection: 'column', gap: 20,
    }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800 }}>
        New Post
      </h1>

      {/* Upload zone / preview */}
      {!file ? (
        <label
          htmlFor="video-upload"
          style={{
            border: '1.5px dashed var(--border)',
            borderRadius: 16,
            padding: '48px 20px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
            cursor: 'pointer', transition: 'border-color 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(200,255,0,0.4)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
        >
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: 'var(--bg3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700 }}>
            Upload Video
          </span>
          <span style={{ fontSize: 12, color: 'var(--text2)', textAlign: 'center', lineHeight: 1.6 }}>
            Max 30 seconds · up to 10MB after compression<br />MP4, MOV, WEBM
          </span>
          <input
            id="video-upload"
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/quicktime,video/webm,.mp4,.mov,.webm"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </label>
      ) : (
        <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', background: '#000' }}>
          <video
            src={previewUrl}
            controls
            muted
            style={{ width: '100%', maxHeight: 300, display: 'block', objectFit: 'cover' }}
          />
          <button
            onClick={handleRemoveFile}
            style={{
              position: 'absolute', top: 8, right: 8,
              width: 28, height: 28, borderRadius: '50%',
              background: 'rgba(0,0,0,0.7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: 'none', cursor: 'pointer', color: '#fff',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      )}

      {/* Progress */}
      {busy && (
        <div>
          <p style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 8, fontFamily: 'var(--font-display)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {status === 'compressing' ? 'Compressing…' : 'Uploading…'}
          </p>
          <div style={{ height: 6, borderRadius: 6, background: 'var(--bg3)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: 'var(--accent)', borderRadius: 6, transition: 'width 0.3s' }} />
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{
          padding: '10px 14px', borderRadius: 'var(--r-sm)',
          background: 'rgba(255,77,109,0.1)', border: '0.5px solid rgba(255,77,109,0.3)',
          color: '#ff4d6d', fontSize: 13,
        }}>
          {error}
        </div>
      )}

      {/* Caption */}
      <div>
        <Label>Caption</Label>
        <textarea
          value={caption}
          onChange={e => setCaption(e.target.value)}
          placeholder="What's this video about?"
          rows={3}
          maxLength={200}
          style={{
            width: '100%', background: 'var(--bg3)',
            border: '0.5px solid var(--border)', borderRadius: 'var(--r)',
            padding: '12px 14px', fontSize: 14, color: 'var(--text)',
            outline: 'none', resize: 'none',
          }}
          onFocus={e => e.target.style.borderColor = 'rgba(200,255,0,0.4)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />
        <p style={{ fontSize: 11, color: 'var(--text3)', textAlign: 'right', marginTop: 4 }}>
          {caption.length}/200
        </p>
      </div>

      {/* Purpose tag */}
      <div>
        <Label>Purpose Tag</Label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {TAGS.map(t => (
            <TagPill key={t} tag={t} size="lg" selected={tag === t} onClick={() => setTag(t)} />
          ))}
        </div>
      </div>

      {/* Submit */}
      <button
        onClick={handlePost}
        disabled={busy}
        style={{
          width: '100%', padding: '14px',
          borderRadius: 'var(--r)',
          fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700,
          background: busy ? 'var(--bg3)' : 'var(--accent)',
          color: busy ? 'var(--text3)' : '#000',
          border: 'none', cursor: busy ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s',
        }}
      >
        {busy ? (status === 'compressing' ? 'Compressing…' : 'Uploading…') : 'Post Video'}
      </button>

      <p style={{ fontSize: 11, color: 'var(--text3)', textAlign: 'center' }}>
        10 uploads max per day
      </p>
    </div>
  )
}

function Label({ children }) {
  return (
    <p style={{
      fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700,
      color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.5px',
      marginBottom: 8,
    }}>
      {children}
    </p>
  )
}
