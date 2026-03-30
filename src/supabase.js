import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://atltrjhnkklnkgwscsuy.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0bHRyamhua2tsbmtnd3Njc3V5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MTI0NDksImV4cCI6MjA5MDI4ODQ0OX0.-Jpg3LXe4TOUn5AIBho8hFm5foCCNrMO7Vc4QMi5IAI'

export const supabase = createClient(supabaseUrl, supabaseKey)

const VAPID_PUBLIC_KEY = 'BCxgXMClWZyuXxcZDxXXz1490_YxcdnIUjY6W5FumKz03o3TCUciJvnGbbNGXXkJ4YlHtCWgJWNrCB009SWu90Q'

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)))
}

export async function subscribeToPush(userId) {
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return null

  const registration = await navigator.serviceWorker.ready
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
  })

  const { endpoint, keys: { p256dh, auth } = {} } = subscription.toJSON()

  const { error } = await supabase.from('push_subscriptions').upsert(
    { user_id: userId, endpoint, p256dh, auth, created_at: new Date().toISOString() },
    { onConflict: 'endpoint' }
  )

  if (error) throw error
  return subscription
}
