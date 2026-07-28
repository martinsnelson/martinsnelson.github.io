// Lógica do Painel Administrativo Local
document.addEventListener("DOMContentLoaded", () => {
  // Verifica se o Firebase foi inicializado
  if (typeof firebase === 'undefined' || typeof db === 'undefined') {
    alert("Erro: O Firebase não pôde ser carregado. Certifique-se de que o about.js está configurado.");
    return;
  }

  // Elementos do DOM - Login
  const loginSection = document.getElementById("login-section");
  const panelSection = document.getElementById("panel-section");
  const inputEmail = document.getElementById("admin-email");
  const inputPassword = document.getElementById("admin-password");
  const btnLogin = document.getElementById("btn-login");
  const btnLogout = document.getElementById("btn-logout");
  const userInfo = document.getElementById("user-info");

  // Elementos do DOM - Formulário de Publicação
  const formPublish = document.getElementById("form-publish");
  const selectDestiny = document.getElementById("pub-destiny");
  const inputTitle = document.getElementById("pub-title");
  const inputSlug = document.getElementById("pub-slug");
  const inputMetaDesc = document.getElementById("pub-meta-desc");
  const inputKeywords = document.getElementById("pub-keywords");
  const inputImgUrl = document.getElementById("pub-img-url");
  const inputImgFile = document.getElementById("pub-img-file");
  const capaPreviewBox = document.getElementById("capa-preview-box");
  const textareaContent = document.getElementById("pub-content");
  const btnPublish = document.getElementById("btn-publish");

  // Elementos do DOM - Preview e Listas
  const markdownPreview = document.getElementById("markdown-preview");
  const btnRefresh = document.getElementById("btn-refresh");
  const btnSeed = document.getElementById("btn-seed");
  const recentPostsList = document.getElementById("recent-posts-list");
  
  // Elementos do DOM - Contadores de SEO
  const titleCounter = document.getElementById("title-counter");
  const metaCounter = document.getElementById("meta-counter");

  // 1. MONITORAMENTO DO ESTADO DE AUTENTICAÇÃO DO FIREBASE
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      // Usuário autenticado
      loginSection.style.display = "none";
      panelSection.style.display = "block";
      userInfo.innerHTML = `Logado: <strong>${user.email}</strong><br><span style="font-size: 0.78rem; color: var(--accent-purple); display: block; margin-top: 2px;">UID: <strong style="user-select: all; cursor: pointer;" title="Clique para selecionar e copiar">${user.uid}</strong></span>`;
      carregarPublicacoesExistentes();
    } else {
      // Usuário deslogado
      loginSection.style.display = "block";
      panelSection.style.display = "none";
      userInfo.textContent = "Desconectado";
    }
  });

  // Evento de Login
  btnLogin.addEventListener("click", () => {
    const email = inputEmail.value.trim();
    const password = inputPassword.value.trim();

    if (!email || !password) {
      alert("Preencha o e-mail e a senha.");
      return;
    }

    btnLogin.disabled = true;
    btnLogin.textContent = "Conectando...";

    firebase.auth().signInWithEmailAndPassword(email, password)
      .then(() => {
        btnLogin.disabled = false;
        btnLogin.textContent = "Entrar";
        // Limpa campos
        inputEmail.value = "";
        inputPassword.value = "";
      })
      .catch((error) => {
        btnLogin.disabled = false;
        btnLogin.textContent = "Entrar";
        alert("Falha na autenticação: " + error.message);
      });
  });

  // Evento de Logout
  btnLogout.addEventListener("click", () => {
    firebase.auth().signOut().then(() => {
      recentPostsList.innerHTML = `<div class="no-comments">Nenhuma publicação carregada.</div>`;
    });
  });

  // 2. HIGIENIZAÇÃO DE SLUG E CONTADORES DE SEO EM TEMPO REAL
  inputTitle.addEventListener("input", () => {
    const titleVal = inputTitle.value;
    
    // Atualiza contador de caracteres do título (SEO ideal: max 60)
    titleCounter.textContent = `${titleVal.length}/60`;
    if (titleVal.length > 60) {
      titleCounter.classList.add("warning");
    } else {
      titleCounter.classList.remove("warning");
    }

    // Gera o slug automaticamente
    inputSlug.value = gerarSlug(titleVal);
  });

  inputMetaDesc.addEventListener("input", () => {
    const descVal = inputMetaDesc.value;
    
    // Atualiza contador da Meta Description (SEO ideal: max 160)
    metaCounter.textContent = `${descVal.length}/160`;
    if (descVal.length > 160) {
      metaCounter.classList.add("warning");
    } else {
      metaCounter.classList.remove("warning");
    }
  });

  // 3. UPLOAD DE IMAGEM PARA O STORAGE DO FIREBASE
  inputImgFile.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Garante que o Storage existe no about.js
    if (typeof storage === 'undefined') {
      alert("Firebase Storage não configurado no about.js.");
      return;
    }

    capaPreviewBox.innerHTML = `<span style="color: var(--accent-purple); font-weight: bold;">Subindo imagem...</span>`;

    const storageRef = storage.ref();
    const fileRef = storageRef.child(`capas/${Date.now()}_${file.name}`);

    fileRef.put(file)
      .then((snapshot) => {
        return snapshot.ref.getDownloadURL();
      })
      .then((downloadURL) => {
        inputImgUrl.value = downloadURL;
        capaPreviewBox.innerHTML = `<img src="${downloadURL}" alt="Preview da capa">`;
      })
      .catch((error) => {
        console.error("Erro no upload da imagem: ", error);
        capaPreviewBox.innerHTML = `<span style="color: var(--accent-red);">Erro no upload</span>`;
        alert("Erro ao subir arquivo: " + error.message);
      });
  });

  // Preview dinâmico caso a URL seja colada manualmente
  inputImgUrl.addEventListener("change", () => {
    const url = inputImgUrl.value.trim();
    if (url) {
      capaPreviewBox.innerHTML = `<img src="${url}" alt="Preview da capa">`;
    } else {
      capaPreviewBox.innerHTML = `<span style="color: var(--text-muted); font-size: 0.85rem;">Nenhuma imagem carregada</span>`;
    }
  });

  // 4. PREVIEW DE MARKDOWN AO VIVO
  textareaContent.addEventListener("input", () => {
    const markdownText = textareaContent.value;
    if (typeof marked !== 'undefined') {
      markdownPreview.innerHTML = marked.parse(markdownText);
    } else {
      markdownPreview.textContent = markdownText;
    }
  });

  // 5. ENVIO DE CONTEÚDO PARA O FIRESTORE
  formPublish.addEventListener("submit", (e) => {
    e.preventDefault();

    const destino = selectDestiny.value; // 'postagens' ou 'noticias'
    const titulo = inputTitle.value.trim();
    const slug = inputSlug.value.trim();
    const metaDesc = inputMetaDesc.value.trim();
    const keywords = inputKeywords.value.trim();
    const imagemCapa = inputImgUrl.value.trim();
    const conteudo = textareaContent.value;

    if (!titulo || !slug || !metaDesc || !conteudo) {
      alert("Por favor, preencha todos os campos obrigatórios (*).");
      return;
    }

    btnPublish.disabled = true;
    btnPublish.textContent = "Publicando...";

    // Payload de dados
    const payload = {
      titulo: titulo,
      slug: slug,
      metaDescription: metaDesc,
      keywords: keywords,
      imagemCapa: imagemCapa,
      conteudo: conteudo,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    };

    db.collection(destino).add(payload)
      .then((docRef) => {
        alert(`Sucesso! Artigo publicado na coleção ${destino}. ID: ${docRef.id}`);
        
        // Reseta o formulário
        formPublish.reset();
        capaPreviewBox.innerHTML = `<span style="color: var(--text-muted); font-size: 0.85rem;">Nenhuma imagem carregada</span>`;
        markdownPreview.innerHTML = `<p style="color: var(--text-muted); font-style: italic;">Escreva algo no formulário para visualizar a renderização...</p>`;
        titleCounter.textContent = "0/60";
        metaCounter.textContent = "0/160";
        titleCounter.classList.remove("warning");
        metaCounter.classList.remove("warning");
        btnPublish.disabled = false;
        btnPublish.textContent = "Publicar Artigo";

        // Atualiza a lista lateral
        carregarPublicacoesExistentes();
      })
      .catch((error) => {
        btnPublish.disabled = false;
        btnPublish.textContent = "Publicar Artigo";
        console.error("Erro ao gravar publicação no Firestore: ", error);
        alert("Erro de gravação: " + error.message);
      });
  });

  // 6. GERENCIAMENTO DE POSTS EXISTENTES (EXCLUSÃO)
  btnRefresh.addEventListener("click", () => {
    carregarPublicacoesExistentes();
  });

  function carregarPublicacoesExistentes() {
    recentPostsList.innerHTML = `<div class="no-comments" style="padding: 10px 0;">Atualizando publicações...</div>`;

    let todasPublicacoes = [];

    // Busca das postagens
    const p1 = db.collection("postagens").orderBy("timestamp", "desc").get().then((snap) => {
      snap.forEach(doc => {
        todasPublicacoes.push({ id: doc.id, colecao: "postagens", ...doc.data() });
      });
    });

    // Busca das notícias
    const p2 = db.collection("noticias").orderBy("timestamp", "desc").get().then((snap) => {
      snap.forEach(doc => {
        todasPublicacoes.push({ id: doc.id, colecao: "noticias", ...doc.data() });
      });
    });

    // Junta as buscas e ordena localmente por data decrescente
    Promise.all([p1, p2]).then(() => {
      recentPostsList.innerHTML = "";

      if (todasPublicacoes.length === 0) {
        recentPostsList.innerHTML = `<div class="no-comments" style="padding: 10px 0;">Nenhum artigo publicado no banco.</div>`;
        return;
      }

      // Ordena por timestamp
      todasPublicacoes.sort((a, b) => {
        const tA = a.timestamp ? a.timestamp.seconds : 0;
        const tB = b.timestamp ? b.timestamp.seconds : 0;
        return tB - tA;
      });

      todasPublicacoes.forEach((item) => {
        const itemEl = document.createElement("div");
        itemEl.className = "post-list-item";
        
        const dataStr = item.timestamp ? formatarDataAdmin(item.timestamp.toDate()) : "Sem data";

        itemEl.innerHTML = `
          <div class="post-list-info">
            <span class="post-list-title">${escaparHTMLAdmin(item.titulo)}</span>
            <div class="post-list-meta">
              <span class="badge badge-${item.colecao}">${item.colecao}</span> | ${dataStr}
            </div>
          </div>
          <button type="button" class="btn btn-danger" style="padding: 5px 10px; font-size: 0.8rem;" onclick="excluirPublicacao('${item.colecao}', '${item.id}')">Excluir</button>
        `;
        recentPostsList.appendChild(itemEl);
      });
    }).catch(err => {
      console.error("Erro ao carregar publicações no painel: ", err);
      recentPostsList.innerHTML = `<div class="no-comments" style="padding: 10px 0; color: var(--accent-red);">Falha de carregamento.</div>`;
    });
  }

  // Define a função de exclusão global no escopo de window para chamadas em onclick dos botões HTML
  window.excluirPublicacao = function(colecao, id) {
    if (!confirm(`Tem certeza de que deseja excluir permanentemente esta publicação da coleção '${colecao}'?`)) {
      return;
    }

    db.collection(colecao).doc(id).delete()
      .then(() => {
        alert("Publicação excluída com sucesso do Firestore.");
        carregarPublicacoesExistentes();
      })
      .catch((error) => {
        console.error("Erro ao deletar documento: ", error);
        alert("Erro ao excluir: " + error.message);
      });
  };

  // Lógica para Popular Dados de Demonstração (Seed)
  btnSeed.addEventListener("click", () => {
    if (!confirm("Deseja mesmo popular o banco com as 6 publicações de demonstração solicitadas?")) {
      return;
    }

    btnSeed.disabled = true;
    btnSeed.textContent = "Populando...";

    const seedNoticias = [
      {
        titulo: "Vibe Coding: A ascensão da programação baseada em intenção e IA",
        slug: "vibe-coding-ia-programacao-intencao",
        metaDescription: "Descubra o que é Vibe Coding, a nova tendência onde desenvolvedores atuam como diretores criativos de IA, escrevendo código em velocidade recorde.",
        keywords: "vibe coding, inteligência artificial, programacao, IA dev, tendencias tech",
        imagemCapa: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop",
        conteudo: `# Vibe Coding: A nova era da programação com Inteligência Artificial\n\nA ascensão de assistentes baseados em Inteligência Artificial, como Claude 3.5 Sonnet, GitHub Copilot e outros agentes autónomos, gerou uma nova tendência chamada **Vibe Coding**.\n\n## O que é Vibe Coding?\n\nVibe Coding refere-se ao ato de programar onde o desenvolvedor não escreve linhas de código manualmente de forma contínua, mas sim atua como um **diretor criativo** ou **arquiteto**. Ele expressa suas intenções, ideias e regras de negócio em linguagem natural e delega a geração do código ao agente de IA.\n\n> "A vibe é o direcionamento; a IA faz a implementação técnica."\n\n### Como funciona na prática?\n\n1. **Definição de Requisitos:** O dev descreve a funcionalidade (ex: "crie um carrossel de imagens responsivo em JavaScript puro").\n2. **Geração Dinâmica:** A IA propõe e injeta o código diretamente no editor.\n3. **Refinamento e Iteração:** O dev testa, ajusta o comportamento e corrige eventuais bugs pedindo à própria IA para ler logs de erro ou ajustar o alinhamento.\n\nEsta mudança reduz drasticamente a fricção inicial de novos projetos e democratiza a programação, aumentando em até 10 vezes a velocidade de entrega.`
      },
      {
        titulo: "Web3 e a Nova Era das Redes Sociais Descentralizadas",
        slug: "web3-redes-sociais-descentralizadas",
        metaDescription: "As redes sociais centralizadas estão perdendo espaço para protocolos Web3 como Farcaster e Bluesky. Entenda o impacto da descentralização.",
        keywords: "web3, redes sociais, descentralizacao, farcaster, blockchain",
        imagemCapa: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&auto=format&fit=crop",
        conteudo: `# O Futuro é Descentralizado: A Ascensão do Social Web3\n\nAs redes sociais tradicionais estão enfrentando crises de confiança de dados, privacidade e algoritmos de recomendação fechados. Diante disso, protocolos e ecossistemas **Web3** estão construindo as redes sociais do futuro.\n\n## Principais Protocolos e Redes:\n\n- **Farcaster:** Um protocolo descentralizado para a construção de redes sociais robustas, permitindo que usuários tenham propriedade total sobre suas identidades e contatos.\n- **Bluesky (AT Protocol):** Um protocolo federado aberto que permite o controle total da linha do tempo e a customização de feeds por desenvolvedores.\n\n### Benefícios do Social Descentralizado:\n\n1. **Propriedade de Dados:** Seus seguidores e postagens pertencem a você, não a uma empresa única.\n2. **Monetização Sem Intermediários:** Creators podem criar micropagamentos e interações com tokens criptográficos diretamente de suas contas.\n3. **Algoritmos Transparentes:** Código aberto que permite entender de verdade o que é promovido na sua timeline.`
      },
      {
        titulo: "Computação Quântica no Desenvolvimento de Software Comercial",
        slug: "computacao-quantica-desenvolvimento-comercial",
        metaDescription: "A computação quântica está saindo dos laboratórios de pesquisa. Saiba como se preparar para criar os primeiros softwares quânticos.",
        keywords: "computacao quantica, qiskit, python quntico, futuro tech",
        imagemCapa: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop",
        conteudo: `# Computação Quântica: O Próximo Salto Tecnológico\n\nA computação quântica baseia-se nos princípios de **superposição** e **emaranhamento** da mecânica quântica para resolver problemas matemáticos de complexidade impossível para os computadores clássicos.\n\n## Como programar para um Computador Quântico?\n\nHoje, desenvolvedores podem experimentar algoritmos quânticos usando frameworks de simulação e conectando-se a computadores quânticos de verdade na nuvem de forma gratuita.\n\n### O Ecossistema Qiskit (IBM)\n\nO Qiskit é um kit de desenvolvimento de software em Python open source para trabalhar com computadores quânticos no nível de circuitos, pulsos e algoritmos.\n\n\`\`\`python\nfrom qiskit import QuantumCircuit, assemble, Aer\nfrom qiskit.visualization import plot_histogram\n\n# Cria um circuito quântico com 2 qubits\nqc = QuantumCircuit(2)\nqc.h(0) # Aplica porta Hadamard\nqc.cx(0, 1) # Aplica porta CNOT (emaranhamento)\nqc.measure_all()\n\`\`\`\n\nGrandes setores como criptografia, otimização logística e síntese molecular de remédios serão os primeiros a serem transformados comercialmente.`
      }
    ];

    const seedPostagens = [
      {
        titulo: "Estruturas de Dados Avançadas em C# na Prática",
        slug: "estruturas-de-dados-avancadas-csharp",
        metaDescription: "Domine coleções e estruturas cruciais em C# e .NET como LinkedLists, Span<T> e ReadOnlySpan<T> para construir APIs de alta performance.",
        keywords: "csharp, dotnet, estruturas de dados, linkedlist, span, performance",
        imagemCapa: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop",
        conteudo: `# Otimização de Performance com Estruturas de Dados em C#\n\nEm grandes sistemas com milhões de requisições por segundo, a escolha da estrutura de dados e coleções do C# e .NET determina a eficiência de uso de CPU e alocação de memória.\n\n## LinkedList<T> vs List<T>\n\n- **List<T>:** Ótimo para pesquisas rápidas por índice, mas inserções no meio da lista exigem o deslocamento de todos os elementos.\n- **LinkedList<T>:** Cada elemento aponta para o anterior e próximo. Inserções e exclusões são muito rápidas, mas buscar um elemento aleatório exige percorrer a lista inteira.\n\n## O Poder do Span<T> e ReadOnlySpan<T>\n\nO \`Span<T>\` permite trabalhar de forma segura e eficiente com fatias de memória contíguas (no heap, stack ou nativa) sem a necessidade de alocar novas strings ou arrays no Garbage Collector, reduzindo a alocação de memória para zero em rotinas de análise de string.\n\n\`\`\`csharp\n// Fatiando string sem alocar memória\nstring logLine = "2026-07-28 [ERROR] Conexão recusada";\nReadOnlySpan<char> span = logLine.AsSpan();\nReadOnlySpan<char> dateSpan = span.Slice(0, 10);\nReadOnlySpan<char> levelSpan = span.Slice(12, 7);\n\`\`\`\n\nAplique Span nas suas rotinas de parse e veja as suas APIs rodarem com muito menos pressão no Garbage Collector!`
      },
      {
        titulo: "Blockchain do Zero: Implementando uma Rede com TypeScript",
        slug: "blockchain-do-zero-typescript",
        metaDescription: "Aprenda os fundamentos conceituais do blockchain criando blocos criptografados, proof of work e transações simples usando TypeScript puro.",
        keywords: "blockchain, typescript, criptografia, sha256, nodejs, dev",
        imagemCapa: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800&auto=format&fit=crop",
        conteudo: `# Entendendo a Tecnologia Blockchain na Prática com TypeScript\n\nBlockchain é mais do que criptomoedas; é um livro-razão distribuído, imutável e descentralizado. A melhor forma de entendê-lo é implementando os seus componentes conceituais primários.\n\n## A Estrutura de um Bloco\n\nCada bloco na rede contém um índice, um timestamp, dados das transações, o hash do bloco anterior (formando a corrente) e o seu próprio hash SHA-256.\n\n\`\`\`typescript\nimport * as crypto from 'crypto';\n\nclass Block {\n  public hash: string;\n  constructor(\n    public index: number,\n    public previousHash: string,\n    public timestamp: number,\n    public data: any,\n    public nonce = 0\n  ) {\n    this.hash = this.calcularHash();\n  }\n\n  public calcularHash(): string {\n    const str = this.index + this.previousHash + this.timestamp + JSON.stringify(this.data) + this.nonce;\n    return crypto.createHash('sha256').update(str).digest('hex');\n  }\n}\n\`\`\`\n\n### O Consenso: Proof of Work\n\nPara validar a inclusão de um bloco, o minerador precisa resolver um quebra-cabeça matemático de dificuldade dinâmica, encontrando um hash que comece com uma determinada quantidade de zeros (ex: \`0000\`), incrementando o valor de \`nonce\` repetidamente.`
      },
      {
        titulo: "Dockerizando WSL2 para Alta Performance em Desenvolvimento Web",
        slug: "wsl2-docker-alta-performance",
        metaDescription: "Configure o WSL2 (Windows Subsystem for Linux 2) com Docker de forma profissional para rodar microsserviços com rapidez e integração total.",
        keywords: "wsl2, docker, containers, devops, windows dev, linux",
        imagemCapa: "https://images.unsplash.com/photo-1600132806370-bf17e65e942f?w=800&auto=format&fit=crop",
        conteudo: `# Guia Definitivo: Docker + WSL2 para Desenvolvedores Web\n\nDesenvolver no Windows utilizando o WSL2 (subsistema Linux) com Docker Desktop oferece o melhor dos dois mundos: ferramentas clássicas e a performance e compatibilidade de containers Linux nativos.\n\n## Vantagens do WSL2 no Docker:\n\n1. **Velocidade de I/O:** O WSL2 utiliza um kernel Linux nativo leve e rápido.\n2. **Integração Total:** Containers Docker rodam de forma transparente de dentro do terminal Linux ou do VS Code (Remote WSL).\n3. **Baixo Consumo:** Gerenciamento de memória dinâmico para evitar estouro de RAM no Windows.\n\n### Como Configurar Docker Desktop com WSL2:\n\n1. Ative a funcionalidade do WSL no Windows Features.\n2. Instale o Ubuntu na Microsoft Store.\n3. No Docker Desktop, vá em **Settings > General** e marque a opção **Use the WSL 2 based engine**.\n4. Na aba **Resources > WSL Integration**, ative a integração para a sua distribuição instalada.\n\nPronto! Agora você tem um ambiente de containers de altíssimo desempenho rodando nativo na sua máquina.`
      }
    ];

    let promises = [];

    // Adiciona notícias
    seedNoticias.forEach(item => {
      promises.push(
        db.collection("noticias").add({
          ...item,
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
        })
      );
    });

    // Adiciona postagens
    seedPostagens.forEach(item => {
      promises.push(
        db.collection("postagens").add({
          ...item,
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
        })
      );
    });

    Promise.all(promises)
      .then(() => {
        alert("Banco de dados populado com sucesso com os 6 posts de seed!");
        btnSeed.disabled = false;
        btnSeed.textContent = "Popular Seed";
        carregarPublicacoesExistentes();
      })
      .catch((err) => {
        console.error("Erro ao popular banco de dados: ", err);
        alert("Erro de inserção: " + err.message);
        btnSeed.disabled = false;
        btnSeed.textContent = "Popular Seed";
      });
  });

});

// Utilitários auxiliares de Admin
function gerarSlug(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .replace(/[^a-z0-9\s-]/g, "") // Remove caracteres especiais
    .replace(/\s+/g, "-") // Troca espaços por -
    .replace(/-+/g, "-") // Evita hífens repetidos
    .trim();
}

function formatarDataAdmin(data) {
  const pad = (n) => n.toString().padStart(2, '0');
  return `${pad(data.getDate())}/${pad(data.getMonth() + 1)}/${data.getFullYear()}`;
}

function escaparHTMLAdmin(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
