import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PedidosService } from '../../services/pedidos.service';
import { ProdutosService } from '../../services/produtos.service';
import { CommonModule, CurrencyPipe } from '@angular/common'; // Adicionado o CurrencyPipe
import { MatButtonModule } from '@angular/material/button'; // Adicionando MatButtonModule para os botões

@Component({
  selector: 'app-baixar-pedidos-modal',
  templateUrl: './baixar-pedidos-modal.component.html',
  styleUrls: ['./baixar-pedidos-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, MatButtonModule, CurrencyPipe] // Importando CurrencyPipe e MatButtonModule
})
export class BaixarPedidosModalComponent implements OnInit {
  selectedPedido: any;

  constructor(
    public dialogRef: MatDialogRef<BaixarPedidosModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private pedidosService: PedidosService,
    private produtosService: ProdutosService
  ) {
    this.selectedPedido = data.pedido; // Inicializa o pedido selecionado
  }

  ngOnInit(): void {
    if (this.selectedPedido) {
      this.loadItensDoPedido(this.selectedPedido.id);
    }
  }

  // Função para fechar o modal
  onClose(): void {
    this.dialogRef.close();
  }

  // Carregar os itens do pedido selecionado
  loadItensDoPedido(idPedido: string): void {
    this.pedidosService.getItensPedido(idPedido).subscribe({
      next: (itens) => {
        this.selectedPedido.itens = itens;
        // Carregar os detalhes dos produtos para cada item
        this.selectedPedido.itens.forEach((item: any) => {
          this.produtosService.getProdutoById(item.idProduto).subscribe({
            next: (produto) => {
              item.produto = produto;
            },
            error: (err) => {
              console.error('Erro ao carregar produto:', err);
            }
          });
        });
      },
      error: (err) => {
        console.error('Erro ao carregar itens do pedido:', err);
      }
    });
  }

  // Função para baixar o pedido (atualizar status para "baixado" ou "pago")
  baixarPedido(): void {
    if (this.selectedPedido) {
      this.pedidosService.atualizarStatusPedido(this.selectedPedido.id, 'baixado').subscribe({
        next: () => {
          console.log('Pedido baixado com sucesso!');
          this.dialogRef.close(this.selectedPedido); // Fechar o modal ao finalizar
        },
        error: (err) => {
          console.error('Erro ao baixar o pedido:', err);
        }
      });
    }
  }
}
