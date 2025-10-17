import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe para exibir o nome do cliente
 * Retorna cliente.razaoSocial, cliente.nomeFantasia ou clienteFinal
 */
@Pipe({
  name: 'nomeCliente',
  standalone: true
})
export class NomeClientePipe implements PipeTransform {
  transform(pedido: any): string {
    if (!pedido) {
      return '';
    }

    // Se houver cliente vinculado, retorna razaoSocial ou nomeFantasia
    if (pedido.cliente) {
      return pedido.cliente.razaoSocial || pedido.cliente.nomeFantasia || '';
    }

    // Se houver clienteFinal, retorna o nome do cliente final
    if (pedido.clienteFinal) {
      return pedido.clienteFinal;
    }

    // Se houver nomeCliente (usado em PedidoBuscaDTO), retorna
    if (pedido.nomeCliente) {
      return pedido.nomeCliente;
    }

    return '';
  }
}

