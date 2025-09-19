import { Component, OnInit, ViewChild, ElementRef, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';
import { ContasPagarGraficoItem } from '../../../services/contas-pagar.service';

Chart.register(...registerables);

@Component({
  selector: 'app-grafico-linhas-contas-pagar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './grafico-linhas-contas-pagar.component.html',
  styleUrls: ['./grafico-linhas-contas-pagar.component.scss']
})
export class GraficoLinhasContasPagarComponent implements OnInit, OnChanges {
  @ViewChild('chartCanvas', { static: true }) chartCanvas!: ElementRef<HTMLCanvasElement>;
  @Input() dados: ContasPagarGraficoItem[] = [];
  @Input() titulo: string = 'Quantidade de Contas a Pagar por Data';
  @Input() altura: number = 350;

  @Output() onFiltroClick = new EventEmitter<void>();

  private chart: Chart | null = null;

  ngOnInit(): void {
    this.criarGrafico();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dados'] && !changes['dados'].firstChange) {
      this.atualizarGrafico();
    }
  }

  private criarGrafico(): void {
    if (this.chart) {
      this.chart.destroy();
    }

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const labels = this.dados.map(item => this.formatarData(item.dataVencimento));
    const quantidades = this.dados.map(item => item.qtdParcelas);

    const config: ChartConfiguration = {
      type: 'line' as ChartType,
      data: {
        labels: labels,
        datasets: [{
          label: 'Quantidade de Parcelas',
          data: quantidades,
          borderColor: 'rgba(139, 101, 8, 1)',
          backgroundColor: 'rgba(139, 101, 8, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: 'rgba(139, 101, 8, 1)',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: this.titulo,
            font: {
              size: 16,
              weight: 'bold'
            }
          },
          legend: {
            display: true,
            position: 'top'
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const quantidade = context.parsed.y;
                const index = context.dataIndex;
                const valor = this.dados[index]?.valorTotalParcelas || 0;
                return [
                  `Quantidade: ${quantidade} parcela${quantidade !== 1 ? 's' : ''}`,
                  `Valor total: R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                ];
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              callback: function(value) {
                return Number(value).toString();
              }
            },
            title: {
              display: true,
              text: 'Quantidade de Parcelas'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Data de Vencimento'
            }
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        },
        elements: {
          point: {
            hoverBackgroundColor: 'rgba(139, 101, 8, 1)',
            hoverBorderColor: '#ffffff'
          }
        }
      }
    };

    this.chart = new Chart(ctx, config);
  }

  private atualizarGrafico(): void {
    if (!this.chart) {
      this.criarGrafico();
      return;
    }

    const labels = this.dados.map(item => this.formatarData(item.dataVencimento));
    const quantidades = this.dados.map(item => item.qtdParcelas);

    this.chart.data.labels = labels;
    this.chart.data.datasets[0].data = quantidades;
    this.chart.update();
  }

  private formatarData(data: string): string {
    try {
      // Evitar problemas de fuso horário fazendo parsing manual
      const [ano, mes, dia] = data.split('-');
      const date = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return data;
    }
  }

  abrirFiltro(): void {
    this.onFiltroClick.emit();
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }
}
