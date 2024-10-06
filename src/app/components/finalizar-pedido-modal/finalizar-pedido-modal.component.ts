import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PedidosService } from '../../services/pedidos.service';
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
export class FinalizarPedidoModalComponent {
  clienteInput: string = '';
  tipoCobranca: string = '';
  total: number;

  constructor(
    public dialogRef: MatDialogRef<FinalizarPedidoModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private pedidosService: PedidosService
  ) {
    this.total = data.total; // Recebendo o total dos itens passados para o modal
  }

  onCancel(): void {
    this.dialogRef.close(); // Fecha o modal sem salvar
  }

  onFinalizar(): void {
    // Verificação de campos obrigatórios
    if (!this.clienteInput || !this.tipoCobranca) {
      alert('Preencha todos os campos obrigatórios.');
      return;
    }

    // Cria o payload do pedido com os itens, cliente e tipo de cobrança
    const pedidoPayload = {
      cliente: this.clienteInput,
      tipoCobranca: this.tipoCobranca,
      itens: this.data.itens,
      total: this.total
    };

    // Enviar o pedido para o serviço
    this.pedidosService.createPedido(pedidoPayload).subscribe({
      next: (response) => {
        console.log('Pedido finalizado com sucesso:', response);
        this.dialogRef.close(response); // Fecha o modal com sucesso
      },
      error: (err) => {
        console.error('Erro ao finalizar pedido:', err);
      }
    });
  }
}
