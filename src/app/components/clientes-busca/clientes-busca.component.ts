import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ClientesService } from '../../services/clientes.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-clientes-busca',
  standalone: true,
  templateUrl: './clientes-busca.component.html',
  styleUrls: ['./clientes-busca.component.scss'],
  imports: [FormsModule, CommonModule, RouterModule],
  providers: [ClientesService]
})
export class ClientesBuscaComponent implements OnInit {
  clientes: any[] = [];
  filteredClientes: any[] = [];
  searchQuery: string = '';
  searchBy: string = 'nome';

  constructor(private clientesService: ClientesService, private router: Router) {}

  ngOnInit(): void {
    this.loadClientes();
  }

  loadClientes(): void {
    this.clientesService.getClientes().subscribe({
      next: (data) => {
        this.clientes = data;
        this.filteredClientes = data;
      },
      error: (err) => {
        console.error('Erro ao carregar clientes:', err);
      }
    });
  }

  searchClientes(): void {
    const query = this.searchQuery.toLowerCase();
    if (this.searchBy === 'id') {
      this.filteredClientes = this.clientes.filter(cliente => cliente.id.toString().includes(query));
    } else if (this.searchBy === 'nome') {
      this.filteredClientes = this.clientes.filter(cliente =>
        (cliente.nomeFantasia?.toLowerCase().includes(query) ||
         cliente.razaoSocial?.toLowerCase().includes(query) ||
         cliente.nome?.toLowerCase().includes(query))
      );
    } else if (this.searchBy === 'cpfCnpj') {
      this.filteredClientes = this.clientes.filter(cliente =>
        (cliente.cpf?.includes(query) || cliente.cnpj?.includes(query))
      );
    }
  }

  viewCliente(id: string): void {
    this.router.navigate(['/clientes', id]);
  }

  navigateToHome(): void {
    const role = sessionStorage.getItem('user-role');
    if (role === 'ROLE_GERENCIAL'){
      this.router.navigate(['/gerencial']);
    }else if (role === 'ROLE_VENDAS'){
      this.router.navigate(['/vendas']);
    }
  }

  createNovoCliente(): void {
    this.router.navigate(['/clientes/novo']);
  }
}
