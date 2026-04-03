// Edge Function: send-push-notification
// Invia push notifications a tutti i soci registrati usando web-push protocol
//
// Secrets necessari in Supabase:
//   VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT (es. mailto:jj@suncapital.it)
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (auto-disponibili)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

// Web Push utilities - implementazione diretta del protocollo RFC 8291
// usando crypto nativo di Deno (no dipendenza web-push npm)

async function generatePushHeaders(subscription: { endpoint: string; p256dh: string; auth: string }, vapidPublicKey: string, vapidPrivateKey: string, vapidSubject: string) {
  const audience = new URL(subscription.endpoint).origin

  // JWT per VAPID
  const header = { typ: "JWT", alg: "ES256" }
  const now = Math.floor(Date.now() / 1000)
  const payload = { aud: audience, exp: now + 12 * 3600, sub: vapidSubject }

  const jwtHeader = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  const jwtPayload = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')

  // Import VAPID private key
  const rawKey = base64UrlToBuffer(vapidPrivateKey)
  const publicKeyRaw = base64UrlToBuffer(vapidPublicKey)

  // Build JWK for P-256 private key
  const jwk = {
    kty: "EC",
    crv: "P-256",
    x: bufferToBase64Url(publicKeyRaw.slice(1, 33)),
    y: bufferToBase64Url(publicKeyRaw.slice(33, 65)),
    d: bufferToBase64Url(rawKey),
  }

  const key = await crypto.subtle.importKey("jwk", jwk, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"])

  const signingInput = new TextEncoder().encode(`${jwtHeader}.${jwtPayload}`)
  const signatureBuffer = await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, key, signingInput)
  const signature = bufferToBase64Url(new Uint8Array(signatureBuffer))

  const jwt = `${jwtHeader}.${jwtPayload}.${signature}`
  const vapidKeyBase64 = bufferToBase64Url(publicKeyRaw)

  return {
    Authorization: `vapid t=${jwt}, k=${vapidKeyBase64}`,
    TTL: "86400",
  }
}

async function encryptPayload(subscription: { p256dh: string; auth: string }, payloadText: string) {
  const clientPublicKey = base64UrlToBuffer(subscription.p256dh)
  const clientAuth = base64UrlToBuffer(subscription.auth)

  // Generate local ECDH key pair
  const localKeyPair = await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, ["deriveBits"])

  // Derive shared secret
  const clientKey = await crypto.subtle.importKey("raw", clientPublicKey, { name: "ECDH", namedCurve: "P-256" }, false, [])
  const sharedSecret = new Uint8Array(await crypto.subtle.deriveBits({ name: "ECDH", public: clientKey }, localKeyPair.privateKey, 256))

  // Export local public key
  const localPublicKeyRaw = new Uint8Array(await crypto.subtle.exportKey("raw", localKeyPair.publicKey))

  // HKDF-based key derivation (RFC 8291)
  const authInfo = concatBuffers(
    new TextEncoder().encode("WebPush: info\0"),
    clientPublicKey,
    localPublicKeyRaw
  )

  // IKM = HKDF(auth, sharedSecret, "WebPush: info\0" || client_public || server_public, 32)
  const prk = await hkdfExtract(clientAuth, sharedSecret)
  const ikm = await hkdfExpand(prk, authInfo, 32)

  // Generate salt
  const salt = crypto.getRandomValues(new Uint8Array(16))

  // Derive content encryption key and nonce
  const contentPrk = await hkdfExtract(salt, ikm)
  const cekInfo = new TextEncoder().encode("Content-Encoding: aes128gcm\0")
  const nonceInfo = new TextEncoder().encode("Content-Encoding: nonce\0")

  const cek = await hkdfExpand(contentPrk, cekInfo, 16)
  const nonce = await hkdfExpand(contentPrk, nonceInfo, 12)

  // Pad and encrypt payload
  const payloadBytes = new TextEncoder().encode(payloadText)
  const paddedPayload = concatBuffers(payloadBytes, new Uint8Array([2])) // delimiter byte

  const encryptionKey = await crypto.subtle.importKey("raw", cek, { name: "AES-GCM" }, false, ["encrypt"])
  const encrypted = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce }, encryptionKey, paddedPayload))

  // Build aes128gcm content (RFC 8188)
  const recordSize = new ArrayBuffer(4)
  new DataView(recordSize).setUint32(0, encrypted.length + 86) // header size + record
  const header = concatBuffers(
    salt,
    new Uint8Array(recordSize),
    new Uint8Array([localPublicKeyRaw.length]),
    localPublicKeyRaw
  )

  return concatBuffers(header, encrypted)
}

async function hkdfExtract(salt: Uint8Array, ikm: Uint8Array): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey("raw", salt, { name: "HMAC", hash: "SHA-256" }, false, ["sign"])
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, ikm))
}

async function hkdfExpand(prk: Uint8Array, info: Uint8Array, length: number): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey("raw", prk, { name: "HMAC", hash: "SHA-256" }, false, ["sign"])
  const input = concatBuffers(info, new Uint8Array([1]))
  const output = new Uint8Array(await crypto.subtle.sign("HMAC", key, input))
  return output.slice(0, length)
}

function concatBuffers(...buffers: Uint8Array[]): Uint8Array {
  const total = buffers.reduce((sum, b) => sum + b.length, 0)
  const result = new Uint8Array(total)
  let offset = 0
  for (const buf of buffers) { result.set(buf, offset); offset += buf.length }
  return result
}

function base64UrlToBuffer(b64: string): Uint8Array {
  const padding = '='.repeat((4 - (b64.length % 4)) % 4)
  const base64 = (b64 + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)))
}

function bufferToBase64Url(buffer: Uint8Array): string {
  let binary = ''
  for (const byte of buffer) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

// ─── Main handler ───────────────────────────────────────────────────────────────

serve(async (req) => {
  // CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, apikey, Authorization',
      }
    })
  }

  try {
    const { title, body, url } = await req.json()

    if (!title || !body) {
      return new Response(JSON.stringify({ error: 'title e body sono obbligatori' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      })
    }

    // Supabase client con service_role per leggere tutte le subscription
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // VAPID keys dai secrets
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY')!
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')!
    const vapidSubject = Deno.env.get('VAPID_SUBJECT') || 'mailto:jj@suncapital.it'

    // Leggi tutte le subscription
    const { data: subscriptions, error: dbError } = await supabase
      .from('push_subscriptions')
      .select('*')

    if (dbError) throw dbError
    if (!subscriptions || subscriptions.length === 0) {
      return new Response(JSON.stringify({ sent: 0, message: 'Nessuna subscription trovata' }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      })
    }

    const payload = JSON.stringify({ title, body, url: url || '/' })

    let sent = 0
    let failed = 0
    const expired: string[] = []

    for (const sub of subscriptions) {
      try {
        const headers = await generatePushHeaders(
          { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
          vapidPublicKey, vapidPrivateKey, vapidSubject
        )

        const encryptedPayload = await encryptPayload(
          { p256dh: sub.p256dh, auth: sub.auth },
          payload
        )

        const response = await fetch(sub.endpoint, {
          method: 'POST',
          headers: {
            ...headers,
            'Content-Type': 'application/octet-stream',
            'Content-Encoding': 'aes128gcm',
          },
          body: encryptedPayload,
        })

        if (response.status === 201) {
          sent++
        } else if (response.status === 404 || response.status === 410) {
          // Subscription scaduta o invalida — rimuovere
          expired.push(sub.endpoint)
          failed++
        } else {
          console.error(`Push failed for ${sub.endpoint}: ${response.status} ${await response.text()}`)
          failed++
        }
      } catch (e) {
        console.error(`Error sending to ${sub.endpoint}:`, e)
        failed++
      }
    }

    // Rimuovi subscription scadute
    if (expired.length > 0) {
      await supabase
        .from('push_subscriptions')
        .delete()
        .in('endpoint', expired)
    }

    return new Response(JSON.stringify({
      sent,
      failed,
      expired: expired.length,
      total: subscriptions.length,
    }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })

  } catch (e) {
    console.error('Edge function error:', e)
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
  }
})
