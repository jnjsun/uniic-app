// Edge Function: weekly-news-digest
// Questa funzione verrà schedulata ogni lunedì per generare il digest settimanale
//
// FASE 2 (da implementare con API key):
// 1. Chiamare NewsAPI con keyword Italia-Cina
// 2. Selezionare top 8-10 articoli
// 3. Chiamare Anthropic API per riassunti bilingue IT/CN
// 4. Salvare in tabella news_digest
//
// Keyword di ricerca previste:
//   "Italy China", "Italia Cina", "中意关系", "意大利 中国",
//   "Italy China trade", "Made in Italy China",
//   "Belt Road Italy", "Via della Seta",
//   "China Europe", "EU China policy"
//
// Testate target:
//   IT: Il Sole 24 Ore, ANSA, Milano Finanza, Corriere della Sera
//   INT: South China Morning Post, Financial Times, Reuters, Bloomberg, Nikkei Asia
//   CN: 新华网 Xinhua, 第一财经 Yicai, 36氪 36Kr
//
// Per ora: restituisce un messaggio di placeholder

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  // TODO FASE 2: implementare con NEWSAPI_KEY e ANTHROPIC_API_KEY
  // const newsApiKey = Deno.env.get('NEWSAPI_KEY')
  // const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY')

  return new Response(
    JSON.stringify({
      status: 'placeholder',
      message: 'Edge Function pronta. Collegare NewsAPI e Anthropic API per generazione automatica.',
      required_secrets: ['NEWSAPI_KEY', 'ANTHROPIC_API_KEY']
    }),
    { headers: { "Content-Type": "application/json" } }
  )
})
