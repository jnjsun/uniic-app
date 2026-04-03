# LESSONS LEARNED — UNIIC APP

Lezioni apprese nelle sessioni di sviluppo per evitare di ripetere gli stessi errori.

---

## Git & Deployment

### Workflow corretto
```bash
git checkout master
git merge claude/[nome-branch]
git push
```
Vercel rideploya automaticamente entro 30 secondi.

### Errori comuni
- **Non rispondere "si" alla domanda "Apro PR su GitHub?"** di Claude Code — rispondere sempre NO
- **Non fare `git pull` aspettandosi modifiche** se Claude Code non ha pushato su GitHub ma solo in locale
- **L'editor vim si apre durante merge non-fast-forward** — uscire con `:wq` + Invio, oppure Shift+Z+Z
- Quando Claude Code non ha `gh` CLI installato, il merge va fatto manualmente

### Regola finale per ogni brief a Claude Code
Aggiungere SEMPRE in fondo:
```
Dopo le modifiche fai:
git add .
git commit -m "descrizione"
git checkout master
git merge [nome-branch-corrente]
git push
Senza aprire PR su GitHub.
```

---

## Sviluppo Parallelo

### Regole per evitare conflitti tra binari
1. **Ogni binario lavora SOLO sui propri file/tabelle** — vedi CLAUDE.md
2. **Nessun binario modifica App.jsx in modo strutturale** — solo aggiunte puntuali
3. **Merge su master uno alla volta** — se conflitto, il secondo fa `git pull` prima
4. **Nuove tabelle Supabase: ogni binario crea solo le proprie**
5. **Testare SEMPRE dopo il merge** su uniic-app.vercel.app

### Conflitti di merge (lezione aprile 2026)
Se due binari modificano App.jsx e il merge da conflitto:
1. `git merge --abort` per annullare
2. Aprire una nuova sessione Claude Code
3. Dirgli di leggere le modifiche dal branch e applicarle manualmente su master
4. Claude Code fa il diff, integra, committa e pusha
**NON tentare di risolvere manualmente i conflitti** — usare Claude Code.

### Stato bloccato da conflitto
Se git si blocca con "unmerged files":
```
git reset --hard HEAD
git checkout master
git pull
```
Questo forza il reset allo stato pulito.

---

## Supabase

### Colonne mancanti
Quando l'app da errore tipo `"Could not find the 'X' column"`:
1. Vai su Supabase > SQL Editor
2. `alter table soci add column if not exists X tipo;`
3. Aggiorna il payload di salvataggio in App.jsx

### Hobby e un array (text[])
La colonna `hobby` e `text[]` in Supabase:
- **In salvataggio:** `hobby: formData.hobby ? [formData.hobby] : []`
- **In lettura:** `hobby: Array.isArray(data.hobby) ? data.hobby.join(", ") : data.hobby`

### Pre-caricamento form
Quando un form salva ma cancella i dati esistenti, caricare i dati dal DB all'apertura della sezione.

### RLS (Row Level Security)
Policy RLS attive sia per `anon` che per `authenticated` sulle tabelle usate.

### SQL con apostrofi (lezione aprile 2026)
Negli INSERT SQL, gli apostrofi nel testo italiano causano errori. Soluzioni:
- Raddoppiare l'apostrofo: `l''interscambio` invece di `l'interscambio`
- Oppure evitare apostrofi nel testo
- Fare INSERT uno alla volta invece di blocchi multi-riga (piu facile debuggare)

### Colonne NOT NULL (lezione aprile 2026)
Se una tabella ha colonne NOT NULL e il tuo INSERT non le riempie, ottieni errore. Prima di importare dati:
- Verificare la struttura della tabella con `\d nometabella` o dalla UI di Supabase
- Usare `alter table X alter column Y drop not null` se necessario

### Import massivo soci (lezione aprile 2026)
- I dati AssoFacile hanno due tipi: INDIVIDUO (persone) e AZIENDA (societa)
- Le AZIENDA non hanno nome/cognome, solo ragione_sociale
- Usare Supabase Admin API (service_role key) per creare utenti Auth in bulk
- Lo script di import gira in LOCALE, non committato nel repo
- Il file .env con la service_role key non va mai nel repo
- Su Windows: attenzione che Notepad non salvi come `.env.txt`

---

## React / App.jsx

### Admin check
L'admin e identificato SOLO per email `jj@suncapital.it`, NON per il campo `tipo` nel database.
```js
const isAdmin = session?.user?.email === 'jj@suncapital.it'
```

### Visibilita campi soci
Tutti i campi visibili a tutti. Non reintrodurre restrizioni senza istruzioni esplicite.

### Card soci — tipo_socio (da fixare)
Le card devono mostrare:
- Se `tipo_socio === 'azienda'`: mostrare `ragione_sociale` come titolo
- Se individuo: mostrare `nome + " " + cognome`
- La ricerca deve funzionare anche su `ragione_sociale`

### Pulsanti contatto socio
WhatsApp e WeChat appaiono SOLO se il campo non e null e non e stringa vuota.

---

## UX / Funzionalita

### Comunicazione iscritti
Il pulsante "Invia comunicazione" in EvIscritti e una simulazione. Manca Resend SMTP.

### Push notifications
VAPID keys configurate, Edge Function deployata, tabella `push_subscriptions` presente. Delivery end-to-end da verificare.

### Iscrizione eventi
Toggle: "Iscriviti" / "Iscritto" con annullamento su conferma.

### Registrazione nuovo utente (completata aprile 2026)
Form pre-login > inserisce in `richieste_iscrizione` > admin approva/rifiuta > creazione account Auth automatica.

### Weekly digest news (completata aprile 2026)
Tab in NewsletterSection, toggle lingua IT/CN, filtro categoria, vista dettaglio articolo. Edge Function skeleton da collegare a NewsAPI + Anthropic.

### Convenzioni (completata aprile 2026)
10 partner reali, card per categoria, dettaglio con contatti, form proposta nuova convenzione per i soci.
