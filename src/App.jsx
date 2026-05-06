import { useState, useMemo, useEffect, useCallback } from "react";
import { PaniniSection, PANINI_GROUPS, GRAND_TOTAL, TOTAL_SPECIALS, FIFA_CODE, paniniFlag } from "./Panini.jsx";
import { db } from "./firebase";
import { ref, onValue, set, update, get } from "firebase/database";

// ─── AUTH ─────────────────────────────────────────────────────────────────────
const ADMIN = { name: "Aldley", pin: "180613", isAdmin: true };

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const INAUGURAL = new Date("2026-06-11T12:00:00-06:00");

const GROUPS_DATA = {
  A:{teams:["México","Corea del Sur","Sudáfrica","Rep. Checa"]},
  B:{teams:["Canadá","Suiza","Qatar","Bosnia y Herz."]},
  C:{teams:["Brasil","Marruecos","Escocia","Haití"]},
  D:{teams:["Estados Unidos","Australia","Paraguay","Turquía"]},
  E:{teams:["Alemania","Ecuador","Costa de Marfil","Curazao"]},
  F:{teams:["Países Bajos","Japón","Túnez","Suecia"]},
  G:{teams:["Bélgica","Irán","Egipto","Nueva Zelanda"]},
  H:{teams:["España","Uruguay","Cabo Verde","Arabia Saudita"]},
  I:{teams:["Francia","Senegal","Noruega","Irak"]},
  J:{teams:["Argentina","Argelia","Austria","Jordania"]},
  K:{teams:["Portugal","Colombia","Uzbekistán","RD del Congo"]},
  L:{teams:["Inglaterra","Croacia","Panamá","Ghana"]},
};

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
const short = (t) => t ? (t.length > 10 ? t.split(" ")[0] : t) : "TBD";

const PLAYER_POOL = {
  México:["Guillermo Ochoa","Edson Álvarez","Hirving Lozano","Santiago Giménez","Raúl Jiménez","César Montes","Alexis Vega","Roberto Alvarado"],
  "Corea del Sur":["Son Heung-min","Kim Min-jae","Lee Kang-in","Hwang Hee-chan","Oh Hyeon-gyu","Kwon Chang-hoon","Hwang In-beom","Jo Hyeon-woo"],
  Sudáfrica:["Ronwen Williams","Siyanda Xulu","Mothobi Mvala","Percy Tau","Lyle Foster","Themba Zwane","Teboho Mokoena","Evidence Makgopa"],
  "Rep. Checa":["Tomáš Vaclík","Tomáš Souček","Vladimír Coufal","Patrik Schick","Adam Hložek","Ondřej Lingr","Lukáš Provod","Jakub Jankto"],
  Canadá:["Milan Borjan","Alphonso Davies","Jonathan David","Cyle Larin","Stephen Eustáquio","Tajon Buchanan","Atiba Hutchinson","Richie Laryea"],
  Suiza:["Yann Sommer","Manuel Akanji","Nico Elvedi","Granit Xhaka","Xherdan Shaqiri","Breel Embolo","Remo Freuler","Noah Okafor"],
  Qatar:["Saad Al Sheeb","Pedro Miguel","Abdelkarim Hassan","Hassan Al-Haydos","Almoez Ali","Akram Afif","Assim Madibo","Homam Ahmed"],
  "Bosnia y Herz.":["Ibrahim Šehić","Ermin Bičakčić","Sead Kolašinac","Miralem Pjanić","Edin Džeko","Anel Ahmedhodžić","Haris Duljevic","Nedim Bajrami"],
  Brasil:["Alisson Becker","Marquinhos","Thiago Silva","Vinicius Jr.","Rodrygo","Richarlison","Casemiro","Endrick"],
  Marruecos:["Yassine Bounou","Achraf Hakimi","Nayef Aguerd","Sofyan Amrabat","Hakim Ziyech","Youssef En-Nesyri","Azzedine Ounahi","Noussair Mazraoui"],
  Escocia:["Craig Gordon","Andrew Robertson","Scott McTominay","John McGinn","Lyndon Dykes","Che Adams","Ryan Christie","Kieran Tierney"],
  Haití:["Josué Duverger","Mechak Jérôme","Steeven Saba","Duckens Nazon","Wilde-Donald Guerrier","Kevin Lafrance","Nicolas Géus","Randy Étienne"],
  "Estados Unidos":["Matt Turner","Sergino Dest","Chris Richards","Tyler Adams","Christian Pulisic","Weston McKennie","Gio Reyna","Ricardo Pepi"],
  Australia:["Mat Ryan","Harry Souttar","Aaron Mooy","Mathew Leckie","Adam Taggart","Mitchell Duke","Jackson Irvine","Ajdin Hrustic"],
  Paraguay:["Antony Silva","Gustavo Gómez","Junior Alonso","Miguel Almirón","Ángel Romero","Richard Sánchez","Alejandro Romero","Braian Samudio"],
  Turquía:["Uğurcan Çakır","Merih Demiral","Çağlar Söyüncü","Hakan Çalhanoğlu","Burak Yılmaz","Kerem Aktürkoğlu","Arda Güler","Zeki Çelik"],
  Alemania:["Manuel Neuer","Antonio Rüdiger","Toni Kroos","Jamal Musiala","Leroy Sané","Kai Havertz","İlkay Gündoğan","Joshua Kimmich"],
  Ecuador:["Alexander Domínguez","Piero Hincapié","Byron Castillo","Moisés Caicedo","Ángel Mena","Enner Valencia","Jeremy Sarmiento","Gonzalo Plata"],
  "Costa de Marfil":["Yahia Fofana","Serge Aurier","Wilfried Zaha","Franck Kessié","Sébastien Haller","Nicolas Pépé","Jean-Philippe Krasso","Oumar Diakité"],
  Curazao:["Eloy Room","Cuco Martina","Leandro Bacuna","Jurien Gaari","Rangelo Janga","Jairon Vicario","Quentin Thureau","Myron Boadu"],
  "Países Bajos":["Virgil van Dijk","Matthijs de Ligt","Frenkie de Jong","Cody Gakpo","Memphis Depay","Xavi Simons","Wout Weghorst","Denzel Dumfries"],
  Japón:["Shuichi Gonda","Maya Yoshida","Takehiro Tomiyasu","Daichi Kamada","Takumi Minamino","Kaoru Mitoma","Ritsu Doan","Ao Tanaka"],
  Túnez:["Aymen Dahmen","Montassar Talbi","Dylan Bronn","Wahbi Khazri","Youssef Msakni","Hannibal Mejbri","Naim Sliti","Ellyes Skhiri"],
  Suecia:["Robin Olsen","Victor Lindelöf","Ludwig Augustinsson","Emil Forsberg","Alexander Isak","Dejan Kulusevski","Viktor Gyökeres","Mattias Svanberg"],
  Bélgica:["Thibaut Courtois","Jan Vertonghen","Kevin De Bruyne","Romelu Lukaku","Eden Hazard","Yannick Carrasco","Axel Witsel","Amadou Onana"],
  Irán:["Alireza Beiranvand","Ehsan Hajsafi","Morteza Pouraliganji","Sardar Azmoun","Mehdi Taremi","Ali Gholizadeh","Saman Ghoddos","Karim Ansarifard"],
  Egipto:["Mohamed El-Shenawy","Ahmed Hegazi","Ahmed Fathy","Mohamed Salah","Mostafa Mohamed","Amr El-Sulaya","Tarek Hamed","Marwan Hamdy"],
  "Nueva Zelanda":["Stefan Marinovic","Tommy Smith","Winston Reid","Ryan Thomas","Chris Wood","Liberato Cacace","Matthew Garbett","Elijah Just"],
  España:["Unai Simón","Dani Carvajal","Pedri","Gavi","Dani Olmo","Álvaro Morata","Rodri","Lamine Yamal"],
  Uruguay:["Sergio Rochet","Ronald Araújo","José María Giménez","Federico Valverde","Darwin Núñez","Luis Suárez","Rodrigo Bentancur","Facundo Pellistri"],
  "Cabo Verde":["Vozinha","Dylan Tavares","Stopira","Garry Rodrigues","Ryan Mendes","Jamiro Monteiro","Julio Tavares","Kenny Rocha"],
  "Arabia Saudita":["Mohammed Al-Owais","Ali Al-Bulayhi","Yasser Al-Shahrani","Salem Al-Dawsari","Firas Al-Buraikan","Abdullah Al-Hamdan","Sami Al-Najei","Mohammed Kanno"],
  Francia:["Mike Maignan","Raphaël Varane","Kylian Mbappé","Antoine Griezmann","Ousmane Dembélé","Aurélien Tchouaméni","Théo Hernández","Marcus Thuram"],
  Senegal:["Édouard Mendy","Kalidou Koulibaly","Sadio Mané","Idrissa Gueye","Ismaïla Sarr","Krepin Diatta","Bamba Dieng","Pape Matar Sarr"],
  Noruega:["Ørjan Nyland","Stefan Strandberg","Sander Berge","Martin Ødegaard","Erling Haaland","Alexander Sørloth","Mohamed Elyounoussi","Veton Berisha"],
  Irak:["Jalal Hassan","Ali Adnan","Amjed Attwan","Alaa Abbas","Aymen Hussein","Mohanad Ali","Ahmed Ibrahim","Bashar Resan"],
  Argentina:["Emiliano Martínez","Nicolás Otamendi","Lionel Messi","Rodrigo De Paul","Julián Álvarez","Lautaro Martínez","Alexis Mac Allister","Enzo Fernández"],
  Argelia:["Raïs M'Bolhi","Ramy Bensebaini","Ismael Bennacer","Riyad Mahrez","Baghdad Bounedjah","Yacine Brahimi","Adem Zorgane","Aïssa Mandi"],
  Austria:["Patrick Pentz","David Alaba","Marcel Sabitzer","Marko Arnautovic","Konrad Laimer","Christoph Baumgartner","Nicolas Seiwald","Michael Gregoritsch"],
  Jordania:["Yazeed Abu Laila","Baha Faisal","Yazan Al-Naimat","Musa Al-Taamari","Mousa Suleiman","Obada Al-Rashdan","Ahmad Hamarsheh","Hamza Al-Dardour"],
  Portugal:["Rui Patrício","Rúben Dias","Cristiano Ronaldo","Bruno Fernandes","Bernardo Silva","João Félix","Rafael Leão","Vitinha"],
  Colombia:["David Ospina","Davinson Sánchez","James Rodríguez","Luis Díaz","Falcao","Juan Cuadrado","Matheus Uribe","Richard Ríos"],
  Uzbekistán:["Eldorbek Suyunov","Husain Norchaev","Jaloliddin Masharipov","Eldor Shomurodov","Otabek Shukurov","Abbosbek Fayzullaev","Dostonbek Khamdamov","Jasur Yakhshiboev"],
  "RD del Congo":["Joël Kiassumbua","Chancel Mbemba","Arthur Masuaku","Cédric Bakambu","Dieumerci Mbokani","Jonathan Bolingi","Yannick Bolasie","Paul-José Mpoku"],
  Inglaterra:["Jordan Pickford","Harry Maguire","Kieran Trippier","Declan Rice","Jude Bellingham","Harry Kane","Bukayo Saka","Phil Foden"],
  Croacia:["Dominik Livaković","Dejan Lovren","Luka Modrić","Mateo Kovačić","Ivan Perišić","Andrej Kramarić","Bruno Petković","Marcelo Brozović"],
  Panamá:["Luis Mejía","Fidel Escobar","Harold Cummings","Rolando Blackburn","Édgar Yoel Bárcenas","Cecilio Waterman","Jovani Welch","Anibal Godoy"],
  Ghana:["Lawrence Ati-Zigi","Thomas Partey","Daniel Amartey","Mohammed Kudus","Jordan Ayew","André Ayew","Inaki Williams","Tariq Lamptey"],
};

const FORMATIONS = ["4-3-3","4-4-2","4-2-3-1","3-5-2","3-4-3","5-3-2","4-1-4-1"];

function getSlots(formation) {
  const slots = [{ pos:"POR", key:"gk0", isGK:true }];
  const [d,m,f] = (formation||"4-3-3").split("-").map(Number);
  for(let i=0;i<d;i++) slots.push({pos:"DEF",key:`def${i}`,isGK:false});
  for(let i=0;i<m;i++) slots.push({pos:"MED",key:`mid${i}`,isGK:false});
  for(let i=0;i<f;i++) slots.push({pos:"DEL",key:`fwd${i}`,isGK:false});
  return slots;
}

// ─── SCORING ─────────────────────────────────────────────────────────────────
function calcPlayerPts(stats, isGK) {
  if (!stats) return 0;
  let pts = 0;
  if (stats.played90) pts += 2;
  if (isGK) {
    if (stats.cleanSheet) pts += 5;
    pts -= (stats.goalsConceded || 0);
    if (stats.mvp) pts += 5;
  } else {
    pts += (stats.goals || 0) * 5;
    pts += (stats.assists || 0) * 3;
    if (stats.goalOutside) pts += 1;
    if (stats.mvp) pts += 3;
  }
  pts -= (stats.yellow || 0);
  pts -= (stats.red || 0) * 3;
  return pts;
}

// L=Local gana, E=Empate, V=Visitante gana → 1pt si acierta
function scoreQuiniela(pred, match) {
  if (!match?.played || !pred?.result) return null;
  const rh = match.homeScore, ra = match.awayScore;
  const real = rh > ra ? "L" : rh < ra ? "V" : "E";
  return pred.result === real ? 1 : 0;
}

function generateGroupMatches() {
  const ms = []; let id = 1;
  Object.entries(GROUPS_DATA).forEach(([group,{teams}]) => {
    for(let i=0;i<teams.length;i++) for(let j=i+1;j<teams.length;j++)
      ms.push({id:id++,group,home:teams[i],away:teams[j],homeScore:null,awayScore:null,played:false});
  });
  return ms;
}

const INITIAL_MATCHES = generateGroupMatches();

function calcStandings(matches, group) {
  const teams = GROUPS_DATA[group].teams;
  const stats = {};
  teams.forEach(t => stats[t]={team:t,pts:0,gf:0,ga:0,gd:0,mp:0,w:0,d:0,l:0});
  (matches||[]).filter(m=>m.group===group&&m.played).forEach(m=>{
    const h=m.homeScore,a=m.awayScore;
    stats[m.home].mp++;stats[m.away].mp++;
    stats[m.home].gf+=h;stats[m.home].ga+=a;stats[m.away].gf+=a;stats[m.away].ga+=h;
    if(h>a){stats[m.home].pts+=3;stats[m.home].w++;stats[m.away].l++;}
    else if(h<a){stats[m.away].pts+=3;stats[m.away].w++;stats[m.home].l++;}
    else{stats[m.home].pts++;stats[m.away].pts++;stats[m.home].d++;stats[m.away].d++;}
  });
  Object.values(stats).forEach(s=>s.gd=s.gf-s.ga);
  return Object.values(stats).sort((a,b)=>b.pts-a.pts||b.gd-a.gd||b.gf-a.gf);
}

function getGroupPos(matches,group,pos){return calcStandings(matches,group)[pos]?.team||null;}

const R32_SLOTS=[["A1","B2"],["C1","D2"],["E1","F2"],["G1","H2"],["I1","J2"],["K1","L2"],["A2","B1"],["C2","D1"],["E2","F1"],["G2","H1"],["I2","J1"],["K2","L1"],["best3_1","best3_2"],["best3_3","best3_4"],["best3_5","best3_6"],["best3_7","best3_8"]];

function getBestThirds(matches){
  const thirds=[];
  Object.keys(GROUPS_DATA).forEach(g=>{const s=calcStandings(matches,g);if(s[2])thirds.push({...s[2],group:g});});
  return thirds.sort((a,b)=>b.pts-a.pts||b.gd-a.gd||b.gf-a.gf).slice(0,8).map(t=>t.team);
}

function resolveSlot(slot,matches){
  if(!slot)return null;
  if(slot.startsWith("best3_"))return getBestThirds(matches)[parseInt(slot.split("_")[1])-1]||null;
  return getGroupPos(matches,slot[0],parseInt(slot[1])-1);
}

function buildBracket(gm,ko){
  const r32=R32_SLOTS.map((mu,i)=>{const km=ko?.r32?.[i];return{home:km?.home||resolveSlot(mu[0],gm),away:km?.away||resolveSlot(mu[1],gm),homeScore:km?.homeScore??null,awayScore:km?.awayScore??null,played:km?.played||false};});
  const gW=(m)=>{if(!m?.played)return null;return m.homeScore>m.awayScore?m.home:m.awayScore>m.homeScore?m.away:null;};
  const r16=Array.from({length:8},(_,i)=>{const km=ko?.r16?.[i];return{home:km?.home||gW(r32[i*2]),away:km?.away||gW(r32[i*2+1]),homeScore:km?.homeScore??null,awayScore:km?.awayScore??null,played:km?.played||false};});
  const qf=Array.from({length:4},(_,i)=>{const km=ko?.qf?.[i];return{home:km?.home||gW(r16[i*2]),away:km?.away||gW(r16[i*2+1]),homeScore:km?.homeScore??null,awayScore:km?.awayScore??null,played:km?.played||false};});
  const sf=Array.from({length:2},(_,i)=>{const km=ko?.sf?.[i];return{home:km?.home||gW(qf[i*2]),away:km?.away||gW(qf[i*2+1]),homeScore:km?.homeScore??null,awayScore:km?.awayScore??null,played:km?.played||false};});
  const fkm=ko?.final?.[0];
  const final=[{home:fkm?.home||gW(sf[0]),away:fkm?.away||gW(sf[1]),homeScore:fkm?.homeScore??null,awayScore:fkm?.awayScore??null,played:fkm?.played||false}];
  return{r32,r16,qf,sf,final,champion:gW(final[0])};
}

function useCountdown(t){
  const[diff,setDiff]=useState(()=>t-Date.now());
  useEffect(()=>{const id=setInterval(()=>setDiff(t-Date.now()),1000);return()=>clearInterval(id);},[t]);
  const total=Math.max(0,diff);
  return{days:Math.floor(total/86400000),hours:Math.floor((total%86400000)/3600000),mins:Math.floor((total%3600000)/60000),secs:Math.floor((total%60000)/1000),started:diff<=0};
}

// ─── FIREBASE HELPERS ─────────────────────────────────────────────────────────
const safeKey = (s) => s.replace(/[.#$/[\]]/g, "_");

// ─── UI COMPONENTS ────────────────────────────────────────────────────────────
const Tab=({label,active,onClick,badge})=>(
  <button onClick={onClick} className={`tab-btn ${active?"active":""}`}>
    {label}{badge&&<span className="tab-count">{badge}</span>}
  </button>
);

function ScoreInput({match,onSave,disabled}){
  const[h,setH]=useState(match.homeScore!==null?String(match.homeScore):"");
  const[a,setA]=useState(match.awayScore!==null?String(match.awayScore):"");
  useEffect(()=>{setH(match.homeScore!==null?String(match.homeScore):"");setA(match.awayScore!==null?String(match.awayScore):"");},[match.homeScore,match.awayScore]);
  const save=()=>{if(h!==""&&a!=="")onSave(Number(h),Number(a));};
  return(
    <div className="score-input-row">
      <span className="team-name home">{flag(match.home)} {match.home}</span>
      <div className="score-inputs">
        {disabled
          ? <span className="score-display">{match.played?`${match.homeScore} – ${match.awayScore}`:"vs"}</span>
          : <>
            <input type="number" min="0" max="20" value={h} onChange={e=>setH(e.target.value)} className="score-box"/>
            <span className="score-sep">–</span>
            <input type="number" min="0" max="20" value={a} onChange={e=>setA(e.target.value)} className="score-box"/>
            <button className="save-btn" onClick={save}>✓</button>
            {match.played&&<button className="clear-btn" onClick={()=>{setH("");setA("");onSave(null,null);}}>✕</button>}
          </>
        }
      </div>
      <span className="team-name away">{match.away} {flag(match.away)}</span>
    </div>
  );
}

function KOScoreInput({match,onSave,label,disabled}){
  const[h,setH]=useState(match.homeScore!==null?String(match.homeScore):"");
  const[a,setA]=useState(match.awayScore!==null?String(match.awayScore):"");
  if(!match.home&&!match.away)return<div className="ko-input-row pending"><span className="ko-label">{label}</span><span style={{color:"var(--muted)",fontSize:12}}>⏳ Pendiente</span></div>;
  const save=()=>{if(h!==""&&a!=="")onSave({home:match.home,away:match.away,homeScore:Number(h),awayScore:Number(a),played:true});};
  return(
    <div className="ko-input-row">
      <span className="ko-label">{label}</span>
      <span className="ko-team">{flag(match.home)} {short(match.home)}</span>
      <div className="score-inputs" style={{flexShrink:0}}>
        {disabled
          ? <span className="score-display">{match.played?`${match.homeScore}–${match.awayScore}`:"vs"}</span>
          : <>
            <input type="number" min="0" max="20" value={h} onChange={e=>setH(e.target.value)} className="score-box"/>
            <span className="score-sep">–</span>
            <input type="number" min="0" max="20" value={a} onChange={e=>setA(e.target.value)} className="score-box"/>
            <button className="save-btn" onClick={save}>✓</button>
            {match.played&&<button className="clear-btn" onClick={()=>onSave({home:match.home,away:match.away,played:false,homeScore:null,awayScore:null})}>✕</button>}
          </>
        }
      </div>
      <span className="ko-team right">{short(match.away)} {flag(match.away)}</span>
    </div>
  );
}

function GroupTable({matches,group}){
  const standings=calcStandings(matches,group);
  return(
    <div className="group-table">
      <div className="group-header">Grupo {group}</div>
      <table><thead><tr><th></th><th>Equipo</th><th>PJ</th><th>G</th><th>E</th><th>P</th><th>GF</th><th>GC</th><th>DG</th><th>Pts</th></tr></thead>
        <tbody>{standings.map((s,i)=>(
          <tr key={s.team} className={i<2?"qualified":i===2?"third-row":""}>
            <td className="pos">{i+1}</td><td className="team-cell">{flag(s.team)} {s.team}</td>
            <td>{s.mp}</td><td>{s.w}</td><td>{s.d}</td><td>{s.l}</td>
            <td>{s.gf}</td><td>{s.ga}</td><td>{s.gd>0?`+${s.gd}`:s.gd}</td><td className="pts-cell">{s.pts}</td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}

function BracketMatch({m}){
  const hW=m.played&&m.homeScore>m.awayScore,aW=m.played&&m.awayScore>m.homeScore;
  return(
    <div className="bm">
      <div className={`bm-slot ${hW?"bm-winner":""} ${!m.home?"bm-tbd":""}`}><span className="bm-flag">{flag(m.home)}</span><span className="bm-name">{short(m.home)||"TBD"}</span>{m.played&&<span className="bm-score">{m.homeScore}</span>}</div>
      <div className={`bm-slot ${aW?"bm-winner":""} ${!m.away?"bm-tbd":""}`}><span className="bm-flag">{flag(m.away)}</span><span className="bm-name">{short(m.away)||"TBD"}</span>{m.played&&<span className="bm-score">{m.awayScore}</span>}</div>
    </div>
  );
}


// ─── EXPORT QUINIELA AS IMAGE ────────────────────────────────────────────────
async function exportQuiniela(user, quinielaMatchIds, matches, preds, podio) {
  const date = new Date().toLocaleDateString("es-MX",{day:"numeric",month:"long",year:"numeric"});
  const canvas = document.createElement("canvas");
  const W = 760;
  const ROW_H = 46;
  const HEADER = 160;
  const PODIO_H = 110;
  const FOOTER = 56;
  canvas.width = W;
  canvas.height = HEADER + 34 + quinielaMatchIds.length * ROW_H + PODIO_H + FOOTER;
  const ctx = canvas.getContext("2d");

  // BG
  const bg = ctx.createLinearGradient(0,0,W,canvas.height);
  bg.addColorStop(0,"#080d18"); bg.addColorStop(1,"#0f1923");
  ctx.fillStyle = bg; ctx.fillRect(0,0,W,canvas.height);

  // Top bar
  const bar = ctx.createLinearGradient(0,0,W,0);
  bar.addColorStop(0,"transparent"); bar.addColorStop(0.5,"#f59e0b"); bar.addColorStop(1,"transparent");
  ctx.fillStyle = bar; ctx.fillRect(0,0,W,3);

  // Header bg
  ctx.fillStyle = "#162030"; ctx.fillRect(0,3,W,HEADER-3);
  ctx.strokeStyle = "#1c2d42"; ctx.lineWidth = 1; ctx.strokeRect(0,3,W,HEADER-3);

  // Title
  ctx.font = "bold 11px Arial"; ctx.fillStyle = "#f59e0b"; ctx.textAlign = "left";
  ctx.fillText("MUNDIAL 2026  ·  QUINIELA", 28, 36);

  // Player name
  ctx.font = "bold 48px Arial Black"; ctx.fillStyle = "#fff";
  ctx.fillText(user.name?.toUpperCase() || "", 28, 88);

  // Date
  ctx.font = "12px Arial"; ctx.fillStyle = "#64748b";
  ctx.fillText(`Creado: ${date}`, 28, 112);

  // Points box
  const scored = quinielaMatchIds.filter(mid => {
    const m = matches.find(x=>x.id===mid);
    const pred = preds[mid];
    const s = (() => {
      if (!m?.played || !pred?.result) return null;
      const rh=m.homeScore,ra=m.awayScore;
      const real=rh>ra?"L":rh<ra?"V":"E";
      return pred.result===real?1:0;
    })();
    return s===1;
  }).length;

  ctx.fillStyle = "#f59e0b";
  ctx.beginPath(); ctx.roundRect(W-160,96,130,44,8); ctx.fill();
  ctx.font = "bold 15px Arial Black"; ctx.fillStyle = "#000"; ctx.textAlign = "center";
  ctx.fillText(`${scored} pts`, W-95, 121);

  ctx.fillStyle = "#1c2d42"; ctx.fillRect(0,HEADER,W,1);

  // Table header
  ctx.fillStyle = "#0a1420"; ctx.fillRect(0,HEADER+1,W,32);
  ctx.font = "bold 9px Arial"; ctx.fillStyle = "#64748b"; ctx.textAlign = "left";
  ctx.fillText("PARTIDO", 28, HEADER+20);
  ctx.textAlign = "center";
  ctx.fillText("L", W/2-30, HEADER+20);
  ctx.fillText("E", W/2, HEADER+20);
  ctx.fillText("V", W/2+30, HEADER+20);
  ctx.fillText("RESULTADO", W-60, HEADER+20);

  // Rows
  quinielaMatchIds.forEach((mid,idx) => {
    const m = matches.find(x=>x.id===mid);
    if(!m) return;
    const pred = preds[mid]||{};
    const real = m.played?(m.homeScore>m.awayScore?"L":m.awayScore>m.homeScore?"V":"E"):null;
    const pts = (!m.played||!pred.result)?null:(pred.result===real?1:0);
    const y = HEADER + 33 + idx * ROW_H;

    ctx.fillStyle = idx%2===0?"#0f1923":"#111e2d"; ctx.fillRect(0,y,W,ROW_H);
    if(m.played && pts!==null) {
      ctx.fillStyle = pts===1?"rgba(16,185,129,0.08)":"rgba(239,68,68,0.06)";
      ctx.fillRect(0,y,W,ROW_H);
    }
    ctx.fillStyle = "#1c2d42"; ctx.fillRect(0,y+ROW_H-1,W,1);

    // Group
    ctx.font = "bold 12px Arial"; ctx.fillStyle = "#f59e0b"; ctx.textAlign = "left";
    ctx.fillText(m.group, 12, y+28);

    // Teams
    ctx.fillStyle = "#e2e8f0"; ctx.font = "11px Arial";
    const hn = m.home.length>10?m.home.split(" ")[0]:m.home;
    const an = m.away.length>10?m.away.split(" ")[0]:m.away;
    ctx.fillText(`${hn} vs ${an}`, 32, y+28);

    // L/E/V buttons
    ["L","E","V"].forEach((opt,oi) => {
      const cx = W/2 - 30 + oi*30;
      const selected = pred.result===opt;
      const isReal = real===opt;
      ctx.fillStyle = selected?(pts===1?"#10b981":pts===0?"#ef4444":"#f59e0b"):(isReal&&m.played?"rgba(16,185,129,0.2)":"#162030");
      ctx.beginPath(); ctx.roundRect(cx-11,y+10,22,22,5); ctx.fill();
      ctx.strokeStyle = selected?(pts===1?"#10b981":pts===0?"#ef4444":"#f59e0b"):"#1c2d42"; ctx.lineWidth=1;
      ctx.beginPath(); ctx.roundRect(cx-11,y+10,22,22,5); ctx.stroke();
      ctx.font = "bold 11px Arial"; ctx.fillStyle = selected?"#000":"#64748b"; ctx.textAlign="center";
      ctx.fillText(opt, cx, y+25);
    });

    // Result badge
    if(m.played && pred.result) {
      ctx.fillStyle = pts===1?"#10b981":"#ef4444";
      ctx.beginPath(); ctx.roundRect(W-80,y+11,52,24,6); ctx.fill();
      ctx.font = "bold 13px Arial"; ctx.fillStyle = "#fff"; ctx.textAlign="center";
      ctx.fillText(pts===1?"+1 ✓":"✗", W-54, y+27);
    }
  });

  // PODIO section
  const py = HEADER + 33 + quinielaMatchIds.length * ROW_H;
  ctx.fillStyle = "#162030"; ctx.fillRect(0,py,W,PODIO_H);
  ctx.fillStyle = "#1c2d42"; ctx.fillRect(0,py,W,1);
  ctx.font = "bold 12px Arial"; ctx.fillStyle = "#f59e0b"; ctx.textAlign="left";
  ctx.fillText("🏆 PREDICCIÓN DE PODIO", 28, py+22);

  [["champion","🥇 Campeón"],[" runner","🥈 Subcampeón"],["third","🥉 Tercer lugar"]].forEach(([k,label],i) => {
    const team = podio[k.trim()]||"—";
    const x = 28 + i * 230;
    ctx.font = "10px Arial"; ctx.fillStyle = "#64748b"; ctx.textAlign="left";
    ctx.fillText(label, x, py+44);
    ctx.font = "bold 13px Arial"; ctx.fillStyle = "#e2e8f0";
    ctx.fillText(team, x, py+62);
    ctx.fillStyle = "#1c2d42"; ctx.fillRect(x,py+68,200,1);
  });

  // Footer
  const fy = py + PODIO_H;
  ctx.fillStyle = "#162030"; ctx.fillRect(0,fy,W,FOOTER);
  ctx.fillStyle = "#1c2d42"; ctx.fillRect(0,fy,W,1);
  ctx.font = "10px Arial"; ctx.fillStyle = "#64748b"; ctx.textAlign="left";
  ctx.fillText(`Creado por antoniobuenomx`, 28, fy+24);
  ctx.fillStyle = "#f59e0b"; ctx.font = "bold 10px Arial"; ctx.textAlign="right";
  ctx.fillText("⚽ Mundial 2026", W-28, fy+24);
  ctx.fillStyle = bar; ctx.fillRect(0,canvas.height-3,W,3);

  const link = document.createElement("a");
  link.download = `quiniela-${(user.name||"jugador").toLowerCase().replace(/\s+/g,"-")}.jpg`;
  link.href = canvas.toDataURL("image/jpeg",0.92);
  link.click();
}

// ─── LOGIN SCREEN ─────────────────────────────────────────────────────────────
function LoginScreen({onLogin}){
  const[username,setUsername]=useState("");
  const[pin,setPin]=useState("");
  const[error,setError]=useState("");
  const[loading,setLoading]=useState(false);

  const handleLogin=async()=>{
    if(!username.trim()){setError("Ingresa tu usuario");return;}
    if(!pin){setError("Ingresa tu PIN");return;}
    setLoading(true);setError("");
    const name=username.trim();
    if(name.toLowerCase()==="aldley"&&pin===ADMIN.pin){onLogin({...ADMIN});setLoading(false);return;}
    try{
      const snap=await get(ref(db,"participants"));
      if(snap.exists()){
        const data=snap.val();
        const found=Object.values(data).find(p=>p.name.toLowerCase()===name.toLowerCase()&&p.pin===pin);
        if(found){onLogin({...found,isAdmin:false});setLoading(false);return;}
      }
      setError("Usuario o PIN incorrecto");setPin("");
    }catch(e){setError("Error de conexión");}
    setLoading(false);
  };

  return(
    <div className="login-wrap">
      <div className="login-card">
        <svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg" style={{width:140,height:"auto",marginBottom:4}}>
          <text x="2" y="220" fontFamily="Arial Black,sans-serif" fontSize="230" fontWeight="900" fill="white">2</text>
          <text x="148" y="220" fontFamily="Arial Black,sans-serif" fontSize="230" fontWeight="900" fill="white">6</text>
          <g transform="translate(88,10)">
            <ellipse cx="55" cy="115" rx="40" ry="52" fill="#b8902a"/>
            <ellipse cx="55" cy="75" rx="37" ry="37" fill="#c9a227"/>
            <ellipse cx="55" cy="65" rx="32" ry="30" fill="#d4b23a"/>
            <path d="M23 88 Q6 76 12 52 Q28 78 23 88Z" fill="#b8902a"/>
            <path d="M87 88 Q104 76 98 52 Q82 78 87 88Z" fill="#b8902a"/>
            <rect x="40" y="152" width="30" height="16" fill="#1a6b2e" rx="2"/>
            <rect x="27" y="164" width="56" height="10" fill="#c9a227" rx="2"/>
            <text x="55" y="137" fontFamily="Arial" fontSize="9" fontWeight="bold" fill="#0a3a10" textAnchor="middle">FIFA</text>
            <text x="55" y="148" fontFamily="Arial" fontSize="6.5" fontWeight="bold" fill="#0a3a10" textAnchor="middle">WORLD CUP</text>
          </g>
          <text x="150" y="285" fontFamily="Arial Black,sans-serif" fontSize="48" fontWeight="900" fill="white" textAnchor="middle">FIFA</text>
        </svg>

        <div className="login-sub">USA · CANADA · MÉXICO</div>

        <div style={{width:"100%"}}>
          <input
            className="login-user-input"
            placeholder="Usuario"
            value={username}
            onChange={e=>{setUsername(e.target.value);setError("");}}
            onKeyDown={e=>e.key==="Enter"&&handleLogin()}
            autoFocus
          />
          <div className="pin-display">
            {pin.length>0?pin.replace(/./g,"●"):<span style={{color:"var(--muted)",letterSpacing:4}}>––––</span>}
          </div>
          <div className="pin-pad">
            {[1,2,3,4,5,6,7,8,9,"","0","⌫"].map((k,i)=>(
              <button key={i} className={`pin-key ${k===""?"invisible":""}`}
                onClick={()=>{if(k==="⌫")setPin(p=>p.slice(0,-1));else if(k!=="")setPin(p=>p.length<8?p+k:p);}}>
                {k}
              </button>
            ))}
          </div>
          {error&&<div className="login-error">{error}</div>}
          <button className="login-btn" onClick={handleLogin} disabled={loading}>
            {loading?"Verificando...":"ENTRAR"}
          </button>
        </div>

        <div style={{marginTop:16,fontSize:10,color:"var(--muted)",borderTop:"1px solid var(--border)",paddingTop:12,letterSpacing:1,width:"100%",textAlign:"center"}}>
          Creado por <strong style={{color:"var(--accent)"}}>antoniobuenomx</strong>
        </div>
      </div>
    </div>
  );
}


// ─── ADMIN: ADD PARTICIPANT ───────────────────────────────────────────────────
function AddParticipantModal({onClose}){
  const[name,setName]=useState("");
  const[pin,setPin]=useState("");
  const[saving,setSaving]=useState(false);
  const[error,setError]=useState("");

  const save=async()=>{
    if(!name.trim()||!pin.trim()){setError("Completa nombre y PIN");return;}
    if(pin===ADMIN.pin){setError("Ese PIN está reservado");return;}
    setSaving(true);
    try{
      const id=safeKey(name.trim().toLowerCase());
      const snap=await get(ref(db,"participants"));
      if(snap.exists()){
        const data=snap.val();
        if(Object.values(data).find(p=>p.pin===pin)){setError("PIN ya en uso");setSaving(false);return;}
      }
      await set(ref(db,`participants/${id}`),{id,name:name.trim(),pin:pin.trim(),formation:"4-3-3",lineup:{},predictions:{},quinielaMatches:[]});
      onClose();
    }catch(e){setError("Error al guardar");}
    setSaving(false);
  };

  return(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e=>e.stopPropagation()}>
        <div className="modal-title">➕ Agregar Participante</div>
        <input className="q-input" placeholder="Nombre" value={name} onChange={e=>setName(e.target.value)} style={{marginBottom:10,width:"100%"}}/>
        <input className="q-input" placeholder="PIN (números)" type="number" value={pin} onChange={e=>setPin(e.target.value)} style={{marginBottom:10,width:"100%"}}/>
        {error&&<div style={{color:"var(--accent2)",fontSize:12,marginBottom:8}}>{error}</div>}
        <div style={{display:"flex",gap:8}}>
          <button className="q-btn" onClick={save} disabled={saving} style={{flex:1}}>{saving?"Guardando...":"Guardar"}</button>
          <button onClick={onClose} style={{padding:"9px 16px",background:"var(--card2)",border:"1px solid var(--border)",borderRadius:8,color:"var(--muted)",cursor:"pointer"}}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

// ─── 11 IDEAL BUILDER ────────────────────────────────────────────────────────
function OnceIdealBuilder({participantId,onceData,isAdmin,currentUserId}){
  const formation=onceData?.formation||"4-3-3";
  const lineup=onceData?.lineup||{};
  const slots=getSlots(formation);
  const[search,setSearch]=useState("");
  const[activeSlot,setActiveSlot]=useState(null);
  const canEdit=isAdmin||participantId===currentUserId;

  const allPlayers=useMemo(()=>{
    const list=[];
    Object.entries(PLAYER_POOL).forEach(([team,players])=>players.forEach(p=>list.push({name:p,team})));
    return list;
  },[]);

  const filtered=useMemo(()=>{
    if(!search)return allPlayers.slice(0,40);
    return allPlayers.filter(p=>p.name.toLowerCase().includes(search.toLowerCase())||p.team.toLowerCase().includes(search.toLowerCase())).slice(0,40);
  },[search,allPlayers]);

  const used=Object.values(lineup).map(p=>p?.name).filter(Boolean);

  const saveFormation=async(f)=>{
    await update(ref(db,`participants/${participantId}`),{formation:f,lineup:{}});
  };

  const selectPlayer=async(player)=>{
    if(!activeSlot)return;
    const isGK=slots.find(s=>s.key===activeSlot)?.isGK||false;
    await update(ref(db,`participants/${participantId}/lineup`),{[activeSlot]:{name:player.name,team:player.team,isGK}});
    setActiveSlot(null);setSearch("");
  };

  const removePlayer=async(slotKey)=>{
    await update(ref(db,`participants/${participantId}/lineup`),{[slotKey]:null});
  };

  const posColors={POR:"#3b82f6",DEF:"#10b981",MED:"#f59e0b",DEL:"#ef4444"};

  return(
    <div>
      {canEdit&&(
        <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:14,flexWrap:"wrap"}}>
          <span style={{fontSize:11,color:"var(--muted)",fontWeight:600}}>FORMACIÓN:</span>
          {FORMATIONS.map(f=>(
            <button key={f} onClick={()=>saveFormation(f)}
              style={{padding:"4px 10px",borderRadius:6,border:"1px solid var(--border)",background:formation===f?"var(--accent)":"var(--card2)",color:formation===f?"#000":"var(--muted)",cursor:"pointer",fontSize:12,fontWeight:700}}>
              {f}
            </button>
          ))}
        </div>
      )}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <div style={{background:"linear-gradient(180deg,#1a3a2a,#0f2418)",borderRadius:12,padding:10,border:"1px solid #2d5a3a",minHeight:340}}>
          <div style={{textAlign:"center",fontSize:10,color:"rgba(255,255,255,0.3)",letterSpacing:2,marginBottom:6}}>⚽ ALINEACIÓN</div>
          {["DEL","MED","DEF","POR"].map(posGroup=>{
            const groupSlots=slots.filter(s=>s.pos===posGroup);
            if(!groupSlots.length)return null;
            return(
              <div key={posGroup} style={{display:"flex",justifyContent:"center",gap:4,marginBottom:8}}>
                {groupSlots.map(slot=>{
                  const p=lineup[slot.key];
                  return(
                    <div key={slot.key} onClick={()=>canEdit&&setActiveSlot(activeSlot===slot.key?null:slot.key)}
                      style={{width:60,cursor:canEdit?"pointer":"default",textAlign:"center"}}>
                      <div style={{width:38,height:38,borderRadius:"50%",margin:"0 auto 3px",background:p?"var(--card2)":"rgba(0,0,0,0.3)",border:`2px solid ${activeSlot===slot.key?"#f59e0b":p?posColors[slot.pos]:"rgba(255,255,255,0.15)"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:p?9:16,color:p?"var(--text)":"rgba(255,255,255,0.3)",position:"relative"}}>
                        {p?p.name.split(" ").map(w=>w[0]).join("").slice(0,2):"＋"}
                        {p&&canEdit&&<button onClick={e=>{e.stopPropagation();removePlayer(slot.key);}} style={{position:"absolute",top:-4,right:-4,width:13,height:13,borderRadius:"50%",background:"#ef4444",border:"none",color:"#fff",fontSize:7,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>}
                      </div>
                      <div style={{fontSize:8,color:posColors[slot.pos],fontWeight:700,letterSpacing:1}}>{slot.pos}</div>
                      <div style={{fontSize:8,color:p?"var(--text)":"var(--muted)",lineHeight:1.2,maxWidth:58,margin:"0 auto",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p?short(p.name):"—"}</div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
        <div>
          {canEdit&&activeSlot?(
            <div>
              <div style={{fontSize:11,color:"var(--accent)",fontWeight:700,marginBottom:6}}>Slot: {slots.find(s=>s.key===activeSlot)?.pos}</div>
              <input placeholder="Buscar jugador..." value={search} onChange={e=>setSearch(e.target.value)}
                style={{width:"100%",padding:"7px 10px",background:"var(--card2)",border:"1px solid var(--border)",borderRadius:7,color:"var(--text)",fontSize:12,outline:"none",marginBottom:6}}/>
              <div style={{maxHeight:260,overflowY:"auto",display:"flex",flexDirection:"column",gap:2}}>
                {filtered.filter(p=>!used.includes(p.name)).map(p=>(
                  <div key={p.name} onClick={()=>selectPlayer(p)}
                    style={{padding:"6px 9px",borderRadius:6,background:"var(--card2)",border:"1px solid var(--border)",cursor:"pointer",display:"flex",alignItems:"center",gap:7,fontSize:11}}
                    onMouseEnter={e=>e.currentTarget.style.borderColor="var(--accent)"}
                    onMouseLeave={e=>e.currentTarget.style.borderColor="var(--border)"}>
                    <span style={{fontSize:14}}>{flag(p.team)}</span>
                    <div><div style={{fontWeight:600}}>{p.name}</div><div style={{fontSize:9,color:"var(--muted)"}}>{p.team}</div></div>
                  </div>
                ))}
              </div>
            </div>
          ):(
            <div>
              <div style={{fontSize:10,color:"var(--muted)",marginBottom:8,fontWeight:600,letterSpacing:1}}>MI 11</div>
              {slots.map(slot=>{
                const p=lineup[slot.key];
                return(
                  <div key={slot.key} style={{display:"flex",alignItems:"center",gap:6,padding:"4px 7px",borderRadius:5,background:"var(--card2)",border:"1px solid var(--border)",marginBottom:3,fontSize:11}}>
                    <span style={{color:posColors[slot.pos],fontWeight:700,width:24,fontSize:9}}>{slot.pos}</span>
                    {p?<><span style={{fontSize:13}}>{flag(p.team)}</span><span style={{fontWeight:600}}>{p.name}</span></>:<span style={{color:"var(--muted)"}}>— Sin asignar</span>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── JORNADA PANEL (Admin only) ───────────────────────────────────────────────
function JornadaPanel({participants,jornadaStats,onUpdateStat}){
  const allPlayers=useMemo(()=>{
    const map={};
    Object.values(participants||{}).forEach(p=>{
      Object.values(p.lineup||{}).forEach(lp=>{if(lp?.name&&!map[lp.name])map[lp.name]={...lp};});
    });
    return Object.values(map);
  },[participants]);

  const boolField=(pName,field)=>{
    const v=jornadaStats?.[safeKey(pName)]?.[field];
    return<button onClick={()=>onUpdateStat(pName,field,!v)} style={{padding:"2px 7px",borderRadius:4,border:"1px solid var(--border)",background:v?"var(--green)":"var(--card)",color:v?"#fff":"var(--muted)",cursor:"pointer",fontSize:10,fontWeight:600,minWidth:30}}>{v?"✓":"—"}</button>;
  };

  const numField=(pName,field,max=10)=>{
    const v=jornadaStats?.[safeKey(pName)]?.[field]||0;
    return<div style={{display:"flex",alignItems:"center",gap:2}}>
      <button onClick={()=>onUpdateStat(pName,field,Math.max(0,v-1))} style={{width:18,height:18,borderRadius:3,border:"1px solid var(--border)",background:"var(--card2)",color:"var(--muted)",cursor:"pointer",fontSize:10}}>−</button>
      <span style={{width:18,textAlign:"center",fontSize:12,fontWeight:700}}>{v}</span>
      <button onClick={()=>onUpdateStat(pName,field,Math.min(max,v+1))} style={{width:18,height:18,borderRadius:3,border:"1px solid var(--border)",background:"var(--card2)",color:"var(--accent)",cursor:"pointer",fontSize:10}}>＋</button>
    </div>;
  };

  if(!allPlayers.length)return<div style={{textAlign:"center",padding:32,color:"var(--muted)",fontSize:12}}>Primero arma los 11 ideales de los participantes.</div>;

  return(
    <div style={{overflowX:"auto"}}>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:11,minWidth:660}}>
        <thead>
          <tr style={{background:"var(--card2)"}}>
            {["JUGADOR","90'","Goles","Asist.","⚡Área","Valla","G.Rec","⭐MVP","🟨","🟥","PTS"].map(h=>(
              <th key={h} style={{padding:"7px 5px",textAlign:h==="JUGADOR"?"left":"center",color:"var(--muted)",fontWeight:600,fontSize:9,letterSpacing:1,borderBottom:"1px solid var(--border)",whiteSpace:"nowrap"}}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {allPlayers.map((lp,idx)=>{
            const s=jornadaStats?.[safeKey(lp.name)]||{};
            const pts=calcPlayerPts(s,lp.isGK);
            return(
              <tr key={lp.name} style={{background:idx%2===0?"var(--card)":"var(--card2)",borderBottom:"1px solid var(--border)"}}>
                <td style={{padding:"7px 9px",whiteSpace:"nowrap"}}>
                  <div style={{display:"flex",alignItems:"center",gap:5}}>
                    <span style={{fontSize:13}}>{flag(lp.team)}</span>
                    <div><div style={{fontWeight:600,fontSize:11}}>{lp.name}</div><div style={{fontSize:9,color:lp.isGK?"#3b82f6":"var(--muted)"}}>{lp.isGK?"🧤 POR":lp.team}</div></div>
                  </div>
                </td>
                <td style={{textAlign:"center",padding:"7px 3px"}}>{boolField(lp.name,"played90")}</td>
                <td style={{textAlign:"center",padding:"7px 3px"}}>{lp.isGK?<span style={{color:"var(--muted)"}}>—</span>:numField(lp.name,"goals")}</td>
                <td style={{textAlign:"center",padding:"7px 3px"}}>{lp.isGK?<span style={{color:"var(--muted)"}}>—</span>:numField(lp.name,"assists")}</td>
                <td style={{textAlign:"center",padding:"7px 3px"}}>{lp.isGK?<span style={{color:"var(--muted)"}}>—</span>:boolField(lp.name,"goalOutside")}</td>
                <td style={{textAlign:"center",padding:"7px 3px"}}>{lp.isGK?boolField(lp.name,"cleanSheet"):<span style={{color:"var(--muted)"}}>—</span>}</td>
                <td style={{textAlign:"center",padding:"7px 3px"}}>{lp.isGK?numField(lp.name,"goalsConceded"):(<span style={{color:"var(--muted)"}}>—</span>)}</td>
                <td style={{textAlign:"center",padding:"7px 3px"}}>{boolField(lp.name,"mvp")}</td>
                <td style={{textAlign:"center",padding:"7px 3px"}}>{numField(lp.name,"yellow",2)}</td>
                <td style={{textAlign:"center",padding:"7px 3px"}}>{boolField(lp.name,"red")}</td>
                <td style={{textAlign:"center",padding:"7px 3px"}}>
                  <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:18,color:pts>0?"var(--accent)":pts<0?"var(--accent2)":"var(--muted)"}}>{pts>0?`+${pts}`:pts}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function Mundial2026(){
  const[user,setUser]=useState(null);
  const[activeTab,setActiveTab]=useState("inicio");
  const[selectedGroup,setSelectedGroup]=useState("A");
  const[matches,setMatches]=useState(INITIAL_MATCHES);
  const[ko,setKo]=useState({r32:{},r16:{},qf:{},sf:{},final:{}});
  const[panini,setPanini]=useState({teams:{},specials:{}});
  const[participants,setParticipants]=useState({});
  const[jornadaStats,setJornadaStats]=useState({});
  const[quinielaMatches,setQuinielaMatches]=useState([]);
  const[showAddModal,setShowAddModal]=useState(false);
  const[oncePanelId,setOncePanelId]=useState(null);
  const[loading,setLoading]=useState(true);
  const countdown=useCountdown(INAUGURAL.getTime());
  const bracket=useMemo(()=>buildBracket(matches,ko),[matches,ko]);
  const playedCount=matches.filter(m=>m.played).length;
  const isAdmin=user?.isAdmin||false;

  // ── Load all data from Firebase
  useEffect(()=>{
    if(!user)return;
    const unsubs=[];
    // matches
    unsubs.push(onValue(ref(db,"matches"),snap=>{
      if(snap.exists()){
        const data=snap.val();
        setMatches(INITIAL_MATCHES.map(m=>{const d=data[m.id];return d?{...m,...d}:m;}));
      }
      setLoading(false);
    }));
    // ko
    unsubs.push(onValue(ref(db,"ko"),snap=>{if(snap.exists())setKo(snap.val());}));
    // participants
    unsubs.push(onValue(ref(db,"participants"),snap=>{if(snap.exists())setParticipants(snap.val());else setParticipants({});}));
    // jornadaStats
    unsubs.push(onValue(ref(db,"jornadaStats"),snap=>{if(snap.exists())setJornadaStats(snap.val());else setJornadaStats({});}));
    // quinielaMatches (global config set by admin)
    unsubs.push(onValue(ref(db,"quinielaMatches"),snap=>{if(snap.exists())setQuinielaMatches(snap.val()||[]);}));
    // panini — per user (same key formula as writers)
    const paniniUserId = user.isAdmin ? "admin" : safeKey((user.name||"guest").toLowerCase());
    unsubs.push(onValue(ref(db,`panini/${paniniUserId}`),snap=>{if(snap.exists())setPanini(snap.val());else setPanini({teams:{},specials:{}});}));
    return()=>unsubs.forEach(u=>u());
  },[user]);

  // ── Admin: update match score
  const saveMatch=async(id,homeScore,awayScore)=>{
    if(!isAdmin)return;
    await set(ref(db,`matches/${id}`),{id,homeScore,awayScore,played:homeScore!==null});
  };

  // ── Admin: update KO match
  const saveKO=async(round,idx,data)=>{
    await set(ref(db,`ko/${round}/${idx}`),data);
  };

  // ── Admin: toggle quiniela match
  const toggleQMatch=async(mid)=>{
    const updated=quinielaMatches.includes(mid)?quinielaMatches.filter(x=>x!==mid):[...quinielaMatches,mid];
    await set(ref(db,"quinielaMatches"),updated);
  };

  // ── Participant: save prediction L/E/V
  const savePred=async(pid,mid,result)=>{
    const p=participants[pid];
    if(p?.quinielaLocked&&!isAdmin)return;
    await set(ref(db,`participants/${pid}/predictions/${mid}`),{result});
  };
  // ── Participant: save podio prediction
  const savePodio=async(pid,field,team)=>{
    const p=participants[pid];
    if(p?.quinielaLocked&&!isAdmin)return;
    await set(ref(db,`participants/${pid}/predictions/podio/${field}`),team);
  };
  // ── Lock / unlock quiniela
  const lockQuiniela=async(pid,locked)=>{
    await update(ref(db,`participants/${pid}`),{quinielaLocked:locked});
  };

  // ── Admin: update jornada stat
  const updateStat=async(playerName,field,val)=>{
    const key=safeKey(playerName);
    await update(ref(db,`jornadaStats/${key}`),{[field]:val});
  };

  // ── Compute scores for all participants
  const participantScores=useMemo(()=>{
    return Object.values(participants).map(p=>{
      let qPts=0,correct=0,wrong=0,pending=0;
      (quinielaMatches||[]).forEach(mid=>{
        const match=matches.find(m=>m.id===mid);
        const pred=p.predictions?.[mid];
        const s=scoreQuiniela(pred,match);
        if(s===null)pending++;else if(s===1){qPts+=1;correct++;}else{wrong++;}
      });
      // Bonus podio
      const podio=p.predictions?.podio||{};
      if(p.predictions?.podio){
        // scored separately by admin — stored as podio.champion/runner/third pts
      }
      // Once pts
      let oncePts=0;
      Object.values(p.lineup||{}).forEach(lp=>{
        if(!lp)return;
        const s=jornadaStats?.[safeKey(lp.name)];
        oncePts+=calcPlayerPts(s,lp.isGK);
      });
      return{...p,quiniela:qPts,once:oncePts,total:qPts+oncePts,correct,wrong,pending};
    }).sort((a,b)=>b.total-a.total);
  },[participants,quinielaMatches,matches,jornadaStats]);

  const myData=user&&!isAdmin?participants[safeKey(user.name?.toLowerCase())]||user:null;
  const myPreds=myData?.predictions||{};
  const myLineup=myData?.lineup||{};
  const myId=user&&!isAdmin?safeKey(user.name?.toLowerCase()):null;

  // ── Panini handlers (code = FIFA code e.g. MEX, ENG)
  const paniniUid = isAdmin ? "admin" : safeKey((user?.name||"guest").toLowerCase());
  const paniniToggle=async(code,idx,val)=>{
    await set(ref(db,`panini/${paniniUid}/teams/${code}/${idx}`),val||null);
  };
  const paniniToggleSpecial=async(code,val)=>{
    await update(ref(db,`panini/${paniniUid}/specials/${code}`),{owned:val});
  };
  const paniniSpecialLabel=async(code,label)=>{
    await update(ref(db,`panini/${paniniUid}/specials/${code}`),{label});
  };
  const paniniDup=async(code,idx,count)=>{
    if(code.startsWith("special_")){
      const sCode=code.replace("special_","");
      await update(ref(db,`panini/${paniniUid}/specials/${sCode}`),{dups:count>0?count:null});
    } else {
      await set(ref(db,`panini/${paniniUid}/dups/${code}/${idx}`),count>0?count:null);
    }
  };

  // ── Panini stats for home screen
  const paniniHomeStats = useMemo(() => {
    let owned = 0;
    const teamScores = [];
    Object.entries(PANINI_GROUPS).forEach(([group, teams]) => {
      teams.forEach(team => {
        const code = FIFA_CODE[team];
        let t = 0;
        for (let i = 0; i < 20; i++) if (panini?.teams?.[code]?.[i]) { t++; owned++; }
        teamScores.push({ team, code, group, owned: t, total: 20, pct: (t/20)*100 });
      });
    });
    // specials
    let specOwned = 0;
    const allSpecials = [...Array.from({length:19},(_,i)=>`FWC${String(i+1).padStart(2,"0")}`), ...Array.from({length:14},(_,i)=>`CC${String(i+1).padStart(2,"0")}`)];
    allSpecials.forEach(c => { if (panini?.specials?.[c]?.owned) specOwned++; });
    const totalOwned = owned + specOwned;
    const pct = Math.round((totalOwned / 993) * 100);
    const top = [...teamScores].sort((a,b) => b.pct - a.pct).slice(0, 5);
    return { totalOwned, pct, top, teamScores };
  }, [panini]);

  const roundLabels={r32:"Ronda de 32",r16:"Octavos",qf:"Cuartos",sf:"Semifinal",final:"Final"};

  if(!user)return<LoginScreen onLogin={u=>{setUser(u);if(u.isAdmin)setActiveTab("inicio");else setActiveTab("inicio");}}/>;
  if(loading)return<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",color:"var(--accent)",fontFamily:"'Bebas Neue',sans-serif",fontSize:28}}>Cargando... ⚽</div>;

  const css=`
    @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@400;500;600;700&family=Barlow+Condensed:wght@400;600;700&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    :root{--bg:#080d18;--card:#0f1923;--card2:#162030;--border:#1c2d42;--accent:#f59e0b;--accent2:#ef4444;--green:#10b981;--blue:#3b82f6;--text:#e2e8f0;--muted:#64748b;--qualified:rgba(16,185,129,0.1);--third:rgba(245,158,11,0.07);}
    body{background:var(--bg);color:var(--text);font-family:'Barlow',sans-serif;min-height:100vh;}
    .app{max-width:1100px;margin:0 auto;padding:0 14px 80px;}

    /* LOGIN */
    .login-wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--bg);}
    .login-card{background:var(--card);border:1px solid var(--border);border-radius:20px;padding:36px 32px;width:340px;text-align:center;}
    .login-logo{font-size:48px;margin-bottom:10px;}
    .login-title{font-family:'Bebas Neue',sans-serif;font-size:42px;color:#fff;letter-spacing:2px;line-height:1;}
    .login-title span{color:var(--accent);}
    .login-sub{font-size:11px;color:var(--muted);letter-spacing:3px;margin-bottom:24px;margin-top:4px;}
    .pin-display{font-family:'Bebas Neue',sans-serif;font-size:32px;letter-spacing:8px;height:52px;display:flex;align-items:center;justify-content:center;background:var(--card2);border-radius:10px;margin-bottom:16px;border:1px solid var(--border);}
    .pin-pad{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px;}
    .pin-key{height:52px;border-radius:10px;background:var(--card2);border:1px solid var(--border);color:var(--text);font-family:'Bebas Neue',sans-serif;font-size:22px;cursor:pointer;transition:all .15s;}
    .pin-key:hover{background:var(--border);border-color:var(--accent);}
    .pin-key:active{transform:scale(0.95);}
    .pin-key.invisible{visibility:hidden;}
    .login-error{color:var(--accent2);font-size:12px;margin-bottom:10px;}
    .login-btn{width:100%;padding:13px;background:var(--accent);border:none;border-radius:10px;color:#000;font-family:'Bebas Neue',sans-serif;font-size:18px;letter-spacing:2px;cursor:pointer;transition:opacity .2s;}
    .login-btn:hover{opacity:.9;}
    .login-btn:disabled{opacity:.5;cursor:not-allowed;}

    /* TOPBAR */
    .topbar{display:flex;align-items:center;justify-content:space-between;padding:14px 0 10px;}
    .topbar-title{font-family:'Bebas Neue',sans-serif;font-size:clamp(28px,6vw,48px);color:#fff;letter-spacing:2px;line-height:1;}
    .topbar-title span{color:var(--accent);}
    .topbar-user{display:flex;align-items:center;gap:8px;}
    .user-badge{padding:5px 12px;background:var(--card2);border:1px solid var(--border);border-radius:20px;font-size:12px;font-weight:600;}
    .admin-badge{padding:5px 12px;background:rgba(245,158,11,.2);border:1px solid var(--accent);border-radius:20px;font-size:11px;font-weight:700;color:var(--accent);}
    .logout-btn{padding:5px 10px;background:transparent;border:1px solid var(--border);border-radius:8px;color:var(--muted);font-size:11px;cursor:pointer;}
    .logout-btn:hover{border-color:var(--accent2);color:var(--accent2);}
    .reload-btn{width:30px;height:30px;background:transparent;border:1px solid var(--border);border-radius:8px;color:var(--muted);font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s;}
    .reload-btn:hover{border-color:var(--accent);transform:rotate(180deg);}

    /* TABS */
    .tabs{display:flex;gap:3px;margin-bottom:20px;flex-wrap:wrap;}
    .tab-btn{background:var(--card);border:1px solid var(--border);color:var(--muted);padding:8px 14px;border-radius:7px;cursor:pointer;font-family:'Barlow Condensed',sans-serif;font-size:13px;font-weight:600;letter-spacing:1px;text-transform:uppercase;transition:all .2s;display:flex;align-items:center;gap:5px;}
    .tab-btn:hover{border-color:var(--accent);color:var(--text);}
    .tab-btn.active{background:var(--accent);color:#000;border-color:var(--accent);}
    .tab-count{background:rgba(0,0,0,.25);border-radius:12px;padding:1px 6px;font-size:10px;}

    /* MODAL */
    .modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.7);display:flex;align-items:center;justify-content:center;z-index:100;}
    .modal-card{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:24px;width:320px;}
    .modal-title{font-family:'Bebas Neue',sans-serif;font-size:22px;margin-bottom:16px;color:var(--accent);}

    /* COUNTDOWN */
    .countdown-card{background:linear-gradient(135deg,#0f1923,#162030);border:1px solid var(--border);border-radius:14px;padding:24px;text-align:center;position:relative;overflow:hidden;margin-bottom:18px;}
    .countdown-card::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 50% 0%,rgba(245,158,11,.08),transparent 70%);pointer-events:none;}
    .countdown-match{font-family:'Bebas Neue',sans-serif;font-size:clamp(15px,3.5vw,22px);color:#fff;margin-bottom:16px;letter-spacing:1px;}
    .countdown-match span{color:var(--accent);}
    .countdown-grid{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;}
    .countdown-unit{background:rgba(0,0,0,.4);border:1px solid var(--border);border-radius:10px;padding:12px 16px;min-width:70px;}
    .countdown-num{font-family:'Bebas Neue',sans-serif;font-size:clamp(28px,6vw,46px);line-height:1;color:var(--accent);display:block;}
    .countdown-sub{font-size:9px;letter-spacing:2px;color:var(--muted);text-transform:uppercase;margin-top:3px;}

    /* STATS */
    .stats-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-bottom:18px;}
    .stat-card{background:var(--card);border:1px solid var(--border);border-radius:10px;padding:13px 16px;}
    .stat-num{font-family:'Bebas Neue',sans-serif;font-size:36px;line-height:1;color:var(--accent);}
    .stat-label{font-size:9px;color:var(--muted);letter-spacing:2px;text-transform:uppercase;margin-bottom:3px;}
    .stat-bar{height:3px;background:var(--border);border-radius:2px;margin-top:7px;overflow:hidden;}
    .stat-bar-fill{height:100%;border-radius:2px;transition:width .6s;}

    /* LAYOUT */
    .two-col{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
    @media(max-width:680px){.two-col{grid-template-columns:1fr;}}
    .card{background:var(--card);border:1px solid var(--border);border-radius:11px;overflow:hidden;}
    .card-title{font-family:'Bebas Neue',sans-serif;font-size:18px;letter-spacing:1px;padding:10px 14px;border-bottom:1px solid var(--border);background:var(--card2);display:flex;align-items:center;justify-content:space-between;gap:7px;}
    .card-body{padding:12px;}

    /* GROUP */
    .group-selector{display:flex;gap:5px;flex-wrap:wrap;margin-bottom:12px;justify-content:center;}
    .group-btn{width:34px;height:34px;border-radius:6px;background:var(--card);border:1px solid var(--border);color:var(--muted);font-family:'Bebas Neue',sans-serif;font-size:15px;cursor:pointer;transition:all .15s;}
    .group-btn:hover{border-color:var(--accent);color:var(--text);}
    .group-btn.active{background:var(--accent);color:#000;border-color:var(--accent);}
    .group-table{background:var(--card);border:1px solid var(--border);border-radius:11px;overflow:hidden;}
    .group-header{font-family:'Bebas Neue',sans-serif;font-size:16px;padding:9px 12px;background:var(--card2);border-bottom:1px solid var(--border);color:var(--accent);}
    .group-table table{width:100%;border-collapse:collapse;font-size:11px;}
    .group-table th{padding:6px 4px;text-align:center;color:var(--muted);font-weight:600;font-size:9px;letter-spacing:1px;text-transform:uppercase;border-bottom:1px solid var(--border);background:rgba(0,0,0,.2);}
    .group-table td{padding:8px 4px;text-align:center;border-bottom:1px solid rgba(30,45,69,.5);}
    .group-table tr:last-child td{border-bottom:none;}
    .group-table tr.qualified{background:var(--qualified);}
    .group-table tr.third-row{background:var(--third);}
    .team-cell{text-align:left!important;padding-left:8px!important;font-weight:600;white-space:nowrap;}
    .pos{color:var(--muted);font-size:10px;font-weight:700;}
    .pts-cell{font-weight:700;color:var(--accent);}

    /* SCORE INPUT */
    .score-input-row{display:flex;align-items:center;justify-content:space-between;padding:8px 11px;border-bottom:1px solid var(--border);gap:6px;}
    .score-input-row:last-child{border-bottom:none;}
    .team-name{font-size:11px;font-weight:600;white-space:nowrap;flex:1;}
    .team-name.home{text-align:right;}
    .score-inputs{display:flex;align-items:center;gap:3px;flex-shrink:0;}
    .score-box{width:34px;height:30px;background:var(--card2);border:1px solid var(--border);border-radius:5px;color:var(--text);text-align:center;font-family:'Bebas Neue',sans-serif;font-size:17px;outline:none;}
    .score-box:focus{border-color:var(--accent);}
    .score-display{font-family:'Bebas Neue',sans-serif;font-size:18px;color:var(--accent);padding:0 10px;}
    .score-sep{color:var(--muted);font-family:'Bebas Neue',sans-serif;font-size:14px;}
    .save-btn{width:24px;height:24px;background:var(--green);border:none;border-radius:5px;color:#fff;cursor:pointer;font-size:11px;font-weight:700;flex-shrink:0;}
    .clear-btn{width:24px;height:24px;background:var(--accent2);border:none;border-radius:5px;color:#fff;cursor:pointer;font-size:9px;flex-shrink:0;}
    .ko-input-row{display:flex;align-items:center;gap:6px;padding:7px 10px;border-bottom:1px solid var(--border);font-size:11px;}
    .ko-input-row:last-child{border-bottom:none;}
    .ko-input-row.pending{color:var(--muted);}
    .ko-label{font-family:'Bebas Neue',sans-serif;font-size:11px;color:var(--accent);min-width:18px;}
    .ko-team{font-weight:600;flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
    .ko-team.right{text-align:right;}

    /* BRACKET */
    .bracket-wrap{overflow-x:auto;padding-bottom:12px;}
    .bracket-note{font-size:11px;color:var(--muted);margin-bottom:12px;line-height:1.6;padding:8px 12px;background:var(--card2);border-radius:7px;border-left:3px solid var(--accent);}
    .bracket-outer{display:flex;gap:6px;min-width:660px;align-items:stretch;}
    .bracket-col{display:flex;flex-direction:column;min-width:108px;}
    .bracket-col-title{font-family:'Bebas Neue',sans-serif;font-size:11px;color:var(--accent);text-align:center;margin-bottom:6px;letter-spacing:1px;padding:3px;background:var(--card2);border-radius:4px;}
    .bracket-col-matches{display:flex;flex-direction:column;justify-content:space-around;flex:1;gap:4px;}
    .bm{background:var(--card2);border:1px solid var(--border);border-radius:7px;overflow:hidden;}
    .bm-slot{display:flex;align-items:center;gap:5px;padding:5px 6px;border-bottom:1px solid var(--border);font-size:10px;font-weight:600;}
    .bm-slot:last-child{border-bottom:none;}
    .bm-slot.bm-winner{background:rgba(16,185,129,.15);}
    .bm-slot.bm-tbd{color:var(--muted);}
    .bm-flag{font-size:12px;flex-shrink:0;}
    .bm-name{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
    .bm-score{font-family:'Bebas Neue',sans-serif;font-size:14px;color:var(--accent);margin-left:auto;}
    .champion-col{display:flex;flex-direction:column;align-items:center;justify-content:center;min-width:96px;gap:6px;}
    .champion-box{background:linear-gradient(135deg,rgba(245,158,11,.2),rgba(245,158,11,.05));border:2px solid var(--accent);border-radius:10px;padding:10px 8px;text-align:center;width:100%;}
    .champion-title{font-family:'Bebas Neue',sans-serif;font-size:12px;color:var(--accent);letter-spacing:1px;}
    .champion-emoji{font-size:24px;margin:5px 0;}
    .champion-name{font-family:'Bebas Neue',sans-serif;font-size:13px;color:#fff;}

    /* QUINIELA / RANKING */
    .q-input{padding:8px 11px;background:var(--card2);border:1px solid var(--border);border-radius:7px;color:var(--text);font-size:12px;outline:none;}
    .q-input:focus{border-color:var(--accent);}
    .q-btn{padding:8px 13px;background:var(--accent);border:none;border-radius:7px;color:#000;font-weight:700;font-size:12px;cursor:pointer;font-family:'Barlow Condensed',sans-serif;letter-spacing:1px;white-space:nowrap;}
    .match-selector{display:flex;flex-direction:column;gap:2px;max-height:340px;overflow-y:auto;}
    .match-selector-item{display:flex;align-items:center;gap:7px;padding:6px 8px;border-radius:6px;border:1px solid var(--border);background:var(--card2);cursor:pointer;font-size:11px;transition:border-color .15s;}
    .match-selector-item:hover{border-color:var(--accent);}
    .match-selector-item.selected{border-color:var(--blue);background:rgba(59,130,246,.08);}
    .match-group-tag{font-family:'Bebas Neue',sans-serif;font-size:12px;color:var(--accent);width:18px;flex-shrink:0;}
    .pred-grid{display:flex;flex-direction:column;gap:4px;}
    .pred-row{display:flex;align-items:center;padding:6px 8px;background:var(--card2);border-radius:6px;border:1px solid var(--border);gap:6px;font-size:10px;}
    .pred-teams{flex:1;font-weight:600;}
    .pred-inputs{display:flex;align-items:center;gap:2px;}
    .pred-box{width:30px;height:26px;background:var(--bg);border:1px solid var(--border);border-radius:4px;color:var(--text);text-align:center;font-family:'Bebas Neue',sans-serif;font-size:15px;outline:none;}
    .pred-box:focus{border-color:var(--blue);}
    .pred-badge{min-width:23px;height:23px;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;margin-left:2px;}
    .pred-badge.exact{background:rgba(16,185,129,.2);color:var(--green);}
    .pred-badge.outcome{background:rgba(245,158,11,.2);color:var(--accent);}
    .pred-badge.wrong{background:rgba(239,68,68,.15);color:var(--accent2);}
    .pred-badge.pending{background:var(--card);color:var(--muted);}
    .ranking-list{display:flex;flex-direction:column;gap:6px;}
    .rank-row{display:flex;align-items:center;gap:9px;padding:10px 12px;background:var(--card2);border-radius:9px;border:1px solid var(--border);}
    .rank-row.mine{border-color:var(--accent);}
    .rank-pos{font-family:'Bebas Neue',sans-serif;font-size:22px;color:var(--muted);width:24px;}
    .rank-pos.gold{color:#f59e0b;}.rank-pos.silver{color:#94a3b8;}.rank-pos.bronze{color:#b45309;}
    .rank-name{flex:1;font-weight:700;font-size:13px;}
    .rank-pts{font-family:'Bebas Neue',sans-serif;font-size:26px;color:var(--accent);}
    .rank-detail{font-size:9px;color:var(--muted);display:flex;gap:6px;flex-wrap:wrap;margin-top:1px;}
    .rank-meta{display:flex;flex-direction:column;flex:1;}
    .pts-pill{padding:2px 6px;border-radius:10px;font-size:9px;font-weight:600;}
    .pts-breakdown{display:flex;gap:4px;margin-top:3px;}
    .match-row{display:flex;align-items:center;justify-content:space-between;padding:8px 11px;border-bottom:1px solid var(--border);font-size:11px;font-weight:600;}
    .match-row:last-child{border-bottom:none;}
    .match-result{font-family:'Bebas Neue',sans-serif;font-size:18px;color:var(--accent);padding:0 6px;}
    .legend{display:flex;gap:12px;margin-top:8px;flex-wrap:wrap;}
    .legend-item{display:flex;align-items:center;gap:5px;font-size:10px;color:var(--muted);}
    .legend-dot{width:8px;height:8px;border-radius:2px;}
    .score-rules{margin-top:8px;padding:7px 10px;background:var(--card2);border-radius:6px;font-size:10px;color:var(--muted);line-height:1.9;}
    .player-chip{padding:4px 11px;border-radius:20px;background:var(--card2);border:1px solid var(--border);font-size:11px;font-weight:600;cursor:pointer;transition:all .15s;}
    .player-chip:hover{border-color:var(--accent);}
    .player-chip.active{background:var(--accent);color:#000;border-color:var(--accent);}
    .player-list{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px;}
    input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;}
    input[type=number]{-moz-appearance:textfield;}
  `;

  return(
    <>
      <style>{css}</style>
      {showAddModal&&<AddParticipantModal onClose={()=>setShowAddModal(false)}/>}
      <div className="app">

        {/* TOPBAR */}
        <div className="topbar">
          <div className="topbar-title">MUNDIAL <span>2026</span></div>
          <div className="topbar-user">
            {isAdmin?<div className="admin-badge">⚙️ ADMIN</div>:<div className="user-badge">👤 {user.name}</div>}
            <button className="reload-btn" onClick={()=>{setPanini({teams:{},specials:{}});setTimeout(()=>{const uid=isAdmin?"admin":safeKey((user?.name||"guest").toLowerCase());get(ref(db,`panini/${uid}`)).then(snap=>{if(snap.exists())setPanini(snap.val());});},100);}} title="Recargar">🔄</button>
            <button className="logout-btn" onClick={()=>{setUser(null);setActiveTab("inicio");}}>Salir</button>
          </div>
        </div>

        {/* TABS */}
        <div className="tabs">
          <Tab label="🏠 Inicio" active={activeTab==="inicio"} onClick={()=>setActiveTab("inicio")}/>
          <Tab label="⚽ Grupos" active={activeTab==="grupos"} onClick={()=>setActiveTab("grupos")}/>
          <Tab label="📊 Resultados" active={activeTab==="resultados"} onClick={()=>setActiveTab("resultados")}/>
          <Tab label="🏆 Llaves" active={activeTab==="llaves"} onClick={()=>setActiveTab("llaves")}/>
          <Tab label="🎯 Quiniela" active={activeTab==="quiniela"} onClick={()=>setActiveTab("quiniela")}/>
          <Tab label="⭐ 11 Ideal" active={activeTab==="once"} onClick={()=>setActiveTab("once")}/>
          {isAdmin&&<Tab label="📋 Jornada" active={activeTab==="jornada"} onClick={()=>setActiveTab("jornada")}/>}
          <Tab label="📒 Panini" active={activeTab==="panini"} onClick={()=>setActiveTab("panini")}/>
          {isAdmin&&<Tab label="👥 Usuarios" active={activeTab==="usuarios"} onClick={()=>setActiveTab("usuarios")} badge={Object.keys(participants).length}/>}
        </div>

        {/* ── INICIO ── */}
        {activeTab==="inicio"&&(
          <div>
            <div className="countdown-card">
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:11,letterSpacing:3,color:"var(--accent)",textTransform:"uppercase",marginBottom:12}}>Partido Inaugural · Cuenta Regresiva</div>
              <div className="countdown-match">🇲🇽 <span>México</span> vs <span>Sudáfrica</span> 🇿🇦 · 11 Jun 2026 · 12:00pm CDMX</div>
              {countdown.started
                ?<div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:28,color:"var(--green)",letterSpacing:2}}>⚽ ¡EL MUNDIAL HA COMENZADO!</div>
                :<div className="countdown-grid">
                  {[{val:countdown.days,label:"días"},{val:countdown.hours,label:"horas"},{val:countdown.mins,label:"min"},{val:countdown.secs,label:"seg"}].map(u=>(
                    <div key={u.label} className="countdown-unit"><span className="countdown-num">{String(u.val).padStart(2,"0")}</span><span className="countdown-sub">{u.label}</span></div>
                  ))}
                </div>
              }
            </div>

            <div className="stats-row">
              {[
                {label:"Partidos Jugados",val:playedCount,color:"var(--green)",pct:(playedCount/matches.length)*100},
                {label:"Restantes Grupos",val:matches.length-playedCount,color:"var(--accent)",pct:((matches.length-playedCount)/matches.length)*100},
                {label:"Participantes",val:Object.keys(participants).length,color:"var(--blue)",pct:Math.min(Object.keys(participants).length*10,100)},
              ].map(s=>(
                <div key={s.label} className="stat-card">
                  <div className="stat-label">{s.label}</div>
                  <div className="stat-num" style={{color:s.color}}>{s.val}</div>
                  <div className="stat-bar"><div className="stat-bar-fill" style={{width:`${s.pct}%`,background:s.color}}/></div>
                </div>
              ))}
            </div>

            {/* RANKING GENERAL */}
            {participantScores.length>0&&(
              <div className="card" style={{marginBottom:16}}>
                <div className="card-title">🏆 Ranking General</div>
                <div className="card-body">
                  <div className="ranking-list">
                    {participantScores.map((p,i)=>(
                      <div key={p.id} className={`rank-row ${myId&&p.id===myId?"mine":""}`}>
                        <div className={`rank-pos ${i===0?"gold":i===1?"silver":i===2?"bronze":""}`}>{i+1}</div>
                        <div className="rank-meta">
                          <div className="rank-name">{p.name}{myId&&p.id===myId&&<span style={{fontSize:10,color:"var(--accent)",marginLeft:6}}>← tú</span>}</div>
                          <div className="pts-breakdown">
                            <span className="pts-pill" style={{background:"rgba(245,158,11,0.12)",color:"var(--accent)"}}>🎯 {p.quiniela}</span>
                            <span className="pts-pill" style={{background:"rgba(59,130,246,0.12)",color:"var(--blue)"}}>⭐ {p.once}</span>
                          </div>
                        </div>
                        <div className="rank-pts">{p.total}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(250px,1fr))",gap:10}}>
              {Object.keys(GROUPS_DATA).slice(0,4).map(g=>(
                <div key={g} className="group-table">
                  <div className="group-header">Grupo {g}</div>
                  <table><thead><tr><th></th><th>Equipo</th><th>PJ</th><th>Pts</th></tr></thead>
                    <tbody>{calcStandings(matches,g).map((s,i)=>(
                      <tr key={s.team} className={i<2?"qualified":i===2?"third-row":""}>
                        <td className="pos">{i+1}</td><td className="team-cell">{flag(s.team)} {s.team}</td><td>{s.mp}</td><td className="pts-cell">{s.pts}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              ))}
            </div>
            <div style={{textAlign:"center",marginTop:8,fontSize:10,color:"var(--muted)"}}>
              Grupos A–D · <button onClick={()=>setActiveTab("grupos")} style={{background:"none",border:"none",color:"var(--accent)",cursor:"pointer",fontSize:10,fontWeight:700}}>Ver todos →</button>
            </div>

            {/* PANINI WIDGET */}
            <div className="card" style={{marginTop:16}}>
              <div className="card-title">
                <span>📒 Mi Panini</span>
                <button onClick={()=>setActiveTab("panini")} style={{padding:"4px 12px",background:"var(--accent)",border:"none",borderRadius:6,color:"#000",fontSize:11,fontWeight:700,cursor:"pointer"}}>Ver todo →</button>
              </div>
              <div className="card-body">
                {/* Big % */}
                <div style={{display:"flex",alignItems:"center",gap:20,marginBottom:16}}>
                  <div style={{position:"relative",width:90,height:90,flexShrink:0}}>
                    <svg viewBox="0 0 90 90" style={{transform:"rotate(-90deg)"}}>
                      <circle cx="45" cy="45" r="38" fill="none" stroke="var(--border)" strokeWidth="8"/>
                      <circle cx="45" cy="45" r="38" fill="none" stroke="var(--accent)" strokeWidth="8"
                        strokeDasharray={`${2*Math.PI*38}`}
                        strokeDashoffset={`${2*Math.PI*38*(1-paniniHomeStats.pct/100)}`}
                        strokeLinecap="round" style={{transition:"stroke-dashoffset .8s"}}/>
                    </svg>
                    <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
                      <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,color:"var(--accent)",lineHeight:1}}>{paniniHomeStats.pct}%</div>
                      <div style={{fontSize:9,color:"var(--muted)"}}>completado</div>
                    </div>
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:28,color:"var(--text)",lineHeight:1}}>{paniniHomeStats.totalOwned}<span style={{fontSize:14,color:"var(--muted)"}}>/993</span></div>
                    <div style={{fontSize:11,color:"var(--muted)",marginTop:4}}>estampas obtenidas</div>
                    <div style={{height:4,background:"var(--border)",borderRadius:2,marginTop:8,overflow:"hidden"}}>
                      <div style={{height:"100%",background:"var(--accent)",borderRadius:2,width:`${paniniHomeStats.pct}%`,transition:"width .8s"}}/>
                    </div>
                  </div>
                </div>

                {/* Top teams */}
                {paniniHomeStats.top.some(t=>t.owned>0)&&(
                  <div>
                    <div style={{fontSize:10,color:"var(--muted)",letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>🏆 Selecciones más completas</div>
                    <div style={{display:"flex",flexDirection:"column",gap:6}}>
                      {paniniHomeStats.top.filter(t=>t.owned>0).map((t,i)=>(
                        <div key={t.code} onClick={()=>setActiveTab("panini")}
                          style={{display:"flex",alignItems:"center",gap:10,padding:"7px 10px",background:"var(--card2)",borderRadius:8,border:"1px solid var(--border)",cursor:"pointer"}}
                          onMouseEnter={e=>e.currentTarget.style.borderColor="var(--accent)"}
                          onMouseLeave={e=>e.currentTarget.style.borderColor="var(--border)"}>
                          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:16,color:"var(--muted)",width:20}}>{i+1}</div>
                          <div style={{fontSize:22}}>{paniniFlag(t.team)}</div>
                          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:16,color:"var(--accent)",width:36}}>{t.code}</div>
                          <div style={{flex:1}}>
                            <div style={{height:4,background:"var(--border)",borderRadius:2,overflow:"hidden"}}>
                              <div style={{height:"100%",background:t.pct===100?"var(--green)":"var(--accent)",borderRadius:2,width:`${t.pct}%`,transition:"width .6s"}}/>
                            </div>
                          </div>
                          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:18,color:t.pct===100?"var(--green)":"var(--text)",minWidth:40,textAlign:"right"}}>{t.owned}<span style={{fontSize:11,color:"var(--muted)"}}>/20</span></div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {paniniHomeStats.totalOwned===0&&(
                  <div style={{textAlign:"center",padding:16,color:"var(--muted)",fontSize:12}}>Aún no tienes estampas registradas. <button onClick={()=>setActiveTab("panini")} style={{background:"none",border:"none",color:"var(--accent)",cursor:"pointer",fontWeight:700}}>¡Ve al Panini!</button></div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── GRUPOS ── */}
        {activeTab==="grupos"&&(
          <div>
            <div className="group-selector">{Object.keys(GROUPS_DATA).map(g=><button key={g} className={`group-btn ${selectedGroup===g?"active":""}`} onClick={()=>setSelectedGroup(g)}>{g}</button>)}</div>
            <div className="two-col">
              <GroupTable matches={matches} group={selectedGroup}/>
              <div className="card">
                <div className="card-title">Partidos · Grupo {selectedGroup}</div>
                {matches.filter(m=>m.group===selectedGroup).map(m=>(
                  <ScoreInput key={m.id} match={m} disabled={!isAdmin}
                    onSave={(h,a)=>saveMatch(m.id,h,a)}/>
                ))}
              </div>
            </div>
            <div className="legend">
              <div className="legend-item"><div className="legend-dot" style={{background:"rgba(16,185,129,.5)"}}/>Clasifican (1° y 2°)</div>
              <div className="legend-item"><div className="legend-dot" style={{background:"rgba(245,158,11,.4)"}}/>Posible mejor tercero</div>
            </div>
          </div>
        )}

        {/* ── RESULTADOS ── */}
        {activeTab==="resultados"&&(
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))",gap:12}}>
            {Object.keys(GROUPS_DATA).map(g=>(
              <div key={g} className="group-table">
                <div className="group-header">Grupo {g}</div>
                {matches.filter(m=>m.group===g).map(m=>(
                  m.played
                    ?<div key={m.id} className="match-row"><span>{flag(m.home)} {m.home}</span><span className="match-result">{m.homeScore}–{m.awayScore}</span><span>{m.away} {flag(m.away)}</span></div>
                    :<div key={m.id} className="match-row" style={{color:"var(--muted)",fontSize:10}}><span>{flag(m.home)} {m.home}</span><span style={{color:"var(--border)",fontFamily:"'Bebas Neue'"}}>vs</span><span>{m.away} {flag(m.away)}</span></div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* ── LLAVES ── */}
        {activeTab==="llaves"&&(
          <div>
            <p className="bracket-note">🔮 <strong>Bracket potencial en tiempo real.</strong> Se actualiza solo conforme avanzan los resultados. {isAdmin&&"Como admin puedes registrar los marcadores de la fase KO abajo."}</p>
            <div className="card" style={{marginBottom:12}}>
              <div className="card-title">🏆 Cuadro Eliminatorio</div>
              <div className="card-body">
                <div className="bracket-wrap">
                  <div className="bracket-outer">
                    <div className="bracket-col">
                      <div className="bracket-col-title">Ronda de 32</div>
                      <div className="bracket-col-matches">{bracket.r32.slice(0,8).map((m,i)=><BracketMatch key={i} m={m}/>)}</div>
                    </div>
                    <div className="bracket-col">
                      <div className="bracket-col-title">Octavos</div>
                      <div className="bracket-col-matches">{bracket.r16.slice(0,4).map((m,i)=><BracketMatch key={i} m={m}/>)}</div>
                    </div>
                    <div className="bracket-col">
                      <div className="bracket-col-title">Cuartos</div>
                      <div className="bracket-col-matches">{bracket.qf.slice(0,2).map((m,i)=><BracketMatch key={i} m={m}/>)}</div>
                    </div>
                    <div className="bracket-col">
                      <div className="bracket-col-title">Semifinal</div>
                      <div className="bracket-col-matches">{bracket.sf.slice(0,1).map((m,i)=><BracketMatch key={i} m={m}/>)}</div>
                    </div>
                    <div className="champion-col">
                      <div className="bracket-col-title" style={{width:"100%"}}>Final</div>
                      <BracketMatch m={bracket.final[0]}/>
                      <div className="champion-box">
                        <div className="champion-title">🏆 CAMPEÓN</div>
                        <div className="champion-emoji">{bracket.champion?flag(bracket.champion):"🏆"}</div>
                        <div className="champion-name">{bracket.champion||"TBD"}</div>
                      </div>
                    </div>
                    <div className="bracket-col">
                      <div className="bracket-col-title">Semifinal</div>
                      <div className="bracket-col-matches">{bracket.sf.slice(1,2).map((m,i)=><BracketMatch key={i} m={m}/>)}</div>
                    </div>
                    <div className="bracket-col">
                      <div className="bracket-col-title">Cuartos</div>
                      <div className="bracket-col-matches">{bracket.qf.slice(2).map((m,i)=><BracketMatch key={i} m={m}/>)}</div>
                    </div>
                    <div className="bracket-col">
                      <div className="bracket-col-title">Octavos</div>
                      <div className="bracket-col-matches">{bracket.r16.slice(4).map((m,i)=><BracketMatch key={i} m={m}/>)}</div>
                    </div>
                    <div className="bracket-col">
                      <div className="bracket-col-title">Ronda de 32</div>
                      <div className="bracket-col-matches">{bracket.r32.slice(8).map((m,i)=><BracketMatch key={i} m={m}/>)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {isAdmin&&["r32","r16","qf","sf","final"].map(round=>(
              <div key={round} className="card" style={{marginBottom:10}}>
                <div className="card-title">✏️ {roundLabels[round]}</div>
                {bracket[round].map((m,i)=>(
                  <KOScoreInput key={i} match={m} label={`M${i+1}`} disabled={false}
                    onSave={(data)=>saveKO(round,i,data)}/>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* ── QUINIELA ── */}
        {activeTab==="quiniela"&&(
          <div>
            <div className="two-col">
              <div>
                {isAdmin&&(
                  <div className="card" style={{marginBottom:12}}>
                    <div className="card-title">📋 Partidos de la quiniela</div>
                    <div className="card-body">
                      <p style={{fontSize:10,color:"var(--muted)",marginBottom:8}}>Selecciona los partidos que entran:</p>
                      <div className="match-selector">
                        {matches.map(m=>(
                          <div key={m.id} className={`match-selector-item ${quinielaMatches.includes(m.id)?"selected":""}`} onClick={()=>toggleQMatch(m.id)}>
                            <input type="checkbox" readOnly checked={quinielaMatches.includes(m.id)}/>
                            <span className="match-group-tag">{m.group}</span>
                            <span style={{flex:1}}>{flag(m.home)} {m.home} vs {m.away} {flag(m.away)}</span>
                            {m.played&&<span style={{fontSize:9,color:"var(--green)"}}>✓{m.homeScore}–{m.awayScore}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {!isAdmin&&myId&&(
                  <div className="card">
                    <div className="card-title" style={{justifyContent:"space-between",flexWrap:"wrap",gap:6}}>
                      <span>{myData?.quinielaLocked?"🔒 Quiniela Guardada":"✏️ Mis Pronósticos"}</span>
                      <div style={{display:"flex",gap:6}}>
                        {quinielaMatches.length>0&&<button className="q-btn" style={{fontSize:11,padding:"5px 10px"}} onClick={()=>exportQuiniela(user,quinielaMatches,matches,myPreds,myData?.predictions?.podio||{})}>📥 Descargar</button>}
                        {quinielaMatches.length>0&&!myData?.quinielaLocked&&<button className="q-btn" style={{fontSize:11,padding:"5px 10px",background:"var(--green)"}} onClick={()=>lockQuiniela(myId,true)}>🔒 Guardar</button>}
                        {quinielaMatches.length>0&&myData?.quinielaLocked&&isAdmin&&<button className="q-btn" style={{fontSize:11,padding:"5px 10px",background:"var(--accent2)"}} onClick={()=>lockQuiniela(myId,false)}>🔓 Desbloquear</button>}
                      </div>
                    </div>
                    <div className="card-body">
                      {quinielaMatches.length===0
                        ?<div style={{color:"var(--muted)",fontSize:11,textAlign:"center",padding:20}}>El admin aún no ha seleccionado los partidos.</div>
                        :<>
                          <div className="pred-grid">
                            {quinielaMatches.map(mid=>{
                              const m=matches.find(x=>x.id===mid);
                              if(!m)return null;
                              const pred=myPreds[mid]||{};
                              const pts=scoreQuiniela(pred,m);
                              const real=m.played?(m.homeScore>m.awayScore?"L":m.awayScore>m.homeScore?"V":"E"):null;
                              return(
                                <div key={mid} className="pred-row">
                                  <div className="pred-teams">
                                    <span style={{color:"var(--accent)",fontFamily:"'Bebas Neue'",marginRight:3}}>{m.group}</span>
                                    {flag(m.home)} {short(m.home)} vs {short(m.away)} {flag(m.away)}
                                  </div>
                                  <div className="pred-inputs">
                                    {["L","E","V"].map(opt=>{
                                      const selected=pred.result===opt;
                                      const isCorrect=m.played&&real===opt;
                                      const isWrong=m.played&&selected&&real!==opt;
                                      const isLocked=myData?.quinielaLocked&&!isAdmin;
                                      return(
                                        <button key={opt} disabled={m.played||isLocked}
                                          onClick={()=>savePred(myId,mid,opt)}
                                          style={{
                                            width:32,height:28,borderRadius:5,border:"1px solid",
                                            fontSize:11,fontWeight:700,cursor:m.played?"default":"pointer",
                                            background:selected?(isWrong?"var(--accent2)":isCorrect?"var(--green)":"var(--accent)"):"var(--card)",
                                            borderColor:selected?(isWrong?"var(--accent2)":isCorrect?"var(--green)":"var(--accent)"):"var(--border)",
                                            color:selected?"#000":"var(--muted)",
                                            transition:"all .15s"
                                          }}>
                                          {opt}
                                        </button>
                                      );
                                    })}
                                    {m.played&&pred.result&&<div className={`pred-badge ${pts===1?"exact":"wrong"}`}>{pts===1?"+1":"✗"}</div>}
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* PODIO */}
                          <div style={{marginTop:14,padding:"10px 12px",background:"var(--card2)",borderRadius:8,border:"1px solid var(--border)"}}>
                            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:14,color:"var(--accent)",marginBottom:8,letterSpacing:1}}>🏆 PREDICCIÓN DE PODIO</div>
                            {[{key:"champion",label:"🥇 Campeón"},{key:"runner",label:"🥈 Subcampeón"},{key:"third",label:"🥉 Tercer lugar"}].map(({key,label})=>{
                              const allTeams=Object.values(GROUPS_DATA).flatMap(g=>g.teams);
                              const current=myData?.predictions?.podio?.[key]||"";
                              return(
                                <div key={key} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                                  <span style={{fontSize:11,fontWeight:600,width:90,flexShrink:0}}>{label}</span>
                                  <select value={current} disabled={myData?.quinielaLocked&&!isAdmin} onChange={e=>savePodio(myId,key,e.target.value)}
                                    style={{flex:1,padding:"5px 8px",background:"var(--card)",border:"1px solid var(--border)",borderRadius:6,color:"var(--text)",fontSize:11,outline:"none"}}>
                                    <option value="">— Selecciona —</option>
                                    {allTeams.map(t=><option key={t} value={t}>{flag(t)} {t}</option>)}
                                  </select>
                                </div>
                              );
                            })}
                          </div>
                        </>
                      }
                    </div>
                  </div>
                )}
              </div>

              <div>
                <div className="card">
                  <div className="card-title">🏅 Ranking Quiniela</div>
                  <div className="card-body">
                    {participantScores.length===0
                      ?<div style={{textAlign:"center",padding:24,color:"var(--muted)",fontSize:11}}>Sin participantes aún</div>
                      :<div className="ranking-list">
                        {participantScores.map((p,i)=>(
                          <div key={p.id} className={`rank-row ${myId&&p.id===myId?"mine":""}`}>
                            <div className={`rank-pos ${i===0?"gold":i===1?"silver":i===2?"bronze":""}`}>{i+1}</div>
                            <div className="rank-meta">
                              <div className="rank-name">{p.name}{myId&&p.id===myId&&<span style={{fontSize:9,color:"var(--accent)",marginLeft:5}}>← tú</span>}</div>
                              <div className="rank-detail"><span>✅ {p.correct} aciertos</span><span>❌ {p.wrong} fallos</span>{p.pending>0&&<span>⏳ {p.pending}</span>}</div>
                            </div>
                            <div className="rank-pts">{p.quiniela}</div>
                          </div>
                        ))}
                      </div>
                    }
                    <div className="score-rules">✅ L/E/V correcto = <strong style={{color:"var(--green)"}}>1 pt</strong></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── 11 IDEAL ── */}
        {activeTab==="once"&&(
          <div>
            <div className="two-col" style={{marginBottom:14}}>
              <div className="card">
                <div className="card-title">⭐ Ranking 11 Ideal</div>
                <div className="card-body">
                  <div className="ranking-list">
                    {participantScores.map((p,i)=>(
                      <div key={p.id} className={`rank-row ${myId&&p.id===myId?"mine":""}`}
                        style={{cursor:"pointer"}} onClick={()=>setOncePanelId(p.id)}>
                        <div className={`rank-pos ${i===0?"gold":i===1?"silver":i===2?"bronze":""}`}>{i+1}</div>
                        <div className="rank-meta">
                          <div className="rank-name">{p.name}{myId&&p.id===myId&&<span style={{fontSize:9,color:"var(--accent)",marginLeft:5}}>← tú</span>}</div>
                          <div className="rank-detail">{Object.values(participants[p.id]?.lineup||{}).filter(Boolean).length}/11 jugadores</div>
                        </div>
                        <div className="rank-pts">{p.once}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{marginTop:10,padding:"8px 10px",background:"var(--card2)",borderRadius:6,fontSize:10,color:"var(--muted)",lineHeight:1.9}}>
                    ⚽ Gol=+5 · 🎯 Asist=+3 · ⏱90'=+2 · ⚡Área=+1<br/>
                    🧤 Valla=+5 · ⭐MVP(campo)=+3 · ⭐MVP(POR)=+5<br/>
                    🟨=-1 · 🟥=-3 · 🥅GolRec=-1
                  </div>
                </div>
              </div>
              <div>
                {!isAdmin&&(
                  <div className="card" style={{marginBottom:10}}>
                    <div className="card-title">⭐ Mi 11 Ideal</div>
                    <div className="card-body">
                      <OnceIdealBuilder
                        participantId={myId}
                        onceData={participants[myId]}
                        isAdmin={false}
                        currentUserId={myId}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Admin o al hacer click en otro participante */}
            {oncePanelId&&(isAdmin||oncePanelId===myId)&&(
              <div className="card">
                <div className="card-title">
                  ⭐ 11 Ideal · {participants[oncePanelId]?.name||oncePanelId}
                  <button onClick={()=>setOncePanelId(null)} style={{background:"none",border:"none",color:"var(--muted)",cursor:"pointer",fontSize:18}}>×</button>
                </div>
                <div className="card-body">
                  <OnceIdealBuilder
                    participantId={oncePanelId}
                    onceData={participants[oncePanelId]}
                    isAdmin={isAdmin}
                    currentUserId={myId}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── JORNADA (Admin) ── */}
        {activeTab==="jornada"&&isAdmin&&(
          <div className="card">
            <div className="card-title">📋 Panel de Jornada · Estadísticas</div>
            <div className="card-body">
              <JornadaPanel
                participants={participants}
                jornadaStats={jornadaStats}
                onUpdateStat={updateStat}
              />
            </div>
          </div>
        )}

        {/* ── USUARIOS (Admin) ── */}
        {activeTab==="usuarios"&&isAdmin&&(
          <div>
            <div className="card">
              <div className="card-title">
                <span>👥 Participantes ({Object.keys(participants).length})</span>
                <button className="q-btn" onClick={()=>setShowAddModal(true)}>+ Agregar</button>
              </div>
              <div className="card-body">
                {Object.values(participants).length===0
                  ?<div style={{textAlign:"center",padding:24,color:"var(--muted)"}}>No hay participantes aún. Agrega el primero.</div>
                  :<div style={{display:"flex",flexDirection:"column",gap:8}}>
                    {Object.values(participants).map(p=>{
                      const score=participantScores.find(s=>s.id===p.id);
                      return(
                        <div key={p.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",background:"var(--card2)",borderRadius:9,border:"1px solid var(--border)"}}>
                          <div style={{flex:1}}>
                            <div style={{fontWeight:700,fontSize:13}}>{p.name}</div>
                            <div style={{fontSize:10,color:"var(--muted)"}}>PIN: {p.pin} · {Object.values(p.lineup||{}).filter(Boolean).length}/11 jugadores</div>
                          </div>
                          <div style={{textAlign:"right",display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
                            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,color:"var(--accent)"}}>{score?.total||0} pts</div>
                            <div style={{fontSize:9,color:"var(--muted)"}}>Q:{score?.quiniela||0} · 11:{score?.once||0}</div>
                            {p.quinielaLocked
                              ?<button onClick={()=>lockQuiniela(p.id,false)} style={{fontSize:10,padding:"3px 8px",background:"rgba(239,68,68,.15)",border:"1px solid var(--accent2)",borderRadius:6,color:"var(--accent2)",cursor:"pointer"}}>🔓 Desbloquear</button>
                              :<span style={{fontSize:10,color:"var(--muted)"}}>Sin guardar</span>
                            }
                          </div>
                        </div>
                      );
                    })}
                  </div>
                }
              </div>
            </div>
          </div>
        )}

        {/* ── PANINI ── */}
        {activeTab==="panini"&&(
          <div>
            <PaniniSection
              panini={panini}
              onToggle={paniniToggle}
              onToggleSpecial={paniniToggleSpecial}
              onSpecialLabel={paniniSpecialLabel}
              onDup={paniniDup}
              isAdmin={isAdmin}
              userId={myId}
            />
          </div>
        )}

      </div>
    </>
  );
}
