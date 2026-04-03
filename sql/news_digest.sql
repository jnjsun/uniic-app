-- ═══════════════════════════════════════════════════════════════════════════════
-- BINARIO C: Tabella news_digest + dati di esempio
-- Eseguire in Supabase SQL Editor (project: atltrjhnkklnkgwscsuy)
-- ═══════════════════════════════════════════════════════════════════════════════

create table news_digest (
  id uuid default gen_random_uuid() primary key,
  titolo_it text not null,
  titolo_cn text not null,
  riassunto_it text not null,
  riassunto_cn text not null,
  fonte text not null,
  url_originale text,
  categoria text check (categoria in ('business', 'innovazione', 'politica', 'geopolitica', 'cultura')),
  settimana_rif date not null,
  importanza int default 3 check (importanza between 1 and 5),
  immagine_url text,
  pubblicato boolean default true,
  created_at timestamptz default now()
);

-- RLS
alter table news_digest enable row level security;

create policy "Tutti possono leggere" on news_digest
  for select to anon, authenticated using (pubblicato = true);

create policy "Admin può tutto" on news_digest
  for all to authenticated using (true);

-- Index per performance
create index idx_news_digest_settimana on news_digest(settimana_rif desc);
create index idx_news_digest_categoria on news_digest(categoria);

-- ═══════════════════════════════════════════════════════════════════════════════
-- DATI DI ESEMPIO
-- ═══════════════════════════════════════════════════════════════════════════════

insert into news_digest (titolo_it, titolo_cn, riassunto_it, riassunto_cn, fonte, url_originale, categoria, settimana_rif, importanza) values
('Crescono gli scambi commerciali Italia-Cina nel primo trimestre 2026', '2026年第一季度意中贸易额增长', 'Secondo i dati ISTAT, l''interscambio commerciale tra Italia e Cina ha registrato una crescita del 12% nel primo trimestre 2026, trainato dalle esportazioni nel settore moda e agroalimentare.', '根据意大利国家统计局数据，2026年第一季度意中贸易额增长12%，主要受时尚和农产品出口带动。', 'Il Sole 24 Ore', 'https://ilsole24ore.com/example1', 'business', '2026-03-30', 5),
('Nuova linea ferroviaria merci Milano-Chengdu operativa da aprile', '米兰至成都新货运铁路线四月投入运营', 'La nuova rotta ferroviaria per il trasporto merci collegherà Milano a Chengdu in 18 giorni, offrendo un''alternativa più veloce al trasporto marittimo per le PMI italiane.', '新货运铁路线将在18天内连接米兰和成都，为意大利中小企业提供比海运更快的替代方案。', 'Reuters', 'https://reuters.com/example2', 'business', '2026-03-30', 4),
('Startup italo-cinesi: boom di investimenti nel settore green tech', '意中绿色科技初创企业投资激增', 'Un report di PwC evidenzia un aumento del 45% degli investimenti congiunti italo-cinesi nelle tecnologie verdi, con focus su energia solare e veicoli elettrici.', '普华永道报告显示，意中在绿色技术领域的联合投资增长45%，重点关注太阳能和电动汽车。', 'Financial Times', 'https://ft.com/example3', 'innovazione', '2026-03-30', 4),
('Il Politecnico di Milano apre un campus congiunto con la Tsinghua University', '米兰理工大学与清华大学合建联合校区', 'L''accordo prevede un campus congiunto a Shenzhen dedicato a design industriale e intelligenza artificiale, con i primi studenti attesi per settembre 2027.', '该协议将在深圳建立联合校区，专注于工业设计和人工智能，首批学生预计2027年9月入学。', 'Corriere della Sera', 'https://corriere.it/example4', 'innovazione', '2026-03-30', 3),
('UE e Cina riprendono i negoziati sulle tariffe dei veicoli elettrici', '欧盟与中国重启电动汽车关税谈判', 'Dopo mesi di stallo, Bruxelles e Pechino hanno riaperto il dialogo sulle tariffe anti-dumping per i veicoli elettrici cinesi importati in Europa. L''Italia spinge per una soluzione di compromesso.', '经过数月僵局，布鲁塞尔和北京重启了关于中国进口电动汽车反倾销关税的对话。意大利推动达成妥协方案。', 'South China Morning Post', 'https://scmp.com/example5', 'geopolitica', '2026-03-30', 5),
('Settimana della cucina italiana in Cina: record di partecipazione a Shanghai', '意大利美食周在上海创参与人数新高', 'La nona edizione della Settimana della Cucina Italiana nel Mondo ha visto a Shanghai oltre 50 eventi con la partecipazione di 30 ristoranti e 15 produttori italiani.', '第九届世界意大利美食周在上海举办了50多场活动，30家餐厅和15家意大利生产商参与。', 'ANSA', 'https://ansa.it/example6', 'cultura', '2026-03-30', 3),
('Roma e Pechino firmano accordo su protezione reciproca dei marchi DOP', '罗马与北京签署DOP品牌互保协议', 'L''intesa protegge 100 denominazioni italiane sul mercato cinese e 50 indicazioni geografiche cinesi in Europa, rafforzando la tutela del Made in Italy.', '该协议在中国市场保护100个意大利原产地名称，在欧洲保护50个中国地理标志，加强了意大利制造的保护。', 'Milano Finanza', 'https://milanofinanza.it/example7', 'politica', '2026-03-30', 4);
