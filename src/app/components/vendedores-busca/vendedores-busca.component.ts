import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { VendedoresService } from '../../services/vendedores.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-vendedores-busca',
  standalone: true,
  templateUrl: './vendedores-busca.component.html',
  styleUrls: ['./vendedores-busca.component.scss'],
  imports: [FormsModule, CommonModule, RouterModule],
  providers: [VendedoresService]
})
export class VendedoresBuscaComponent implements OnInit {
  vendedores: any[] = [];
  filteredVendedores: any[] = [];
  searchQuery: string = '';
  searchBy: string = 'nome';

  constructor(private vendedoresService: VendedoresService, private router: Router) {}

  ngOnInit(): void {
    this.loadVendedores();
  }

  loadVendedores(): void {
    this.vendedoresService.getVendedores().subscribe({
      next: (data) => {
        this.vendedores = data;
        this.filteredVendedores = data;
      },
      error: (err) => {
        console.error('Erro ao carregar vendedores:', err);
      }
    });
  }

  searchVendedores(): void {
    const query = this.searchQuery.toLowerCase();
    if (this.searchBy === 'id') {
      this.filteredVendedores = this.vendedores.filter(vendedor => vendedor.id.toString().includes(query));
    } else if (this.searchBy === 'nome') {
      this.filteredVendedores = this.vendedores.filter(vendedor => vendedor.nome.toLowerCase().includes(query));
    }
  }

  viewVendedor(id: string): void {
    this.router.navigate(['/vendedores', id]);
  }

  navigateToHome(): void {
    this.router.navigate(['/gerencial-home']);
  }

  createNovoVendedor(): void {
    this.router.navigate(['/vendedores/novo']);
  }
}
