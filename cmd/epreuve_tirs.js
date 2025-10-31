const { ovlcmd } = require('../lib/ovlcmd');
const axios = require('axios');
const joueurs = new Map();

// ======================
// 🧠 PROMPT SYSTEM
// ======================
const promptSystem = `
Tu es un assistant d'analyse des tirs au football.  
Ton rôle est d'extraire deux valeurs précises depuis une description de tir :  

1️⃣ "tir_type"  
2️⃣ "tir_zone"  

---

### 🔹 TYPES DE TIR AUTORISÉS

#### ⚽ Tir direct :
- "tir direct de la pointe du pied droit"
- "tir direct de la pointe du pied gauche"
- "tir direct du cou du pied droit"
- "tir direct du cou du pied gauche"
- "tir direct de l'intérieur du pied droit"
- "tir direct de l'intérieur du pied gauche"

#### 🔹 Tir enroulé :
- "tir enroulé de l'intérieur du pied droit, corps décalé à 60° sur le côté droit, courbe de tir de 1m ou < 1m"
- "tir enroulé de l'intérieur du pied gauche, corps décalé à 60° sur le côté gauche, courbe de tir de 1m ou < 1m"

#### 🔹 Tir trivela :
- "tir trivela de l'extérieur du pied droit, corps décalé à 60° sur le côté gauche, courbe de tir de 1m ou < 1m"
- "tir trivela de l'extérieur du pied gauche, corps décalé à 60° sur le côté droit, courbe de tir de 1m ou < 1m"

⚠️ Si la courbe dépasse 1m ou si le modèle ne correspond pas exactement → tir invalide.

---

### 🔹 ZONES DE TIR AUTORISÉES
[lucarne droite, lucarne gauche, lucarne centre, mi-hauteur droite, mi-hauteur gauche, milieu, ras du sol droite, ras du sol gauche, ras du sol milieu]

---

### 📤 Format de réponse (JSON strict uniquement)
{
  "tir_type": "<valeur ou 'invalide'>",
  "tir_zone": "<valeur ou 'invalide'>"
}

Ne donne aucune explication.  
Ne renvoie rien d’autre que le JSON.
`;

// ======================
// ⚙️ ANALYSE DU TIR
// ======================
async function analyserTir(texte) {
  try {
    const fullText = `${promptSystem}\n"${texte}"`;
    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyCtDv8matHBhGOQF_bN4zPO-J9-60vnwFE',
      { contents: [{ parts: [{ text: fullText }] }] },
      { headers: { 'Content-Type': 'application/json' } }
    );

    const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const clean = text.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch (err) {
    console.error("Erreur Gemini :", err);
    return null;
  }
}

// ======================
// ✅ VALIDATION DU TIR
// ======================
function validerTir(analyse, texteOriginal) {
  const tir_types_valides = [
    "tir direct de la pointe du pied droit",
    "tir direct de la pointe du pied gauche",
    "tir direct du cou du pied droit",
    "tir direct du cou du pied gauche",
    "tir direct de l'intérieur du pied droit",
    "tir direct de l'intérieur du pied gauche",
    "tir enroulé de l'intérieur du pied droit, corps décalé à 60° sur le côté droit, courbe de tir de 1m ou < 1m",
    "tir enroulé de l'intérieur du pied gauche, corps décalé à 60° sur le côté gauche, courbe de tir de 1m ou < 1m",
    "tir trivela de l'extérieur du pied droit, corps décalé à 60° sur le côté gauche, courbe de tir de 1m ou < 1m",
    "tir trivela de l'extérieur du pied gauche, corps décalé à 60° sur le côté droit, courbe de tir de 1m ou < 1m"
  ];

  const tir_zones_valides = [
    "lucarne droite", "lucarne gauche", "lucarne centre",
    "mi-hauteur droite", "mi-hauteur gauche", "milieu",
    "ras du sol droite", "ras du sol gauche", "ras du sol milieu"
  ];

  if (!analyse) return false;

  const type_ok = tir_types_valides.includes(analyse.tir_type);
  const zone_ok = tir_zones_valides.includes(analyse.tir_zone);
  const matchCourbe = texteOriginal.match(/(\d+(\.\d+)?)\s*m/i);
  const courbeValide = !matchCourbe || parseFloat(matchCourbe[1]) <= 1.0;

  return type_ok && zone_ok && courbeValide;
}

// ======================
// 🧮 GOAL PROBABILITÉ
// ======================
function estGoalProbable() {
  return Math.random() < 0.9; // 90% de chance
}

// ======================
// ⚽ COMMANDE : EXERCICE 1
// ======================
ovlcmd({
  nom_cmd: 'exercice1',
  classe: 'BLUELOCK⚽',
  react: '⚽',
  desc: "Lance l'épreuve de tirs"
}, async (ms_org, ovl, { repondre, auteur_Message }) => {
  console.log("✅ Commande +exercice1 détectée !");
  try {
    await ovl.sendMessage(ms_org, {
      video: { url: 'https://files.catbox.moe/z64kuq.mp4' },
      gifPlayback: true,
      caption: ''
    });

    const texteDebut = `*🔷ÉPREUVE DE TIRS⚽🥅*
▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔░▒▒▒▒░░▒░

                   🔷⚽RÈGLES:
Dans cet exercice l'objectif est de marquer 18 buts en 18 tirs max dans le temps imparti ❗20 mins⌛ face à un gardien Robot qui  mémorise vos tirs pour bloquer le même tir de suite. ⚠Vous devez marquer au moins 6 buts sinon vous êtes éliminé ❌. 

⚠SI VOUS RATEZ UN TIR, FIN DE L'EXERCICE ❌.

▔▔▔▔▔▔▔ 🔷RANKING🏆 ▔▔▔▔▔▔▔  
                       
🥉Novice: 5 buts⚽ (25 pts) 
🥈Pro: 10 buts⚽ (50 pts) 
🥇Classe mondiale: 15 buts⚽🏆(100 pts) 

Souhaitez-vous lancer l'exercice ? :
✅ Oui
❌ Non

                         ⚽BLUE🔷LOCK`;

    await ovl.sendMessage(ms_org, {
      image: { url: 'https://files.catbox.moe/09rll9.jpg' },
      caption: texteDebut
    });

    const rep = await ovl.recup_msg({ auteur: auteur_Message, ms_org, temps: 60000 });
    const response = rep?.message?.extendedTextMessage?.text || rep?.message?.conversation;
    if (!response) return repondre("⏳Pas de réponse, épreuve annulée.");
    if (response.toLowerCase() === "non") return repondre("❌ Lancement de l'exercice annulé...");

    if (response.toLowerCase() === "oui") {
      const id = auteur_Message;
      const timer = setTimeout(() => {
        if (joueurs.has(id)) {
          joueurs.get(id).en_cours = false;
          envoyerResultats(ms_org, ovl, joueurs.get(id));
        }
      }, 20 * 60 * 1000);

      joueurs.set(id, {
        id,
        tir_info: [],
        but: 0,
        tirs_total: 0,
        en_cours: true,
        timer
      });

      await ovl.sendMessage(ms_org, {
        video: { url: "https://files.catbox.moe/zqm7et.mp4" },
        gifPlayback: true,
        caption: `*⚽BLUE LOCK🔷:* Début de l'exercice ⌛ Durée : 20:00 mins`
      });
    }
  } catch (error) {
    console.error(error);
    repondre("❌ Une erreur est survenue.");
  }
});

// ======================
// 🎯 ÉPREUVE DU TIR
// ======================
ovlcmd({
  nom_cmd: 'epreuve_du_tir',
  isfunc: true
}, async (ms_org, ovl, { repondre, auteur_Message, texte }) => {
  if (!texte.toLowerCase().endsWith("*⚽blue🔷lock🥅*")) return;
  const id = auteur_Message;
  const joueur = joueurs.get(id);
  if (!joueur || !joueur.en_cours) return;

  const analyse = await analyserTir(texte);
  if (!analyse || !analyse.tir_type || !analyse.tir_zone) return;

  if (!validerTir(analyse, texte)) {
    clearTimeout(joueur.timer);
    joueur.en_cours = false;
    await ovl.sendMessage(ms_org, {
      video: { url: "https://files.catbox.moe/x5skj8.mp4" },
      gifPlayback: true,
      caption: "❌MISSED! : Tir non conforme (conditions non respectées)."
    });
    return envoyerResultats(ms_org, ovl, joueur);
  }

  joueur.tirs_total++;
  const tir_courant = { tir_type: analyse.tir_type, tir_zone: analyse.tir_zone };
  const dernier_tir = joueur.tir_info[joueur.tir_info.length - 1];
  const tir_repeté_consecutif = dernier_tir &&
    dernier_tir.tir_type === tir_courant.tir_type &&
    dernier_tir.tir_zone === tir_courant.tir_zone;

  if (tir_repeté_consecutif && joueur.tir_info.length < 3) {
    clearTimeout(joueur.timer);
    joueur.en_cours = false;
    await ovl.sendMessage(ms_org, {
      video: { url: "https://files.catbox.moe/9k5b3v.mp4" },
      gifPlayback: true,
      caption: "❌MISSED! : Tir répété trop tôt, échec de l'exercice."
    });
    return envoyerResultats(ms_org, ovl, joueur);
  }

  const goal = estGoalProbable();

  if (goal) {
    joueur.but++;
    joueur.tir_info.push(tir_courant);
    if (joueur.tir_info.length > 3) joueur.tir_info.shift();

    const restants = 15 - joueur.but;

    await ovl.sendMessage(ms_org, {
      video: { url: "https://files.catbox.moe/pad98d.mp4" },
      gifPlayback: true,
      caption: `✅⚽GOAL : ${joueur.but} but${joueur.but > 1 ? 's' : ''} marqué 🎯\n⚠️ Il vous reste ${restants} tirs ⌛`
    });

    if (joueur.but >= 15) {
      clearTimeout(joueur.timer);
      joueur.en_cours = false;
      return envoyerResultats(ms_org, ovl, joueur);
    }
  } else {
    clearTimeout(joueur.timer);
    joueur.en_cours = false;
    await ovl.sendMessage(ms_org, {
      video: { url: "https://files.catbox.moe/x5skj8.mp4" },
      gifPlayback: true,
      caption: "❌MISSED! : Le gardien arrête le tir !"
    });
    return envoyerResultats(ms_org, ovl, joueur);
  }
});

// ======================
// 🧾 FONCTION RESULTATS
// ======================
async function envoyerResultats(ms_org, ovl, joueur) {
  const tag = `@${joueur.id.split('@')[0]}`;
  let rank = "❌";
  if (joueur.but >= 15) rank = "SS🥇";
  else if (joueur.but >= 10) rank = "S🥈";
  else if (joueur.but >= 5) rank = "A🥉";

  const result = `▔▔▔▔▔▔▔▔▔▔     ▔▔▔▔▔
                  *🔷BLUE LOCK⚽*
  ▔▔▔▔▔▔▔▔▔▔   ▔▔▔▔▔▔▔▔▔▔
    🔷RESULTATS DE L'ÉVALUATION📊

*🥅Exercice:* Épreuve de tirs
*👤Joueur:* ${tag}
*⚽Buts:* ${joueur.but}
*📊Rank:* ${rank}
`;

  await ovl.sendMessage(ms_org, {
    image: { url: "https://files.catbox.moe/1xnoc6.jpg" },
    caption: result,
    mentions: [joueur.id]
  });

  joueurs.delete(joueur.id);
}
