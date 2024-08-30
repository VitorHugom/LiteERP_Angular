import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BuscaLiberacaoService } from '../../services/busca-liberacao.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-busca-liberacao',
  standalone: true,
  templateUrl: './busca-liberacao.component.html',
  styleUrls: ['./busca-liberacao.component.scss'],
  imports: [FormsModule, CommonModule, RouterModule]
})
export class BuscaLiberacaoComponent implements OnInit {
  usuarios: any[] = [];
  filteredUsuarios: any[] = [];
  searchQuery: string = '';
  searchBy: string = 'nomeUsuario';

  constructor(private buscaLiberacaoService: BuscaLiberacaoService, private router: Router) {}

  ngOnInit(): void {
    this.loadUsuariosBloqueados();
  }

  loadUsuariosBloqueados(): void {
    this.buscaLiberacaoService.getUsuariosBloqueados().subscribe({
      next: (data) => {
        this.usuarios = data;
        this.filteredUsuarios = data;
      },
      error: (err) => {
        console.error('Erro ao carregar usuários bloqueados:', err);
      }
    });
  }

  searchUsuarios(): void {
    const query = this.searchQuery.toLowerCase();
    if (this.searchBy === 'id') {
      this.filteredUsuarios = this.usuarios.filter(usuario => usuario.id.toString().includes(query));
    } else if (this.searchBy === 'nomeUsuario') {
      this.filteredUsuarios = this.usuarios.filter(usuario => usuario.nomeUsuario.toLowerCase().includes(query));
    }
  }

  autorizarUsuario(id: string): void {
    this.router.navigate(['/liberacao', id]);
  }
  navigateToHome(): void {
    this.router.navigate(['/gerencial-home']);
  }
}
