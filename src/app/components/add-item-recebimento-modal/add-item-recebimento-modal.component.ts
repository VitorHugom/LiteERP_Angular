import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-add-item-recebimento-modal',
  standalone: true,
  templateUrl: './add-item-recebimento-modal.component.html',
  styleUrls: ['./add-item-recebimento-modal.component.scss'],
  imports: [CommonModule, FormsModule, MatDialogModule, MatButtonModule]
})
export class AddItemRecebimentoModalComponent {
  produto: any;
  quantidade: number = 1;
  valorUnitario: number = 0;
  total: number = 0;

  constructor(
    public dialogRef: MatDialogRef<AddItemRecebimentoModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { produto: any }
  ) {
    this.produto = data.produto;
    this.valorUnitario = data.produto.precoCompra || 0; // Pega o preço de custo do produto, se disponível
    this.atualizarTotal();
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onAdd(): void {
    this.dialogRef.close({
      produto: this.produto,
      quantidade: this.quantidade,
      valorUnitario: this.valorUnitario
    });
  }

  atualizarTotal(): void {
    this.total = this.valorUnitario * this.quantidade;
  }
}

