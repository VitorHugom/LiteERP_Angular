import { Component, OnInit } from '@angular/core';
import { ProdutosService } from '../../services/produtos.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cadastro-produto',
  standalone: true,
  templateUrl: './produtos-cadastro.component.html',
  styleUrls: ['./produtos-cadastro.component.scss'],
  imports: [CommonModule, FormsModule]
})
export class ProdutosCadastroComponent implements OnInit {
  isNew = true;
  produto: any = {
    id: null,
    descricao: '',
    grupoProdutos: null,
    marca: '',
    dataUltimaCompra: '',
    codEan: '',
    codNcm: '',
    codCest: '',
    precoCompra: null,
    precoVenda: null,
    peso: null
  };

  activeTab = 'geral'; // Aba ativa, começa com "geral"
  message: string | null = null; // Mensagem de feedback
  isSuccess: boolean = true; // Status da operação

  constructor(
    private produtoService: ProdutosService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isNew = false;
      this.produtoService.getProdutoById(id).subscribe({
        next: (data) => {
          this.produto = data;
        },
        error: (err) => {
          console.error('Erro ao carregar produto:', err);
        }
      });
    }
  }

  onSave(): void {
    if (this.isNew) {
      this.produtoService.createProduto(this.produto).subscribe({
        next: (response) => {
          this.produto = response;  // Atualiza o produto com a resposta, que inclui o ID
          this.isNew = false;       // Agora não é mais um novo produto
          this.exibirMensagem('Produto cadastrado com sucesso!', true);
        },
        error: (err) => {
          this.exibirMensagem('Erro ao cadastrar produto. Tente novamente.', false);
          console.error('Erro ao cadastrar produto:', err);
        }
      });
    } else {
      this.produtoService.updateProduto(this.produto.id, this.produto).subscribe({
        next: (response) => {
          this.exibirMensagem('Produto atualizado com sucesso!', true);
        },
        error: (err) => {
          this.exibirMensagem('Erro ao atualizar produto. Tente novamente.', false);
          console.error('Erro ao atualizar produto:', err);
        }
      });
    }
  }
  

  onDelete(): void {
    if (this.produto.id) {
      const confirmacao = confirm('Tem certeza que deseja deletar este produto?');
      if (confirmacao) {
        this.produtoService.deleteProduto(this.produto.id).subscribe({
          next: () => {
            this.exibirMensagem('Produto deletado com sucesso!', true);
            this.router.navigate(['/busca-produtos']);
          },
          error: (err) => {
            this.exibirMensagem('Erro ao deletar produto. Tente novamente.', false);
            console.error('Erro ao deletar produto:', err);
          }
        });
      }
    } else {
      this.exibirMensagem('Nenhum produto selecionado para deletar.', false);
    }
  }

  onNew(): void {
    this.isNew = true;
    this.produto = {
      id: null,
      descricao: '',
      grupoProdutos: null,
      marca: '',
      dataUltimaCompra: '',
      codEan: '',
      codNcm: '',
      codCest: '',
      precoCompra: null,
      precoVenda: null,
      peso: null
    };
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  onConsultar(): void {
    this.router.navigate(['/busca-produtos']);
  }

  // Função para exibir mensagem com timeout de 5 segundos
  exibirMensagem(mensagem: string, isSuccess: boolean): void {
    this.message = mensagem;
    this.isSuccess = isSuccess;
    setTimeout(() => {
      this.message = null;
    }, 3000); // Mensagem desaparece após 5 segundos
  }
}
