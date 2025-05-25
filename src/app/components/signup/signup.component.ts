import { Component } from '@angular/core';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SignupService } from '../../services/signup.service';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { passwordsMatchValidator } from './passwordsMatchValidator';

interface Categoria {
    id: number;
    nome: string;
}

@Component({
    selector: 'app-signup',
    standalone: true,
    templateUrl: './signup.component.html',
    styleUrls: ['./signup.component.scss'],
    imports: [FormsModule, CommonModule, RouterModule, NgxMaskDirective,ReactiveFormsModule],
    providers: [SignupService, provideNgxMask()]
})
export class SignupComponent {


  // FormGroup para o formulário de cadastro
  // FormGroup é uma classe do Angular que representa um grupo de controles de formulário
  signupForm = new FormGroup<{
    username: FormControl<string | null>;
    email: FormControl<string | null>;
    telefone: FormControl<string | null>;
    password: FormControl<string | null>;
    confirmPassword: FormControl<string | null>;
    categoriaId: FormControl<number | null>;
  }>({
      username: new FormControl('', [Validators.required, Validators.minLength(3)]),
      email: new FormControl('', [Validators.required, Validators.email]),
      telefone: new FormControl('', Validators.required),
      password: new FormControl('', [Validators.required, Validators.minLength(3)]),
      confirmPassword: new FormControl('', Validators.required),
      categoriaId: new FormControl(null, Validators.required)
    }, {validators: passwordsMatchValidator}
  )


    categorias: Categoria[] = [
        { id: 1, nome: 'Vendas' },
        { id: 2, nome: 'Gerencial' },
        { id: 3, nome: 'Caixa' }
    ];


    isModalOpen: boolean = false;
    message: string = '';

    constructor(
      private signupService: SignupService,
      private router: Router
    ) {}


    onSubmit(){

      // Marca todos os controles do formulário como tocados
      this.signupForm.markAllAsTouched();

      // Verifica se o formulário é válido
      if(this.signupForm.valid) {

        const { username, email, telefone, password, confirmPassword, categoriaId } = this.signupForm.value;

        const requestData = {
            nomeUsuario: String(username),
            email: String(email),
            telefone: String(telefone),
            senha: String(password),
            categoria_id: Number(categoriaId)
        }

        // Chama o serviço de cadastro
        this.signupService.register(requestData).subscribe({
            next: (response: any) => {

                this.resetForm();

                this.isModalOpen = true;
                this.message = 'Dados enviados, aguardando liberação.';
            },
            error: (error: HttpErrorResponse) => {
                console.error('Erro ao registrar usuário:', error);

                this.isModalOpen = true;
                this.message = 'Erro ao enviar dados. Tente novamente.';
            }
        });
      }

    }

    closeModal() {
        this.isModalOpen = false;
        this.router.navigate(['/login']);
    }

    get celularMask(): string {
      return '(00) 00000-0000';
    }

    resetForm(){
      this.signupForm.reset();
    }

    navigateToLogin(){
        this.router.navigate(['/login']);
    }
}
