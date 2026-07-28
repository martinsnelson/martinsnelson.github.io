# Especificação de Design e Identidade Visual - Nelson Dev

Este documento define os pilares visuais, tipográficos e estruturais do projeto **Nelson Dev**, garantindo consistência visual entre a landing page principal (com Efeito Parallax) e as ferramentas utilitárias (como a Calculadora de Juros Compostos).

---

## 1. Paleta de Cores e Gradientes

O site utiliza uma combinação de tons frios e escuros com destaques brilhantes para criar um ambiente moderno e profissional (estilo premium futurista/financista).

### Cores Principais do Site (Gradiente Parallax)
- **Fundo Roxo Escuro:** `#2b1055`
- **Fundo Azul Céu:** `#7597de`
- **Fundo de Transição:** `#1c0522` (um roxo quase preto que dá acabamento ao parallax)

### Cores das Ferramentas (Calculadora)
- **Primary Dark (Grafite):** `#2f3542` (utilizado em headers e botões secundários)
- **Primary Black (Preto Escuro):** `#11141a` (utilizado para títulos principais e botão de alta ação)
- **Accent Blue (Azul Google):** `#0b57d0` (foco de inputs e destaque principal)
- **Accent Blue Light (Azul Claro Lead):** `#e8f0fe` (fundo para caixa de captura e linhas selecionadas)
- **Accent Blue Text (Azul Destaque):** `#0056b3` (cor para números de resultados e links)
- **BG Light (Cinza de Fundo):** `#f8f9fa` (cor de fundo das páginas utilitárias)
- **Border Color:** `#e0e0e0` (borda fina e discreta)

---

## 2. Tipografia

Para garantir a melhor legibilidade e visual em qualquer dispositivo, o projeto utiliza duas famílias de fontes importadas diretamente do Google Fonts:

1. **Poppins (Títulos e Branding):**
   - **Família:** `'Poppins', sans-serif`
   - **Uso:** Cabeçalhos, títulos principais, botões e elementos de marca.
   - **Pesos:** 300 (Light), 400 (Regular), 700 (Bold), 900 (Extra Bold).

2. **Inter (Dados e Valores Monetários):**
   - **Família:** `'Inter', sans-serif`
   - **Uso:** Textos corridos, inputs de formulário, números da tabela e valores dos cards de resultados.
   - **Pesos:** 400 (Regular), 500 (Medium), 600 (Semi-Bold), 700 (Bold).

---

## 3. Elementos de UI (Componentes Visualmente Ricos)

### A. Cabeçalhos de Seção da Calculadora
Cada bloco principal (Formulário, Resultado, Gráfico, Tabela) possui um cabeçalho estruturado:
- Um quadrado preto/escuro (`36px x 36px`) com bordas levemente arredondadas contendo um **ícone SVG branco integrado**.
- O título da seção ao lado, em **CAIXA ALTA**, com peso `700` e espaçamento entre letras de `0.5px`.

### B. Input Groups Integrados
Os campos de entrada de dinheiro e taxas utilizam um contêiner unificado:
- **Prefixos fixos:** `R$` e `%` integrados ao lado esquerdo com fundo cinza suave (`#f8f9fa`) e divisórias finas.
- **Selects Acoplados:** O `<select>` de tipo (Mensal/Anual) fica posicionado dentro do mesmo campo de bordas arredondadas do input, à direita, com seta personalizada via CSS e sem quebras de layout.
- **Borda de Foco:** Ao focar o campo, a borda inteira muda para o azul destaque (`#0b57d0`) com uma sombra externa suave (`box-shadow` azulada com opacidade).

### C. Cards de Resultados (Três Colunas)
Os valores de retorno aparecem em cards independentes com fundo cinza muito claro, bordas de 1px e cantos arredondados, exibindo em caixa alta o título do resultado e o valor formatado com destaque de tamanho. O valor de **Total em Juros** recebe coloração azul para diferenciação rápida.

---

## 4. Diretrizes de Responsividade (iPhone 8, 11+ e Android)

O projeto adota a estratégia de degradação suave e adaptação dinâmica de Grid/Flexbox no mobile:

1. **Header e Menus:**
   - Em telas pequenas, o menu superior flexível se orienta de forma vertical com espaçamentos menores, impedindo que os links ultrapassem a largura do celular.
2. **Inputs e Ações (Formulários):**
   - Os inputs se alinham em uma única coluna vertical.
   - Os botões "Limpar" e "Calcular" abandonam a disposição lado a lado no celular e passam a ocupar **100% de largura empilhados**, facilitando a área de clique com tamanho mínimo de `48px`.
3. **Cards e Tabelas:**
   - Cards de resultados são empilhados em uma coluna única no mobile.
   - A tabela possui rolagem horizontal independente (`.table-responsive { overflow-x: auto; }`), garantindo que a visualização mês a mês nunca cause quebra ou deslocamento do layout lateral.

---

## 5. Animações e Efeitos Técnicos

- **Parallax Scroll 3D (Home):** Feito em vanilla JS puro na Home (`index.html`), movimentando 4 camadas de imagens no eixo Y e X com base na porcentagem de rolagem (`window.scrollY`) em velocidades diferenciadas.
- **Micro-transições de Hover:** Todos os botões, links de menu e cards possuem transições suaves de opacidade ou cor de fundo de `0.2s` para melhor feedback do usuário.

---

## 6. Stack Tecnológica e SEO

- **Frontend:** HTML5 Semântico, CSS3 Vanilla e ES6 JavaScript Puro.
- **Gráficos:** Biblioteca externa **Chart.js UMD** salva localmente.
- **Banco de Dados (Leads):** **Firebase Firestore** via SDK v9 compat integrado, gravando nome, e-mail, timestamp e origem diretamente na coleção `leads`.
- **SEO estruturado:** Breadcrumbs e FAQ formatados em JSON-LD nos cabeçalhos da calculadora para otimização em motores de busca.
