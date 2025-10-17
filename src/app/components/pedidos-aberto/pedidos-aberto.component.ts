import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PedidosService } from '../../services/pedidos.service';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { BaixarPedidosModalComponent } from '../baixar-pedidos-modal/baixar-pedidos-modal.component';
import { NomeClientePipe } from '../../pipes/nome-cliente.pipe';

@Component({
  selector: 'app-pedidos-aberto',
  templateUrl: './pedidos-aberto.component.html',
  styleUrls: ['./pedidos-aberto.component.scss'],
  standalone: true,
  imports: [CommonModule, NomeClientePipe],
})
export class PedidosAbertoComponent implements OnInit {
  pedidosEmAberto: any[] = [];
  isLargeScreen = window.innerWidth >= 768; // Tela grande por padrão

  constructor(
    private pedidosService: PedidosService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.isLargeScreen = (event.target as Window).innerWidth >= 768;
  }

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
      data: { pedido }, // Passando o pedido para o modal
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.carregarPedidosEmAberto();
      }
    });
  }

  voltarParaHome(): void {
    this.router.navigate(['/caixa']);
  }
}
