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

function PaniniSection({ panini, onToggle, onToggleSpecial, onSpecialLabel, onDup }) {
  const [selGroup, setSelGroup] = useState(null);
  const [selTeam,  setSelTeam]  = useState(null);
  const [confirm,  setConfirm]  = useState(null);
  const { groupStats, teamStats, teamDups, totalTeams, totalDups, specialsOwned } = usePaniniStats(panini);

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

      {/* STATS */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:10,marginBottom:16}}>
        {[
          {label:"Total obtenidas",val:totalTeams+specialsOwned,total:GRAND_TOTAL,color:"var(--accent)"},
          {label:"Equipos",val:totalTeams,total:TOTAL_TEAM_STICKERS,color:"var(--green)"},
          {label:"Especiales",val:specialsOwned,total:TOTAL_SPECIALS,color:"var(--blue)"},
          {label:"Repetidas",val:totalDups,total:null,color:"#8b5cf6"},
        ].map(s=>(
          <div key={s.label} style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:10,padding:"12px 14px"}}>
            <div style={{fontSize:9,color:"var(--muted)",letterSpacing:2,textTransform:"uppercase",marginBottom:4}}>{s.label}</div>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:26,color:s.color,lineHeight:1}}>{s.val}{s.total!==null&&<span style={{fontSize:13,color:"var(--muted)"}}>/{s.total}</span>}</div>
            <div style={{height:3,background:"var(--border)",borderRadius:2,marginTop:6,overflow:"hidden"}}>
              {s.total!==null&&<div style={{height:"100%",background:s.color,width:`${(s.val/s.total)*100}%`,transition:"width .5s"}}/>}
              {s.total===null&&<div style={{height:"100%",background:s.color,width:s.val>0?"100%":"0%"}}/>}
            </div>
          </div>
        ))}
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
                <div style={{fontSize:10,color:"var(--muted)",marginBottom:6}}>{teams.map(t=>FIFA_CODE[t]).join("  ·  ")}</div>
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
                {(teamDups[code]||0)>0&&<div style={{marginTop:4,fontSize:10,color:"#8b5cf6",fontWeight:700}}>🔁 {teamDups[code]} repetida{teamDups[code]>1?"s":""}</div>}
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
        return(
          <div className="card">
            <div className="card-title">
              <span>{flag(selTeam)} <span style={{color:"var(--accent)"}}>{code}</span> · {selTeam}</span>
              <div style={{display:"flex",gap:12,alignItems:"center"}}>
                <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:20,color:"var(--accent)"}}>{ts.owned}/20</span>
                {(teamDups[code]||0)>0&&<span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:16,color:"#8b5cf6"}}>🔁 {teamDups[code]} rep.</span>}
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
                        fontFamily:"'Bebas Neue',sans-serif",fontSize:12,
                        color:owned?"#000":special?typeColor(s.type):"var(--muted)"}}>
                        {owned?"✓":s.num}
                      </div>
                      <div style={{flex:1,minWidth:0,cursor:"pointer"}} onClick={()=>handleSticker(code,idx)}>
                        <div style={{fontSize:10,fontWeight:700,color:"var(--accent)",fontFamily:"'Bebas Neue',sans-serif",letterSpacing:.5}}>{s.code}</div>
                        {special&&<div style={{fontSize:9,color:typeColor(s.type),letterSpacing:1,fontWeight:700,textTransform:"uppercase"}}>{s.type==="shield"?"Escudo":"Foto Equipo"}</div>}
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

export { PaniniSection, PANINI_GROUPS, GRAND_TOTAL, TOTAL_SPECIALS };
