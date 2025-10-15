import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface SelecionarProdutoData {
  produtos: any[];
  termoBusca: string;
}

@Component({
  selector: 'app-selecionar-produto-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './selecionar-produto-modal.component.html',
  styleUrls: ['./selecionar-produto-modal.component.scss']
})
export class SelecionarProdutoModalComponent {
  produtos: any[];
  termoBusca: string;

  constructor(
    public dialogRef: MatDialogRef<SelecionarProdutoModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SelecionarProdutoData
  ) {
    this.produtos = data.produtos;
    this.termoBusca = data.termoBusca;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSelectProduto(produto: any): void {
    this.dialogRef.close(produto);
  }
}
