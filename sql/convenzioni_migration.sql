-- ═══════════════════════════════════════════════════════════════════════════════
-- BINARIO D — Convenzioni: Schema enrichment + Real partner data
-- Eseguire su Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════════

-- 1. Aggiungere colonne mancanti alla tabella convenzioni
alter table convenzioni add column if not exists categoria text;
alter table convenzioni add column if not exists partner text;
alter table convenzioni add column if not exists descrizione_partner text;
alter table convenzioni add column if not exists beneficio text;
alter table convenzioni add column if not exists sconto text;
alter table convenzioni add column if not exists codice_convenzione text;
alter table convenzioni add column if not exists contatto_nome text;
alter table convenzioni add column if not exists contatto_email text;
alter table convenzioni add column if not exists contatto_telefono text;
alter table convenzioni add column if not exists indirizzo text;
alter table convenzioni add column if not exists citta text;
alter table convenzioni add column if not exists sito_web text;
alter table convenzioni add column if not exists logo_url text;
alter table convenzioni add column if not exists data_inizio date;
alter table convenzioni add column if not exists data_fine date;
alter table convenzioni add column if not exists attiva boolean default true;
alter table convenzioni add column if not exists note_interne text;
alter table convenzioni add column if not exists created_at timestamptz default now();

-- 2. Tabella per proposte convenzioni dai soci
create table if not exists proposte_convenzioni (
  id bigint generated always as identity primary key,
  nome_azienda text not null,
  tipo_servizio text,
  contatto text,
  note text,
  proposto_da uuid references auth.users(id),
  proposto_email text,
  stato text default 'in_attesa',  -- in_attesa, approvata, rifiutata
  created_at timestamptz default now()
);

-- RLS per proposte_convenzioni
alter table proposte_convenzioni enable row level security;

create policy "Soci possono inserire proposte"
  on proposte_convenzioni for insert
  to authenticated
  with check (true);

create policy "Soci vedono le proprie proposte"
  on proposte_convenzioni for select
  to authenticated
  using (true);

-- 3. Svuotare i dati demo esistenti (se presenti)
-- ATTENZIONE: eseguire solo se non ci sono dati reali
-- delete from convenzioni;

-- 4. Inserire i partner reali
insert into convenzioni (partner, categoria, descrizione_partner, beneficio, attiva, created_at)
values
  ('Istituto Auxologico', 'salute',
   'Rete ospedaliera di eccellenza in Lombardia, specializzata in ricerca clinica e riabilitazione',
   'In definizione', true, now()),

  ('CDI - Centro Diagnostico Italiano', 'salute',
   'Centro polispecialistico milanese per diagnostica e visite specialistiche',
   'In definizione', true, now()),

  ('Vittoria Assicurazioni', 'assicurazioni',
   'Compagnia assicurativa italiana, convenzione sede di Corso Vercelli Milano',
   'In definizione', true, now()),

  ('Allianz Assicurazioni', 'assicurazioni',
   'Compagnia leader mondiale in assicurazioni e servizi finanziari',
   'In definizione', true, now()),

  ('Banca Sella', 'finanza',
   'Banca privata tra le più innovative d''Italia, servizi per imprenditori',
   'In definizione', true, now()),

  ('Confcommercio Milano', 'altro',
   'Associazione di categoria per commercio e servizi, Milano Lodi Monza Brianza',
   'In definizione', true, now()),

  ('SumUp', 'finanza',
   'Fintech leader per pagamenti POS mobile e servizi per PMI',
   'In definizione', true, now()),

  ('Rapisardi Intellectual Properties', 'legale',
   'Studio specializzato in proprietà intellettuale (ref. Alessandro Cheung)',
   'In definizione', true, now()),

  ('Revolut Business', 'finanza',
   'Piattaforma fintech per conti business, pagamenti internazionali e cambio valuta',
   'In definizione', true, now()),

  ('Fineco', 'finanza',
   'Banca e piattaforma di trading/investimenti online',
   'In definizione', true, now());
