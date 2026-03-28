import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://atltrjhnkklnkgwscsuy.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0bHRyamhua2tsbmtnd3Njc3V5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MTI0NDksImV4cCI6MjA5MDI4ODQ0OX0.-Jpg3LXe4TOUn5AIBho8hFm5foCCNrMO7Vc4QMi5IAI'

export const supabase = createClient(supabaseUrl, supabaseKey)
