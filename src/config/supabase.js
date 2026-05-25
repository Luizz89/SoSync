import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://mlcjdhheoqkwbnniizap.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sY2pkaGhlb3Frd2JubmlpemFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3MjYzOTAsImV4cCI6MjA5NTMwMjM5MH0.QxHvpIZMuxyaqkemblkAjnFGG6fx_VbfMGU50iut5Hs'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)