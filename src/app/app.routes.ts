import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { GerencialHomeComponent } from './components/gerencial-home/gerencial-home.component';
import { CaixaHomeComponent } from './components/caixa-home/caixa-home.component';
import { VendasHomeComponent } from './components/vendas-home/vendas-home.component';
import { AuthGuard } from './services/auth-guard.service';
import { BuscaLiberacaoComponent } from './components/busca-liberacao/busca-liberacao.component';
import { LiberacaoUsuarioComponent } from './components/liberacao-usuario/liberacao-usuario.component';
import { BuscaProdutosComponent } from './components/busca-produtos/busca-produtos.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'gerencial-home', component: GerencialHomeComponent, canActivate: [AuthGuard], data: { expectedRoles: ['ROLE_GERENCIAL'] }},
  { path: 'busca-liberacao', component: BuscaLiberacaoComponent, canActivate: [AuthGuard], data: { expectedRoles: ['ROLE_GERENCIAL'] }},
  { path: 'caixa-home', component: CaixaHomeComponent, canActivate: [AuthGuard], data: { expectedRoles: ['ROLE_CAIXA'] }},
  { path: 'vendas-home', component: VendasHomeComponent, canActivate: [AuthGuard], data: { expectedRoles: ['ROLE_VENDAS'] }},
  { path: 'liberacao/:id', component: LiberacaoUsuarioComponent, canActivate: [AuthGuard], data: { expectedRoles: ['ROLE_GERENCIAL'] }},
  { path: 'busca-produtos', component: BuscaProdutosComponent, canActivate: [AuthGuard], data: { expectedRoles: ['ROLE_GERENCIAL'] }},
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];
