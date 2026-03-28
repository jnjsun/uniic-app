import { useState, useMemo, useEffect, useRef } from "react";

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

const SOCI_D = [
  { id:1,initials:"CW",colorAccent:C.red,nome:"Chen Wei",eta:42,nazionalita:"Italo-cinese",citta:"Milano",
    email:"chen.wei@cwimport.it",telefono:"+39 02 1234567",linkedin:"linkedin.com/in/chenwei",
    impresa_nome:"CW Import Export SRL",impresa_settore:"Import/Export",impresa_sito:"cwimport.it",piva:"IT04521830152",
    ruolo_uniic:"Direttivo",tipo:"direttivo",anno_iscritto:2021,hobby:["Tennis","Fotografia"],
    famiglia:{coniuge:"Lin Mei",figli:2},
    storico:[{anno:2021,quota:"€ 300",stato:"Pagato",tipo:"Ordinario"},{anno:2022,quota:"€ 300",stato:"Pagato",tipo:"Ordinario"},{anno:2023,quota:"€ 500",stato:"Pagato",tipo:"Sostenitore"},{anno:2024,quota:"€ 500",stato:"Pagato",tipo:"Sostenitore"},{anno:2025,quota:"€ 800",stato:"Pagato",tipo:"Direttivo"}] },
  { id:2,initials:"WB",colorAccent:"#8E44AD",nome:"Wu Biman",eta:38,nazionalita:"Cinese",citta:"Prato",
    email:"biman@wufashion.it",telefono:"+39 0574 987654",linkedin:"linkedin.com/in/wubiman",
    impresa_nome:"Wu Fashion Milano SRL",impresa_settore:"Moda & Tessile",impresa_sito:"wufashion.it",piva:"IT07823940487",
    ruolo_uniic:"Consigliere",tipo:"direttivo",anno_iscritto:2020,hobby:["Moda sostenibile","Yoga"],
    famiglia:{coniuge:"Zhou Xian",figli:1},
    storico:[{anno:2020,quota:"€ 300",stato:"Pagato",tipo:"Ordinario"},{anno:2021,quota:"€ 300",stato:"Pagato",tipo:"Ordinario"},{anno:2022,quota:"€ 500",stato:"Pagato",tipo:"Sostenitore"},{anno:2025,quota:"€ 800",stato:"Pagato",tipo:"Direttivo"}] },
  { id:3,initials:"LJ",colorAccent:"#E67E22",nome:"Lin Jie",eta:45,nazionalita:"Italo-cinese",citta:"Milano",
    email:"lin.jie@lamian.it",telefono:"+39 02 9876543",linkedin:"linkedin.com/in/linjie",
    impresa_nome:"Lamian SRL",impresa_settore:"Ristorazione",impresa_sito:"lamian.it",piva:"IT09234560152",
    ruolo_uniic:"Sostenitore",tipo:"sostenitore",anno_iscritto:2022,hobby:["Cucina","Golf"],
    famiglia:{coniuge:"Zhang Fang",figli:3},
    storico:[{anno:2022,quota:"€ 300",stato:"Pagato",tipo:"Ordinario"},{anno:2025,quota:"€ 500",stato:"Pagato",tipo:"Sostenitore"}] },
  { id:4,initials:"ZF",colorAccent:"#16A085",nome:"Zhang Fan",eta:51,nazionalita:"Cinese",citta:"Roma",
    email:"z.fan@zhanglogistics.it",telefono:"+39 06 5432109",linkedin:"linkedin.com/in/zhangfan",
    impresa_nome:"Zhang Logistics SRL",impresa_settore:"Logistica",impresa_sito:"zhanglogistics.it",piva:"IT11456780581",
    ruolo_uniic:"Sostenitore",tipo:"sostenitore",anno_iscritto:2019,hobby:["Scacchi","Ciclismo"],
    famiglia:{coniuge:null,figli:1,note:"Vedovo"},
    storico:[{anno:2019,quota:"€ 150",stato:"Pagato",tipo:"Ordinario"},{anno:2025,quota:"€ 500",stato:"Pagato",tipo:"Sostenitore"}] },
  { id:5,initials:"HY",colorAccent:"#C0392B",nome:"Hu Yinyi",eta:34,nazionalita:"Cinese",citta:"Firenze",
    email:"hu.yinyi@haruka.it",telefono:"+39 055 6543210",linkedin:"",
    impresa_nome:"Haruka di Hu Yinyi",impresa_settore:"Estetica & Benessere",impresa_sito:"",piva:"IT04987650488",
    ruolo_uniic:"Ordinario",tipo:"ordinario",anno_iscritto:2023,hobby:["Pittura","Meditazione"],
    famiglia:{coniuge:null,figli:0,note:"Nubile"},
    storico:[{anno:2023,quota:"€ 300",stato:"Pagato",tipo:"Ordinario"},{anno:2025,quota:"€ 300",stato:"In attesa",tipo:"Ordinario"}] },
  { id:6,initials:"ZL",colorAccent:"#2471A3",nome:"Zhao Liuchao",eta:47,nazionalita:"Italo-cinese",citta:"Milano",
    email:"zhao@worldmart.it",telefono:"+39 02 3456789",linkedin:"linkedin.com/in/zhaoliuchao",
    impresa_nome:"Worldmart SRL",impresa_settore:"GDO & Retail",impresa_sito:"worldmart.it",piva:"IT08765430152",
    ruolo_uniic:"Sostenitore",tipo:"sostenitore",anno_iscritto:2020,hobby:["Tennis","Vino"],
    famiglia:{coniuge:"Xu Min",figli:2},
    storico:[{anno:2020,quota:"€ 300",stato:"Pagato",tipo:"Ordinario"},{anno:2025,quota:"€ 500",stato:"Pagato",tipo:"Sostenitore"}] },
];
const MSGS_D = {
  2:[{da:"me",testo:"Ciao Biman, hai visto il programma del Forum?",ora:"ieri 18:42"},{da:"loro",testo:"Sì, sono già iscritta!",ora:"ieri 19:10"}],
  3:[{da:"loro",testo:"Chen, puoi passarmi i contatti del fornitore di vini?",ora:"lun 10:15"},{da:"me",testo:"Certo, ti mando tutto.",ora:"lun 10:45"}],
};

// ─── EVENTI ───────────────────────────────────────────────────────────────────
const EV_TIPI = {
  forum:        {label:"Forum",         color:C.red,    icon:"🏛️"},
  gala:         {label:"Gala",          color:C.gold,   icon:"✨"},
  workshop:     {label:"Workshop",      color:C.blue,   icon:"🎓"},
  istituzionale:{label:"Istituzionale", color:C.orange, icon:"🏮"},
  networking:   {label:"Networking",    color:C.green,  icon:"🤝"},
};
const EVENTI_D = [
  { id:1,tipo:"forum",accesso:"tutti",titolo:"UNIIC Forum 2026",dataLabel:"15 Aprile 2026",data:"2026-04-15",orario:"09:00–18:00",luogo:"Palazzo Reale, Milano",prezzo:0,posti:120,iscritti:112,waitlist:[],
    desc:"Grande appuntamento annuale. Tavole rotonde, relatori istituzionali e cocktail di chiusura.",
    programma:[{ora:"09:00",voce:"Registrazione e welcome coffee"},{ora:"10:00",voce:"Apertura istituzionale"},{ora:"11:00",voce:"Tavola rotonda: Commercio Italia-Cina"},{ora:"13:00",voce:"Pranzo networking"},{ora:"17:30",voce:"Cocktail di chiusura"}],
    iscrizioni:[{id:1,nome:"Chen Wei",tipo:"direttivo",ospiti:0,pagato:true,importo:0,giorno:"10/02",stato:"confermato"},{id:2,nome:"Wu Biman",tipo:"direttivo",ospiti:1,pagato:true,importo:0,giorno:"12/02",stato:"confermato"},{id:3,nome:"Lin Jie",tipo:"sostenitore",ospiti:0,pagato:false,importo:0,giorno:"01/03",stato:"in attesa pag."}],
    tavoli:null,survey:{inviato:false,risposte:0,media:null} },
  { id:2,tipo:"gala",accesso:"sostenitore",titolo:"UNIIC Gala Night 2026",dataLabel:"22 Maggio 2026",data:"2026-05-22",orario:"19:30–00:00",luogo:"Four Seasons Hotel, Milano",prezzo:180,posti:80,iscritti:78,waitlist:["Zhao Liuchao","Sun Jian"],
    desc:"La cena di gala più attesa. Dress code: Black tie. Menu degustazione con vini selezionati.",
    programma:[{ora:"19:30",voce:"Cocktail di benvenuto"},{ora:"20:30",voce:"Cena di gala"},{ora:"22:30",voce:"Premiazioni UNIIC 2026"},{ora:"23:00",voce:"Musica dal vivo"}],
    iscrizioni:[{id:1,nome:"Chen Wei",tipo:"direttivo",ospiti:1,pagato:true,importo:360,giorno:"01/03",stato:"confermato"},{id:2,nome:"Wu Biman",tipo:"direttivo",ospiti:0,pagato:true,importo:180,giorno:"05/03",stato:"confermato"},{id:3,nome:"Lin Jie",tipo:"sostenitore",ospiti:0,pagato:false,importo:180,giorno:"10/03",stato:"in attesa pag."}],
    tavoli:[{nome:"Tavolo Presidenza",posti:10,liberi:4},{nome:"Tavolo Sostenitori A",posti:10,liberi:6}],
    survey:{inviato:true,risposte:34,media:4.6} },
  { id:3,tipo:"workshop",accesso:"tutti",titolo:"Workshop: Export in Cina",dataLabel:"10 Giugno 2026",data:"2026-06-10",orario:"14:00–17:30",luogo:"Talent Garden, Milano",prezzo:50,posti:40,iscritti:28,waitlist:[],
    desc:"Normative doganali, canali digitali (Tmall, JD.com) e strategie di marketing.",
    programma:[{ora:"14:00",voce:"Il mercato cinese nel 2026"},{ora:"14:30",voce:"Normative e certificazioni"},{ora:"15:15",voce:"Canali digitali"},{ora:"17:00",voce:"Q&A e networking"}],
    iscrizioni:[{id:1,nome:"Hu Yinyi",tipo:"ordinario",ospiti:0,pagato:true,importo:50,giorno:"20/04",stato:"confermato"}],
    tavoli:null,survey:{inviato:false,risposte:0,media:null} },
  { id:4,tipo:"networking",accesso:"tutti",titolo:"Aperitivo di Primavera UNIIC",dataLabel:"2 Aprile 2026",data:"2026-04-02",orario:"18:30–21:00",luogo:"Chateau Du Fan, Via Sarpi, Milano",prezzo:0,posti:60,iscritti:44,waitlist:[],
    desc:"Aperitivo informale offerto dall'associazione. Perfetto per nuovi contatti.",
    programma:[{ora:"18:30",voce:"Arrivo e registrazione"},{ora:"19:00",voce:"Speed networking"},{ora:"20:00",voce:"Aperitivo libero"}],
    iscrizioni:[{id:1,nome:"Hu Yinyi",tipo:"ordinario",ospiti:0,pagato:true,importo:0,giorno:"15/03",stato:"confermato"}],
    tavoli:null,survey:{inviato:false,risposte:0,media:null} },
  { id:5,tipo:"istituzionale",accesso:"tutti",titolo:"Capodanno Cinese 2027",dataLabel:"29 Gennaio 2027",data:"2027-01-29",orario:"18:00–23:00",luogo:"Teatro Dal Verme, Milano",prezzo:120,posti:300,iscritti:87,waitlist:[],
    desc:"Celebrazione del nuovo anno lunare. Performance tradizionali, cena di gala e brindisi.",
    programma:[{ora:"18:00",voce:"Cocktail di benvenuto"},{ora:"19:00",voce:"Danza del drago"},{ora:"20:00",voce:"Cena di gala"},{ora:"22:45",voce:"Countdown anno nuovo"}],
    iscrizioni:[{id:1,nome:"Chen Wei",tipo:"direttivo",ospiti:2,pagato:true,importo:360,giorno:"01/10",stato:"confermato"}],
    tavoli:null,survey:{inviato:false,risposte:0,media:null} },
];

// ─── CONVENZIONI ──────────────────────────────────────────────────────────────
const CONV_D = [
  { id:1,attiva:true,nuova:true,nome:"Banca Intesa Sanpaolo",categoria:"Banca",citta:"Milano",accesso:"tutti",icon:"🏦",colore:"#1a5276",
    titolo_breve:"Canone zero + tasso agevolato mutui",desc:"Conto corrente Business a canone zero. Tasso preferenziale su finanziamenti commerciali.",
    condizioni:"Valido per nuove aperture entro il 31/12/2026. Non cumulabile con altre promozioni.",
    scadenza:"31/12/2026",attivazione:"contatto",codice:null,link:null,
    contatto_nome:"Filiale Milano Sarpi",contatto_tel:"02 8788 1000",contatto_email:"sarpi@intesasanpaolo.it",
    utilizzi:34,preferiti:12,statistiche:{mensili:[8,12,15,22,28,34],mesi:["Ott","Nov","Dic","Gen","Feb","Mar"]} },
  { id:2,attiva:true,nuova:false,nome:"Generali Assicurazioni",categoria:"Assicurazione",citta:"Milano",accesso:"sostenitore",icon:"🛡️",colore:"#922b21",
    titolo_breve:"Sconto 20% su polizze aziendali",desc:"Sconto su RC Professionale, Tutela Legale e Multirischio per imprese.",
    condizioni:"Sconto applicabile al rinnovo o nuova stipula. Solo per titolari di impresa.",
    scadenza:"30/06/2026",attivazione:"codice",codice:"UNIIC-GEN-2026",link:null,
    contatto_nome:"Agenzia Milano Centro",contatto_tel:"02 7600 4321",contatto_email:"milano@generali.it",
    utilizzi:21,preferiti:18,statistiche:{mensili:[3,5,7,10,14,21],mesi:["Ott","Nov","Dic","Gen","Feb","Mar"]} },
  { id:3,attiva:true,nuova:false,nome:"Studio Scaletti & Associati",categoria:"Legale",citta:"Milano",accesso:"tutti",icon:"⚖️",colore:"#1e8449",
    titolo_breve:"Prima consulenza legale gratuita",desc:"Un'ora di consulenza gratuita. Tariffe ridotte del 15% su pratiche societarie. Supporto bilingue.",
    condizioni:"Prima consulenza di 60 minuti gratuita. Successivi interventi con tariffa agevolata del 15%.",
    scadenza:"31/12/2026",attivazione:"link",codice:null,link:"https://scaletti-notai.it/uniic",
    contatto_nome:"Studio Scaletti",contatto_tel:"02 7654 9832",contatto_email:"info@scaletti-notai.it",
    utilizzi:47,preferiti:29,statistiche:{mensili:[5,9,14,22,31,47],mesi:["Ott","Nov","Dic","Gen","Feb","Mar"]} },
  { id:4,attiva:true,nuova:true,nome:"Atlas SRL – Software Gestionale",categoria:"Tech",citta:"Tutte",accesso:"tutti",icon:"💻",colore:"#1f618d",
    titolo_breve:"Licenza Premium gratuita 12 mesi",desc:"Software gestionale cloud per PMI. Interfaccia in italiano e cinese.",
    condizioni:"Licenza Premium gratuita per il primo anno (valore €890). Dal secondo anno -30%.",
    scadenza:"30/09/2026",attivazione:"codice",codice:"ATLAS-UNIIC-PRO",link:"https://atlassrl.it/uniic",
    contatto_nome:"Atlas SRL – Sales",contatto_tel:"02 9823 1100",contatto_email:"support@atlassrl.it",
    utilizzi:19,preferiti:22,statistiche:{mensili:[1,3,6,10,14,19],mesi:["Ott","Nov","Dic","Gen","Feb","Mar"]} },
  { id:5,attiva:true,nuova:false,nome:"Hotel Gallia Milano",categoria:"Hospitality",citta:"Milano",accesso:"sostenitore",icon:"🏨",colore:"#b7950b",
    titolo_breve:"Tariffa corporate -25% + Spa inclusa",desc:"Tariffa esclusiva per soggiorni soci UNIIC con accesso Spa e late check-out.",
    condizioni:"Prenotazione minimo 72h prima. Non cumulabile con offerte flash.",
    scadenza:"31/03/2027",attivazione:"codice",codice:"UNIIC-GALLIA25",link:"https://gallia.it/uniic",
    contatto_nome:"Hotel Gallia – Corporate",contatto_tel:"02 6785 1234",contatto_email:"corporate@gallia.it",
    utilizzi:15,preferiti:31,statistiche:{mensili:[1,3,5,8,11,15],mesi:["Ott","Nov","Dic","Gen","Feb","Mar"]} },
  { id:6,attiva:false,nuova:false,nome:"Centro Medico Liren",categoria:"Salute",citta:"Milano",accesso:"tutti",icon:"🏥",colore:"#1a7a4a",
    titolo_breve:"Visita specialistica a tariffa ridotta",desc:"Centro medico bilingue. Tariffa ridotta del 25% su visite specialistiche. Sospesa per rinnovo.",
    condizioni:"Convenzione temporaneamente sospesa. Ripresa prevista entro giugno 2026.",
    scadenza:"30/06/2026",attivazione:"contatto",codice:null,link:null,
    contatto_nome:"Centro Medico Liren",contatto_tel:"02 3456 1122",contatto_email:"info@centroliren.it",
    utilizzi:8,preferiti:6,statistiche:{mensili:[1,2,3,4,6,8],mesi:["Ott","Nov","Dic","Gen","Feb","Mar"]} },
];
const CONV_PROPOSTE_D = [
  { id:101,stato:"in_attesa",data:"15/03/2026",socio:"Lin Jie",avatar:"LJ",colore:"#E67E22",nome:"Lamian SRL",categoria:"F&B",citta:"Milano",desc:"Sconto del 15% su tutti i pasti per i soci UNIIC nel nostro ristorante di Via Sarpi.",contatto:"lin.jie@lamian.it" },
  { id:102,stato:"in_attesa",data:"20/03/2026",socio:"Zhao Liuchao",avatar:"ZL",colore:"#2471A3",nome:"Worldmart SRL",categoria:"F&B",citta:"Milano",desc:"Distribuzione prodotti alimentari asiatici all'ingrosso. Sconto del 20% per soci UNIIC.",contatto:"zhao@worldmart.it" },
  { id:103,stato:"approvata",data:"05/03/2026",socio:"Hu Yinyi",avatar:"HY",colore:"#C0392B",nome:"Haruka di Hu Yinyi",categoria:"Salute",citta:"Firenze",desc:"Trattamenti estetici con sconto del 30% per i soci UNIIC.",contatto:"hu.yinyi@haruka.it" },
];
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
const NEWS_D = [
  { id:1,tipo:"articolo",categoria:"uniic",accesso:"tutti",
    titolo:"UNIIC al Forum italo-cinese di Roma: le nostre proposte",occhiello:"Report dall'evento",
    testo:"La delegazione UNIIC ha partecipato al Forum Bilaterale Italia-Cina di Roma con una presenza istituzionale di primo piano. Il Presidente Chen Wei ha presentato un documento programmatico in cinque punti.\n\nDurante i lavori, UNIIC ha incontrato rappresentanti del Ministero del Made in Italy, della Camera di Commercio Italia-Cina e diverse delegazioni regionali cinesi. Il confronto ha portato all'avvio di tre tavoli di lavoro permanenti.\n\nIl prossimo appuntamento è a Shanghai a giugno 2026.",
    autore:"Redazione UNIIC",data:"2026-03-25",dataObj:"2026-03-25",
    pubblicato:true,letture:312,tempoLettura:"4 min",salvatiBool:false,
    reazioni:{fire:14,clap:22,like:41},
    commenti:[{autore:"Wu Biman",avatar:"WB",colore:"#8E44AD",testo:"Ottimo risultato!",data:"25/03"}],
    img:"🏛️",fonte:null },
  { id:2,tipo:"rassegna",categoria:"geopolitica",accesso:"tutti",
    titolo:"Dazi USA-Cina 2026: impatto concreto sulle PMI italo-cinesi",occhiello:"Rassegna stampa · Sole 24 Ore, Reuters",
    testo:"La nuova tornata di dazi americani sui prodotti cinesi crea uno scenario complesso. Secondo Reuters, i settori più colpiti in Italia saranno elettronica di consumo e componentistica auto.\n\nIl Sole 24 Ore segnala opportunità per le imprese italiane che esportano in Cina: la svalutazione del renminbi rende i prodotti italiani relativamente meno cari.\n\nRaccomandazione: diversificare i fornitori su più paesi per ridurre la concentrazione di rischio.",
    autore:"Rassegna a cura di Redazione UNIIC",data:"2026-03-22",dataObj:"2026-03-22",
    pubblicato:true,letture:489,tempoLettura:"6 min",salvatiBool:true,
    reazioni:{fire:8,clap:17,like:56},
    commenti:[{autore:"Lin Jie",avatar:"LJ",colore:"#E67E22",testo:"Analisi molto utile!",data:"22/03"}],
    img:"🌐",fonte:"Sole 24 Ore · Reuters · Xinhua" },
  { id:3,tipo:"fotoreport",categoria:"fotoreport",accesso:"tutti",
    titolo:"Gala Night 2025: i momenti più belli della serata",occhiello:"Foto Report · 18 novembre 2025",
    testo:"Una serata indimenticabile al Four Seasons di Milano ha riunito oltre 120 soci UNIIC.\n\nMomento clou: le premiazioni annuali con il riconoscimento 'Imprenditore dell'Anno' assegnato a Zhao Liuchao.\n\nLa serata si è conclusa con musica dal vivo e brindisi di auguri.",
    autore:"Foto: Studio Visivo Milano",data:"2025-11-25",dataObj:"2025-11-25",
    pubblicato:true,letture:701,tempoLettura:"2 min",salvatiBool:false,
    reazioni:{fire:38,clap:54,like:89},
    commenti:[{autore:"Chen Wei",avatar:"CW",colore:C.red,testo:"Serata memorabile!",data:"25/11"}],
    foto:["🥂","🍽️","🎤","🏆","🎵","🌟"],img:"📸",fonte:null },
  { id:4,tipo:"comunicato",categoria:"comunicato",accesso:"tutti",
    titolo:"Convocazione Assemblea Ordinaria – 15 Aprile 2026",occhiello:"Comunicato ufficiale",
    testo:"Il Presidente convoca i Soci all'Assemblea Ordinaria il 15 Aprile 2026, ore 9:00, presso Palazzo Reale, Milano.\n\nORDINE DEL GIORNO:\n1. Approvazione bilancio consuntivo 2025\n2. Bilancio preventivo 2026-2029\n3. Relazione del Presidente\n4. Programma Presidenza 2026-2029\n5. Varie ed eventuali",
    autore:"Segreteria UNIIC",data:"2026-03-15",dataObj:"2026-03-15",
    pubblicato:true,letture:156,tempoLettura:"2 min",salvatiBool:false,
    reazioni:{fire:2,clap:5,like:28},commenti:[],img:"📋",fonte:null },
  { id:5,tipo:"flash",categoria:"flash",accesso:"tutti",
    titolo:"⚡ Nuova partnership UNIIC-Confcommercio Milano",occhiello:"Flash News",
    testo:"Firmato oggi l'accordo annuale con Confcommercio Milano. I soci UNIIC avranno accesso gratuito a tutti i corsi di formazione del catalogo 2026 (oltre 40 corsi su digitale, fiscalità, export e management).",
    autore:"Redazione UNIIC",data:"2026-03-15",dataObj:"2026-03-15",
    pubblicato:true,letture:198,tempoLettura:"1 min",salvatiBool:false,
    reazioni:{fire:11,clap:24,like:38},commenti:[],img:"🤝",fonte:null },
  { id:6,tipo:"articolo",categoria:"finanza",accesso:"sostenitore",
    titolo:"Renminbi digitale: guida pratica per chi fa business con la Cina",occhiello:"Finanza · Contenuto esclusivo Sostenitore",
    testo:"Il roll-out dell'e-CNY accelera nel 2026. I pagamenti in e-CNY bypassano il sistema SWIFT, riducendo i tempi da 3-5 giorni a poche ore.\n\nAlcune banche italiane (tra cui Intesa Sanpaolo, convenzionata UNIIC) stanno già attivando wallet dedicati per clienti business.\n\nAttenzione: le operazioni sono tracciate in tempo reale. Consultare un professionista per la compliance fiscale cross-border.",
    autore:"Avv. Giuseppe Scaletti",data:"2026-03-10",dataObj:"2026-03-10",
    pubblicato:true,letture:89,tempoLettura:"7 min",salvatiBool:false,
    reazioni:{fire:6,clap:12,like:21},
    commenti:[{autore:"Chen Wei",avatar:"CW",colore:C.red,testo:"Articolo fondamentale.",data:"11/03"}],
    img:"💱",fonte:null },
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
const EPISODI_D = [
  { id:1,ep:14,formato:"intervista",accesso:"tutti",titolo:"Il futuro dell'import-export italo-cinese dopo i nuovi dazi",
    ospiti:[{nome:"Zhang Fan",ruolo:"CEO Zhang Logistics SRL",avatar:"ZF",colore:"#16A085"}],conduttore:"Chen Wei",
    desc:"Conversazione con Zhang Fan sugli scenari aperti dai dazi americani e sulle strategie per proteggere le supply chain nel 2026.",
    temi:["Import/Export","Logistica","Geopolitica"],durata:"48:22",data:"2026-03-20",dataObj:"2026-03-20",
    spotify:"https://open.spotify.com/episode/...",youtube:"https://youtube.com/watch?v=...",
    ascolti:1240,salvataggi:89,stelleMedia:4.7,nRecensioni:34,
    risorse:[{testo:"Report ICE: Export Italia-Cina 2025",url:"#"},{testo:"Guida doganale UNIIC 2026 (PDF)",url:"#"}],
    trascrizione:"Zhang Fan: Quello che stiamo vedendo è una biforcazione del mercato. Da un lato produttori cinesi che cercano rientro in Europa tramite intermediari italiani.\n\nChen Wei: Esatto. E questa è la nicchia che UNIIC può occupare. Essere il ponte qualificato tra i due sistemi.",
    commenti:[{autore:"Lin Jie",avatar:"LJ",colore:"#E67E22",stelle:5,testo:"Episodio fondamentale.",data:"21/03"}],
    pubblicato:true },
  { id:2,ep:13,formato:"intervista",accesso:"tutti",titolo:"Imprenditoria femminile tra due culture: sfide e opportunità",
    ospiti:[{nome:"Wu Biman",ruolo:"Founder Wu Fashion Milano SRL",avatar:"WB",colore:"#8E44AD"}],conduttore:"Chen Wei",
    desc:"Wu Biman racconta il suo percorso da immigrata di prima generazione a imprenditrice di successo nel settore moda.",
    temi:["Moda","Made in Italy","Cultura"],durata:"41:15",data:"2026-03-06",dataObj:"2026-03-06",
    spotify:"https://open.spotify.com/episode/...",youtube:"https://youtube.com/watch?v=...",
    ascolti:890,salvataggi:61,stelleMedia:4.8,nRecensioni:27,risorse:[{testo:"Wu Fashion Milano – Sito ufficiale",url:"#"}],
    trascrizione:"Wu Biman: Quando ho aperto nel 2015, nessuna banca mi dava un fido. Non perché il business plan fosse sbagliato, ma perché ero cinese, ero donna e non avevo una rete di relazioni.\n\nChen Wei: E oggi, dieci anni dopo?\n\nWu Biman: Oggi esporto in Cina il made in Italy. Il giro si è completamente ribaltato.",
    commenti:[{autore:"Hu Yinyi",avatar:"HY",colore:"#C0392B",stelle:5,testo:"Wu Biman è un'ispirazione.",data:"07/03"}],
    pubblicato:true },
  { id:3,ep:12,formato:"tavolarotonda",accesso:"tutti",titolo:"Navigare il sistema fiscale italiano: tutto quello che devi sapere",
    ospiti:[{nome:"Avv. Giuseppe Scaletti",ruolo:"Studio Scaletti & Associati",avatar:"GS",colore:"#1e8449"},{nome:"Lin Jie",ruolo:"Socio UNIIC",avatar:"LJ",colore:"#E67E22"}],conduttore:"Chen Wei",
    desc:"Tavola rotonda pratica: dai regimi fiscali più convenienti per le PMI alle novità 2026 su IVA e concordato preventivo.",
    temi:["Normative","Finanza"],durata:"55:44",data:"2026-02-20",dataObj:"2026-02-20",
    spotify:"https://open.spotify.com/episode/...",youtube:"https://youtube.com/watch?v=...",
    ascolti:2100,salvataggi:178,stelleMedia:4.9,nRecensioni:67,
    risorse:[{testo:"Guida fiscale per imprenditori cinesi in Italia (PDF)",url:"#"},{testo:"Studio Scaletti – Contatti",url:"#"}],
    trascrizione:"Avv. Scaletti: Il concordato preventivo biennale è la novità più importante del 2026 per le PMI.\n\nLin Jie: Io l'ho già aderito. Dopo vent'anni di ansie ogni volta che arrivava una lettera dall'Agenzia, finalmente dormo tranquillo.",
    commenti:[{autore:"Zhang Fan",avatar:"ZF",colore:"#16A085",stelle:5,testo:"L'episodio più utile della serie.",data:"21/02"}],
    pubblicato:true },
  { id:4,ep:11,formato:"spotlight",accesso:"tutti",titolo:"Moda e Made in Italy: la visione di chi vende in Cina",
    ospiti:[{nome:"Lin Jie",ruolo:"Fondatore Lamian SRL",avatar:"LJ",colore:"#E67E22"}],conduttore:"Wu Biman",
    desc:"Lin Jie racconta come ha trasformato una piccola attività di import in un bridge tra artigiani italiani e buyer cinesi.",
    temi:["Moda","Made in Italy","Import/Export"],durata:"37:08",data:"2026-02-06",dataObj:"2026-02-06",
    spotify:"https://open.spotify.com/episode/...",youtube:"https://youtube.com/watch?v=...",
    ascolti:756,salvataggi:42,stelleMedia:4.5,nRecensioni:19,risorse:[{testo:"Lamian SRL – Portfolio prodotti",url:"#"}],
    trascrizione:"Lin Jie: Il segreto è il rapporto diretto con l'artigiano. Il buyer cinese vuole la storia, vuole il volto, vuole il laboratorio.",
    commenti:[],pubblicato:true },
  { id:5,ep:15,formato:"report",accesso:"sostenitore",titolo:"Report esclusivo: UNIIC al Forum di Roma – cosa è emerso davvero",
    ospiti:[{nome:"Chen Wei",ruolo:"Presidente UNIIC",avatar:"CW",colore:C.red}],conduttore:"Wu Biman",
    desc:"Debriefing riservato ai soci Sostenitore+ sui retroscena del Forum Bilaterale di Roma.",
    temi:["Geopolitica","Import/Export","Finanza"],durata:"29:50",data:"2026-03-28",dataObj:"2026-03-28",
    spotify:"https://open.spotify.com/episode/...",youtube:null,
    ascolti:89,salvataggi:31,stelleMedia:4.9,nRecensioni:12,risorse:[{testo:"Documento programmatico UNIIC per il Forum",url:"#"}],
    trascrizione:"Chen Wei: Quello che non è stato detto in sala è che tre delle delegazioni regionali cinesi presenti stanno valutando investimenti diretti in Italia nel settore agroalimentare.",
    commenti:[{autore:"Zhang Fan",avatar:"ZF",colore:"#16A085",stelle:5,testo:"Informazioni preziosissime.",data:"28/03"}],
    pubblicato:true },
  { id:6,ep:16,formato:"speciale",accesso:"tutti",titolo:"Speciale Capodanno Cinese: storia, tradizione e business",
    ospiti:[{nome:"Prof. Laura Bonomi",ruolo:"Sinologa – Università di Milano",avatar:"LB",colore:"#5D6D7E"},{nome:"Zhao Liuchao",ruolo:"Socio UNIIC",avatar:"ZL",colore:"#2471A3"}],conduttore:"Chen Wei",
    desc:"Episodio speciale: storia e simbolismo delle tradizioni del Capodanno cinese e consigli per i business meeting durante le festività.",
    temi:["Cultura","Made in Italy"],durata:"44:30",data:"2026-01-29",dataObj:"2026-01-29",
    spotify:"https://open.spotify.com/episode/...",youtube:"https://youtube.com/watch?v=...",
    ascolti:1890,salvataggi:134,stelleMedia:4.6,nRecensioni:52,risorse:[{testo:"Guida: fare business durante il Capodanno cinese",url:"#"}],
    trascrizione:"Prof. Bonomi: Il Capodanno cinese non è solo una festa. È il momento in cui si saldano debiti, si stringono accordi e si ridefiniscono le gerarchie sociali.",
    commenti:[{autore:"Hu Yinyi",avatar:"HY",colore:"#C0392B",stelle:5,testo:"Episodio bellissimo!",data:"30/01"}],
    pubblicato:true },
];
const POD_PROPOSTE_D = [
  { id:101,socio:"Hu Yinyi",avatar:"HY",colore:"#C0392B",data:"20/03",titolo:"Il settore estetico cinese in Italia",desc:"Difficoltà burocratiche specifiche per i professionisti di origine cinese.",ospite:"Me stessa",stato:"in_attesa" },
  { id:102,socio:"Zhao Liuchao",avatar:"ZL",colore:"#2471A3",data:"22/03",titolo:"GDO e distribuzione etnica in Italia",desc:"Trasformazione del settore della grande distribuzione etnica.",ospite:"Zhao Liuchao + esperto GDO",stato:"in_attesa" },
];

// ═══════════════════════════════════════════════════════════════════════════════
// SEZIONE: HOME
// ═══════════════════════════════════════════════════════════════════════════════
function HomeSection({ onNav, role, setRole }) {
  return (
    <div>
      <div style={{ background:`linear-gradient(135deg,${C.red}22,transparent)`,border:`1px solid ${C.red}33`,borderRadius:16,padding:20,marginBottom:18 }}>
        <div style={{ fontSize:10,color:C.gold,fontFamily:F,fontWeight:600,letterSpacing:2,marginBottom:6 }}>BENVENUTO</div>
        <h2 style={{ fontFamily:S,fontSize:26,color:C.text,margin:"0 0 4px",lineHeight:1.2 }}>Chen Wei</h2>
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
      <div style={{ marginBottom:10,fontSize:10,color:C.faint,fontFamily:F,letterSpacing:.5 }}>CAMBIA VISTA</div>
      <div style={{ display:"flex",gap:6,marginBottom:20 }}>
        {["ordinario","sostenitore","direttivo"].map(r => (
          <button key={r} onClick={() => setRole(r)} style={{ flex:1,padding:"8px 4px",borderRadius:8,cursor:"pointer",fontFamily:F,fontSize:11,fontWeight:600,
            background:role===r?C.red:C.alt,border:`1px solid ${role===r?C.red:C.border}`,color:role===r?"#fff":C.muted }}>
            {r.charAt(0).toUpperCase()+r.slice(1)}
          </button>
        ))}
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
function SociSection({ role }) {
  const [search, setSearch] = useState("");
  const [filterTipo, setFilterTipo] = useState("tutti");
  const [showFilters, setShowFilters] = useState(false);
  const [selected, setSelected] = useState(null);
  const [chatWith, setChatWith] = useState(null);
  const tcMap = { direttivo:C.red,sostenitore:C.gold,ordinario:C.blue };
  const filtered = useMemo(() => SOCI_D.filter(s => {
    const q=search.toLowerCase();
    return (!q||s.nome.toLowerCase().includes(q)||s.impresa_nome.toLowerCase().includes(q)||s.impresa_settore.toLowerCase().includes(q))
      &&(filterTipo==="tutti"||s.tipo===filterTipo);
  }),[search,filterTipo]);
  if(chatWith) return <SociChat socio={chatWith} onBack={() => setChatWith(null)} />;
  if(selected) return <SociProfilo socio={selected} role={role} onBack={() => setSelected(null)} onChat={s=>{setSelected(null);setChatWith(s);}} />;
  return (
    <div>
      <SecTitle title="Soci UNIIC" sub={`${filtered.length} di ${SOCI_D.length} soci`} />
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
function EvPagamento({ evento, onClose, onDone }) {
  const [step,setStep]=useState(1); const [ospiti,setOspiti]=useState(0); const [metodo,setMetodo]=useState("carta");
  const totale=evento.prezzo*(1+ospiti);
  if(step===3) return (<div style={{ textAlign:"center",padding:"16px 0" }}>
    <div style={{ fontSize:48,marginBottom:12 }}>🎉</div>
    <h3 style={{ fontFamily:S,fontSize:22,color:C.text,margin:"0 0 8px" }}>Iscrizione confermata!</h3>
    <p style={{ color:C.muted,fontSize:13,fontFamily:F,lineHeight:1.6,margin:"0 0 16px" }}>
      Riceverai una email con tutti i dettagli.
      {totale>0&&<span style={{ display:"block",color:C.green,marginTop:8,fontWeight:600 }}>✓ Pagamento di € {totale} ricevuto</span>}
    </p>
    <Btn onClick={()=>{onDone();onClose();}} sx={{ width:"100%" }}>Chiudi →</Btn>
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
      <Btn onClick={() => setStep(evento.prezzo===0?3:2)} sx={{ width:"100%" }}>{evento.prezzo===0?"Conferma gratuita →":"Continua al pagamento →"}</Btn>
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
        <Btn onClick={() => setStep(3)} sx={{ flex:1 }}>{metodo==="carta"?`Paga € ${totale} →`:"Confermo il bonifico →"}</Btn>
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
function EvSurvey({ evento, onBack }) {
  const [inviato,setInviato]=useState(evento.survey.inviato);
  const DOMANDE=["Organizzazione generale","Qualità contenuti","Luogo e logistica","Consiglieresti?","Qualità/Prezzo"];
  const STATS=[{media:4.7,d:[0,1,3,12,84]},{media:4.5,d:[0,2,5,20,73]},{media:4.8,d:[0,0,2,10,88]},{media:4.6,d:[0,1,4,15,80]},{media:4.3,d:[1,3,8,25,63]}];
  return (<div>
    <BackBtn onClick={onBack} label="← Torna all'evento" />
    <h3 style={{ fontFamily:S,fontSize:22,color:C.text,margin:"0 0 4px" }}>Questionario gradimento</h3>
    <p style={{ color:C.muted,fontSize:12,fontFamily:F,margin:"0 0 18px" }}>{evento.titolo}</p>
    {!inviato?<div>
      <Box sx={{ marginBottom:14 }}><p style={{ color:C.muted,fontSize:13,fontFamily:F,margin:0,lineHeight:1.6 }}>Il questionario sarà inviato a tutti i <strong style={{ color:C.text }}>{evento.iscritti} partecipanti</strong>.</p></Box>
      {DOMANDE.map((d,i) => (<Box key={i} sx={{ marginBottom:10 }}>
        <div style={{ fontSize:12,color:C.muted,fontFamily:F,marginBottom:8 }}>{i+1}. {d}</div>
        <div style={{ display:"flex",gap:4 }}>{[1,2,3,4,5].map(s=><span key={s} style={{ fontSize:22,color:C.border }}>★</span>)}</div>
      </Box>))}
      <Btn onClick={() => setInviato(true)} sx={{ width:"100%",marginTop:8 }}>📨 Invia a {evento.iscritti} partecipanti</Btn>
    </div>:<div>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:18 }}>
        {[[evento.survey.risposte,"Risposte",C.blue],[evento.survey.media||"—","Media",C.gold],[evento.survey.risposte>0?Math.round(evento.survey.risposte/evento.iscritti*100)+"%":"—","Tasso",C.green],["✓","Inviato",C.orange]].map(([v,l,c]) => (
          <Box key={l} sx={{ textAlign:"center",padding:"14px 10px" }}>
            <div style={{ fontFamily:S,fontSize:22,color:c,fontWeight:700 }}>{v}</div>
            <div style={{ fontSize:10,color:C.faint,fontFamily:F }}>{l}</div>
          </Box>
        ))}
      </div>
      {evento.survey.risposte>0&&STATS.map((s,i) => (<Box key={i} sx={{ marginBottom:10 }}>
        <div style={{ display:"flex",justifyContent:"space-between",marginBottom:8 }}>
          <span style={{ fontSize:13,color:C.text,fontFamily:F }}>{DOMANDE[i]}</span>
          <span style={{ fontFamily:S,fontSize:17,color:C.gold,fontWeight:700 }}>{s.media} ★</span>
        </div>
        <div style={{ display:"flex",gap:4,alignItems:"flex-end",height:34 }}>
          {s.d.map((v,j) => (<div key={j} style={{ flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2 }}>
            <div style={{ width:"100%",background:j===4?C.gold:j===3?C.green:C.border,height:`${v}%`,borderRadius:"2px 2px 0 0",minHeight:v>0?2:0 }} />
            <span style={{ fontSize:8,color:C.faint }}>★{j+1}</span>
          </div>))}
        </div>
      </Box>))}
      <Btn v="secondary" onClick={() => alert("Export PDF…")} sx={{ width:"100%",marginTop:8 }}>↓ Esporta report PDF</Btn>
    </div>}
  </div>);
}
function EvScheda({ evento, onBack, isAdmin }) {
  const [sub,setSub]=useState("main"); const [showPag,setShowPag]=useState(false);
  const [iscritto,setIscritto]=useState(evento.iscrizioni.some(i=>i.nome==="Chen Wei"));
  const [calAdded,setCalAdded]=useState(false);
  const t=EV_TIPI[evento.tipo]; const sold=evento.iscritti>=evento.posti; const pct=Math.round(evento.iscritti/evento.posti*100);
  if(sub==="iscritti") return <EvIscritti evento={evento} onBack={() => setSub("main")} isAdmin={isAdmin} />;
  if(sub==="survey") return <EvSurvey evento={evento} onBack={() => setSub("main")} />;
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
      {showPag?<Box><EvPagamento evento={evento} onClose={() => setShowPag(false)} onDone={() => setIscritto(true)} /></Box>
      :iscritto?<div>
        <div style={{ background:C.greenDim,border:`1px solid ${C.green}44`,borderRadius:10,padding:11,marginBottom:8,textAlign:"center" }}>
          <span style={{ fontSize:13,color:C.green,fontFamily:F,fontWeight:600 }}>✓ Sei iscritto a questo evento</span>
        </div>
        <div style={{ display:"flex",gap:8 }}>
          <Btn v="ghost" onClick={() => setIscritto(false)} sx={{ flex:1,fontSize:11 }}>Disdici</Btn>
          <Btn v="ghost" onClick={() => setCalAdded(true)} sx={{ flex:1,fontSize:11 }}>{calAdded?"✓ In calendario":"📆 Aggiungi al cal."}</Btn>
        </div>
      </div>
      :sold?<Btn v="gold" sx={{ width:"100%" }}>⏳ Lista d'attesa</Btn>
      :<div style={{ display:"flex",gap:8 }}>
        <Btn onClick={() => setShowPag(true)} sx={{ flex:2 }}>{evento.prezzo===0?"Iscriviti gratuitamente →":`Iscriviti · € ${evento.prezzo} →`}</Btn>
        <Btn v="ghost" onClick={() => setCalAdded(true)} sx={{ flex:1,fontSize:11 }}>{calAdded?"✓":"📆 Cal."}</Btn>
      </div>}
    </div>}
    {isAdmin&&<div style={{ display:"flex",gap:8,marginBottom:12,flexWrap:"wrap" }}>
      <Btn v="secondary" onClick={() => setSub("iscritti")} sx={{ flex:1,fontSize:11 }}>👥 Iscritti ({evento.iscritti})</Btn>
      <Btn v="gold" onClick={() => setSub("survey")} sx={{ flex:1,fontSize:11 }}>📊 Survey{evento.survey.inviato?" ✓":""}</Btn>
      <Btn v="ghost" onClick={() => alert("Comunicazione inviata!")} sx={{ fontSize:13,padding:"10px 12px" }}>📨</Btn>
    </div>}
    {evento.iscrizioni.length>0&&<Box sx={{ marginBottom:10 }}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10 }}>
        <h4 style={{ fontFamily:S,fontSize:16,color:C.text,margin:0 }}>Chi partecipa</h4>
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
function EventiSection({ isAdmin }) {
  const [eventi,setEventi]=useState(EVENTI_D); const [filtro,setFiltro]=useState("tutti");
  const [selected,setSelected]=useState(null); const [showForm,setShowForm]=useState(false);
  const oggi=new Date("2026-03-27");
  const sorted=useMemo(()=>[...eventi].sort((a,b)=>new Date(a.data)-new Date(b.data)),[eventi]);
  const prossimi=sorted.filter(e=>new Date(e.data)>=oggi); const passati=sorted.filter(e=>new Date(e.data)<oggi);
  const filtra=list=>filtro==="tutti"?list:list.filter(e=>e.tipo===filtro);
  if(selected) return <EvScheda evento={selected} onBack={() => setSelected(null)} isAdmin={isAdmin} />;
  const ECard=({ev}) => {
    const tp=EV_TIPI[ev.tipo]; const sold=ev.iscritti>=ev.posti; const pct=ev.iscritti/ev.posti;
    const isc=ev.iscrizioni.some(i=>i.nome==="Chen Wei");
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
      <div style={{ display:"flex",justifyContent:"space-between",marginTop:5 }}>
        <span style={{ fontSize:11,color:C.faint,fontFamily:F }}>{sold?`SOLD OUT · ${ev.waitlist.length} in attesa`:`${ev.posti-ev.iscritti}/${ev.posti} liberi`}</span>
        <span style={{ fontFamily:S,fontSize:16,color:ev.prezzo===0?C.green:C.gold,fontWeight:700 }}>{ev.prezzo===0?"Gratuito":`€ ${ev.prezzo}`}</span>
      </div>
    </Box>);
  };
  return (<div>
    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16 }}>
      <SecTitle title="Eventi" sub={`${prossimi.length} prossimi · ${passati.length} passati`} />
      {isAdmin&&<Btn onClick={() => alert("Form nuovo evento — integrato nella demo completa")} sx={{ fontSize:11,padding:"9px 14px",marginTop:4 }}>+ Nuovo</Btn>}
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
            {isAdmin&&ev.survey.inviato&&<Tag label={`⭐ ${ev.survey.media}`} color={C.gold} sm />}
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
function ConvenzioniSection({ role, isAdmin }) {
  const [convenzioni,setConvenzioni]=useState(CONV_D); const [proposte,setProposte]=useState(CONV_PROPOSTE_D);
  const [preferiti,setPreferiti]=useState([3,5]); const [filtroCateg,setFiltroCateg]=useState("Tutte");
  const [showFav,setShowFav]=useState(false); const [showFilters,setShowFilters]=useState(false);
  const [selected,setSelected]=useState(null); const [adminView,setAdminView]=useState("lista");
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
      {isAdmin&&<Btn onClick={() => alert("Pannello admin — vedi uniic_convenzioni.jsx")} sx={{ fontSize:10,padding:"8px 10px",marginTop:4 }}>⚙ Admin</Btn>}
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
  const inviaComm=()=>{if(!draft.trim())return;setCommenti(cs=>[...cs,{autore:"Chen Wei",avatar:"CW",colore:C.red,testo:draft.trim(),data:"adesso"}]);setDraft("");};
  return (<div>
    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16 }}>
      <BackBtn onClick={onBack} label="← Newsletter" />
      <div style={{ display:"flex",gap:8 }}>
        {isAdmin&&<button onClick={() => alert("Editor: vedi uniic_newsletter.jsx")} style={{ background:"none",border:"none",color:C.gold,fontSize:16,cursor:"pointer" }}>✏️</button>}
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
function NewsletterSection({ role, isAdmin }) {
  const [articoli,setArticoli]=useState(NEWS_D); const [notifiche,setNotifiche]=useState(NL_NOTIFICHE_D);
  const [selected,setSelected]=useState(null); const [filterCat,setFilterCat]=useState("tutti");
  const [filterTipo,setFilterTipo]=useState("tutti"); const [salvati,setSalvati]=useState([2]);
  const [showSalvati,setShowSalvati]=useState(false); const [showNotif,setShowNotif]=useState(false);
  const toggleSalva=id=>setSalvati(ss=>ss.includes(id)?ss.filter(s=>s!==id):[...ss,id]);
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
        {isAdmin&&<Btn onClick={() => alert("Editor articoli — vedi uniic_newsletter.jsx")} sx={{ fontSize:11,padding:"7px 12px" }}>+ Scrivi</Btn>}
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
function PodScheda({ ep, role, salvati, onToggleSalva, playing, playingEp, onPlay, onBack, isAdmin }) {
  const [sub,setSub]=useState("info"); const [commenti,setCommenti]=useState(ep.commenti);
  const [draft,setDraft]=useState(""); const [draftStelle,setDraftStelle]=useState(0);
  const [shareMenu,setShareMenu]=useState(false);
  const fmt=POD_FORMATI[ep.formato]; const isSalvato=salvati.includes(ep.id);
  const isPlaying=playing&&playingEp?.id===ep.id; const acc=podCanListen(ep,role);
  const inviaComm=()=>{
    if(!draft.trim()||draftStelle===0) return;
    setCommenti(cs=>[...cs,{autore:"Chen Wei",avatar:"CW",colore:C.red,stelle:draftStelle,testo:draft.trim(),data:"adesso"}]);
    setDraft("");setDraftStelle(0);
  };
  return (<div>
    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16 }}>
      <BackBtn onClick={onBack} label="← Tutti gli episodi" />
      <div style={{ display:"flex",gap:8,alignItems:"center" }}>
        {isAdmin&&<button onClick={() => alert("Statistiche — vedi uniic_podcast.jsx")} style={{ background:"none",border:"none",color:C.blue,fontSize:16,cursor:"pointer" }}>📊</button>}
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
function PodcastSection({ role, isAdmin }) {
  const [episodi,setEpisodi]=useState(EPISODI_D); const [proposte,setProposte]=useState(POD_PROPOSTE_D);
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
    <PodScheda ep={selected} role={role} salvati={salvati} onToggleSalva={toggleSalva} playing={playing} playingEp={playingEp} onPlay={startPlay} onBack={() => setSelected(null)} isAdmin={isAdmin} />
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
      {isAdmin&&<Btn onClick={() => alert("Carica nuovo episodio — vedi uniic_podcast.jsx")} sx={{ fontSize:11,padding:"8px 12px" }}>+ Nuovo</Btn>}
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

export default function App() {
  const [tab, setTab] = useState("home");
  const [role, setRole] = useState("direttivo");
  const isAdmin = role === "direttivo";

  const renderSection = () => {
    switch(tab) {
      case "home":        return <HomeSection onNav={setTab} role={role} setRole={setRole} />;
      case "soci":        return <SociSection role={role} />;
      case "convenzioni": return <ConvenzioniSection role={role} isAdmin={isAdmin} />;
      case "eventi":      return <EventiSection isAdmin={isAdmin} />;
      case "newsletter":  return <NewsletterSection role={role} isAdmin={isAdmin} />;
      case "podcast":     return <PodcastSection role={role} isAdmin={isAdmin} />;
      default:            return null;
    }
  };

  return (
    <div style={{ display:"flex", justifyContent:"center", alignItems:"center", minHeight:"100vh", background:"#080605" }}>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Montserrat:wght@400;500;600&display=swap" rel="stylesheet" />
      <div style={{ width:390, minHeight:"100vh", maxHeight:"100vh", background:C.bg, display:"flex", flexDirection:"column", boxShadow:"0 0 80px rgba(0,0,0,.85)", overflow:"hidden", position:"relative" }}>

        {/* Top bar */}
        <div style={{ background:C.surface, padding:"10px 18px 8px", borderBottom:`1px solid ${C.border}`, display:"flex", justifyContent:"space-between", alignItems:"center", flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:32, height:32, background:C.red, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>🐉</div>
            <div>
              <div style={{ fontFamily:S, fontSize:16, color:C.text, fontWeight:700, lineHeight:1 }}>UNIIC</div>
              <div style={{ fontSize:8, color:C.gold, fontFamily:F, letterSpacing:1 }}>中意商联</div>
            </div>
          </div>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <div style={{ width:8, height:8, background:C.green, borderRadius:"50%" }} />
            <Avatar initials="CW" size={28} color={C.red} />
          </div>
        </div>

        {/* Content */}
        <div style={{ flex:1, overflowY:"auto", padding:"18px 16px 80px" }}>
          {renderSection()}
        </div>

        {/* Bottom nav */}
        <div style={{ position:"absolute", bottom:0, left:0, right:0, background:C.surface, borderTop:`1px solid ${C.border}`, display:"flex", padding:"8px 0 10px", flexShrink:0 }}>
          {NAV_TABS.map(n => (
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
