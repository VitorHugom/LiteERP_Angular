import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UsuarioService } from '../../services/usuario.service';
import { CommonModule } from '@angular/common'; // Importa CommonModule
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'; // Importa MatSnackBar e MatSnackBarModule

@Component({
  selector: 'app-liberacao-usuario',
  standalone: true,
  templateUrl: './liberacao-usuario.component.html',
  styleUrls: ['./liberacao-usuario.component.scss'],
  imports: [CommonModule, MatSnackBarModule], // Adiciona MatSnackBarModule aqui
})
export class LiberacaoUsuarioComponent implements OnInit {

  usuario: any;
  id: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private usuarioService: UsuarioService,
    private snackBar: MatSnackBar // Injeta MatSnackBar
  ) { }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id')!;
    this.loadUsuario();
  }

  loadUsuario(): void {
    this.usuarioService.getUsuarioById(this.id).subscribe({
      next: (data) => {
        this.usuario = data;
      },
      error: (err) => {
        console.error('Erro ao carregar usuário:', err);
      }
    });
  }

  liberarUsuario(): void {
    this.usuarioService.aprovarUsuario(this.id).subscribe({
      next: () => {
        this.snackBar.open('Usuário liberado com sucesso!', 'OK', {
          duration: 3000, // A duração da mensagem em milissegundos
        }).afterDismissed().subscribe(() => {
          this.router.navigate(['/busca-liberacao']); // Redireciona para a tela de busca-liberacao
        });
      },
      error: (err) => {
        console.error('Erro ao liberar usuário:', err);
      }
    });
  }
}
