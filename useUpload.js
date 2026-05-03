import { useState, useRef } from 'react'
import { supabase } from '../supabase'

const MAX_UPLOADS_PER_DAY = 10
const MAX_SIZE_BYTES = 10 * 1024 * 1024   // 10 MB
const MAX_DURATION_SEC = 30

export function useUpload(userId) {
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('idle') // idle | compressing | uploading | done | error
  const [error, setError] = useState(null)
  const ffmpegRef = useRef(null)

  // Validate file before uploading
  function validateFile(file) {
    const validTypes = ['video/mp4', 'video/quicktime', 'video/webm', 'video/mov']
    if (!validTypes.includes(file.type) && !file.name.match(/\.(mp4|mov|webm)$/i)) {
      return 'Only MP4, MOV, and WEBM files are supported.'
    }
    if (file.size > 50 * 1024 * 1024) { // allow up to 50MB raw — we compress down
      return 'File is too large. Maximum raw size is 50MB.'
    }
    return null
  }

  function getVideoDuration(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file)
      const video = document.createElement('video')
      video.preload = 'metadata'
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(url)
        resolve(video.duration)
      }
      video.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Cannot read video')) }
      video.src = url
    })
  }

  async function checkDailyLimit() {
    const today = new Date().toISOString().split('T')[0]
    const { data } = await supabase
      .from('upload_counts')
      .select('count')
      .eq('user_id', userId)
      .eq('date', today)
      .single()
    return (data?.count || 0) < MAX_UPLOADS_PER_DAY
  }

  async function incrementDailyCount() {
    const today = new Date().toISOString().split('T')[0]
    await supabase.rpc('check_and_increment_upload', { p_user_id: userId })
  }

  // Try ffmpeg compression, fall back to raw upload if ffmpeg fails to load
  async function compressVideo(file) {
    try {
      const { FFmpeg } = await import('@ffmpeg/ffmpeg')
      const { fetchFile, toBlobURL } = await import('@ffmpeg/util')

      if (!ffmpegRef.current) {
        const ff = new FFmpeg()
        await ff.load({
          coreURL: await toBlobURL('https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.js', 'text/javascript'),
          wasmURL: await toBlobURL('https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.wasm', 'application/wasm'),
        })
        ffmpegRef.current = ff
      }

      const ff = ffmpegRef.current
      const inputName = 'input.' + (file.name.split('.').pop() || 'mp4')
      const outputName = 'output.mp4'

      ff.on('progress', ({ progress: p }) => {
        setProgress(Math.round(20 + p * 50)) // 20% → 70%
      })

      await ff.writeFile(inputName, await fetchFile(file))
      await ff.exec([
        '-i', inputName,
        '-vcodec', 'libx264',
        '-crf', '28',
        '-preset', 'fast',
        '-acodec', 'aac',
        '-b:a', '96k',
        '-movflags', '+faststart',
        '-t', String(MAX_DURATION_SEC),
        outputName,
      ])

      const data = await ff.readFile(outputName)
      return new Blob([data.buffer], { type: 'video/mp4' })
    } catch (err) {
      console.warn('ffmpeg compression failed, using raw file:', err.message)
      return file // fall back to raw
    }
  }

  async function upload(file, caption, tag) {
    setError(null)
    setProgress(0)

    // 1. Basic validation
    const validErr = validateFile(file)
    if (validErr) { setError(validErr); return false }

    // 2. Duration check
    let duration
    try {
      duration = await getVideoDuration(file)
      if (duration > MAX_DURATION_SEC) {
        setError(`Video is too long (${Math.round(duration)}s). Maximum is ${MAX_DURATION_SEC} seconds.`)
        return false
      }
    } catch (_) {
      setError('Could not read video duration.')
      return false
    }

    // 3. Daily limit check
    const withinLimit = await checkDailyLimit()
    if (!withinLimit) {
      setError('Daily upload limit (10 videos) reached. Try again tomorrow.')
      return false
    }

    try {
      // 4. Compress
      setStatus('compressing')
      setProgress(10)
      const blob = await compressVideo(file)

      if (blob.size > MAX_SIZE_BYTES) {
        setError(`Compressed file is still too large (${(blob.size / 1024 / 1024).toFixed(1)}MB). Try a shorter clip.`)
        setStatus('error')
        return false
      }

      // 5. Upload to Supabase Storage
      setStatus('uploading')
      setProgress(75)
      const path = `${userId}/${Date.now()}.mp4`
      const { error: upErr } = await supabase.storage
        .from('videos')
        .upload(path, blob, { contentType: 'video/mp4', upsert: false })
      if (upErr) throw upErr

      setProgress(88)

      // 6. Get public URL
      const { data: urlData } = supabase.storage.from('videos').getPublicUrl(path)

      // 7. Insert post record
      const { error: dbErr } = await supabase.from('posts').insert({
        user_id: userId,
        video_url: urlData.publicUrl,
        caption: caption.trim(),
        tag,
        duration_seconds: Math.round(duration),
        likes_count: 0,
        comments_count: 0,
      })
      if (dbErr) throw dbErr

      // 8. Increment daily upload count
      await incrementDailyCount()

      setProgress(100)
      setStatus('done')
      return true
    } catch (err) {
      setError(err.message || 'Upload failed. Please try again.')
      setStatus('error')
      return false
    }
  }

  function reset() {
    setProgress(0)
    setStatus('idle')
    setError(null)
  }

  return { upload, progress, status, error, reset }
}
