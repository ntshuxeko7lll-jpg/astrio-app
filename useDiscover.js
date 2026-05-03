import { useState, useCallback } from 'react'
import { supabase } from '../supabase'

export function useDiscover(userId) {
  const [users, setUsers] = useState([])
  const [trending, setTrending] = useState([])
  const [searching, setSearching] = useState(false)
  const [query, setQuery] = useState('')

  const searchUsers = useCallback(async (q) => {
    setQuery(q)
    if (!q.trim()) { setUsers([]); return }
    setSearching(true)
    try {
      const { data } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url, followers_count')
        .ilike('username', `%${q}%`)
        .neq('id', userId || '')
        .limit(20)
      setUsers(data || [])
    } catch (_) {
      setUsers([])
    } finally {
      setSearching(false)
    }
  }, [userId])

  const loadTrending = useCallback(async () => {
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      const { data } = await supabase
        .from('posts')
        .select('*, profiles(id, username, avatar_url)')
        .gte('created_at', sevenDaysAgo)
        .order('likes_count', { ascending: false })
        .limit(12)
      setTrending(data || [])
    } catch (_) {
      setTrending([])
    }
  }, [])

  async function toggleFollow(targetId) {
    if (!userId) return
    try {
      const { data: existing } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', userId)
        .eq('following_id', targetId)
        .single()

      if (existing) {
        await supabase.from('follows').delete().eq('follower_id', userId).eq('following_id', targetId)
        setUsers(prev => prev.map(u => u.id === targetId ? { ...u, following: false, followers_count: Math.max(0, u.followers_count - 1) } : u))
      } else {
        await supabase.from('follows').insert({ follower_id: userId, following_id: targetId })
        setUsers(prev => prev.map(u => u.id === targetId ? { ...u, following: true, followers_count: u.followers_count + 1 } : u))
      }
    } catch (_) {}
  }

  return { users, trending, searching, query, searchUsers, loadTrending, toggleFollow }
}
