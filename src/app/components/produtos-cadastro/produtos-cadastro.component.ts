import { Component, OnInit } from '@angular/core';
import { ProdutosService } from '../../services/produtos.service'; // Certifique-se do caminho correto
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cadastro-produto',
  standalone: true,
  templateUrl: './produtos-cadastro.component.html',
  styleUrls: ['./produtos-cadastro.component.scss'],
  imports: [CommonModule, FormsModule] // Adiciona FormsModule para funcionar com ngModel
})
export class CadastroProdutoComponent implements OnInit {
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
      // Lógica para cadastrar novo produto
      console.log('Cadastrando novo produto', this.produto);
      // Chamar o serviço de criação
    } else {
      // Lógica para atualizar produto existente
      console.log('Salvando alterações no produto', this.produto);
      // Chamar o serviço de atualização
    }
  }

  onDelete(): void {
    // Lógica para deletar o produto
    console.log('Deletando produto', this.produto.id);
  }

  onNew(): void {
    // Limpar o formulário para um novo cadastro
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
    // Lógica para consultar produtos
    this.router.navigate(['/busca-produtos']);
  }
}
