import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';
import { ContasReceberGraficoItem } from '../../../services/contas-receber.service';

Chart.register(...registerables);

@Component({
  selector: 'app-grafico-barras-contas-receber',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './grafico-barras-contas-receber.component.html',
  styleUrls: ['./grafico-barras-contas-receber.component.scss']
})
export class GraficoBarrasContasReceberComponent implements OnInit, OnDestroy, OnChanges {
  @Input() dados: ContasReceberGraficoItem[] = [];
  @Input() titulo: string = 'Gráfico de Barras - Contas a Receber';
  @Output() onFiltroClick = new EventEmitter<void>();

  @ViewChild('chartCanvas', { static: true }) chartCanvas!: ElementRef<HTMLCanvasElement>;

  private chart: Chart | null = null;
  private graficoInicializado = false;

  ngOnInit(): void {
    // Aguardar os dados chegarem via ngOnChanges
    if (this.dados && this.dados.length > 0) {
      this.criarGrafico();
    }
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  ngOnChanges(): void {
    if (this.chart) {
      this.atualizarGrafico();
    } else if (this.dados && this.dados.length > 0 && !this.graficoInicializado) {
      this.graficoInicializado = true;
      setTimeout(() => this.criarGrafico(), 100);
    }
  }

  abrirFiltro(): void {
    this.onFiltroClick.emit();
  }

  private criarGrafico(): void {
    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const dadosProcessados = this.processarDados();

    const config: ChartConfiguration = {
      type: 'bar' as ChartType,
      data: {
        labels: dadosProcessados.labels,
        datasets: [{
          label: 'Valor Total (R$)',
          data: dadosProcessados.valores,
          backgroundColor: '#28a745',
          borderColor: '#1e7e34',
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
            display: false
          },
          legend: {
            display: true,
            position: 'top',
            labels: {
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            callbacks: {
              title: (context) => {
                return `Data: ${context[0].label}`;
              },
              label: (context) => {
                const valor = context.parsed.y;
                const index = context.dataIndex;
                const qtdParcelas = dadosProcessados.quantidades[index];
                return [
                  `Valor: ${this.formatarMoeda(valor)}`,
                  `Parcelas: ${qtdParcelas}`
                ];
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => {
                return this.formatarMoeda(Number(value));
              },
              font: {
                size: 10
              }
            },
            grid: {
              color: '#e0e0e0'
            }
          },
          x: {
            ticks: {
              maxRotation: 45,
              minRotation: 0,
              font: {
                size: 10
              }
            },
            grid: {
              display: false
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
    if (!this.chart) return;

    const dadosProcessados = this.processarDados();
    
    this.chart.data.labels = dadosProcessados.labels;
    this.chart.data.datasets[0].data = dadosProcessados.valores;
    this.chart.update();
  }

  private processarDados(): { labels: string[], valores: number[], quantidades: number[] } {
    if (!this.dados || this.dados.length === 0) {
      return { labels: [], valores: [], quantidades: [] };
    }

    const labels = this.dados.map(item => this.formatarData(item.dataVencimento));
    const valores = this.dados.map(item => item.valorTotalParcelas);
    const quantidades = this.dados.map(item => item.qtdParcelas);

    return { labels, valores, quantidades };
  }

  private formatarData(data: string): string {
    try {
      const date = new Date(data);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit'
      });
    } catch {
      return data;
    }
  }

  private formatarMoeda(valor: number): string {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }
}
