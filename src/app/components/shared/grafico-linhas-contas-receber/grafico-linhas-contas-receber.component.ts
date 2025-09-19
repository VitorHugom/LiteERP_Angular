import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';
import { ContasReceberGraficoItem } from '../../../services/contas-receber.service';

Chart.register(...registerables);

@Component({
  selector: 'app-grafico-linhas-contas-receber',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './grafico-linhas-contas-receber.component.html',
  styleUrls: ['./grafico-linhas-contas-receber.component.scss']
})
export class GraficoLinhasContasReceberComponent implements OnInit, OnDestroy, OnChanges {
  @Input() dados: ContasReceberGraficoItem[] = [];
  @Input() titulo: string = 'Gráfico de Linhas - Contas a Receber';
  @Output() onFiltroClick = new EventEmitter<void>();

  @ViewChild('chartCanvas', { static: true }) chartCanvas!: ElementRef<HTMLCanvasElement>;

  private chart: Chart | null = null;
  private graficoInicializado = false;

  ngOnInit(): void {
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
      type: 'line' as ChartType,
      data: {
        labels: dadosProcessados.labels,
        datasets: [{
          label: 'Quantidade de Parcelas',
          data: dadosProcessados.quantidades,
          borderColor: '#28a745',
          backgroundColor: 'rgba(40, 167, 69, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#28a745',
          pointBorderColor: '#1e7e34',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7,
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
                const qtd = context.parsed.y;
                const index = context.dataIndex;
                const valor = dadosProcessados.valores[index];
                return [
                  `Parcelas: ${qtd}`,
                  `Valor Total: ${this.formatarMoeda(valor)}`
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
    this.chart.data.datasets[0].data = dadosProcessados.quantidades;
    this.chart.update();
  }

  private processarDados(): { labels: string[], quantidades: number[], valores: number[] } {
    if (!this.dados || this.dados.length === 0) {
      return { labels: [], quantidades: [], valores: [] };
    }

    const labels = this.dados.map(item => this.formatarData(item.dataVencimento));
    const quantidades = this.dados.map(item => item.qtdParcelas);
    const valores = this.dados.map(item => item.valorTotalParcelas);

    return { labels, quantidades, valores };
  }

  private formatarData(data: string): string {
    try {
      // Evitar problemas de fuso horário fazendo parsing manual
      const [ano, mes, dia] = data.split('-');
      const date = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
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
