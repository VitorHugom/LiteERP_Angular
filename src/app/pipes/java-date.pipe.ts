import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe para converter datas que vêm do Java no formato de array
 * [ano, mês, dia, hora, minuto, segundo, nanossegundo]
 * para um objeto Date do JavaScript
 */
@Pipe({
  name: 'javaDate',
  standalone: true
})
export class JavaDatePipe implements PipeTransform {
  transform(value: any): Date | null {
    if (!value) {
      return null;
    }

    // Se já for uma Date, retorna
    if (value instanceof Date) {
      return value;
    }

    // Se for uma string ISO, converte para Date
    if (typeof value === 'string') {
      return new Date(value);
    }

    // Se for um array (formato do Java LocalDateTime)
    if (Array.isArray(value) && value.length >= 3) {
      // Array format: [year, month, day, hour, minute, second, nanosecond]
      const [year, month, day, hour = 0, minute = 0, second = 0, nano = 0] = value;
      
      // Mês no JavaScript é 0-indexed, então subtraímos 1
      return new Date(year, month - 1, day, hour, minute, second, Math.floor(nano / 1000000));
    }

    // Se for um número (timestamp), converte
    if (typeof value === 'number') {
      return new Date(value);
    }

    return null;
  }
}

