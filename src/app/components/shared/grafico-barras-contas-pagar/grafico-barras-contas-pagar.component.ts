import { Component, OnInit, OnDestroy, ViewChild, ElementRef, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';
import { ContasPagarGraficoItem } from '../../../services/contas-pagar.service';

Chart.register(...registerables);

@Component({
  selector: 'app-grafico-barras-contas-pagar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './grafico-barras-contas-pagar.component.html',
  styleUrls: ['./grafico-barras-contas-pagar.component.scss']
})
export class GraficoBarrasContasPagarComponent implements OnInit, OnChanges {
  @ViewChild('chartCanvas', { static: true }) chartCanvas!: ElementRef<HTMLCanvasElement>;
  @Input() dados: ContasPagarGraficoItem[] = [];
  @Input() titulo: string = 'Valores de Contas a Pagar por Data';
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
    const valores = this.dados.map(item => item.valorTotalParcelas);

    const config: ChartConfiguration = {
      type: 'bar' as ChartType,
      data: {
        labels: labels,
        datasets: [{
          label: 'Valor Total (R$)',
          data: valores,
          backgroundColor: 'rgba(139, 101, 8, 0.8)',
          borderColor: 'rgba(139, 101, 8, 1)',
          borderWidth: 1,
          borderRadius: 4,
          borderSkipped: false,
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
                const valor = context.parsed.y;
                const index = context.dataIndex;
                const qtdParcelas = this.dados[index]?.qtdParcelas || 0;
                return [
                  `Valor: R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                  `Quantidade de parcelas: ${qtdParcelas}`
                ];
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return 'R$ ' + Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
              }
            },
            title: {
              display: true,
              text: 'Valor (R$)'
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
    const valores = this.dados.map(item => item.valorTotalParcelas);

    this.chart.data.labels = labels;
    this.chart.data.datasets[0].data = valores;
    this.chart.update();
  }

  private formatarData(data: string): string {
    try {
      const date = new Date(data);
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
