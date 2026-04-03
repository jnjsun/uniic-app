# UNIIC APP — Contesto Progetto per Claude

## Cos'è questo progetto
App web mobile (PWA) per UNIIC — Unione Imprenditori Italia Cina Nuove Generazioni ETS.
Permette ai soci di accedere al network, eventi, convenzioni, newsletter e podcast dell'associazione.

## Stack tecnico
- **Frontend:** React + Vite (PWA)
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **Deploy:** Vercel (auto-deploy su ogni push a master)
- **Repo GitHub:** github.com/jnjsun/uniic-app
- **URL live:** uniic-app.vercel.app
- **Supabase project:** atltrjhnkklnkgwscsuy.supabase.co (West EU Ireland)

## Utente principale
- **Nome:** Sun Jun Jie (JJ)
- **Email:** jj@suncapital.it
- **Ruolo nell'app:** admin/direttivo
- **GitHub:** jnjsun

## Struttura app (sezioni principali in App.jsx)
1. **LoginScreen** — autenticazione Supabase Auth, con toggle show/hide password
2. **RegistrationScreen** — form richiesta iscrizione pre-login (nome, cognome, email, telefono, citta, nazionalita, data nascita, azienda, ruolo, settore, messaggio). Inserisce in `richieste_iscrizione` con stato `pending`
3. **HomeSection** — dashboard con statistiche e accesso rapido
4. **SociSection** — elenco soci con ricerca/filtri, profilo dettagliato
5. **EventiSection** — lista eventi, scheda evento (EvScheda), lista iscritti (EvIscritti)
6. **ConvenzioniSection** — convenzioni attive con card per categoria, dettaglio partner, form "Proponi una convenzione"
7. **NewsletterSection** — articoli per categoria + tab "Digest IT-CN" con weekly digest bilingue
8. **PodcastSection** — player episodi
9. **AccountSection** — profilo utente loggato, modifica dati
10. **AdminPanel** — CRUD completo per Soci, Eventi, Convenzioni, Articoli, Podcast, Richieste Iscrizione, News Digest (solo jj@suncapital.it)

## Tabelle Supabase

### Tabella `soci`
Colonne confermate presenti:
```
id, user_id, nome, cognome, email, telefono, citta, nazionalita,
data_nascita (date), azienda, ruolo_azienda, settore, sito_web,
stato_civile, num_figli, hobby (text[]),
whatsapp, wechat, tipo (direttivo/ordinario/presidente/presidente_onorario),
ruolo_uniic, ruolo_commento, anno_iscritto, attivo,
codice_fiscale, partita_iva, indirizzo, provincia, cap, sesso,
tipo_socio ('individuo' o 'azienda'), ragione_sociale, regione,
data_iscrizione (date), ultima_tessera, ultimo_pagamento
```
**NOTA:** 160 soci importati da AssoFacile (aprile 2026). Le aziende (65) hanno ragione_sociale ma NON nome/cognome. Gli individui (112) hanno nome+cognome. Il campo `tipo_socio` distingue i due tipi.

### Tabella `eventi`
3 eventi reali: Gala Annuale 2026 (18 marzo), Forum UNIIC 2026, Cena Sociale UNIIC 2026.

### Tabella `convenzioni`
Arricchita con: partner, descrizione_partner, beneficio, sconto, codice_convenzione, contatto_nome, contatto_email, contatto_telefono, indirizzo, citta, sito_web, logo_url, data_inizio, data_fine, attiva, note_interne, created_at. 10 partner reali inseriti.

### Tabella `richieste_iscrizione`
Flusso registrazione nuovo utente. Campi: nome, cognome, email (unique), telefono, citta, nazionalita, data_nascita, azienda, ruolo_azienda, settore, messaggio, stato (pending/approved/rejected), motivo_rifiuto, created_at, reviewed_at, reviewed_by.

### Tabella `news_digest`
Weekly digest bilingue IT-CN. Campi: titolo_it, titolo_cn, riassunto_it, riassunto_cn, fonte, url_originale, categoria, settimana_rif, importanza (1-5), pubblicato. 7 articoli esempio. Edge Function skeleton da collegare a NewsAPI + Anthropic.

### Tabella `proposte_convenzioni`
Proposte soci per nuove convenzioni. Campi: nome_partner, tipo_servizio, contatto, note, proposto_da, stato, created_at.

### Altre tabelle
`articoli`, `episodi`, `push_subscriptions`

## Logica ruoli
- **Admin** = solo jj@suncapital.it (NON basato sul campo "tipo")
- **Tutti i soci** vedono tutti i campi del profilo
- Solo admin vede: export, comunicazione, badge gestione, cambio ruolo, promuovi, richieste iscrizione, gestione digest

## Funzionalita completate
- Login/logout con Supabase Auth
- Registrazione nuovo utente con form + approvazione admin + badge notifica pending
- Splash screen con logo UNIIC
- Profilo utente pre-caricato e salvabile
- Elenco soci da DB con ricerca e filtri (160 soci reali)
- Profilo socio con tab Info/Impresa/Famiglia/Storico
- Pulsanti WhatsApp, WeChat, Email, Telefono
- Admin: cambio ruolo socio con dropdown
- Eventi con iscrizione/annullamento (3 eventi reali)
- EvIscritti admin: export CSV, comunicazione, badge stato, ospiti, pagamento, promuovi
- Convenzioni: 10 partner reali, card per categoria, dettaglio, form proposta
- Weekly digest news IT-CN: vista settimanale, card, toggle lingua, filtro categoria, vista dettaglio, admin CRUD
- Admin Panel CRUD completo per tutte le sezioni
- Push notifications parziali (VAPID configurato, Edge Function deployata)

## Funzionalita da completare
- Fix visualizzazione card soci (aziende mostrano vuoto, serve mostrare ragione_sociale)
- Push notifications end-to-end su dispositivi reali
- Weekly digest — collegare NewsAPI + Anthropic API
- Email comunicazione reale (Resend SMTP)
- Hobby con checkbox multiple
- Pulizia dati soci importati

## Workflow deployment (IMPORTANTE)
Claude Code deve sempre concludere con:
```
git add .
git commit -m "descrizione modifica"
git checkout master
git merge [nome-branch-corrente]
git push
```
**MAI aprire PR su GitHub** — merge diretto su master.
Vercel rideploya automaticamente entro 30 secondi dal push.

## Variabili d'ambiente
```
VITE_SUPABASE_URL=https://atltrjhnkklnkgwscsuy.supabase.co
VITE_SUPABASE_ANON_KEY=[chiave anon]
```
VAPID keys configurate per push notifications.
