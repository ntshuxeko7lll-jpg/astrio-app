import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://llooewepqlkcpqzmiuzo.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_vYhWHzf0GkDxch6hp9QmAA_kXkJEu6C'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
