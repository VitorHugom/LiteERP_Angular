import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ContasReceberService } from '../../services/contas-receber.service';
import { ClientesService } from '../../services/clientes.service';
import { TiposCobrancaService } from '../../services/tipos-cobranca.service';
import { FormaPagamentoService } from '../../services/forma-pagamento.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NavigateToSearchButtonComponent } from '../shared/navigate-to-search-button/navigate-to-search-button.component';

@Component({
  selector: 'app-cadastro-contas-receber',
  standalone: true,
  templateUrl: './contas-receber-cadastro.component.html',
  styleUrls: ['./contas-receber-cadastro.component.scss'],
  imports: [CommonModule, FormsModule, NavigateToSearchButtonComponent]
})
export class ContasReceberCadastroComponent implements OnInit {
  isNew = true;
  contasReceber: any = {
    id: null,
    numeroDocumento: '',
    cliente: null,
    dataVencimento: '',
    tipoCobranca: null,
    formaPagamento: null,
    valorTotal: 0,
    valorParcela: 0,
    parcela: 1,
    status: 'aberta'
  };

  clienteInput = '';
  clientes: any[] = [];
  tiposCobranca: any[] = [];
  formasPagamento: any[] = [];
  message: string | null = null;
  isSuccess = true;

  showClientesList = false;
  currentPageClientes = 0;
  pageSize = 5;

  urlContasReceberBusca = '/contas-receber-busca';

  constructor(
    private contasReceberService: ContasReceberService,
    private clientesService: ClientesService,
    private tiposCobrancaService: TiposCobrancaService,
    private formaPagamentoService: FormaPagamentoService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'novo') {
      this.isNew = false;
      this.carregarContaReceber(Number(id));
    } else {
      this.loadTiposCobranca();
      this.loadFormasPagamento();
    }
  }

  carregarContaReceber(id: number): void {
    this.contasReceberService.getContaReceberById(id).subscribe({
      next: data => {
        this.contasReceber = data;
        this.clienteInput = data.cliente?.razaoSocial || '';
        this.loadTiposCobranca();
        this.loadFormasPagamento();
      },
      error: err => console.error('Erro ao carregar conta a receber:', err)
    });
  }

  loadTiposCobranca(): void {
    this.tiposCobrancaService.getTiposCobranca().subscribe({
      next: data => {
        this.tiposCobranca = data;
        this.matchTipoCobranca();
      },
      error: err => console.error('Erro ao carregar tipos de cobrança:', err)
    });
  }

  matchTipoCobranca(): void {
    const tipo = this.tiposCobranca.find(t => t.id === this.contasReceber.tipoCobranca?.id);
    this.contasReceber.tipoCobranca = tipo || null;
  }

  loadFormasPagamento(): void {
    this.formaPagamentoService.getFormasPagamento().subscribe({
      next: data => {
        this.formasPagamento = data;
        this.matchFormaPagamento();
      },
      error: err => console.error('Erro ao carregar formas de pagamento:', err)
    });
  }

  matchFormaPagamento(): void {
    const forma = this.formasPagamento.find(f => f.id === this.contasReceber.formaPagamento?.id);
    this.contasReceber.formaPagamento = forma || null;
  }

  onSearchClientes(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    if (val.length >= 2) {
      this.clienteInput = val;
      this.currentPageClientes = 0;
      this.searchClientes();
    } else {
      this.clientes = [];
      this.showClientesList = false;
    }
  }

  searchClientes(): void {
    this.clientesService.searchClientes(this.clienteInput, this.currentPageClientes, this.pageSize).subscribe({
      next: res => {
        this.clientes = res;
        this.showClientesList = this.clientes.length > 0;
      },
      error: err => console.error('Erro ao buscar clientes:', err)
    });
  }

  onSelectCliente(cliente: any): void {
    this.contasReceber.cliente = cliente;
    this.clienteInput = cliente.razaoSocial || cliente.nomeFantasia;
    this.showClientesList = false;
  }

  onSave(): void {
    if (!this.contasReceber.cliente || !this.contasReceber.tipoCobranca || !this.contasReceber.dataVencimento) {
      this.exibirMensagem('Preencha todos os campos obrigatórios.', false);
      return;
    }

    const payload = {
      idCliente: this.contasReceber.cliente.id,
      numeroDocumento: this.contasReceber.numeroDocumento,
      parcela: this.contasReceber.parcela,
      valorParcela: this.contasReceber.valorParcela,
      valorTotal: this.contasReceber.valorTotal,
      idFormaPagamento: this.contasReceber.formaPagamento.id,
      idTipoCobranca: this.contasReceber.tipoCobranca.id,
      dataVencimento: this.contasReceber.dataVencimento,
      status: this.contasReceber.status
    };

    const request$ = this.isNew
      ? this.contasReceberService.createContaReceber(payload)
      : this.contasReceberService.updateContaReceber(this.contasReceber.id, payload);

    request$.subscribe({
      next: () => this.exibirMensagem(`Conta a receber ${this.isNew ? 'cadastrada' : 'atualizada'} com sucesso!`, true),
      error: () => this.exibirMensagem(`Erro ao ${this.isNew ? 'cadastrar' : 'atualizar'} conta a receber.`, false)
    });
  }

  alterarStatus(): void {
    this.contasReceber.status = this.contasReceber.status === 'aberta' ? 'paga' : 'aberta';
  }

  onConsultar(): void {
    this.router.navigate([this.urlContasReceberBusca]);
  }

  exibirMensagem(msg: string, success: boolean): void {
    this.message = msg;
    this.isSuccess = success;
    setTimeout(() => this.message = null, 3000);
  }
}
