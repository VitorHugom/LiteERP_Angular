import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EstoqueService } from '../../services/estoque.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-busca-estoque',
  standalone: true,
  templateUrl: './estoque-busca.component.html',
  styleUrls: ['./estoque-busca.component.scss'],
  imports: [FormsModule, CommonModule, RouterModule],
  providers: [EstoqueService]
})
export class EstoqueBuscaComponent implements OnInit {
  produtos: any[] = [];
  descricao: string = '';
  page: number = 0;
  size: number = 10;
  totalPages: number = 0;

  constructor(private estoqueService: EstoqueService, private router: Router) {}

  ngOnInit(): void {
    this.loadProdutos();
  }

  loadProdutos(): void {
    this.estoqueService.buscarProdutosNoEstoquePorDescricao(this.descricao, this.page, this.size).subscribe({
      next: (data) => {
        this.produtos = data.content;
        this.totalPages = data.totalPages;
      },
      error: (err) => {
        console.error('Erro ao carregar produtos no estoque:', err);
      }
    });
  }

  searchEstoque(): void {
    this.page = 0; // Reinicia a paginação ao buscar
    this.loadProdutos();
  }

  navigateToHome(): void {
    this.router.navigate(['/gerencial-home']);
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.page = page;
      this.loadProdutos();
    }
  }
}
