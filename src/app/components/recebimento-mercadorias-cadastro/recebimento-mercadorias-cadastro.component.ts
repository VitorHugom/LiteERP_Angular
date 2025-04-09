import { Component, OnInit } from '@angular/core';
import { RecebimentoMercadoriasService } from '../../services/recebimento-mercadorias.service';
import { FornecedoresService } from '../../services/fornecedores.service';
import { TiposCobrancaService } from '../../services/tipos-cobranca.service';
import { FormaPagamentoService } from '../../services/forma-pagamento.service';
import { ProdutosService } from '../../services/produtos.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { AddItemRecebimentoModalComponent } from '../add-item-recebimento-modal/add-item-recebimento-modal.component';
import { NavigateToSearchButtonComponent } from '../shared/navigate-to-search-button/navigate-to-search-button.component';

@Component({
  selector: 'app-cadastro-recebimento',
  standalone: true,
  templateUrl: './recebimento-mercadorias-cadastro.component.html',
  styleUrls: ['./recebimento-mercadorias-cadastro.component.scss'],
  imports: [CommonModule, FormsModule,NavigateToSearchButtonComponent]
})
export class RecebimentoMercadoriasCadastroComponent implements OnInit {
  isNew = true;
  recebimento: any = {
    id: null,
    fornecedor: null,
    dataRecebimento: '',
    tipoCobranca: null,
    itensRecebimento: []
  };

  urlRecibementoMercadoriaBusca = '/recebimento-mercadorias-busca'

  activeTab: string = 'geral';

  fornecedores: any[] = [];
  tiposCobranca: any[] = [];
  formasPagamento: any[] = [];
  produtos: any[] = [];
  valorTotal: number = 0;

  fornecedorInput = '';
  produtoInput = '';
  message: string | null = null;
  isSuccess: boolean = true;

  showFornecedoresList = false;
  showProdutosList = false;
  currentPageFornecedores = 0;
  pageSize = 5;
  loadingFornecedores = false;

  constructor(
    private recebimentoService: RecebimentoMercadoriasService,
    private fornecedoresService: FornecedoresService,
    private tiposCobrancaService: TiposCobrancaService,
    private formaPagamentoService: FormaPagamentoService,
    private produtosService: ProdutosService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog
  ) {}

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'novo') {
      this.isNew = false;
      this.recebimentoService.getRecebimentoById(Number(id)).subscribe({
        next: (data) => {
          this.recebimento = data;
          this.fornecedorInput = this.recebimento.fornecedor.razaoSocial;
          this.loadTiposCobranca();
          this.loadFormasPagamento();
          this.calculaValorTotal();
        },
        error: (err) => console.error('Erro ao carregar recebimento:', err)
      });
    }else {
      // Define a data atual para novos recebimentos
      this.recebimento.dataRecebimento = new Date().toISOString().split('T')[0];
      this.loadTiposCobranca();
      this.loadFormasPagamento();
    }
  }

  // Carregar tipos de cobrança
  matchTipoCobranca(): void {
    console.log('matchTipoCobranca', this.tiposCobranca, ' - ', this.recebimento.tipoCobranca)
    const tipoEncontrado = this.tiposCobranca.find(tipo => tipo.id === this.recebimento.tipoCobranca?.id);
    this.recebimento.tipoCobranca = tipoEncontrado || null;
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
    const formaEncontrada = this.formasPagamento.find(forma => forma.id === this.recebimento.formaPagamento?.id);
    this.recebimento.formaPagamento = formaEncontrada || null;
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
    this.recebimento.fornecedor = fornecedor;
    this.fornecedorInput = fornecedor.razaoSocial || fornecedor.nomeFantasia;
    this.showFornecedoresList = false;
  }

  // Buscar produtos com pesquisa
  onSearchProdutos(event: Event): void {
    const inputValue = (event.target as HTMLInputElement).value;
    if (inputValue.length >= 2) {
      this.produtoInput = inputValue;
      this.produtosService.searchProdutos(this.produtoInput, 0, this.pageSize).subscribe({
        next: (response) => {
          this.produtos = response;
          this.showProdutosList = this.produtos.length > 0;
        },
        error: (err) => console.error('Erro ao buscar produtos:', err)
      });
    } else {
      this.produtos = [];
      this.showProdutosList = false;
    }
  }

  // Adicionar item ao recebimento via modal
  onSelectProduto(produto: any): void {
    // Limpar o campo de busca e esconder a lista de produtos
    this.produtoInput = '';
    this.showProdutosList = false;


    const dialogRef = this.dialog.open(AddItemRecebimentoModalComponent, {
      width: '500px',
      data: { produto: { ...produto, precoCompra: produto.precoCompra } }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.recebimento.itensRecebimento.push({
          produto: result.produto,
          quantidade: result.quantidade,
          valorUnitario: result.valorUnitario ?? result.produto.valorUnitario
        });
        this.calculaValorTotal();
      }
    });
  }

  // Editar item existente via modal
  onEditItem(index: number): void {
    const item = this.recebimento.itensRecebimento[index];
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '500px';
    dialogConfig.data = { ...item };

    const dialogRef = this.dialog.open(AddItemRecebimentoModalComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(updatedItem => {
      if (updatedItem) {
        this.recebimento.itensRecebimento[index] = updatedItem;
        this.calculaValorTotal();
      }
    });
  }

  // Excluir item
  onDeleteItem(index: number): void {
    this.recebimento.itensRecebimento.splice(index, 1);
    this.calculaValorTotal();
  }

  // Salvar ou atualizar recebimento
  onSave(): void {
    if (!this.recebimento.fornecedor || !this.recebimento.tipoCobranca || !this.recebimento.dataRecebimento) {
      this.exibirMensagem('Preencha todos os campos obrigatórios.', false);
      return;
    }

    const recebimentoPayload = {
      idFornecedor: this.recebimento.fornecedor.id,
      dataRecebimento: this.recebimento.dataRecebimento,
      idTipoCobranca: this.recebimento.tipoCobranca.id,
      idFormaPagamento: this.recebimento.formaPagamento.id,
      itens: this.recebimento.itensRecebimento.map((item: any) => ({
        idProduto: item.produto.id,
        quantidade: item.quantidade,
        valorUnitario: item.valorUnitario
      }))
    };

    if (this.isNew) {
      this.recebimentoService.createRecebimento(recebimentoPayload).subscribe({
        next: (response) => {
          this.exibirMensagem('Recebimento cadastrado com sucesso!', true);
          this.isNew = false;
          this.router.navigate(['/recebimento-mercadorias-cadastro/' + response.id]);
          this.recebimento.id = response.id;
        },
        error: () => this.exibirMensagem('Erro ao cadastrar recebimento.', false)
      });
    } else {
      this.recebimentoService.updateRecebimento(this.recebimento.id, recebimentoPayload).subscribe({
        next: () => this.exibirMensagem('Recebimento atualizado com sucesso!', true),
        error: () => this.exibirMensagem('Erro ao atualizar recebimento.', false)
      });
    }
  }

  // Exibir mensagem de sucesso ou erro
  exibirMensagem(mensagem: string, isSuccess: boolean): void {
    this.message = mensagem;
    this.isSuccess = isSuccess;
    setTimeout(() => this.message = null, 3000);
  }

  // Criar um novo recebimento
  onNew(): void {
    this.isNew = true;
    this.recebimento = {
      id: null,
      fornecedor: null,
      dataRecebimento: '',
      tipoCobranca: null,
      itensRecebimento: []
    };
    this.fornecedorInput = '';
    this.produtoInput = '';
    this.message = null;
    this.isSuccess = true;

    this.router.navigate(['/recebimento-mercadorias-cadastro/novo']);
  }

  // Excluir recebimento
  onDelete(): void {
    if (!this.isNew) {
      this.recebimentoService.deleteRecebimento(this.recebimento.id).subscribe({
        next: () => {
          this.exibirMensagem('Recebimento excluído com sucesso!', true);
          this.router.navigate(['/recebimento-mercadorias-busca']);
        },
        error: (err) => {
          this.exibirMensagem('Erro ao excluir recebimento.', false);
          console.error('Erro ao excluir recebimento:', err);
        }
      });
    }
  }

  onConsultar(): void {
    this.router.navigate(['/recebimento-mercadorias-busca']);
  }

  calculaValorTotal(): void {
    this.valorTotal = this.recebimento.itensRecebimento.reduce((acc: number, item: { quantidade: number; valorUnitario?: number; produto?: { valorUnitario: number } }) => {
      const valorUnitario = item.produto?.valorUnitario || item.valorUnitario || 0;
      return acc + (item.quantidade * valorUnitario);
    }, 0);
  }

  atualizarValorTotal(): void {
    this.valorTotal = this.recebimento.itensRecebimento.reduce((total: number, item: { quantidade: number, produto: { valorUnitario: number } }) => {
      return total + (item.quantidade * item.produto.valorUnitario);
    }, 0);
  }
}
