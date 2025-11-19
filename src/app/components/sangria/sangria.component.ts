import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FluxoCaixaService, ContaCaixa, TipoMovimentacao, CriarMovimentacaoRequest } from '../../services/fluxo-caixa.service';

@Component({
  selector: 'app-sangria',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sangria.component.html',
  styleUrls: ['./sangria.component.scss']
})
export class SangriaComponent implements OnInit {
  contaCaixa: ContaCaixa | null = null;
  tiposMovimentacao: TipoMovimentacao[] = [];

  // Dados do formulário
  tipoMovimentacaoId: number | null = null;
  valor: number | null = null;
  descricao: string = '';
  dataMovimentacao: string = '';
  numeroDocumento: string = '';
  observacoes: string = '';

  // Estados
  carregando: boolean = false;
  salvando: boolean = false;
  erro: string | null = null;
  mostrarModalSucesso: boolean = false;
  valorSangria: number = 0;

  // Saldo
  saldoAtual: number = 0;
  saldoAposSangria: number = 0;

  constructor(
    private fluxoCaixaService: FluxoCaixaService,
    private router: Router
  ) {
    // Definir data de hoje como padrão
    this.dataMovimentacao = this.obterDataLocal();
  }

  obterDataLocal(): string {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados(): void {
    this.carregando = true;
    this.erro = null;

    // Carregar conta do usuário logado
    this.fluxoCaixaService.getContasAcessiveis().subscribe({
      next: (contas) => {
        const contasAtivas = contas.filter(c => c.ativo);

        if (contasAtivas.length === 0) {
          this.erro = 'Nenhuma conta de caixa encontrada para o usuário.';
          this.carregando = false;
          return;
        }

        // Usar a primeira conta acessível (conta do usuário logado)
        this.contaCaixa = contasAtivas[0];
        this.saldoAtual = this.contaCaixa.saldoAtual;
        this.calcularSaldoAposSangria();

        // Carregar tipos de movimentação de DESPESA
        this.fluxoCaixaService.getTiposMovimentacaoPorCategoria('DESPESA').subscribe({
          next: (tipos) => {
            this.tiposMovimentacao = tipos.filter(t => t.ativo);

            // Selecionar "Despesas Operacionais" por padrão (ID 6 conforme documentação)
            const despesasOperacionais = this.tiposMovimentacao.find(t => t.id === 6);
            if (despesasOperacionais) {
              this.tipoMovimentacaoId = despesasOperacionais.id;
            }

            this.carregando = false;
          },
          error: (err) => {
            console.error('Erro ao carregar tipos de movimentação:', err);
            this.erro = 'Erro ao carregar tipos de movimentação. Tente novamente.';
            this.carregando = false;
          }
        });
      },
      error: (err) => {
        console.error('Erro ao carregar conta do usuário:', err);
        this.erro = 'Erro ao carregar conta de caixa. Tente novamente.';
        this.carregando = false;
      }
    });
  }

  onValorChange(): void {
    this.calcularSaldoAposSangria();
  }

  calcularSaldoAposSangria(): void {
    if (this.valor && this.valor > 0) {
      this.saldoAposSangria = this.saldoAtual - this.valor;
    } else {
      this.saldoAposSangria = this.saldoAtual;
    }
  }

  validarFormulario(): boolean {
    this.erro = null;

    if (!this.contaCaixa) {
      this.erro = 'Conta de caixa não encontrada.';
      return false;
    }

    if (!this.tipoMovimentacaoId) {
      this.erro = 'Selecione um tipo de movimentação.';
      return false;
    }

    if (!this.valor || this.valor <= 0) {
      this.erro = 'Informe um valor maior que zero.';
      return false;
    }

    if (!this.descricao || this.descricao.trim() === '') {
      this.erro = 'A descrição é obrigatória.';
      return false;
    }

    if (!this.dataMovimentacao) {
      this.erro = 'Informe a data da movimentação.';
      return false;
    }

    // Validar se a data não é futura
    const dataMovimento = new Date(this.dataMovimentacao);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    dataMovimento.setHours(0, 0, 0, 0);

    if (dataMovimento > hoje) {
      this.erro = 'A data da movimentação não pode ser futura.';
      return false;
    }

    return true;
  }

  realizarSangria(): void {
    if (!this.validarFormulario()) {
      return;
    }

    this.salvando = true;
    this.erro = null;

    const movimentacao: CriarMovimentacaoRequest = {
      contaCaixaId: this.contaCaixa!.id,
      tipoMovimentacaoId: this.tipoMovimentacaoId!,
      descricao: this.descricao.trim(),
      valor: -(this.valor!), // Valor negativo para sangria
      dataMovimentacao: this.dataMovimentacao,
      numeroDocumento: this.numeroDocumento.trim() || null,
      observacoes: this.observacoes.trim() || null
    };

    this.fluxoCaixaService.criarMovimentacao(movimentacao).subscribe({
      next: (response) => {
        this.valorSangria = this.valor!;
        this.salvando = false;

        // Atualizar saldo após sangria
        this.atualizarSaldo();

        // Mostrar modal de sucesso
        this.mostrarModalSucesso = true;
      },
      error: (err) => {
        console.error('Erro ao realizar sangria:', err);
        this.erro = err.error?.message || err.error?.mensagem || 'Erro ao realizar sangria. Tente novamente.';
        this.salvando = false;
      }
    });
  }

  fecharModalEVoltar(): void {
    this.mostrarModalSucesso = false;
    this.voltarParaHome();
  }

  atualizarSaldo(): void {
    this.fluxoCaixaService.getSaldosContas().subscribe({
      next: (saldos) => {
        const saldoConta = saldos.find(s => s.contaCaixaId === this.contaCaixa!.id);
        if (saldoConta) {
          this.saldoAtual = saldoConta.saldoAtual;
          this.contaCaixa!.saldoAtual = saldoConta.saldoAtual;
          this.calcularSaldoAposSangria();
        }
      },
      error: (err) => {
        console.error('Erro ao atualizar saldo:', err);
      }
    });
  }

  limparFormulario(): void {
    this.valor = null;
    this.descricao = '';
    this.numeroDocumento = '';
    this.observacoes = '';
    this.erro = null;

    this.dataMovimentacao = this.obterDataLocal();

    // Reselecionar tipo padrão
    const despesasOperacionais = this.tiposMovimentacao.find(t => t.id === 6);
    if (despesasOperacionais) {
      this.tipoMovimentacaoId = despesasOperacionais.id;
    }

    // Recalcular saldo
    this.calcularSaldoAposSangria();
  }

  voltarParaHome(): void {
    this.router.navigate(['/caixa']);
  }
}
