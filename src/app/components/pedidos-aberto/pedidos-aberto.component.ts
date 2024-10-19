import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PedidosService } from '../../services/pedidos.service';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { BaixarPedidosModalComponent } from '../baixar-pedidos-modal/baixar-pedidos-modal.component';

@Component({
  selector: 'app-pedidos-aberto',
  templateUrl: './pedidos-aberto.component.html',
  styleUrls: ['./pedidos-aberto.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class PedidosAbertoComponent implements OnInit {
  pedidosEmAberto: any[] = [];

  constructor(
    private pedidosService: PedidosService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.carregarPedidosEmAberto();
  }

  carregarPedidosEmAberto(): void {
    this.pedidosService.getPedidosEmAberto().subscribe({
      next: (pedidos) => {
        this.pedidosEmAberto = pedidos;
      },
      error: (err) => {
        console.error('Erro ao carregar pedidos em aberto:', err);
      },
    });
  }

  abrirModal(pedido: any): void {
    const dialogRef = this.dialog.open(BaixarPedidosModalComponent, {
      width: '700px',
      data: { pedido } // Passando o pedido para o modal
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Atualiza a lista de pedidos em aberto após baixar um pedido
        this.carregarPedidosEmAberto();
      }
    });
  }

  voltarParaHome(): void {
    this.router.navigate(['/caixa']);
  }
}
