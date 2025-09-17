import { Component, Inject, OnInit } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule
} from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

import { PedidosService } from '../../services/pedidos.service';
import { ProdutosService } from '../../services/produtos.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { EnviarCarteiraModalComponent } from '../enviar-carteira-modal/enviar-carteira-modal.component';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-baixar-pedidos-modal',
  templateUrl: './baixar-pedidos-modal.component.html',
  styleUrls: ['./baixar-pedidos-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule
  ]
})
export class BaixarPedidosModalComponent implements OnInit {
  selectedPedido: any;

  constructor(
    public dialogRef: MatDialogRef<BaixarPedidosModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private pedidosService: PedidosService,
    private produtosService: ProdutosService,
    private dialog: MatDialog
  ) {
    this.selectedPedido = data.pedido;
  }

  ngOnInit(): void {
    if (this.selectedPedido) {
      this.loadItensDoPedido(this.selectedPedido.id);
    }
  }

  onClose(): void {
    this.dialogRef.close();
  }

  loadItensDoPedido(idPedido: string): void {
    this.pedidosService.getItensPedido(idPedido).subscribe({
      next: (itens) => {
        this.selectedPedido.itens = itens;
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

  baixarPedido(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titulo: 'Deseja imprimir antes de baixar?',
        mensagem:
          'Após baixar o pedido, não será possível imprimir o comprovante. Imprimir agora?'
      },
      width: '300px'
    });

    dialogRef.afterClosed().subscribe((imprimir: boolean) => {
      if (imprimir) {
        this.onPrint();
        this.finalizarBaixa();
      } else {
        this.finalizarBaixa();
      }
    });
  }

  private finalizarBaixa(): void {
    if (this.selectedPedido) {
      this.pedidosService
        .atualizarStatusPedido(this.selectedPedido.id, 'baixado')
        .subscribe({
          next: () => {
            this.dialogRef.close(this.selectedPedido);
          },
          error: (err) => {
            console.error('Erro ao baixar o pedido:', err);
          }
        });
    }
  }

  onPrint(): void {
    const doc = new jsPDF({ orientation: 'portrait' });
    const marginLeft = 14;
    let y = 20;

    doc.setFontSize(18);
    doc.text('Pedido de Venda', marginLeft, y);
    y += 10;

    doc.setFontSize(12);
    const nomeCliente =
      this.selectedPedido.cliente.razaoSocial ||
      this.selectedPedido.cliente.nomeFantasia ||
      '-';
    doc.text(`Cliente: ${nomeCliente}`, marginLeft, y);
    y += 6;

    const tipoDesc =
      this.selectedPedido.tipoCobranca.descricao || '-';
    doc.text(`Forma de Pagamento: ${tipoDesc}`, marginLeft, y);
    y += 6;

    const now = new Date();
    const dataFormatada = this.formatarDataBR(
      now.toISOString().slice(0, 10)
    );
    doc.text(`Data: ${dataFormatada}`, marginLeft, y);
    y += 6;

    const totalFormatado = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(this.selectedPedido.valorTotal);
    doc.text(`Valor Total: ${totalFormatado}`, marginLeft, y);
    y += 10;

    const head = [
      ['Produto', 'Quantidade', 'Valor Unitário', 'Subtotal']
    ];
    const body = this.selectedPedido.itens.map((item: any) => {
      const desc = item.produto?.descricao || '-';
      const qtd = item.quantidade;
      const precoUnit = item.preco;
      const subtotal = qtd * precoUnit;

      const precoUnitFmt = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(precoUnit);
      const subtotalFmt = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(subtotal);

      return [desc, qtd.toString(), precoUnitFmt, subtotalFmt];
    });

    const startY = y + 4;
    autoTable(doc, {
      head,
      body,
      startY,
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [41, 128, 185] }
    });

    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }

  private formatarDataBR(dataIso: string): string {
    if (!dataIso) return dataIso;
    const partes = dataIso.split('-');
    if (partes.length !== 3) return dataIso;
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }

  enviarParaCarteira(): void {
    const dialogRef = this.dialog.open(EnviarCarteiraModalComponent, {
      data: {
        pedido: this.selectedPedido
      },
      width: '500px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.success) {
        console.log('Conta a receber gerada com sucesso:', result.data);
        // Fecha o modal de baixar pedidos e sinaliza que houve atualização
        this.dialogRef.close({
          pedidoEnviadoCarteira: true,
          pedido: this.selectedPedido
        });
      } else if (result && !result.success) {
        console.error('Erro ao gerar conta a receber:', result.error);
        // Aqui você pode adicionar uma notificação de erro
      }
    });
  }
}
