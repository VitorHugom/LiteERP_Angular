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

@Component({
  selector: 'app-cadastro-pedido',
  standalone: true,
  templateUrl: './pedidos-cadastro.component.html',
  styleUrls: ['./pedidos-cadastro.component.scss'],
  imports: [CommonModule, FormsModule, RouterLink, AddItemModalComponent]
})
export class PedidosCadastroComponent implements OnInit {
  isNew = true;
  pedido: any = {
    id: null,
    cliente: null,
    vendedor: null,
    dataEmissao: '',
    valorTotal: null,
    status: 'aguardando',
    tipoCobranca: null,
    itens: []
  };

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
    if (!this.pedido.cliente || !this.pedido.vendedor || !this.pedido.valorTotal || !this.pedido.tipoCobranca) {
      this.exibirMensagem('Preencha todos os campos obrigatórios.', false);
      return;
    }

    if (this.isNew) {
      this.pedido.dataEmissao = new Date().toISOString();
    }

    const pedidoPayload = {
      idCliente: this.pedido.cliente.id,
      idVendedor: this.pedido.vendedor.id,
      dataEmissao: this.pedido.dataEmissao,
      valorTotal: this.pedido.valorTotal,
      status: this.pedido.status,
      idTipoCobranca: this.pedido.tipoCobranca.id
    };

    if (this.isNew) {
      this.pedidosService.createPedido(pedidoPayload).subscribe({
        next: (response) => {
          this.pedido = response;
          this.isNew = false;
          this.salvarItensEExcluirMarcados();
          this.exibirMensagem('Pedido cadastrado com sucesso!', true);
        },
        error: (err) => {
          this.exibirMensagem('Erro ao cadastrar pedido.', false);
          console.error('Erro ao cadastrar pedido:', err);
        }
      });
    } else {
      this.pedidosService.updatePedido(this.pedido.id, pedidoPayload).subscribe({
        next: () => {
          this.salvarItensEExcluirMarcados();
          this.exibirMensagem('Pedido atualizado com sucesso!', true);
        },
        error: (err) => {
          this.exibirMensagem('Erro ao atualizar pedido.', false);
          console.error('Erro ao atualizar pedido:', err);
        }
      });
    }
  }
  
  saveItensDoPedido(): void {
    if (!this.pedido.itens || this.pedido.itens.length === 0) {
      return;
    }
  
    this.pedido.itens.forEach((item: any) => {
      const itemPayload = {
        idPedido: this.pedido.id,
        idProduto: item.produto.id,
        preco: item.produto.precoVenda,
        quantidade: item.quantidade
      };
  
      if (item.id) {
        // Se o item já tem um ID, atualize-o
        this.pedidosService.updateItemPedido(this.pedido.id, item.id, itemPayload).subscribe({
          next: (response) => {
            console.log(`Item ${item.produto.descricao} atualizado com sucesso.`);
          },
          error: (err) => {
            console.error(`Erro ao atualizar item ${item.produto.descricao}:`, err);
          }
        });
      } else {
        // Se o item não tem ID, crie um novo
        this.pedidosService.addItemPedido(this.pedido.id, itemPayload).subscribe({
          next: (response) => {
            console.log(`Item ${item.produto.descricao} salvo com sucesso.`);
          },
          error: (err) => {
            console.error(`Erro ao salvar item ${item.produto.descricao}:`, err);
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
      status: 'aguardando',
      tipoCobranca: null
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
  onEditItem(item: any): void {
    const dialogRef = this.dialog.open(AddItemModalComponent, {
      width: '400px',
      data: { produto: item.produto, quantidade: item.quantidade } // Passa o item atual para edição
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Localiza o item correto com base no produto
        const index = this.pedido.itens.findIndex((i: any) => i.produto.id === item.produto.id);
        if (index !== -1) {
          this.pedido.itens[index] = {
            ...this.pedido.itens[index],
            quantidade: result.quantidade
          };
          console.log('Item editado:', this.pedido.itens[index]);
        }
      }
    });
  }  
  
  onDeleteItem(item: any): void {
    const confirmacao = confirm('Tem certeza que deseja excluir este item?');
    if (confirmacao) {
      // Adiciona o item à lista de itens para excluir
      if (item.id) {
        this.itensParaExcluir.push(item);
      }

      // Remove o item da lista localmente (sem deletar do backend)
      this.pedido.itens = this.pedido.itens.filter((i: any) => i.id !== item.id);
      console.log('Item marcado para exclusão:', item);
    }
  }

  salvarItensEExcluirMarcados(): void {
    // Salvar os itens do pedido
    this.saveItensDoPedido();

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
}
