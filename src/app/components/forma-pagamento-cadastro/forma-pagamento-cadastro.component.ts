import { Component, OnInit } from '@angular/core';
import { FormaPagamentoService } from '../../services/forma-pagamento.service';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NavigateToSearchButtonComponent } from '../shared/navigate-to-search-button/navigate-to-search-button.component';


@Component({
  selector: 'app-forma-pagamento-cadastro',
  standalone: true,
  templateUrl: './forma-pagamento-cadastro.component.html',
  styleUrls: ['./forma-pagamento-cadastro.component.scss'],
  imports: [RouterModule, CommonModule, FormsModule,NavigateToSearchButtonComponent]
})
export class FormaPagamentoCadastroComponent implements OnInit {
  isNew = true;
  formaPagamento: any = {
    id: null,
    descricao: '',
    diasFormaPagamento: []
  };
  diasFormaPagamento: number | null = null;
  message: string | null = null;
  isSuccess = true;

  urlFormasPagamento = '/forma-pagamento-busca'

  constructor(
    private formaPagamentoService: FormaPagamentoService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'novo') {
      this.isNew = false;
      this.formaPagamentoService.getFormaPagamentoById(+id).subscribe({
        next: (data) => this.formaPagamento = data,
        error: () => this.exibirMensagem('Erro ao carregar forma de pagamento.', false)
      });
    }
  }

  onSave(): void {
    if (!this.formaPagamento.descricao) {
      this.exibirMensagem('Descrição é obrigatória.', false);
      return;
    }

    const saveObservable = this.isNew
      ? this.formaPagamentoService.createFormaPagamento(this.formaPagamento)
      : this.formaPagamentoService.updateFormaPagamento(this.formaPagamento.id, this.formaPagamento);

    saveObservable.subscribe({
      next: (response) => {
        this.exibirMensagem('Forma de pagamento salva com sucesso!', true);
        // Atualiza o ID com base na resposta do backend
        if (this.isNew && response?.id) {
          this.formaPagamento.id = response.id;
          this.isNew = false; // Agora o registro não é mais novo
        }
      },
      error: () => this.exibirMensagem('Erro ao salvar forma de pagamento.', false)
    });
  }

  adicionardiasFormaPagamento(): void {
    if (this.diasFormaPagamento !== null && !this.formaPagamento.diasFormaPagamento.includes(this.diasFormaPagamento)) {
      this.formaPagamento.diasFormaPagamento.push(this.diasFormaPagamento);
      this.diasFormaPagamento = null;
    }
  }

  removerdiasFormaPagamento(index: number): void {
    this.formaPagamento.diasFormaPagamento.splice(index, 1);
  }

  exibirMensagem(msg: string, sucesso: boolean): void {
    this.message = msg;
    this.isSuccess = sucesso;
    setTimeout(() => this.message = null, 3000);
  }

  onNew(): void {
    this.isNew = true;
    this.formaPagamento = { id: null, descricao: '', diasFormaPagamento: [] };
  }

  onDelete(): void {
    if (this.formaPagamento.id && confirm('Tem certeza que deseja deletar esta forma de pagamento?')) {
      this.formaPagamentoService.deleteFormaPagamento(this.formaPagamento.id).subscribe({
        next: () => this.router.navigate(['/forma-pagamento-busca']),
        error: () => this.exibirMensagem('Erro ao deletar forma de pagamento.', false)
      });
    }
  }

  onConsultar(): void {
    this.router.navigate(['/forma-pagamento-busca']);
  }
}
