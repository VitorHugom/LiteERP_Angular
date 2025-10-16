import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe para formatar o status do pedido de forma amigável
 */
@Pipe({
  name: 'statusPedido',
  standalone: true
})
export class StatusPedidoPipe implements PipeTransform {
  private statusMap: { [key: string]: string } = {
    'em_aberto': 'Em Aberto',
    'carteira': 'Carteira',
    'baixado': 'Baixado',
    'cancelado': 'Cancelado',
    'pendente': 'Pendente',
    'finalizado': 'Finalizado'
  };

  transform(value: string): string {
    if (!value) {
      return '';
    }

    // Retorna o status formatado ou o valor original se não encontrar no mapa
    return this.statusMap[value.toLowerCase()] || this.formatarStatus(value);
  }

  /**
   * Formata o status caso não esteja no mapa
   * Converte snake_case para Title Case
   */
  private formatarStatus(status: string): string {
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
}

