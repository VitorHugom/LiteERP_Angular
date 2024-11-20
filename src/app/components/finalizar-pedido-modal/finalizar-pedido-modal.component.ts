import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PedidosService } from '../../services/pedidos.service';
import { ClientesService } from '../../services/clientes.service';
import { TiposCobrancaService } from '../../services/tipos-cobranca.service';
import { VendedoresService } from '../../services/vendedores.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-finalizar-pedido-modal',
  templateUrl: './finalizar-pedido-modal.component.html',
  styleUrls: ['./finalizar-pedido-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatButtonModule, CurrencyPipe]
})
export class FinalizarPedidoModalComponent implements OnInit {
  clienteInput: string = '';
  tipoCobranca: any;
  total: number;
  clientes: any[] = [];
  tiposCobranca: any[] = [];
  showClientesList = false;
  loadingClientes = false;
  currentPageClientes = 0;
  pageSize = 10;

  constructor(
    public dialogRef: MatDialogRef<FinalizarPedidoModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private pedidosService: PedidosService,
    private clientesService: ClientesService,
    private tiposCobrancaService: TiposCobrancaService,
    private vendedoresService: VendedoresService
  ) {
    this.total = data.total; // Recebendo o total dos itens passados para o modal
  }

  ngOnInit(): void {
    this.loadTiposCobranca(); // Carrega os tipos de cobrança
  }

  // Carregar tipos de cobrança
  loadTiposCobranca(): void {
    this.tiposCobrancaService.getTiposCobranca().subscribe({
      next: (data) => {
        this.tiposCobranca = data;
      },
      error: (err) => {
        console.error('Erro ao carregar tipos de cobrança:', err);
      }
    });
  }

  // Busca lazy de clientes
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
          this.clientes = this.currentPageClientes === 0 ? response : [...this.clientes, ...response];
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
    this.data.cliente = cliente;  // Armazena o cliente selecionado no data.cliente
    this.clienteInput = cliente.razaoSocial || cliente.nomeFantasia;
    this.showClientesList = false;
  }

  onFinalizar(): void {
    // Verificação de campos obrigatórios
    if (!this.data.cliente || !this.tipoCobranca) {
        alert('Preencha todos os campos obrigatórios.');
        return;
    }

    // Obter o userId da sessionStorage
    const userId = sessionStorage.getItem('userId');
    if (!userId) {
        alert('Erro ao obter o ID do usuário. Por favor, tente novamente.');
        return;
    }

    // Buscar o vendedor pelo userId
    this.vendedoresService.getVendedorByUserId(+userId).subscribe({
        next: (vendedor) => {
            if (vendedor) {
                // Gerar o payload para o pedido sem itens
                const pedidoPayload = {
                    idCliente: this.data.cliente.id,  // ID do cliente selecionado
                    idVendedor: vendedor.id,  // ID do vendedor encontrado
                    dataEmissao: '', // Data atual
                    valorTotal: this.total,  // Usar o total passado no modal
                    status: 'em_aberto',
                    idTipoCobranca: this.tipoCobranca.id // Tipo de cobrança selecionado
                };

                // Definir a data de emissão para pedidos novos
                const now = new Date();
                now.setHours(now.getHours() - now.getTimezoneOffset() / 60); // Ajusta para GMT-3
                pedidoPayload.dataEmissao = now.toISOString();

                // Criar o pedido primeiro
                this.pedidosService.createPedido(pedidoPayload).subscribe({
                    next: (response) => {
                        console.log('Pedido criado com sucesso:', response);

                        // Agora enviar os itens do pedido
                        this.salvarItensDoPedido(response.id); // Passar o ID do pedido criado

                        // Fechar o modal com sucesso
                        this.dialogRef.close(response);
                    },
                    error: (err) => {
                        console.error('Erro ao criar o pedido:', err);
                    }
                });
            } else {
                console.error('Vendedor não encontrado.');
            }
        },
        error: (err) => {
            console.error('Erro ao buscar vendedor:', err);
        }
    });
}

salvarItensDoPedido(idPedido: number): void {
  // Verificar se há itens para salvar
  if (!this.data.itens || this.data.itens.length === 0) {
      console.warn('Nenhum item para salvar.');
      return;
  }

  // Para cada item, enviar uma requisição ao serviço de criação de itens
  this.data.itens.forEach((item: any) => {
      const itemPayload = {
          idPedido: idPedido, // Usar o ID do pedido recém-criado
          idProduto: item.produto.id, // ID do produto
          preco: item.produto.precoVenda, // Preço de venda do produto
          quantidade: item.quantidade // Quantidade do item
      };

      this.pedidosService.addItemPedido(idPedido.toString(), itemPayload).subscribe({
          next: (response) => {
              console.log(`Item ${item.produto.descricao} adicionado com sucesso.`);
          },
          error: (err) => {
              console.error(`Erro ao adicionar o item ${item.produto.descricao}:`, err);
          }
      });
  });
}


  onCancel(): void {
    this.dialogRef.close(); // Fecha o modal sem salvar
  }
}
