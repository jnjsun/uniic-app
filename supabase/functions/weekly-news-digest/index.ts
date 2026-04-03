// Edge Function: weekly-news-digest
// Schedulata ogni lunedì alle 7:00 UTC via pg_cron
// 1. Chiama NewsAPI con keyword Italia-Cina
// 2. Seleziona top 8-10 articoli per rilevanza
// 3. Chiama Anthropic API (Claude Sonnet) per titolo e riassunto bilingue IT/CN
// 4. Salva in tabella news_digest con settimana_rif = lunedì corrente

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

// --- Tipi ---

interface NewsAPIArticle {
  title: string
  description: string | null
  url: string
  source: { name: string }
  publishedAt: string
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

const KEYWORDS = [
  "Italy China",
  "Italia Cina",
  "中意",
]

const CATEGORIES_MAP: Record<string, string> = {
  business: "economia",
  economy: "economia",
  trade: "economia",
  technology: "tecnologia",
  tech: "tecnologia",
  politics: "politica",
  policy: "politica",
  diplomacy: "politica",
  culture: "cultura",
  education: "cultura",
  sport: "sport",
}

// --- Funzioni helper ---

/** Calcola il lunedì della settimana corrente in formato YYYY-MM-DD */
function getCurrentMonday(): string {
  const now = new Date()
  const day = now.getUTCDay()
  const diff = day === 0 ? 6 : day - 1 // lunedì = 0
  const monday = new Date(now)
  monday.setUTCDate(now.getUTCDate() - diff)
  return monday.toISOString().split("T")[0]
}

/** Data di 7 giorni fa in formato YYYY-MM-DD */
function oneWeekAgo(): string {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() - 7)
  return d.toISOString().split("T")[0]
}

/** Chiama NewsAPI per una keyword, ritorna articoli */
async function fetchNewsAPI(apiKey: string, keyword: string, fromDate: string): Promise<NewsAPIArticle[]> {
  const params = new URLSearchParams({
    q: keyword,
    from: fromDate,
    sortBy: "relevancy",
    language: "en",
    pageSize: "20",
    apiKey: apiKey,
  })

  const resp = await fetch(`https://newsapi.org/v2/everything?${params}`)
  if (!resp.ok) {
    console.error(`NewsAPI error for "${keyword}": ${resp.status} ${resp.statusText}`)
    return []
  }

  const data = await resp.json()
  return data.articles || []
}

/** Deduplica articoli per URL */
function deduplicateArticles(articles: NewsAPIArticle[]): NewsAPIArticle[] {
  const seen = new Set<string>()
  return articles.filter((a) => {
    if (!a.url || seen.has(a.url)) return false
    seen.add(a.url)
    return true
  })
}

/** Classifica un articolo in una categoria basandosi su titolo e descrizione */
function classifyCategory(title: string, description: string | null): string {
  const text = `${title} ${description || ""}`.toLowerCase()
  for (const [keyword, cat] of Object.entries(CATEGORIES_MAP)) {
    if (text.includes(keyword)) return cat
  }
  return "generale"
}

/** Chiama Anthropic API per generare titolo e riassunto bilingue */
async function generateBilingualSummary(
  apiKey: string,
  article: NewsAPIArticle
): Promise<{ titolo_it: string; titolo_cn: string; riassunto_it: string; riassunto_cn: string } | null> {
  const prompt = `Sei un giornalista esperto di relazioni Italia-Cina. Analizza questo articolo e genera:

ARTICOLO:
Titolo: ${article.title}
Descrizione: ${article.description || "N/A"}
Fonte: ${article.source.name}
URL: ${article.url}

Rispondi SOLO con un JSON valido (senza markdown, senza backtick) con questa struttura esatta:
{
  "titolo_it": "titolo in italiano (max 100 caratteri)",
  "titolo_cn": "标题中文翻译 (max 100 caratteri)",
  "riassunto_it": "riassunto in italiano di 2-3 frasi, chiaro e informativo per imprenditori",
  "riassunto_cn": "中文摘要，2-3句话，清晰且对企业家有参考价值"
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

    // Parse JSON dalla risposta (gestisce eventuali backtick residui)
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
    const newsApiKey = Deno.env.get("NEWSAPI_KEY")
    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY")
    const supabaseUrl = Deno.env.get("SUPABASE_URL")
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")

    if (!newsApiKey || !anthropicKey) {
      return new Response(
        JSON.stringify({ error: "Missing NEWSAPI_KEY or ANTHROPIC_API_KEY secrets" }),
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
    const fromDate = oneWeekAgo()
    const settimanaRif = getCurrentMonday()

    console.log(`Fetching news from ${fromDate}, settimana_rif: ${settimanaRif}`)

    // 1. Fetch articoli da NewsAPI per tutte le keyword
    const allArticles: NewsAPIArticle[] = []
    for (const keyword of KEYWORDS) {
      const articles = await fetchNewsAPI(newsApiKey, keyword, fromDate)
      allArticles.push(...articles)
      console.log(`"${keyword}": ${articles.length} articoli`)
    }

    // 2. Deduplica e seleziona top 10
    const unique = deduplicateArticles(allArticles)
    const top = unique.slice(0, 10)
    console.log(`Articoli unici: ${unique.length}, selezionati: ${top.length}`)

    if (top.length === 0) {
      return new Response(
        JSON.stringify({ status: "ok", message: "Nessun articolo trovato per questa settimana", count: 0 }),
        { headers: { "Content-Type": "application/json" } }
      )
    }

    // 3. Genera riassunti bilingue con Anthropic
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
        fonte: article.source.name,
        url_originale: article.url,
        categoria: classifyCategory(article.title, article.description),
        settimana_rif: settimanaRif,
        importanza: Math.max(1, 5 - i), // top articoli = importanza più alta
        pubblicato: true,
      })
    }

    console.log(`Riassunti generati: ${entries.length}`)

    // 4. Salva in Supabase
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
        articoli_trovati: unique.length,
        articoli_processati: entries.length,
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
