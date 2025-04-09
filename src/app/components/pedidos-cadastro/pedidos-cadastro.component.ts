import { Component, OnInit } from '@angular/core';
import { PedidosService } from '../../services/pedidos.service';
import { ClientesService } from '../../services/clientes.service';
import { VendedoresService } from '../../services/vendedores.service';
import { TiposCobrancaService } from '../../services/tipos-cobranca.service';
import { ProdutosService } from '../../services/produtos.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AddItemModalComponent } from '../add-item-modal/add-item-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { NavigateToSearchButtonComponent } from '../shared/navigate-to-search-button/navigate-to-search-button.component';

@Component({
  selector: 'app-cadastro-pedido',
  standalone: true,
  templateUrl: './pedidos-cadastro.component.html',
  styleUrls: ['./pedidos-cadastro.component.scss','./pedidos-cadastro.responsive.component.scss'],
  imports: [CommonModule, FormsModule, NavigateToSearchButtonComponent]
})
export class PedidosCadastroComponent implements OnInit {
  isNew = true;
  pedido: any = {
    id: null,
    cliente: null,
    vendedor: null,
    dataEmissao: '',
    valorTotal: null,
    status: 'em_aberto',
    tipoCobranca: null,
    itens: []
  };

  urlPedidosBusca = '/pedidos-busca'

  itensParaExcluir: any[] = [];

  activeTab: string = 'geral';

  clienteInput: string = '';  // Input para busca de clientes
  vendedorInput: string = '';  // Input para busca de vendedores
  produtoInput: string = '';  // Campo de busca para produtos

  produtos: any[] = [];
  currentPageProdutos = 0;
  loadingProdutos = false;
  showProdutosList = false;

  clientes: any[] = [];
  vendedores: any[] = [];
  tiposCobranca: any[] = [];

  showClientesList = false;  // Controla a exibição da lista de clientes
  showVendedoresList = false;  // Controla a exibição da lista de vendedores

  currentPageClientes = 0;
  currentPageVendedores = 0;
  pageSize = 10;  // Número de registros por página

  loadingClientes = false;
  loadingVendedores = false;

  message: string | null = null;
  isSuccess: boolean = true;

  constructor(
    private pedidosService: PedidosService,
    private clientesService: ClientesService,
    private vendedoresService: VendedoresService,
    private tiposCobrancaService: TiposCobrancaService,
    private produtosService: ProdutosService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  ngOnInit(): void {
    this.loadTiposCobranca(); // Carrega os tipos de cobrança

    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'novo') {
      this.isNew = false;
      this.pedidosService.getPedidoById(id).subscribe({
        next: (data) => {
          this.pedido = data;
          this.pedido.itens = this.pedido.itens || []; // Garante que a propriedade itens exista
          this.clienteInput = this.pedido.cliente?.razaoSocial || this.pedido.cliente?.nomeFantasia;
          this.vendedorInput = this.pedido.vendedor?.nome;

          // Verifica e associa o tipo de cobrança correto ao objeto
          this.matchTipoCobranca();

          // Carrega os itens do pedido
          this.loadItensDoPedido(this.pedido.id);
        },
        error: (err) => {
          console.error('Erro ao carregar pedido:', err);
        }
      });
    }
  }


  loadItensDoPedido(idPedido: string): void {
    this.pedidosService.getItensPedido(idPedido).subscribe({
      next: (itens) => {
        this.pedido.itens = itens; // Atualiza a lista de itens no pedido
        this.loadItensDoPedidoComProdutos(); // Carrega detalhes dos produtos
        console.log('Itens carregados:', this.pedido.itens);
      },
      error: (err) => {
        console.error('Erro ao carregar itens do pedido:', err);
      }
    });
  }

  loadItensDoPedidoComProdutos(): void {
    this.pedido.itens.forEach((item: any, index: number) => {
      this.produtosService.getProdutoById(item.idProduto).subscribe({
        next: (produto) => {
          this.pedido.itens[index].produto = produto; // Associa o produto completo ao item
        },
        error: (err) => {
          console.error(`Erro ao carregar detalhes do produto para o item ${item.idProduto}:`, err);
        }
      });
    });
  }



  matchTipoCobranca(): void {
    if (this.pedido && this.pedido.tipoCobranca && this.tiposCobranca.length) {
      const tipoEncontrado = this.tiposCobranca.find(tipo => tipo.id === this.pedido.tipoCobranca.id);
      this.pedido.tipoCobranca = tipoEncontrado ? tipoEncontrado : null;
    }
  }

  loadTiposCobranca(): void {
    this.tiposCobrancaService.getTiposCobranca().subscribe({
      next: (data) => {
        this.tiposCobranca = data;
        if (!this.isNew) {
          this.matchTipoCobranca();
        }
      },
      error: (err) => {
        console.error('Erro ao carregar tipos de cobrança:', err);
      }
    });
  }

  // Funções para busca lazy de Clientes
  onSearchClientes(event: Event): void {
    const inputValue = (event.target as HTMLInputElement).value;
    if (inputValue.length >= 2) {
      this.clienteInput = inputValue;
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
      }
    });
  }

  onSelectCliente(cliente: any): void {
    this.pedido.cliente = cliente;
    this.clienteInput = cliente.razaoSocial || cliente.nomeFantasia;
    this.showClientesList = false;
  }

  onScrollClientes(): void {
    if (!this.loadingClientes) {
      this.currentPageClientes++;
      this.searchClientesLazy();
    }
  }

  // Funções para busca lazy de Vendedores
  onSearchVendedores(event: Event): void {
    const inputValue = (event.target as HTMLInputElement).value;
    if (inputValue.length >= 2) {
      this.vendedorInput = inputValue;
      this.currentPageVendedores = 0;
      this.searchVendedoresLazy();
    } else {
      this.vendedores = [];
      this.showVendedoresList = false;
    }
  }

  searchVendedoresLazy(): void {
    this.loadingVendedores = true;

    this.vendedoresService.searchVendedores(this.vendedorInput, this.currentPageVendedores, this.pageSize).subscribe({
      next: (response) => {
        if (Array.isArray(response)) {
          if (this.currentPageVendedores === 0) {
            this.vendedores = response;
          } else {
            this.vendedores = [...this.vendedores, ...response];
          }
          this.showVendedoresList = true;
        } else {
          this.vendedores = [];
        }
        this.loadingVendedores = false;
      },
      error: (err) => {
        console.error('Erro ao buscar vendedores:', err);
        this.loadingVendedores = false;
      }
    });
  }

  onSelectVendedor(vendedor: any): void {
    this.pedido.vendedor = vendedor;
    this.vendedorInput = vendedor.nome;
    this.showVendedoresList = false;
  }

  onScrollVendedores(): void {
    if (!this.loadingVendedores) {
      this.currentPageVendedores++;
      this.searchVendedoresLazy();
    }
  }

  onSave(): void {
    // Verificação de campos obrigatórios
    if (!this.pedido.cliente || !this.pedido.vendedor || !this.pedido.valorTotal || !this.pedido.tipoCobranca) {
      this.exibirMensagem('Preencha todos os campos obrigatórios.', false);
      return;
    }

    // Definir a data de emissão para pedidos novos
    if (this.isNew) {
      const now = new Date();
      now.setHours(now.getHours() - now.getTimezoneOffset() / 60); // Ajusta para GMT-3
      this.pedido.dataEmissao = now.toISOString();
    }

    const pedidoPayload = {
      idCliente: this.pedido.cliente.id,
      idVendedor: this.pedido.vendedor.id,
      dataEmissao: this.pedido.dataEmissao,
      valorTotal: this.pedido.valorTotal,
      status: this.pedido.status,
      idTipoCobranca: this.pedido.tipoCobranca.id
    };

    // Armazenar os itens em uma variável temporária para preservá-los
    const itensTemporarios = this.pedido.itens || [];

    // Se for um novo pedido, criar
    if (this.isNew) {
      this.pedidosService.createPedido(pedidoPayload).subscribe({
        next: (response) => {
          // Atribuir o pedido retornado
          this.pedido = response;

          this.matchTipoCobranca();

          // Garantir que o array de itens existe, mesmo que esteja vazio
          this.pedido.itens = itensTemporarios.length > 0 ? itensTemporarios : [];

          // Salvar os itens e excluir os marcados
          this.salvarItensEExcluirMarcados(response.id);
          this.exibirMensagem('Pedido cadastrado com sucesso!', true);
          this.isNew = false;
        },
        error: (err) => {
          this.exibirMensagem('Erro ao cadastrar pedido.', false);
          console.error('Erro ao cadastrar pedido:', err);
        }
      });
    } else {
       console.log("id pedido: "  + this.pedido.id)
      // Se for uma atualização, atualizar o pedido existente
      this.pedidosService.updatePedido(this.pedido.id, pedidoPayload).subscribe({
        next: () => {
          // Garantir que o array de itens existe, mesmo que esteja vazio
          this.pedido.itens = itensTemporarios.length > 0 ? itensTemporarios : [];

          // Salvar os itens e excluir os marcados
          this.salvarItensEExcluirMarcados(this.pedido.id);
          this.exibirMensagem('Pedido atualizado com sucesso!', true);
        },
        error: (err) => {
          this.exibirMensagem('Erro ao atualizar pedido.', false);
          console.error('Erro ao atualizar pedido:', err);
        }
      });
    }
  }

  saveItensDoPedido(idPedido: number): void {
    const idsItensExistentes = this.pedido.itens.map((item: { id: number }) => item.id);

    this.pedido.itens.forEach((item: any) => {
      const itemPayload = {
        idPedido: idPedido,
        idProduto: item.produto.id,
        preco: item.produto.precoVenda,
        quantidade: item.quantidade
      };

      // Verifique se o item é novo (id não existe)
      if (!item.id) {
        // Adiciona novo item
        this.pedidosService.addItemPedido(idPedido.toString(), itemPayload).subscribe({
          next: (response) => {
            console.log('Item adicionado com sucesso:', response);
          },
          error: (err) => {
            console.error('Erro ao adicionar item ao pedido:', err);
          }
        });
      } else {
        // Atualiza item existente
        this.pedidosService.updateItemPedido(idPedido, item.id, itemPayload).subscribe({
          next: (response) => {
            console.log('Item atualizado com sucesso:', response);
          },
          error: (err) => {
            console.error('Erro ao atualizar item ao pedido:', err);
          }
        });
      }
    });
  }

  onDelete(): void {
    if (this.pedido.id) {
      const confirmacao = confirm('Tem certeza que deseja deletar este pedido?');
      if (confirmacao) {
        this.pedidosService.deletePedido(this.pedido.id).subscribe({
          next: () => {
            this.exibirMensagem('Pedido deletado com sucesso!', true);
            this.router.navigate(['/pedidos-busca']);
          },
          error: (err) => {
            this.exibirMensagem('Erro ao deletar pedido. Tente novamente.', false);
            console.error('Erro ao deletar pedido:', err);
          }
        });
      }
    }
  }

  onNew(): void {
    this.isNew = true;
    this.pedido = {
      id: null,
      cliente: null,
      vendedor: null,
      dataEmissao: '',
      valorTotal: null,
      status: 'em_aberto',
      tipoCobranca: null,
      itens: []
    };
    this.clienteInput = '';
    this.vendedorInput = '';
    this.clientes = [];
    this.vendedores = [];
  }

  onConsultar(): void {
    this.router.navigate(['/pedidos-busca']);
  }

  exibirMensagem(mensagem: string, isSuccess: boolean): void {
    this.message = mensagem;
    this.isSuccess = isSuccess;
    setTimeout(() => {
      this.message = null;
    }, 3000);
  }

  onSearchProdutos(event: Event): void {
    const inputValue = (event.target as HTMLInputElement).value;
    if (inputValue.length >= 2) {
      this.produtoInput = inputValue;
      this.currentPageProdutos = 0;
      this.searchProdutosLazy();
    } else {
      this.produtos = [];
      this.showProdutosList = false;
    }
  }

  searchProdutosLazy(): void {
    this.loadingProdutos = true;
    const pageSize = 10;  // Definir o tamanho da página

    this.produtosService.searchProdutos(this.produtoInput, this.currentPageProdutos, pageSize).subscribe({
      next: (response) => {
        if (this.currentPageProdutos === 0) {
          this.produtos = response;
        } else {
          this.produtos = [...this.produtos, ...response];
        }
        this.showProdutosList = true;
        this.loadingProdutos = false;
      },
      error: (err) => {
        console.error('Erro ao buscar produtos:', err);
        this.loadingProdutos = false;
      }
    });
  }


  onSelectProduto(produto: any): void {
    this.openAddItemModal(produto);
    this.showProdutosList = false;
  }

  openAddItemModal(produto: any): void {
    const dialogRef = this.dialog.open(AddItemModalComponent, {
      width: '400px',
      data: { produto }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (!this.pedido.itens) {
          this.pedido.itens = [];
        }
        this.pedido.itens.push(result);
        console.log('Itens do pedido:', this.pedido.itens);
      }
    });
  }


  onScrollProdutos(): void {
    if (!this.loadingProdutos) {
      this.currentPageProdutos++;
      this.searchProdutosLazy();
    }
  }
  onEditItem(index: number): void {
    const item = this.pedido.itens[index]; // Acessa o item com base no índice
    const dialogRef = this.dialog.open(AddItemModalComponent, {
      width: '400px',
      data: { produto: item.produto, quantidade: item.quantidade }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Atualiza o item correto com base no índice
        this.pedido.itens[index] = {
          ...this.pedido.itens[index],
          quantidade: result.quantidade
        };
        console.log('Item editado:', this.pedido.itens[index]);
      }
    });
  }

  onDeleteItem(index: number): void {
    const confirmacao = confirm('Tem certeza que deseja excluir este item?');
    if (confirmacao) {
      const item = this.pedido.itens[index];

      if (item.id) {
        this.itensParaExcluir.push(item); // Adiciona o item à lista de exclusão
      }

      // Remove o item da lista de itens
      this.pedido.itens.splice(index, 1);
      console.log('Item excluído:', item);
    }
  }

  salvarItensEExcluirMarcados(idPedido: number): void {
    if (idPedido) {
      this.saveItensDoPedido(idPedido);
    } else {
      console.error('Erro: ID do pedido não encontrado.');
      this.exibirMensagem('Erro ao salvar itens: ID do pedido não encontrado.', false);
      return;
    }

    // Excluir itens marcados para exclusão
    if (this.itensParaExcluir.length > 0) {
      this.itensParaExcluir.forEach((item: any) => {
        this.pedidosService.deleteItemPedido(item.id).subscribe({
          next: () => {
            console.log(`Item ${item.produto.descricao} excluído com sucesso.`);
          },
          error: (err) => {
            console.error(`Erro ao excluir item ${item.produto.descricao}:`, err);
          }
        });
      });
      this.itensParaExcluir = []; // Limpar a lista de itens para excluir
    }
  }

  getTotalPedido(): number {
    return this.pedido.itens.reduce((total: number, item: { quantidade: number; produto: { precoVenda: number } }) => {
      this.pedido.valorTotal = total + item.quantidade * item.produto.precoVenda;
      return this.pedido.valorTotal;
    }, 0);
  }
}
