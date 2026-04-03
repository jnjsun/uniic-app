// Edge Function: weekly-news-digest
// Schedulata ogni lunedì alle 7:00 UTC via pg_cron
// 1. Chiama NewsAPI con keyword specifiche IT-CN in inglese e italiano
// 2. Filtra per whitelist fonti di qualità
// 3. Chiama Anthropic API per valutare rilevanza (scarta articoli non pertinenti)
// 4. Chiama Anthropic API per titolo e riassunto bilingue IT/CN
// 5. Salva in tabella news_digest con pubblicato = false (bozze per approvazione admin)

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

const KEYWORDS_EN = [
  "Italy China trade",
  "Italy China investment",
  "Italian Chinese business",
  "EU China trade Italy",
  "Chinese entrepreneurs Italy",
  "Made in Italy China",
]

const KEYWORDS_IT = [
  "commercio Italia Cina",
  "imprenditori cinesi Italia",
  "investimenti Italia Cina",
  "Chinatown Milano",
]

const SOURCE_WHITELIST: string[] = [
  // Italiane
  "il sole 24 ore", "ansa", "milano finanza", "corriere della sera",
  "la repubblica", "agi", "adnkronos", "il giornale", "avvenire",
  // Internazionali
  "south china morning post", "financial times", "reuters", "bloomberg",
  "nikkei asia", "the economist", "bbc", "cnn", "al jazeera",
  // Cinesi in inglese
  "xinhua", "cgtn", "global times", "caixin", "yicai",
  // Specializzate
  "china briefing", "the diplomat", "asia times", "euobserver",
]

const CATEGORIES_MAP: Record<string, string> = {
  business: "business",
  economy: "business",
  trade: "business",
  finance: "business",
  commercio: "business",
  investiment: "business",
  technology: "innovazione",
  tech: "innovazione",
  innovation: "innovazione",
  startup: "innovazione",
  politics: "politica",
  policy: "politica",
  diplomacy: "politica",
  government: "politica",
  politica: "politica",
  diplomazia: "politica",
  geopolitics: "geopolitica",
  sanctions: "geopolitica",
  military: "geopolitica",
  defense: "geopolitica",
  culture: "cultura",
  education: "cultura",
  sport: "cultura",
  art: "cultura",
  food: "cultura",
  cultura: "cultura",
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

/** Data di 7 giorni fa in formato YYYY-MM-DD */
function oneWeekAgo(): string {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() - 7)
  return d.toISOString().split("T")[0]
}

/** Chiama NewsAPI per una keyword e lingua, ritorna articoli */
async function fetchNewsAPI(apiKey: string, keyword: string, fromDate: string, language: string): Promise<NewsAPIArticle[]> {
  const params = new URLSearchParams({
    q: keyword,
    from: fromDate,
    sortBy: "relevancy",
    language,
    pageSize: "30",
    apiKey,
  })

  const resp = await fetch(`https://newsapi.org/v2/everything?${params}`)
  if (!resp.ok) {
    console.error(`NewsAPI error for "${keyword}" (${language}): ${resp.status} ${resp.statusText}`)
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

/** Filtra articoli per whitelist fonti */
function filterBySource(articles: NewsAPIArticle[]): NewsAPIArticle[] {
  return articles.filter((a) => {
    const sourceName = (a.source?.name || "").toLowerCase()
    return SOURCE_WHITELIST.some((allowed) => sourceName.includes(allowed))
  })
}

/** Classifica un articolo in una categoria basandosi su titolo e descrizione */
function classifyCategory(title: string, description: string | null): string {
  const text = `${title} ${description || ""}`.toLowerCase()
  for (const [keyword, cat] of Object.entries(CATEGORIES_MAP)) {
    if (text.includes(keyword)) return cat
  }
  return "business"
}

/** Chiama Anthropic per valutare la rilevanza di un articolo */
async function checkRelevance(apiKey: string, article: NewsAPIArticle): Promise<boolean> {
  const prompt = `Questo articolo riguarda DIRETTAMENTE le relazioni Italia-Cina, gli scambi commerciali, gli investimenti, la comunità cinese in Italia, o la diplomazia Italia/UE-Cina?

Titolo: ${article.title}
Descrizione: ${article.description || "N/A"}
Fonte: ${article.source.name}

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
    return true // in caso di errore, tieni l'articolo
  }
}

/** Chiama Anthropic API per generare titolo e riassunto bilingue */
async function generateBilingualSummary(
  apiKey: string,
  article: NewsAPIArticle
): Promise<{ titolo_it: string; titolo_cn: string; riassunto_it: string; riassunto_cn: string } | null> {
  const prompt = `Sei un giornalista esperto di relazioni Italia-Cina. Analizza questo articolo e genera un riassunto focalizzato sull'impatto pratico per imprenditori italo-cinesi. Evita riassunti generici.

ARTICOLO:
Titolo: ${article.title}
Descrizione: ${article.description || "N/A"}
Fonte: ${article.source.name}
URL: ${article.url}

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

    // 1. Fetch articoli da NewsAPI — keyword EN e IT separate
    const allArticles: NewsAPIArticle[] = []

    for (const keyword of KEYWORDS_EN) {
      const articles = await fetchNewsAPI(newsApiKey, keyword, fromDate, "en")
      allArticles.push(...articles)
      console.log(`EN "${keyword}": ${articles.length} articoli`)
    }

    for (const keyword of KEYWORDS_IT) {
      const articles = await fetchNewsAPI(newsApiKey, keyword, fromDate, "it")
      allArticles.push(...articles)
      console.log(`IT "${keyword}": ${articles.length} articoli`)
    }

    // 2. Deduplica
    const unique = deduplicateArticles(allArticles)
    console.log(`Articoli unici totali: ${unique.length}`)

    // 3. Filtra per whitelist fonti
    const fromQualitySources = filterBySource(unique)
    console.log(`Articoli da fonti di qualità: ${fromQualitySources.length} (scartati ${unique.length - fromQualitySources.length})`)

    // 4. Prendi top 30 per il pool di filtraggio
    const pool = fromQualitySources.slice(0, 30)

    if (pool.length === 0) {
      return new Response(
        JSON.stringify({ status: "ok", message: "Nessun articolo trovato da fonti di qualità per questa settimana", count: 0 }),
        { headers: { "Content-Type": "application/json" } }
      )
    }

    // 5. Filtro rilevanza con Anthropic — scarta articoli non pertinenti
    const relevant: NewsAPIArticle[] = []
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
    console.log(`Articoli rilevanti: ${relevant.length} (scartati rilevanza: ${scartatiRilevanza})`)

    // 6. Seleziona top 20 articoli rilevanti
    const top = relevant.slice(0, 20)

    if (top.length === 0) {
      return new Response(
        JSON.stringify({ status: "ok", message: "Nessun articolo rilevante trovato per questa settimana", count: 0, scartati_fonte: unique.length - fromQualitySources.length, scartati_rilevanza: scartatiRilevanza }),
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
        fonte: article.source.name,
        url_originale: article.url,
        categoria: classifyCategory(article.title, article.description),
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
        articoli_trovati: unique.length,
        articoli_fonti_qualita: fromQualitySources.length,
        articoli_rilevanti: relevant.length,
        articoli_processati: entries.length,
        scartati_fonte: unique.length - fromQualitySources.length,
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
