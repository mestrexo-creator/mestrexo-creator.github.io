// =====================================================================
//  CONFIGURAÇÃO DO SITE  —  o único arquivo que você precisa mexer
//  para trocar o nome do estúdio e os links das lojas.
//
//  Regras simples:
//   - Escreva SEMPRE entre as aspas "assim".
//   - Não apague as vírgulas do fim das linhas.
//   - Link vazio ("") = o botão aparece como "Em breve".
// =====================================================================

window.SITE = {
  // Nome que aparece no topo de todas as páginas (pode ser o seu nome
  // ou o nome do seu estúdio).
  nomeEstudio: "TAMBOKEN",

  // Um jogo por bloco. Para um jogo novo, copie o bloco do tamboken.
  jogos: {
    tamboken: {
      // Link da página do jogo na Play Store (pegue no Play Console).
      playStore: "",

      // Link do teste fechado (o link "Participar no Android" que o
      // Play Console mostra). Se estiver vazio, o botão some.
      testeFechado: "",

      // Link da página da Steam (lista de desejos), quando existir.
      steam: "",
    },
  },
};
