import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { NavigateToSearchButtonComponent } from '../shared/navigate-to-search-button/navigate-to-search-button.component';
import { FornecedoresService } from '../../services/fornecedores.service';
import { ContasPagarService } from '../../services/contas-pagar.service';

@Component({
  selector: 'app-pagamentos',
  standalone: true,
  imports: [CommonModule, FormsModule, NavigateToSearchButtonComponent],
  templateUrl: './pagamentos.component.html',
  styleUrls: ['./pagamentos.component.scss']
})
export class PagamentosComponent implements OnInit {
  // Busca de fornecedores
  fornecedorInput = '';
  fornecedores: any[] = [];
  showFornecedoresList = false;
  loadingFornecedores = false;
  currentPageFornecedores = 0;
  pageSize = 10;

  // Fornecedor selecionado
  fornecedorSelecionado: any = null;

  // Modal de contas a pagar
  modalContasVisible = false;
  contasPagar: any[] = [];
  loadingContas = false;
  erroContas: string | null = null;

  // Paginação do modal
  currentPageContas = 0;
  totalPagesContas = 0;
  totalElementsContas = 0;
  pageSizeContas = 10;

  // Seleção de contas para pagamento
  contasSelecionadas: Set<number> = new Set();
  contasParaPagamento: any[] = [];
  processandoPagamento = false;

  urlHome = '/gerencial';

  constructor(
    private fornecedoresService: FornecedoresService,
    private contasPagarService: ContasPagarService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Componente inicializado
  }

  // Busca de fornecedores
  onSearchFornecedores(event: Event): void {
    const inputValue = (event.target as HTMLInputElement).value;
    this.fornecedorInput = inputValue;
    
    if (inputValue.length >= 2) {
      this.currentPageFornecedores = 0;
      this.searchFornecedoresLazy();
    } else {
      this.fornecedores = [];
      this.showFornecedoresList = false;
    }
  }

  searchFornecedoresLazy(): void {
    this.loadingFornecedores = true;

    this.fornecedoresService.searchFornecedores(this.fornecedorInput, this.currentPageFornecedores, this.pageSize).subscribe({
      next: (response) => {
        if (Array.isArray(response)) {
          if (this.currentPageFornecedores === 0) {
            this.fornecedores = response;
          } else {
            this.fornecedores = [...this.fornecedores, ...response];
          }
          this.showFornecedoresList = true;
        } else {
          this.fornecedores = [];
        }
        this.loadingFornecedores = false;
      },
      error: (err) => {
        console.error('Erro ao buscar fornecedores:', err);
        this.loadingFornecedores = false;
        this.fornecedores = [];
        this.showFornecedoresList = false;
      }
    });
  }

  onSelectFornecedor(fornecedor: any): void {
    this.fornecedorSelecionado = fornecedor;
    this.fornecedorInput = fornecedor.razaoSocial || fornecedor.nomeFantasia;
    this.showFornecedoresList = false;
    
    // Buscar contas a pagar do fornecedor
    this.buscarContasPagar();
  }

  // Busca de contas a pagar
  buscarContasPagar(): void {
    if (!this.fornecedorSelecionado) return;

    this.loadingContas = true;
    this.erroContas = null;
    this.modalContasVisible = true;

    this.contasPagarService.buscarContasPagarPorFornecedor(
      this.fornecedorSelecionado.id,
      this.currentPageContas,
      this.pageSizeContas,
      'dataVencimento,asc'
    ).subscribe({
      next: (response) => {
        this.contasPagar = response.content || [];
        this.totalPagesContas = response.totalPages || 0;
        this.totalElementsContas = response.totalElements || 0;
        this.loadingContas = false;
      },
      error: (error) => {
        console.error('Erro ao buscar contas a pagar:', error);
        this.erroContas = 'Erro ao carregar contas a pagar do fornecedor.';
        this.loadingContas = false;
        this.contasPagar = [];
      }
    });
  }

  // Paginação do modal
  goToPageContas(page: number): void {
    if (page >= 0 && page < this.totalPagesContas) {
      this.currentPageContas = page;
      this.buscarContasPagar();
    }
  }

  // Modal
  fecharModal(): void {
    this.modalContasVisible = false;
    this.currentPageContas = 0;
    this.contasPagar = [];
    this.contasSelecionadas.clear();
  }

  recarregarContas(): void {
    this.currentPageContas = 0;
    this.buscarContasPagar();
  }

  // Seleção de contas
  toggleContaSelecionada(contaId: number): void {
    if (this.contasSelecionadas.has(contaId)) {
      this.contasSelecionadas.delete(contaId);
    } else {
      this.contasSelecionadas.add(contaId);
    }
  }

  isContaSelecionada(contaId: number): boolean {
    return this.contasSelecionadas.has(contaId);
  }

  selecionarTodasContas(): void {
    if (this.todasContasSelecionadas()) {
      // Desmarcar todas
      this.contasPagar.forEach(conta => {
        this.contasSelecionadas.delete(conta.id);
      });
    } else {
      // Marcar todas
      this.contasPagar.forEach(conta => {
        this.contasSelecionadas.add(conta.id);
      });
    }
  }

  todasContasSelecionadas(): boolean {
    return this.contasPagar.length > 0 && 
           this.contasPagar.every(conta => this.contasSelecionadas.has(conta.id));
  }

  algumContaSelecionada(): boolean {
    return this.contasSelecionadas.size > 0;
  }

  adicionarContasParaPagamento(): void {
    const contasSelecionadasArray = this.contasPagar.filter(conta => 
      this.contasSelecionadas.has(conta.id)
    );

    // Adicionar apenas contas que não estão já na lista
    contasSelecionadasArray.forEach(conta => {
      const jaExiste = this.contasParaPagamento.some(c => c.id === conta.id);
      if (!jaExiste) {
        this.contasParaPagamento.push({...conta});
      }
    });

    // Limpar seleção e fechar modal
    this.contasSelecionadas.clear();
    this.fecharModal();
  }

  // Navegação
  navigateToHome(): void {
    this.router.navigate(['/gerencial']);
  }

  // Limpar busca
  limparBusca(): void {
    this.fornecedorInput = '';
    this.fornecedorSelecionado = null;
    this.fornecedores = [];
    this.showFornecedoresList = false;
    this.fecharModal();
  }

  // Gerenciar lista de pagamentos
  removerContaPagamento(contaId: number): void {
    this.contasParaPagamento = this.contasParaPagamento.filter(conta => conta.id !== contaId);
  }

  limparListaPagamentos(): void {
    this.contasParaPagamento = [];
  }

  realizarPagamento(): void {
    if (this.contasParaPagamento.length === 0) return;

    this.processandoPagamento = true;
    
    // Criar array de observables para processar cada conta individualmente
    const pagamentoObservables = this.contasParaPagamento.map(conta => 
      this.contasPagarService.realizarPagamentoConta(conta.id)
    );
    
    // Usar forkJoin para executar todas as chamadas em paralelo
    forkJoin(pagamentoObservables).subscribe({
      next: (responses) => {
        console.log('Pagamentos realizados com sucesso:', responses);
        
        // Atualizar status das contas para "PAGA"
        this.contasParaPagamento.forEach(conta => {
          conta.status = 'PAGA';
        });
        
        // Limpar lista após o pagamento
        this.contasParaPagamento = [];
        this.processandoPagamento = false;
        
        alert(`Pagamento realizado com sucesso! ${responses.length} conta(s) processada(s).`);
      },
      error: (error) => {
        console.error('Erro ao realizar pagamento:', error);
        this.processandoPagamento = false;
        alert('Erro ao realizar pagamento. Algumas contas podem não ter sido processadas.');
      }
    });
  }

  calcularTotalPagamentos(): number {
    return this.contasParaPagamento.reduce((total, conta) => total + (conta.valorParcela || 0), 0);
  }

  // Formatação
  formatarData(data: string): string {
    if (!data) return '';
    try {
      const date = new Date(data);
      return date.toLocaleDateString('pt-BR');
    } catch {
      return data;
    }
  }

  formatarValor(valor: number): string {
    if (valor == null) return 'R$ 0,00';
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }
}
