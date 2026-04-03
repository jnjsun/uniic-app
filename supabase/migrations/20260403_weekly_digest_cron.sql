-- Abilita pg_cron (se non già attivo)
-- Da eseguire nel SQL Editor di Supabase con ruolo postgres

-- Abilita l'estensione pg_cron
create extension if not exists pg_cron;

-- Schedula la Edge Function ogni lunedì alle 7:00 UTC
-- La funzione viene chiamata via HTTP POST all'endpoint della Edge Function
select cron.schedule(
  'weekly-news-digest',              -- nome del job
  '0 7 * * 1',                       -- ogni lunedì alle 7:00 UTC
  $$
  select
    net.http_post(
      url := 'https://atltrjhnkklnkgwscsuy.supabase.co/functions/v1/weekly-news-digest',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
      ),
      body := '{}'::jsonb
    ) as request_id;
  $$
);

-- Per verificare i job schedulati:
-- select * from cron.job;

-- Per rimuovere il job:
-- select cron.unschedule('weekly-news-digest');
