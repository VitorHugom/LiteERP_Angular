import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { GerencialHomeComponent } from './components/gerencial-home/gerencial-home.component';
import { CaixaHomeComponent } from './components/caixa-home/caixa-home.component';
import { VendasHomeComponent } from './components/vendas-home/vendas-home.component';
import { AuthGuard } from './services/auth-guard.service';
import { BuscaLiberacaoComponent } from './components/busca-liberacao/busca-liberacao.component';
import { LiberacaoUsuarioComponent } from './components/liberacao-usuario/liberacao-usuario.component';
import { ProdutosBuscaComponent } from './components/produtos-busca/busca-produtos.component';
import { ProdutosCadastroComponent } from './components/produtos-cadastro/produtos-cadastro.component';
import { GrupoProdutosBuscaComponent } from './components/grupo-produtos-busca/grupo-produtos-busca.component';
import { GrupoProdutosCadastroComponent } from './components/grupo-produtos-cadastro/grupo-produtos-cadastro.component';
import { ClientesBuscaComponent } from './components/clientes-busca/clientes-busca.component';
import { ClientesCadastroComponent } from './components/clientes-cadastro/clientes-cadastro.component';
import { VendedoresBuscaComponent } from './components/vendedores-busca/vendedores-busca.component';
import { PedidosBuscaComponent } from './components/pedidos-busca/pedidos-busca.component';
import { PedidosCadastroComponent } from './components/pedidos-cadastro/pedidos-cadastro.component';
import { NovoPedidoVendas } from './components/novo-pedido-vendas/novo-pedido-vendas.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },

  { path: 'signup', component: SignupComponent },

  { path: 'gerencial-home', component: GerencialHomeComponent, canActivate: [AuthGuard], data: { expectedRoles: ['ROLE_GERENCIAL'] }},

  { path: 'busca-liberacao', component: BuscaLiberacaoComponent, canActivate: [AuthGuard], data: { expectedRoles: ['ROLE_GERENCIAL'] }},

  { path: 'caixa-home', component: CaixaHomeComponent, canActivate: [AuthGuard], data: { expectedRoles: ['ROLE_CAIXA'] }},

  { path: 'vendas-home', component: VendasHomeComponent, canActivate: [AuthGuard], data: { expectedRoles: ['ROLE_VENDAS'] }},

  { path: 'liberacao/:id', component: LiberacaoUsuarioComponent, canActivate: [AuthGuard], data: { expectedRoles: ['ROLE_GERENCIAL'] }},

  { path: 'produtos/:id', component: ProdutosCadastroComponent, canActivate: [AuthGuard], data: { expectedRoles: ['ROLE_GERENCIAL'] }},
  { path: 'busca-produtos', component: ProdutosBuscaComponent, canActivate: [AuthGuard], data: { expectedRoles: ['ROLE_GERENCIAL'] }},
  { path: 'grupo-produtos-busca', component: GrupoProdutosBuscaComponent, canActivate: [AuthGuard], data: { expectedRoles: ['ROLE_GERENCIAL'] }},
  { path: 'grupo-produtos/:id', component: GrupoProdutosCadastroComponent, canActivate: [AuthGuard], data: { expectedRoles: ['ROLE_GERENCIAL'] }},
  { path: 'clientes-busca', component: ClientesBuscaComponent, canActivate: [AuthGuard], data: { expectedRoles: ['ROLE_GERENCIAL', 'ROLE_VENDAS'] }},
  { path: 'clientes/:id', component: ClientesCadastroComponent, canActivate: [AuthGuard], data: { expectedRoles: ['ROLE_GERENCIAL', 'ROLE_VENDAS'] }},
  { path: 'vendedores-busca', component: VendedoresBuscaComponent, canActivate: [AuthGuard], data: { expectedRoles: ['ROLE_GERENCIAL'] }},
  { path: 'pedidos-busca', component: PedidosBuscaComponent, canActivate: [AuthGuard], data: { expectedRoles: ['ROLE_GERENCIAL', 'ROLE_VENDAS'] }},
  { path: 'pedidos-cadastro/:id', component: PedidosCadastroComponent, canActivate: [AuthGuard], data: { expectedRoles: ['ROLE_GERENCIAL', 'ROLE_VENDAS'] }},

  { path: 'novo-pedido-vendas', component: NovoPedidoVendas, canActivate: [AuthGuard], data: { expectedRoles: ['ROLE_VENDAS'] }},

  { path: '', redirectTo: '/login', pathMatch: 'full' }
];
