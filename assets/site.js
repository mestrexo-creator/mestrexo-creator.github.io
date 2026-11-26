// Funções do site. Você NÃO precisa mexer aqui:
// nomes e links ficam em config.js e as novidades em novidades/posts.txt.
(function () {
  var SITE = window.SITE || { nomeEstudio: "", jogos: {} };

  // ---- Nome do estúdio -------------------------------------------------
  document.querySelectorAll("[data-estudio]").forEach(function (el) {
    if (SITE.nomeEstudio) el.textContent = SITE.nomeEstudio;
  });
  document.querySelectorAll("[data-ano]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  // ---- Botões das lojas ------------------------------------------------
  // <a data-loja="tamboken:playStore" data-embreve="Em breve">...</a>
  document.querySelectorAll("[data-loja]").forEach(function (el) {
    var partes = el.getAttribute("data-loja").split(":");
    var jogo = (SITE.jogos || {})[partes[0]] || {};
    var link = (jogo[partes[1]] || "").trim();
    if (link) {
      el.href = link;
      el.target = "_blank";
      el.rel = "noopener";
      return;
    }
    if (el.hasAttribute("data-esconder-vazio")) { el.hidden = true; return; }
    el.classList.add("em-breve");
    el.removeAttribute("href");
    el.setAttribute("aria-disabled", "true");
    var aviso = el.querySelector("small");
    if (aviso) aviso.textContent = el.getAttribute("data-embreve") || "Em breve";
  });

  // ---- Lupa das imagens ------------------------------------------------
  document.querySelectorAll(".galeria button").forEach(function (b) {
    b.addEventListener("click", function () {
      var img = b.querySelector("img");
      var caixa = document.createElement("div");
      caixa.className = "lupa";
      caixa.setAttribute("role", "dialog");
      caixa.setAttribute("aria-modal", "true");
      caixa.innerHTML = '<button type="button" aria-label="Fechar">×</button>';
      var grande = document.createElement("img");
      grande.src = img.src;
      grande.alt = img.alt;
      caixa.appendChild(grande);
      function fechar() { caixa.remove(); document.removeEventListener("keydown", tecla); b.focus(); }
      function tecla(e) { if (e.key === "Escape") fechar(); }
      caixa.addEventListener("click", fechar);
      document.addEventListener("keydown", tecla);
      document.body.appendChild(caixa);
      caixa.querySelector("button").focus();
    });
  });

  // ---- Novidades -------------------------------------------------------
  function esc(t) {
    return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function enfeitar(t) {
    t = esc(t);
    t = t.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    t = t.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+|[^)\s:]+)\)/g, '<a href="$2">$1</a>');
    return t;
  }

  function lerPosts(texto) {
    var posts = [], atual = null;
    texto.replace(/\r/g, "").split("\n").forEach(function (linha) {
      if (/^\s*#/.test(linha)) return; // comentário
      var cab = linha.match(/^===\s*([^|]+?)\s*\|\s*(.+)$/);
      if (cab) {
        atual = { data: cab[1], titulo: cab[2].trim(), jogo: "", linhas: [] };
        posts.push(atual);
        return;
      }
      if (!atual) return;
      var tag = linha.match(/^\s*jogo:\s*(\S+)/i);
      if (tag && atual.linhas.join("").trim() === "") { atual.jogo = tag[1].toLowerCase(); return; }
      atual.linhas.push(linha);
    });
    return posts;
  }

  function montarCorpo(linhas, base) {
    var html = "", blocos = linhas.join("\n").split(/\n\s*\n/);
    blocos.forEach(function (bloco) {
      var ls = bloco.split("\n").filter(function (l) { return l.trim() !== ""; });
      if (!ls.length) return;
      var itens = [], par = [];
      function soltarPar() { if (par.length) { html += "<p>" + par.map(enfeitar).join("<br>") + "</p>"; par = []; } }
      function soltarItens() { if (itens.length) { html += "<ul>" + itens.map(function (i) { return "<li>" + enfeitar(i) + "</li>"; }).join("") + "</ul>"; itens = []; } }
      ls.forEach(function (l) {
        var foto = l.match(/^\s*\[(?:foto|imagem|image|photo):\s*([^\]]+)\]\s*$/i);
        if (foto) {
          soltarPar(); soltarItens();
          var src = new URL(foto[1].trim(), base).href;
          html += '<img loading="lazy" src="' + esc(src) + '" alt="">';
        } else if (/^\s*[-*]\s+/.test(l)) {
          soltarPar(); itens.push(l.replace(/^\s*[-*]\s+/, ""));
        } else {
          soltarItens(); par.push(l.trim());
        }
      });
      soltarPar(); soltarItens();
    });
    return html;
  }

  document.querySelectorAll("[data-posts]").forEach(function (caixa) {
    var arquivo = caixa.getAttribute("data-posts");
    var filtro = (caixa.getAttribute("data-jogo") || "").toLowerCase();
    var limite = parseInt(caixa.getAttribute("data-limite") || "0", 10);
    var nomes = { tamboken: "TAMBOKEN" };
    var base = new URL(arquivo, location.href).href;
    fetch(arquivo, { cache: "no-cache" })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
      .then(function (texto) {
        var posts = lerPosts(texto).filter(function (p) { return !filtro || !p.jogo || p.jogo === filtro; });
        if (limite) posts = posts.slice(0, limite);
        if (!posts.length) { caixa.innerHTML = '<p class="aviso">' + esc(caixa.getAttribute("data-vazio") || "Ainda não há novidades.") + "</p>"; return; }
        caixa.innerHTML = posts.map(function (p) {
          var etiqueta = p.jogo ? '<span class="etiqueta">' + esc(nomes[p.jogo] || p.jogo) + "</span>" : "";
          return '<article class="post"><h3>' + enfeitar(p.titulo) + '</h3><p class="data">' + esc(p.data) + etiqueta + "</p>" + montarCorpo(p.linhas, base) + "</article>";
        }).join("");
      })
      .catch(function () {
        caixa.innerHTML = '<p class="aviso">' + esc(caixa.getAttribute("data-erro") || "Não foi possível carregar as novidades agora.") + "</p>";
      });
  });
})();
