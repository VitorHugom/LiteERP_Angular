import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ContasPagarService } from '../../services/contas-pagar.service';
import { FornecedoresService } from '../../services/fornecedores.service';
import { TiposCobrancaService } from '../../services/tipos-cobranca.service';
import { FormaPagamentoService } from '../../services/forma-pagamento.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NavigateToSearchButtonComponent } from '../shared/navigate-to-search-button/navigate-to-search-button.component';

@Component({
  selector: 'app-cadastro-contas-pagar',
  standalone: true,
  templateUrl: './contas-pagar-cadastro.component.html',
  styleUrls: ['./contas-pagar-cadastro.component.scss'],
  imports: [CommonModule, FormsModule,NavigateToSearchButtonComponent]
})
export class ContasPagarCadastroComponent implements OnInit {
  isNew = true;
  contasPagar: any = {
    id: null,
    numeroDocumento: '',
    fornecedor: null,
    dataVencimento: '',
    tipoCobranca: null,
    formaPagamento: null,
    valorTotal: 0,
    valorParcela: 0,
    parcela: 1,
  };

  fornecedorInput = '';
  fornecedores: any[] = [];
  tiposCobranca: any[] = [];
  formasPagamento: any[] = [];
  message: string | null = null;
  isSuccess: boolean = true;

  showFornecedoresList = false;
  currentPageFornecedores = 0;
  pageSize = 5;
  loadingFornecedores = false;

  urlContasPagarBusca = '/contas-pagar-busca'

  constructor(
    private contasPagarService: ContasPagarService,
    private fornecedoresService: FornecedoresService,
    private tiposCobrancaService: TiposCobrancaService,
    private formaPagamentoService: FormaPagamentoService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'novo') {
      this.isNew = false;
      this.carregarContaPagar(Number(id));
    } else {
      this.loadTiposCobranca();
      this.loadFormasPagamento();
      this.contasPagar.status = 'aberta'
    }
  }

  carregarContaPagar(id: number): void {
    this.contasPagarService.getContaPagarById(id).subscribe({
      next: (data) => {
        this.contasPagar = data;
        this.fornecedorInput = data.fornecedor?.razaoSocial || '';
        this.loadTiposCobranca();
        this.loadFormasPagamento();
      },
      error: (err) => console.error('Erro ao carregar conta a pagar:', err),
    });
  }

  loadTiposCobranca(): void {
    this.tiposCobrancaService.getTiposCobranca().subscribe({
      next: (data) => {
        this.tiposCobranca = data;
        console.log("Carregado")
        this.matchTipoCobranca();
      },
      error: (err) => console.error('Erro ao carregar tipos de cobrança:', err)
    });
  }

  matchTipoCobranca(): void {
    console.log('matchTipoCobranca', this.tiposCobranca, ' - ', this.contasPagar.tipoCobranca)
    const tipoEncontrado = this.tiposCobranca.find(tipo => tipo.id === this.contasPagar.tipoCobranca?.id);
    this.contasPagar.tipoCobranca = tipoEncontrado || null;
  }

  loadFormasPagamento(): void {
    this.formaPagamentoService.getFormasPagamento().subscribe({
      next: (data) => {
        this.formasPagamento = data;
        this.matchFormaPagamento();
      },
      error: (err) => console.error('Erro ao carregar formas de pagamento:', err)
    });
  }

  matchFormaPagamento(): void {
    const formaEncontrada = this.formasPagamento.find(forma => forma.id === this.contasPagar.formaPagamento?.id);
    this.contasPagar.formaPagamento = formaEncontrada || null;
  }

  // Buscar fornecedores com pesquisa
  onSearchFornecedores(event: Event): void {
    const inputValue = (event.target as HTMLInputElement).value;
    if (inputValue.length >= 2) {
      this.fornecedorInput = inputValue;
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
        this.fornecedores = response;
        this.showFornecedoresList = this.fornecedores.length > 0;
        this.loadingFornecedores = false;
      },
      error: (err) => {
        console.error('Erro ao buscar fornecedores:', err);
        this.loadingFornecedores = false;
      }
    });
  }

  onSelectFornecedor(fornecedor: any): void {
    this.contasPagar.fornecedor = fornecedor;
    this.fornecedorInput = fornecedor.razaoSocial || fornecedor.nomeFantasia;
    this.showFornecedoresList = false;
  }

  onSave(): void {
    if (!this.contasPagar.fornecedor || !this.contasPagar.tipoCobranca || !this.contasPagar.dataVencimento) {
      this.exibirMensagem('Preencha todos os campos obrigatórios.', false);
      return;
    }

    const contaPagarPayload = {
      numeroDocumento: this.contasPagar.numeroDocumento,
      fornecedorId: this.contasPagar.fornecedor.id,
      dataVencimento: this.contasPagar.dataVencimento,
      tipoCobrancaId: this.contasPagar.tipoCobranca.id,
      formaPagamentoId: this.contasPagar.formaPagamento.id,
      valorTotal: this.contasPagar.valorTotal,
      valorParcela: this.contasPagar.valorParcela,
      parcela: this.contasPagar.parcela,
      status: this.contasPagar.status,
    };

    if (this.isNew) {
      this.contasPagarService.createContaPagar(contaPagarPayload).subscribe({
        next: () => this.exibirMensagem('Conta a pagar cadastrada com sucesso!', true),
        error: () => this.exibirMensagem('Erro ao cadastrar conta a pagar.', false),
      });
    } else {
      this.contasPagarService.updateContaPagar(this.contasPagar.id, contaPagarPayload).subscribe({
        next: () => this.exibirMensagem('Conta a pagar atualizada com sucesso!', true),
        error: () => this.exibirMensagem('Erro ao atualizar conta a pagar.', false),
      });
    }
  }

  exibirMensagem(mensagem: string, isSuccess: boolean): void {
    this.message = mensagem;
    this.isSuccess = isSuccess;
    setTimeout(() => this.message = null, 3000);
  }

  onConsultar(): void {
    this.router.navigate(['/contas-pagar-busca']);
  }

  alterarStatus(): void {
    if (this.contasPagar.status === 'aberta') {
      this.contasPagar.status = 'paga';
    } else {
      this.contasPagar.status = 'aberta';
    }
  }

}
