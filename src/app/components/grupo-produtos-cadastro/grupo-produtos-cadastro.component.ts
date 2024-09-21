import { Component, OnInit } from '@angular/core';
import { GrupoProdutosService } from '../../services/grupo-produtos.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-grupo-produtos-cadastro',
  standalone: true,
  templateUrl: './grupo-produtos-cadastro.component.html',
  styleUrls: ['./grupo-produtos-cadastro.component.scss'],
  imports: [CommonModule, FormsModule, RouterLink]
})
export class GrupoProdutosCadastroComponent implements OnInit {
  isNew = true;
  grupoProduto: any = {
    id: null,
    nome: ''
  };

  message: string | null = null; // Mensagem de feedback
  isSuccess: boolean = true; // Status da operação

  constructor(
    private grupoProdutosService: GrupoProdutosService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id && id !== 'novo') {
      this.isNew = false;
      // Carregar o grupo de produto existente
      this.grupoProdutosService.getGrupoProdutoById(+id).subscribe({
        next: (data) => {
          this.grupoProduto = data;
        },
        error: (err) => {
          console.error('Erro ao carregar grupo de produto:', err);
          this.exibirMensagem('Erro ao carregar grupo de produto.', false);
        }
      });
    } else {
      this.isNew = true; // Indica que é um novo grupo
    }

    // Caso haja algum outro carregamento necessário, você pode adicionar aqui
  }


  onSave(): void {
    if (!this.grupoProduto.nome) {
      this.exibirMensagem('Nome é obrigatório.', false);
      return;
    }

    if (this.isNew) {
      this.grupoProdutosService.createGrupoProduto(this.grupoProduto).subscribe({
        next: (response) => {
          this.grupoProduto = response;  // Atualiza o grupo com a resposta, que inclui o ID
          this.isNew = false;             // Agora não é mais um novo grupo
          this.exibirMensagem('Grupo de produto cadastrado com sucesso!', true);
        },
        error: (err) => {
          this.exibirMensagem('Erro ao cadastrar grupo de produto. Tente novamente.', false);
          console.error('Erro ao cadastrar grupo de produto:', err);
        }
      });
    } else {
      this.grupoProdutosService.updateGrupoProduto(this.grupoProduto.id, this.grupoProduto).subscribe({
        next: () => {
          this.exibirMensagem('Grupo de produto atualizado com sucesso!', true);
        },
        error: (err) => {
          this.exibirMensagem('Erro ao atualizar grupo de produto. Tente novamente.', false);
          console.error('Erro ao atualizar grupo de produto:', err);
        }
      });
    }
  }

  onDelete(): void {
    if (this.grupoProduto.id) {
      const confirmacao = confirm('Tem certeza que deseja deletar este grupo de produto?');
      if (confirmacao) {
        this.grupoProdutosService.deleteGrupoProduto(this.grupoProduto.id).subscribe({
          next: () => {
            this.exibirMensagem('Grupo de produto deletado com sucesso!', true);
            this.router.navigate(['/grupo-produtos-busca']);
          },
          error: (err) => {
            this.exibirMensagem('Erro ao deletar grupo de produto. Tente novamente.', false);
            console.error('Erro ao deletar grupo de produto:', err);
          }
        });
      }
    }
  }

  onNew(): void {
    this.isNew = true;
    this.grupoProduto = {
      id: null,
      nome: ''
    };
  }

  onConsultar(): void {
    this.router.navigate(['/grupo-produtos-busca']);
  }

  exibirMensagem(msg: string, sucesso: boolean): void {
    this.message = msg;
    this.isSuccess = sucesso;
    setTimeout(() => {
      this.message = null;
    }, 3000);
  }
}
