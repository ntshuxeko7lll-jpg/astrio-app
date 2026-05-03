import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabase'

export function useFeed(mode, userId) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('posts')
        .select('*, profiles(id, username, display_name, avatar_url)')
        .order('created_at', { ascending: false })
        .limit(20)

      if (mode && mode !== 'all') query = query.eq('tag', mode)

      const { data, error } = await query
      if (error) throw error

      // If user logged in, check which posts they liked
      if (userId && data?.length) {
        const ids = data.map(p => p.id)
        const { data: likedRows } = await supabase
          .from('likes')
          .select('post_id')
          .eq('user_id', userId)
          .in('post_id', ids)
        const likedSet = new Set((likedRows || []).map(r => r.post_id))
        setPosts(data.map(p => ({ ...p, liked: likedSet.has(p.id) })))
      } else {
        setPosts(data || [])
      }
    } catch (_) {
      setPosts([])
    } finally {
      setLoading(false)
    }
  }, [mode, userId])

  useEffect(() => { load() }, [load])

  async function toggleLike(postId) {
    if (!userId) return false

    const idx = posts.findIndex(p => p.id === postId)
    if (idx === -1) return false
    const post = posts[idx]
    const wasLiked = post.liked

    // Optimistic update
    setPosts(prev => prev.map(p =>
      p.id === postId
        ? { ...p, liked: !wasLiked, likes_count: Math.max(0, p.likes_count + (wasLiked ? -1 : 1)) }
        : p
    ))

    try {
      if (wasLiked) {
        await supabase.from('likes').delete().eq('user_id', userId).eq('post_id', postId)
      } else {
        await supabase.from('likes').insert({ user_id: userId, post_id: postId })
      }
      return true
    } catch (_) {
      // Revert on error
      setPosts(prev => prev.map(p =>
        p.id === postId ? { ...p, liked: wasLiked, likes_count: post.likes_count } : p
      ))
      return false
    }
  }

  return { posts, loading, reload: load, toggleLike }
}
