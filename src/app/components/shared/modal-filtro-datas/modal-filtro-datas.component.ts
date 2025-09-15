import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface FiltroData {
  dataInicio: string;
  dataFim: string;
}

@Component({
  selector: 'app-modal-filtro-datas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modal-filtro-datas.component.html',
  styleUrls: ['./modal-filtro-datas.component.scss']
})
export class ModalFiltroDatasComponent implements OnInit, OnChanges {
  @Input() isVisible: boolean = false;
  @Input() titulo: string = 'Filtrar por Período';
  @Input() dataInicial: string = '';
  @Input() dataFinal: string = '';
  
  @Output() onConfirmar = new EventEmitter<FiltroData>();
  @Output() onCancelar = new EventEmitter<void>();
  @Output() onFechar = new EventEmitter<void>();

  dataInicio: string = '';
  dataFim: string = '';

  ngOnInit(): void {
    this.dataInicio = this.dataInicial;
    this.dataFim = this.dataFinal;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isVisible'] && this.isVisible) {
      this.dataInicio = this.dataInicial;
      this.dataFim = this.dataFinal;
    }
  }

  confirmar(): void {
    if (this.validarDatas()) {
      this.onConfirmar.emit({
        dataInicio: this.dataInicio,
        dataFim: this.dataFim
      });
      this.fecharModal();
    }
  }

  cancelar(): void {
    this.dataInicio = this.dataInicial;
    this.dataFim = this.dataFinal;
    this.onCancelar.emit();
    this.fecharModal();
  }

  fecharModal(): void {
    this.onFechar.emit();
  }

  private validarDatas(): boolean {
    if (!this.dataInicio || !this.dataFim) {
      alert('Por favor, preencha ambas as datas.');
      return false;
    }

    const inicio = new Date(this.dataInicio);
    const fim = new Date(this.dataFim);

    if (inicio > fim) {
      alert('A data de início deve ser anterior à data de fim.');
      return false;
    }

    return true;
  }

  definirPeriodoPreDefinido(periodo: string): void {
    const hoje = new Date();
    let dataInicio = new Date();
    let dataFim = new Date();

    switch (periodo) {
      case 'ultima-semana':
        dataInicio.setDate(hoje.getDate() - 7);
        dataFim = new Date(hoje);
        break;
      case 'ultimo-mes':
        dataInicio.setMonth(hoje.getMonth() - 1);
        dataFim = new Date(hoje);
        break;
      case 'ultimos-3-meses':
        dataInicio.setMonth(hoje.getMonth() - 3);
        dataFim = new Date(hoje);
        break;
      case 'ultimo-ano':
        dataInicio.setFullYear(hoje.getFullYear() - 1);
        dataFim = new Date(hoje);
        break;
      case 'proximo-mes':
        dataInicio = new Date(hoje);
        dataFim.setMonth(hoje.getMonth() + 1);
        break;
      case 'padrao':
        dataInicio.setFullYear(hoje.getFullYear() - 1);
        dataFim.setDate(hoje.getDate() + 7);
        break;
    }

    this.dataInicio = dataInicio.toISOString().split('T')[0];
    this.dataFim = dataFim.toISOString().split('T')[0];
  }

  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.fecharModal();
    }
  }
}
