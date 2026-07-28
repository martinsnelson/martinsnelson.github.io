document.addEventListener("DOMContentLoaded", () => {
  // Verifica se o Firebase foi inicializado
  if (typeof db === 'undefined') {
    console.error("Instância do Firestore (db) não encontrada. Verifique se o about.js está carregado.");
    return;
  }

  const tipoPagina = window.BLOG_TIPO;

  if (tipoPagina === "postagens" || tipoPagina === "noticias") {
    inicializarListagem(tipoPagina);
  } else if (tipoPagina === "detalhe") {
    inicializarLeitura();
  }
});

/**
 * LÓGICA DE LISTAGEM DE POSTAGENS OU NOTÍCIAS
 */
function inicializarListagem(colecao) {
  const gridContainer = document.getElementById("grid-postagens");
  const btnCarregarMais = document.getElementById("btn-carregar-mais");
  
  let ultimoDocumento = null;
  const limiteItens = 6;
  let primeiroCarregamento = true;

  // Função para carregar os posts/notícias do Firestore
  function carregarItens() {
    let query = db.collection(colecao).orderBy("timestamp", "desc").limit(limiteItens);

    if (ultimoDocumento) {
      query = query.startAfter(ultimoDocumento);
    }

    query.get().then((querySnapshot) => {
      // Remove os skeletons no primeiro carregamento
      if (primeiroCarregamento) {
        gridContainer.innerHTML = "";
        primeiroCarregamento = false;
      }

      if (querySnapshot.empty) {
        if (ultimoDocumento === null) {
          gridContainer.innerHTML = `<div class="no-comments">Nenhum artigo publicado nesta categoria ainda.</div>`;
        }
        btnCarregarMais.style.display = "none";
        return;
      }

      querySnapshot.forEach((doc) => {
        const item = doc.data();
        const docId = doc.id;
        const cardHtml = criarCardHTML(docId, item, colecao);
        gridContainer.appendChild(cardHtml);
      });

      // Salva o cursor para a próxima página
      ultimoDocumento = querySnapshot.docs[querySnapshot.docs.length - 1];

      // Oculta ou exibe o botão carregar mais se houver menos registros que o limite
      if (querySnapshot.docs.length < limiteItens) {
        btnCarregarMais.style.display = "none";
      } else {
        btnCarregarMais.style.display = "inline-block";
      }
    }).catch((error) => {
      console.error("Erro ao carregar registros do Firestore: ", error);
      if (primeiroCarregamento) {
        gridContainer.innerHTML = `<div class="no-comments">Ocorreu um erro ao carregar o conteúdo. Tente novamente mais tarde.</div>`;
      }
    });
  }

  // Executa carga inicial
  carregarItens();

  // Evento do botão carregar mais
  btnCarregarMais.addEventListener("click", () => {
    carregarItens();
  });
}

/**
 * Cria o elemento HTML de cada card do blog
 */
function criarCardHTML(id, item, colecao) {
  const cardLink = document.createElement("a");
  cardLink.className = "post-card";
  cardLink.href = `detalhe.html?tipo=${colecao}&slug=${item.slug || id}`;

  const dataPublicacao = item.timestamp ? formatarData(item.timestamp.toDate()) : "Sem data";
  const tagsArray = item.keywords ? item.keywords.split(",").map(t => t.trim()) : ["Tech"];
  const imagemSrc = item.imagemCapa || "img/blog-default.jpg";

  // Montagem do card semântico
  cardLink.innerHTML = `
    <div class="post-card-capa">
      <img src="${imagemSrc}" alt="Imagem de capa do artigo: ${item.titulo}" loading="lazy">
    </div>
    <div class="post-card-body">
      <div class="post-card-meta">
        <span class="meta-tag">${tagsArray[0]}</span>
        <time datetime="${item.timestamp ? item.timestamp.toDate().toISOString() : ''}">${dataPublicacao}</time>
      </div>
      <h3 class="post-card-title">${item.titulo}</h3>
      <p class="post-card-desc">${item.metaDescription || ''}</p>
      <div class="post-card-footer">
        Ler Artigo Completo
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M4,11V13H16L10.5,18.5L11.92,19.92L19.84,12L11.92,4.08L10.5,5.5L16,11H4Z"/></svg>
      </div>
    </div>
  `;

  return cardLink;
}

/**
 * LÓGICA DE EXIBIÇÃO DE CONTEÚDO DETALHADO E COMENTÁRIOS
 */
function inicializarLeitura() {
  const urlParams = new URLSearchParams(window.location.search);
  const tipo = urlParams.get("tipo");
  const slugOuId = urlParams.get("slug") || urlParams.get("id");

  const titleEl = document.getElementById("post-title");
  const categoryEl = document.getElementById("post-category");
  const dateEl = document.getElementById("post-date");
  const bodyEl = document.getElementById("post-body");
  const capaImg = document.getElementById("post-capa-img");
  const capaWrapper = document.getElementById("post-capa-wrapper");

  if (!tipo || !slugOuId || (tipo !== "postagens" && tipo !== "noticias")) {
    titleEl.textContent = "Parâmetros Inválidos";
    bodyEl.innerHTML = `<p>Artigo ou Categoria não especificados corretamente. Volte para a página principal.</p>`;
    return;
  }

  // Ajusta o link de "Voltar" dependendo da origem
  const backLink = document.getElementById("back-link");
  if (backLink) {
    backLink.href = tipo === "postagens" ? "postagens.html" : "noticias.html";
    backLink.textContent = tipo === "postagens" ? "Voltar para Postagens" : "Voltar para Notícias";
  }

  // Função auxiliar para renderizar o artigo a partir de dados reais e ID real do Firestore
  const renderizarArtigo = (item, docId) => {
    // 2. Aplica as Técnicas de SEO Injetadas Dinamicamente
    aplicarSeoDinamico(item, docId, tipo);

    // 3. Preenche a Tela
    titleEl.textContent = item.titulo;
    categoryEl.textContent = tipo === "postagens" ? "Desenvolvimento" : "Notícias Tech";
    dateEl.textContent = item.timestamp ? formatarData(item.timestamp.toDate()) : "Sem data";

    if (item.imagemCapa) {
      capaImg.src = item.imagemCapa;
      capaImg.alt = `Imagem de capa do artigo: ${item.titulo}`;
      capaWrapper.style.display = "block";
    } else {
      capaWrapper.style.display = "none";
    }

    // Renderiza o corpo em Markdown usando a Marked.js e DOMPurify para evitar XSS
    if (typeof marked !== 'undefined') {
      const rawHtml = marked.parse(item.conteudo || "");
      bodyEl.innerHTML = typeof DOMPurify !== 'undefined' ? DOMPurify.sanitize(rawHtml) : rawHtml;
    } else {
      bodyEl.innerHTML = `<p>${escaparHTML(item.conteudo || "").replace(/\n/g, "<br>")}</p>`;
    }

    // 4. Inicializa o Sistema de Comentários para este Post usando seu ID real do Firestore
    inicializarModuloComentarios(docId);
  };

  // 1. Busca do Artigo: Primeiro tenta buscar pelo campo slug
  db.collection(tipo).where("slug", "==", slugOuId).limit(1).get().then((querySnapshot) => {
    if (!querySnapshot.empty) {
      const docSnapshot = querySnapshot.docs[0];
      renderizarArtigo(docSnapshot.data(), docSnapshot.id);
    } else {
      // Se não encontrar pelo slug, tenta buscar diretamente pelo ID (retrocompatibilidade)
      db.collection(tipo).doc(slugOuId).get().then((docSnapshot) => {
        if (docSnapshot.exists) {
          renderizarArtigo(docSnapshot.data(), docSnapshot.id);
        } else {
          titleEl.textContent = "Artigo Não Encontrado";
          bodyEl.innerHTML = `<p>O conteúdo que você procura não existe ou foi removido.</p>`;
        }
      }).catch((err) => {
        console.error("Erro ao buscar artigo por ID fallback:", err);
        titleEl.textContent = "Artigo Não Encontrado";
        bodyEl.innerHTML = `<p>Ocorreu um erro ao recuperar as informações do banco.</p>`;
      });
    }
  }).catch((error) => {
    console.error("Erro ao carregar o artigo por slug: ", error);
    // Em caso de erro na query de slug, tenta ID diretamente
    db.collection(tipo).doc(slugOuId).get().then((docSnapshot) => {
      if (docSnapshot.exists) {
        renderizarArtigo(docSnapshot.data(), docSnapshot.id);
      } else {
        titleEl.textContent = "Artigo Não Encontrado";
        bodyEl.innerHTML = `<p>O conteúdo que você procura não existe ou foi removido.</p>`;
      }
    }).catch((e) => {
      titleEl.textContent = "Erro de Conexão";
      bodyEl.innerHTML = `<p>Houve uma falha ao contatar a base de dados do Firebase.</p>`;
    });
  });
}

/**
 * Injeta em tempo real no head do documento todas as metatags de SEO necessárias
 */
function aplicarSeoDinamico(item, id, tipo) {
  const urlPost = `https://martinsnelson.github.io/detalhe.html?tipo=${tipo}&id=${id}`;
  const tituloPost = `${item.titulo} - Nelson Dev`;
  const descPost = item.metaDescription || "Leia o artigo completo no site do Nelson Dev.";
  const imgPost = item.imagemCapa || "https://martinsnelson.github.io/img/blog-default.jpg";
  const tagsStr = item.keywords || "desenvolvimento, programacao, nelson dev";

  // SEO Básico
  document.title = tituloPost;
  
  const metaDesc = document.getElementById("seo-meta-desc");
  if (metaDesc) metaDesc.setAttribute("content", descPost);

  const metaKeys = document.getElementById("seo-meta-keys");
  if (metaKeys) metaKeys.setAttribute("content", tagsStr);

  const linkCanonical = document.getElementById("seo-canonical");
  if (linkCanonical) linkCanonical.setAttribute("href", urlPost);

  // Open Graph / Facebook
  const ogUrl = document.getElementById("og-url");
  if (ogUrl) ogUrl.setAttribute("content", urlPost);

  const ogTitle = document.getElementById("og-title");
  if (ogTitle) ogTitle.setAttribute("content", tituloPost);

  const ogDesc = document.getElementById("og-desc");
  if (ogDesc) ogDesc.setAttribute("content", descPost);

  const ogImg = document.getElementById("og-img");
  if (ogImg) ogImg.setAttribute("content", imgPost);

  // Twitter
  const twUrl = document.getElementById("twitter-url");
  if (twUrl) twUrl.setAttribute("content", urlPost);

  const twTitle = document.getElementById("twitter-title");
  if (twTitle) twTitle.setAttribute("content", tituloPost);

  const twDesc = document.getElementById("twitter-desc");
  if (twDesc) twDesc.setAttribute("content", descPost);

  const twImg = document.getElementById("twitter-img");
  if (twImg) twImg.setAttribute("content", imgPost);

  // Injeta Dados Estruturados JSON-LD do Artigo para SEO
  const jsonLdScript = document.createElement("script");
  jsonLdScript.type = "application/ld+json";
  
  const ldPayload = {
    "@context": "https://schema.org",
    "@type": tipo === "postagens" ? "BlogPosting" : "NewsArticle",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": urlPost
    },
    "headline": item.titulo,
    "description": descPost,
    "image": imgPost,
    "datePublished": item.timestamp ? item.timestamp.toDate().toISOString() : new Date().toISOString(),
    "author": {
      "@type": "Person",
      "name": "Nelson Dev",
      "url": "https://martinsnelson.github.io/"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Nelson Dev",
      "logo": {
        "@type": "ImageObject",
        "url": "https://martinsnelson.github.io/img/blog-default.jpg"
      }
    }
  };

  jsonLdScript.text = JSON.stringify(ldPayload);
  document.head.appendChild(jsonLdScript);
}

/**
 * SISTEMA DE COMENTÁRIOS DINÂMICO
 */
function inicializarModuloComentarios(postId) {
  const formComment = document.getElementById("form-comment");
  const inputName = document.getElementById("comment-name");
  const inputText = document.getElementById("comment-text");
  const commentsListBox = document.getElementById("comments-list-box");
  const commentsCountEl = document.getElementById("comments-count");
  const noCommentsMsg = document.getElementById("no-comments-msg");
  const btnSubmit = document.getElementById("btn-submit-comment");

  // Função para listar os comentários do Firestore
  function carregarComentarios() {
    db.collection("comentarios")
      .where("postId", "==", postId)
      .orderBy("timestamp", "desc")
      .limit(20) // Limita aos 20 mais recentes para performance
      .get()
      .then((querySnapshot) => {
        commentsListBox.innerHTML = "";

        if (querySnapshot.empty) {
          commentsListBox.appendChild(noCommentsMsg);
          commentsCountEl.textContent = "0";
          return;
        }

        commentsCountEl.textContent = querySnapshot.docs.length.toString();

        querySnapshot.forEach((doc) => {
          const com = doc.data();
          const itemHtml = document.createElement("div");
          itemHtml.className = "comment-item";
          
          const comData = com.timestamp ? formatarDataSimplificada(com.timestamp.toDate()) : "Agora mesmo";

          // Sanitiza strings exibidas na tela para evitar XSS
          const autorSanitizado = escaparHTML(com.nome);
          const textoSanitizado = escaparHTML(com.texto).replace(/\n/g, "<br>");

          itemHtml.innerHTML = `
            <div class="comment-header">
              <span class="comment-author">${autorSanitizado}</span>
              <span class="comment-date">${comData}</span>
            </div>
            <p class="comment-content">${textoSanitizado}</p>
          `;
          commentsListBox.appendChild(itemHtml);
        });
      })
      .catch((error) => {
        console.error("Erro ao carregar comentários do Firestore: ", error);
        commentsListBox.innerHTML = `<div class="no-comments">Erro ao carregar comentários.</div>`;
      });
  }

  // Carrega inicialmente
  carregarComentarios();

  // Envio do formulário
  formComment.addEventListener("submit", (e) => {
    e.preventDefault();

    const nome = inputName.value.trim();
    const texto = inputText.value.trim();

    if (!nome || !texto) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    btnSubmit.disabled = true;
    btnSubmit.textContent = "Enviando...";

    // Salva o comentário no Firestore
    db.collection("comentarios").add({
      postId: postId,
      nome: nome,
      texto: texto,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
      inputText.value = "";
      btnSubmit.disabled = false;
      btnSubmit.textContent = "Enviar Comentário";
      // Recarrega os comentários para exibir o novo
      carregarComentarios();
    })
    .catch((error) => {
      console.error("Erro ao enviar comentário para o Firebase: ", error);
      alert("Houve uma falha ao enviar o comentário. Verifique sua conexão e tente novamente.");
      btnSubmit.disabled = false;
      btnSubmit.textContent = "Enviar Comentário";
    });
  });
}

/**
 * UTILITÁRIOS GERAIS
 */

// Formata datas por extenso
function formatarData(data) {
  const opcoes = { year: 'numeric', month: 'long', day: 'numeric' };
  return data.toLocaleDateString('pt-BR', opcoes);
}

// Formata datas de modo simplificado (ex: dd/mm/aaaa às hh:mm)
function formatarDataSimplificada(data) {
  const pad = (n) => n.toString().padStart(2, '0');
  const dia = pad(data.getDate());
  const mes = pad(data.getMonth() + 1);
  const ano = data.getFullYear();
  const hora = pad(data.getHours());
  const min = pad(data.getMinutes());
  return `${dia}/${mes}/${ano} às ${hora}:${min}`;
}

// Sanitização de HTML simples para proteção XSS
function escaparHTML(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
