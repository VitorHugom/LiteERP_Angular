import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { NavigateToSearchButtonComponent } from '../shared/navigate-to-search-button/navigate-to-search-button.component';
import { ClientesService } from '../../services/clientes.service';
import { ContasReceberService } from '../../services/contas-receber.service';

@Component({
  selector: 'app-recebimento',
  standalone: true,
  imports: [CommonModule, FormsModule, NavigateToSearchButtonComponent],
  templateUrl: './recebimento.component.html',
  styleUrls: ['./recebimento.component.scss']
})
export class RecebimentoComponent implements OnInit {
  clienteInput = '';
  clientes: any[] = [];
  showClientesList = false;
  loadingClientes = false;
  currentPageClientes = 0;
  pageSize = 10;

  clienteSelecionado: any = null;

  modalContasVisible = false;
  contasReceber: any[] = [];
  loadingContas = false;
  erroContas: string | null = null;

  currentPageContas = 0;
  totalPagesContas = 0;
  totalElementsContas = 0;
  pageSizeContas = 10;

  contasSelecionadas: Set<number> = new Set();
  contasParaRecebimento: any[] = [];
  processandoRecebimento = false;

  urlHome = '/gerencial';

  constructor(
    private clientesService: ClientesService,
    private contasReceberService: ContasReceberService,
    private router: Router
  ) {}

  ngOnInit(): void {
  }

  onSearchClientes(event: Event): void {
    const inputValue = (event.target as HTMLInputElement).value;
    this.clienteInput = inputValue;
    
    if (inputValue.length >= 2) {
      this.currentPageClientes = 0;
      this.searchClientesLazy();
    } else {
      this.clientes = [];
      this.showClientesList = false;
    }
  }

  searchClientesLazy(): void {
    this.loadingClientes = true;

    this.clientesService.searchClientes(this.clienteInput, this.currentPageClientes, this.pageSize).subscribe({
      next: (response) => {
        if (Array.isArray(response)) {
          if (this.currentPageClientes === 0) {
            this.clientes = response;
          } else {
            this.clientes = [...this.clientes, ...response];
          }
          this.showClientesList = true;
        } else {
          this.clientes = [];
        }
        this.loadingClientes = false;
      },
      error: (err) => {
        console.error('Erro ao buscar clientes:', err);
        this.loadingClientes = false;
        this.clientes = [];
        this.showClientesList = false;
      }
    });
  }

  onSelectCliente(cliente: any): void {
    this.clienteSelecionado = cliente;
    this.clienteInput = cliente.razaoSocial || cliente.nomeFantasia;
    this.showClientesList = false;
    
    this.buscarContasReceber();
  }

  buscarContasReceber(): void {
    if (!this.clienteSelecionado) return;

    this.loadingContas = true;
    this.erroContas = null;
    this.modalContasVisible = true;

    this.contasReceberService.buscarContasReceberPorCliente(
      this.clienteSelecionado.id,
      this.currentPageContas,
      this.pageSizeContas,
      'dataVencimento,asc'
    ).subscribe({
      next: (response) => {
        this.contasReceber = response.content || [];
        this.totalPagesContas = response.totalPages || 0;
        this.totalElementsContas = response.totalElements || 0;
        this.loadingContas = false;
      },
      error: (error) => {
        console.error('Erro ao buscar contas a receber:', error);
        this.erroContas = 'Erro ao carregar contas a receber do cliente.';
        this.loadingContas = false;
        this.contasReceber = [];
      }
    });
  }

  goToPageContas(page: number): void {
    if (page >= 0 && page < this.totalPagesContas) {
      this.currentPageContas = page;
      this.buscarContasReceber();
    }
  }

  fecharModal(): void {
    this.modalContasVisible = false;
    this.currentPageContas = 0;
    this.contasReceber = [];
    this.contasSelecionadas.clear();
  }

  recarregarContas(): void {
    this.currentPageContas = 0;
    this.buscarContasReceber();
  }

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
      this.contasReceber.forEach(conta => {
        this.contasSelecionadas.delete(conta.id);
      });
    } else {
      this.contasReceber.forEach(conta => {
        this.contasSelecionadas.add(conta.id);
      });
    }
  }

  todasContasSelecionadas(): boolean {
    return this.contasReceber.length > 0 &&
           this.contasReceber.every(conta => this.contasSelecionadas.has(conta.id));
  }

  algumContaSelecionada(): boolean {
    return this.contasSelecionadas.size > 0;
  }

  adicionarContasParaRecebimento(): void {
    const contasSelecionadasArray = this.contasReceber.filter(conta =>
      this.contasSelecionadas.has(conta.id)
    );

    contasSelecionadasArray.forEach(conta => {
      const jaExiste = this.contasParaRecebimento.some(c => c.id === conta.id);
      if (!jaExiste) {
        this.contasParaRecebimento.push({...conta});
      }
    });

    this.contasSelecionadas.clear();
    this.fecharModal();
  }

  navigateToHome(): void {
    this.router.navigate(['/gerencial']);
  }

  limparBusca(): void {
    this.clienteInput = '';
    this.clienteSelecionado = null;
    this.clientes = [];
    this.showClientesList = false;
    this.fecharModal();
  }

  removerContaRecebimento(contaId: number): void {
    this.contasParaRecebimento = this.contasParaRecebimento.filter(conta => conta.id !== contaId);
  }

  limparListaRecebimentos(): void {
    this.contasParaRecebimento = [];
  }

  realizarRecebimento(): void {
    if (this.contasParaRecebimento.length === 0) return;

    this.processandoRecebimento = true;

    const recebimentoObservables = this.contasParaRecebimento.map(conta =>
      this.contasReceberService.realizarRecebimentoConta(conta.id)
    );

    forkJoin(recebimentoObservables).subscribe({
      next: (responses) => {
        console.log('Recebimentos realizados com sucesso:', responses);

        this.contasParaRecebimento.forEach(conta => {
          conta.status = 'PAGA';
        });

        this.contasParaRecebimento = [];
        this.processandoRecebimento = false;

        alert(`Recebimento realizado com sucesso! ${responses.length} conta(s) processada(s).`);
      },
      error: (error) => {
        console.error('Erro ao realizar recebimento:', error);
        this.processandoRecebimento = false;
        alert('Erro ao realizar recebimento. Algumas contas podem não ter sido processadas.');
      }
    });
  }

  calcularTotalRecebimentos(): number {
    return this.contasParaRecebimento.reduce((total, conta) => total + (conta.valorParcela || 0), 0);
  }

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
