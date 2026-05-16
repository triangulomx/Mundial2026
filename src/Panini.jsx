import { useState, useMemo } from "react";

const FLAGS = {
  México:"🇲🇽","Corea del Sur":"🇰🇷",Sudáfrica:"🇿🇦","Rep. Checa":"🇨🇿",
  Canadá:"🇨🇦",Suiza:"🇨🇭",Qatar:"🇶🇦","Bosnia y Herz.":"🇧🇦",
  Brasil:"🇧🇷",Marruecos:"🇲🇦",Escocia:"🏴󠁧󠁢󠁳󠁣󠁴󠁿",Haití:"🇭🇹",
  "Estados Unidos":"🇺🇸",Australia:"🇦🇺",Paraguay:"🇵🇾",Turquía:"🇹🇷",
  Alemania:"🇩🇪",Ecuador:"🇪🇨","Costa de Marfil":"🇨🇮",Curazao:"🇨🇼",
  "Países Bajos":"🇳🇱",Japón:"🇯🇵",Túnez:"🇹🇳",Suecia:"🇸🇪",
  Bélgica:"🇧🇪",Irán:"🇮🇷",Egipto:"🇪🇬","Nueva Zelanda":"🇳🇿",
  España:"🇪🇸",Uruguay:"🇺🇾","Cabo Verde":"🇨🇻","Arabia Saudita":"🇸🇦",
  Francia:"🇫🇷",Senegal:"🇸🇳",Noruega:"🇳🇴",Irak:"🇮🇶",
  Argentina:"🇦🇷",Argelia:"🇩🇿",Austria:"🇦🇹",Jordania:"🇯🇴",
  Portugal:"🇵🇹",Colombia:"🇨🇴",Uzbekistán:"🇺🇿","RD del Congo":"🇨🇩",
  Inglaterra:"🏴󠁧󠁢󠁥󠁮󠁧󠁿",Croacia:"🇭🇷",Panamá:"🇵🇦",Ghana:"🇬🇭",
};
const flag = (t) => FLAGS[t] || "🏳";

const FIFA_CODE = {
  México:"MEX","Corea del Sur":"KOR",Sudáfrica:"RSA","Rep. Checa":"CZE",
  Canadá:"CAN",Suiza:"SUI",Qatar:"QAT","Bosnia y Herz.":"BIH",
  Brasil:"BRA",Marruecos:"MAR",Escocia:"SCO",Haití:"HAI",
  "Estados Unidos":"USA",Australia:"AUS",Paraguay:"PAR",Turquía:"TUR",
  Alemania:"GER",Ecuador:"ECU","Costa de Marfil":"CIV",Curazao:"CUW",
  "Países Bajos":"NED",Japón:"JPN",Túnez:"TUN",Suecia:"SWE",
  Bélgica:"BEL",Irán:"IRN",Egipto:"EGY","Nueva Zelanda":"NZL",
  España:"ESP",Uruguay:"URU","Cabo Verde":"CPV","Arabia Saudita":"KSA",
  Francia:"FRA",Senegal:"SEN",Noruega:"NOR",Irak:"IRQ",
  Argentina:"ARG",Argelia:"ALG",Austria:"AUT",Jordania:"JOR",
  Portugal:"POR",Colombia:"COL",Uzbekistán:"UZB","RD del Congo":"COD",
  Inglaterra:"ENG",Croacia:"CRO",Panamá:"PAN",Ghana:"GHA",
};

// Sticker slots per team:
// 01 = Escudo, 02–12 = Jugadores 1–11, 13 = Foto Equipo, 14–20 = Jugadores 12–18
function buildStickers(teamName) {
  const code = FIFA_CODE[teamName] || teamName;
  const slots = [];
  slots.push({ num:"01", code:`${code}01`, label:"Escudo",      type:"shield" });
  for (let i=0;i<11;i++)  slots.push({ num:String(i+2).padStart(2,"0"),  code:`${code}${String(i+2).padStart(2,"0")}`,  label:"",  type:"player" });
  slots.push({ num:"13", code:`${code}13`, label:"Foto Equipo", type:"team" });
  for (let i=11;i<18;i++) slots.push({ num:String(i+3).padStart(2,"0"),  code:`${code}${String(i+3).padStart(2,"0")}`,  label:"",  type:"player" });
  return slots; // 20 total
}


const PANINI_GROUPS = {
  A:["México","Corea del Sur","Sudáfrica","Rep. Checa"],
  B:["Canadá","Suiza","Qatar","Bosnia y Herz."],
  C:["Brasil","Marruecos","Escocia","Haití"],
  D:["Estados Unidos","Australia","Paraguay","Turquía"],
  E:["Alemania","Ecuador","Costa de Marfil","Curazao"],
  F:["Países Bajos","Japón","Túnez","Suecia"],
  G:["Bélgica","Irán","Egipto","Nueva Zelanda"],
  H:["España","Uruguay","Cabo Verde","Arabia Saudita"],
  I:["Francia","Senegal","Noruega","Irak"],
  J:["Argentina","Argelia","Austria","Jordania"],
  K:["Portugal","Colombia","Uzbekistán","RD del Congo"],
  L:["Inglaterra","Croacia","Panamá","Ghana"],
};

const SPECIALS_FCW = ["FWC01","FWC02","FWC03","FWC04","FWC05","FWC06","FWC07","FWC08","FWC09","FWC10","FWC11","FWC12","FWC13","FWC14","FWC15","FWC16","FWC17","FWC18","FWC19"];
const SPECIALS_CC  = ["CC01","CC02","CC03","CC04","CC05","CC06","CC07","CC08","CC09","CC10","CC11","CC12","CC13","CC14"];
const ALL_SPECIALS = [...SPECIALS_FCW,...SPECIALS_CC];

const STICKERS_PER_TEAM = 20;
const TOTAL_TEAM_STICKERS = 48 * STICKERS_PER_TEAM;
const TOTAL_SPECIALS = ALL_SPECIALS.length; // 23
const GRAND_TOTAL = TOTAL_TEAM_STICKERS + TOTAL_SPECIALS; // 993

function usePaniniStats(panini) {
  return useMemo(() => {
    let totalTeams = 0, totalDups = 0;
    const groupStats = {}, teamStats = {}, teamDups = {};
    Object.entries(PANINI_GROUPS).forEach(([group, teams]) => {
      let gOwned = 0;
      teams.forEach(team => {
        const code = FIFA_CODE[team];
        let tOwned = 0, tDups = 0;
        for (let i = 0; i < STICKERS_PER_TEAM; i++) {
          if (panini?.teams?.[code]?.[i]) tOwned++;
          const d = panini?.dups?.[code]?.[i]||0;
          if (d > 0) tDups += d;
        }
        gOwned += tOwned; totalTeams += tOwned; totalDups += tDups;
        teamStats[code] = { owned: tOwned, total: STICKERS_PER_TEAM, team };
        teamDups[code] = tDups;
      });
      groupStats[group] = { owned: gOwned, total: teams.length * STICKERS_PER_TEAM };
    });
    let specialsOwned = 0;
    ALL_SPECIALS.forEach(code => { if (panini?.specials?.[code]?.owned) specialsOwned++; });
    return { groupStats, teamStats, teamDups, totalTeams, totalDups, specialsOwned };
  }, [panini]);
}

// ─── EXPORT DUPS AS IMAGE ────────────────────────────────────────────────────
async function exportDupsImage(dupsList) {
  const byTeam = {};
  dupsList.forEach(d => {
    if (!byTeam[d.team]) byTeam[d.team] = { group: d.group, items: [] };
    byTeam[d.team].items.push(d);
  });
  const teams = Object.entries(byTeam);
  const totalDups = dupsList.reduce((a, d) => a + d.dups, 0);
  const date = new Date().toLocaleDateString("es-MX", { day:"numeric", month:"long", year:"numeric" });

  const COLS = 4;
  const ITEM_H = 28;
  const TEAM_PAD = 14;
  const TEAM_HEADER = 26;
  const W = 700;
  const PAD = 24;

  // Estimate height
  let contentH = 0;
  teams.forEach(([, {items}]) => { contentH += TEAM_HEADER + Math.ceil(items.length / COLS) * ITEM_H + TEAM_PAD; });
  const HEADER_H = 80;
  const FOOTER_H = 50;
  const H = HEADER_H + contentH + FOOTER_H + PAD;

  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");

  // BG
  ctx.fillStyle = "#080d18"; ctx.fillRect(0, 0, W, H);

  // Top bar
  const bar = ctx.createLinearGradient(0,0,W,0);
  bar.addColorStop(0,"transparent"); bar.addColorStop(0.5,"#8b5cf6"); bar.addColorStop(1,"transparent");
  ctx.fillStyle = bar; ctx.fillRect(0, 0, W, 3);

  // Header
  ctx.fillStyle = "#162030"; ctx.fillRect(0, 3, W, HEADER_H - 3);
  ctx.strokeStyle = "#1c2d42"; ctx.lineWidth = 1; ctx.strokeRect(0, 3, W, HEADER_H - 3);
  ctx.font = "bold 13px Arial"; ctx.fillStyle = "#8b5cf6"; ctx.textAlign = "left";
  ctx.fillText("PANINI MUNDIAL 2026  ·  MIS REPETIDAS", PAD, 36);
  ctx.font = "bold 32px Arial Black"; ctx.fillStyle = "#fff";
  ctx.fillText(`${totalDups} estampas para intercambio`, PAD, 68);

  // Content
  let y = HEADER_H + 10;
  teams.forEach(([team, { group, items }]) => {
    // Team header
    ctx.fillStyle = "#162030"; ctx.fillRect(PAD, y, W - PAD*2, TEAM_HEADER);
    ctx.strokeStyle = "#1c2d42"; ctx.lineWidth = 1; ctx.strokeRect(PAD, y, W - PAD*2, TEAM_HEADER);
    ctx.font = "bold 13px Arial"; ctx.fillStyle = "#f59e0b"; ctx.textAlign = "left";
    const label = group === "ESP" ? "⭐ Especiales" : team;
    ctx.fillText(label, PAD + 10, y + 17);
    y += TEAM_HEADER + 4;

    // Sticker chips in columns
    const colW = (W - PAD*2) / COLS;
    items.forEach((item, idx) => {
      const col = idx % COLS;
      const row = Math.floor(idx / COLS);
      const x = PAD + col * colW;
      const cy = y + row * ITEM_H;

      // Chip bg
      ctx.fillStyle = "rgba(139,92,246,0.12)";
      ctx.beginPath(); ctx.roundRect(x + 3, cy + 3, colW - 8, ITEM_H - 6, 6); ctx.fill();
      ctx.strokeStyle = "rgba(139,92,246,0.4)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(x + 3, cy + 3, colW - 8, ITEM_H - 6, 6); ctx.stroke();

      // Code + count
      ctx.font = "bold 13px Arial"; ctx.fillStyle = "#a78bfa"; ctx.textAlign = "left";
      ctx.fillText(item.code, x + 12, cy + 18);
      ctx.font = "bold 13px Arial"; ctx.fillStyle = "#fff"; ctx.textAlign = "right";
      ctx.fillText(`×${item.dups}`, x + colW - 12, cy + 18);
    });

    y += Math.ceil(items.length / COLS) * ITEM_H + TEAM_PAD;
  });

  // Footer
  ctx.fillStyle = "#162030"; ctx.fillRect(0, H - FOOTER_H, W, FOOTER_H);
  ctx.fillStyle = "#1c2d42"; ctx.fillRect(0, H - FOOTER_H, W, 1);
  ctx.font = "11px Arial"; ctx.fillStyle = "#64748b"; ctx.textAlign = "left";
  ctx.fillText(`Generado: ${date}`, PAD, H - 18);
  ctx.font = "bold 11px Arial"; ctx.fillStyle = "#8b5cf6"; ctx.textAlign = "right";
  ctx.fillText("⚽ Panini Mundial 2026", W - PAD, H - 18);
  ctx.fillStyle = bar; ctx.fillRect(0, H - 3, W, 3);

  const link = document.createElement("a");
  link.download = "repetidas-panini-mundial2026.jpg";
  link.href = canvas.toDataURL("image/jpeg", 0.93);
  link.click();
}

// ─── EXPORT MISSING AS IMAGE ─────────────────────────────────────────────────
async function exportMissingImage(missingList) {
  const byTeam = {};
  missingList.forEach(d => {
    if (!byTeam[d.team]) byTeam[d.team] = { group: d.group, items: [] };
    byTeam[d.team].items.push(d);
  });
  const teams = Object.entries(byTeam);
  const totalMissing = missingList.length;
  const date = new Date().toLocaleDateString("es-MX", { day:"numeric", month:"long", year:"numeric" });

  const COLS = 5;
  const ITEM_H = 26;
  const TEAM_PAD = 12;
  const TEAM_HEADER = 26;
  const W = 700;
  const PAD = 24;

  let contentH = 0;
  teams.forEach(([, {items}]) => { contentH += TEAM_HEADER + Math.ceil(items.length / COLS) * ITEM_H + TEAM_PAD; });
  const HEADER_H = 80;
  const FOOTER_H = 50;
  const H = HEADER_H + contentH + FOOTER_H + PAD;

  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#080d18"; ctx.fillRect(0, 0, W, H);

  const bar = ctx.createLinearGradient(0,0,W,0);
  bar.addColorStop(0,"transparent"); bar.addColorStop(0.5,"#ef4444"); bar.addColorStop(1,"transparent");
  ctx.fillStyle = bar; ctx.fillRect(0, 0, W, 3);

  ctx.fillStyle = "#162030"; ctx.fillRect(0, 3, W, HEADER_H - 3);
  ctx.strokeStyle = "#1c2d42"; ctx.lineWidth = 1; ctx.strokeRect(0, 3, W, HEADER_H - 3);
  ctx.font = "bold 13px Arial"; ctx.fillStyle = "#ef4444"; ctx.textAlign = "left";
  ctx.fillText("PANINI MUNDIAL 2026  ·  MIS FALTANTES", PAD, 36);
  ctx.font = "bold 32px Arial Black"; ctx.fillStyle = "#fff";
  ctx.fillText(`${totalMissing} estampas que necesito`, PAD, 68);

  let y = HEADER_H + 10;
  teams.forEach(([team, { group, items }]) => {
    ctx.fillStyle = "#162030"; ctx.fillRect(PAD, y, W - PAD*2, TEAM_HEADER);
    ctx.strokeStyle = "#1c2d42"; ctx.lineWidth = 1; ctx.strokeRect(PAD, y, W - PAD*2, TEAM_HEADER);
    ctx.font = "bold 13px Arial"; ctx.fillStyle = "#f59e0b"; ctx.textAlign = "left";
    ctx.fillText(group === "ESP" ? "⭐ Especiales" : team, PAD + 10, y + 17);
    y += TEAM_HEADER + 4;

    const colW = (W - PAD*2) / COLS;
    items.forEach((item, idx) => {
      const col = idx % COLS;
      const row = Math.floor(idx / COLS);
      const x = PAD + col * colW;
      const cy = y + row * ITEM_H;

      ctx.fillStyle = "rgba(239,68,68,0.1)";
      ctx.beginPath(); ctx.roundRect(x + 2, cy + 2, colW - 6, ITEM_H - 5, 5); ctx.fill();
      ctx.strokeStyle = "rgba(239,68,68,0.35)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(x + 2, cy + 2, colW - 6, ITEM_H - 5, 5); ctx.stroke();
      ctx.font = "bold 12px Arial"; ctx.fillStyle = "#fca5a5"; ctx.textAlign = "center";
      ctx.fillText(item.code, x + colW/2, cy + 16);
    });
    y += Math.ceil(items.length / COLS) * ITEM_H + TEAM_PAD;
  });

  ctx.fillStyle = "#162030"; ctx.fillRect(0, H - FOOTER_H, W, FOOTER_H);
  ctx.fillStyle = "#1c2d42"; ctx.fillRect(0, H - FOOTER_H, W, 1);
  ctx.font = "11px Arial"; ctx.fillStyle = "#64748b"; ctx.textAlign = "left";
  ctx.fillText(`Generado: ${date}`, PAD, H - 18);
  ctx.font = "bold 11px Arial"; ctx.fillStyle = "#ef4444"; ctx.textAlign = "right";
  ctx.fillText("⚽ Panini Mundial 2026", W - PAD, H - 18);
  ctx.fillStyle = bar; ctx.fillRect(0, H - 3, W, 3);

  const link = document.createElement("a");
  link.download = "faltantes-panini-mundial2026.jpg";
  link.href = canvas.toDataURL("image/jpeg", 0.93);
  link.click();
}

function PaniniSection({ panini, onToggle, onToggleSpecial, onSpecialLabel, onDup, onResetDups }) {
  const [selGroup, setSelGroup] = useState(null);
  const [selTeam,  setSelTeam]  = useState(null);
  const [confirm,  setConfirm]  = useState(null);
  const [showDupsModal, setShowDupsModal] = useState(false);
  const [showMissingModal, setShowMissingModal] = useState(false);
  const [showOwnedModal, setShowOwnedModal] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [filterTeams, setFilterTeams] = useState([]); // shared filter for both modals

  const allTeamsList = useMemo(()=>Object.entries(PANINI_GROUPS).flatMap(([g,teams])=>teams.map(t=>({team:t,code:FIFA_CODE[t],group:g}))),[]);
  const toggleFilter = (code) => setFilterTeams(prev => prev.includes(code) ? prev.filter(x=>x!==code) : [...prev,code]);
  const clearFilter = () => setFilterTeams([]);
  const { groupStats, teamStats, teamDups, totalTeams, totalDups, specialsOwned } = usePaniniStats(panini);

  // Build full missing list
  const allMissingList = useMemo(() => {
    const list = [];
    Object.entries(PANINI_GROUPS).forEach(([group, teams]) => {
      teams.forEach(team => {
        const code = FIFA_CODE[team];
        const stickers = buildStickers(team);
        stickers.forEach((s, i) => {
          if (!panini?.teams?.[code]?.[i]) list.push({ code: s.code, group, team });
        });
      });
    });
    // Specials
    const allSpecials = [...Array.from({length:19},(_,i)=>`FWC${String(i+1).padStart(2,"0")}`), ...Array.from({length:14},(_,i)=>`CC${String(i+1).padStart(2,"0")}`)];
    allSpecials.forEach(scode => { if (!panini?.specials?.[scode]?.owned) list.push({ code: scode, group:"ESP", team:"Especiales" }); });
    return list;
  }, [panini]);

  // Build full duplicates list for modal
  const allDupsList = useMemo(() => {
    const list = [];
    Object.entries(PANINI_GROUPS).forEach(([group, teams]) => {
      teams.forEach(team => {
        const code = FIFA_CODE[team];
        for (let i = 0; i < STICKERS_PER_TEAM; i++) {
          const d = panini?.dups?.[code]?.[i] || 0;
          if (d > 0) {
            const sticker = buildStickers(team)[i];
            list.push({ code: sticker.code, dups: d, group, team });
          }
        }
      });
    });
    // Specials
    ALL_SPECIALS.forEach(scode => {
      const d = panini?.specials?.[scode]?.dups || 0;
      if (d > 0) list.push({ code: scode, dups: d, group: "ESP", team: "Especiales" });
    });
    return list;
  }, [panini]);

  const handleSticker = (code, idx) => {
    if (panini?.teams?.[code]?.[idx]) setConfirm({ type:"team", code, idx });
    else onToggle(code, idx, true);
  };
  const handleSpecial = (code) => {
    if (panini?.specials?.[code]?.owned) setConfirm({ type:"special", code });
    else onToggleSpecial(code, true);
  };
  const confirmAction = () => {
    if (!confirm) return;
    if (confirm.type === "team") onToggle(confirm.code, confirm.idx, false);
    else onToggleSpecial(confirm.code, false);
    setConfirm(null);
  };

  const typeColor = t => t==="stadium"?"#f59e0b":t==="team"?"#3b82f6":"var(--muted)";

  const doSearch = (q) => {
    const code = q.trim().toUpperCase();
    if (!code) { setSearchResult(null); return; }

    // Search in specials
    const allSpecials = [...Array.from({length:19},(_,i)=>`FWC${String(i+1).padStart(2,"0")}`), ...Array.from({length:14},(_,i)=>`CC${String(i+1).padStart(2,"0")}`)];
    if (allSpecials.includes(code)) {
      const s = panini?.specials?.[code] || {};
      setSearchResult({ code, type:"special", owned: !!s.owned, dups: s.dups||0, team:"Especiales", group:"ESP" });
      return;
    }

    // Search in team stickers — find by FIFA code prefix
    for (const [group, teams] of Object.entries(PANINI_GROUPS)) {
      for (const team of teams) {
        const fc = FIFA_CODE[team];
        if (!code.startsWith(fc)) continue;
        const stickers = buildStickers(team);
        const idx = stickers.findIndex(s => s.code === code);
        if (idx === -1) continue;
        const owned = !!panini?.teams?.[fc]?.[idx];
        const dups = panini?.dups?.[fc]?.[idx] || 0;
        setSearchResult({ code, type:"team", owned, dups, team, group, fc, idx, sticker: stickers[idx] });
        return;
      }
    }
    setSearchResult({ code, type:"notfound" });
  };

  return (
    <div>
      {/* CONFIRM */}
      {confirm && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200}}>
          <div style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:14,padding:28,width:300,textAlign:"center"}}>
            <div style={{fontSize:32,marginBottom:10}}>⚠️</div>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:20,color:"var(--accent)",marginBottom:8}}>¿Desmarcar estampa?</div>
            <div style={{fontSize:13,color:"var(--muted)",marginBottom:20,fontFamily:"'Bebas Neue',sans-serif",letterSpacing:1}}>
              {confirm.type==="team"
                ? buildStickers(Object.keys(FIFA_CODE).find(k=>FIFA_CODE[k]===confirm.code)||"")[confirm.idx]?.code
                : confirm.code}
            </div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={confirmAction} style={{flex:1,padding:10,background:"var(--accent2)",border:"none",borderRadius:8,color:"#fff",fontWeight:700,cursor:"pointer"}}>Sí, desmarcar</button>
              <button onClick={()=>setConfirm(null)} style={{flex:1,padding:10,background:"var(--card2)",border:"1px solid var(--border)",borderRadius:8,color:"var(--muted)",cursor:"pointer"}}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM RESET DUPS */}
      {confirmReset&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.85)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:400,padding:16}}>
          <div style={{background:"var(--card)",border:"1px solid var(--accent2)",borderRadius:14,padding:28,width:320,textAlign:"center"}}>
            <div style={{fontSize:36,marginBottom:10}}>🗑</div>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,color:"var(--accent2)",marginBottom:10}}>¿Resetear repetidas?</div>
            <div style={{fontSize:12,color:"var(--muted)",marginBottom:20,lineHeight:1.7}}>Se borrarán todos los contadores de repetidas. Las estampas <strong style={{color:"var(--text)"}}>obtenidas no se modifican</strong>.</div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>{onResetDups();setConfirmReset(false);}} style={{flex:1,padding:10,background:"var(--accent2)",border:"none",borderRadius:8,color:"#fff",fontWeight:700,cursor:"pointer",fontSize:13}}>Sí, resetear</button>
              <button onClick={()=>setConfirmReset(false)} style={{flex:1,padding:10,background:"var(--card2)",border:"1px solid var(--border)",borderRadius:8,color:"var(--muted)",cursor:"pointer",fontSize:13}}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* OWNED MODAL - desglose por selección */}
      {showOwnedModal&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.8)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300,padding:16}} onClick={()=>setShowOwnedModal(false)}>
          <div style={{background:"var(--card)",border:"1px solid var(--accent)",borderRadius:16,width:"100%",maxWidth:560,maxHeight:"85vh",display:"flex",flexDirection:"column",overflow:"hidden"}} onClick={e=>e.stopPropagation()}>
            <div style={{padding:"14px 20px",borderBottom:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"space-between",background:"var(--card2)"}}>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,color:"var(--accent)",letterSpacing:1}}>📊 OBTENIDAS POR SELECCIÓN</div>
              <button onClick={()=>setShowOwnedModal(false)} style={{background:"none",border:"none",color:"var(--muted)",cursor:"pointer",fontSize:22,lineHeight:1}}>×</button>
            </div>
            <div style={{overflowY:"auto",flex:1}}>
              {/* Specials row */}
              <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 16px",borderBottom:"1px solid var(--border)",background:"rgba(59,130,246,0.05)"}}>
                <div style={{fontSize:18}}>⭐</div>
                <div style={{flex:1}}>
                  <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:14,color:"var(--blue)"}}>ESPECIALES</div>
                  <div style={{height:4,background:"var(--border)",borderRadius:2,marginTop:4,overflow:"hidden"}}>
                    <div style={{height:"100%",background:"var(--blue)",width:`${(specialsOwned/TOTAL_SPECIALS)*100}%`,transition:"width .5s"}}/>
                  </div>
                </div>
                <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:20,color:"var(--blue)",minWidth:50,textAlign:"right"}}>{specialsOwned}<span style={{fontSize:12,color:"var(--muted)"}}>/{TOTAL_SPECIALS}</span></div>
                <div style={{fontSize:11,fontWeight:700,color:specialsOwned===TOTAL_SPECIALS?"var(--green)":"var(--muted)",minWidth:36,textAlign:"right"}}>{Math.round((specialsOwned/TOTAL_SPECIALS)*100)}%</div>
              </div>
              {/* Group headers + teams */}
              {Object.entries(PANINI_GROUPS).map(([group,teams])=>(
                <div key={group}>
                  <div style={{padding:"6px 16px",background:"rgba(245,158,11,0.06)",borderBottom:"1px solid var(--border)"}}>
                    <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:13,color:"var(--accent)",letterSpacing:1}}>GRUPO {group}</span>
                    <span style={{fontSize:12,color:"var(--muted)",marginLeft:10}}>{groupStats[group]?.owned}/{groupStats[group]?.total}</span>
                  </div>
                  {teams.map(team=>{
                    const code=FIFA_CODE[team];
                    const ts=teamStats[code]||{owned:0,total:20};
                    const pct=Math.round((ts.owned/ts.total)*100);
                    const color=pct===100?"var(--green)":pct>=50?"var(--accent)":"var(--muted)";
                    return(
                      <div key={code} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 16px",borderBottom:"1px solid rgba(28,45,66,.5)"}}>
                        <div style={{fontSize:20}}>{flag(team)}</div>
                        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:14,color:"var(--accent)",width:36}}>{code}</div>
                        <div style={{flex:1}}>
                          <div style={{height:5,background:"var(--border)",borderRadius:3,overflow:"hidden"}}>
                            <div style={{height:"100%",background:color,width:`${pct}%`,transition:"width .5s"}}/>
                          </div>
                        </div>
                        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:18,color,minWidth:48,textAlign:"right"}}>{ts.owned}<span style={{fontSize:11,color:"var(--muted)"}}>/{ts.total}</span></div>
                        <div style={{fontSize:11,fontWeight:700,color,minWidth:36,textAlign:"right"}}>{pct}%</div>
                        {pct===100&&<div style={{fontSize:14}}>✅</div>}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
            <div style={{padding:"10px 20px",borderTop:"1px solid var(--border)",background:"var(--card2)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:12,color:"var(--muted)"}}>Total obtenidas</span>
              <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,color:"var(--accent)"}}>{totalTeams+specialsOwned}<span style={{fontSize:13,color:"var(--muted)"}}>/{GRAND_TOTAL}</span> · {Math.round(((totalTeams+specialsOwned)/GRAND_TOTAL)*100)}%</span>
            </div>
          </div>
        </div>
      )}

      {/* DUPS MODAL */}
      {showDupsModal&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.8)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300,padding:16}} onClick={()=>setShowDupsModal(false)}>
          <div style={{background:"var(--card)",border:"1px solid #8b5cf6",borderRadius:16,width:"100%",maxWidth:500,maxHeight:"80vh",display:"flex",flexDirection:"column",overflow:"hidden"}} onClick={e=>e.stopPropagation()}>
            {/* Header */}
            <div style={{padding:"16px 20px",borderBottom:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"space-between",background:"var(--card2)"}}>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,color:"#8b5cf6",letterSpacing:1}}>🔁 MIS REPETIDAS ({allDupsList.length} estampas)</div>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                {allDupsList.length>0&&<button onClick={()=>setConfirmReset(true)} style={{padding:"5px 12px",background:"rgba(239,68,68,.15)",border:"1px solid var(--accent2)",borderRadius:7,color:"var(--accent2)",cursor:"pointer",fontSize:11,fontWeight:700}}>🗑 Reset</button>}
                <button onClick={()=>setShowDupsModal(false)} style={{background:"none",border:"none",color:"var(--muted)",cursor:"pointer",fontSize:22,lineHeight:1}}>×</button>
              </div>
            </div>
            {/* Team Filter */}
                {/* TEAM FILTER */}
                <div style={{padding:"10px 16px",borderBottom:"1px solid var(--border)",background:"rgba(0,0,0,.2)"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                    <span style={{fontSize:10,color:"var(--muted)",letterSpacing:2,textTransform:"uppercase",flex:1}}>Filtrar por selección</span>
                    {filterTeams.length>0&&<button onClick={clearFilter} style={{fontSize:10,padding:"2px 8px",background:"var(--card)",border:"1px solid var(--border)",borderRadius:5,color:"var(--muted)",cursor:"pointer"}}>Limpiar</button>}
                  </div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:5,maxHeight:90,overflowY:"auto"}}>
                    {allTeamsList.map(t=>{
                      const active=filterTeams.includes(t.code);
                      return(
                        <button key={t.code} onClick={()=>toggleFilter(t.code)}
                          style={{padding:"3px 8px",borderRadius:6,border:`1px solid ${active?"var(--accent)":"var(--border)"}`,background:active?"var(--accent)":"var(--card2)",color:active?"#000":"var(--muted)",cursor:"pointer",fontSize:11,fontWeight:600,display:"flex",alignItems:"center",gap:4,transition:"all .15s"}}>
                          <span>{flag(t.team)}</span><span>{t.code}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
            {/* Content */}
            <div style={{overflowY:"auto",padding:"16px 20px",flex:1}}>
              {(()=>{
                const filtered = filterTeams.length>0 ? allDupsList.filter(d=>filterTeams.includes(FIFA_CODE[d.team])||d.group==="ESP") : allDupsList;
                if(filtered.length===0) return <div style={{textAlign:"center",padding:32,color:"var(--muted)",fontSize:13}}>{filterTeams.length>0?"Sin repetidas en las selecciones filtradas.":"No tienes repetidas registradas."}</div>;
                const byTeam = {};
                filtered.forEach(d=>{
                  const k=d.team;
                  if(!byTeam[k]) byTeam[k]={group:d.group,items:[]};
                  byTeam[k].items.push(d);
                });
                return Object.entries(byTeam).map(([team,{group,items}])=>(
                    <div key={team} style={{marginBottom:16}}>
                      <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:14,color:"var(--accent)",marginBottom:8,letterSpacing:1}}>
                        {group!=="ESP"&&<>{flag(team)} {FIFA_CODE[team]||team} · <span style={{color:"var(--muted)",fontSize:12}}>{team}</span></>}
                        {group==="ESP"&&<>⭐ Especiales</>}
                      </div>
                      <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                        {items.map(item=>(
                          <div key={item.code} style={{display:"flex",alignItems:"center",gap:6,padding:"5px 10px",background:"rgba(139,92,246,.1)",border:"1px solid rgba(139,92,246,.35)",borderRadius:8}}>
                            <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:13,color:"#a78bfa",letterSpacing:.5}}>{item.code}</span>
                            <span style={{fontSize:11,color:"var(--muted)"}}>tengo</span>
                            <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:16,color:"#8b5cf6"}}>{item.dups}</span>
                            <span style={{fontSize:11,color:"var(--muted)"}}>de más</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ));
                })()
              }
            </div>
            {/* Footer total + export buttons */}
            {(()=>{
              const filteredD = filterTeams.length>0 ? allDupsList.filter(d=>filterTeams.includes(FIFA_CODE[d.team])||d.group==="ESP") : allDupsList;
              return(
                <div style={{padding:"12px 20px",borderTop:"1px solid var(--border)",background:"var(--card2)",display:"flex",flexDirection:"column",gap:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{fontSize:12,color:"var(--muted)"}}>Total{filterTeams.length>0?" (filtrado)":""} para intercambio</span>
                    <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:24,color:"#8b5cf6"}}>{filteredD.reduce((a,d)=>a+d.dups,0)}</span>
                  </div>
                  {filteredD.length>0&&(
                    <div style={{display:"flex",gap:8}}>
                      <button onClick={()=>{
                        const lines=["🔁 MIS REPETIDAS PANINI MUNDIAL 2026",""];
                        const byTeam={};
                        filteredD.forEach(d=>{const k=d.team;if(!byTeam[k])byTeam[k]=[];byTeam[k].push(d);});
                        Object.entries(byTeam).forEach(([team,items])=>{
                          lines.push(team==="Especiales"?"Especiales":`${team}`);
                          items.forEach(i=>lines.push(`  ${i.code} x${i.dups}`));
                          lines.push("");
                        });
                        lines.push(`Total: ${filteredD.reduce((a,d)=>a+d.dups,0)} estampas`);
                        navigator.clipboard.writeText(lines.join("\n")).then(()=>alert("Copiado!")).catch(()=>alert("No se pudo copiar"));
                      }} style={{flex:1,padding:"9px 0",background:"var(--card)",border:"1px solid var(--border)",borderRadius:8,color:"var(--text)",fontWeight:700,fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                        Copiar texto
                      </button>
                      <button onClick={()=>exportDupsImage(filteredD)} style={{flex:1,padding:"9px 0",background:"#8b5cf6",border:"none",borderRadius:8,color:"#fff",fontWeight:700,fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                        Exportar imagen
                      </button>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}

            {/* MISSING MODAL */}
      {showMissingModal&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.8)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300,padding:16}} onClick={()=>setShowMissingModal(false)}>
          <div style={{background:"var(--card)",border:"1px solid #ef4444",borderRadius:16,width:"100%",maxWidth:520,maxHeight:"80vh",display:"flex",flexDirection:"column",overflow:"hidden"}} onClick={e=>e.stopPropagation()}>
            <div style={{padding:"16px 20px",borderBottom:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"space-between",background:"var(--card2)"}}>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,color:"#ef4444",letterSpacing:1}}>🔍 MIS FALTANTES ({allMissingList.length})</div>
              <button onClick={()=>setShowMissingModal(false)} style={{background:"none",border:"none",color:"var(--muted)",cursor:"pointer",fontSize:22,lineHeight:1}}>×</button>
            </div>
            {/* Team Filter */}
                {/* TEAM FILTER */}
                <div style={{padding:"10px 16px",borderBottom:"1px solid var(--border)",background:"rgba(0,0,0,.2)"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                    <span style={{fontSize:10,color:"var(--muted)",letterSpacing:2,textTransform:"uppercase",flex:1}}>Filtrar por selección</span>
                    {filterTeams.length>0&&<button onClick={clearFilter} style={{fontSize:10,padding:"2px 8px",background:"var(--card)",border:"1px solid var(--border)",borderRadius:5,color:"var(--muted)",cursor:"pointer"}}>Limpiar</button>}
                  </div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:5,maxHeight:90,overflowY:"auto"}}>
                    {allTeamsList.map(t=>{
                      const active=filterTeams.includes(t.code);
                      return(
                        <button key={t.code} onClick={()=>toggleFilter(t.code)}
                          style={{padding:"3px 8px",borderRadius:6,border:`1px solid ${active?"var(--accent)":"var(--border)"}`,background:active?"var(--accent)":"var(--card2)",color:active?"#000":"var(--muted)",cursor:"pointer",fontSize:11,fontWeight:600,display:"flex",alignItems:"center",gap:4,transition:"all .15s"}}>
                          <span>{flag(t.team)}</span><span>{t.code}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
            <div style={{overflowY:"auto",padding:"16px 20px",flex:1}}>
              {(()=>{
                const filteredM = filterTeams.length>0 ? allMissingList.filter(d=>filterTeams.includes(FIFA_CODE[d.team])||d.group==="ESP") : allMissingList;
                if(filteredM.length===0) return <div style={{textAlign:"center",padding:32,color:"var(--muted)",fontSize:13}}>{filterTeams.length>0?"Sin faltantes en las selecciones filtradas. ¡Colección completa!":"¡No te falta ninguna!"}</div>;
                const byTeam={};
                filteredM.forEach(d=>{
                  if(!byTeam[d.team])byTeam[d.team]={group:d.group,items:[]};
                  byTeam[d.team].items.push(d);
                });
                return Object.entries(byTeam).map(([team,{group,items}])=>(
                  <div key={team} style={{marginBottom:14}}>
                    <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:13,color:"var(--accent)",marginBottom:6,letterSpacing:1}}>
                      {group!=="ESP"?<>{flag(team)} {FIFA_CODE[team]} · <span style={{color:"var(--muted)",fontSize:11}}>{team}</span></>:<>⭐ Especiales</>}
                      <span style={{color:"var(--muted)",fontSize:11,marginLeft:8,fontFamily:"sans-serif"}}>({items.length} faltantes)</span>
                    </div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                      {items.map(item=>(
                        <span key={item.code} style={{padding:"3px 9px",borderRadius:6,background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",fontSize:11,fontWeight:700,color:"#fca5a5",fontFamily:"'Bebas Neue',sans-serif",letterSpacing:.5}}>
                          {item.code}
                        </span>
                      ))}
                    </div>
                  </div>
                ));
              })()}
            </div>
            {(()=>{
              const filteredM2 = filterTeams.length>0 ? allMissingList.filter(d=>filterTeams.includes(FIFA_CODE[d.team])||d.group==="ESP") : allMissingList;
              return(
            <div style={{padding:"12px 20px",borderTop:"1px solid var(--border)",background:"var(--card2)",display:"flex",flexDirection:"column",gap:10}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:12,color:"var(--muted)"}}>Total{filterTeams.length>0?" (filtrado)":""} que necesito</span>
                <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:24,color:"#ef4444"}}>{filteredM2.length}</span>
              </div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>{
                  const lines=["🔍 MIS FALTANTES PANINI MUNDIAL 2026",""];
                  const byTeam={};
                  filteredM2.forEach(d=>{if(!byTeam[d.team])byTeam[d.team]=[];byTeam[d.team].push(d.code);});
                  Object.entries(byTeam).forEach(([team,codes])=>{
                    lines.push(team==="Especiales"?"⭐ Especiales":`${team}`);
                    lines.push(`  ${codes.join(", ")}`);
                    lines.push("");
                  });
                  lines.push(`Total: ${allMissingList.length} estampas`);
                  navigator.clipboard.writeText(lines.join("\n")).then(()=>alert("¡Copiado!")).catch(()=>alert("No se pudo copiar"));
                }} style={{flex:1,padding:"9px 0",background:"var(--card)",border:"1px solid var(--border)",borderRadius:8,color:"var(--text)",fontWeight:700,fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                  📋 Copiar texto
                </button>
                <button onClick={()=>exportMissingImage(filteredM2)}
                  style={{flex:1,padding:"9px 0",background:"#ef4444",border:"none",borderRadius:8,color:"#fff",fontWeight:700,fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                  📥 Exportar imagen
                </button>
              </div>
            </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* STATS */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:10,marginBottom:16}}>
        {[
          {label:"Total obtenidas",val:totalTeams+specialsOwned,total:GRAND_TOTAL,color:"var(--accent)",onClick:()=>setShowOwnedModal(true)},
          {label:"Equipos",val:totalTeams,total:TOTAL_TEAM_STICKERS,color:"var(--green)",onClick:()=>setShowOwnedModal(true)},
          {label:"Especiales",val:specialsOwned,total:TOTAL_SPECIALS,color:"var(--blue)"},
          {label:"Repetidas",val:totalDups,total:null,color:"#8b5cf6",onClick:()=>setShowDupsModal(true)},
          {label:"Faltantes",val:allMissingList.length,total:null,color:"#ef4444",onClick:()=>setShowMissingModal(true)},
        ].map(s=>(
          <div key={s.label}
            onClick={s.onClick&&s.val>0?s.onClick:undefined}
            style={{background:"var(--card)",border:`1px solid ${s.onClick&&s.val>0?s.color:"var(--border)"}`,borderRadius:10,padding:"12px 14px",cursor:s.onClick&&s.val>0?"pointer":"default",transition:"border-color .2s"}}>
            <div style={{fontSize:9,color:"var(--muted)",letterSpacing:2,textTransform:"uppercase",marginBottom:4}}>
              {s.label}{s.onClick&&s.val>0&&<span style={{marginLeft:6,fontSize:9,color:s.color}}>VER →</span>}
            </div>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:26,color:s.color,lineHeight:1}}>{s.val}{s.total!==null&&<span style={{fontSize:13,color:"var(--muted)"}}>/{s.total}</span>}</div>
            <div style={{height:3,background:"var(--border)",borderRadius:2,marginTop:6,overflow:"hidden"}}>
              {s.total!==null&&<div style={{height:"100%",background:s.color,width:`${(s.val/s.total)*100}%`,transition:"width .5s"}}/>}
              {s.total===null&&<div style={{height:"100%",background:s.color,width:s.val>0?"100%":"0%"}}/>}
            </div>
          </div>
        ))}
      </div>

      {/* SEARCH BAR */}
      <div style={{marginBottom:16}}>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <div style={{position:"relative",flex:1}}>
            <input
              value={searchQuery}
              onChange={e=>{setSearchQuery(e.target.value);if(!e.target.value)setSearchResult(null);}}
              onKeyDown={e=>e.key==="Enter"&&doSearch(searchQuery)}
              placeholder="Buscar estampa... ej: MEX01, FWC03, CC07"
              style={{width:"100%",padding:"10px 14px",paddingRight:40,background:"var(--card2)",border:"1px solid var(--border)",borderRadius:10,color:"var(--text)",fontSize:13,outline:"none",fontFamily:"'Barlow',sans-serif"}}
              onFocus={e=>e.target.style.borderColor="var(--accent)"}
              onBlur={e=>e.target.style.borderColor="var(--border)"}
            />
            {searchQuery&&<button onClick={()=>{setSearchQuery("");setSearchResult(null);}}
              style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:"var(--muted)",cursor:"pointer",fontSize:16,lineHeight:1}}>×</button>}
          </div>
          <button onClick={()=>doSearch(searchQuery)}
            style={{padding:"10px 20px",background:"var(--accent)",border:"none",borderRadius:10,color:"#000",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:1,whiteSpace:"nowrap"}}>
            🔍 Buscar
          </button>
        </div>

        {/* SEARCH RESULT */}
        {searchResult&&(
          <div style={{marginTop:10,padding:"14px 16px",borderRadius:10,border:`2px solid ${
            searchResult.type==="notfound"?"var(--accent2)":
            searchResult.owned?"var(--green)":"var(--border)"}`,
            background:searchResult.type==="notfound"?"rgba(239,68,68,0.07)":searchResult.owned?"rgba(16,185,129,0.08)":"var(--card2)",
            display:"flex",alignItems:"center",gap:14}}>
            {searchResult.type==="notfound"?(
              <>
                <div style={{fontSize:32}}>❓</div>
                <div>
                  <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:20,color:"var(--accent2)"}}>{searchResult.code}</div>
                  <div style={{fontSize:12,color:"var(--muted)"}}>Código no encontrado. Verifica que esté bien escrito.</div>
                </div>
              </>
            ):(
              <>
                <div style={{fontSize:36}}>{searchResult.type==="special"?"⭐":flag(searchResult.team)}</div>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                    <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,color:"var(--accent)"}}>{searchResult.code}</span>
                    {searchResult.type==="team"&&<span style={{fontSize:11,color:"var(--muted)"}}>{searchResult.team}</span>}
                    {searchResult.type==="special"&&<span style={{fontSize:11,color:"var(--muted)"}}>Especiales</span>}
                  </div>
                  <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                    {searchResult.owned?(
                      <span style={{padding:"3px 10px",borderRadius:20,background:"rgba(16,185,129,0.2)",border:"1px solid var(--green)",fontSize:12,fontWeight:700,color:"var(--green)"}}>✓ Obtenida</span>
                    ):(
                      <span style={{padding:"3px 10px",borderRadius:20,background:"rgba(239,68,68,0.15)",border:"1px solid var(--accent2)",fontSize:12,fontWeight:700,color:"var(--accent2)"}}>✗ Faltante</span>
                    )}
                    {searchResult.owned&&searchResult.dups>0&&(
                      <span style={{padding:"3px 10px",borderRadius:20,background:"rgba(139,92,246,0.15)",border:"1px solid #8b5cf6",fontSize:12,fontWeight:700,color:"#a78bfa"}}>🔁 {searchResult.dups} repetida{searchResult.dups>1?"s":""}</span>
                    )}
                    {searchResult.owned&&searchResult.dups===0&&(
                      <span style={{padding:"3px 10px",borderRadius:20,background:"rgba(100,116,139,0.15)",border:"1px solid var(--border)",fontSize:12,color:"var(--muted)"}}>Sin repetidas</span>
                    )}
                  </div>
                </div>
                {/* Quick toggle */}
                {searchResult.type==="team"&&(
                  <button onClick={()=>{
                    if(searchResult.owned) setConfirm({type:"team",code:searchResult.fc,idx:searchResult.idx});
                    else { onToggle(searchResult.fc,searchResult.idx,true); setSearchResult(r=>({...r,owned:true})); }
                  }} style={{padding:"8px 14px",borderRadius:8,border:`1px solid ${searchResult.owned?"var(--accent2)":"var(--green)"}`,background:searchResult.owned?"rgba(239,68,68,.1)":"rgba(16,185,129,.1)",color:searchResult.owned?"var(--accent2)":"var(--green)",cursor:"pointer",fontSize:12,fontWeight:700,whiteSpace:"nowrap"}}>
                    {searchResult.owned?"✕ Desmarcar":"✓ Marcar"}
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* BACK */}
      {(selGroup||selTeam)&&(
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
          <button onClick={()=>{if(selTeam)setSelTeam(null);else setSelGroup(null);}}
            style={{padding:"6px 14px",background:"var(--card2)",border:"1px solid var(--border)",borderRadius:7,color:"var(--muted)",cursor:"pointer",fontSize:12,fontWeight:600}}>
            ← Atrás
          </button>
          <span style={{fontSize:12,color:"var(--muted)"}}>
            {selGroup&&`Grupo ${selGroup}`}{selTeam&&` → ${FIFA_CODE[selTeam]} · ${selTeam}`}
          </span>
        </div>
      )}

      {/* L1 GROUPS */}
      {!selGroup&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:10}}>
          <div onClick={()=>setSelGroup("ESP")}
            style={{background:"var(--card)",border:"1px solid var(--blue)",borderRadius:11,padding:"14px 16px",cursor:"pointer"}}
            onMouseEnter={e=>e.currentTarget.style.opacity=".8"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:18,color:"var(--blue)"}}>⭐ ESPECIALES</div>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:16,color:"var(--blue)"}}>{specialsOwned}/{TOTAL_SPECIALS}</div>
            </div>
            <div style={{fontSize:10,color:"var(--muted)",marginBottom:6}}>FWC01–FWC19 · CC01–CC14</div>
            <div style={{height:4,background:"var(--border)",borderRadius:2,overflow:"hidden"}}>
              <div style={{height:"100%",background:"var(--blue)",width:`${(specialsOwned/TOTAL_SPECIALS)*100}%`}}/>
            </div>
          </div>
          {Object.entries(PANINI_GROUPS).map(([group,teams])=>{
            const gs=groupStats[group];
            const pct=(gs.owned/gs.total)*100;
            return(
              <div key={group} onClick={()=>setSelGroup(group)}
                style={{background:"var(--card)",border:`1px solid ${pct===100?"var(--green)":"var(--border)"}`,borderRadius:11,padding:"14px 16px",cursor:"pointer",transition:"border-color .15s"}}
                onMouseEnter={e=>e.currentTarget.style.borderColor="var(--accent)"}
                onMouseLeave={e=>e.currentTarget.style.borderColor=pct===100?"var(--green)":"var(--border)"}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                  <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:20,color:"var(--accent)"}}>GRUPO {group}</div>
                  <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:16,color:pct===100?"var(--green)":"var(--text)"}}>{gs.owned}/{gs.total}</div>
                </div>
                <div style={{fontSize:16,marginBottom:6,letterSpacing:2}}>{teams.map(t=>flag(t)).join("  ")}</div>
                <div style={{height:4,background:"var(--border)",borderRadius:2,overflow:"hidden"}}>
                  <div style={{height:"100%",background:pct===100?"var(--green)":"var(--accent)",width:`${pct}%`,transition:"width .5s"}}/>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ESPECIALES PANEL */}
      {selGroup==="ESP"&&(
        <div className="card">
          <div className="card-title">
            <span>⭐ Estampas Especiales</span>
            <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:18,color:"var(--blue)"}}>{specialsOwned}/{TOTAL_SPECIALS}</span>
          </div>
          <div className="card-body">
            {[{list:SPECIALS_FCW,label:"FIFA WORLD CUP",color:"var(--accent)"},{list:SPECIALS_CC,label:"COCA-COLA",color:"#ef4444"}].map(section=>(
              <div key={section.label} style={{marginBottom:20}}>
                <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:13,color:section.color,letterSpacing:1,marginBottom:8}}>{section.label}</div>
                <div style={{display:"flex",flexDirection:"column",gap:5}}>
                  {section.list.map(code=>{
                    const s=panini?.specials?.[code]||{};
                    const dups=s.dups||0;
                    return(
                      <div key={code} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 12px",background:s.owned?"rgba(16,185,129,0.08)":"var(--card2)",borderRadius:8,border:`1px solid ${s.owned?"var(--green)":"var(--border)"}`}}>
                        <button onClick={()=>handleSpecial(code)}
                          style={{width:32,height:32,borderRadius:6,flexShrink:0,border:`1px solid ${s.owned?"var(--green)":"var(--border)"}`,background:s.owned?"var(--green)":"var(--card)",color:s.owned?"#000":"var(--muted)",cursor:"pointer",fontSize:14,fontWeight:700,transition:"all .15s"}}>
                          {s.owned?"✓":"○"}
                        </button>
                        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:15,color:s.owned?"var(--text)":section.color,flex:1,letterSpacing:.5}}>{code}</div>
                        {s.owned&&(
                          <div style={{display:"flex",alignItems:"center",gap:4,flexShrink:0}}>
                            <button onClick={()=>onDup("special_"+code,0,Math.max(0,dups-1))}
                              style={{width:22,height:22,borderRadius:4,border:"1px solid var(--border)",background:"var(--card)",color:"var(--muted)",cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center"}}>−</button>
                            <div style={{minWidth:20,textAlign:"center",fontFamily:"'Bebas Neue',sans-serif",fontSize:16,color:dups>0?"#8b5cf6":"var(--muted)"}}>{dups>0?dups:"·"}</div>
                            <button onClick={()=>onDup("special_"+code,0,dups+1)}
                              style={{width:22,height:22,borderRadius:4,border:"1px solid var(--border)",background:"var(--card)",color:"#8b5cf6",cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center"}}>＋</button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* L2 TEAMS */}
      {selGroup&&selGroup!=="ESP"&&!selTeam&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:10}}>
          {PANINI_GROUPS[selGroup].map(team=>{
            const code=FIFA_CODE[team];
            const ts=teamStats[code]||{owned:0,total:20};
            const pct=(ts.owned/ts.total)*100;
            return(
              <div key={team} onClick={()=>setSelTeam(team)}
                style={{background:"var(--card)",border:`1px solid ${pct===100?"var(--green)":"var(--border)"}`,borderRadius:11,padding:16,cursor:"pointer",textAlign:"center",transition:"border-color .15s"}}
                onMouseEnter={e=>e.currentTarget.style.borderColor="var(--accent)"}
                onMouseLeave={e=>e.currentTarget.style.borderColor=pct===100?"var(--green)":"var(--border)"}>
                <div style={{fontSize:34,marginBottom:4}}>{flag(team)}</div>
                <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,color:"var(--accent)",letterSpacing:1}}>{code}</div>
                <div style={{fontSize:11,color:"var(--muted)",marginBottom:6}}>{team}</div>
                <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,color:pct===100?"var(--green)":"var(--text)"}}>
                  {ts.owned}<span style={{fontSize:13,color:"var(--muted)"}}>/{ts.total}</span>
                </div>
                {(teamDups[code]||0)>0&&<div onClick={e=>{e.stopPropagation();setSelTeam(team);setSelGroup(group);setTimeout(()=>setShowDupsModal(true),50);}} style={{marginTop:4,fontSize:10,color:"#8b5cf6",fontWeight:700,cursor:"pointer",textDecoration:"underline"}}>🔁 {teamDups[code]} repetida{teamDups[code]>1?"s":""}</div>}
                <div style={{height:4,background:"var(--border)",borderRadius:2,marginTop:8,overflow:"hidden"}}>
                  <div style={{height:"100%",background:pct===100?"var(--green)":"var(--accent)",width:`${pct}%`,transition:"width .5s"}}/>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* L3 STICKERS */}
      {selGroup&&selGroup!=="ESP"&&selTeam&&(()=>{
        const code=FIFA_CODE[selTeam];
        const stickers=buildStickers(selTeam);
        const ts=teamStats[code]||{owned:0};

        // Navigation: flat list of all teams in order
        const allTeams=Object.entries(PANINI_GROUPS).flatMap(([g,teams])=>teams.map(t=>({team:t,group:g})));
        const curIdx=allTeams.findIndex(x=>x.team===selTeam);
        const prevTeam=curIdx>0?allTeams[curIdx-1]:null;
        const nextTeam=curIdx<allTeams.length-1?allTeams[curIdx+1]:null;
        // Also compute prev/next group
        const groupKeys=Object.keys(PANINI_GROUPS);
        const curGroupIdx=groupKeys.indexOf(selGroup);
        const prevGroup=curGroupIdx>0?groupKeys[curGroupIdx-1]:null;
        const nextGroup=curGroupIdx<groupKeys.length-1?groupKeys[curGroupIdx+1]:null;

        return(
          <div className="card">
            <div style={{background:"var(--card2)",borderBottom:"1px solid var(--border)",padding:"10px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
              <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:18,letterSpacing:1}}>{flag(selTeam)} <span style={{color:"var(--accent)"}}>{code}</span> · {selTeam}</span>
              <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                {(teamDups[code]||0)>0&&<span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:15,color:"#8b5cf6"}}>🔁 {teamDups[code]} rep.</span>}
                <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:20,color:"var(--accent)"}}>{ts.owned}/20</span>
              </div>
            </div>
            {/* NAV BUTTONS */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 14px",background:"var(--card2)",borderBottom:"1px solid var(--border)",gap:8,flexWrap:"wrap"}}>
              <div style={{display:"flex",gap:6}}>
                {prevGroup&&<button onClick={()=>{setSelTeam(null);setSelGroup(prevGroup);}}
                  style={{padding:"5px 12px",background:"var(--card)",border:"1px solid var(--border)",borderRadius:7,color:"var(--muted)",cursor:"pointer",fontSize:11,fontWeight:600}}>
                  ← Grupo {prevGroup}
                </button>}
                {prevTeam&&<button onClick={()=>{setSelTeam(prevTeam.team);setSelGroup(prevTeam.group);}}
                  style={{padding:"5px 12px",background:"var(--card)",border:"1px solid var(--accent)",borderRadius:7,color:"var(--accent)",cursor:"pointer",fontSize:11,fontWeight:600}}>
                  ← {FIFA_CODE[prevTeam.team]}
                </button>}
              </div>
              <div style={{display:"flex",gap:6}}>
                {nextTeam&&<button onClick={()=>{setSelTeam(nextTeam.team);setSelGroup(nextTeam.group);}}
                  style={{padding:"5px 12px",background:"var(--card)",border:"1px solid var(--accent)",borderRadius:7,color:"var(--accent)",cursor:"pointer",fontSize:11,fontWeight:600}}>
                  {FIFA_CODE[nextTeam.team]} →
                </button>}
                {nextGroup&&<button onClick={()=>{setSelTeam(null);setSelGroup(nextGroup);}}
                  style={{padding:"5px 12px",background:"var(--card)",border:"1px solid var(--border)",borderRadius:7,color:"var(--muted)",cursor:"pointer",fontSize:11,fontWeight:600}}>
                  Grupo {nextGroup} →
                </button>}
              </div>
            </div>
            <div className="card-body">
              {/* Repetidas summary */}
              {(teamDups[code]||0)>0&&(()=>{
                const repList=[];
                for(let i=0;i<STICKERS_PER_TEAM;i++){
                  const d=panini?.dups?.[code]?.[i]||0;
                  if(d>0){
                    const sc=buildStickers(selTeam)[i];
                    repList.push({code:sc.code,num:sc.num,dups:d});
                  }
                }
                return(
                  <div style={{marginBottom:12,padding:"10px 12px",background:"rgba(139,92,246,.08)",borderRadius:8,border:"1px solid rgba(139,92,246,.3)"}}>
                    <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:12,color:"#8b5cf6",letterSpacing:1,marginBottom:6}}>🔁 REPETIDAS</div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                      {repList.map(r=>(
                        <span key={r.code} style={{padding:"3px 10px",borderRadius:20,background:"rgba(139,92,246,.15)",border:"1px solid rgba(139,92,246,.4)",fontSize:11,fontWeight:700,color:"#a78bfa"}}>
                          {r.code} ×{r.dups}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })()}
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(145px,1fr))",gap:7}}>
                {stickers.map((s,idx)=>{
                  const owned=panini?.teams?.[code]?.[idx];
                  const special=s.type==="stadium"||s.type==="team";
                  const bColor=owned?"var(--green)":special?typeColor(s.type):"var(--border)";
                  return(
                    <div key={idx}
                      style={{padding:"8px 10px",borderRadius:8,transition:"border-color .15s",
                        background:owned?"rgba(16,185,129,0.1)":"var(--card2)",
                        border:`1px solid ${bColor}`,
                        display:"flex",alignItems:"center",gap:6}}>
                      {/* Main toggle */}
                      <div onClick={()=>handleSticker(code,idx)} style={{cursor:"pointer",width:32,height:32,borderRadius:6,flexShrink:0,
                        background:owned?"var(--green)":special?"rgba(245,158,11,.1)":"var(--card)",
                        border:`1px solid ${owned?"var(--green)":special?typeColor(s.type):"var(--border)"}`,
                        display:"flex",alignItems:"center",justifyContent:"center",
                        fontFamily:"'Bebas Neue',sans-serif",fontSize:15,
                        color:owned?"#000":special?typeColor(s.type):"var(--muted)"}}>
                        {owned?"✓":s.num}
                      </div>
                      <div style={{flex:1,minWidth:0,cursor:"pointer"}} onClick={()=>handleSticker(code,idx)}>
                        <div style={{fontSize:14,fontWeight:700,color:"var(--accent)",fontFamily:"'Bebas Neue',sans-serif",letterSpacing:1}}>{s.code}</div>
                        {special&&<div style={{fontSize:10,color:typeColor(s.type),letterSpacing:1,fontWeight:700,textTransform:"uppercase"}}>{s.type==="shield"?"Escudo":"Foto Equipo"}</div>}
                      </div>
                      {/* Duplicates counter — only shown when sticker is owned */}
                      {owned&&(()=>{
                        const dups=panini?.dups?.[code]?.[idx]||0;
                        return(
                          <div style={{display:"flex",alignItems:"center",gap:3,flexShrink:0}}>
                            <button onClick={e=>{e.stopPropagation();if(dups>0)onDup(code,idx,dups-1);}}
                              style={{width:20,height:20,borderRadius:4,border:"1px solid var(--border)",background:"var(--card)",color:"var(--muted)",cursor:"pointer",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1}}>−</button>
                            <div style={{minWidth:18,textAlign:"center",fontFamily:"'Bebas Neue',sans-serif",fontSize:15,color:dups>0?"#8b5cf6":"var(--muted)"}}>
                              {dups>0?dups:"·"}
                            </div>
                            <button onClick={e=>{e.stopPropagation();onDup(code,idx,dups+1);}}
                              style={{width:20,height:20,borderRadius:4,border:"1px solid var(--border)",background:"var(--card)",color:"#8b5cf6",cursor:"pointer",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1}}>＋</button>
                          </div>
                        );
                      })()}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

export { PaniniSection, PANINI_GROUPS, GRAND_TOTAL, TOTAL_SPECIALS, FIFA_CODE, flag as paniniFlag };
