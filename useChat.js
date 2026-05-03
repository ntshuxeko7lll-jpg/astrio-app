import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../supabase'

export function useChat(userId) {
  const [conversations, setConversations] = useState([])
  const [loadingConvos, setLoadingConvos] = useState(true)

  const loadConversations = useCallback(async () => {
    if (!userId) return
    setLoadingConvos(true)
    try {
      // Get distinct people the user has messaged or received from
      const { data: sent } = await supabase
        .from('messages')
        .select('receiver_id, profiles!messages_receiver_id_fkey(id, username, display_name, avatar_url)')
        .eq('sender_id', userId)
        .order('created_at', { ascending: false })

      const { data: received } = await supabase
        .from('messages')
        .select('sender_id, profiles!messages_sender_id_fkey(id, username, display_name, avatar_url)')
        .eq('receiver_id', userId)
        .order('created_at', { ascending: false })

      const seen = new Set()
      const convos = []

      const addConvo = (otherId, profile) => {
        if (!seen.has(otherId)) {
          seen.add(otherId)
          convos.push({ id: otherId, profile })
        }
      }

      ;(sent || []).forEach(r => r.profiles && addConvo(r.receiver_id, r.profiles))
      ;(received || []).forEach(r => r.profiles && addConvo(r.sender_id, r.profiles))

      // Get last message for each convo
      const enriched = await Promise.all(
        convos.map(async (c) => {
          const { data: last } = await supabase
            .from('messages')
            .select('text, created_at, sender_id, read')
            .or(`and(sender_id.eq.${userId},receiver_id.eq.${c.id}),and(sender_id.eq.${c.id},receiver_id.eq.${userId})`)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()
          return { ...c, lastMessage: last }
        })
      )

      setConversations(enriched)
    } catch (_) {
      setConversations([])
    } finally {
      setLoadingConvos(false)
    }
  }, [userId])

  useEffect(() => { loadConversations() }, [loadConversations])

  return { conversations, loadingConvos, reloadConversations: loadConversations }
}

export function useMessages(userId, otherId) {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const channelRef = useRef(null)

  const loadMessages = useCallback(async () => {
    if (!userId || !otherId) return
    setLoading(true)
    try {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherId}),and(sender_id.eq.${otherId},receiver_id.eq.${userId})`)
        .order('created_at', { ascending: true })
      setMessages(data || [])
    } catch (_) {
      setMessages([])
    } finally {
      setLoading(false)
    }
  }, [userId, otherId])

  useEffect(() => {
    loadMessages()

    // Subscribe to real-time new messages
    const channel = supabase
      .channel(`messages:${[userId, otherId].sort().join('_')}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${userId}`,
      }, (payload) => {
        if (payload.new.sender_id === otherId) {
          setMessages(prev => [...prev, payload.new])
        }
      })
      .subscribe()

    channelRef.current = channel
    return () => { supabase.removeChannel(channel) }
  }, [loadMessages, userId, otherId])

  async function sendMessage(text) {
    if (!text.trim()) return false
    const msg = {
      sender_id: userId,
      receiver_id: otherId,
      text: text.trim(),
      read: false,
    }
    // Optimistic
    const tempId = `temp_${Date.now()}`
    setMessages(prev => [...prev, { ...msg, id: tempId, created_at: new Date().toISOString() }])

    const { data, error } = await supabase.from('messages').insert(msg).select().single()
    if (error) {
      setMessages(prev => prev.filter(m => m.id !== tempId))
      return false
    }
    setMessages(prev => prev.map(m => m.id === tempId ? data : m))
    return true
  }

  return { messages, loading, sendMessage }
}
