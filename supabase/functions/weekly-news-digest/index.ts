// Edge Function: weekly-news-digest
// Schedulata ogni lunedì alle 7:00 UTC via pg_cron
// 1. Fetch articoli via Google News RSS (gratuito, no API key)
// 2. Filtro rilevanza con Anthropic (scarta articoli non pertinenti)
// 3. Genera titolo e riassunto bilingue IT/CN con Anthropic
// 4. Salva in tabella news_digest con pubblicato = false (bozze per approvazione admin)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

// --- Tipi ---

interface RSSArticle {
  title: string
  link: string
  source: string
  pubDate: Date
}

interface DigestEntry {
  titolo_it: string
  titolo_cn: string
  riassunto_it: string
  riassunto_cn: string
  fonte: string
  url_originale: string
  categoria: string
  settimana_rif: string
  importanza: number
  pubblicato: boolean
}

// --- Costanti ---

const RSS_FEEDS = [
  "https://news.google.com/rss/search?q=Italia+Cina+commercio&hl=it&gl=IT&ceid=IT:it",
  "https://news.google.com/rss/search?q=imprenditori+cinesi+Italia&hl=it&gl=IT&ceid=IT:it",
  "https://news.google.com/rss/search?q=Made+in+Italy+Cina&hl=it&gl=IT&ceid=IT:it",
  "https://news.google.com/rss/search?q=Italy+China+trade&hl=en&gl=US&ceid=US:en",
  "https://news.google.com/rss/search?q=Italy+China+investment&hl=en&gl=US&ceid=US:en",
  "https://news.google.com/rss/search?q=EU+China+Italy&hl=en&gl=US&ceid=US:en",
  "https://news.google.com/rss/search?q=comunità+cinese+Italia&hl=it&gl=IT&ceid=IT:it",
  "https://news.google.com/rss/search?q=investimenti+Italia+Cina&hl=it&gl=IT&ceid=IT:it",
]

const CATEGORIES_MAP: Record<string, string> = {
  business: "business",
  economy: "business",
  trade: "business",
  finance: "business",
  commercio: "business",
  investiment: "business",
  export: "business",
  import: "business",
  technology: "innovazione",
  tech: "innovazione",
  innovation: "innovazione",
  startup: "innovazione",
  innovazione: "innovazione",
  digitale: "innovazione",
  politics: "politica",
  policy: "politica",
  diplomacy: "politica",
  government: "politica",
  politica: "politica",
  diplomazia: "politica",
  governo: "politica",
  geopolitics: "geopolitica",
  sanctions: "geopolitica",
  military: "geopolitica",
  defense: "geopolitica",
  sanzioni: "geopolitica",
  culture: "cultura",
  education: "cultura",
  sport: "cultura",
  art: "cultura",
  food: "cultura",
  cultura: "cultura",
  turismo: "cultura",
}

// --- Funzioni helper ---

/** Calcola il lunedì della settimana corrente in formato YYYY-MM-DD */
function getCurrentMonday(): string {
  const now = new Date()
  const day = now.getUTCDay()
  const diff = day === 0 ? 6 : day - 1
  const monday = new Date(now)
  monday.setUTCDate(now.getUTCDate() - diff)
  return monday.toISOString().split("T")[0]
}

/** Data di 7 giorni fa */
function oneWeekAgoDate(): Date {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() - 7)
  return d
}

/** Fetch e parse di un feed Google News RSS */
async function fetchGoogleNewsRSS(feedUrl: string): Promise<RSSArticle[]> {
  try {
    const resp = await fetch(feedUrl, {
      headers: { "User-Agent": "UNIIC-Digest-Bot/1.0" },
    })
    if (!resp.ok) {
      console.error(`RSS fetch error for ${feedUrl}: ${resp.status}`)
      return []
    }

    const xml = await resp.text()
    const articles: RSSArticle[] = []

    // Parse XML con regex — ogni <item> contiene title, link, source, pubDate
    const itemRegex = /<item>([\s\S]*?)<\/item>/g
    let match: RegExpExecArray | null

    while ((match = itemRegex.exec(xml)) !== null) {
      const itemXml = match[1]

      const title = extractTag(itemXml, "title")
      const link = extractTag(itemXml, "link")
      const pubDateStr = extractTag(itemXml, "pubDate")
      const source = extractTagAttr(itemXml, "source") || extractTag(itemXml, "source") || ""

      if (!title || !link) continue

      const pubDate = pubDateStr ? new Date(pubDateStr) : new Date()

      articles.push({ title, link, source, pubDate })
    }

    return articles
  } catch (err) {
    console.error(`RSS fetch exception for ${feedUrl}:`, err)
    return []
  }
}

/** Estrae il contenuto testuale di un tag XML */
function extractTag(xml: string, tag: string): string {
  // Gestisce sia <tag>testo</tag> che <tag><![CDATA[testo]]></tag>
  const regex = new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`)
  const m = regex.exec(xml)
  return m ? m[1].trim() : ""
}

/** Estrae il contenuto testuale dal body di un tag con attributi (es. <source url="...">Nome</source>) */
function extractTagAttr(xml: string, tag: string): string {
  const regex = new RegExp(`<${tag}[^>]+>([^<]+)<\\/${tag}>`)
  const m = regex.exec(xml)
  return m ? m[1].trim() : ""
}

/** Deduplica articoli per link (URL) */
function deduplicateArticles(articles: RSSArticle[]): RSSArticle[] {
  const seen = new Set<string>()
  return articles.filter((a) => {
    if (!a.link || seen.has(a.link)) return false
    seen.add(a.link)
    return true
  })
}

/** Classifica un articolo in una categoria basandosi sul titolo */
function classifyCategory(title: string): string {
  const text = title.toLowerCase()
  for (const [keyword, cat] of Object.entries(CATEGORIES_MAP)) {
    if (text.includes(keyword)) return cat
  }
  return "business"
}

/** Chiama Anthropic per valutare la rilevanza di un articolo */
async function checkRelevance(apiKey: string, article: RSSArticle): Promise<boolean> {
  const prompt = `Questo articolo riguarda la Cina E ha potenziale rilevanza per imprenditori o la comunità cinese in Italia/Europa?

Titolo: ${article.title}
Fonte: ${article.source}

Rispondi SOLO "sì" o "no".`

  try {
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 10,
        messages: [{ role: "user", content: prompt }],
      }),
    })

    if (!resp.ok) return true // in caso di errore, tieni l'articolo

    const data = await resp.json()
    const answer = (data.content?.[0]?.text || "").toLowerCase().trim()
    return answer.startsWith("sì") || answer.startsWith("si") || answer === "yes"
  } catch (err) {
    console.error(`Relevance check error for "${article.title}":`, err)
    return true
  }
}

/** Chiama Anthropic API per generare titolo e riassunto bilingue */
async function generateBilingualSummary(
  apiKey: string,
  article: RSSArticle
): Promise<{ titolo_it: string; titolo_cn: string; riassunto_it: string; riassunto_cn: string } | null> {
  const prompt = `Sei un giornalista esperto di relazioni Italia-Cina. Analizza questo articolo e genera un riassunto focalizzato sull'impatto pratico per imprenditori italo-cinesi. Evita riassunti generici.

ARTICOLO:
Titolo: ${article.title}
Fonte: ${article.source}
URL: ${article.link}

Rispondi SOLO con un JSON valido (senza markdown, senza backtick) con questa struttura esatta:
{
  "titolo_it": "titolo in italiano (max 100 caratteri)",
  "titolo_cn": "标题中文翻译 (max 100 caratteri)",
  "riassunto_it": "riassunto in italiano di 2-3 frasi, focalizzato sull'impatto pratico per imprenditori italo-cinesi",
  "riassunto_cn": "中文摘要，2-3句话，侧重于对中意企业家的实际影响"
}`

  try {
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
      }),
    })

    if (!resp.ok) {
      const errText = await resp.text()
      console.error(`Anthropic API error: ${resp.status} — ${errText}`)
      return null
    }

    const data = await resp.json()
    const text = data.content?.[0]?.text
    if (!text) {
      console.error("Anthropic response missing content")
      return null
    }

    const cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim()
    return JSON.parse(cleaned)
  } catch (err) {
    console.error(`Error generating summary for "${article.title}":`, err)
    return null
  }
}

// --- Handler principale ---

serve(async (req) => {
  try {
    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY")
    const supabaseUrl = Deno.env.get("SUPABASE_URL")
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")

    if (!anthropicKey) {
      return new Response(
        JSON.stringify({ error: "Missing ANTHROPIC_API_KEY secret" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      )
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const cutoffDate = oneWeekAgoDate()
    const settimanaRif = getCurrentMonday()

    console.log(`Fetching Google News RSS, cutoff: ${cutoffDate.toISOString()}, settimana_rif: ${settimanaRif}`)

    // 1. Fetch articoli da tutti i feed Google News RSS
    const allArticles: RSSArticle[] = []

    for (const feedUrl of RSS_FEEDS) {
      const articles = await fetchGoogleNewsRSS(feedUrl)
      allArticles.push(...articles)
      console.log(`RSS "${feedUrl.split('q=')[1]?.split('&')[0]}": ${articles.length} articoli`)
    }

    console.log(`Articoli totali dal RSS: ${allArticles.length}`)

    // 2. Filtra solo articoli dell'ultima settimana
    const recentArticles = allArticles.filter((a) => a.pubDate >= cutoffDate)
    console.log(`Articoli ultima settimana: ${recentArticles.length}`)

    // 3. Deduplica
    const unique = deduplicateArticles(recentArticles)
    console.log(`Articoli unici: ${unique.length}`)

    // 4. Prendi top 30 per il pool di filtraggio rilevanza
    const pool = unique.slice(0, 30)

    if (pool.length === 0) {
      return new Response(
        JSON.stringify({ status: "ok", message: "Nessun articolo trovato per questa settimana", count: 0 }),
        { headers: { "Content-Type": "application/json" } }
      )
    }

    // 5. Filtro rilevanza con Anthropic
    const relevant: RSSArticle[] = []
    let scartatiRilevanza = 0
    for (const article of pool) {
      const isRelevant = await checkRelevance(anthropicKey, article)
      if (isRelevant) {
        relevant.push(article)
        console.log(`✓ Rilevante: ${article.title}`)
      } else {
        scartatiRilevanza++
        console.log(`✗ Non rilevante: ${article.title}`)
      }
    }
    console.log(`Articoli rilevanti: ${relevant.length} (scartati: ${scartatiRilevanza})`)

    // 6. Seleziona top 20
    const top = relevant.slice(0, 20)

    if (top.length === 0) {
      return new Response(
        JSON.stringify({ status: "ok", message: "Nessun articolo rilevante trovato", count: 0, pool: pool.length, scartati_rilevanza: scartatiRilevanza }),
        { headers: { "Content-Type": "application/json" } }
      )
    }

    // 7. Genera riassunti bilingue con Anthropic
    const entries: DigestEntry[] = []
    for (let i = 0; i < top.length; i++) {
      const article = top[i]
      console.log(`[${i + 1}/${top.length}] Generando riassunto per: ${article.title}`)

      const summary = await generateBilingualSummary(anthropicKey, article)
      if (!summary) continue

      entries.push({
        titolo_it: summary.titolo_it,
        titolo_cn: summary.titolo_cn,
        riassunto_it: summary.riassunto_it,
        riassunto_cn: summary.riassunto_cn,
        fonte: article.source,
        url_originale: article.link,
        categoria: classifyCategory(article.title),
        settimana_rif: settimanaRif,
        importanza: Math.max(1, Math.ceil(5 - (i * 4) / (top.length - 1 || 1))),
        pubblicato: false,
      })
    }

    console.log(`Riassunti generati: ${entries.length}`)

    // 8. Salva in Supabase
    if (entries.length > 0) {
      const { data, error } = await supabase.from("news_digest").insert(entries)
      if (error) {
        console.error("Supabase insert error:", error)
        return new Response(
          JSON.stringify({ error: "Database insert failed", details: error.message }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        )
      }
      console.log(`Inseriti ${entries.length} articoli nel digest`)
    }

    return new Response(
      JSON.stringify({
        status: "ok",
        settimana_rif: settimanaRif,
        fonte: "Google News RSS",
        articoli_rss_totali: allArticles.length,
        articoli_ultima_settimana: recentArticles.length,
        articoli_unici: unique.length,
        articoli_rilevanti: relevant.length,
        articoli_processati: entries.length,
        scartati_rilevanza: scartatiRilevanza,
        categorie: [...new Set(entries.map((e) => e.categoria))],
      }),
      { headers: { "Content-Type": "application/json" } }
    )
  } catch (err) {
    console.error("Unhandled error:", err)
    return new Response(
      JSON.stringify({ error: "Internal error", details: String(err) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
})
