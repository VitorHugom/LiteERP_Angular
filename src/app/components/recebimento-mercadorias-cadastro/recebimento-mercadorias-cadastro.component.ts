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
import { FooterButtonComponent } from '../shared/footer-button/footer-button.component';
import { UploadXmlResponse, ItemRecebimentoXml, DadosNfe, FornecedorNfe } from '../../models/upload-xml.models';
import { SelecionarProdutoModalComponent } from '../selecionar-produto-modal/selecionar-produto-modal.component';
@Component({
  selector: 'app-cadastro-recebimento',
  standalone: true,
  templateUrl: './recebimento-mercadorias-cadastro.component.html',
  styleUrls: ['./recebimento-mercadorias-cadastro.component.scss'],
  imports: [CommonModule, FormsModule,NavigateToSearchButtonComponent,FooterButtonComponent]
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

  // Propriedades para upload de XML
  dadosNfe: DadosNfe | null = null;
  fornecedorNfe: FornecedorNfe | null = null;
  itensXml: ItemRecebimentoXml[] = [];
  uploadedFile: File | null = null;
  isProcessingXml = false;
  xmlProcessed = false;

  buttons = [
    { text: 'Novo', color: 'novo-button', type: 'button', event: 'novo' },
    { text: 'Gravar', color: 'gravar-button', type: 'submit', event: 'gravar' },
    { text: 'Deletar', color: 'deletar-button', type: 'button', event: 'deletar' },
    { text: 'Consultar', color: 'consultar-button', type: 'button', event: 'consultar' },
  ]

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

  // Método para tratar eventos dos botões
  tratarEvento(evento: string) {
    if (evento === 'novo') {
      this.onNew();
    } else if (evento === 'gravar') {
      this.onSave();
    } else if (evento === 'deletar') {
      this.onDelete();
    }else if (evento === 'consultar') {
      this.onConsultar();

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

    // Limpar dados do XML
    this.dadosNfe = null;
    this.fornecedorNfe = null;
    this.itensXml = [];
    this.uploadedFile = null;
    this.xmlProcessed = false;
    this.isProcessingXml = false;

    // Limpar dados de busca do XML
    this.produtoInputXml = {};
    this.produtosXml = {};
    this.showProdutosListXml = {};
    this.itemVinculandoAtual = null;

    this.router.navigate(['/recebimento-mercadorias-cadastro/novo']);
  }

  // Upload do arquivo XML
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.uploadedFile = file;
      this.processarXmlNfe(file);
    }
  }

  // Processar XML da NFe
  processarXmlNfe(file: File): void {
    this.isProcessingXml = true;
    this.exibirMensagem('Processando XML da NFe...', true);

    this.recebimentoService.uploadXmlNfe(file).subscribe({
      next: (response: UploadXmlResponse) => {
        this.dadosNfe = response.dadosNfe;
        this.fornecedorNfe = response.fornecedor;
        this.itensXml = response.itens.map(item => ({
          ...item,
          editandoPreco: false,
          precoEditado: item.valorUnitario,
          mostrarSugestoes: !item.produtoVinculado
        }));

        // Preencher dados do recebimento com base no XML
        this.preencherDadosRecebimento(response);

        this.xmlProcessed = true;
        this.isProcessingXml = false;
        this.exibirMensagem(response.mensagem, true);
      },
      error: (error) => {
        this.isProcessingXml = false;
        this.exibirMensagem('Erro ao processar XML: ' + (error.error?.mensagem || 'Erro desconhecido'), false);
        console.error('Erro ao processar XML:', error);
      }
    });
  }

  // Preencher dados do recebimento com base no XML
  preencherDadosRecebimento(response: UploadXmlResponse): void {
    // Preencher data de recebimento com a data de emissão da NFe
    this.recebimento.dataRecebimento = response.dadosNfe.dataEmissao;

    // Se o fornecedor foi encontrado, selecioná-lo
    if (response.fornecedor.encontrado && response.fornecedor.idFornecedor) {
      this.recebimento.fornecedor = {
        id: response.fornecedor.idFornecedor,
        razaoSocial: response.fornecedor.razaoSocial,
        nomeFantasia: response.fornecedor.nomeFantasia
      };
      this.fornecedorInput = response.fornecedor.razaoSocial || response.fornecedor.nomeFantasia;
    } else {
      // Se não encontrou, mostrar alerta e limpar seleção
      this.exibirMensagem(`Fornecedor ${response.fornecedor.razaoSocial} não encontrado no sistema. Selecione manualmente.`, false);
      this.recebimento.fornecedor = null;
      this.fornecedorInput = '';
    }

    // Converter itens vinculados para o formato do recebimento
    this.recebimento.itensRecebimento = this.itensXml
      .filter(item => item.produtoVinculado)
      .map(item => ({
        produto: {
          id: item.idProdutoVinculado,
          descricao: item.descricaoProdutoVinculado
        },
        quantidade: item.quantidade,
        valorUnitario: item.valorUnitario
      }));

    this.calculaValorTotal();
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

  // Vincular produto a um item do XML
  vincularProdutoXml(item: ItemRecebimentoXml, produto: any): void {
    // Primeiro criar a vinculação produto-fornecedor
    const vinculacaoRequest = {
      idProduto: produto.id,
      idFornecedor: this.recebimento.fornecedor.id,
      codigoFornecedor: item.codigoProdutoFornecedor,
      ativo: true
    };

    this.recebimentoService.vincularProdutoFornecedor(vinculacaoRequest).subscribe({
      next: (response) => {
        // Após vincular, atualizar o item na lista
        const index = this.itensXml.findIndex((i: ItemRecebimentoXml) => i.numeroItem === item.numeroItem);
        if (index !== -1) {
          this.itensXml[index] = {
            ...item,
            produtoVinculado: true,
            idProdutoVinculado: produto.id,
            descricaoProdutoVinculado: produto.descricao,
            editandoPreco: false,
            precoEditado: item.valorUnitario,
            mostrarSugestoes: false
          };

          // Adicionar ao recebimento
          this.adicionarItemAoRecebimento(this.itensXml[index]);
          this.exibirMensagem('Produto vinculado com sucesso!', true);
        }
      },
      error: (error) => {
        console.error('Erro ao vincular produto:', error);
        this.exibirMensagem('Erro ao vincular produto', false);
      }
    });
  }

  // Adicionar item vinculado ao recebimento
  adicionarItemAoRecebimento(item: ItemRecebimentoXml): void {
    const itemRecebimento = {
      produto: {
        id: item.idProdutoVinculado,
        descricao: item.descricaoProdutoVinculado
      },
      quantidade: item.quantidade,
      valorUnitario: item.precoEditado || item.valorUnitario,
      codigoFornecedor: item.codigoProdutoFornecedor, // Adicionar código do fornecedor
      numeroItemXml: item.numeroItem // Adicionar referência ao item do XML
    };

    // Verificar se já existe no recebimento (mesmo produto E mesmo código do fornecedor)
    const existeIndex = this.recebimento.itensRecebimento.findIndex(
      (i: any) => i.produto.id === item.idProdutoVinculado &&
                  i.codigoFornecedor === item.codigoProdutoFornecedor
    );

    if (existeIndex !== -1) {
      // Se já existe o mesmo produto com o mesmo código do fornecedor, atualizar
      this.recebimento.itensRecebimento[existeIndex] = itemRecebimento;
    } else {
      // Se não existe ou é um código diferente do mesmo produto, adicionar novo item
      this.recebimento.itensRecebimento.push(itemRecebimento);
    }

    this.calculaValorTotal();
  }

  // Editar preço de um item do XML
  editarPrecoItemXml(item: ItemRecebimentoXml): void {
    item.editandoPreco = true;
  }

  // Salvar preço editado
  salvarPrecoEditado(item: ItemRecebimentoXml): void {
    if (item.precoEditado !== undefined && item.precoEditado > 0) {
      item.valorUnitario = item.precoEditado;
      item.valorTotal = item.quantidade * item.precoEditado;
      item.editandoPreco = false;

      // Se o item está vinculado, atualizar no recebimento também
      if (item.produtoVinculado) {
        this.adicionarItemAoRecebimento(item);
      }

      this.exibirMensagem('Preço atualizado com sucesso!', true);
    }
  }

  // Cancelar edição de preço
  cancelarEdicaoPreco(item: ItemRecebimentoXml): void {
    item.precoEditado = item.valorUnitario;
    item.editandoPreco = false;
  }

  // Mostrar/ocultar sugestões
  toggleSugestoes(item: ItemRecebimentoXml): void {
    item.mostrarSugestoes = !item.mostrarSugestoes;
  }

  // Selecionar sugestão
  selecionarSugestao(item: ItemRecebimentoXml, sugestao: any): void {
    this.vincularProdutoXml(item, sugestao);
  }

  // Propriedades para busca de produtos no XML
  produtoInputXml: { [key: number]: string } = {};
  produtosXml: { [key: number]: any[] } = {};
  showProdutosListXml: { [key: number]: boolean } = {};
  itemVinculandoAtual: ItemRecebimentoXml | null = null;

  // Buscar produtos para vincular (igual ao modo manual)
  onSearchProdutosXml(event: any, item: ItemRecebimentoXml): void {
    const query = event.target.value;
    this.produtoInputXml[item.numeroItem] = query;

    if (query.length >= 2) {
      this.produtosService.searchProdutosByDescCodEan(query, 0, 10).subscribe({
        next: (response) => {
          this.produtosXml[item.numeroItem] = response.content || [];
          this.showProdutosListXml[item.numeroItem] = this.produtosXml[item.numeroItem].length > 0;
        },
        error: (error) => {
          console.error('Erro ao buscar produtos:', error);
          this.produtosXml[item.numeroItem] = [];
          this.showProdutosListXml[item.numeroItem] = false;
        }
      });
    } else {
      this.produtosXml[item.numeroItem] = [];
      this.showProdutosListXml[item.numeroItem] = false;
    }
  }

  // Selecionar produto da lista (igual ao modo manual)
  onSelectProdutoXml(produto: any, item: ItemRecebimentoXml): void {
    this.produtoInputXml[item.numeroItem] = produto.descricao;
    this.showProdutosListXml[item.numeroItem] = false;
    this.produtosXml[item.numeroItem] = [];

    // Vincular o produto selecionado
    this.vincularProdutoXml(item, produto);
  }

  // Buscar produto para vincular (método antigo - manter para compatibilidade)
  buscarProdutoParaVincular(item: ItemRecebimentoXml, termoBusca: string): void {
    if (termoBusca.length >= 2) {
      this.produtosService.searchProdutosByDescCodEan(termoBusca, 0, 10).subscribe({
        next: (response) => {
          this.produtosXml[item.numeroItem] = response.content || [];
          this.showProdutosListXml[item.numeroItem] = this.produtosXml[item.numeroItem].length > 0;
        },
        error: (error) => {
          console.error('Erro ao buscar produtos:', error);
          this.produtosXml[item.numeroItem] = [];
          this.showProdutosListXml[item.numeroItem] = false;
        }
      });
    }
  }

  // Remover arquivo XML e voltar ao modo manual
  removerXml(): void {
    this.dadosNfe = null;
    this.fornecedorNfe = null;
    this.itensXml = [];
    this.uploadedFile = null;
    this.xmlProcessed = false;
    this.recebimento.itensRecebimento = [];
    this.calculaValorTotal();
    this.exibirMensagem('XML removido. Voltando ao modo manual.', true);
  }

  // Métodos auxiliares para contagem de itens
  getItensVinculados(): number {
    return this.itensXml.filter(item => item.produtoVinculado).length;
  }

  getItensNaoVinculados(): number {
    return this.itensXml.filter(item => !item.produtoVinculado).length;
  }


}
