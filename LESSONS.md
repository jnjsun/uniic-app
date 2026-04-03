# LESSONS LEARNED — UNIIC APP

Lezioni apprese nelle sessioni di sviluppo per evitare di ripetere gli stessi errori.

---

## Git & Deployment

### ✅ Workflow corretto
```bash
git checkout master
git merge claude/[nome-branch]
git push
```
Vercel rideploya automaticamente entro 30 secondi.

### ❌ Errori comuni
- **Non rispondere "sì" alla domanda "Apro PR su GitHub?"** di Claude Code — rispondere sempre NO
- **Non fare `git pull` aspettandosi modifiche** se Claude Code non ha pushato su GitHub ma solo in locale
- **L'editor vim si apre durante merge non-fast-forward** — uscire con `:wq` + Invio, oppure Shift+Z+Z
- Quando Claude Code non ha `gh` CLI installato, il merge va fatto manualmente in VS Code

### 💡 Regola finale per ogni brief a Claude Code
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

## Sviluppo Parallelo (aprile 2026)

### ⚠️ Regole per evitare conflitti tra binari
Lo sviluppo procede su 4 binari paralleli (A: dati reali, B: registrazione utente, C: news digest, D: convenzioni). Regole:

1. **Ogni binario lavora SOLO sui propri file/tabelle** — vedi CLAUDE.md sezione "Sviluppo parallelo"
2. **Nessun binario modifica App.jsx in modo strutturale** — solo aggiunte puntuali e non sovrapposte
3. **Merge su master uno alla volta** — se c'è conflitto, il secondo binario fa `git pull` prima di mergiare
4. **Nuove tabelle Supabase: ogni binario crea solo le proprie** — non modificare tabelle di altri binari
5. **Testare SEMPRE dopo il merge** che l'app carichi correttamente su uniic-app.vercel.app

---

## Supabase

### Colonne mancanti
Quando l'app dà errore tipo `"Could not find the 'X' column"`:
1. Vai su Supabase → SQL Editor
2. `alter table soci add column if not exists X tipo;`
3. Aggiorna il payload di salvataggio in App.jsx

### Hobby è un array (text[])
La colonna `hobby` è `text[]` in Supabase. Nell'app va gestita così:
- **In salvataggio:** `hobby: formData.hobby ? [formData.hobby] : []`
- **In lettura:** `hobby: Array.isArray(data.hobby) ? data.hobby.join(", ") : data.hobby`
Se non gestita correttamente dà errore `"malformed array literal"`.

### Pre-caricamento form
Quando un form salva ma cancella i dati esistenti, il problema è che i campi non vengono pre-popolati all'apertura. Soluzione: caricare i dati del socio da Supabase all'apertura della sezione e inizializzare lo stato del form con quei valori.

### RLS (Row Level Security)
Assicurarsi che le policy RLS siano attive sia per il ruolo `anon` che per `authenticated` sulle tabelle usate dall'app.

### Import massivo soci
- I dati AssoFacile hanno due tipi: INDIVIDUO (persone) e AZIENDA (società)
- Per le AZIENDA: mappare ragione_sociale → campo `azienda` nella tabella soci, usare email del referente
- Usare Supabase Admin API (service_role key) per creare utenti Auth in bulk
- Password temporanea da comunicare ai soci per il primo accesso

---

## React / App.jsx

### Admin check
L'admin è identificato SOLO per email `jj@suncapital.it`, NON per il campo `tipo` nel database.
```js
const isAdmin = session?.user?.email === 'jj@suncapital.it'
```

### Visibilità campi soci
Al momento TUTTI i campi sono visibili a tutti i soci — la funzione `see()` è stata rimossa e sostituita con `see = () => true`. Non reintrodurre restrizioni senza istruzioni esplicite.

### Pulsanti contatto socio
I pulsanti WhatsApp e WeChat appaiono SOLO se il campo non è null e non è stringa vuota:
```js
{socio.whatsapp && <button onClick={() => window.open(`https://wa.me/${socio.whatsapp}`)}>WhatsApp</button>}
{socio.wechat && <button onClick={() => window.open(`weixin://dl/chat?${socio.wechat}`)}>WeChat</button>}
```
Email → `mailto:` / Telefono → `tel:`

---

## UX / Funzionalità

### Comunicazione iscritti
Il pulsante "Invia comunicazione" in EvIscritti è attualmente una simulazione — i messaggi non arrivano realmente. Manca la configurazione di un provider email (Resend) su Supabase. Da implementare nella prossima fase.

### Push notifications
VAPID keys configurate, Edge Function `send-push-notification` deployata su Supabase, tabella `push_subscriptions` presente. Ma la delivery end-to-end su dispositivi reali non è stata verificata. Da testare.

### Iscrizione eventi
- Bottone visibile a tutti incluso admin
- Toggle: "Iscriviti" → "Iscritto ✓" (cliccabile per annullare con conferma)
- Annullamento rimuove l'iscrizione da Supabase

---

## Prossimi step prioritari

1. **Binario A** — Import massivo soci da Excel + caricamento eventi reali
2. **Binario B** — Flusso registrazione nuovo utente con approvazione direttivo
3. **Binario C** — Weekly digest news Italia-Cina bilingue automatico
4. **Binario D** — Convenzioni: arricchimento schema + caricamento dati reali
5. **Resend email** — configurare provider SMTP su Supabase per comunicazioni reali
6. **Push notifications** — test delivery su telefono reale
