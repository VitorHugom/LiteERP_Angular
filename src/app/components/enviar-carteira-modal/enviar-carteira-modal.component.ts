import { Component, Inject, OnInit } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule
} from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';

import { FormaPagamentoService } from '../../services/forma-pagamento.service';
import { TiposCobrancaService } from '../../services/tipos-cobranca.service';
import { ContasReceberService } from '../../services/contas-receber.service';

@Component({
  selector: 'app-enviar-carteira-modal',
  templateUrl: './enviar-carteira-modal.component.html',
  styleUrls: ['./enviar-carteira-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    FormsModule
  ]
})
export class EnviarCarteiraModalComponent implements OnInit {
  pedido: any;
  formasPagamento: any[] = [];
  tiposCobranca: any[] = [];
  selectedFormaPagamento: number | null = null;
  selectedTipoCobranca: number | null = null;
  isLoading = false;

  constructor(
    public dialogRef: MatDialogRef<EnviarCarteiraModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formaPagamentoService: FormaPagamentoService,
    private tiposCobrancaService: TiposCobrancaService,
    private contasReceberService: ContasReceberService
  ) {
    this.pedido = data.pedido;
  }

  ngOnInit(): void {
    this.loadFormasPagamento();
    this.loadTiposCobranca();
  }

  loadFormasPagamento(): void {
    this.formaPagamentoService.getFormasPagamento().subscribe({
      next: (data) => {
        this.formasPagamento = data;
      },
      error: (err) => {
        console.error('Erro ao carregar formas de pagamento:', err);
      }
    });
  }

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

  onCancel(): void {
    this.dialogRef.close();
  }

  onFinalize(): void {
    if (!this.selectedFormaPagamento || !this.selectedTipoCobranca) {
      return;
    }

    this.isLoading = true;

    const payload = {
      idPedido: this.pedido.id,
      idFormaPagamento: this.selectedFormaPagamento,
      idTipoCobranca: this.selectedTipoCobranca
    };

    this.contasReceberService.gerarContaPorPedido(payload).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.dialogRef.close({ success: true, data: response });
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Erro ao enviar para carteira:', err);
        this.dialogRef.close({ success: false, error: err });
      }
    });
  }
}
