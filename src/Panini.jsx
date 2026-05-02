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
// 01 = Estadio
// 02–12 = Jugadores 1–11
// 13 = Foto Equipo
// 14–20 = Jugadores 12–18
function buildStickers(teamName, players) {
  const code = FIFA_CODE[teamName] || teamName;
  const p = players || [];
  const slots = [];
  slots.push({ num:"01", code:`${code}01`, label:"Estadio",     type:"stadium" });
  for (let i=0;i<11;i++)  slots.push({ num:String(i+2).padStart(2,"0"),  code:`${code}${String(i+2).padStart(2,"0")}`,  label:p[i]||`Jugador ${i+1}`,   type:"player" });
  slots.push({ num:"13", code:`${code}13`, label:"Foto Equipo", type:"team" });
  for (let i=11;i<18;i++) slots.push({ num:String(i+3).padStart(2,"0"),  code:`${code}${String(i+3).padStart(2,"0")}`,  label:p[i]||`Jugador ${i+1}`,  type:"player" });
  return slots; // 20 total
}

const TEAM_PLAYERS = {
  México:         ["Ochoa","C. Montes","J. Sánchez","E. Álvarez","H. Lozano","R. Jiménez","S. Giménez","A. Vega","R. Alvarado","J. Gallardo","N. Araujo","G. Orozco","L. Romo","C. Antuna","J. Corona","O. Aguirre","A. Zendejas","E. Gutierrez"],
  "Corea del Sur":["J. Hyeon-woo","K. Min-jae","S. Heung-min","L. Kang-in","H. Hee-chan","O. Hyeon-gyu","K. Chang-hoon","H. In-beom","J. Tae-seok","K. Jin-su","K. Young-gwon","K. Moon-hwan","L. Jae-sung","K. Bum-suk","S. Min-gyu","W. In-beom","C. Jun","L. Jun-seo"],
  Sudáfrica:      ["R. Williams","S. Xulu","M. Mvala","P. Tau","L. Foster","T. Zwane","T. Mokoena","E. Makgopa","B. Khumalo","G. Mothwa","S. Lorch","R. De Reuck","T. Mthembu","K. Dolly","D. Lakay","Y. Mkhwanazi","S. Matlaba","O. Mobbie"],
  "Rep. Checa":   ["T. Vaclík","T. Souček","V. Coufal","P. Schick","A. Hložek","O. Lingr","L. Provod","J. Jankto","M. Jurásek","T. Vlček","D. Jurásek","L. Šulc","A. Vlkanova","D. Holes","P. Savic","L. Cerv","J. Krejci","A. Barak"],
  Canadá:         ["M. Borjan","A. Davies","J. David","C. Larin","S. Eustáquio","T. Buchanan","A. Hutchinson","R. Laryea","L. Osorio","J. Waterman","I. Kone","K. Miller","D. Henry","C. Cornelius","A. Adekugbe","M. Johnston","J. Shaffelburg","S. Hoilett"],
  Suiza:          ["Y. Sommer","M. Akanji","N. Elvedi","G. Xhaka","X. Shaqiri","B. Embolo","R. Freuler","N. Okafor","Z. Amdouni","S. Zuber","D. Ndoye","A. Rieder","M. Vargas","F. Frei","M. Widmer","L. Kobel","C. Fassnacht","S. Sow"],
  Qatar:          ["S. Al Sheeb","P. Miguel","A. Hassan","H. Al-Haydos","A. Ali","A. Afif","A. Madibo","H. Ahmed","K. Boudiaf","B. Khoukhi","A. Al-Hatem","M. Muntari","Y. Al-Rawi","A. Al-Ahrak","S. Al-Mohannadi","N. Al-Yazidi","I. Al-Hassan","O. Al-Yasin"],
  "Bosnia y Herz.":["I. Šehić","S. Kolašinac","E. Džeko","M. Pjanić","A. Ahmedhodžić","H. Duljevic","N. Bajrami","E. Bičakčić","E. Kovačević","D. Husić","A. Hadžic","S. Rahmanović","A. Cipetic","L. Memic","M. Janjoš","E. Husic","D. Saric","M. Kvrzic"],
  Brasil:         ["Alisson","Marquinhos","Thiago Silva","Vinicius Jr.","Rodrygo","Richarlison","Casemiro","Endrick","Militão","Danilo","Alex Sandro","Lucas Paquetá","Gerson","A. Pereira","G. Martinelli","Raphinha","G. Jesus","M. Cunha"],
  Marruecos:      ["Y. Bounou","A. Hakimi","N. Aguerd","S. Amrabat","H. Ziyech","Y. En-Nesyri","A. Ounahi","N. Mazraoui","R. Abde","S. Benrahma","I. Saiss","A. Tagnaouti","B. Dari","Y. Jabrane","I. Ezzalzouli","S. El Kaabi","Z. Aboukhlal","T. Lahlou"],
  Escocia:        ["C. Gordon","A. Robertson","S. McTominay","J. McGinn","L. Dykes","C. Adams","R. Christie","K. Tierney","G. Hendry","D. Patterson","B. McKenna","C. Hanlon","S. Armstrong","B. Gilmour","J. Shankland","K. McLean","R. Jack","D. Considine"],
  Haití:          ["J. Duverger","M. Jérôme","S. Saba","D. Nazon","W. Guerrier","K. Lafrance","N. Géus","R. Étienne","J. Pierre","H. Herard","C. Bienvenu","K. Fils-Aimé","E. Herard","G. Florestal","J. Jean","M. Saintvil","D. Jean-Baptiste","F. Guerrier"],
  "Estados Unidos":["M. Turner","S. Dest","C. Richards","T. Adams","C. Pulisic","W. McKennie","G. Reyna","R. Pepi","J. Sargent","J. Weah","A. Robinson","W. Aaronson","M. Musah","C. Roldan","Z. Reyna","M. Miazga","D. Yueill","B. Ream"],
  Australia:      ["M. Ryan","H. Souttar","A. Mooy","M. Leckie","A. Taggart","M. Duke","J. Irvine","A. Hrustic","B. Wright","T. Degenek","F. Karacic","B. Tilio","C. Ikonomidis","D. Vukovic","R. Kuol","J. Nisbet","O. Duke","L. Nabbout"],
  Paraguay:       ["A. Silva","G. Gómez","J. Alonso","M. Almirón","Á. Romero","R. Sánchez","B. Samudio","F. Balbuena","J. Villasanti","R. Enciso","A. Cubas","C. González","O. Romero","A. Sanabria","R. Rojas","D. Bobadilla","S. Giménez","M. Arriola"],
  Turquía:        ["U. Çakır","M. Demiral","Ç. Söyüncü","H. Çalhanoğlu","A. Güler","K. Aktürkoğlu","Z. Çelik","B. Yılmaz","K. Karaman","O. Kabak","O. Koybasi","I. Yilmaz","C. Akgun","D. Emre","B. Kahveci","Y. Yazici","T. Meras","R. Baris"],
  Alemania:       ["M. Neuer","A. Rüdiger","T. Kroos","J. Musiala","L. Sané","K. Havertz","İ. Gündoğan","J. Kimmich","T. Müller","N. Schlotterbeck","D. Raum","K. Gnabry","M. ter Stegen","T. Arnold","R. Gosens","K. Adeyemi","F. Wirtz","T. Nmecha"],
  Ecuador:        ["A. Domínguez","P. Hincapié","B. Castillo","M. Caicedo","E. Valencia","J. Sarmiento","G. Plata","Á. Mena","D. Palacios","F. Torres","K. Rodríguez","L. Ibarra","J. Cifuentes","A. Pacho","W. Méndez","M. Cifuentes","O. Mina","J. Arboleda"],
  "Costa de Marfil":["Y. Fofana","S. Aurier","W. Zaha","F. Kessié","S. Haller","N. Pépé","J. Krasso","O. Diakité","M. Bamba","E. Dao","I. Sangaré","I. Koné","S. Doumbia","C. Konaté","A. Traoré","J. Lié","B. Kamara","A. Coulibaly"],
  Curazao:        ["E. Room","C. Martina","L. Bacuna","J. Gaari","R. Janga","J. Vicario","Q. Thureau","M. Boadu","E. Pusga","S. Plet","G. Do Rosário","J. Daal","K. Felida","D. Maria","J. Antonius","N. Briesen","R. Sno","C. Flanegin"],
  "Países Bajos": ["V. van Dijk","M. de Ligt","F. de Jong","C. Gakpo","M. Depay","X. Simons","W. Weghorst","D. Dumfries","N. Timber","J. Timber","S. de Vrij","D. Blind","M. Flekken","B. Veerman","B. Stengs","K. Sierhuis","W. Koopmeiners","L. de Jong"],
  Japón:          ["S. Gonda","M. Yoshida","T. Tomiyasu","D. Kamada","T. Minamino","K. Mitoma","R. Doan","A. Tanaka","H. Sakai","K. Itakura","W. Endo","Y. Soma","J. Ito","S. Machino","H. Ueda","K. Nakamura","S. Osako","K. Furuhashi"],
  Túnez:          ["A. Dahmen","M. Talbi","D. Bronn","W. Khazri","Y. Msakni","H. Mejbri","N. Sliti","E. Skhiri","A. Maaloul","Y. Meriah","M. Ben Romdhane","F. Ben Mustapha","O. Dräger","K. Chaalali","G. Jelassi","S. Ben Slimane","A. Laïfaoui","A. Laidouni"],
  Suecia:         ["R. Olsen","V. Lindelöf","L. Augustinsson","E. Forsberg","A. Isak","D. Kulusevski","V. Gyökeres","M. Svanberg","I. Ekdal","M. Lustig","P. Jansson","A. Danielson","K. Olsson","J. Larsson","E. Krafth","J. Elanga","A. Milosevic","S. Larsson"],
  Bélgica:        ["T. Courtois","J. Vertonghen","K. De Bruyne","R. Lukaku","E. Hazard","Y. Carrasco","A. Witsel","A. Onana","J. Castagne","T. Alderweireld","T. Meunier","A. Doku","L. Trossard","C. De Ketelaere","J. Theate","W. Faes","A. Saelemaekers","H. Vanaken"],
  Irán:           ["A. Beiranvand","E. Hajsafi","M. Pouraliganji","S. Azmoun","M. Taremi","A. Gholizadeh","S. Ghoddos","K. Ansarifard","M. Hosseini","R. Rezaeian","A. Cheshmi","S. Ezatolahi","V. Amiri","A. Noorollahi","A. Jalali","F. Omidfar","M. Karimi","I. Shajari"],
  Egipto:         ["M. El-Shenawy","A. Hegazi","M. Salah","M. Mohamed","A. El-Sulaya","T. Hamed","M. Hamdy","O. Kamal","A. Abdel-Shafi","A. Ashour","A. Fathy","M. Elneny","T. Mohsen","R. El-Gamal","W. Ali","O. Gaber","A. Kahraba","M. Sherif"],
  "Nueva Zelanda":["S. Marinovic","T. Smith","W. Reid","R. Thomas","C. Wood","L. Cacace","M. Garbett","E. Just","D. Ball","B. Old","A. Prior","N. Dun","J. McGlinchey","B. Waine","C. Bedeau","M. Ridenton","J. Forbes","S. Surman"],
  España:         ["U. Simón","D. Carvajal","Pedri","Gavi","D. Olmo","Á. Morata","Rodri","L. Yamal","A. García","M. Le Normand","A. Laporte","J. Navas","M. Merino","F. Torres","F. Ruiz","N. Williams","B. Diaz","A. Baena"],
  Uruguay:        ["S. Rochet","R. Araújo","J.M. Giménez","F. Valverde","D. Núñez","L. Suárez","R. Bentancur","F. Pellistri","M. Olivera","M. Ugarte","G. Arrascaeta","L. Torreira","E. Cavani","J. Varela","M. Vecino","M. Viña","S. Coates","J. Piquerez"],
  "Cabo Verde":   ["Vozinha","D. Tavares","Stopira","G. Rodrigues","R. Mendes","J. Monteiro","J. Tavares","K. Rocha","E. Andrade","P. Oliveira","L. Andrade","C. Neves","D. Lima","S. Lopes","Z. Semedo","I. Alves","B. Alves","L. Varela"],
  "Arabia Saudita":["M. Al-Owais","A. Al-Bulayhi","Y. Al-Shahrani","S. Al-Dawsari","F. Al-Buraikan","A. Al-Hamdan","S. Al-Najei","M. Kanno","H. Al-Tambakti","A. Al-Amri","A. Bahbir","O. Al-Ghannam","N. Al-Aqidi","M. Al-Breik","A. Al-Abid","A. Bahebri","S. Al-Dousari","M. Al-Rubaie"],
  Francia:        ["M. Maignan","R. Varane","K. Mbappé","A. Griezmann","O. Dembélé","A. Tchouaméni","T. Hernández","M. Thuram","J. Konaté","B. Pavard","L. Digne","W. Fofana","E. Camavinga","K. Coman","C. Nkunku","R. Cherki","M. Sarr","Y. Fofana"],
  Senegal:        ["É. Mendy","K. Koulibaly","S. Mané","I. Gueye","I. Sarr","K. Diatta","B. Dieng","P.M. Sarr","C. Gueye","A. Diallo","I. Jakobs","M. Ciss","A. Cissé","G. Badji","N. Mendy","L. Sané","A. Ndiaye","A. Diatta"],
  Noruega:        ["Ø. Nyland","S. Strandberg","S. Berge","M. Ødegaard","E. Haaland","A. Sørloth","M. Elyounoussi","V. Berisha","J. Strand Larsen","O. Ajer","B. Möller Dæhli","M. Holm","H. Norheim","C. Borchgrevink","K. Hauge","L. Bobb","J. Ulvestad","A. Nusa"],
  Irak:           ["J. Hassan","A. Adnan","A. Attwan","A. Abbas","A. Hussein","M. Ali","A. Ibrahim","B. Resan","A. Hamid","H. Ali","B. Majid","S. Nader","M. Hamid","K. Jabbar","F. Taher","M. Hashim","A. Kadhim","H. Fadhil"],
  Argentina:      ["E. Martínez","N. Otamendi","L. Messi","R. De Paul","J. Álvarez","L. Martínez","A. Mac Allister","E. Fernández","G. Montiel","C. Romero","Á. Di María","P. Dybala","G. Simeone","L. Paredes","N. González","E. Palacios","T. Almada","F. Almada"],
  Argelia:        ["R. M'Bolhi","R. Bensebaini","I. Bennacer","R. Mahrez","B. Bounedjah","Y. Brahimi","A. Zorgane","A. Mandi","H. Belhanda","Z. Benguit","R. Ait-Nouri","A. Guedioura","F. Kadri","I. Slimani","A. Delort","Y. Rahou","M. Tahrat","A. Belaïli"],
  Austria:        ["P. Pentz","D. Alaba","M. Sabitzer","M. Arnautovic","K. Laimer","C. Baumgartner","N. Seiwald","M. Gregoritsch","S. Lainer","M. Hinteregger","D. Pervan","A. Schöpf","R. Holzhauser","F. Friedl","P. Wimmer","A. Ranftl","H. Wolf","P. Lienhart"],
  Jordania:       ["Y. Abu Laila","B. Faisal","Y. Al-Naimat","M. Al-Taamari","M. Suleiman","O. Al-Rashdan","A. Hamarsheh","H. Al-Dardour","A. Al-Salem","B. Bani Yaseen","M. Abu Zaid","A. Al-Rawabdeh","N. Al-Dardour","S. Soud","K. Bani Attiah","A. Soud","F. Al-Khalayleh","D. Alrifai"],
  Portugal:       ["R. Patrício","R. Dias","C. Ronaldo","B. Fernandes","B. Silva","J. Félix","R. Leão","Vitinha","N. Mendes","Danilo","J. Cancelo","Pepe","M. Nunes","O. Neves","D. Jota","G. Ramos","F. Conceição","F. Horta"],
  Colombia:       ["D. Ospina","D. Sánchez","J. Rodríguez","L. Díaz","M. Uribe","R. Ríos","J. Cuadrado","F. Borja","Y. Mina","W. Tesillo","C. Cuesta","D. Muñoz","J. Lerma","J. Arias","H. Carrascal","A. Borré","M. Cabal","K. Castilla"],
  Uzbekistán:     ["E. Suyunov","H. Norchaev","J. Masharipov","E. Shomurodov","O. Shukurov","A. Fayzullaev","D. Khamdamov","J. Yakhshiboev","S. Tursunov","A. Djeparov","U. Komilov","B. Abduraimov","F. Tursunaliev","O. Alijonov","J. Sodiqov","A. Urunov","B. Sobirov","A. Hamidov"],
  "RD del Congo": ["J. Kiassumbua","C. Mbemba","A. Masuaku","C. Bakambu","D. Mbokani","J. Bolingi","Y. Bolasie","P. Mpoku","F. Muslimovic","B. Anzite","B. Mujangi Bia","T. Kabananga","H. Luyindama","M. Kayembe","N. Bongonda","B. Lokilo","P. Onuachu","G. Kalulu"],
  Inglaterra:     ["J. Pickford","H. Maguire","K. Trippier","D. Rice","J. Bellingham","H. Kane","B. Saka","P. Foden","M. Rashford","R. James","L. Shaw","J. Stones","K. Walker","B. White","T. Alexander-Arnold","M. Mount","J. Grealish","O. Watkins"],
  Croacia:        ["D. Livaković","D. Lovren","L. Modrić","M. Kovačić","I. Perišić","A. Kramarić","B. Petković","M. Brozović","J. Gvardiol","D. Ćaleta-Car","B. Šutalo","L. Majer","M. Pašalić","N. Vlašić","I. Ristovski","M. Orsić","T. Baturina","M. Jakić"],
  Panamá:         ["L. Mejía","F. Escobar","H. Cummings","R. Blackburn","É. Bárcenas","C. Waterman","J. Welch","A. Godoy","J. Anderson","A. Murillo","E. Torres","R. Córdoba","A. Quintero","G. Torres","M. Murillo","C. Rodriguez","J. Murillo","B. Anderson"],
  Ghana:          ["L. Ati-Zigi","T. Partey","D. Amartey","M. Kudus","J. Ayew","A. Ayew","I. Williams","T. Lamptey","J. Mensah","A. Sulemana","E. Semenyo","D. A. Acquah","B. Kyereh","K. Opoku","F. Acheampong","D. Adjei","E. Ofori","G. Annan"],
};

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

const SPECIALS_FCW = ["FCW00","FCW01","FCW02","FCW03","FCW04","FCW05","FCW06","FCW07","FCW08"];
const SPECIALS_CC  = ["CC01","CC02","CC03","CC04","CC05","CC06","CC07","CC08","CC09","CC10","CC11","CC12","CC13","CC14"];
const ALL_SPECIALS = [...SPECIALS_FCW,...SPECIALS_CC];

const STICKERS_PER_TEAM = 20;
const TOTAL_TEAM_STICKERS = 48 * STICKERS_PER_TEAM;
const TOTAL_SPECIALS = ALL_SPECIALS.length; // 23
const GRAND_TOTAL = TOTAL_TEAM_STICKERS + TOTAL_SPECIALS; // 983

function usePaniniStats(panini) {
  return useMemo(() => {
    let totalTeams = 0;
    const groupStats = {}, teamStats = {};
    Object.entries(PANINI_GROUPS).forEach(([group, teams]) => {
      let gOwned = 0;
      teams.forEach(team => {
        const code = FIFA_CODE[team];
        let tOwned = 0;
        for (let i = 0; i < STICKERS_PER_TEAM; i++) if (panini?.teams?.[code]?.[i]) tOwned++;
        gOwned += tOwned; totalTeams += tOwned;
        teamStats[code] = { owned: tOwned, total: STICKERS_PER_TEAM, team };
      });
      groupStats[group] = { owned: gOwned, total: teams.length * STICKERS_PER_TEAM };
    });
    let specialsOwned = 0;
    ALL_SPECIALS.forEach(code => { if (panini?.specials?.[code]?.owned) specialsOwned++; });
    return { groupStats, teamStats, totalTeams, specialsOwned };
  }, [panini]);
}

function PaniniSection({ panini, onToggle, onToggleSpecial, onSpecialLabel }) {
  const [selGroup, setSelGroup] = useState(null);
  const [selTeam,  setSelTeam]  = useState(null);
  const [confirm,  setConfirm]  = useState(null);
  const { groupStats, teamStats, totalTeams, specialsOwned } = usePaniniStats(panini);

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
                ? buildStickers(Object.keys(FIFA_CODE).find(k=>FIFA_CODE[k]===confirm.code)||"", TEAM_PLAYERS[Object.keys(FIFA_CODE).find(k=>FIFA_CODE[k]===confirm.code)||""]||[])[confirm.idx]?.code
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
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:16}}>
        {[
          {label:"Total obtenidas",val:totalTeams+specialsOwned,total:GRAND_TOTAL,color:"var(--accent)"},
          {label:"Equipos",val:totalTeams,total:TOTAL_TEAM_STICKERS,color:"var(--green)"},
          {label:"Especiales",val:specialsOwned,total:TOTAL_SPECIALS,color:"var(--blue)"},
        ].map(s=>(
          <div key={s.label} style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:10,padding:"12px 14px"}}>
            <div style={{fontSize:9,color:"var(--muted)",letterSpacing:2,textTransform:"uppercase",marginBottom:4}}>{s.label}</div>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:26,color:s.color,lineHeight:1}}>{s.val}<span style={{fontSize:13,color:"var(--muted)"}}>/{s.total}</span></div>
            <div style={{height:3,background:"var(--border)",borderRadius:2,marginTop:6,overflow:"hidden"}}>
              <div style={{height:"100%",background:s.color,width:`${(s.val/s.total)*100}%`,transition:"width .5s"}}/>
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
            <div style={{fontSize:10,color:"var(--muted)",marginBottom:6}}>FCW00–FCW08 · CC01–CC14</div>
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
                    return(
                      <div key={code} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 12px",background:s.owned?"rgba(16,185,129,0.08)":"var(--card2)",borderRadius:8,border:`1px solid ${s.owned?"var(--green)":"var(--border)"}`}}>
                        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:14,color:section.color,width:48,flexShrink:0}}>{code}</div>
                        <input value={s.label||""} onChange={e=>onSpecialLabel(code,e.target.value)} placeholder="Descripción..."
                          style={{flex:1,padding:"3px 0",background:"transparent",border:"none",borderBottom:"1px solid var(--border)",color:"var(--text)",fontSize:12,outline:"none"}}/>
                        <button onClick={()=>handleSpecial(code)}
                          style={{width:32,height:32,borderRadius:6,border:`1px solid ${s.owned?"var(--green)":"var(--border)"}`,background:s.owned?"var(--green)":"var(--card)",color:s.owned?"#000":"var(--muted)",cursor:"pointer",fontSize:14,fontWeight:700,transition:"all .15s"}}>
                          {s.owned?"✓":"○"}
                        </button>
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
        const stickers=buildStickers(selTeam,TEAM_PLAYERS[selTeam]||[]);
        const ts=teamStats[code]||{owned:0};
        return(
          <div className="card">
            <div className="card-title">
              <span>{flag(selTeam)} <span style={{color:"var(--accent)"}}>{code}</span> · {selTeam}</span>
              <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:20,color:"var(--accent)"}}>{ts.owned}/20</span>
            </div>
            <div className="card-body">
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(145px,1fr))",gap:7}}>
                {stickers.map((s,idx)=>{
                  const owned=panini?.teams?.[code]?.[idx];
                  const special=s.type==="stadium"||s.type==="team";
                  const bColor=owned?"var(--green)":special?typeColor(s.type):"var(--border)";
                  return(
                    <div key={idx} onClick={()=>handleSticker(code,idx)}
                      style={{padding:"8px 10px",borderRadius:8,cursor:"pointer",transition:"border-color .15s",
                        background:owned?"rgba(16,185,129,0.1)":"var(--card2)",
                        border:`1px solid ${bColor}`,
                        display:"flex",alignItems:"center",gap:8}}
                      onMouseEnter={e=>!owned&&(e.currentTarget.style.borderColor="var(--accent)")}
                      onMouseLeave={e=>!owned&&(e.currentTarget.style.borderColor=special?typeColor(s.type):"var(--border)")}>
                      <div style={{width:32,height:32,borderRadius:6,flexShrink:0,
                        background:owned?"var(--green)":special?"rgba(245,158,11,.1)":"var(--card)",
                        border:`1px solid ${owned?"var(--green)":special?typeColor(s.type):"var(--border)"}`,
                        display:"flex",alignItems:"center",justifyContent:"center",
                        fontFamily:"'Bebas Neue',sans-serif",fontSize:12,
                        color:owned?"#000":special?typeColor(s.type):"var(--muted)"}}>
                        {owned?"✓":s.num}
                      </div>
                      <div style={{minWidth:0}}>
                        <div style={{fontSize:10,fontWeight:700,color:"var(--accent)",fontFamily:"'Bebas Neue',sans-serif",letterSpacing:.5}}>{s.code}</div>
                        <div style={{fontSize:11,color:owned?"var(--text)":"var(--muted)",lineHeight:1.3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.label}</div>
                        {special&&<div style={{fontSize:9,color:typeColor(s.type),letterSpacing:1,fontWeight:700,textTransform:"uppercase"}}>{s.type==="stadium"?"Estadio":"Foto Equipo"}</div>}
                      </div>
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
