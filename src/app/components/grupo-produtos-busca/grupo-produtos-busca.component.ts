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

  constructor(private grupoProdutosService: GrupoProdutosService, private router: Router) {}

  ngOnInit(): void {
    this.loadGrupos();
  }

  loadGrupos(): void {
    this.grupoProdutosService.getGruposProdutos().subscribe({
      next: (data) => {
        this.grupos = data;
        this.filteredGrupos = data;
      },
      error: (err) => {
        console.error('Erro ao carregar grupos:', err);
      }
    });
  }

  searchGruposProdutos(): void {
    const query = this.searchQuery.toLowerCase();
    if (this.searchBy === 'id') {
      this.filteredGrupos = this.grupos.filter(grupo => grupo.id.toString().includes(query));
    } else if (this.searchBy === 'nome') {
      this.filteredGrupos = this.grupos.filter(grupo => grupo.nome.toLowerCase().includes(query));
    }
  }

  viewGrupo(id: string): void {
    this.router.navigate(['/grupo-produtos', id]);
  }

  navigateToHome(): void {
    this.router.navigate(['/gerencial-home']);
  }

  createNovoGrupo(): void {
    this.router.navigate(['/grupo-produtos/novo']);
  }
}
