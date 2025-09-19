import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FluxoCaixaService, ContaCaixa } from '../../../services/fluxo-caixa.service';

@Component({
  selector: 'app-seletor-conta-caixa',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './seletor-conta-caixa.component.html',
  styleUrls: ['./seletor-conta-caixa.component.scss']
})
export class SeletorContaCaixaComponent implements OnInit {
  @Input() label: string = 'Conta Caixa';
  @Input() placeholder: string = 'Selecione uma conta';
  @Input() contaSelecionadaId: number | null = null;
  @Input() required: boolean = false;
  @Input() disabled: boolean = false;
  
  @Output() contaSelecionada = new EventEmitter<ContaCaixa | null>();
  @Output() contaIdSelecionada = new EventEmitter<number | null>();

  contas: ContaCaixa[] = [];
  carregandoContas = false;
  erroCarregamento = false;

  constructor(private fluxoCaixaService: FluxoCaixaService) {}

  ngOnInit(): void {
    this.carregarContas();
  }

  private carregarContas(): void {
    this.carregandoContas = true;
    this.erroCarregamento = false;

    this.fluxoCaixaService.getContas().subscribe({
      next: (contas) => {
        this.contas = contas.filter(conta => conta.ativo);
        this.carregandoContas = false;
      },
      error: (error) => {
        console.error('Erro ao carregar contas de caixa:', error);
        this.erroCarregamento = true;
        this.carregandoContas = false;
      }
    });
  }

  onContaChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const contaId = target.value ? parseInt(target.value) : null;
    
    this.contaSelecionadaId = contaId;
    this.contaIdSelecionada.emit(contaId);

    if (contaId) {
      const conta = this.contas.find(c => c.id === contaId);
      this.contaSelecionada.emit(conta || null);
    } else {
      this.contaSelecionada.emit(null);
    }
  }

  recarregarContas(): void {
    this.carregarContas();
  }
}
