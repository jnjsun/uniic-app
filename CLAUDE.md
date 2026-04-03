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
2. **HomeSection** — dashboard con statistiche e accesso rapido
3. **SociSection** — elenco soci con ricerca/filtri, profilo dettagliato
4. **EventiSection** — lista eventi, scheda evento (EvScheda), lista iscritti (EvIscritti)
5. **ConvenzioniSection** — convenzioni attive, proposta nuova convenzione
6. **NewsletterSection** — articoli per categoria
7. **PodcastSection** — player episodi
8. **AccountSection** — profilo utente loggato, modifica dati
9. **AdminPanel** — CRUD completo per Soci, Eventi, Convenzioni, Articoli, Podcast (solo jj@suncapital.it)

## Tabelle Supabase

### Tabella `soci`
Colonne confermate presenti:
```
id, user_id, nome, cognome, email, telefono, citta, nazionalita,
data_nascita (date), azienda, ruolo_azienda, settore, sito_web,
stato_civile, num_figli, hobby (text[] — gestito come stringa nell'app),
whatsapp, wechat, tipo (direttivo/ordinario/presidente/presidente_onorario),
ruolo_uniic, ruolo_commento, anno_iscritto, attivo
```

### Altre tabelle esistenti
`eventi`, `convenzioni`, `articoli`, `episodi`, `push_subscriptions`

### Nuove tabelle in sviluppo (aprile 2026)
- `richieste_iscrizione` — flusso registrazione nuovo utente con approvazione admin (Binario B)
- `news_digest` — weekly digest automatico news Italia-Cina bilingue (Binario C)

## Logica ruoli
- **Admin** = solo jj@suncapital.it (NON basato sul campo "tipo")
- **Tutti i soci** vedono tutti i campi del profilo (nessuna restrizione visibilità al momento)
- Solo admin vede: export, comunicazione, badge gestione, cambio ruolo, promuovi

## Funzionalità completate ✅
- Login/logout con Supabase Auth
- Splash screen con logo UNIIC (/logo-uniic.png)
- Profilo utente pre-caricato e salvabile
- Elenco soci da DB con ricerca e filtri
- Profilo socio con tab Info/Impresa/Famiglia/Storico
- Pulsanti WhatsApp (wa.me/), WeChat (weixin://), Email (mailto:), Telefono (tel:)
- Admin: cambio ruolo socio con dropdown + campo commento ruolo
- Eventi con iscrizione/annullamento iscrizione
- EvIscritti admin: export CSV, comunicazione, badge stato, ospiti, pagamento, promuovi
- Admin Panel CRUD completo per tutte le sezioni
- Push notifications (VAPID configurato, Edge Function su Supabase — da testare end-to-end)

## Funzionalità da completare 🔲
- Email comunicazione reale (configurare Resend come provider SMTP su Supabase)
- Push notifications — verificare delivery su dispositivi reali
- Hobby — in futuro lista con checkbox multiple invece di testo libero
- Convenzioni — logica attivazione con codice/link
- Newsletter — editor rich text per admin
- Podcast — upload audio diretto

## Sviluppo parallelo in corso (aprile 2026)
⚠️ ATTENZIONE: lo sviluppo è organizzato in 4 binari paralleli. Ogni binario deve lavorare SOLO sui propri file/tabelle per evitare conflitti di merge.

### Binario A — Dati reali (soci + eventi)
- **Scope:** script di import, tabella `soci`, tabella `eventi`, Admin Panel
- **File:** può toccare App.jsx solo per fix legati al display dei dati importati
- **Supabase:** tabelle `soci`, `eventi`, `iscrizioni_eventi`

### Binario B — Registrazione nuovo utente
- **Scope:** nuova tabella `richieste_iscrizione`, nuovo componente RegistrationScreen, sezione approvazione in AdminPanel
- **File:** crea nuovi componenti, aggiunge sezione in AdminPanel
- **Supabase:** nuova tabella `richieste_iscrizione`, nuove RLS policies

### Binario C — Weekly digest news Italia-Cina
- **Scope:** nuova tabella `news_digest`, Supabase Edge Function schedulata, UI in NewsletterSection
- **File:** modifica NewsletterSection, crea Edge Function
- **Supabase:** nuova tabella `news_digest`, Edge Function `weekly-news-digest`

### Binario D — Convenzioni
- **Scope:** arricchimento tabella `convenzioni`, UI ConvenzioniSection, dati reali
- **File:** modifica ConvenzioniSection, Admin Panel sezione convenzioni
- **Supabase:** tabella `convenzioni`

## Dati reali disponibili (analisi aprile 2026)

### Soci (da AssoFacile export)
- **SOCI_ISCRITTI_UNIIC.xlsx:** 177 record reali (65 AZIENDA + 112 INDIVIDUO), 164 con email
- **STORICO_SOCI_UNIIC.xlsx:** 265 soci storici (69 AZIENDA + 196 INDIVIDUO)
- Colonne disponibili: TIPO, CODICE FISCALE, P.IVA, COGNOME, NOME, RAGIONE SOCIALE, DATA ISCRIZIONE, INDIRIZZO, COMUNE, CAP, PROVINCIA, DATA NASCITA, SESSO, CELLULARE, EMAIL, ULTIMA TESSERA, ULTIMO PAGAMENTO
- Due tipi: INDIVIDUO (ha nome/cognome, data nascita) e AZIENDA (ha ragione sociale, P.IVA)
- La tabella `soci` attuale è strutturata per persone; le aziende associate andranno mappate (ragione sociale → azienda)

### Eventi
- **Gala 2026** (18 marzo, joint UNIIC-ICCF): 238 invitati con nome, ruolo, azienda, tavolo assegnato
- **Forum 2026:** ~96 partecipanti (nome + contatto + n. accompagnatori)
- **Cena UNIIC:** ~84 partecipanti (nome + n. accompagnatori)

### Convenzioni (dal Programma Presidenza)
Partner già identificati: Auxologico, CDI, Vittoria Assicurazioni, Allianz, Banca Sella, Confcommercio Milano, SumUp, Rapisardi IP, Revolut Business, Fineco, + agenzia comunicazione da trovare

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

## Variabili d'ambiente (in .env e su Vercel)
```
VITE_SUPABASE_URL=https://atltrjhnkklnkgwscsuy.supabase.co
VITE_SUPABASE_ANON_KEY=[chiave anon]
```
VAPID keys configurate per push notifications.
