import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { BuscaLiberacaoComponent } from './components/busca-liberacao/busca-liberacao.component';
import { LiberacaoUsuarioComponent } from './components/liberacao-usuario/liberacao-usuario.component';
import { GerencialHomeComponent } from './components/gerencial-home/gerencial-home.component';
import { VendasHomeComponent } from './components/vendas-home/vendas-home.component';
import { CozinhaHomeComponent } from './components/cozinha-home/cozinha-home.component';
import { ProdutosBuscaComponent } from './components/produtos-busca/produtos-busca.component';
import { ProdutosCadastroComponent } from './components/produtos-cadastro/produtos-cadastro.component';
import { GrupoProdutosBuscaComponent } from './components/grupo-produtos-busca/grupo-produtos-busca.component';
import { PeriodosEntregaBuscaComponent } from './components/periodos-entrega-busca/periodos-entrega-busca.component';
import { PeriodoEntregaCadastroComponent } from './components/periodos-entrega-cadastro/periodos-entrega-cadastro.component';
import { GrupoProdutosCadastroComponent } from './components/grupo-produtos-cadastro/grupo-produtos-cadastro.component';
import { ClientesBuscaComponent } from './components/clientes-busca/clientes-busca.component';
import { ClientesCadastroComponent } from './components/clientes-cadastro/clientes-cadastro.component';
import { FornecedoresBuscaComponent } from './components/fornecedores-busca/fornecedores-busca.component';
import { PedidosBuscaComponent } from './components/pedidos-busca/pedidos-busca.component';
import { PedidosCadastroComponent } from './components/pedidos-cadastro/pedidos-cadastro.component';
import { NovoPedidoVendas } from './components/novo-pedido-vendas/novo-pedido-vendas.component';
import { AgendaPedidosComponent } from './components/agenda-pedidos/agenda-pedidos.component';
import { ProducaoPedidoComponent } from './components/producao-pedido/producao-pedido.component';
import { BuscaPedidosProducaoComponent } from './components/busca-pedidos-producao/busca-pedidos-producao.component';

import { AuthGuard } from './services/auth-guard.service';
import { FornecedoresCadastroComponent } from './components/fornecedores-cadastro/fornecedores-cadastro.component';
import { RecebimentoMercadoriasBuscaComponent } from './components/recebimento-mercadorias-busca/recebimento-mercadorias-busca.component';
import { RecebimentoMercadoriasCadastroComponent } from './components/recebimento-mercadorias-cadastro/recebimento-mercadorias-cadastro.component';
import { MovimentoEstoqueBuscaComponent } from './components/movimento-estoque-busca/movimento-estoque-busca.component';
import { EstoqueBuscaComponent } from './components/estoque-busca/estoque-busca.component';


export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'signup', component: SignupComponent },
    { path: 'busca-liberacao', component: BuscaLiberacaoComponent, canActivate: [AuthGuard], data: { expectedRoles: ['ROLE_GERENCIAL'] }},
    { path: 'liberacao/:id', component: LiberacaoUsuarioComponent, canActivate: [AuthGuard], data: { expectedRoles: ['ROLE_GERENCIAL'] }},

    { path: 'vendas-home', component: VendasHomeComponent, canActivate: [AuthGuard], data: { expectedRoles: ['ROLE_VENDAS'] }},
    
    { path: 'gerencial-home', component: GerencialHomeComponent, canActivate: [AuthGuard], data: { expectedRoles: ['ROLE_GERENCIAL'] }},

    { path: 'cozinha-home', component: CozinhaHomeComponent, canActivate: [AuthGuard], data: { expectedRoles: ['ROLE_COZINHA'] }},

    { path: 'produtos/:id', component: ProdutosCadastroComponent, canActivate: [AuthGuard], data: { expectedRoles: ['ROLE_GERENCIAL'] }},
    { path: 'produtos-busca', component: ProdutosBuscaComponent, canActivate: [AuthGuard], data: { expectedRoles: ['ROLE_GERENCIAL'] }},

    { path: 'grupo-produtos-busca', component: GrupoProdutosBuscaComponent, canActivate: [AuthGuard], data: { expectedRoles: ['ROLE_GERENCIAL'] }},
    { path: 'grupo-produtos/:id', component: GrupoProdutosCadastroComponent, canActivate: [AuthGuard], data: { expectedRoles: ['ROLE_GERENCIAL'] }},

    { path: 'periodos-entrega-busca', component: PeriodosEntregaBuscaComponent, canActivate: [AuthGuard], data: { expectedRoles: ['ROLE_GERENCIAL'] }},
    { path: 'periodos-entrega/:id', component: PeriodoEntregaCadastroComponent, canActivate: [AuthGuard], data: { expectedRoles: ['ROLE_GERENCIAL'] }},

    { path: 'fornecedores-busca', component: FornecedoresBuscaComponent, canActivate: [AuthGuard], data: { expectedRoles: ['ROLE_GERENCIAL'] }},
    { path: 'fornecedor/:id', component: FornecedoresCadastroComponent, canActivate: [AuthGuard], data: { expectedRoles: ['ROLE_GERENCIAL'] }},

    { path: 'clientes-busca', component: ClientesBuscaComponent, canActivate: [AuthGuard], data: { expectedRoles: ['ROLE_GERENCIAL', 'ROLE_VENDAS'] }},
    { path: 'clientes/:id', component: ClientesCadastroComponent, canActivate: [AuthGuard], data: { expectedRoles: ['ROLE_GERENCIAL', 'ROLE_VENDAS'] }},

    { path: 'pedidos-busca', component: PedidosBuscaComponent, canActivate: [AuthGuard], data: { expectedRoles: ['ROLE_GERENCIAL', 'ROLE_VENDAS', 'ROLE_COZINHA'] }},
    { path: 'pedidos-cadastro/:id', component: PedidosCadastroComponent, canActivate: [AuthGuard], data: { expectedRoles: ['ROLE_GERENCIAL', 'ROLE_VENDAS', 'ROLE_COZINHA'] }},

    { path: 'recebimento-mercadorias-busca', component: RecebimentoMercadoriasBuscaComponent, canActivate: [AuthGuard], data: { expectedRoles: ['ROLE_GERENCIAL'] }},
    { path: 'recebimento-mercadorias-cadastro/:id', component: RecebimentoMercadoriasCadastroComponent, canActivate: [AuthGuard], data: { expectedRoles: ['ROLE_GERENCIAL'] }},

    { path: 'movimento-estoque-busca', component: MovimentoEstoqueBuscaComponent, canActivate: [AuthGuard], data: { expectedRoles: ['ROLE_GERENCIAL'] }},

    { path: 'estoque-busca', component: EstoqueBuscaComponent, canActivate: [AuthGuard], data: { expectedRoles: ['ROLE_GERENCIAL'] }},

    { path: 'novo-pedido-vendas', component: NovoPedidoVendas, canActivate: [AuthGuard], data: { expectedRoles: ['ROLE_VENDAS'] }},


    { path: 'agenda-pedido', component: AgendaPedidosComponent, canActivate: [AuthGuard], data: { expectedRoles: ['ROLE_COZINHA'] }},
    { path: 'producao-pedido/:id', component: ProducaoPedidoComponent, canActivate: [AuthGuard], data: { expectedRoles: ['ROLE_COZINHA'] }},
    { path: 'busca-pedido-producao', component: BuscaPedidosProducaoComponent, canActivate: [AuthGuard], data: { expectedRoles: ['ROLE_COZINHA'] }},

    

    { path: '', redirectTo: '/login', pathMatch: 'full' }
];
