import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddItemModalComponent } from '../add-item-modal/add-item-modal.component';
import { PedidosService } from '../../services/pedidos.service';
import { ProdutosService } from '../../services/produtos.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FinalizarPedidoModalComponent } from '../finalizar-pedido-modal/finalizar-pedido-modal.component';

@Component({
  selector: 'app-itens-pedido',
  templateUrl: './novo-pedido-vendas.component.html',
  styleUrls: ['./novo-pedido-vendas.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class NovoPedidoVendas implements OnInit {
  pedido: any = {
    id: null,
    itens: []
  };

  produtoInput: string = '';
  produtos: any[] = [];
  showProdutosList = false;
  currentPageProdutos = 0;
  loadingProdutos = false;
  message: string | null = null;
  isSuccess: boolean = true;

  constructor(
    private dialog: MatDialog,
    private pedidosService: PedidosService,
    private produtosService: ProdutosService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.pedido.itens = [];
  }

  // Busca de produtos via input
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

  // Requisição para buscar produtos
  searchProdutosLazy(): void {
    this.loadingProdutos = true;
    const pageSize = 10;

    this.produtosService.searchProdutos(this.produtoInput, this.currentPageProdutos, pageSize).subscribe({
      next: (produtos) => {
        if (this.currentPageProdutos === 0) {
          this.produtos = produtos;
        } else {
          this.produtos = [...this.produtos, ...produtos];
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

  // Selecionar produto e abrir modal
  onSelectProduto(produto: any): void {
    this.openAddItemModal(produto);
    this.showProdutosList = false;
  }

  // Abrir o modal para adicionar item ao pedido
  openAddItemModal(produto: any): void {
    const dialogRef = this.dialog.open(AddItemModalComponent, {
      width: '400px',
      data: { produto }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.pedido.itens.push(result);
        console.log('Itens do pedido:', this.pedido.itens);
      }
    });
  }

  // Finalizar o pedido (será implementado na próxima etapa)
  onFinalizarPedido(): void {
    const dialogRef = this.dialog.open(FinalizarPedidoModalComponent, {
      width: '500px',
      data: {
        itens: this.pedido.itens,  // Passa os itens do pedido para o modal
        total: this.getTotalPedido() // Calcula o total dos itens
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.exibirMensagem('Pedido gravado com sucesso!', true);
        // Limpar ou redefinir o pedido se necessário
        this.onNew();
      }
    });
  }

  onNew(): void {
    this.pedido.itens = [];
    this.produtoInput = '';
  }

  onVoltarParaHome(): void {
    this.router.navigate(['/vendas']);  // Rota para a página inicial de pedidos
  }

  getTotalPedido(): number {
    return this.pedido.itens.reduce((total: number, item: { quantidade: number; produto: { precoVenda: number } }) => {
      return total + item.quantidade * item.produto.precoVenda;
    }, 0);  // O valor inicial de `total` é 0 e o tipo é número
  }

  // Editar item
  onEditItem(index: number): void {
    const item = this.pedido.itens[index];
    const dialogRef = this.dialog.open(AddItemModalComponent, {
      width: '400px',
      data: { produto: item.produto, quantidade: item.quantidade }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.pedido.itens[index] = result;
      }
    });
  }

  // Excluir item
  onDeleteItem(index: number): void {
    this.pedido.itens.splice(index, 1);
  }

  exibirMensagem(mensagem: string, isSuccess: boolean): void {
    this.message = mensagem;
    this.isSuccess = isSuccess;
    setTimeout(() => {
      this.message = null; // Limpa a mensagem após 3 segundos
    }, 3000);
  }
}
