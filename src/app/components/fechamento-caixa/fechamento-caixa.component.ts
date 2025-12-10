import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FluxoCaixaService, ContaCaixa, MovimentacaoFluxoCaixaResponse, MovimentacaoFluxoCaixa } from '../../services/fluxo-caixa.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface FechamentoCaixaMovimento {
  id: number;
  data: string;
  descricao: string;
  tipo: 'ENTRADA' | 'SAIDA';
  valor: number;
  saldoAnterior: number;
  saldoAtual: number;
  origem: string;
  documento?: string;
}

export interface FechamentoCaixaRelatorio {
  movimentos: FechamentoCaixaMovimento[];
  saldoInicial: number;
  saldoFinal: number;
  totalEntradas: number;
  totalSaidas: number;
  periodo: {
    dataInicio: string;
    dataFim: string;
  };
  conta: {
    descricao: string;
    responsavel: string;
  };
}

@Component({
  selector: 'app-fechamento-caixa',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './fechamento-caixa.component.html',
  styleUrls: ['./fechamento-caixa.component.scss']
})
export class FechamentoCaixaComponent implements OnInit {
  fechamentoCaixaForm = new FormGroup({
    dataInicio: new FormControl<string | null>(null),
    dataFim: new FormControl<string | null>(null)
  });

  contaCaixa: ContaCaixa | null = null;
  carregando: boolean = false;
  carregandoRelatorio: boolean = false;
  erro: string | null = null;

  constructor(
    private fluxoCaixaService: FluxoCaixaService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.carregarContaUsuario();
    this.definirPeriodoPadrao();
  }

  carregarContaUsuario(): void {
    this.carregando = true;
    this.erro = null;

    this.fluxoCaixaService.getContasAcessiveis().subscribe({
      next: (contas) => {
        const contasAtivas = contas.filter(c => c.ativo);
        
        if (contasAtivas.length === 0) {
          this.erro = 'Nenhuma conta de caixa encontrada para o usuário.';
          this.carregando = false;
          return;
        }
        
        this.contaCaixa = contasAtivas[0];
        this.carregando = false;
      },
      error: (err) => {
        console.error('Erro ao carregar conta do usuário:', err);
        this.erro = 'Erro ao carregar conta de caixa. Tente novamente.';
        this.carregando = false;
      }
    });
  }

  definirPeriodoPadrao(): void {
    const dataHoje = this.obterDataLocal();

    this.fechamentoCaixaForm.patchValue({
      dataInicio: dataHoje,
      dataFim: dataHoje
    });
  }

  obterDataLocal(): string {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }

  onSubmit(): void {
    if (!this.contaCaixa) {
      this.erro = 'Conta de caixa não encontrada.';
      return;
    }

    const f = this.fechamentoCaixaForm.value;

    if (!f.dataInicio || !f.dataFim) {
      this.erro = 'Por favor, informe o período do relatório.';
      return;
    }

    this.carregandoRelatorio = true;
    this.erro = null;

    // Buscar apenas as movimentações (saldo anterior está com erro 500)
    this.fluxoCaixaService.getMovimentacoesPorConta(
      this.contaCaixa.id,
      f.dataInicio,
      f.dataFim
    ).subscribe({
      next: (response: MovimentacaoFluxoCaixaResponse) => {
        console.log('Resposta da API:', response);
        this.carregandoRelatorio = false;

        try {
          // Calcular saldo inicial baseado no saldo atual e nas movimentações
          const saldoInicial = this.calcularSaldoInicial(response.content);
          console.log('Saldo inicial calculado:', saldoInicial);

          const dadosRelatorio = this.processarDadosParaRelatorio(
            response,
            f.dataInicio!,
            f.dataFim!,
            saldoInicial
          );
          console.log('Dados do relatório:', dadosRelatorio);

          const doc = this.gerarPdf(dadosRelatorio);
          console.log('PDF gerado com sucesso');

          this.abrirPdfEmNovaAba(doc);
        } catch (error) {
          console.error('Erro ao gerar PDF:', error);
          this.erro = 'Erro ao gerar o relatório PDF. Tente novamente.';
        }
      },
      error: (error) => {
        this.carregandoRelatorio = false;
        console.error('Erro ao buscar movimentações:', error);
        this.erro = 'Erro ao buscar dados do fluxo de caixa. Tente novamente.';
      }
    });
  }

  calcularSaldoInicial(movimentacoes: MovimentacaoFluxoCaixa[]): number {
    if (!this.contaCaixa) return 0;

    // Saldo atual da conta
    let saldoAtual = this.contaCaixa.saldoAtual;

    // Subtrair todas as movimentações do período para obter o saldo inicial
    movimentacoes.forEach(mov => {
      saldoAtual -= mov.valor; // mov.valor já vem com sinal correto (positivo para receita, negativo para despesa)
    });

    return saldoAtual;
  }

  processarDadosParaRelatorio(
    response: MovimentacaoFluxoCaixaResponse,
    dataInicio: string,
    dataFim: string,
    saldoInicial: number
  ): FechamentoCaixaRelatorio {
    const movimentacoesOrdenadas = [...response.content].sort((a, b) => {
      const timestampA = this.converterDataLancamentoParaTimestamp(a.dataLancamento);
      const timestampB = this.converterDataLancamentoParaTimestamp(b.dataLancamento);

      return timestampA - timestampB;
    });

    let saldoAtual = saldoInicial;
    let totalEntradas = 0;
    let totalSaidas = 0;

    const movimentos: FechamentoCaixaMovimento[] = movimentacoesOrdenadas.map(mov => {
      const saldoAnterior = saldoAtual;
      const valorAbsoluto = Math.abs(mov.valor);

      if (mov.categoria === 'RECEITA') {
        totalEntradas += valorAbsoluto;
        saldoAtual += valorAbsoluto;
      } else {
        totalSaidas += valorAbsoluto;
        saldoAtual -= valorAbsoluto;
      }

      // Converter data de array para string
      const dataMovimentacao = this.converterDataParaString(mov.dataMovimentacao);

      return {
        id: mov.id,
        data: dataMovimentacao,
        descricao: mov.descricao,
        tipo: mov.categoria === 'RECEITA' ? 'ENTRADA' : 'SAIDA',
        valor: valorAbsoluto,
        saldoAnterior: saldoAnterior,
        saldoAtual: saldoAtual,
        origem: mov.tipoMovimentacaoDescricao,
        documento: mov.numeroDocumento
      };
    });

    return {
      movimentos,
      saldoInicial: saldoInicial,
      saldoFinal: saldoAtual,
      totalEntradas,
      totalSaidas,
      periodo: {
        dataInicio,
        dataFim
      },
      conta: {
        descricao: this.contaCaixa!.descricao,
        responsavel: this.contaCaixa!.usuarioResponsavelNome
      }
    };
  }

  converterDataParaString(data: any): string {
    // Se a data vier como array [2025, 11, 19]
    if (Array.isArray(data)) {
      const [ano, mes, dia] = data;
      return `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    }
    // Se já for string, retorna como está
    return data;
  }

  converterDataLancamentoParaTimestamp(dataLancamento: any): number {
    if (Array.isArray(dataLancamento) && dataLancamento.length >= 6) {
      const [ano, mes, dia, hora, minuto, segundo] = dataLancamento;
      const date = new Date(ano, mes - 1, dia, hora, minuto, segundo);
      return date.getTime();
    }
    return 0;
  }

  gerarPdf(dados: FechamentoCaixaRelatorio): jsPDF {
    const doc = new jsPDF('landscape'); // Modo paisagem para caber mais colunas

    // Cabeçalho
    doc.setFontSize(18);
    doc.text('Fechamento de Caixa', 14, 20);

    doc.setFontSize(12);
    doc.text(`Conta: ${dados.conta.descricao}`, 14, 30);
    doc.text(`Responsável: ${dados.conta.responsavel}`, 14, 36);
    doc.text(`Período: ${this.formatarData(dados.periodo.dataInicio)} a ${this.formatarData(dados.periodo.dataFim)}`, 14, 42);

    // Resumo
    doc.setFontSize(14);
    doc.text('Resumo do Período:', 14, 54);

    doc.setFontSize(12);
    doc.text(`Saldo Inicial: R$ ${dados.saldoInicial.toFixed(2)}`, 14, 62);
    doc.text(`Total de Entradas: R$ ${dados.totalEntradas.toFixed(2)}`, 14, 68);
    doc.text(`Total de Saídas: R$ ${dados.totalSaidas.toFixed(2)}`, 14, 74);
    doc.text(`Saldo Final: R$ ${dados.saldoFinal.toFixed(2)}`, 14, 80);

    // Tabela de movimentações
    const startY = 88;
    const head = [[
      'Data', 'Descrição', 'Tipo', 'Valor', 'Saldo Após', 'Origem', 'Documento'
    ]];

    const body = dados.movimentos.map(m => [
      this.formatarData(m.data),
      m.descricao,
      m.tipo === 'ENTRADA' ? 'Entrada' : 'Saída',
      `R$ ${m.valor.toFixed(2)}`,
      `R$ ${m.saldoAtual.toFixed(2)}`,
      m.origem,
      m.documento || '-'
    ]);

    autoTable(doc, {
      startY,
      head,
      body,
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [102, 126, 234], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      columnStyles: {
        0: { cellWidth: 25 },  // Data
        1: { cellWidth: 80 },  // Descrição
        2: { cellWidth: 25 },  // Tipo
        3: { cellWidth: 30 },  // Valor
        4: { cellWidth: 30 },  // Saldo Após
        5: { cellWidth: 50 },  // Origem
        6: { cellWidth: 35 }   // Documento
      },
      margin: { top: 10, right: 10, bottom: 10, left: 10 }
    });

    return doc;
  }

  formatarData(data: string): string {
    const partes = data.split('-');
    if (partes.length === 3) {
      return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }
    return data;
  }

  abrirPdfEmNovaAba(doc: jsPDF): void {
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, '_blank');
  }

  voltarParaHome(): void {
    this.router.navigate(['/caixa']);
  }
}

