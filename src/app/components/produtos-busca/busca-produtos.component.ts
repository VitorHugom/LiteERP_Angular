import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProdutosService } from '../../services/produtos.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-busca-produtos',
  standalone: true,
  templateUrl: './busca-produtos.component.html',
  styleUrls: ['./busca-produtos.component.scss'],
  imports: [FormsModule, CommonModule, RouterModule],
  providers: [ProdutosService]
})
export class ProdutosBuscaComponent implements OnInit {
  produtos: any[] = [];
  filteredProdutos: any[] = [];
  searchQuery: string = '';
  searchBy: string = 'descricao';

  constructor(private produtosService: ProdutosService, private router: Router) {}

  ngOnInit(): void {
    this.loadProdutos();
  }

  loadProdutos(): void {
    this.produtosService.getProdutos().subscribe({
      next: (data) => {
        this.produtos = data;
        this.filteredProdutos = data;
      },
      error: (err) => {
        console.error('Erro ao carregar produtos:', err);
      }
    });
  }

  searchProdutos(): void {
    const query = this.searchQuery.toLowerCase();
    if (this.searchBy === 'id') {
      this.filteredProdutos = this.produtos.filter(produto => produto.id.toString().includes(query));
    } else if (this.searchBy === 'descricao') {
      this.filteredProdutos = this.produtos.filter(produto => produto.descricao.toLowerCase().includes(query));
    }
  }

  viewProduto(id: string): void {
    this.router.navigate(['/produtos', id]);
  }

  navigateToHome(): void {
    this.router.navigate(['/gerencial-home']);
  }
}