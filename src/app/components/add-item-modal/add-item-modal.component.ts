import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-add-item-modal',
  standalone: true,
  templateUrl: './add-item-modal.component.html',
  styleUrls: ['./add-item-modal.component.scss'],
  imports: [CommonModule, FormsModule, MatDialogModule, MatButtonModule]
})
export class AddItemModalComponent {
  produto: any;
  quantidade: number = 1;
  total: number = 0;

  constructor(
    public dialogRef: MatDialogRef<AddItemModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.produto = data.produto;
    this.atualizarTotal();
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onAdd(): void {
    this.dialogRef.close({ produto: this.produto, quantidade: this.quantidade });
  }

  // Atualizar o valor total conforme a quantidade muda
  atualizarTotal(): void {
    this.total = this.produto.precoVenda * this.quantidade;
  }
}
