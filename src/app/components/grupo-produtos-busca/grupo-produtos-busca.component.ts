import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { GrupoProdutosService } from '../../services/grupo-produtos.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-grupo-produtos-busca',
  standalone: true,
  templateUrl: './grupo-produtos-busca.component.html',
  styleUrls: ['./grupo-produtos-busca.component.scss'],
  imports: [FormsModule, CommonModule, RouterModule],
  providers: [GrupoProdutosService]
})
export class GrupoProdutosBuscaComponent implements OnInit {
  grupos: any[] = [];
  filteredGrupos: any[] = [];
  searchQuery: string = '';
  searchBy: string = 'nome';
  page: number = 0;
  size: number = 10;
  totalPages: number = 0;
  lastSearchQuery: string = '';
  lastSearchBy: string = '';


  constructor(private grupoProdutosService: GrupoProdutosService, private router: Router) {}

  ngOnInit(): void {
    this.loadGrupos();
  }

  loadGrupos(): void {
    this.grupoProdutosService.getProdutosBusca(this.page).subscribe({
      next: (data) => {
        this.grupos = data.content;
        this.filteredGrupos = this.grupos;
        this.totalPages = data.totalPages;
      },
      error: (err) => console.error('Erro ao carregar grupos:', err)
    });
  }

  searchGrupos(keepPage: boolean = false): void {
    if (!keepPage) this.page = 0;
    this.lastSearchQuery = this.searchQuery;
    this.lastSearchBy = this.searchBy;
  
    if (this.searchQuery === '') {
      this.loadGrupos();
      return;
    }
  
    if (this.searchBy === 'id') {
      const id = Number(this.searchQuery);
      if (!isNaN(id)) {
        this.grupoProdutosService.getGrupoProdutoById(id).subscribe({
          next: (data) => this.filteredGrupos = [data],
          error: (err) => { console.error('Erro ao buscar por ID:', err); this.filteredGrupos = []; }
        });
      } else {
        this.filteredGrupos = [];
      }
    } else {
      this.grupoProdutosService.buscarGrupoProdutosPorDescricao(this.searchQuery, this.page).subscribe({
        next: (data) => {
          this.filteredGrupos = data.content;
          this.totalPages = data.totalPages;
        },
        error: (err) => { console.error('Erro ao buscar por nome:', err); this.filteredGrupos = []; }
      });
    }
  }  

  viewGrupo(id: string): void {
    this.router.navigate(['/grupo-produtos', id]);
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.page = page;
      if (this.lastSearchQuery) {
        this.searchQuery = this.lastSearchQuery;
        this.searchBy = this.lastSearchBy;
        this.searchGrupos(true);
      } else {
        this.loadGrupos();
      }
    }
  }
  

  navigateToHome(): void {
    this.router.navigate(['/gerencial']);
  }

  createNovoGrupo(): void {
    this.router.navigate(['/grupo-produtos/novo']);
  }
}
