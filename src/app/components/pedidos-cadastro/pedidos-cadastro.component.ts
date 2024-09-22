import { Component, OnInit } from '@angular/core';
import { PedidosService } from '../../services/pedidos.service';
import { ClientesService } from '../../services/clientes.service';
import { VendedoresService } from '../../services/vendedores.service';
import { TiposCobrancaService } from '../../services/tipos-cobranca.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cadastro-pedido',
  standalone: true,
  templateUrl: './pedidos-cadastro.component.html',
  styleUrls: ['./pedidos-cadastro.component.scss'],
  imports: [CommonModule, FormsModule, RouterLink]
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
    tipoCobranca: null
  };

  clienteInput: string = '';  // Input para busca de clientes
  vendedorInput: string = '';  // Input para busca de vendedores

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
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadTiposCobranca(); // Carrega os tipos de cobrança

    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'novo') {
      this.isNew = false;
      this.pedidosService.getPedidoById(id).subscribe({
        next: (data) => {
          this.pedido = data;
          this.clienteInput = this.pedido.cliente?.razaoSocial || this.pedido.cliente?.nomeFantasia;
          this.vendedorInput = this.pedido.vendedor?.nome;

          // Verifica e associa o tipo de cobrança correto ao objeto
          this.matchTipoCobranca();
        },
        error: (err) => {
          console.error('Erro ao carregar pedido:', err);
        }
      });
    }
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
    // Verificar campos obrigatórios
    if (!this.pedido.cliente || !this.pedido.vendedor || !this.pedido.valorTotal || !this.pedido.tipoCobranca) {
      this.exibirMensagem('Preencha todos os campos obrigatórios.', false);
      console.log('Campos obrigatórios faltando:', {
        cliente: this.pedido.cliente,
        vendedor: this.pedido.vendedor,
        valorTotal: this.pedido.valorTotal,
        tipoCobranca: this.pedido.tipoCobranca
      });
      return;
    }
  
    // Gerar data de emissão se for um novo pedido
    if (this.isNew) {
      this.pedido.dataEmissao = new Date().toISOString();
      console.log('Data de emissão gerada automaticamente:', this.pedido.dataEmissao);
    }
  
    // Construir o payload com os dados adequados
    const payload = {
      idCliente: this.pedido.cliente.id,
      idVendedor: this.pedido.vendedor.id,
      dataEmissao: this.pedido.dataEmissao,
      valorTotal: this.pedido.valorTotal,
      status: this.pedido.status,
      idTipoCobranca: this.pedido.tipoCobranca.id
    };
  
    // Log para verificação do payload
    console.log('Payload preparado para envio:', payload);
  
    if (this.isNew) {
      this.pedidosService.createPedido(payload).subscribe({
        next: (response) => {
          console.log('Pedido criado com sucesso:', response);
          this.pedido = response;
          this.isNew = false;
          this.matchTipoCobranca();  // Reassociar tipo de cobrança após salvar
          this.exibirMensagem('Pedido cadastrado com sucesso!', true);
        },
        error: (err) => {
          console.error('Erro ao cadastrar pedido:', err);
          this.exibirMensagem('Erro ao cadastrar pedido.', false);
        }
      });
    } else {
      this.pedidosService.updatePedido(this.pedido.id, payload).subscribe({
        next: () => {
          console.log('Pedido atualizado com sucesso:', this.pedido);
          this.matchTipoCobranca();  // Reassociar tipo de cobrança após atualização
          this.exibirMensagem('Pedido atualizado com sucesso!', true);
        },
        error: (err) => {
          console.error('Erro ao atualizar pedido:', err);
          this.exibirMensagem('Erro ao atualizar pedido.', false);
        }
      });
    }
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
}
