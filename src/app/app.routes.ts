import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { AuthGuard } from './services/auth-guard.service';
import { GerencialComponent } from './pages/gerencial/gerencial.component';
import { CaixaComponent } from './pages/caixa/caixa.component';
import { VendaComponent } from './pages/vendas/vendas.component';

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
import { PedidosAbertoComponent } from './components/pedidos-aberto/pedidos-aberto.component';
import { FornecedoresBuscaComponent } from './components/fornecedores-busca/fornecedores-busca.component';
import { FornecedoresCadastroComponent } from './components/fornecedores-cadastro/fornecedores-cadastro.component';
import { RecebimentoMercadoriasBuscaComponent } from './components/recebimento-mercadorias-busca/recebimento-mercadorias-busca.component';
import { RecebimentoMercadoriasCadastroComponent } from './components/recebimento-mercadorias-cadastro/recebimento-mercadorias-cadastro.component';
import { MovimentoEstoqueBuscaComponent } from './components/movimento-estoque-busca/movimento-estoque-busca.component';
import { EstoqueBuscaComponent } from './components/estoque-busca/estoque-busca.component';
import { FormaPagamentoBuscaComponent } from './components/forma-pagamento-busca/forma-pagamento-busca.component';
import { FormaPagamentoCadastroComponent } from './components/forma-pagamento-cadastro/forma-pagamento-cadastro.component';
import { ContasPagarBuscaComponent } from './components/contas-pagar-busca/contas-pagar-busca.component';
import { ContasPagarCadastroComponent } from './components/contas-pagar-cadastro/contas-pagar-cadastro.component';
import { ContasReceberBuscaComponent } from './components/contas-receber-busca/contas-receber-busca.component';
import { ClientesRelatorioComponent } from './components/clientes-relatorio/clientes-relatorio.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },

  { path: 'signup', component: SignupComponent },

  { path: 'gerencial', component: GerencialComponent, canActivate: [AuthGuard], data: { expectedRoles: ['ROLE_GERENCIAL'] }},

  { path: 'busca-liberacao', component: BuscaLiberacaoComponent, canActivate: [AuthGuard], data: { expectedRoles: ['ROLE_GERENCIAL'] }},

  { path: 'fornecedores-busca', component: FornecedoresBuscaComponent, canActivate: [AuthGuard], data: { expectedRoles: ['ROLE_GERENCIAL'] }},
  { path: 'fornecedor/:id', component: FornecedoresCadastroComponent, canActivate: [AuthGuard], data: { expectedRoles: ['ROLE_GERENCIAL'] }},

  { path: 'recebimento-mercadorias-busca', component: RecebimentoMercadoriasBuscaComponent, canActivate: [AuthGuard], data: { expectedRoles: ['ROLE_GERENCIAL'] }},
  { path: 'recebimento-mercadorias-cadastro/:id', component: RecebimentoMercadoriasCadastroComponent, canActivate: [AuthGuard], data: { expectedRoles: ['ROLE_GERENCIAL'] }},
  { path: 'movimento-estoque-busca', component: MovimentoEstoqueBuscaComponent, canActivate: [AuthGuard], data: { expectedRoles: ['ROLE_GERENCIAL'] }},

  { path: 'estoque-busca', component: EstoqueBuscaComponent, canActivate: [AuthGuard], data: { expectedRoles: ['ROLE_GERENCIAL'] }},

  { path: 'caixa', component: CaixaComponent, canActivate: [AuthGuard], data: { expectedRoles: ['ROLE_CAIXA'] }},

  { path: 'vendas', component: VendaComponent, canActivate: [AuthGuard], data: { expectedRoles: ['ROLE_VENDAS'] }},

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

  { path: 'pedidos-aberto', component: PedidosAbertoComponent, canActivate: [AuthGuard], data: { expectedRoles: ['ROLE_CAIXA'] }},

  { path: 'forma-pagamento-busca', component: FormaPagamentoBuscaComponent, canActivate: [AuthGuard], data: { expectedRoles: ['ROLE_GERENCIAL'] }},
  { path: 'forma-pagamento/:id', component: FormaPagamentoCadastroComponent, canActivate: [AuthGuard], data: { expectedRoles: ['ROLE_GERENCIAL'] }},

  { path: 'contas-pagar-busca', component: ContasPagarBuscaComponent, canActivate: [AuthGuard], data: { expectedRoles: ['ROLE_GERENCIAL'] }},
  { path: 'contas-pagar/:id', component: ContasPagarCadastroComponent, canActivate: [AuthGuard], data: { expectedRoles: ['ROLE_GERENCIAL'] }},

  { path: 'contas-receber-busca', component: ContasReceberBuscaComponent, canActivate: [AuthGuard], data: { expectedRoles: ['ROLE_GERENCIAL'] }},

  { path: '', redirectTo: '/login', pathMatch: 'full' },

  { path: 'clientes-relatorio', component: ClientesRelatorioComponent, canActivate: [AuthGuard], data: { expectedRoles: ['ROLE_GERENCIAL'] }}
];
