import { useState, useMemo, useEffect, useRef } from "react";
import { supabase, subscribeToPush } from './supabase.js'

// ─── TEMA ─────────────────────────────────────────────────────────────────────
const C = {
  bg:"#0F0D0D", surface:"#1A1614", alt:"#231E1B",
  red:"#C8102E", redDim:"rgba(200,16,46,.12)",
  gold:"#C9A84C", goldDim:"rgba(201,168,76,.12)", goldLight:"#E4C06A",
  green:"#27AE60", greenDim:"rgba(39,174,96,.12)",
  blue:"#2471A3", blueDim:"rgba(36,113,163,.12)",
  orange:"#D35400", orangeDim:"rgba(211,84,0,.12)",
  purple:"#7D3C98", teal:"#0E8A7B", tealDim:"rgba(14,138,123,.12)",
  spotify:"#1DB954", youtube:"#FF0000",
  text:"#F5EFE6", muted:"#9A8F84", faint:"#5A524D",
  border:"#2E2822",
};
const F = "'Montserrat',sans-serif";
const S = "'Cormorant Garamond',serif";

// ─── ATOMS ────────────────────────────────────────────────────────────────────
const Tag = ({ label, color=C.gold, sm }) => (
  <span style={{ background:`${color}1A`, color, border:`1px solid ${color}33`, borderRadius:4,
    padding:sm?"1px 6px":"3px 9px", fontSize:sm?9:10, fontWeight:600, letterSpacing:.4,
    textTransform:"uppercase", whiteSpace:"nowrap", fontFamily:F }}>
    {label}
  </span>
);
const Box = ({ children, sx={}, onClick }) => (
  <div onClick={onClick} style={{ background:C.surface, border:`1px solid ${C.border}`,
    borderRadius:12, padding:"14px 16px", cursor:onClick?"pointer":"default", ...sx }}>
    {children}
  </div>
);
const Btn = ({ children, onClick, v="primary", sx={} }) => {
  const vs = {
    primary:  { background:C.red,    color:"#fff",     border:"none" },
    secondary:{ background:C.alt,    color:C.text,     border:`1px solid ${C.border}` },
    ghost:    { background:"none",   color:C.muted,    border:`1px solid ${C.border}` },
    gold:     { background:C.goldDim,color:C.gold,     border:`1px solid ${C.gold}44` },
    green:    { background:C.greenDim,color:C.green,   border:`1px solid ${C.green}44` },
    danger:   { background:C.redDim, color:C.red,      border:`1px solid ${C.red}44` },
    blue:     { background:C.blueDim,color:C.blue,     border:`1px solid ${C.blue}44` },
    teal:     { background:C.tealDim,color:C.teal,     border:`1px solid ${C.teal}44` },
    spotify:  { background:"rgba(29,185,84,.15)",color:C.spotify,border:`1px solid ${C.spotify}44` },
    youtube:  { background:"rgba(255,0,0,.12)",  color:C.youtube, border:`1px solid ${C.youtube}44` },
  };
  return (
    <button onClick={onClick} style={{ ...(vs[v]||vs.primary), borderRadius:10, padding:"10px 16px",
      fontFamily:F, fontSize:12, fontWeight:600, cursor:"pointer", ...sx }}>
      {children}
    </button>
  );
};
const Avatar = ({ initials, size=44, color=C.red }) => (
  <div style={{ width:size, height:size, borderRadius:"50%", flexShrink:0,
    background:`linear-gradient(135deg,${color}CC,${color}66)`,
    display:"flex", alignItems:"center", justifyContent:"center",
    fontSize:size*.33, fontWeight:700, color:"#fff", fontFamily:S,
    border:`2px solid ${color}44` }}>
    {initials}
  </div>
);
const Bar = ({ val, max, color=C.green, h=5 }) => (
  <div style={{ background:C.border, borderRadius:4, height:h, overflow:"hidden" }}>
    <div style={{ width:`${Math.min(100,val/max*100)}%`, height:"100%", background:color, borderRadius:4 }} />
  </div>
);
const BackBtn = ({ onClick, label="← Indietro" }) => (
  <button onClick={onClick} style={{ background:"none", border:"none", color:C.gold,
    fontSize:13, cursor:"pointer", padding:"0 0 16px", fontFamily:F, display:"block" }}>
    {label}
  </button>
);
const Pill = ({ children, active, color=C.red, onClick }) => (
  <button onClick={onClick} style={{ background:active?`${color}22`:C.alt,
    border:`1px solid ${active?color:C.border}`, color:active?color:C.muted,
    borderRadius:20, padding:"6px 12px", fontSize:11, whiteSpace:"nowrap",
    fontFamily:F, cursor:"pointer" }}>
    {children}
  </button>
);
const SecTitle = ({ title, sub }) => (
  <div style={{ marginBottom:18 }}>
    <h2 style={{ fontFamily:S, fontSize:26, fontWeight:700, color:C.text, margin:0, lineHeight:1.1 }}>{title}</h2>
    {sub && <p style={{ color:C.muted, fontSize:12, margin:"5px 0 0", fontFamily:F }}>{sub}</p>}
  </div>
);
const Toggle = ({ on, onChange }) => (
  <div onClick={onChange} style={{ width:42, height:24, borderRadius:12, cursor:"pointer",
    position:"relative", background:on?C.green:C.border, transition:"background .2s" }}>
    <div style={{ width:18, height:18, borderRadius:"50%", background:"#fff",
      position:"absolute", top:3, left:on?21:3, transition:"left .2s",
      boxShadow:"0 1px 4px rgba(0,0,0,.3)" }} />
  </div>
);
const Stars = ({ val, onChange, size=18 }) => (
  <div style={{ display:"flex", gap:3 }}>
    {[1,2,3,4,5].map(s => (
      <span key={s} onClick={() => onChange?.(s)}
        style={{ fontSize:size, color:s<=val?C.gold:C.border, cursor:onChange?"pointer":"default" }}>★</span>
    ))}
  </div>
);
const FieldRow = ({ icon, label, value, locked }) => (
  <div style={{ display:"flex", alignItems:"flex-start", gap:10, padding:"10px 0", borderBottom:`1px solid ${C.border}` }}>
    <span style={{ fontSize:14, flexShrink:0, marginTop:1 }}>{icon}</span>
    <div style={{ flex:1, minWidth:0 }}>
      <div style={{ fontSize:10, color:C.faint, fontFamily:F, marginBottom:2, letterSpacing:.5 }}>{label}</div>
      {locked
        ? <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <div style={{ width:80, height:10, background:C.border, borderRadius:3 }} />
            <span style={{ fontSize:9, color:C.faint, fontFamily:F }}>🔒 accesso limitato</span>
          </div>
        : <div style={{ fontSize:13, color:C.text, fontFamily:F, lineHeight:1.4 }}>{value||"—"}</div>
      }
    </div>
  </div>
);
const AccessoBadge = ({ accesso }) => {
  const m = { tutti:[C.green,"Tutti"], sostenitore:[C.gold,"Sostenitore+"], direttivo:[C.red,"Solo Direttivo"] };
  const [c,l] = m[accesso]||m.tutti;
  return <Tag label={l} color={c} sm />;
};

// ═══════════════════════════════════════════════════════════════════════════════
// DATI
// ═══════════════════════════════════════════════════════════════════════════════

// ─── SOCI ─────────────────────────────────────────────────────────────────────
const VIS = {
  nome:["ordinario","sostenitore","direttivo"], citta:["ordinario","sostenitore","direttivo"],
  ruolo_uniic:["ordinario","sostenitore","direttivo"], anno_iscritto:["ordinario","sostenitore","direttivo"],
  hobby:["ordinario","sostenitore","direttivo"], linkedin:["ordinario","sostenitore","direttivo"],
  impresa_nome:["ordinario","sostenitore","direttivo"], impresa_sito:["ordinario","sostenitore","direttivo"],
  email:["sostenitore","direttivo"], nazionalita:["sostenitore","direttivo"],
  eta:["sostenitore","direttivo"], impresa_settore:["sostenitore","direttivo"],
  telefono:["direttivo"], piva:["direttivo"], famiglia:["direttivo"], storico:["direttivo"],
};
const see = (field, role) => VIS[field]?.includes(role)??false;

// ─── EVENTI ───────────────────────────────────────────────────────────────────
const EV_TIPI = {
  forum:        {label:"Forum",         color:C.red,    icon:"🏛️"},
  gala:         {label:"Gala",          color:C.gold,   icon:"✨"},
  workshop:     {label:"Workshop",      color:C.blue,   icon:"🎓"},
  istituzionale:{label:"Istituzionale", color:C.orange, icon:"🏮"},
  networking:   {label:"Networking",    color:C.green,  icon:"🤝"},
};

// ─── CONVENZIONI ──────────────────────────────────────────────────────────────
const CONV_CATEGORIE = ["Tutte","Banca","Assicurazione","Legale","Tech","Hospitality","Salute","F&B","Formazione"];
const CONV_CITTA = ["Tutte","Milano","Roma","Firenze","Prato","Napoli"];

// ─── NEWSLETTER ───────────────────────────────────────────────────────────────
const NL_CAT = {
  uniic:      {label:"UNIIC",          color:C.red,    icon:"🐉"},
  economia:   {label:"Economia",        color:C.gold,   icon:"📈"},
  geopolitica:{label:"Geopolitica",    color:C.blue,   icon:"🌐"},
  finanza:    {label:"Finanza",         color:C.green,  icon:"💱"},
  cultura:    {label:"Cultura",         color:C.orange, icon:"🎭"},
  normative:  {label:"Normative",       color:C.purple, icon:"⚖️"},
  flash:      {label:"Flash News",      color:C.teal,   icon:"⚡"},
  comunicato: {label:"Comunicato",      color:C.muted,  icon:"📋"},
  fotoreport: {label:"Foto Report",     color:"#C0392B",icon:"📸"},
};
const NL_TIPI = [
  {id:"articolo",label:"Articolo",icon:"✍️"},
  {id:"flash",label:"Flash News",icon:"⚡"},
  {id:"comunicato",label:"Comunicato",icon:"📋"},
  {id:"fotoreport",label:"Foto Report",icon:"📸"},
  {id:"rassegna",label:"Rassegna Stampa",icon:"📰"},
];
const NL_NOTIFICHE_D = [
  {cat:"uniic",attiva:true},{cat:"economia",attiva:true},{cat:"geopolitica",attiva:false},
  {cat:"finanza",attiva:true},{cat:"cultura",attiva:false},{cat:"normative",attiva:true},
  {cat:"flash",attiva:true},{cat:"comunicato",attiva:true},{cat:"fotoreport",attiva:true},
];

// ─── PODCAST ──────────────────────────────────────────────────────────────────
const POD_FORMATI = {
  intervista:   {label:"Intervista",     icon:"🎤",color:C.red},
  tavolarotonda:{label:"Tavola rotonda", icon:"🔵",color:C.blue},
  report:       {label:"Report UNIIC",   icon:"📊",color:C.gold},
  spotlight:    {label:"Spotlight",      icon:"💡",color:C.purple},
  speciale:     {label:"Speciale",       icon:"⭐",color:C.teal},
};
const POD_TEMI = ["Import/Export","Moda","Logistica","Finanza","Geopolitica","Digitale","Normative","Cultura","Startup","Made in Italy"];

// ═══════════════════════════════════════════════════════════════════════════════
// SEZIONE: HOME
// ═══════════════════════════════════════════════════════════════════════════════
function HomeSection({ onNav, role, socioProfilo }) {
  return (
    <div>
      <div style={{ background:`linear-gradient(135deg,${C.red}22,transparent)`,border:`1px solid ${C.red}33`,borderRadius:16,padding:20,marginBottom:18 }}>
        <div style={{ fontSize:10,color:C.gold,fontFamily:F,fontWeight:600,letterSpacing:2,marginBottom:6 }}>BENVENUTO</div>
        <h2 style={{ fontFamily:S,fontSize:26,color:C.text,margin:"0 0 4px",lineHeight:1.2 }}>{socioProfilo?.nome || "Benvenuto"}</h2>
        <p style={{ color:C.muted,fontFamily:F,fontSize:12,margin:0 }}>Socio UNIIC · Direttivo · dal 2021</p>
        <div style={{ display:"flex",gap:20,marginTop:14 }}>
          {[["156","Soci"],["5","Eventi"],["6","News"]].map(([n,l]) => (
            <div key={l} style={{ textAlign:"center" }}>
              <div style={{ fontFamily:S,fontSize:22,color:C.gold,fontWeight:700 }}>{n}</div>
              <div style={{ fontSize:10,color:C.muted,fontFamily:F }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
      <Box sx={{ marginBottom:12,borderLeft:`3px solid ${C.red}`,cursor:"pointer" }} onClick={() => onNav("eventi")}>
        <div style={{ fontSize:10,color:C.muted,fontFamily:F,marginBottom:6 }}>PROSSIMO EVENTO</div>
        <div style={{ fontFamily:S,fontSize:18,color:C.text,marginBottom:4 }}>UNIIC Forum 2026</div>
        <div style={{ fontSize:12,color:C.muted,fontFamily:F }}>📅 15 Aprile 2026 · Palazzo Reale, Milano</div>
        <div style={{ fontSize:12,color:C.green,fontFamily:F,marginTop:4 }}>✓ Sei iscritto · Gratuito</div>
      </Box>
      <Box sx={{ cursor:"pointer" }} onClick={() => onNav("newsletter")}>
        <div style={{ fontSize:10,color:C.muted,fontFamily:F,marginBottom:6 }}>ULTIMA NEWS</div>
        <div style={{ fontSize:28,marginBottom:6 }}>🏛️</div>
        <div style={{ fontFamily:S,fontSize:17,color:C.text,marginBottom:4 }}>UNIIC al Forum italo-cinese di Roma</div>
        <div style={{ fontSize:11,color:C.faint,fontFamily:F }}>25 Mar 2026 · 4 min di lettura</div>
      </Box>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SEZIONE: SOCI
// ═══════════════════════════════════════════════════════════════════════════════
function SociChat({ socio, onBack }) {
  const [msgs, setMsgs] = useState(MSGS_D[socio.id]||[]);
  const [draft, setDraft] = useState("");
  const send = () => { if(!draft.trim()) return; setMsgs(m=>[...m,{da:"me",testo:draft.trim(),ora:"adesso"}]); setDraft(""); };
  return (
    <div style={{ display:"flex",flexDirection:"column",height:"100%" }}>
      <div style={{ display:"flex",alignItems:"center",gap:12,paddingBottom:14,borderBottom:`1px solid ${C.border}`,marginBottom:12 }}>
        <button onClick={onBack} style={{ background:"none",border:"none",color:C.gold,fontSize:18,cursor:"pointer",padding:0 }}>←</button>
        <Avatar initials={socio.initials} size={36} color={socio.colorAccent} />
        <div>
          <div style={{ fontFamily:S,fontSize:17,color:C.text,fontWeight:700 }}>{socio.nome}</div>
          <div style={{ fontSize:11,color:C.green,fontFamily:F }}>● Online</div>
        </div>
      </div>
      <div style={{ flex:1,overflowY:"auto",display:"flex",flexDirection:"column",gap:10 }}>
        {msgs.length===0 && <div style={{ textAlign:"center",color:C.faint,fontFamily:F,fontSize:12,marginTop:40 }}>Inizia la conversazione!</div>}
        {msgs.map((m,i) => (
          <div key={i} style={{ display:"flex",justifyContent:m.da==="me"?"flex-end":"flex-start" }}>
            <div style={{ maxWidth:"75%",background:m.da==="me"?C.red:C.alt,borderRadius:m.da==="me"?"14px 14px 4px 14px":"14px 14px 14px 4px",padding:"10px 13px" }}>
              <div style={{ fontSize:13,color:C.text,fontFamily:F,lineHeight:1.5 }}>{m.testo}</div>
              <div style={{ fontSize:10,color:m.da==="me"?"#ffffff88":C.faint,marginTop:4,textAlign:"right" }}>{m.ora}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display:"flex",gap:8,paddingTop:12,borderTop:`1px solid ${C.border}`,marginTop:12 }}>
        <input value={draft} onChange={e=>setDraft(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Scrivi un messaggio..."
          style={{ flex:1,background:C.alt,border:`1px solid ${C.border}`,borderRadius:20,padding:"10px 16px",color:C.text,fontSize:13,fontFamily:F,outline:"none" }} />
        <button onClick={send} style={{ width:42,height:42,borderRadius:"50%",background:draft.trim()?C.red:C.alt,border:"none",color:"#fff",fontSize:16,cursor:"pointer" }}>→</button>
      </div>
    </div>
  );
}
function SociProfilo({ socio, role, onBack, onChat }) {
  const [sub, setSub] = useState("info");
  const tcMap = { direttivo:C.red,sostenitore:C.gold,ordinario:C.blue };
  const subTabs = ["info","impresa","famiglia",...(see("storico",role)?["storico"]:[])];
  return (
    <div>
      <BackBtn onClick={onBack} label="← Elenco soci" />
      <div style={{ background:`linear-gradient(135deg,${socio.colorAccent}22,${C.alt})`,border:`1px solid ${socio.colorAccent}33`,borderRadius:16,padding:20,marginBottom:16 }}>
        <div style={{ display:"flex",gap:14,alignItems:"flex-start" }}>
          <Avatar initials={socio.initials} size={64} color={socio.colorAccent} />
          <div style={{ flex:1 }}>
            <h2 style={{ fontFamily:S,fontSize:24,color:C.text,margin:"0 0 6px",lineHeight:1.1 }}>{socio.nome}</h2>
            <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
              <Tag label={socio.ruolo_uniic} color={tcMap[socio.tipo]||C.blue} />
              {see("eta",role)&&<Tag label={`${socio.eta} anni`} color={C.muted} />}
            </div>
            <div style={{ fontSize:12,color:C.muted,fontFamily:F,marginTop:8 }}>📍 {socio.citta} · Socio dal {socio.anno_iscritto}</div>
          </div>
        </div>
        <div style={{ display:"flex",gap:8,marginTop:14 }}>
          <Btn onClick={() => onChat(socio)} sx={{ flex:1 }}>💬 Messaggio</Btn>
          {see("telefono",role)&&<Btn v="secondary" sx={{ flex:1 }}>📞 Chiama</Btn>}
        </div>
      </div>
      <div style={{ display:"flex",background:C.alt,borderRadius:10,padding:3,marginBottom:16 }}>
        {subTabs.map(t => (
          <button key={t} onClick={() => setSub(t)} style={{ flex:1,padding:"8px 4px",border:"none",borderRadius:8,
            background:sub===t?C.surface:"transparent",color:sub===t?C.text:C.muted,fontFamily:F,fontSize:11,fontWeight:600,cursor:"pointer" }}>
            {t.charAt(0).toUpperCase()+t.slice(1)}
          </button>
        ))}
      </div>
      {sub==="info"&&<div>
        <FieldRow icon="📧" label="EMAIL" value={socio.email} locked={!see("email",role)} />
        <FieldRow icon="📞" label="TELEFONO" value={socio.telefono} locked={!see("telefono",role)} />
        <FieldRow icon="🌐" label="NAZIONALITÀ" value={socio.nazionalita} locked={!see("nazionalita",role)} />
        <FieldRow icon="🎂" label="ETÀ" value={`${socio.eta} anni`} locked={!see("eta",role)} />
        {see("hobby",role)&&<div style={{ padding:"10px 0" }}>
          <div style={{ fontSize:10,color:C.faint,fontFamily:F,marginBottom:8,letterSpacing:.5 }}>🎨 HOBBY & INTERESSI</div>
          <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>{socio.hobby.map(h=><Tag key={h} label={h} color={socio.colorAccent} />)}</div>
        </div>}
      </div>}
      {sub==="impresa"&&<div>
        <FieldRow icon="🏢" label="RAGIONE SOCIALE" value={socio.impresa_nome} locked={false} />
        <FieldRow icon="🏭" label="SETTORE" value={socio.impresa_settore} locked={!see("impresa_settore",role)} />
        <FieldRow icon="🧾" label="PARTITA IVA" value={socio.piva} locked={!see("piva",role)} />
      </div>}
      {sub==="famiglia"&&(see("famiglia",role)?<div>
        <FieldRow icon="💍" label="CONIUGE" value={socio.famiglia?.coniuge||(socio.famiglia?.note||"—")} locked={false} />
        <FieldRow icon="👶" label="FIGLI" value={`${socio.famiglia?.figli||0} figli`} locked={false} />
      </div>:<div style={{ textAlign:"center",padding:40 }}>
        <div style={{ fontSize:32,marginBottom:12 }}>🔒</div>
        <div style={{ fontFamily:S,fontSize:18,color:C.text }}>Accesso riservato al Direttivo</div>
      </div>)}
      {sub==="storico"&&see("storico",role)&&<div>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14 }}>
          <span style={{ color:C.muted,fontFamily:F,fontSize:12 }}>Totale versato</span>
          <span style={{ fontFamily:S,fontSize:22,color:C.gold,fontWeight:700 }}>
            € {socio.storico.reduce((s,r)=>s+parseInt(r.quota.replace(/[^0-9]/g,"")),0).toLocaleString()}
          </span>
        </div>
        {[...socio.storico].reverse().map((r,i) => (
          <div key={i} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",borderBottom:`1px solid ${C.border}` }}>
            <div style={{ display:"flex",gap:12,alignItems:"center" }}>
              <div style={{ width:36,height:36,borderRadius:8,background:r.stato==="Pagato"?C.greenDim:C.redDim,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16 }}>{r.stato==="Pagato"?"✓":"⏳"}</div>
              <div>
                <div style={{ fontFamily:S,fontSize:17,color:C.text }}>{r.anno}</div>
                <div style={{ fontSize:11,color:C.muted,fontFamily:F }}>{r.tipo}</div>
              </div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontFamily:S,fontSize:16,color:C.text }}>{r.quota}</div>
              <Tag label={r.stato} color={r.stato==="Pagato"?C.green:C.gold} sm />
            </div>
          </div>
        ))}
      </div>}
    </div>
  );
}
function SociSection({ role, openId, onOpenHandled }) {
  const [search, setSearch] = useState("");
  const [sociDB, setSociDB] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
async function caricaSoci() {
  const { data, error } = await supabase.from('soci').select('*');
  if (error) { console.log('Errore:', error); return; }
  const mappati = data.map(s => ({
    ...s,
    initials: s.avatar_iniziali,
    colorAccent: s.avatar_colore,
  }));
  setSociDB(mappati);
  setLoading(false);
}
    caricaSoci();
  }, []);
  const [filterTipo, setFilterTipo] = useState("tutti");
  const [showFilters, setShowFilters] = useState(false);
  const [selected, setSelected] = useState(null);
  const [chatWith, setChatWith] = useState(null);
  useEffect(() => {
    if (!openId || !sociDB.length) return;
    const s = sociDB.find(x => x.id === openId);
    if (s) { setSelected(s); onOpenHandled?.(); }
  }, [sociDB, openId]);
  const tcMap = { direttivo:C.red,sostenitore:C.gold,ordinario:C.blue };
  const filtered = useMemo(() => sociDB.filter(s => {
    const q=search.toLowerCase();
    return (!q||s.nome.toLowerCase().includes(q)||s.impresa_nome.toLowerCase().includes(q)||s.impresa_settore.toLowerCase().includes(q))
      &&(filterTipo==="tutti"||s.tipo===filterTipo);
}),[sociDB,search,filterTipo]);
  if(loading) return <div style={{textAlign:"center",padding:40,color:C.muted,fontFamily:F}}>Caricamento...</div>;if(chatWith) return <SociChat socio={chatWith} onBack={() => setChatWith(null)} />;
  if(selected) return <SociProfilo socio={selected} role={role} onBack={() => setSelected(null)} onChat={s=>{setSelected(null);setChatWith(s);}} />;
  return (
    <div>
      <SecTitle title="Soci UNIIC" sub={`${filtered.length} di ${sociDB.length} soci`} />
      <div style={{ display:"flex",gap:8,marginBottom:10 }}>
        <div style={{ flex:1,position:"relative" }}>
          <span style={{ position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontSize:14 }}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cerca nome, impresa, settore..."
            style={{ width:"100%",background:C.alt,border:`1px solid ${C.border}`,borderRadius:10,padding:"11px 12px 11px 36px",color:C.text,fontSize:13,fontFamily:F,boxSizing:"border-box",outline:"none" }} />
        </div>
        <button onClick={() => setShowFilters(f=>!f)} style={{ background:showFilters?C.redDim:C.alt,border:`1px solid ${showFilters?C.red:C.border}`,borderRadius:10,padding:"0 14px",color:showFilters?C.red:C.muted,fontFamily:F,fontSize:12,cursor:"pointer" }}>⚙ Filtri</button>
      </div>
      {showFilters&&<Box sx={{ marginBottom:12 }}>
        <div style={{ fontSize:10,color:C.faint,fontFamily:F,marginBottom:8,letterSpacing:.5 }}>TIPO SOCIO</div>
        <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
          {["tutti","ordinario","sostenitore","direttivo"].map(v=>(
            <Pill key={v} active={filterTipo===v} color={C.red} onClick={() => setFilterTipo(v)}>{v.charAt(0).toUpperCase()+v.slice(1)}</Pill>
          ))}
        </div>
      </Box>}
      <div style={{ marginBottom:10,padding:"6px 10px",background:C.goldDim,borderRadius:8,fontSize:11,color:C.gold,fontFamily:F }}>
        🔑 Vista: <strong>{role}</strong> — i campi bloccati 🔒 cambiano in base al ruolo
      </div>
      {filtered.map(s => (
        <Box key={s.id} sx={{ marginBottom:10 }} onClick={() => setSelected(s)}>
          <div style={{ display:"flex",alignItems:"center",gap:12 }}>
            <Avatar initials={s.initials} size={50} color={s.colorAccent} />
            <div style={{ flex:1,minWidth:0 }}>
              <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between" }}>
                <span style={{ fontFamily:S,fontSize:18,color:C.text,fontWeight:700 }}>{s.nome}</span>
                <Tag label={s.ruolo_uniic} color={tcMap[s.tipo]||C.blue} sm />
              </div>
              <div style={{ fontSize:12,color:C.muted,fontFamily:F,marginTop:2 }}>{s.impresa_nome}</div>
              <div style={{ display:"flex",gap:8,marginTop:5,alignItems:"center" }}>
                <span style={{ fontSize:11,color:C.faint,fontFamily:F }}>📍 {s.citta}</span>
                <Tag label={s.impresa_settore} color={s.colorAccent} sm />
              </div>
            </div>
          </div>
          <div style={{ display:"flex",gap:8,marginTop:10 }}>
            <button onClick={e=>{e.stopPropagation();setChatWith(s);}} style={{ flex:1,background:C.redDim,border:`1px solid ${C.red}33`,color:C.red,borderRadius:8,padding:"7px",fontFamily:F,fontSize:11,cursor:"pointer" }}>💬 Messaggio</button>
            <button onClick={e=>{e.stopPropagation();setSelected(s);}} style={{ flex:2,background:C.alt,border:`1px solid ${C.border}`,color:C.muted,borderRadius:8,padding:"7px",fontFamily:F,fontSize:11,cursor:"pointer" }}>Vedi profilo →</button>
          </div>
        </Box>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SEZIONE: EVENTI
// ═══════════════════════════════════════════════════════════════════════════════
function EvPagamento({ evento, onClose, onDone, socioProfilo }) {
  const [step,setStep]=useState(1); const [ospiti,setOspiti]=useState(0); const [metodo,setMetodo]=useState("carta");
  const [saving,setSaving]=useState(false); const [nuovaIscrizioni,setNuovaIscrizioni]=useState(null);
  const totale=evento.prezzo*(1+ospiti);
  async function confermaIscrizione() {
    setSaving(true);
    const nuovoIscritto = { nome: socioProfilo?.nome || 'Socio', data: new Date().toISOString() };
    const lista = [...(evento.iscrizioni || []), nuovoIscritto];
    await supabase.from('eventi').update({ iscrizioni: lista, iscritti: lista.length }).eq('id', evento.id);
    setNuovaIscrizioni(lista);
    setSaving(false);
    setStep(3);
  }
  if(step===3) return (<div style={{ textAlign:"center",padding:"16px 0" }}>
    <div style={{ fontSize:48,marginBottom:12 }}>🎉</div>
    <h3 style={{ fontFamily:S,fontSize:22,color:C.text,margin:"0 0 8px" }}>Iscrizione confermata!</h3>
    <p style={{ color:C.muted,fontSize:13,fontFamily:F,lineHeight:1.6,margin:"0 0 16px" }}>
      Riceverai una email con tutti i dettagli.
      {totale>0&&<span style={{ display:"block",color:C.green,marginTop:8,fontWeight:600 }}>✓ Pagamento di € {totale} ricevuto</span>}
    </p>
    <Btn onClick={()=>{onDone(nuovaIscrizioni);onClose();}} sx={{ width:"100%" }}>Chiudi →</Btn>
  </div>);
  return (<div>
    <div style={{ display:"flex",alignItems:"center",gap:4,marginBottom:20 }}>
      {["Ospiti","Pagamento","Conferma"].map((s,i) => (
        <div key={s} style={{ display:"flex",alignItems:"center",gap:4,flex:i<2?1:"none" }}>
          <div style={{ width:22,height:22,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,fontFamily:F,background:i+1<=step?C.red:C.alt,color:i+1<=step?"#fff":C.faint }}>{i+1}</div>
          <span style={{ fontSize:10,color:i+1===step?C.text:C.faint,fontFamily:F }}>{s}</span>
          {i<2&&<div style={{ flex:1,height:1,background:i+1<step?C.red:C.border }} />}
        </div>
      ))}
    </div>
    {step===1&&<div>
      <Box sx={{ marginBottom:12 }}>
        <div style={{ fontSize:10,color:C.faint,fontFamily:F,marginBottom:10,letterSpacing:.5 }}>ACCOMPAGNATORI ESTERNI</div>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between" }}>
          <span style={{ fontSize:13,color:C.muted,fontFamily:F }}>{ospiti===0?"Nessuno":`${ospiti} accompagnatore${ospiti>1?"i":""}`}</span>
          <div style={{ display:"flex",gap:12,alignItems:"center" }}>
            <button onClick={() => setOspiti(Math.max(0,ospiti-1))} style={{ width:30,height:30,borderRadius:"50%",background:C.alt,border:`1px solid ${C.border}`,color:C.text,fontSize:18,cursor:"pointer" }}>−</button>
            <span style={{ fontFamily:S,fontSize:22,color:C.text,minWidth:16,textAlign:"center" }}>{ospiti}</span>
            <button onClick={() => setOspiti(Math.min(4,ospiti+1))} style={{ width:30,height:30,borderRadius:"50%",background:C.alt,border:`1px solid ${C.border}`,color:C.text,fontSize:18,cursor:"pointer" }}>+</button>
          </div>
        </div>
      </Box>
      {totale>0&&<Box sx={{ marginBottom:14 }}>
        <div style={{ display:"flex",justifyContent:"space-between",marginBottom:6 }}>
          <span style={{ fontSize:13,color:C.muted,fontFamily:F }}>Quota socio</span>
          <span style={{ fontSize:13,color:C.text,fontFamily:F }}>€ {evento.prezzo}</span>
        </div>
        {ospiti>0&&<div style={{ display:"flex",justifyContent:"space-between",marginBottom:6 }}>
          <span style={{ fontSize:13,color:C.muted,fontFamily:F }}>{ospiti} ospite/i</span>
          <span style={{ fontSize:13,color:C.text,fontFamily:F }}>€ {evento.prezzo*ospiti}</span>
        </div>}
        <div style={{ height:1,background:C.border,margin:"8px 0" }} />
        <div style={{ display:"flex",justifyContent:"space-between" }}>
          <span style={{ fontSize:14,fontWeight:600,color:C.text,fontFamily:F }}>Totale</span>
          <span style={{ fontFamily:S,fontSize:22,color:C.gold,fontWeight:700 }}>€ {totale}</span>
        </div>
      </Box>}
      <Btn onClick={() => evento.prezzo===0?confermaIscrizione():setStep(2)} disabled={saving} sx={{ width:"100%" }}>{saving?"Salvataggio…":evento.prezzo===0?"Conferma gratuita →":"Continua al pagamento →"}</Btn>
    </div>}
    {step===2&&<div>
      <h4 style={{ fontFamily:S,fontSize:18,color:C.text,marginTop:0 }}>Pagamento · <span style={{ color:C.gold }}>€ {totale}</span></h4>
      <div style={{ display:"flex",gap:8,marginBottom:14 }}>
        {[["carta","💳 Carta"],["bonifico","🏦 Bonifico"]].map(([v,l]) => (
          <button key={v} onClick={() => setMetodo(v)} style={{ flex:1,padding:"10px",border:`1.5px solid ${metodo===v?C.red:C.border}`,borderRadius:10,background:metodo===v?C.redDim:C.alt,color:metodo===v?C.red:C.muted,fontFamily:F,fontSize:12,fontWeight:600,cursor:"pointer" }}>{l}</button>
        ))}
      </div>
      {metodo==="carta"?<div style={{ display:"flex",flexDirection:"column",gap:10,marginBottom:14 }}>
        {[["Numero carta","•••• •••• •••• 4242"],["Intestatario","CHEN WEI"],["Scadenza","12/28"],["CVV","•••"]].map(([l,ph]) => (
          <div key={l}>
            <div style={{ fontSize:10,color:C.faint,letterSpacing:.5,fontFamily:F,marginBottom:4 }}>{l}</div>
            <input readOnly defaultValue={ph} style={{ width:"100%",background:C.alt,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 12px",color:C.muted,fontSize:13,fontFamily:F,boxSizing:"border-box",outline:"none" }} />
          </div>
        ))}
      </div>:<Box sx={{ marginBottom:14 }}>
        {[["Intestatario","UNIIC ETS"],["IBAN","IT46P0623001623000043346175"],["Causale",`Evento: ${evento.titolo}`],["Importo",`€ ${totale}`]].map(([l,v]) => (
          <div key={l} style={{ fontSize:13,color:C.muted,fontFamily:F,marginBottom:6,lineHeight:1.5 }}><strong style={{ color:C.text }}>{l}:</strong> {v}</div>
        ))}
        <div style={{ fontSize:11,color:C.gold,marginTop:8,fontFamily:F }}>⚠️ Conferma alla ricezione (1–3 gg)</div>
      </Box>}
      <div style={{ display:"flex",gap:8 }}>
        <Btn v="ghost" onClick={() => setStep(1)} sx={{ flexShrink:0 }}>←</Btn>
        <Btn onClick={() => confermaIscrizione()} disabled={saving} sx={{ flex:1 }}>{saving?"Salvataggio…":metodo==="carta"?`Paga € ${totale} →`:"Confermo il bonifico →"}</Btn>
      </div>
    </div>}
  </div>);
}
function EvIscritti({ evento, onBack, isAdmin }) {
  const [lista,setLista]=useState(evento.iscrizioni); const [waitlist,setWaitlist]=useState(evento.waitlist);
  const tc={direttivo:C.red,sostenitore:C.gold,ordinario:C.blue};
  return (<div>
    <BackBtn onClick={onBack} label="← Torna all'evento" />
    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12 }}>
      <div>
        <h3 style={{ fontFamily:S,fontSize:22,color:C.text,margin:0 }}>Partecipanti</h3>
        <p style={{ color:C.muted,fontSize:12,fontFamily:F,margin:"4px 0 0" }}>{evento.iscritti} iscritti · {evento.posti-evento.iscritti} posti liberi</p>
      </div>
      {isAdmin&&<Btn v="gold" onClick={() => alert("Export in preparazione…")} sx={{ fontSize:11,padding:"8px 12px" }}>↓ Export</Btn>}
    </div>
    <Bar val={evento.iscritti} max={evento.posti} color={evento.iscritti/evento.posti>.9?C.red:evento.iscritti/evento.posti>.7?C.gold:C.green} />
    <div style={{ height:10 }} />
    {lista.map((p,i) => (
      <Box key={p.id} sx={{ marginBottom:8 }}>
        <div style={{ display:"flex",alignItems:"center",gap:12 }}>
          <div style={{ width:36,height:36,borderRadius:"50%",background:`${tc[p.tipo]||C.blue}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0 }}>👤</div>
          <div style={{ flex:1 }}>
            <div style={{ display:"flex",alignItems:"center",gap:8,flexWrap:"wrap" }}>
              <span style={{ fontFamily:S,fontSize:16,color:C.text,fontWeight:700 }}>{p.nome}</span>
              {p.ospiti>0&&<Tag label={`+${p.ospiti}`} color={C.purple} sm />}
            </div>
            <div style={{ display:"flex",gap:6,marginTop:4,flexWrap:"wrap" }}>
              <Tag label={p.tipo} color={tc[p.tipo]||C.blue} sm />
              <Tag label={p.stato} color={p.stato==="confermato"?C.green:C.gold} sm />
            </div>
          </div>
          {isAdmin&&evento.prezzo>0&&<div style={{ fontSize:12,color:p.pagato?C.green:C.gold,fontFamily:F,fontWeight:600 }}>{p.pagato?`✓ €${p.importo}`:"⏳ n.p."}</div>}
        </div>
      </Box>
    ))}
    {waitlist.length>0&&<div style={{ marginTop:18 }}>
      <h4 style={{ fontFamily:S,fontSize:17,color:C.gold,margin:"0 0 10px" }}>Lista d'attesa ({waitlist.length})</h4>
      {waitlist.map((nome,i) => (
        <Box key={nome} sx={{ marginBottom:8,borderColor:`${C.gold}33` }}>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between" }}>
            <div style={{ display:"flex",alignItems:"center",gap:10 }}>
              <span style={{ fontSize:14,color:C.gold,fontFamily:F,fontWeight:700 }}>#{i+1}</span>
              <span style={{ fontFamily:S,fontSize:16,color:C.text }}>{nome}</span>
            </div>
            {isAdmin&&<Btn v="gold" onClick={() => setWaitlist(w=>w.filter(n=>n!==nome))} sx={{ fontSize:10,padding:"6px 10px" }}>Promuovi →</Btn>}
          </div>
        </Box>
      ))}
    </div>}
    {evento.tavoli&&isAdmin&&<div style={{ marginTop:20 }}>
      <h4 style={{ fontFamily:S,fontSize:17,color:C.text,margin:"0 0 12px" }}>🪑 Tavoli</h4>
      {evento.tavoli.map((t,i) => (
        <Box key={i} sx={{ marginBottom:10,borderLeft:`3px solid ${C.gold}` }}>
          <div style={{ display:"flex",justifyContent:"space-between",marginBottom:6 }}>
            <span style={{ fontFamily:S,fontSize:16,color:C.text,fontWeight:700 }}>{t.nome}</span>
            <span style={{ fontSize:12,color:C.muted,fontFamily:F }}>{t.posti} posti · {t.liberi} liberi</span>
          </div>
          <Bar val={t.posti-t.liberi} max={t.posti} color={C.gold} />
        </Box>
      ))}
    </div>}
    {isAdmin&&<Btn v="secondary" onClick={() => alert("Comunicazione inviata!")} sx={{ width:"100%",marginTop:14 }}>📨 Invia comunicazione</Btn>}
  </div>);
}
function EvScheda({ evento, onBack, isAdmin, socioProfilo, onIscrizioneAggiornata }) {
  const [sub,setSub]=useState("main"); const [saving,setSaving]=useState(false);
  const [iscritto,setIscritto]=useState(evento.iscrizioni.some(i=>i.nome===(socioProfilo?.nome||'Socio')));
  const [calAdded,setCalAdded]=useState(false);
  const t=EV_TIPI[evento.tipo]; const sold=evento.iscritti>=evento.posti; const pct=Math.round(evento.iscritti/evento.posti*100);
  async function handleIscrizione() {
    setSaving(true);
    const nome = socioProfilo?.nome || 'Socio';
    const lista = [...(evento.iscrizioni || []), { nome, data: new Date().toISOString() }];
    await supabase.from('eventi').update({ iscrizioni: lista }).eq('id', evento.id);
    const { data } = await supabase.from('eventi').select('*').eq('id', evento.id).single();
    if (data) {
      const evAgg = { ...evento, ...data, iscrizioni: data.iscrizioni || [], iscritti: (data.iscrizioni || []).length };
      onIscrizioneAggiornata?.(evAgg);
      setIscritto(true);
    }
    setSaving(false);
  }
  if(sub==="iscritti") return <EvIscritti evento={evento} onBack={() => setSub("main")} isAdmin={isAdmin} />;
  return (<div>
    <BackBtn onClick={onBack} label="← Tutti gli eventi" />
    <div style={{ background:`linear-gradient(135deg,${t.color}28,${C.alt})`,border:`1px solid ${t.color}44`,borderRadius:16,padding:20,marginBottom:14 }}>
      <div style={{ display:"flex",gap:8,marginBottom:10,flexWrap:"wrap" }}>
        <Tag label={`${t.icon} ${t.label}`} color={t.color} /><AccessoBadge accesso={evento.accesso} />
        {isAdmin&&<Tag label="👑 Admin" color={C.purple} />}
      </div>
      <h2 style={{ fontFamily:S,fontSize:23,color:C.text,margin:"0 0 10px",lineHeight:1.2 }}>{evento.titolo}</h2>
      <div style={{ fontSize:13,color:C.muted,fontFamily:F,lineHeight:1.9 }}>
        <div>📅 {evento.dataLabel} · {evento.orario}</div><div>📍 {evento.luogo}</div>
      </div>
    </div>
    <Box sx={{ marginBottom:10 }}>
      <div style={{ display:"flex",justifyContent:"space-between",marginBottom:7 }}>
        <span style={{ fontSize:12,color:C.muted,fontFamily:F }}>Posti</span>
        <span style={{ fontSize:12,fontFamily:F,color:sold?C.red:C.green }}>{sold?`SOLD OUT · ${evento.waitlist.length} in attesa`:`${evento.posti-evento.iscritti} liberi su ${evento.posti}`}</span>
      </div>
      <Bar val={evento.iscritti} max={evento.posti} color={pct>90?C.red:pct>70?C.gold:C.green} />
      <div style={{ display:"flex",justifyContent:"space-between",marginTop:5 }}>
        <span style={{ fontSize:11,color:C.faint,fontFamily:F }}>{evento.iscritti} iscritti</span>
        <span style={{ fontFamily:S,fontSize:17,color:evento.prezzo===0?C.green:C.gold,fontWeight:700 }}>{evento.prezzo===0?"Gratuito":`€ ${evento.prezzo}`}</span>
      </div>
    </Box>
    {!isAdmin&&<div style={{ marginBottom:12 }}>
      {iscritto
        ? <div>
            <Btn disabled sx={{ width:"100%",marginBottom:8,background:C.greenDim,color:C.green,border:`1px solid ${C.green}44` }}>Iscritto ✓</Btn>
            <div style={{ display:"flex",gap:8 }}>
              <Btn v="ghost" onClick={() => setIscritto(false)} sx={{ flex:1,fontSize:11 }}>Disdici</Btn>
              <Btn v="ghost" onClick={() => setCalAdded(true)} sx={{ flex:1,fontSize:11 }}>{calAdded?"✓ In calendario":"📆 Aggiungi al cal."}</Btn>
            </div>
          </div>
        : sold
          ? <Btn disabled sx={{ width:"100%",background:`${C.red}15`,color:C.red,border:`1px solid ${C.red}33` }}>Posti esauriti</Btn>
          : <div style={{ display:"flex",gap:8 }}>
              <Btn onClick={handleIscrizione} disabled={saving} sx={{ flex:2 }}>{saving?"…":`Iscriviti${evento.prezzo>0?` · € ${evento.prezzo}`:""} →`}</Btn>
              <Btn v="ghost" onClick={() => setCalAdded(true)} sx={{ flex:1,fontSize:11 }}>{calAdded?"✓":"📆 Cal."}</Btn>
            </div>
      }
    </div>}
    {evento.iscrizioni.length>0&&<Box sx={{ marginBottom:10 }}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10 }}>
        <h4 style={{ fontFamily:S,fontSize:16,color:C.text,margin:0 }}>Chi partecipa ({evento.iscritti})</h4>
        <button onClick={() => setSub("iscritti")} style={{ background:"none",border:"none",color:C.gold,fontSize:12,cursor:"pointer",fontFamily:F }}>Vedi tutti →</button>
      </div>
      <div style={{ display:"flex" }}>
        {evento.iscrizioni.slice(0,5).map((p,i) => (
          <div key={i} title={p.nome} style={{ width:34,height:34,borderRadius:"50%",background:`${C.red}88`,border:`2px solid ${C.bg}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,color:"#fff",fontFamily:S,marginLeft:i>0?-10:0,fontWeight:700 }}>{p.nome.charAt(0)}</div>
        ))}
        {evento.iscritti>5&&<div style={{ width:34,height:34,borderRadius:"50%",background:C.alt,border:`2px solid ${C.bg}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:C.muted,marginLeft:-10,fontFamily:F }}>+{evento.iscritti-5}</div>}
      </div>
    </Box>}
    <Box sx={{ marginBottom:10 }}>
      <h4 style={{ fontFamily:S,fontSize:17,color:C.text,margin:"0 0 8px" }}>Descrizione</h4>
      <p style={{ color:C.muted,fontSize:13,fontFamily:F,lineHeight:1.7,margin:0 }}>{evento.desc}</p>
    </Box>
    {evento.programma.length>0&&<Box>
      <h4 style={{ fontFamily:S,fontSize:17,color:C.text,margin:"0 0 12px" }}>Programma</h4>
      {evento.programma.map((p,i) => (
        <div key={i} style={{ display:"flex",gap:12,paddingBottom:i<evento.programma.length-1?10:0,marginBottom:i<evento.programma.length-1?10:0,borderBottom:i<evento.programma.length-1?`1px solid ${C.border}`:"none" }}>
          <span style={{ fontFamily:S,fontSize:14,color:t.color,fontWeight:700,minWidth:42,flexShrink:0 }}>{p.ora}</span>
          <span style={{ fontSize:13,color:C.muted,fontFamily:F,lineHeight:1.5 }}>{p.voce}</span>
        </div>
      ))}
    </Box>}
  </div>);
}
function EventiSection({ isAdmin, socioProfilo, openId, onOpenHandled }) {
  const [eventiDB, setEventiDB] = useState([]);
const [loadingEv, setLoadingEv] = useState(true);

useEffect(() => {
  async function caricaEventi() {
    const { data, error } = await supabase.from('eventi').select('*');
    if (error) { console.log('Errore:', error); return; }
    const mappati = data.map(e => ({
      ...e,
      desc: e.desc_evento,
      dataObj: e.data,
      iscrizioni: e.iscrizioni || [],
      iscritti: (e.iscrizioni || []).length,
      waitlist: e.waitlist || [],
      programma: e.programma || [],
    }));
    setEventi(mappati);
    setLoadingEv(false);
  }
  caricaEventi();
}, []);
  const [eventi,setEventi]=useState([]); const [filtro,setFiltro]=useState("tutti");
  const [selected,setSelected]=useState(null); const [showForm,setShowForm]=useState(false);
  useEffect(() => {
    if (!openId || !eventi.length) return;
    const ev = eventi.find(x => x.id === openId);
    if (ev) { setSelected(ev); onOpenHandled?.(); }
  }, [eventi, openId]);
  const oggi=new Date("2026-03-27");
  const sorted=useMemo(()=>[...eventi].sort((a,b)=>new Date(a.data)-new Date(b.data)),[eventi]);
  const prossimi=sorted.filter(e=>new Date(e.data)>=oggi); const passati=sorted.filter(e=>new Date(e.data)<oggi);
  const filtra=list=>filtro==="tutti"?list:list.filter(e=>e.tipo===filtro);
  if(selected) return <EvScheda evento={selected} onBack={() => setSelected(null)} isAdmin={isAdmin} socioProfilo={socioProfilo} onIscrizioneAggiornata={(evAgg) => { setEventi(ev => ev.map(e => e.id===evAgg.id?evAgg:e)); setSelected(evAgg); }} />;
  const ECard=({ev}) => {
    const tp=EV_TIPI[ev.tipo]; const sold=ev.iscritti>=ev.posti; const pct=ev.iscritti/ev.posti;
    const isc=ev.iscrizioni.some(i=>i.nome===socioProfilo?.nome);
    return (<Box onClick={() => setSelected(ev)} sx={{ marginBottom:12,borderLeft:`3px solid ${tp.color}` }}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8,flexWrap:"wrap",gap:6 }}>
        <div style={{ display:"flex",gap:6 }}><Tag label={`${tp.icon} ${tp.label}`} color={tp.color} sm /><AccessoBadge accesso={ev.accesso} /></div>
        {isc&&<Tag label="✓ Iscritto" color={C.green} sm />}
      </div>
      <h3 style={{ fontFamily:S,fontSize:19,color:C.text,margin:"0 0 6px",lineHeight:1.2 }}>{ev.titolo}</h3>
      <div style={{ fontSize:12,color:C.muted,fontFamily:F,lineHeight:1.9,marginBottom:10 }}>
        <div>📅 {ev.dataLabel} · {ev.orario}</div><div>📍 {ev.luogo.split(",")[0]}</div>
      </div>
      <Bar val={ev.iscritti} max={ev.posti} color={sold?C.red:pct>.8?C.gold:C.green} />
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:6 }}>
        {sold
          ? <span style={{ fontSize:11,fontWeight:700,color:C.red,fontFamily:F,background:`${C.red}15`,padding:"3px 8px",borderRadius:6 }}>Posti esauriti</span>
          : <span style={{ fontSize:11,fontWeight:600,color:pct>.8?C.gold:C.green,fontFamily:F,background:pct>.8?`${C.gold}18`:`${C.green}18`,padding:"3px 8px",borderRadius:6 }}>{ev.posti-ev.iscritti} posti rimasti</span>
        }
        <span style={{ fontFamily:S,fontSize:16,color:ev.prezzo===0?C.green:C.gold,fontWeight:700 }}>{ev.prezzo===0?"Gratuito":`€ ${ev.prezzo}`}</span>
      </div>
    </Box>);
  };
  return (<div>
    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16 }}>
      <SecTitle title="Eventi" sub={`${prossimi.length} prossimi · ${passati.length} passati`} />
    </div>
    <div style={{ display:"flex",gap:6,marginBottom:18,overflowX:"auto",paddingBottom:4 }}>
      <Pill active={filtro==="tutti"} color={C.red} onClick={() => setFiltro("tutti")}>Tutti</Pill>
      {Object.entries(EV_TIPI).map(([k,t]) => <Pill key={k} active={filtro===k} color={t.color} onClick={() => setFiltro(k)}>{t.icon} {t.label}</Pill>)}
    </div>
    {filtra(prossimi).length>0&&<div>
      <div style={{ fontSize:11,color:C.faint,fontFamily:F,letterSpacing:1,textTransform:"uppercase",marginBottom:12 }}>PROSSIMI EVENTI</div>
      {filtra(prossimi).map(ev=><ECard key={ev.id} ev={ev} />)}
    </div>}
    {filtra(passati).length>0&&<div style={{ marginTop:16 }}>
      <div style={{ fontSize:11,color:C.faint,fontFamily:F,letterSpacing:1,textTransform:"uppercase",marginBottom:12 }}>EVENTI PASSATI</div>
      {filtra(passati).map(ev => (
        <Box key={ev.id} onClick={() => setSelected(ev)} sx={{ marginBottom:8,opacity:.65 }}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
            <div>
              <div style={{ fontFamily:S,fontSize:16,color:C.text }}>{ev.titolo}</div>
              <div style={{ fontSize:11,color:C.faint,fontFamily:F }}>{ev.dataLabel} · {ev.iscritti} partecipanti</div>
            </div>
          </div>
        </Box>
      ))}
    </div>}
  </div>);
}

// ═══════════════════════════════════════════════════════════════════════════════
// SEZIONE: CONVENZIONI
// ═══════════════════════════════════════════════════════════════════════════════
function ConvQR({ codice, colore }) {
  const cells=useMemo(()=>{const g=[];for(let r=0;r<11;r++){const row=[];for(let c=0;c<11;c++){const e=r<3&&c<3||r<3&&c>7||r>7&&c<3;const inn=r>0&&r<2&&c>0&&c<2||r>0&&r<2&&c>8&&c<10||r>8&&r<10&&c>0&&c<2;row.push(e&&!inn||(!e&&(r+c+codice.length)%3===0));}g.push(row);}return g;},[codice]);
  return (<div style={{ display:"inline-block",background:"#fff",padding:10,borderRadius:10,border:`3px solid ${colore}` }}>
    <div style={{ display:"grid",gridTemplateColumns:"repeat(11,10px)",gap:1 }}>
      {cells.flat().map((on,i) => <div key={i} style={{ width:10,height:10,background:on?colore:"#fff",borderRadius:on?2:0 }} />)}
    </div>
    <div style={{ textAlign:"center",marginTop:6,fontSize:9,color:C.faint,fontFamily:F,letterSpacing:.5 }}>{codice}</div>
  </div>);
}
function ConvScheda({ conv, role, preferiti, onToggleFav, onBack }) {
  const [showQR,setShowQR]=useState(false); const [copiato,setCopiato]=useState(false);
  const isFav=preferiti.includes(conv.id);
  const isAcc=conv.accesso==="tutti"||(conv.accesso==="sostenitore"&&["sostenitore","direttivo"].includes(role))||(conv.accesso==="direttivo"&&role==="direttivo");
  const giorni=Math.ceil((new Date(conv.scadenza.split("/").reverse().join("-"))-new Date("2026-03-27"))/(1000*60*60*24));
  const inScad=giorni<=30&&giorni>0;
  const copiaCodice=()=>{setCopiato(true);setTimeout(()=>setCopiato(false),2000);};
  return (<div>
    <BackBtn onClick={onBack} label="← Tutte le convenzioni" />
    <div style={{ background:`linear-gradient(135deg,${conv.colore}28,${C.alt})`,border:`1px solid ${conv.colore}44`,borderRadius:16,padding:20,marginBottom:14 }}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start" }}>
        <div style={{ display:"flex",gap:14,alignItems:"center" }}>
          <div style={{ width:56,height:56,borderRadius:14,background:`${conv.colore}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,flexShrink:0 }}>{conv.icon}</div>
          <div>
            <h2 style={{ fontFamily:S,fontSize:20,color:C.text,margin:"0 0 6px",lineHeight:1.1 }}>{conv.nome}</h2>
            <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
              <Tag label={conv.categoria} color={conv.colore} sm /><AccessoBadge accesso={conv.accesso} />
              {conv.nuova&&<Tag label="Nuova" color={C.green} sm />}
              {inScad&&<Tag label={`${giorni}gg`} color={C.orange} sm />}
            </div>
          </div>
        </div>
        <button onClick={() => onToggleFav(conv.id)} style={{ background:"none",border:"none",fontSize:22,cursor:"pointer" }}>{isFav?"❤️":"🤍"}</button>
      </div>
      <div style={{ marginTop:14,padding:"10px 14px",background:`${conv.colore}1A`,borderRadius:10,border:`1px solid ${conv.colore}33` }}>
        <div style={{ fontFamily:S,fontSize:19,color:conv.colore,fontWeight:700 }}>{conv.titolo_breve}</div>
      </div>
    </div>
    {!isAcc&&<Box sx={{ marginBottom:14,borderColor:`${C.gold}44`,background:`${C.gold}08` }}>
      <div style={{ display:"flex",gap:12,alignItems:"center" }}>
        <span style={{ fontSize:24 }}>🔒</span>
        <div>
          <div style={{ fontFamily:S,fontSize:16,color:C.gold }}>Convenzione riservata</div>
          <div style={{ fontSize:12,color:C.muted,fontFamily:F,marginTop:3 }}>Disponibile per soci <strong style={{ color:C.gold }}>{conv.accesso==="sostenitore"?"Sostenitore+":"solo Direttivo"}</strong>.</div>
        </div>
      </div>
    </Box>}
    <Box sx={{ marginBottom:12 }}>
      <h4 style={{ fontFamily:S,fontSize:17,color:C.text,margin:"0 0 8px" }}>Descrizione</h4>
      <p style={{ color:C.muted,fontSize:13,fontFamily:F,lineHeight:1.7,margin:0 }}>{conv.desc}</p>
    </Box>
    <Box sx={{ marginBottom:12 }}>
      <h4 style={{ fontFamily:S,fontSize:17,color:C.text,margin:"0 0 10px" }}>Condizioni</h4>
      <p style={{ color:C.muted,fontSize:13,fontFamily:F,lineHeight:1.7,margin:"0 0 12px" }}>{conv.condizioni}</p>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
        <div style={{ fontSize:12,color:C.muted,fontFamily:F }}>📅 Scadenza: <strong style={{ color:inScad?C.orange:C.text }}>{conv.scadenza}</strong></div>
        <div style={{ fontSize:12,color:C.muted,fontFamily:F }}>📍 {conv.citta}</div>
      </div>
    </Box>
    {isAcc&&<Box sx={{ marginBottom:12,borderColor:`${conv.colore}33` }}>
      <h4 style={{ fontFamily:S,fontSize:17,color:C.text,margin:"0 0 14px" }}>Come attivare</h4>
      {conv.attivazione==="codice"&&<div>
        <div style={{ fontSize:11,color:C.faint,fontFamily:F,marginBottom:8,letterSpacing:.5 }}>CODICE SCONTO</div>
        <div style={{ display:"flex",gap:8,alignItems:"center",marginBottom:14 }}>
          <div style={{ flex:1,background:C.alt,border:`2px dashed ${conv.colore}66`,borderRadius:10,padding:"12px 16px",textAlign:"center" }}>
            <div style={{ fontFamily:"monospace",fontSize:18,color:conv.colore,fontWeight:700,letterSpacing:2 }}>{conv.codice}</div>
          </div>
          <Btn v="ghost" onClick={copiaCodice} sx={{ fontSize:11,padding:"10px 12px",flexShrink:0,borderColor:`${conv.colore}44`,color:conv.colore }}>{copiato?"✓ Copiato":"Copia"}</Btn>
        </div>
        <Btn v="ghost" onClick={() => setShowQR(q=>!q)} sx={{ width:"100%",fontSize:11,borderColor:`${conv.colore}33`,color:conv.colore }}>{showQR?"Nascondi QR":"📱 Mostra QR Code"}</Btn>
        {showQR&&<div style={{ textAlign:"center",marginTop:16 }}>
          <ConvQR codice={conv.codice} colore={conv.colore} />
          <div style={{ fontSize:11,color:C.muted,fontFamily:F,marginTop:10 }}>Mostra al partner per attivare la convenzione</div>
        </div>}
      </div>}
      {conv.attivazione==="link"&&<div>
        <div style={{ fontSize:12,color:C.muted,fontFamily:F,lineHeight:1.6,marginBottom:14 }}>Clicca per accedere alla pagina dedicata ai soci UNIIC.</div>
        <Btn onClick={() => alert("Apertura link partner…")} sx={{ width:"100%",background:conv.colore,border:"none",color:"#fff" }}>🔗 Vai al sito del partner →</Btn>
      </div>}
      {conv.attivazione==="contatto"&&<div>
        <div style={{ fontSize:12,color:C.muted,fontFamily:F,lineHeight:1.6,marginBottom:14 }}>Contatta il partner citando di essere socio UNIIC.</div>
        {[[" 📞",conv.contatto_tel,"Chiama"],["✉️",conv.contatto_email,"Email"]].map(([ic,val,lab]) => (
          <div key={lab} style={{ display:"flex",alignItems:"center",gap:12,padding:"12px 14px",background:C.alt,borderRadius:10,border:`1px solid ${C.border}`,marginBottom:8 }}>
            <span style={{ fontSize:18 }}>{ic}</span>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:10,color:C.faint,fontFamily:F,marginBottom:2 }}>{lab}</div>
              <div style={{ fontSize:13,color:C.text,fontFamily:F }}>{val}</div>
            </div>
            <button onClick={() => alert(`${lab}: ${val}`)} style={{ background:conv.colore,border:"none",color:"#fff",borderRadius:8,padding:"6px 12px",fontSize:11,fontFamily:F,cursor:"pointer" }}>{ic}</button>
          </div>
        ))}
      </div>}
    </Box>}
    <div style={{ display:"flex",gap:10,marginBottom:12 }}>
      <Box sx={{ flex:1,textAlign:"center",padding:"12px 10px" }}>
        <div style={{ fontFamily:S,fontSize:28,color:conv.colore,fontWeight:700 }}>{conv.utilizzi}</div>
        <div style={{ fontSize:11,color:C.faint,fontFamily:F }}>utilizzi totali</div>
      </Box>
      <Box sx={{ flex:1,textAlign:"center",padding:"12px 10px" }}>
        <div style={{ fontFamily:S,fontSize:28,color:C.gold,fontWeight:700 }}>{conv.preferiti}</div>
        <div style={{ fontSize:11,color:C.faint,fontFamily:F }}>nei preferiti</div>
      </Box>
    </div>
    <Btn v={isFav?"danger":"secondary"} onClick={() => onToggleFav(conv.id)} sx={{ width:"100%" }}>{isFav?"❤️ Rimuovi dai preferiti":"🤍 Salva nei preferiti"}</Btn>
  </div>);
}
function ConvenzioniSection({ role, isAdmin, openId, onOpenHandled }) {const [convDB, setConvDB] = useState([]);
useEffect(() => {
  async function carica() {
    const { data, error } = await supabase.from('convenzioni').select('*');
    if (error) { console.log('Errore:', error); return; }
    setConvenzioni(data);
  }
  carica();
}, []);
  const [convenzioni,setConvenzioni]=useState([] ); const [proposte,setProposte]=useState([]);
  const [preferiti,setPreferiti]=useState([3,5]); const [filtroCateg,setFiltroCateg]=useState("Tutte");
  const [showFav,setShowFav]=useState(false); const [showFilters,setShowFilters]=useState(false);
  const [selected,setSelected]=useState(null); const [adminView,setAdminView]=useState("lista");
  useEffect(() => {
    if (!openId || !convenzioni.length) return;
    const c = convenzioni.find(x => x.id === openId);
    if (c) { setSelected(c); onOpenHandled?.(); }
  }, [convenzioni, openId]);
  const [proponiForm,setProponiForm]=useState(false); const [proponiInviato,setProponiInviato]=useState(false);
  const [propForm,setPropForm]=useState({nome:"",categoria:"F&B",desc:"",contatto:""});
  const toggleFav=id=>setPreferiti(fs=>fs.includes(id)?fs.filter(f=>f!==id):[...fs,id]);
  const filtered=useMemo(()=>convenzioni.filter(c=>{
    if(showFav&&!preferiti.includes(c.id)) return false;
    if(filtroCateg!=="Tutte"&&c.categoria!==filtroCateg) return false;
    return true;
  }),[convenzioni,preferiti,showFav,filtroCateg]);
  const attive=filtered.filter(c=>c.attiva); const sospese=filtered.filter(c=>!c.attiva);
  const inAttesaCount=proposte.filter(p=>p.stato==="in_attesa").length;
  if(selected) return <ConvScheda conv={selected} role={role} preferiti={preferiti} onToggleFav={toggleFav} onBack={() => setSelected(null)} />;
  if(proponiForm) return (<div>
    <BackBtn onClick={() => setProponiForm(false)} label="← Torna alle convenzioni" />
    {proponiInviato?<div style={{ textAlign:"center",padding:"32px 0" }}>
      <div style={{ fontSize:48,marginBottom:16 }}>✅</div>
      <h3 style={{ fontFamily:S,fontSize:24,color:C.text,margin:"0 0 8px" }}>Proposta inviata!</h3>
      <p style={{ color:C.muted,fontFamily:F,fontSize:13,lineHeight:1.6,margin:"0 0 20px" }}>Il board UNIIC ti contatterà entro 5 giorni lavorativi.</p>
      <Btn onClick={() => { setProponiForm(false); setProponiInviato(false); }}>Torna alle convenzioni →</Btn>
    </div>:<div>
      <h3 style={{ fontFamily:S,fontSize:22,color:C.text,margin:"0 0 6px" }}>Proponi la tua impresa</h3>
      <p style={{ color:C.muted,fontSize:12,fontFamily:F,margin:"0 0 18px",lineHeight:1.6 }}>Offri un vantaggio esclusivo ai soci UNIIC.</p>
      {[["NOME IMPRESA","nome","text","Es. Lamian SRL"],["DESCRIZIONE OFFERTA","desc","textarea","Descrivi lo sconto…"],["CONTATTO","contatto","text","Email o telefono"]].map(([l,k,t,ph]) => (
        <div key={k} style={{ marginBottom:14 }}>
          <div style={{ fontSize:10,color:C.faint,letterSpacing:.5,fontFamily:F,marginBottom:5 }}>{l}</div>
          {t==="textarea"?<textarea value={propForm[k]} onChange={e=>setPropForm(f=>({...f,[k]:e.target.value}))} placeholder={ph} rows={4} style={{ width:"100%",background:C.alt,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 12px",color:C.text,fontSize:13,fontFamily:F,boxSizing:"border-box",outline:"none",resize:"vertical" }} />
          :<input value={propForm[k]} onChange={e=>setPropForm(f=>({...f,[k]:e.target.value}))} placeholder={ph} style={{ width:"100%",background:C.alt,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 12px",color:C.text,fontSize:13,fontFamily:F,boxSizing:"border-box",outline:"none" }} />}
        </div>
      ))}
      <Btn onClick={() => setProponiInviato(true)} sx={{ width:"100%" }}>Invia proposta →</Btn>
    </div>}
  </div>);
  return (<div>
    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16 }}>
      <SecTitle title="Convenzioni" sub={`${attive.length} attive · ${preferiti.length} preferite`} />
    </div>
    {isAdmin&&inAttesaCount>0&&<div style={{ background:C.goldDim,border:`1px solid ${C.gold}44`,borderRadius:10,padding:"10px 14px",marginBottom:14,fontSize:12,color:C.gold,fontFamily:F }}>
      📨 {inAttesaCount} proposta{inAttesaCount>1?"e":""} in attesa di approvazione
    </div>}
    <div style={{ display:"flex",gap:8,marginBottom:14 }}>
      <button onClick={() => setShowFav(f=>!f)} style={{ display:"flex",alignItems:"center",gap:6,background:showFav?C.redDim:C.alt,border:`1px solid ${showFav?C.red:C.border}`,borderRadius:20,padding:"7px 12px",color:showFav?C.red:C.muted,fontFamily:F,fontSize:11,cursor:"pointer" }}>
        {showFav?"❤️":"🤍"} Preferiti{preferiti.length>0?` (${preferiti.length})`:""}
      </button>
      <button onClick={() => setProponiForm(true)} style={{ background:C.alt,border:`1px solid ${C.border}`,borderRadius:20,padding:"7px 12px",color:C.muted,fontFamily:F,fontSize:11,cursor:"pointer" }}>+ Proponi</button>
    </div>
    <div style={{ display:"flex",gap:6,marginBottom:16,overflowX:"auto",paddingBottom:4 }}>
      {CONV_CATEGORIE.map(c=><Pill key={c} active={filtroCateg===c} color={C.red} onClick={() => setFiltroCateg(c)}>{c}</Pill>)}
    </div>
    {attive.map(conv => {
      const isFav=preferiti.includes(conv.id);
      const giorni=Math.ceil((new Date(conv.scadenza.split("/").reverse().join("-"))-new Date("2026-03-27"))/(1000*60*60*24));
      const inScad=giorni<=30&&giorni>0;
      const isAcc=conv.accesso==="tutti"||(conv.accesso==="sostenitore"&&["sostenitore","direttivo"].includes(role))||(conv.accesso==="direttivo"&&role==="direttivo");
      return (<Box key={conv.id} onClick={() => setSelected(conv)} sx={{ marginBottom:12,opacity:isAcc?1:.8 }}>
        <div style={{ display:"flex",alignItems:"flex-start",gap:12 }}>
          <div style={{ width:50,height:50,borderRadius:12,background:`${conv.colore}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0 }}>{conv.icon}</div>
          <div style={{ flex:1,minWidth:0 }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8 }}>
              <div style={{ fontFamily:S,fontSize:17,color:C.text,fontWeight:700,lineHeight:1.2,flex:1 }}>{conv.nome}</div>
              <div style={{ display:"flex",gap:4,flexShrink:0 }}>
                {isFav&&<span>❤️</span>}{conv.nuova&&<Tag label="New" color={C.green} sm />}
              </div>
            </div>
            <div style={{ fontSize:13,color:conv.colore,fontFamily:F,fontWeight:600,margin:"4px 0" }}>{conv.titolo_breve}</div>
            <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
              <Tag label={conv.categoria} color={conv.colore} sm /><AccessoBadge accesso={conv.accesso} />
              {inScad&&<Tag label={`${giorni}gg`} color={C.orange} sm />}
            </div>
            {!isAcc&&<div style={{ fontSize:11,color:C.gold,fontFamily:F,marginTop:6 }}>🔒 Richiede quota {conv.accesso==="sostenitore"?"Sostenitore":"Direttivo"}</div>}
          </div>
        </div>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:10 }}>
          <div style={{ fontSize:11,color:C.faint,fontFamily:F }}>📍 {conv.citta} · {conv.utilizzi} utilizzi</div>
          <button onClick={e=>{e.stopPropagation();toggleFav(conv.id);}} style={{ background:"none",border:"none",fontSize:16,cursor:"pointer" }}>{isFav?"❤️":"🤍"}</button>
        </div>
      </Box>);
    })}
    {sospese.length>0&&<div style={{ marginTop:16 }}>
      <div style={{ fontSize:11,color:C.faint,fontFamily:F,letterSpacing:1,textTransform:"uppercase",marginBottom:10 }}>TEMPORANEAMENTE SOSPESE</div>
      {sospese.map(conv => (<Box key={conv.id} onClick={() => setSelected(conv)} sx={{ marginBottom:8,opacity:.55 }}>
        <div style={{ display:"flex",gap:12,alignItems:"center" }}>
          <div style={{ width:36,height:36,borderRadius:8,background:C.alt,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0 }}>{conv.icon}</div>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:S,fontSize:15,color:C.text }}>{conv.nome}</div>
            <div style={{ display:"flex",gap:6,marginTop:3 }}><Tag label={conv.categoria} color={C.muted} sm /><Tag label="Sospesa" color={C.red} sm /></div>
          </div>
        </div>
      </Box>))}
    </div>}
    <Box sx={{ marginTop:20,textAlign:"center",borderStyle:"dashed",padding:"20px 16px" }}>
      <div style={{ fontSize:28,marginBottom:8 }}>🤝</div>
      <div style={{ fontFamily:S,fontSize:18,color:C.text,marginBottom:6 }}>Hai un'offerta per i soci?</div>
      <div style={{ fontSize:12,color:C.muted,fontFamily:F,marginBottom:14,lineHeight:1.5 }}>Proponi la tua impresa nel circuito UNIIC.</div>
      <Btn onClick={() => setProponiForm(true)} sx={{ fontSize:12 }}>Proponi la tua impresa →</Btn>
    </Box>
  </div>);
}

// ═══════════════════════════════════════════════════════════════════════════════
// SEZIONE: NEWSLETTER
// ═══════════════════════════════════════════════════════════════════════════════
const nlCanRead = (art, role) => art.accesso==="tutti"||(art.accesso==="sostenitore"&&["sostenitore","direttivo"].includes(role))||(art.accesso==="direttivo"&&role==="direttivo");

function NLLettura({ art, role, salvati, onToggleSalva, onBack, isAdmin, setArticoli }) {
  const [myR,setMyR]=useState(null); const [commenti,setCommenti]=useState(art.commenti);
  const [reazioni,setReazioni]=useState(art.reazioni); const [draft,setDraft]=useState("");
  const [shareMenu,setShareMenu]=useState(false);
  const cat=NL_CAT[art.categoria]; const isSalvato=salvati.includes(art.id); const acc=nlCanRead(art,role);
  const reagisci=tipo=>{
    if(myR===tipo){setMyR(null);setReazioni(r=>({...r,[tipo]:r[tipo]-1}));}
    else{if(myR)setReazioni(r=>({...r,[myR]:r[myR]-1}));setMyR(tipo);setReazioni(r=>({...r,[tipo]:r[tipo]+1}));}
  };
  const inviaComm=()=>{if(!draft.trim())return;setCommenti(cs=>[...cs,{autore:(socioProfilo?.nome || "Chen Wei"),avatar:"CW",colore:C.red,testo:draft.trim(),data:"adesso"}]);setDraft("");};
  return (<div>
    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16 }}>
      <BackBtn onClick={onBack} label="← Newsletter" />
      <div style={{ display:"flex",gap:8 }}>
        <button onClick={() => onToggleSalva(art.id)} style={{ background:"none",border:"none",fontSize:20,cursor:"pointer" }}>{isSalvato?"🔖":"🏷️"}</button>
      </div>
    </div>
    {!acc&&<Box sx={{ marginBottom:16,borderColor:`${C.gold}44`,background:`${C.gold}08`,textAlign:"center",padding:24 }}>
      <div style={{ fontSize:32,marginBottom:10 }}>🔒</div>
      <div style={{ fontFamily:S,fontSize:18,color:C.gold,marginBottom:8 }}>Contenuto riservato</div>
      <div style={{ fontSize:12,color:C.muted,fontFamily:F,lineHeight:1.6 }}>Disponibile per soci <strong style={{ color:C.gold }}>{art.accesso==="sostenitore"?"Sostenitore+":"solo Direttivo"}</strong>.</div>
    </Box>}
    <div style={{ marginBottom:20 }}>
      <div style={{ display:"flex",gap:8,marginBottom:12,flexWrap:"wrap" }}>
        {cat&&<Tag label={`${cat.icon} ${cat.label}`} color={cat.color} />}<AccessoBadge accesso={art.accesso} />
      </div>
      {art.occhiello&&<div style={{ fontSize:12,color:cat?.color||C.muted,fontFamily:F,fontWeight:600,marginBottom:8,letterSpacing:.3 }}>{art.occhiello}</div>}
      <h2 style={{ fontFamily:S,fontSize:24,color:C.text,margin:"0 0 12px",lineHeight:1.25 }}>{art.titolo}</h2>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8 }}>
        <div style={{ fontSize:12,color:C.muted,fontFamily:F }}>{art.autore} · {art.data} · {art.tempoLettura}</div>
        <div style={{ position:"relative" }}>
          <button onClick={() => setShareMenu(s=>!s)} style={{ background:C.alt,border:`1px solid ${C.border}`,borderRadius:20,padding:"5px 12px",color:C.muted,fontFamily:F,fontSize:11,cursor:"pointer" }}>↗ Condividi</button>
          {shareMenu&&<div style={{ position:"absolute",right:0,top:34,background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:8,width:160,zIndex:10,boxShadow:"0 8px 24px rgba(0,0,0,.4)" }}>
            {[["💬 WhatsApp","whatsapp"],["🔗 LinkedIn","linkedin"],["✉️ Email","email"],["📋 Copia link","copy"]].map(([l,k]) => (
              <button key={k} onClick={() => {alert(`Condiviso via ${k}!`);setShareMenu(false);}} style={{ display:"block",width:"100%",background:"none",border:"none",color:C.text,fontFamily:F,fontSize:12,padding:"8px 10px",cursor:"pointer",textAlign:"left",borderRadius:6 }}>{l}</button>
            ))}
          </div>}
        </div>
      </div>
    </div>
    {art.tipo==="fotoreport"&&art.foto&&acc&&<Box sx={{ marginBottom:16 }}>
      <div style={{ fontSize:10,color:C.faint,fontFamily:F,letterSpacing:.5,marginBottom:10 }}>GALLERY FOTOGRAFICA</div>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8 }}>
        {art.foto.map((emoji,i) => (<div key={i} style={{ aspectRatio:"1",background:C.alt,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,border:`1px solid ${C.border}` }}>{emoji}</div>))}
      </div>
    </Box>}
    {art.fonte&&<Box sx={{ marginBottom:14,borderLeft:`3px solid ${C.muted}`,borderRadius:"0 10px 10px 0" }}>
      <div style={{ fontSize:10,color:C.faint,fontFamily:F,marginBottom:4,letterSpacing:.5 }}>FONTI</div>
      <div style={{ fontSize:13,color:C.muted,fontFamily:F }}>{art.fonte}</div>
    </Box>}
    {acc&&<div style={{ marginBottom:20 }}>{art.testo.split("\n\n").map((par,i) => (<p key={i} style={{ color:C.muted,fontSize:14,fontFamily:F,lineHeight:1.8,margin:"0 0 16px" }}>{par}</p>))}</div>}
    {acc&&<Box sx={{ marginBottom:14 }}>
      <div style={{ fontSize:10,color:C.faint,fontFamily:F,letterSpacing:.5,marginBottom:12 }}>REAGISCI</div>
      <div style={{ display:"flex",gap:10 }}>
        {[["🔥","fire","Interessante"],["👏","clap","Applauso"],["👍","like","Mi piace"]].map(([em,k,lab]) => (
          <button key={k} onClick={() => reagisci(k)} style={{ flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4,background:myR===k?`${cat?.color||C.blue}22`:C.alt,border:`1.5px solid ${myR===k?cat?.color||C.blue:C.border}`,borderRadius:12,padding:"10px 6px",cursor:"pointer" }}>
            <span style={{ fontSize:22 }}>{em}</span>
            <span style={{ fontFamily:S,fontSize:16,color:myR===k?cat?.color||C.blue:C.text,fontWeight:700 }}>{reazioni[k]}</span>
            <span style={{ fontSize:9,color:C.faint,fontFamily:F }}>{lab}</span>
          </button>
        ))}
      </div>
    </Box>}
    {acc&&<Box>
      <h4 style={{ fontFamily:S,fontSize:17,color:C.text,margin:"0 0 14px" }}>Commenti ({commenti.length})</h4>
      {commenti.map((c,i) => (<div key={i} style={{ display:"flex",gap:10,marginBottom:14 }}>
        <div style={{ width:34,height:34,borderRadius:"50%",background:`${c.colore}88`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,color:"#fff",fontFamily:S,fontWeight:700,flexShrink:0 }}>{c.avatar}</div>
        <div style={{ flex:1 }}>
          <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:4 }}>
            <span style={{ fontFamily:S,fontSize:15,color:C.text,fontWeight:700 }}>{c.autore}</span>
            <span style={{ fontSize:10,color:C.faint,fontFamily:F }}>{c.data}</span>
          </div>
          <div style={{ fontSize:13,color:C.muted,fontFamily:F,lineHeight:1.5 }}>{c.testo}</div>
        </div>
      </div>))}
      <div style={{ display:"flex",gap:8,marginTop:4 }}>
        <input value={draft} onChange={e=>setDraft(e.target.value)} onKeyDown={e=>e.key==="Enter"&&inviaComm()} placeholder="Scrivi un commento…" style={{ flex:1,background:C.alt,border:`1px solid ${C.border}`,borderRadius:20,padding:"10px 14px",color:C.text,fontSize:13,fontFamily:F,outline:"none" }} />
        <button onClick={inviaComm} style={{ width:40,height:40,borderRadius:"50%",background:draft.trim()?C.red:C.alt,border:"none",color:"#fff",fontSize:16,cursor:"pointer" }}>→</button>
      </div>
    </Box>}
  </div>);
}
function NewsletterSection({ role, isAdmin, socioProfilo, openId, onOpenHandled }) {

  const [articoli,setArticoli]=useState([]); const [notifiche,setNotifiche]=useState([]);
  const [selected,setSelected]=useState(null); const [filterCat,setFilterCat]=useState("tutti");
  const [filterTipo,setFilterTipo]=useState("tutti"); const [salvati,setSalvati]=useState([2]);
  const [showSalvati,setShowSalvati]=useState(false); const [showNotif,setShowNotif]=useState(false)  
  useEffect(() => { async function carica() {
    const { data, error } = await supabase.from('articoli').select('*');
    if (error) { console.log('Errore:', error); return; }
    const mappati = data.map(a => ({
      ...a,
      data: a.data_pub,
      dataObj: a.data_obj,
      salvatiBool: false,
      reazioni: typeof a.reazioni === 'string' ? JSON.parse(a.reazioni) : a.reazioni,
      commenti: typeof a.commenti === 'string' ? JSON.parse(a.commenti) : a.commenti,
      foto: typeof a.foto === 'string' ? JSON.parse(a.foto) : (a.foto || []),
    }));
    setArticoli(mappati);
  }
  carica();
}, []);
  const toggleSalva=id=>setSalvati(ss=>ss.includes(id)?ss.filter(s=>s!==id):[...ss,id]);
  useEffect(() => {
    if (!openId || !articoli.length) return;
    const a = articoli.find(x => x.id === openId);
    if (a) { setSelected(a); onOpenHandled?.(); }
  }, [articoli, openId]);
  const pubbl=articoli.filter(a=>a.pubblicato);
  const visible=useMemo(()=>{
    let list=pubbl;
    if(showSalvati) list=list.filter(a=>salvati.includes(a.id));
    if(filterCat!=="tutti") list=list.filter(a=>a.categoria===filterCat);
    if(filterTipo!=="tutti") list=list.filter(a=>a.tipo===filterTipo);
    return list.sort((a,b)=>new Date(b.dataObj)-new Date(a.dataObj));
  },[pubbl,showSalvati,filterCat,filterTipo,salvati]);
  const flash=visible.filter(a=>a.tipo==="flash"); const nonFlash=visible.filter(a=>a.tipo!=="flash");
  if(showNotif) return (<div>
    <BackBtn onClick={() => setShowNotif(false)} label="← Newsletter" />
    <h3 style={{ fontFamily:S,fontSize:22,color:C.text,margin:"0 0 18px" }}>Notifiche push</h3>
    {notifiche.map(n => { const cat=NL_CAT[n.cat]; if(!cat) return null; return (
      <Box key={n.cat} sx={{ marginBottom:8 }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
          <div style={{ display:"flex",gap:12,alignItems:"center" }}>
            <div style={{ width:36,height:36,borderRadius:10,background:`${cat.color}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18 }}>{cat.icon}</div>
            <div>
              <div style={{ fontFamily:S,fontSize:16,color:C.text }}>{cat.label}</div>
              <div style={{ fontSize:11,color:n.attiva?C.green:C.muted,fontFamily:F,marginTop:2 }}>{n.attiva?"Attive":"Disattivate"}</div>
            </div>
          </div>
          <Toggle on={n.attiva} onChange={() => setNotifiche(ns=>ns.map(x=>x.cat===n.cat?{...x,attiva:!x.attiva}:x))} />
        </div>
      </Box>);
    })}
  </div>);
  if(selected) return <NLLettura art={selected} role={role} salvati={salvati} onToggleSalva={toggleSalva} onBack={() => setSelected(null)} isAdmin={isAdmin} setArticoli={setArticoli} />;
  return (<div>
    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14 }}>
      <div>
        <h2 style={{ fontFamily:S,fontSize:26,fontWeight:700,color:C.text,margin:0 }}>Newsletter</h2>
        <p style={{ color:C.muted,fontSize:12,margin:"4px 0 0",fontFamily:F }}>{pubbl.length} articoli pubblicati</p>
      </div>
      <div style={{ display:"flex",gap:6 }}>
        <button onClick={() => setShowNotif(true)} style={{ background:notifiche.filter(n=>n.attiva).length>0?C.goldDim:C.alt,border:`1px solid ${notifiche.filter(n=>n.attiva).length>0?C.gold:C.border}`,borderRadius:8,padding:"7px 10px",color:C.gold,cursor:"pointer",fontSize:16 }}>🔔</button>
      </div>
    </div>
    <div style={{ display:"flex",gap:8,marginBottom:12 }}>
      <button onClick={() => setShowSalvati(s=>!s)} style={{ display:"flex",alignItems:"center",gap:6,background:showSalvati?C.redDim:C.alt,border:`1px solid ${showSalvati?C.red:C.border}`,borderRadius:20,padding:"7px 12px",color:showSalvati?C.red:C.muted,fontFamily:F,fontSize:11,cursor:"pointer" }}>
        🔖 Salvati{salvati.length>0?` (${salvati.length})`:""}
      </button>
      <button onClick={() => {setFilterCat("tutti");setFilterTipo("tutti");setShowSalvati(false);}} style={{ background:C.alt,border:`1px solid ${C.border}`,borderRadius:20,padding:"7px 12px",color:C.muted,fontFamily:F,fontSize:11,cursor:"pointer" }}>↺ Reset</button>
    </div>
    <div style={{ display:"flex",gap:6,marginBottom:12,overflowX:"auto",paddingBottom:4 }}>
      <Pill active={filterTipo==="tutti"} color={C.red} onClick={() => setFilterTipo("tutti")}>Tutti</Pill>
      {NL_TIPI.map(t=><Pill key={t.id} active={filterTipo===t.id} color={C.red} onClick={() => setFilterTipo(t.id)}>{t.icon} {t.label}</Pill>)}
    </div>
    <div style={{ display:"flex",gap:6,marginBottom:18,overflowX:"auto",paddingBottom:4 }}>
      <Pill active={filterCat==="tutti"} color={C.muted} onClick={() => setFilterCat("tutti")}>Tutte</Pill>
      {Object.entries(NL_CAT).map(([k,v])=><Pill key={k} active={filterCat===k} color={v.color} onClick={() => setFilterCat(k)}>{v.icon} {v.label}</Pill>)}
    </div>
    {flash.length>0&&filterTipo==="tutti"&&<div style={{ marginBottom:20 }}>
      <div style={{ fontSize:10,color:C.teal,fontFamily:F,fontWeight:600,letterSpacing:.5,marginBottom:10 }}>⚡ FLASH NEWS</div>
      {flash.map(a => (<div key={a.id} onClick={() => setSelected(a)} style={{ background:`${C.teal}15`,border:`1px solid ${C.teal}44`,borderRadius:10,padding:"12px 14px",marginBottom:8,cursor:"pointer",display:"flex",gap:12,alignItems:"center" }}>
        <span style={{ fontSize:20 }}>{a.img}</span>
        <div style={{ flex:1 }}>
          <div style={{ fontFamily:S,fontSize:15,color:C.text,lineHeight:1.3 }}>{a.titolo}</div>
          <div style={{ fontSize:11,color:C.teal,fontFamily:F,marginTop:3 }}>{a.data} · {a.tempoLettura}</div>
        </div>
      </div>))}
    </div>}
    {nonFlash.map((a,idx) => {
      const cat=NL_CAT[a.categoria]; const acc=nlCanRead(a,role); const isSalv=salvati.includes(a.id);
      const isFirst=idx===0&&!showSalvati&&filterCat==="tutti"&&filterTipo==="tutti";
      return (<Box key={a.id} onClick={() => setSelected(a)} sx={{ marginBottom:12,opacity:acc?1:.75,...(isFirst?{borderLeft:`3px solid ${cat?.color||C.red}`}:{}) }}>
        {isFirst&&<div style={{ fontSize:10,color:cat?.color||C.red,fontFamily:F,fontWeight:600,letterSpacing:.5,marginBottom:8 }}>IN EVIDENZA</div>}
        <div style={{ display:"flex",gap:14,alignItems:"flex-start" }}>
          <div style={{ width:isFirst?60:52,height:isFirst?60:52,background:C.alt,borderRadius:isFirst?14:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:isFirst?30:24,flexShrink:0,border:`1px solid ${C.border}` }}>{a.img}</div>
          <div style={{ flex:1,minWidth:0 }}>
            <div style={{ display:"flex",gap:6,marginBottom:5,flexWrap:"wrap" }}>
              {cat&&<Tag label={`${cat.icon} ${cat.label}`} color={cat.color} sm />}<AccessoBadge accesso={a.accesso} />
            </div>
            <div style={{ fontFamily:S,fontSize:isFirst?18:16,color:C.text,lineHeight:1.3,marginBottom:5 }}>{a.titolo}</div>
            {a.occhiello&&<div style={{ fontSize:11,color:C.muted,fontFamily:F,marginBottom:5 }}>{a.occhiello}</div>}
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
              <div style={{ fontSize:11,color:C.faint,fontFamily:F }}>{a.data} · {a.tempoLettura}</div>
              <div style={{ display:"flex",gap:8,alignItems:"center" }}>
                {!acc&&<span style={{ fontSize:12 }}>🔒</span>}
                {a.commenti.length>0&&<span style={{ fontSize:11,color:C.muted,fontFamily:F }}>💬 {a.commenti.length}</span>}
                <span onClick={e=>{e.stopPropagation();toggleSalva(a.id);}} style={{ fontSize:16,cursor:"pointer" }}>{isSalv?"🔖":"🏷️"}</span>
              </div>
            </div>
          </div>
        </div>
      </Box>);
    })}
    {visible.length===0&&<div style={{ textAlign:"center",padding:40,color:C.muted,fontFamily:F,fontSize:13 }}>Nessun articolo con questi filtri.</div>}
  </div>);
}

// ═══════════════════════════════════════════════════════════════════════════════
// SEZIONE: PODCAST
// ═══════════════════════════════════════════════════════════════════════════════
const podCanListen = (ep, role) => ep.accesso==="tutti"||(ep.accesso==="sostenitore"&&["sostenitore","direttivo"].includes(role))||(ep.accesso==="direttivo"&&role==="direttivo");

function PodMiniPlayer({ ep, playing, onToggle, progress, onSeek }) {
  const fmt=POD_FORMATI[ep.formato];
  return (<div style={{ position:"sticky",bottom:0,background:C.surface,borderTop:`2px solid ${fmt?.color||C.red}`,padding:"10px 16px",zIndex:20 }}>
    <div style={{ display:"flex",alignItems:"center",gap:12 }}>
      <div style={{ width:38,height:38,borderRadius:8,background:`${fmt?.color||C.red}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0 }}>{fmt?.icon||"🎙️"}</div>
      <div style={{ flex:1,minWidth:0 }}>
        <div style={{ fontFamily:S,fontSize:14,color:C.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>Ep. {ep.ep} – {ep.titolo}</div>
        <div style={{ display:"flex",alignItems:"center",gap:8,marginTop:4 }}>
          <div style={{ flex:1,background:C.border,borderRadius:4,height:3,cursor:"pointer" }} onClick={e=>{const r=e.currentTarget.getBoundingClientRect();onSeek(Math.min(1,Math.max(0,(e.clientX-r.left)/r.width)));}}>
            <div style={{ width:`${progress*100}%`,height:"100%",background:fmt?.color||C.red,borderRadius:4 }} />
          </div>
          <span style={{ fontSize:10,color:C.faint,fontFamily:F,flexShrink:0 }}>{ep.durata}</span>
        </div>
      </div>
      <button onClick={onToggle} style={{ width:38,height:38,borderRadius:"50%",background:fmt?.color||C.red,border:"none",color:"#fff",fontSize:18,cursor:"pointer",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center" }}>{playing?"⏸":"▶"}</button>
    </div>
  </div>);
}
function PodScheda({ ep, role, salvati, onToggleSalva, playing, playingEp, onPlay, onBack, isAdmin, socioProfilo }) {
  const [sub,setSub]=useState("info"); const [commenti,setCommenti]=useState(ep.commenti);
  const [draft,setDraft]=useState(""); const [draftStelle,setDraftStelle]=useState(0);
  const [shareMenu,setShareMenu]=useState(false);
  const fmt=POD_FORMATI[ep.formato]; const isSalvato=salvati.includes(ep.id);
  const isPlaying=playing&&playingEp?.id===ep.id; const acc=podCanListen(ep,role);
  const inviaComm=()=>{
    if(!draft.trim()||draftStelle===0) return;
    setCommenti(cs=>[...cs,{autore:(socioProfilo?.nome || "Chen Wei"),avatar:"CW",colore:C.red,stelle:draftStelle,testo:draft.trim(),data:"adesso"}]);
    setDraft("");setDraftStelle(0);
  };
  return (<div>
    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16 }}>
      <BackBtn onClick={onBack} label="← Tutti gli episodi" />
      <div style={{ display:"flex",gap:8,alignItems:"center" }}>
        <button onClick={() => onToggleSalva(ep.id)} style={{ background:"none",border:"none",fontSize:20,cursor:"pointer" }}>{isSalvato?"🔖":"🏷️"}</button>
      </div>
    </div>
    <div style={{ background:`linear-gradient(135deg,${fmt?.color||C.red}28,${C.alt})`,border:`1px solid ${fmt?.color||C.red}44`,borderRadius:16,padding:20,marginBottom:14 }}>
      <div style={{ display:"flex",gap:8,marginBottom:10,flexWrap:"wrap" }}>
        <Tag label={`${fmt?.icon} ${fmt?.label}`} color={fmt?.color||C.red} />
        <Tag label={`Ep. ${ep.ep}`} color={C.muted} sm />
        {ep.accesso!=="tutti"&&<Tag label={ep.accesso==="sostenitore"?"Sostenitore+":"Solo Direttivo"} color={ep.accesso==="sostenitore"?C.gold:C.red} sm />}
      </div>
      <h2 style={{ fontFamily:S,fontSize:22,color:C.text,margin:"0 0 12px",lineHeight:1.25 }}>{ep.titolo}</h2>
      <div style={{ fontSize:12,color:C.muted,fontFamily:F,lineHeight:1.9 }}>
        <div>🎙️ Conduce: {ep.conduttore}</div>
        <div>⏱ {ep.durata} · 📅 {ep.data}</div>
        {ep.stelleMedia&&<div style={{ marginTop:4 }}>
          <Stars val={Math.round(ep.stelleMedia)} size={14} />
          <span style={{ color:C.gold,fontFamily:S,fontSize:15,fontWeight:700 }}> {ep.stelleMedia}</span>
          <span style={{ color:C.faint,fontFamily:F,fontSize:11 }}> ({ep.nRecensioni} recensioni)</span>
        </div>}
      </div>
    </div>
    {!acc&&<Box sx={{ marginBottom:14,borderColor:`${C.gold}44`,background:`${C.gold}08`,textAlign:"center",padding:24 }}>
      <div style={{ fontSize:32,marginBottom:10 }}>🔒</div>
      <div style={{ fontFamily:S,fontSize:18,color:C.gold,marginBottom:8 }}>Episodio riservato</div>
      <div style={{ fontSize:12,color:C.muted,fontFamily:F,lineHeight:1.6 }}>Disponibile per soci <strong style={{ color:C.gold }}>{ep.accesso==="sostenitore"?"Sostenitore+":"solo Direttivo"}</strong>.</div>
    </Box>}
    {acc&&ep.pubblicato&&<Box sx={{ marginBottom:14 }}>
      <div style={{ display:"flex",alignItems:"center",gap:14 }}>
        <button onClick={() => onPlay(ep)} style={{ width:52,height:52,borderRadius:"50%",background:isPlaying?fmt?.color||C.red:`${fmt?.color||C.red}22`,border:`2px solid ${fmt?.color||C.red}`,color:isPlaying?"#fff":fmt?.color||C.red,fontSize:22,cursor:"pointer",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center" }}>{isPlaying?"⏸":"▶"}</button>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:12,color:C.text,fontFamily:F,fontWeight:600,marginBottom:6 }}>{isPlaying?"In riproduzione":"Riproduci in app"}</div>
          <div style={{ background:C.border,borderRadius:4,height:4 }}>
            <div style={{ width:isPlaying?"22%":"0%",height:"100%",background:fmt?.color||C.red,borderRadius:4,transition:"width .3s" }} />
          </div>
        </div>
      </div>
      <div style={{ display:"flex",gap:8,marginTop:12 }}>
        {ep.spotify&&<Btn v="spotify" onClick={() => alert("Apertura Spotify…")} sx={{ flex:1,fontSize:11 }}>🎵 Spotify</Btn>}
        {ep.youtube&&<Btn v="youtube" onClick={() => alert("Apertura YouTube…")} sx={{ flex:1,fontSize:11 }}>▶ YouTube</Btn>}
      </div>
    </Box>}
    <div style={{ display:"flex",background:C.alt,borderRadius:10,padding:3,marginBottom:16 }}>
      {[["info","Info"],["ospiti","Ospiti"],["risorse","Risorse"],["trascrizione","Trascrizione"],["commenti",`Commenti (${commenti.length})`]].map(([k,l]) => (
        <button key={k} onClick={() => setSub(k)} style={{ flex:1,padding:"7px 2px",border:"none",borderRadius:8,background:sub===k?C.surface:"transparent",color:sub===k?C.text:C.muted,fontFamily:F,fontSize:9,fontWeight:600,cursor:"pointer" }}>{l}</button>
      ))}
    </div>
    {sub==="info"&&<div>
      <Box sx={{ marginBottom:12 }}>
        <h4 style={{ fontFamily:S,fontSize:16,color:C.text,margin:"0 0 8px" }}>Descrizione</h4>
        <p style={{ color:C.muted,fontSize:13,fontFamily:F,lineHeight:1.7,margin:0 }}>{ep.desc}</p>
      </Box>
      {ep.temi.length>0&&<Box>
        <div style={{ fontSize:10,color:C.faint,fontFamily:F,letterSpacing:.5,marginBottom:8 }}>ARGOMENTI</div>
        <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>{ep.temi.map(t=><Tag key={t} label={t} color={fmt?.color||C.red} />)}</div>
      </Box>}
    </div>}
    {sub==="ospiti"&&<div>{ep.ospiti.map((o,i) => (
      <Box key={i} sx={{ marginBottom:10 }}>
        <div style={{ display:"flex",gap:12,alignItems:"center" }}>
          <div style={{ width:48,height:48,borderRadius:"50%",background:`${o.colore}88`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,color:"#fff",fontFamily:S,fontWeight:700,flexShrink:0 }}>{o.avatar}</div>
          <div>
            <div style={{ fontFamily:S,fontSize:17,color:C.text,fontWeight:700 }}>{o.nome}</div>
            <div style={{ fontSize:12,color:C.muted,fontFamily:F }}>{o.ruolo}</div>
          </div>
        </div>
      </Box>
    ))}</div>}
    {sub==="risorse"&&<div>{ep.risorse.length===0?<div style={{ textAlign:"center",padding:30,color:C.faint,fontFamily:F,fontSize:13 }}>Nessuna risorsa.</div>:ep.risorse.map((r,i) => (
      <Box key={i} onClick={() => alert("Apertura risorsa…")} sx={{ marginBottom:8 }}>
        <div style={{ display:"flex",alignItems:"center",gap:12 }}>
          <span style={{ fontSize:20 }}>🔗</span>
          <span style={{ fontFamily:F,fontSize:13,color:C.gold }}>{r.testo}</span>
        </div>
      </Box>
    ))}</div>}
    {sub==="trascrizione"&&<div>{!ep.trascrizione?<div style={{ textAlign:"center",padding:30,color:C.faint,fontFamily:F,fontSize:13 }}>Trascrizione non disponibile.</div>
    :<Box>{ep.trascrizione.split("\n\n").map((par,i) => (
      <div key={i} style={{ marginBottom:14 }}>
        {par.startsWith("Chen")||par.startsWith("Wu")||par.startsWith("Avv.")||par.startsWith("Zhang")||par.startsWith("Lin")
        ?<div style={{ display:"flex",gap:10 }}>
          <div style={{ width:3,background:fmt?.color||C.red,borderRadius:2,flexShrink:0 }} />
          <p style={{ color:C.text,fontSize:13,fontFamily:F,lineHeight:1.7,margin:0,fontStyle:"italic" }}>{par}</p>
        </div>
        :<p style={{ color:C.muted,fontSize:13,fontFamily:F,lineHeight:1.7,margin:0 }}>{par}</p>}
      </div>
    ))}</Box>}</div>}
    {sub==="commenti"&&<div>
      {commenti.map((c,i) => (<Box key={i} sx={{ marginBottom:10 }}>
        <div style={{ display:"flex",gap:10,alignItems:"flex-start" }}>
          <div style={{ width:34,height:34,borderRadius:"50%",background:`${c.colore}88`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,color:"#fff",fontFamily:S,fontWeight:700,flexShrink:0 }}>{c.avatar}</div>
          <div style={{ flex:1 }}>
            <div style={{ display:"flex",justifyContent:"space-between",marginBottom:4 }}>
              <span style={{ fontFamily:S,fontSize:15,color:C.text,fontWeight:700 }}>{c.autore}</span>
              <span style={{ fontSize:10,color:C.faint,fontFamily:F }}>{c.data}</span>
            </div>
            <Stars val={c.stelle} size={14} />
            <p style={{ fontSize:13,color:C.muted,fontFamily:F,lineHeight:1.5,margin:"6px 0 0" }}>{c.testo}</p>
          </div>
        </div>
      </Box>))}
      {acc&&<Box sx={{ marginTop:12 }}>
        <div style={{ fontSize:11,color:C.faint,fontFamily:F,marginBottom:8 }}>LA TUA RECENSIONE</div>
        <div style={{ marginBottom:10 }}><Stars val={draftStelle} onChange={setDraftStelle} size={24} /></div>
        <div style={{ display:"flex",gap:8 }}>
          <input value={draft} onChange={e=>setDraft(e.target.value)} onKeyDown={e=>e.key==="Enter"&&inviaComm()} placeholder="Scrivi una recensione…" style={{ flex:1,background:C.alt,border:`1px solid ${C.border}`,borderRadius:20,padding:"10px 14px",color:C.text,fontSize:13,fontFamily:F,outline:"none" }} />
          <button onClick={inviaComm} style={{ width:40,height:40,borderRadius:"50%",background:(draft.trim()&&draftStelle>0)?C.red:C.alt,border:"none",color:"#fff",fontSize:16,cursor:"pointer" }}>→</button>
        </div>
        {draftStelle===0&&draft.trim()&&<div style={{ fontSize:11,color:C.orange,fontFamily:F,marginTop:6 }}>Seleziona prima una valutazione ★</div>}
      </Box>}
    </div>}
    {acc&&ep.pubblicato&&<div style={{ marginTop:16,position:"relative" }}>
      <Btn v="ghost" onClick={() => setShareMenu(s=>!s)} sx={{ width:"100%",fontSize:12 }}>↗ Condividi episodio</Btn>
      {shareMenu&&<div style={{ position:"absolute",bottom:50,left:0,right:0,background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:10,zIndex:10 }}>
        {[["💬 WhatsApp","whatsapp"],["🔗 LinkedIn","linkedin"],["✉️ Email","email"],["📋 Copia link","copy"]].map(([l,k]) => (
          <button key={k} onClick={() => {alert(`Condiviso via ${k}!`);setShareMenu(false);}} style={{ display:"block",width:"100%",background:"none",border:"none",color:C.text,fontFamily:F,fontSize:13,padding:"10px 12px",cursor:"pointer",textAlign:"left",borderRadius:8 }}>{l}</button>
        ))}
      </div>}
    </div>}
  </div>);
}
function PodcastSection({ role, isAdmin, socioProfilo }) {useEffect(() => {
  async function carica() {
    const { data, error } = await supabase.from('episodi').select('*');
    if (error) { console.log('Errore:', error); return; }
    const mappati = data.map(e => ({
      ...e,
      desc: e.descrizione,
      dataObj: e.data_obj,
      data: e.data_pub,
      stelleMedia: e.stelle_media,
      nRecensioni: e.n_recensioni,
      ospiti: typeof e.ospiti === 'string' ? JSON.parse(e.ospiti) : e.ospiti,
      risorse: typeof e.risorse === 'string' ? JSON.parse(e.risorse) : e.risorse,
      commenti: typeof e.commenti === 'string' ? JSON.parse(e.commenti) : e.commenti,
    }));
    setEpisodi(mappati);
  }
  carica();
}, []);
  const [episodi,setEpisodi]=useState([]); const [proposte,setProposte]=useState([]);
  const [salvati,setSalvati]=useState([3]); const [filterFormato,setFilterFormato]=useState("tutti");
  const [filterTema,setFilterTema]=useState("tutti"); const [showSalvati,setShowSalvati]=useState(false);
  const [selected,setSelected]=useState(null); const [adminView,setAdminView]=useState("lista");
  const [proponiForm,setProponiForm]=useState(false); const [propInviato,setPropInviato]=useState(false);
  const [playingEp,setPlayingEp]=useState(null); const [playing,setPlaying]=useState(false);
  const [progress,setProgress]=useState(0); const timerRef=useRef(null);
  const [propForm,setPropForm]=useState({titolo:"",ospite:"",desc:"",temi:[]});
  const toggleSalva=id=>setSalvati(ss=>ss.includes(id)?ss.filter(s=>s!==id):[...ss,id]);
  const startPlay=ep=>{if(playingEp?.id===ep.id){setPlaying(p=>!p);return;}setPlayingEp(ep);setPlaying(true);setProgress(0.13);};
  useEffect(()=>{
    if(playing){timerRef.current=setInterval(()=>setProgress(p=>Math.min(0.99,p+0.002)),500);}
    else{clearInterval(timerRef.current);}
    return()=>clearInterval(timerRef.current);
  },[playing]);
  const pubbl=episodi.filter(e=>e.pubblicato);
  const visibili=useMemo(()=>{
    let list=pubbl;
    if(showSalvati) list=list.filter(e=>salvati.includes(e.id));
    if(filterFormato!=="tutti") list=list.filter(e=>e.formato===filterFormato);
    if(filterTema!=="tutti") list=list.filter(e=>e.temi.includes(filterTema));
    return list.sort((a,b)=>new Date(b.dataObj)-new Date(a.dataObj));
  },[pubbl,showSalvati,filterFormato,filterTema,salvati]);
  if(selected) return (<div style={{ display:"flex",flexDirection:"column",height:"100%" }}>
    <PodScheda ep={selected} role={role} salvati={salvati} onToggleSalva={toggleSalva} playing={playing} playingEp={playingEp} onPlay={startPlay} onBack={() => setSelected(null)} isAdmin={isAdmin} socioProfilo={socioProfilo} />
    {playingEp&&<PodMiniPlayer ep={playingEp} playing={playing} onToggle={() => setPlaying(p=>!p)} progress={progress} onSeek={setProgress} />}
  </div>);
  if(proponiForm) return (<div>
    <BackBtn onClick={() => setProponiForm(false)} label="← Torna al podcast" />
    {propInviato?<div style={{ textAlign:"center",padding:"32px 0" }}>
      <div style={{ fontSize:48,marginBottom:16 }}>🎙️</div>
      <h3 style={{ fontFamily:S,fontSize:24,color:C.text,margin:"0 0 8px" }}>Proposta inviata!</h3>
      <p style={{ color:C.muted,fontFamily:F,fontSize:13,lineHeight:1.6,margin:"0 0 20px" }}>Il team UNIIC valuterà la tua proposta entro 7 giorni.</p>
      <Btn onClick={() => {setProponiForm(false);setPropInviato(false);}}>Torna al podcast →</Btn>
    </div>:<div>
      <h3 style={{ fontFamily:S,fontSize:22,color:C.text,margin:"0 0 18px" }}>Proponi un episodio</h3>
      {[["TITOLO PROPOSTO","titolo","text","Es. Il settore estetico cinese in Italia"],["OSPITE SUGGERITO","ospite","text","Es. Me stesso…"]].map(([l,k,t,ph]) => (
        <div key={k} style={{ marginBottom:12 }}>
          <div style={{ fontSize:10,color:C.faint,letterSpacing:.5,fontFamily:F,marginBottom:5 }}>{l}</div>
          <input value={propForm[k]} onChange={e=>setPropForm(f=>({...f,[k]:e.target.value}))} placeholder={ph} style={{ width:"100%",background:C.alt,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 12px",color:C.text,fontSize:13,fontFamily:F,boxSizing:"border-box",outline:"none" }} />
        </div>
      ))}
      <div style={{ marginBottom:12 }}>
        <div style={{ fontSize:10,color:C.faint,letterSpacing:.5,fontFamily:F,marginBottom:5 }}>DESCRIZIONE</div>
        <textarea value={propForm.desc} onChange={e=>setPropForm(f=>({...f,desc:e.target.value}))} rows={4} placeholder="Perché sarebbe utile alla community…" style={{ width:"100%",background:C.alt,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 12px",color:C.text,fontSize:13,fontFamily:F,boxSizing:"border-box",outline:"none",resize:"vertical" }} />
      </div>
      <div style={{ marginBottom:20 }}>
        <div style={{ fontSize:10,color:C.faint,letterSpacing:.5,fontFamily:F,marginBottom:8 }}>TEMI</div>
        <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
          {POD_TEMI.map(t => (<button key={t} onClick={() => setPropForm(f=>({...f,temi:f.temi.includes(t)?f.temi.filter(v=>v!==t):[...f.temi,t]}))} style={{ background:propForm.temi.includes(t)?C.redDim:C.alt,border:`1px solid ${propForm.temi.includes(t)?C.red:C.border}`,borderRadius:20,padding:"5px 12px",color:propForm.temi.includes(t)?C.red:C.muted,fontFamily:F,fontSize:11,cursor:"pointer" }}>{t}</button>))}
        </div>
      </div>
      <Btn onClick={() => setPropInviato(true)} sx={{ width:"100%" }}>Invia proposta →</Btn>
    </div>}
  </div>);
  return (<div>
    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16 }}>
      <div>
        <h2 style={{ fontFamily:S,fontSize:26,fontWeight:700,color:C.text,margin:0 }}>Podcast UNIIC</h2>
        <p style={{ color:C.muted,fontSize:12,margin:"4px 0 0",fontFamily:F }}>{pubbl.length} episodi pubblicati</p>
      </div>
    </div>
    <div style={{ display:"flex",gap:8,marginBottom:12 }}>
      <button onClick={() => setShowSalvati(s=>!s)} style={{ display:"flex",alignItems:"center",gap:6,background:showSalvati?C.redDim:C.alt,border:`1px solid ${showSalvati?C.red:C.border}`,borderRadius:20,padding:"7px 12px",color:showSalvati?C.red:C.muted,fontFamily:F,fontSize:11,cursor:"pointer" }}>🔖 Salvati{salvati.length>0?` (${salvati.length})`:""}
      </button>
      {!isAdmin&&<button onClick={() => setProponiForm(true)} style={{ background:C.alt,border:`1px solid ${C.border}`,borderRadius:20,padding:"7px 12px",color:C.muted,fontFamily:F,fontSize:11,cursor:"pointer" }}>🎙️ Proponi</button>}
    </div>
    <div style={{ display:"flex",gap:6,marginBottom:12,overflowX:"auto",paddingBottom:4 }}>
      <Pill active={filterFormato==="tutti"} color={C.red} onClick={() => setFilterFormato("tutti")}>Tutti</Pill>
      {Object.entries(POD_FORMATI).map(([k,v]) => <Pill key={k} active={filterFormato===k} color={v.color} onClick={() => setFilterFormato(k)}>{v.icon} {v.label}</Pill>)}
    </div>
    <div style={{ display:"flex",gap:6,marginBottom:18,overflowX:"auto",paddingBottom:4 }}>
      <Pill active={filterTema==="tutti"} color={C.muted} onClick={() => setFilterTema("tutti")}>Tutti i temi</Pill>
      {POD_TEMI.map(t => <Pill key={t} active={filterTema===t} color={C.gold} onClick={() => setFilterTema(t)}>{t}</Pill>)}
    </div>
    {visibili.length===0&&<div style={{ textAlign:"center",padding:40,color:C.muted,fontFamily:F,fontSize:13 }}>Nessun episodio con questi filtri.</div>}
    {visibili.map(ep => {
      const fmt=POD_FORMATI[ep.formato]; const acc=podCanListen(ep,role);
      const isSalv=salvati.includes(ep.id); const isPlay=playing&&playingEp?.id===ep.id;
      return (<Box key={ep.id} sx={{ marginBottom:12 }}>
        <div style={{ display:"flex",gap:12,alignItems:"flex-start" }}>
          <button onClick={() => acc&&ep.pubblicato&&startPlay(ep)} style={{ width:54,height:54,borderRadius:12,background:isPlay?fmt?.color||C.red:`${fmt?.color||C.red}22`,border:`2px solid ${fmt?.color||C.red}`,color:isPlay?"#fff":fmt?.color||C.red,fontSize:22,cursor:"pointer",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center" }}>
            {isPlay?"⏸":acc?"▶":"🔒"}
          </button>
          <div style={{ flex:1,minWidth:0 }} onClick={() => setSelected(ep)}>
            <div style={{ display:"flex",gap:6,marginBottom:5,flexWrap:"wrap" }}>
              <Tag label={`${fmt?.icon} ${fmt?.label}`} color={fmt?.color||C.red} sm />
              <Tag label={`Ep. ${ep.ep}`} color={C.muted} sm />
              {ep.accesso!=="tutti"&&<Tag label={ep.accesso==="sostenitore"?"Sostenitore+":"Direttivo"} color={ep.accesso==="sostenitore"?C.gold:C.red} sm />}
            </div>
            <div style={{ fontFamily:S,fontSize:17,color:C.text,lineHeight:1.3,marginBottom:4,cursor:"pointer" }}>{ep.titolo}</div>
            <div style={{ fontSize:11,color:C.muted,fontFamily:F }}>🎙️ {ep.ospiti.map(o=>o.nome).join(", ")}</div>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:6 }}>
              <div style={{ fontSize:11,color:C.faint,fontFamily:F }}>⏱ {ep.durata} · 📅 {ep.data}</div>
              <div style={{ display:"flex",gap:8,alignItems:"center" }}>
                {ep.stelleMedia&&<span style={{ fontSize:11,color:C.gold,fontFamily:F }}>★{ep.stelleMedia}</span>}
                <button onClick={e=>{e.stopPropagation();toggleSalva(ep.id);}} style={{ background:"none",border:"none",fontSize:16,cursor:"pointer" }}>{isSalv?"🔖":"🏷️"}</button>
              </div>
            </div>
          </div>
        </div>
      </Box>);
    })}
    {!isAdmin&&<Box sx={{ marginTop:16,textAlign:"center",borderStyle:"dashed",padding:"20px 16px" }}>
      <div style={{ fontSize:28,marginBottom:8 }}>🎙️</div>
      <div style={{ fontFamily:S,fontSize:18,color:C.text,marginBottom:6 }}>Hai una storia da raccontare?</div>
      <div style={{ fontSize:12,color:C.muted,fontFamily:F,marginBottom:14,lineHeight:1.5 }}>Proponi la tua storia al team UNIIC.</div>
      <Btn onClick={() => setProponiForm(true)} sx={{ fontSize:12 }}>Proponi un episodio →</Btn>
    </Box>}
    {playingEp&&<PodMiniPlayer ep={playingEp} playing={playing} onToggle={() => setPlaying(p=>!p)} progress={progress} onSeek={setProgress} />}
  </div>);
}

// ── AccountSection ─────────────────────────────────────────────────────────────
function AccountSection({ socioProfilo, session }) {
  const [form, setForm] = useState({
    nome: socioProfilo?.nome || "",
    telefono: socioProfilo?.telefono || "",
    citta: socioProfilo?.citta || "",
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [nuovaPassword, setNuovaPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);
  const [msgPwd, setMsgPwd] = useState("");

  const INPUT = { background:C.alt, border:`1px solid ${C.border}`, borderRadius:10,
    padding:"11px 14px", color:C.text, fontFamily:F, fontSize:13, width:"100%", boxSizing:"border-box", outline:"none" };
  const LABEL = { fontSize:10, color:C.muted, fontFamily:F, letterSpacing:.5, marginBottom:5, display:"block", textTransform:"uppercase" };

  const salvaModifiche = async () => {
    setSaving(true); setMsg("");
    const { error } = await supabase.from('soci').update({
      nome: form.nome,
      telefono: form.telefono,
      citta: form.citta,
    }).eq('email', session.user.email);
    setSaving(false);
    setMsg(error ? "Errore: " + error.message : "Modifiche salvate!");
    setTimeout(() => setMsg(""), 3000);
  };

  const cambiaPassword = async () => {
    if (!nuovaPassword || nuovaPassword.length < 6) { setMsgPwd("Minimo 6 caratteri."); return; }
    setSavingPwd(true); setMsgPwd("");
    const { error } = await supabase.auth.updateUser({ password: nuovaPassword });
    setSavingPwd(false);
    setMsgPwd(error ? "Errore: " + error.message : "Password aggiornata!");
    if (!error) { setNuovaPassword(""); setShowPwd(false); }
    setTimeout(() => setMsgPwd(""), 3000);
  };

  const iniziali = socioProfilo?.avatar_iniziali || (socioProfilo?.nome ? socioProfilo.nome.split(" ").map(p => p[0]).join("").slice(0,2).toUpperCase() : "?");
  const colore = socioProfilo?.avatar_colore || C.red;

  return (
    <div>
      <SecTitle title="Il mio account" sub="Gestisci il tuo profilo personale" />

      {/* Avatar + info */}
      <Box sx={{ display:"flex", alignItems:"center", gap:16, marginBottom:16 }}>
        <Avatar initials={iniziali} size={60} color={colore} />
        <div>
          <div style={{ fontFamily:S, fontSize:20, color:C.text, fontWeight:700 }}>{socioProfilo?.nome || "—"}</div>
          <div style={{ fontFamily:F, fontSize:12, color:C.muted, marginTop:2 }}>{session?.user?.email}</div>
          {socioProfilo?.tipo && <Tag label={socioProfilo.tipo} color={C.gold} sm />}
        </div>
      </Box>

      {/* Modifica profilo */}
      <Box sx={{ marginBottom:14 }}>
        <div style={{ fontFamily:F, fontSize:11, color:C.gold, fontWeight:600, letterSpacing:.5, marginBottom:14, textTransform:"uppercase" }}>Modifica profilo</div>
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <div><label style={LABEL}>Nome completo</label><input style={INPUT} value={form.nome} onChange={e => setForm(f => ({...f, nome: e.target.value}))} placeholder="Nome Cognome" /></div>
          <div><label style={LABEL}>Telefono</label><input style={INPUT} value={form.telefono} onChange={e => setForm(f => ({...f, telefono: e.target.value}))} placeholder="+39 000 0000000" type="tel" /></div>
          <div><label style={LABEL}>Città</label><input style={INPUT} value={form.citta} onChange={e => setForm(f => ({...f, citta: e.target.value}))} placeholder="Milano" /></div>
        </div>
        {msg && <div style={{ fontFamily:F, fontSize:12, color: msg.startsWith("Errore") ? C.red : C.green, marginTop:10 }}>{msg}</div>}
        <Btn onClick={salvaModifiche} v="primary" sx={{ width:"100%", marginTop:14 }}>{saving ? "Salvataggio…" : "Salva modifiche"}</Btn>
      </Box>

      {/* Cambia password */}
      <Box sx={{ marginBottom:14 }}>
        <div style={{ fontFamily:F, fontSize:11, color:C.gold, fontWeight:600, letterSpacing:.5, marginBottom:14, textTransform:"uppercase" }}>Sicurezza</div>
        {!showPwd ? (
          <Btn onClick={() => setShowPwd(true)} v="secondary" sx={{ width:"100%" }}>🔒 Cambia password</Btn>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            <div><label style={LABEL}>Nuova password</label><input style={INPUT} type="password" value={nuovaPassword} onChange={e => setNuovaPassword(e.target.value)} placeholder="••••••••" /></div>
            {msgPwd && <div style={{ fontFamily:F, fontSize:12, color: msgPwd.startsWith("Errore") ? C.red : C.green }}>{msgPwd}</div>}
            <div style={{ display:"flex", gap:8 }}>
              <Btn onClick={() => { setShowPwd(false); setNuovaPassword(""); setMsgPwd(""); }} v="ghost" sx={{ flex:1 }}>Annulla</Btn>
              <Btn onClick={cambiaPassword} v="gold" sx={{ flex:2 }}>{savingPwd ? "Aggiornamento…" : "Conferma"}</Btn>
            </div>
          </div>
        )}
      </Box>

      {/* Logout */}
      <Btn onClick={() => supabase.auth.signOut()} v="danger" sx={{ width:"100%" }}>Esci dall'app</Btn>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// APP ROOT
// ═══════════════════════════════════════════════════════════════════════════════
const NAV_TABS = [
  { id:"home",        label:"Home",        icon:"🏠" },
  { id:"soci",        label:"Soci",        icon:"👥" },
  { id:"convenzioni", label:"Convenzioni", icon:"🤝" },
  { id:"eventi",      label:"Eventi",      icon:"📅" },
  { id:"newsletter",  label:"News",        icon:"📰" },
  { id:"podcast",     label:"Podcast",     icon:"🎙️" },
];

function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errore, setErrore] = useState("");

  const login = async () => {
    if (!email || !password) { setErrore("Inserisci email e password"); return; }
    setLoading(true); setErrore("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setErrore("Email o password non corretti"); setLoading(false); return; }
    onLogin();
  };

  return (
    <div style={{ display:"flex", justifyContent:"center", alignItems:"center", minHeight:"100vh", background:"#080605" }}>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Montserrat:wght@400;500;600&display=swap" rel="stylesheet" />
      <div style={{ width:360, padding:"40px 32px", background:C.surface, borderRadius:20, border:`1px solid ${C.border}` }}>
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ width:56, height:56, background:C.red, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, margin:"0 auto 16px" }}>🐉</div>
          <h1 style={{ fontFamily:S, fontSize:28, color:C.text, margin:"0 0 6px" }}>UNIIC</h1>
          <p style={{ fontFamily:F, fontSize:11, color:C.gold, letterSpacing:2, margin:0 }}>中意商联</p>
        </div>
        <div style={{ marginBottom:14 }}>
          <div style={{ fontSize:10, color:C.faint, fontFamily:F, letterSpacing:.5, marginBottom:6 }}>EMAIL</div>
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="la-tua@email.it" type="email"
            style={{ width:"100%", background:C.alt, border:`1px solid ${C.border}`, borderRadius:10, padding:"12px 14px", color:C.text, fontSize:13, fontFamily:F, boxSizing:"border-box", outline:"none" }} />
        </div>
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:10, color:C.faint, fontFamily:F, letterSpacing:.5, marginBottom:6 }}>PASSWORD</div>
          <input value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" type="password"
            onKeyDown={e => e.key==="Enter" && login()}
            style={{ width:"100%", background:C.alt, border:`1px solid ${C.border}`, borderRadius:10, padding:"12px 14px", color:C.text, fontSize:13, fontFamily:F, boxSizing:"border-box", outline:"none" }} />
        </div>
        {errore && <div style={{ fontSize:12, color:C.red, fontFamily:F, marginBottom:14, textAlign:"center" }}>{errore}</div>}
        <button onClick={login} disabled={loading} style={{ width:"100%", background:C.red, border:"none", borderRadius:10, padding:"13px", color:"#fff", fontSize:14, fontFamily:F, fontWeight:600, cursor:"pointer" }}>
          {loading ? "Accesso in corso..." : "Accedi →"}
        </button>
        <p style={{ textAlign:"center", fontSize:11, color:C.faint, fontFamily:F, marginTop:20 }}>App riservata ai soci UNIIC</p>
      </div>
    </div>
  );
}

// ── Shared modal shell ────────────────────────────────────────────────────────
function AdminModal({ titolo, onClose, onSubmit, saving, errore, children }) {
  const BTN_ROW = { display:"flex", gap:8, marginTop:20 };
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.7)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 }}>
      <div onClick={e => e.stopPropagation()} style={{ background:C.bg, border:`1px solid ${C.border}`, borderRadius:16, padding:24, width:340, maxWidth:"92vw", maxHeight:"88vh", overflowY:"auto", position:"relative" }}>
        <button onClick={onClose} style={{ position:"absolute", top:14, right:16, background:"none", border:"none", color:C.muted, fontSize:20, cursor:"pointer", lineHeight:1 }}>×</button>
        <h3 style={{ fontFamily:S, fontSize:18, color:C.text, margin:"0 0 18px" }}>{titolo}</h3>
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>{children}</div>
        {errore && <div style={{ color:C.red, fontFamily:F, fontSize:12, marginTop:10 }}>{errore}</div>}
        <div style={BTN_ROW}>
          <button onClick={onClose} style={{ flex:1, padding:"10px 0", borderRadius:8, border:`1px solid ${C.border}`, background:"none", color:C.muted, fontFamily:F, fontSize:13, cursor:"pointer" }}>Annulla</button>
          <button onClick={onSubmit} disabled={saving} style={{ flex:2, padding:"10px 0", borderRadius:8, border:"none", background:C.gold, color:C.bg, fontFamily:F, fontSize:13, fontWeight:600, cursor:saving?"wait":"pointer", opacity:saving?0.7:1 }}>
            {saving ? "Salvataggio…" : "Salva"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Soci modal ─────────────────────────────────────────────────────────────────
function SocioModal({ record, onClose, onSaved }) {
  const VUOTO = { nome:"", email:"", tipo:"ordinario", attivo:true, avatar_iniziali:"", avatar_colore:"#C8A96E" };
  const [form, setForm] = useState(record ? { nome:record.nome||"", email:record.email||"", tipo:record.tipo||"ordinario", attivo:record.attivo??true, avatar_iniziali:record.avatar_iniziali||"", avatar_colore:record.avatar_colore||"#C8A96E" } : { ...VUOTO });
  const [saving, setSaving] = useState(false);
  const [errore, setErrore] = useState("");
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const INPUT = { background:C.surface, border:`1px solid ${C.border}`, borderRadius:8, padding:"9px 12px", color:C.text, fontFamily:F, fontSize:13, width:"100%", boxSizing:"border-box" };
  const LABEL = { fontSize:11, color:C.muted, fontFamily:F, marginBottom:4, display:"block" };
  const submit = async () => {
    if (!form.nome.trim() || !form.email.trim()) { setErrore("Nome e email sono obbligatori."); return; }
    setSaving(true); setErrore("");
    const { error } = record
      ? await supabase.from('soci').update(form).eq('id', record.id)
      : await supabase.from('soci').insert([form]);
    setSaving(false);
    if (error) { setErrore(error.message); return; }
    onSaved();
  };
  return (
    <AdminModal titolo={record ? "Modifica socio" : "Aggiungi socio"} onClose={onClose} onSubmit={submit} saving={saving} errore={errore}>
      <div><label style={LABEL}>Nome</label><input style={INPUT} value={form.nome} onChange={e => set("nome", e.target.value)} placeholder="Nome Cognome" /></div>
      <div><label style={LABEL}>Email</label><input style={INPUT} value={form.email} onChange={e => set("email", e.target.value)} placeholder="email@esempio.it" /></div>
      <div><label style={LABEL}>Tipo</label>
        <select style={INPUT} value={form.tipo} onChange={e => set("tipo", e.target.value)}>
          <option value="ordinario">Ordinario</option><option value="direttivo">Direttivo</option><option value="onorario">Onorario</option>
        </select>
      </div>
      <div style={{ display:"flex", gap:12 }}>
        <div style={{ flex:1 }}><label style={LABEL}>Iniziali avatar</label><input style={INPUT} value={form.avatar_iniziali} onChange={e => set("avatar_iniziali", e.target.value)} placeholder="es. CW" maxLength={3} /></div>
        <div style={{ flex:1 }}><label style={LABEL}>Colore avatar</label><input type="color" style={{ ...INPUT, padding:4, height:38, cursor:"pointer" }} value={form.avatar_colore} onChange={e => set("avatar_colore", e.target.value)} /></div>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <input type="checkbox" id="attivo-cb" checked={form.attivo} onChange={e => set("attivo", e.target.checked)} style={{ width:16, height:16, cursor:"pointer", accentColor:C.gold }} />
        <label htmlFor="attivo-cb" style={{ fontSize:11, color:C.muted, fontFamily:F, cursor:"pointer" }}>Socio attivo</label>
      </div>
    </AdminModal>
  );
}

// ── Eventi modal ───────────────────────────────────────────────────────────────
function EventoModal({ record, onClose, onSaved }) {
  const VUOTO = { titolo:"", desc_evento:"", tipo:"networking", data:"", luogo:"", posti:50, iscrizioni_aperte:true };
  const [form, setForm] = useState(record ? { titolo:record.titolo||"", desc_evento:record.desc_evento||"", tipo:record.tipo||"networking", data:record.data||"", luogo:record.luogo||"", posti:record.posti||50, iscrizioni_aperte:record.iscrizioni_aperte??true } : { ...VUOTO });
  const [saving, setSaving] = useState(false);
  const [errore, setErrore] = useState("");
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const INPUT = { background:C.surface, border:`1px solid ${C.border}`, borderRadius:8, padding:"9px 12px", color:C.text, fontFamily:F, fontSize:13, width:"100%", boxSizing:"border-box" };
  const LABEL = { fontSize:11, color:C.muted, fontFamily:F, marginBottom:4, display:"block" };
  const submit = async () => {
    if (!form.titolo.trim()) { setErrore("Il titolo è obbligatorio."); return; }
    setSaving(true); setErrore("");
    const { error } = record
      ? await supabase.from('eventi').update(form).eq('id', record.id)
      : await supabase.from('eventi').insert([form]);
    setSaving(false);
    if (error) { setErrore(error.message); return; }
    onSaved();
  };
  return (
    <AdminModal titolo={record ? "Modifica evento" : "Aggiungi evento"} onClose={onClose} onSubmit={submit} saving={saving} errore={errore}>
      <div><label style={LABEL}>Titolo</label><input style={INPUT} value={form.titolo} onChange={e => set("titolo", e.target.value)} placeholder="Titolo evento" /></div>
      <div><label style={LABEL}>Descrizione</label><textarea style={{ ...INPUT, minHeight:80, resize:"vertical" }} value={form.desc_evento} onChange={e => set("desc_evento", e.target.value)} placeholder="Descrizione…" /></div>
      <div><label style={LABEL}>Tipo</label>
        <select style={INPUT} value={form.tipo} onChange={e => set("tipo", e.target.value)}>
          <option value="networking">Networking</option><option value="formazione">Formazione</option><option value="culturale">Culturale</option><option value="business">Business</option>
        </select>
      </div>
      <div style={{ display:"flex", gap:12 }}>
        <div style={{ flex:1 }}><label style={LABEL}>Data</label><input type="date" style={INPUT} value={form.data} onChange={e => set("data", e.target.value)} /></div>
        <div style={{ flex:1 }}><label style={LABEL}>Posti</label><input type="number" style={INPUT} value={form.posti} onChange={e => set("posti", Number(e.target.value))} min={1} /></div>
      </div>
      <div><label style={LABEL}>Luogo</label><input style={INPUT} value={form.luogo} onChange={e => set("luogo", e.target.value)} placeholder="Via, Città" /></div>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <input type="checkbox" id="isc-cb" checked={form.iscrizioni_aperte} onChange={e => set("iscrizioni_aperte", e.target.checked)} style={{ width:16, height:16, cursor:"pointer", accentColor:C.gold }} />
        <label htmlFor="isc-cb" style={{ fontSize:11, color:C.muted, fontFamily:F, cursor:"pointer" }}>Iscrizioni aperte</label>
      </div>
    </AdminModal>
  );
}

// ── Convenzioni modal ──────────────────────────────────────────────────────────
function ConvenzioneModal({ record, onClose, onSaved }) {
  const VUOTO = { nome:"", categoria:"", descrizione:"", scadenza:"", attiva:true };
  const [form, setForm] = useState(record ? { nome:record.nome||"", categoria:record.categoria||"", descrizione:record.descrizione||"", scadenza:record.scadenza||"", attiva:record.attiva??true } : { ...VUOTO });
  const [saving, setSaving] = useState(false);
  const [errore, setErrore] = useState("");
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const INPUT = { background:C.surface, border:`1px solid ${C.border}`, borderRadius:8, padding:"9px 12px", color:C.text, fontFamily:F, fontSize:13, width:"100%", boxSizing:"border-box" };
  const LABEL = { fontSize:11, color:C.muted, fontFamily:F, marginBottom:4, display:"block" };
  const submit = async () => {
    if (!form.nome.trim()) { setErrore("Il nome azienda è obbligatorio."); return; }
    setSaving(true); setErrore("");
    const { error } = record
      ? await supabase.from('convenzioni').update(form).eq('id', record.id)
      : await supabase.from('convenzioni').insert([form]);
    setSaving(false);
    if (error) { setErrore(error.message); return; }
    onSaved();
  };
  return (
    <AdminModal titolo={record ? "Modifica convenzione" : "Aggiungi convenzione"} onClose={onClose} onSubmit={submit} saving={saving} errore={errore}>
      <div><label style={LABEL}>Nome azienda</label><input style={INPUT} value={form.nome} onChange={e => set("nome", e.target.value)} placeholder="Nome azienda" /></div>
      <div><label style={LABEL}>Categoria</label><input style={INPUT} value={form.categoria} onChange={e => set("categoria", e.target.value)} placeholder="es. Ristorazione, Viaggi…" /></div>
      <div><label style={LABEL}>Descrizione</label><textarea style={{ ...INPUT, minHeight:70, resize:"vertical" }} value={form.descrizione} onChange={e => set("descrizione", e.target.value)} placeholder="Descrizione convenzione…" /></div>
      <div><label style={LABEL}>Scadenza</label><input type="date" style={INPUT} value={form.scadenza} onChange={e => set("scadenza", e.target.value)} /></div>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <input type="checkbox" id="conv-attiva-cb" checked={form.attiva} onChange={e => set("attiva", e.target.checked)} style={{ width:16, height:16, cursor:"pointer", accentColor:C.gold }} />
        <label htmlFor="conv-attiva-cb" style={{ fontSize:11, color:C.muted, fontFamily:F, cursor:"pointer" }}>Convenzione attiva</label>
      </div>
    </AdminModal>
  );
}

// ── Articoli modal ─────────────────────────────────────────────────────────────
function ArticoloModal({ record, onClose, onSaved }) {
  const VUOTO = { titolo:"", testo:"", autore:"", data_pub:"", categoria:"", pubblicato:false };
  const [form, setForm] = useState(record ? { titolo:record.titolo||"", testo:record.testo||"", autore:record.autore||"", data_pub:record.data_pub||"", categoria:record.categoria||"", pubblicato:record.pubblicato??false } : { ...VUOTO });
  const [saving, setSaving] = useState(false);
  const [errore, setErrore] = useState("");
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const INPUT = { background:C.surface, border:`1px solid ${C.border}`, borderRadius:8, padding:"9px 12px", color:C.text, fontFamily:F, fontSize:13, width:"100%", boxSizing:"border-box" };
  const LABEL = { fontSize:11, color:C.muted, fontFamily:F, marginBottom:4, display:"block" };
  const submit = async () => {
    if (!form.titolo.trim()) { setErrore("Il titolo è obbligatorio."); return; }
    setSaving(true); setErrore("");
    const { error } = record
      ? await supabase.from('articoli').update(form).eq('id', record.id)
      : await supabase.from('articoli').insert([form]);
    setSaving(false);
    if (error) { setErrore(error.message); return; }
    onSaved();
  };
  return (
    <AdminModal titolo={record ? "Modifica articolo" : "Aggiungi articolo"} onClose={onClose} onSubmit={submit} saving={saving} errore={errore}>
      <div><label style={LABEL}>Titolo</label><input style={INPUT} value={form.titolo} onChange={e => set("titolo", e.target.value)} placeholder="Titolo articolo" /></div>
      <div><label style={LABEL}>Testo</label><textarea style={{ ...INPUT, minHeight:100, resize:"vertical" }} value={form.testo} onChange={e => set("testo", e.target.value)} placeholder="Testo dell'articolo…" /></div>
      <div style={{ display:"flex", gap:12 }}>
        <div style={{ flex:1 }}><label style={LABEL}>Autore</label><input style={INPUT} value={form.autore} onChange={e => set("autore", e.target.value)} placeholder="Nome autore" /></div>
        <div style={{ flex:1 }}><label style={LABEL}>Data pubbl.</label><input type="date" style={INPUT} value={form.data_pub} onChange={e => set("data_pub", e.target.value)} /></div>
      </div>
      <div><label style={LABEL}>Categoria</label><input style={INPUT} value={form.categoria} onChange={e => set("categoria", e.target.value)} placeholder="es. Cultura, Business…" /></div>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <input type="checkbox" id="pubbl-cb" checked={form.pubblicato} onChange={e => set("pubblicato", e.target.checked)} style={{ width:16, height:16, cursor:"pointer", accentColor:C.gold }} />
        <label htmlFor="pubbl-cb" style={{ fontSize:11, color:C.muted, fontFamily:F, cursor:"pointer" }}>Pubblicato</label>
      </div>
    </AdminModal>
  );
}

// ── Episodi modal ──────────────────────────────────────────────────────────────
function EpisodioModal({ record, onClose, onSaved }) {
  const VUOTO = { titolo:"", descrizione:"", ospiti:"", durata:"", data_pub:"", url_audio:"", url_video:"", pubblicato:false };
  const ospiti_str = record ? (Array.isArray(record.ospiti) ? record.ospiti.map(o => o?.nome || o).join(", ") : typeof record.ospiti === "object" && record.ospiti !== null ? record.ospiti.nome || JSON.stringify(record.ospiti) : record.ospiti || "") : "";
  const [form, setForm] = useState(record ? { titolo:record.titolo||"", descrizione:record.descrizione||"", ospiti:ospiti_str, durata:record.durata||"", data_pub:record.data_pub||"", url_audio:record.url_audio||"", url_video:record.url_video||"", pubblicato:record.pubblicato??false } : { ...VUOTO });
  const [saving, setSaving] = useState(false);
  const [errore, setErrore] = useState("");
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const INPUT = { background:C.surface, border:`1px solid ${C.border}`, borderRadius:8, padding:"9px 12px", color:C.text, fontFamily:F, fontSize:13, width:"100%", boxSizing:"border-box" };
  const LABEL = { fontSize:11, color:C.muted, fontFamily:F, marginBottom:4, display:"block" };
  const submit = async () => {
    if (!form.titolo.trim()) { setErrore("Il titolo è obbligatorio."); return; }
    setSaving(true); setErrore("");
    const { error } = record
      ? await supabase.from('episodi').update(form).eq('id', record.id)
      : await supabase.from('episodi').insert([form]);
    setSaving(false);
    if (error) { setErrore(error.message); return; }
    onSaved();
  };
  return (
    <AdminModal titolo={record ? "Modifica episodio" : "Aggiungi episodio"} onClose={onClose} onSubmit={submit} saving={saving} errore={errore}>
      <div><label style={LABEL}>Titolo</label><input style={INPUT} value={form.titolo} onChange={e => set("titolo", e.target.value)} placeholder="Titolo episodio" /></div>
      <div><label style={LABEL}>Descrizione</label><textarea style={{ ...INPUT, minHeight:70, resize:"vertical" }} value={form.descrizione} onChange={e => set("descrizione", e.target.value)} placeholder="Descrizione…" /></div>
      <div><label style={LABEL}>Ospiti</label><input style={INPUT} value={form.ospiti} onChange={e => set("ospiti", e.target.value)} placeholder="es. Mario Rossi, Anna Bianchi" /></div>
      <div style={{ display:"flex", gap:12 }}>
        <div style={{ flex:1 }}><label style={LABEL}>Durata</label><input style={INPUT} value={form.durata} onChange={e => set("durata", e.target.value)} placeholder="es. 45 min" /></div>
        <div style={{ flex:1 }}><label style={LABEL}>Data pubbl.</label><input type="date" style={INPUT} value={form.data_pub} onChange={e => set("data_pub", e.target.value)} /></div>
      </div>
      <div><label style={LABEL}>URL audio</label><input style={INPUT} value={form.url_audio} onChange={e => set("url_audio", e.target.value)} placeholder="https://…" /></div>
      <div><label style={LABEL}>URL video</label><input style={INPUT} value={form.url_video} onChange={e => set("url_video", e.target.value)} placeholder="https://…" /></div>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <input type="checkbox" id="ep-pubbl-cb" checked={form.pubblicato} onChange={e => set("pubblicato", e.target.checked)} style={{ width:16, height:16, cursor:"pointer", accentColor:C.gold }} />
        <label htmlFor="ep-pubbl-cb" style={{ fontSize:11, color:C.muted, fontFamily:F, cursor:"pointer" }}>Pubblicato</label>
      </div>
    </AdminModal>
  );
}

// ── AdminSection ───────────────────────────────────────────────────────────────
function AdminSection({ socioProfilo, session }) {
  const [sottoTab, setSottoTab] = useState("soci");
  const [righe, setRighe] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(null); // null | "nuovo" | { ...record }
  const [showPushModal, setShowPushModal] = useState(false);
  const [pushTitle, setPushTitle] = useState("");
  const [pushBody, setPushBody] = useState("");
  const [pushLoading, setPushLoading] = useState(false);

  const inviaPush = async () => {
    setPushLoading(true);
    try {
      const response = await fetch(
        'https://atltrjhnkklnkgwscsuy.supabase.co/functions/v1/send-push-notification',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0bHRyamhua2tsbmtnd3Njc3V5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MTI0NDksImV4cCI6MjA5MDI4ODQ0OX0.-Jpg3LXe4TOUn5AIBho8hFm5foCCNrMO7Vc4QMi5IAI',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0bHRyamhua2tsbmtnd3Njc3V5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MTI0NDksImV4cCI6MjA5MDI4ODQ0OX0.-Jpg3LXe4TOUn5AIBho8hFm5foCCNrMO7Vc4QMi5IAI'
          },
          body: JSON.stringify({ title: pushTitle, body: pushBody })
        }
      );
      if (!response.ok) throw new Error(await response.text());
      setShowPushModal(false);
      setPushTitle("");
      setPushBody("");
      alert('Notifiche inviate a tutti i soci!');
    } catch (e) {
      alert("Errore durante l'invio: " + e.message);
    } finally {
      setPushLoading(false);
    }
  };

  const CONF = {
    soci:        { tabella:"soci",        cols:[{k:"nome",l:"Nome"},{k:"email",l:"Email"},{k:"tipo",l:"Tipo"},{k:"attivo",l:"Attivo"}] },
    eventi:      { tabella:"eventi",      cols:[{k:"titolo",l:"Titolo"},{k:"tipo",l:"Tipo"},{k:"data",l:"Data"},{k:"iscrizioni_aperte",l:"Iscrizioni"}] },
    convenzioni: { tabella:"convenzioni", cols:[{k:"nome",l:"Azienda"},{k:"categoria",l:"Categoria"},{k:"scadenza",l:"Scadenza"},{k:"attiva",l:"Attiva"}] },
    articoli:    { tabella:"articoli",    cols:[{k:"titolo",l:"Titolo"},{k:"autore",l:"Autore"},{k:"data_pub",l:"Data"},{k:"pubblicato",l:"Pubbl."}] },
    podcast:     { tabella:"episodi",     cols:[{k:"titolo",l:"Titolo"},{k:"ospiti",l:"Ospiti"},{k:"data_pub",l:"Data"},{k:"durata",l:"Durata"}] },
  };

  const AGGIUNGI_LABEL = { soci:"+ Aggiungi socio", eventi:"+ Aggiungi evento", convenzioni:"+ Aggiungi convenzione", articoli:"+ Aggiungi articolo", podcast:"+ Aggiungi episodio" };

  const carica = async (tab = sottoTab) => {
    setLoading(true);
    const { data, error } = await supabase.from(CONF[tab].tabella).select('*');
    if (!error && data) setRighe(data);
    setLoading(false);
  };

  useEffect(() => { carica(sottoTab); }, [sottoTab]);

  const elimina = async (r) => {
    const label = r.nome || r.titolo || r.id;
    if (!window.confirm(`Sei sicuro di voler eliminare "${label}"?`)) return;
    await supabase.from(CONF[sottoTab].tabella).delete().eq('id', r.id);
    carica();
  };

  const renderModal = () => {
    if (!modal) return null;
    const rec = modal === "nuovo" ? null : modal;
    const props = { record: rec, onClose: () => setModal(null), onSaved: () => { setModal(null); carica(); } };
    if (sottoTab === "soci")        return <SocioModal {...props} />;
    if (sottoTab === "eventi")      return <EventoModal {...props} />;
    if (sottoTab === "convenzioni") return <ConvenzioneModal {...props} />;
    if (sottoTab === "articoli")    return <ArticoloModal {...props} />;
    if (sottoTab === "podcast")     return <EpisodioModal {...props} />;
  };

  const renderCella = (r, k) => {
    const v = r[k];
    if (typeof v === "boolean" || v === true || v === false)
      return <span style={{ color:v?C.green:C.red, fontSize:13 }}>{v?"✓":"✗"}</span>;
    if (k === "tipo" || k === "categoria")
      return <span style={{ background:`${C.gold}22`, color:C.gold, borderRadius:6, padding:"2px 7px", fontSize:10, fontWeight:600 }}>{v}</span>;
    if (Array.isArray(v))
      return <span style={{ color:C.text }}>{v.map(o => o?.nome || o).join(", ")}</span>;
    if (typeof v === "object" && v !== null)
      return <span style={{ color:C.text }}>{v?.nome || JSON.stringify(v)}</span>;
    return <span style={{ color:C.text }}>{v}</span>;
  };

  const TABS = ["Soci", "Eventi", "Convenzioni", "Articoli", "Podcast"];

  return (
    <div>
      {renderModal()}

      {showPushModal && (
        <div style={{ position:"fixed", inset:0, background:"#000a", zIndex:2000, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ background:C.surface, borderRadius:16, padding:28, width:"90%", maxWidth:400, border:`1px solid ${C.border}` }}>
            <h3 style={{ fontFamily:S, fontSize:18, color:C.text, margin:"0 0 18px" }}>Invia notifica</h3>
            <div style={{ marginBottom:12 }}>
              <label style={{ fontFamily:F, fontSize:12, color:C.muted, display:"block", marginBottom:4 }}>Titolo notifica</label>
              <input value={pushTitle} onChange={e => setPushTitle(e.target.value)} style={{ width:"100%", background:C.bg, border:`1px solid ${C.border}`, borderRadius:8, padding:"9px 12px", color:C.text, fontFamily:F, fontSize:13, boxSizing:"border-box" }} />
            </div>
            <div style={{ marginBottom:20 }}>
              <label style={{ fontFamily:F, fontSize:12, color:C.muted, display:"block", marginBottom:4 }}>Messaggio</label>
              <textarea value={pushBody} onChange={e => setPushBody(e.target.value)} rows={3} style={{ width:"100%", background:C.bg, border:`1px solid ${C.border}`, borderRadius:8, padding:"9px 12px", color:C.text, fontFamily:F, fontSize:13, resize:"vertical", boxSizing:"border-box" }} />
            </div>
            <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
              <button onClick={() => setShowPushModal(false)} style={{ background:"none", border:`1px solid ${C.border}`, borderRadius:8, padding:"8px 16px", color:C.muted, fontFamily:F, fontSize:12, cursor:"pointer" }}>Annulla</button>
              <button onClick={inviaPush} disabled={pushLoading || !pushTitle || !pushBody} style={{ background:C.gold, border:"none", borderRadius:8, padding:"8px 16px", color:C.bg, fontFamily:F, fontSize:12, fontWeight:600, cursor:"pointer", opacity:(pushLoading || !pushTitle || !pushBody)?0.5:1 }}>
                {pushLoading ? "Invio…" : "Invia a tutti i soci"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16, flexWrap:"wrap", gap:8 }}>
        <h2 style={{ fontFamily:S, fontSize:22, color:C.text, margin:0 }}>⚙️ Admin</h2>
        <div style={{ display:"flex", flexDirection:"row", gap:8, flexWrap:"wrap", justifyContent:"flex-end" }}>
          <button onClick={() => setShowPushModal(true)} style={{ background:'none', border:'1px solid #C9A84C', color:'#C9A84C', borderRadius:8, padding:'8px 12px', fontSize:13, cursor:'pointer', marginRight:8 }}>
            🔔 Notifica
          </button>
          <button onClick={() => setModal("nuovo")} style={{ background:C.gold, border:"none", borderRadius:8, padding:"7px 14px", color:C.bg, fontFamily:F, fontSize:12, fontWeight:600, cursor:"pointer" }}>
            {AGGIUNGI_LABEL[sottoTab]}
          </button>
        </div>
      </div>

      <div style={{ display:"flex", gap:6, marginBottom:18 }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setSottoTab(t.toLowerCase())} style={{ flex:1, padding:"8px 0", borderRadius:8, border:`1px solid ${sottoTab===t.toLowerCase()?C.gold:C.border}`, background:sottoTab===t.toLowerCase()?`${C.gold}18`:C.surface, color:sottoTab===t.toLowerCase()?C.gold:C.muted, fontFamily:F, fontSize:11, fontWeight:sottoTab===t.toLowerCase()?600:400, cursor:"pointer" }}>
            {t}
          </button>
        ))}
      </div>

      {loading
        ? <div style={{ textAlign:"center", color:C.muted, fontFamily:F, fontSize:13, paddingTop:30 }}>Caricamento…</div>
        : <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontFamily:F, fontSize:12 }}>
              <thead>
                <tr style={{ borderBottom:`1px solid ${C.border}` }}>
                  {CONF[sottoTab].cols.map(c => (
                    <th key={c.k} style={{ textAlign:"left", padding:"6px 8px", color:C.muted, fontWeight:600, fontSize:11 }}>{c.l}</th>
                  ))}
                  <th style={{ padding:"6px 8px" }} />
                </tr>
              </thead>
              <tbody>
                {righe.map((r, i) => (
                  <tr key={i} style={{ borderBottom:`1px solid ${C.border}22` }}>
                    {CONF[sottoTab].cols.map(c => (
                      <td key={c.k} style={{ padding:"8px 8px", fontSize:12 }}>{renderCella(r, c.k)}</td>
                    ))}
                    <td style={{ padding:"8px 4px" }}>
                      <div style={{ display:"flex", gap:4 }}>
                        <button onClick={() => setModal(r)} style={{ background:"none", border:`1px solid ${C.border}`, borderRadius:6, padding:"3px 8px", color:C.muted, fontFamily:F, fontSize:10, cursor:"pointer" }}>Modifica</button>
                        <button onClick={() => elimina(r)} style={{ background:"none", border:`1px solid ${C.red}44`, borderRadius:6, padding:"3px 8px", color:C.red, fontFamily:F, fontSize:10, cursor:"pointer" }}>Elimina</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {righe.length === 0 && <div style={{ textAlign:"center", color:C.faint, fontFamily:F, fontSize:12, paddingTop:20 }}>Nessun record trovato.</div>}
          </div>
      }
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MODALE RICERCA GLOBALE
// ═══════════════════════════════════════════════════════════════════════════════
function SearchModal({ onClose, onNav }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState({ soci:[], eventi:[], articoli:[], convenzioni:[] });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    if (!q.trim()) { setResults({ soci:[], eventi:[], articoli:[], convenzioni:[] }); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      const term = `%${q.trim()}%`;
      const [r1, r2, r3, r4] = await Promise.all([
        supabase.from('soci').select('id,nome').ilike('nome', term).limit(5),
        supabase.from('eventi').select('id,titolo').ilike('titolo', term).limit(5),
        supabase.from('articoli').select('id,titolo').ilike('titolo', term).limit(5),
        supabase.from('convenzioni').select('id,nome').ilike('nome', term).limit(5),
      ]);
      setResults({
        soci: r1.data || [],
        eventi: r2.data || [],
        articoli: r3.data || [],
        convenzioni: r4.data || [],
      });
      setLoading(false);
    }, 350);
    return () => clearTimeout(t);
  }, [q]);

  const total = results.soci.length + results.eventi.length + results.articoli.length + results.convenzioni.length;
  const cats = [
    { key:"soci",        label:"Soci",        icon:"👥", tab:"soci",        field:"nome" },
    { key:"eventi",      label:"Eventi",      icon:"📅", tab:"eventi",      field:"titolo" },
    { key:"articoli",    label:"Articoli",    icon:"📰", tab:"newsletter",  field:"titolo" },
    { key:"convenzioni", label:"Convenzioni", icon:"🤝", tab:"convenzioni", field:"nome" },
  ];

  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.82)", zIndex:2000, display:"flex", alignItems:"flex-start", justifyContent:"center", paddingTop:56 }}>
      <div onClick={e => e.stopPropagation()} style={{ width:358, maxWidth:"92vw", background:C.bg, border:`1px solid ${C.gold}55`, borderRadius:16, overflow:"hidden", boxShadow:`0 20px 60px rgba(0,0,0,.8), 0 0 0 1px ${C.gold}22` }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 16px", borderBottom:`1px solid ${C.border}` }}>
          <span style={{ fontSize:15, color:C.gold }}>🔍</span>
          <input
            ref={inputRef}
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Cerca soci, eventi, articoli, convenzioni…"
            style={{ flex:1, background:"none", border:"none", outline:"none", color:C.text, fontFamily:F, fontSize:13, caretColor:C.gold }}
          />
          {q && (
            <button onClick={() => setQ("")} style={{ background:"none", border:"none", color:C.muted, fontSize:18, cursor:"pointer", padding:0, lineHeight:1 }}>×</button>
          )}
        </div>
        <div style={{ maxHeight:"65vh", overflowY:"auto" }}>
          {!q.trim() && (
            <div style={{ textAlign:"center", padding:"32px 16px", color:C.faint, fontFamily:F, fontSize:12 }}>
              Inizia a digitare per cercare…
            </div>
          )}
          {q.trim() && loading && (
            <div style={{ textAlign:"center", padding:"24px", color:C.muted, fontFamily:F, fontSize:12 }}>Ricerca in corso…</div>
          )}
          {q.trim() && !loading && total === 0 && (
            <div style={{ textAlign:"center", padding:"24px", color:C.faint, fontFamily:F, fontSize:12 }}>Nessun risultato per «{q}»</div>
          )}
          {q.trim() && !loading && cats.map(cat => {
            const items = results[cat.key];
            if (!items.length) return null;
            return (
              <div key={cat.key}>
                <div style={{ padding:"10px 16px 6px", fontSize:10, color:C.gold, fontFamily:F, fontWeight:600, letterSpacing:1.2, textTransform:"uppercase", borderTop:`1px solid ${C.border}` }}>
                  {cat.icon} {cat.label}
                </div>
                {items.map(item => (
                  <button
                    key={item.id}
                    onClick={() => { onNav(cat.tab, item.id); onClose(); }}
                    style={{ width:"100%", textAlign:"left", background:"none", border:"none", padding:"10px 16px 10px 28px", color:C.text, fontFamily:F, fontSize:13, cursor:"pointer", display:"block", borderBottom:`1px solid ${C.border}22`, transition:"background .15s" }}
                    onMouseEnter={e => e.currentTarget.style.background = C.goldDim}
                    onMouseLeave={e => e.currentTarget.style.background = "none"}
                  >
                    {item[cat.field]}
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("home");
  const [role, setRole] = useState("ordinario");
  const [session, setSession] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const isAdmin = role === "direttivo";
  const isSuperAdmin = session?.user?.email === "jj@suncapital.it";
  const [socioProfilo, setSocioProfilo] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [deepLink, setDeepLink] = useState(null);

useEffect(() => {
  if (!session) return;
  async function caricaProfilo() {
    const { data } = await supabase
      .from('soci')
      .select('*')
      .eq('email', session.user.email)
      .single();
    if (data) {
      setSocioProfilo(data);
      setRole(data.tipo || 'ordinario');
      subscribeToPush(session.user.id).catch(() => {});
    }
  }
  caricaProfilo();
}, [session]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setCheckingAuth(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (checkingAuth) return (
    <div style={{ display:"flex", justifyContent:"center", alignItems:"center", minHeight:"100vh", background:"#080605" }}>
      <div style={{ fontFamily:S, fontSize:20, color:C.gold }}>UNIIC</div>
    </div>
  );

  if (!session) return <LoginScreen onLogin={() => {}} />;

  const renderSection = () => {
    switch(tab) {
      case "home":        return <HomeSection onNav={setTab} role={role} socioProfilo={socioProfilo} />;
      case "soci":        return <SociSection role={role} openId={deepLink?.tab==="soci" ? deepLink.id : null} onOpenHandled={()=>setDeepLink(null)} />;
      case "convenzioni": return <ConvenzioniSection role={role} isAdmin={isAdmin} openId={deepLink?.tab==="convenzioni" ? deepLink.id : null} onOpenHandled={()=>setDeepLink(null)} />;
      case "eventi":      return <EventiSection isAdmin={isAdmin} socioProfilo={socioProfilo} openId={deepLink?.tab==="eventi" ? deepLink.id : null} onOpenHandled={()=>setDeepLink(null)} />;
      case "newsletter":  return <NewsletterSection role={role} isAdmin={isAdmin} socioProfilo={socioProfilo} openId={deepLink?.tab==="newsletter" ? deepLink.id : null} onOpenHandled={()=>setDeepLink(null)} />;
      case "podcast":     return <PodcastSection role={role} isAdmin={isAdmin} socioProfilo={socioProfilo} />;
      case "account":     return <AccountSection socioProfilo={socioProfilo} session={session} />;
      case "admin":       return isSuperAdmin ? <AdminSection socioProfilo={socioProfilo} session={session} /> : null;
      default:            return null;
    }
  };

  const logout = async () => { await supabase.auth.signOut(); };

  return (
    <div style={{ display:"flex", justifyContent:"center", alignItems:"center", minHeight:"100vh", background:"#080605" }}>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Montserrat:wght@400;500;600&display=swap" rel="stylesheet" />
      <div style={{ width:390, minHeight:"100vh", maxHeight:"100vh", background:C.bg, display:"flex", flexDirection:"column", boxShadow:"0 0 80px rgba(0,0,0,.85)", overflow:"hidden", position:"relative" }}>
        <div style={{ background:C.surface, padding:"10px 18px 8px", borderBottom:`1px solid ${C.border}`, display:"flex", justifyContent:"space-between", alignItems:"center", flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:32, height:32, background:C.red, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>🐉</div>
            <div>
              <div style={{ fontFamily:S, fontSize:16, color:C.text, fontWeight:700, lineHeight:1 }}>UNIIC</div>
              <div style={{ fontSize:8, color:C.gold, fontFamily:F, letterSpacing:1 }}>中意商联</div>
            </div>
          </div>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <button onClick={() => setShowSearch(true)} style={{ background:"none", border:`1px solid ${C.gold}44`, borderRadius:8, padding:"4px 9px", color:C.gold, fontFamily:F, fontSize:14, cursor:"pointer", lineHeight:1 }} title="Cerca">🔍</button>
            <div style={{ width:8, height:8, background:C.green, borderRadius:"50%" }} />
            <button onClick={logout} style={{ background:"none", border:`1px solid ${C.border}`, borderRadius:8, padding:"4px 10px", color:C.muted, fontFamily:F, fontSize:11, cursor:"pointer" }}>Esci</button>
          </div>
        </div>
        <div style={{ flex:1, overflowY:"auto", padding:"18px 16px 80px" }}>
          {renderSection()}
        </div>
        {showSearch && <SearchModal onClose={() => setShowSearch(false)} onNav={(tab, id) => { setTab(tab); if (id) setDeepLink({ tab, id }); }} />}
        <div style={{ position:"absolute", bottom:0, left:0, right:0, background:C.surface, borderTop:`1px solid ${C.border}`, display:"flex", padding:"8px 0 10px", flexShrink:0 }}>
          {[{id:"home",label:"Home",icon:"🏠"},{id:"soci",label:"Soci",icon:"👥"},{id:"convenzioni",label:"Convenzioni",icon:"🤝"},{id:"eventi",label:"Eventi",icon:"📅"},{id:"newsletter",label:"News",icon:"📰"},{id:"podcast",label:"Podcast",icon:"🎙️"},{id:"account",label:"Account",icon:"👤"},...(isSuperAdmin?[{id:"admin",label:"Admin",icon:"⚙️"}]:[])].map(n => (
            <button key={n.id} onClick={() => setTab(n.id)} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:2, background:"none", border:"none", cursor:"pointer", padding:"4px 0" }}>
              <span style={{ fontSize:18 }}>{n.icon}</span>
              <span style={{ fontSize:9, fontFamily:F, color:tab===n.id?C.red:C.muted, fontWeight:tab===n.id?600:400 }}>{n.label}</span>
              {tab===n.id && <div style={{ width:14, height:2, background:C.red, borderRadius:2 }} />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}