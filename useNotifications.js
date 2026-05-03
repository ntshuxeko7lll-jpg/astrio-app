import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabase'

export function useNotifications(userId) {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    try {
      const { data } = await supabase
        .from('notifications')
        .select('*, actor:profiles!notifications_actor_id_fkey(id, username, display_name, avatar_url), post:posts(id, video_url, caption)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50)
      setNotifications(data || [])
      setUnreadCount((data || []).filter(n => !n.read).length)
    } catch (_) {
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => { load() }, [load])

  async function markAllRead() {
    if (!userId) return
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false)
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  return { notifications, unreadCount, loading, reload: load, markAllRead }
}
