import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FornecedoresService } from '../../services/fornecedores.service';

@Component({
  selector: 'app-fornecedores-busca',
  standalone: true,
  templateUrl: './fornecedores-busca.component.html',
  styleUrls: ['./fornecedores-busca.component.scss'],
  imports: [FormsModule, CommonModule, RouterModule],
  providers: [FornecedoresService]
})
export class FornecedoresBuscaComponent implements OnInit {
  fornecedores: any[] = [];
  searchQuery: string = '';
  searchBy: string = 'razaoSocial';
  page: number = 0;
  totalPages: number = 0;
  lastSearchQuery: string = '';
  lastSearchBy: string = '';

  constructor(private fornecedoresService: FornecedoresService, private router: Router) {}

  ngOnInit(): void {
    this.loadFornecedores();
  }

  loadFornecedores(): void {
    this.fornecedoresService.getFornecedoresBusca(this.page).subscribe({
      next: (data) => {
        this.fornecedores = data.content;
        this.totalPages = data.totalPages;
      },
      error: (err) => {
        console.error('Erro ao carregar fornecedores:', err);
      }
    });
  }

  searchFornecedores(): void {
    this.page = 0;
    this.lastSearchQuery = this.searchQuery;
    this.lastSearchBy = this.searchBy;

    if (!this.searchQuery) {
      this.loadFornecedores();
      return;
    }

    if (this.searchBy === 'id') {
      this.fornecedoresService.getFornecedorByIdBusca(this.searchQuery).subscribe({
        next: (data) => {
          this.fornecedores = data ? [data] : [];
          this.totalPages = 1;
        },
        error: (err) => {
          console.error('Erro ao buscar fornecedor por ID:', err);
          this.fornecedores = [];
        }
      });
    } else if (this.searchBy === 'razaoSocial') {
      this.fornecedoresService.getFornecedoresByRazaoSocialBusca(this.searchQuery, this.page).subscribe({
        next: (data) => {
          this.fornecedores = data.content;
          this.totalPages = data.totalPages;
        },
        error: (err) => {
          console.error('Erro ao buscar fornecedores por Razão Social:', err);
          this.fornecedores = [];
        }
      });
    }
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.page = page;

      if (this.lastSearchQuery) {
        this.searchQuery = this.lastSearchQuery;
        this.searchBy = this.lastSearchBy;
        this.searchFornecedores();
      } else {
        this.loadFornecedores();
      }
    }
  }

  viewFornecedor(id: string): void {
    this.router.navigate(['/fornecedor', id]);
  }

  navigateToHome(): void {
    const role = sessionStorage.getItem('user-role');
    if (role === 'ROLE_GERENCIAL'){
      this.router.navigate(['/gerencial-home']);
    } else if (role === 'ROLE_VENDAS'){
      this.router.navigate(['/vendas-home']);
    }  
  }

  createNovoFornecedor(): void {
    this.router.navigate(['/fornecedores/novo']);
  }
}
