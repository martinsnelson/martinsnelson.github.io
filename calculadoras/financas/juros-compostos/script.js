document.addEventListener('DOMContentLoaded', () => {
  // Elementos do Formulário
  const form = document.getElementById('form-juros-compostos');
  const inputValorInicial = document.getElementById('valor-inicial');
  const inputAporteMensal = document.getElementById('aporte-mensal');
  const inputTaxaJuros = document.getElementById('taxa-juros');
  const selectTipoTaxa = document.getElementById('tipo-taxa');
  const inputPeriodo = document.getElementById('periodo');
  const selectTipoPeriodo = document.getElementById('tipo-periodo');
  const btnLimpar = document.getElementById('btn-limpar');

  // Elementos de Exibição de Resultados
  const resultsArea = document.getElementById('dynamic-results-area');
  const tableArea = document.getElementById('dynamic-table-area');
  const resTotalJuros = document.getElementById('res-total-juros');
  const resTotalInvestido = document.getElementById('res-total-investido');
  const resTotalFinal = document.getElementById('res-total-final');
  const tableBodyJuros = document.getElementById('table-body-juros');

  // Instância do Gráfico (Chart.js)
  let donutChartInstance = null;

  // Formatador de Moeda BRL
  const formatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  // Intercepta envio do formulário
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calcularJurosCompostos();
  });

  // Intercepta clique no botão limpar
  btnLimpar.addEventListener('click', () => {
    limparCalculadora();
  });

  /**
   * Executa os cálculos matemáticos e atualiza a interface
   */
  function calcularJurosCompostos() {
    // 1. Coleta e validação simples dos valores de entrada
    const valorInicial = parseFloat(inputValorInicial.value) || 0;
    const aporteMensal = parseFloat(inputAporteMensal.value) || 0;
    const taxaJurosBruta = parseFloat(inputTaxaJuros.value) || 0;
    const periodoBruto = parseInt(inputPeriodo.value, 10) || 0;

    if (periodoBruto <= 0 || taxaJurosBruta < 0 || valorInicial < 0 || aporteMensal < 0) {
      alert('Por favor, insira valores válidos. O período deve ser maior que zero.');
      return;
    }

    const tipoTaxa = selectTipoTaxa.value; // 'mensal' ou 'anual'
    const tipoPeriodo = selectTipoPeriodo.value; // 'meses' ou 'anos'

    // 2. Padronização do período para Meses (N)
    const nMeses = tipoPeriodo === 'anos' ? periodoBruto * 12 : periodoBruto;

    // 3. Padronização da taxa para Mensal (i_mensal decimal)
    let iMensal = 0;
    if (tipoTaxa === 'anual') {
      // i_mensal = (1 + i_anual)^(1/12) - 1
      const iAnualDecimal = taxaJurosBruta / 100;
      iMensal = Math.pow(1 + iAnualDecimal, 1 / 12) - 1;
    } else {
      iMensal = taxaJurosBruta / 100;
    }

    // 4. Loop de simulação mês a mês
    let saldoAcumulado = valorInicial;
    let totalInvestidoAcumulado = valorInicial;
    let jurosAcumulados = 0;
    const evolucaoMensal = [];

    for (let mes = 1; mes <= nMeses; mes++) {
      // Juros calculados sobre o saldo do final do mês anterior e arredondados para centavos
      const jurosDoMes = Math.round((saldoAcumulado * iMensal) * 100) / 100;
      
      // Aporte do mês é somado ao montante
      saldoAcumulado = Math.round((saldoAcumulado + jurosDoMes + aporteMensal) * 100) / 100;
      totalInvestidoAcumulado += aporteMensal;
      jurosAcumulados = Math.round((saldoAcumulado - totalInvestidoAcumulado) * 100) / 100;

      evolucaoMensal.push({
        mes: mes,
        jurosDoMes: jurosDoMes,
        totalInvestido: totalInvestidoAcumulado,
        jurosAcumulados: jurosAcumulados,
        valorAcumulado: saldoAcumulado
      });
    }

    // Totais Finais
    const totalInvestidoFinal = valorInicial + (aporteMensal * nMeses);
    const valorTotalFinal = saldoAcumulado;
    const totalJurosFinal = valorTotalFinal - totalInvestidoFinal;

    // 5. Exibição dos cards de resultado
    resTotalJuros.textContent = formatter.format(totalJurosFinal);
    resTotalInvestido.textContent = formatter.format(totalInvestidoFinal);
    resTotalFinal.textContent = formatter.format(valorTotalFinal);

    // 6. Preenchimento da tabela de evolução
    preencherTabela(evolucaoMensal);

    // 7. Renderização do Donut Chart
    renderizarGrafico(totalInvestidoFinal, totalJurosFinal);

    // 8. Torna as seções de resultados visíveis
    resultsArea.classList.add('active');
    tableArea.classList.add('active');

    // Rola suavemente até os resultados no mobile
    resultsArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /**
   * Preenche a tabela dinâmica com o histórico mês a mês
   */
  function preencherTabela(evolucao) {
    tableBodyJuros.innerHTML = '';

    evolucao.forEach(item => {
      const row = document.createElement('tr');
      
      row.innerHTML = `
        <td>Mês ${item.mes}</td>
        <td>${formatter.format(item.jurosDoMes)}</td>
        <td>${formatter.format(item.totalInvestido)}</td>
        <td>${formatter.format(item.jurosAcumulados)}</td>
        <td>${formatter.format(item.valorAcumulado)}</td>
      `;

      tableBodyJuros.appendChild(row);
    });
  }

  /**
   * Cria ou atualiza o gráfico de rosca (Donut Chart)
   */
  function renderizarGrafico(investido, juros) {
    const ctx = document.getElementById('donutChart').getContext('2d');

    // Se já houver um gráfico desenhado, destrói para evitar conflito
    if (donutChartInstance) {
      donutChartInstance.destroy();
    }

    donutChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Total Investido', 'Total em Juros'],
        datasets: [{
          data: [investido, juros],
          backgroundColor: [
            '#2f3542', // Grafite / Cinza Escuro
            '#8faec4'  // Azul Claro
          ],
          borderColor: '#ffffff',
          borderWidth: 2,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false // Oculta a legenda padrão do Chart.js, pois criamos uma customizada em HTML
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                let label = context.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.parsed !== null) {
                  label += formatter.format(context.parsed);
                }
                return label;
              }
            }
          }
        },
        cutout: '65%' // Deixa a rosca mais fina e elegante
      }
    });
  }

  /**
   * Reseta todo o estado da calculadora
   */
  function limparCalculadora() {
    // Limpa inputs
    form.reset();

    // Remove classes ativas de exibição
    resultsArea.classList.remove('active');
    tableArea.classList.remove('active');

    // Destrói gráfico
    if (donutChartInstance) {
      donutChartInstance.destroy();
      donutChartInstance = null;
    }

    // Limpa HTML de tabelas e valores
    tableBodyJuros.innerHTML = '';
    resTotalJuros.textContent = 'R$ 0,00';
    resTotalInvestido.textContent = 'R$ 0,00';
    resTotalFinal.textContent = 'R$ 0,00';

    // Rola de volta para o topo do formulário suavemente
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
});
