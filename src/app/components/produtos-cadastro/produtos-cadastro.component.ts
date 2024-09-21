import { Component, OnInit } from '@angular/core';
import { ProdutosService } from '../../services/produtos.service';
import { GrupoProdutosService } from '../../services/grupo-produtos.service';
import { ActivatedRoute, Router,RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cadastro-produto',
  standalone: true,
  templateUrl: './produtos-cadastro.component.html',
  styleUrls: ['./produtos-cadastro.component.scss'],
  imports: [CommonModule, FormsModule,RouterLink]
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

  gruposProdutos: any[] = []; // Armazena todos os grupos de produtos
  activeTab = 'geral'; // Aba ativa, começa com "geral"
  message: string | null = null; // Mensagem de feedback
  isSuccess: boolean = true; // Status da operação

  constructor(
    private produtoService: ProdutosService,
    private grupoProdutosService: GrupoProdutosService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id && id !== 'novo') {
      this.isNew = false;
      this.produtoService.getProdutoById(id).subscribe({
        next: (data) => {
          this.produto = data;
          // Carregar grupos de produtos após obter o produto
          this.loadGruposProdutos();
        },
        error: (err) => {
          console.error('Erro ao carregar produto:', err);
        }
      });
    } else {
      this.isNew = true; // Indica que é um novo produto
      this.loadGruposProdutos(); // Carregar grupos de produtos para novos produtos
    }
  }

  // Carregar grupos de produtos
  loadGruposProdutos(): void {
    this.grupoProdutosService.getGruposProdutos().subscribe({
      next: (data) => {
        this.gruposProdutos = data; // Recebe e armazena os grupos de produtos
        if (this.produto.grupoProdutos) {
          // Atualiza grupo de produtos após carregar todos os grupos disponíveis
          this.produto.grupoProdutos = this.gruposProdutos.find(grupo => grupo.id === this.produto.grupoProdutos.id);
        }
      },
      error: (err) => {
        console.error('Erro ao carregar grupos de produtos:', err);
      }
    });
  }

  onSave(): void {
    if (!this.produto.descricao || !this.produto.codEan || !this.produto.precoVenda) {
      this.exibirMensagem('Preencha todos os campos obrigatórios.', false);
      return;
    }

    if (!this.produto.codNcm || this.produto.codNcm.length !== 8) {
      this.exibirMensagem('Código NCM deve conter 8 dígitos.', false);
      return;
    }

    if (this.isNew) {
      this.produtoService.createProduto(this.produto).subscribe({
        next: (response) => {
          this.produto = response;
          this.isNew = false;
          this.exibirMensagem('Produto cadastrado com sucesso!', true);
        },
        error: (err) => {
          this.exibirMensagem('Erro ao cadastrar produto.', false);
          console.error(err);
        }
      });
    } else {
      this.produtoService.updateProduto(this.produto.id, this.produto).subscribe({
        next: () => {
          this.exibirMensagem('Produto atualizado com sucesso!', true);
        },
        error: (err) => {
          this.exibirMensagem('Erro ao atualizar produto.', false);
          console.error(err);
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
