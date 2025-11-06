# ?? LiteERP - Sistema de Gestão Empresarial

<div align="center">

![Angular](https://img.shields.io/badge/Angular-18.0.0-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4.2-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Material](https://img.shields.io/badge/Material-18.2.2-009688?style=for-the-badge&logo=material-design&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![License](https://img.shields.io/badge/License-Private-red?style=for-the-badge)

Sistema completo de gestão empresarial (ERP) desenvolvido com Angular 18, oferecendo módulos integrados para vendas, compras, estoque, financeiro e administração.

[Características](#-características) ?
[Tecnologias](#-tecnologias) ?
[Instalação](#-instalação) ?
[Uso](#-uso) ?
[Docker](#-docker) ?
[Estrutura](#-estrutura-do-projeto)

</div>

---

## ?? Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Características](#-características)
- [Tecnologias](#-tecnologias)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Uso](#-uso)
- [Docker](#-docker)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Módulos Principais](#-módulos-principais)
- [Configuração](#-configuração)
- [Scripts Disponíveis](#-scripts-disponíveis)
- [Build e Deploy](#-build-e-deploy)
- [Testes](#-testes)
- [CI/CD](#-cicd)
- [Contribuindo](#-contribuindo)

---

## ?? Sobre o Projeto

O **LiteERP** é um sistema de gestão empresarial (ERP) moderno e completo, desenvolvido com as mais recentes tecnologias web. O sistema oferece uma interface intuitiva e responsiva para gerenciar todos os aspectos de uma empresa, desde vendas e compras até controle de estoque e gestão financeira.

### Principais Diferenciais

- ? **Interface Moderna**: Desenvolvido com Angular 18 e Angular Material
- ? **Multiplataforma**: Funciona em desktop, tablet e mobile
- ? **Controle de Acesso**: Sistema de autenticação com JWT e controle de permissões por roles
- ? **Relatórios Completos**: Geração de relatórios em PDF com gráficos interativos
- ? **Integração XML**: Importação automática de notas fiscais eletrônicas (NFe)
- ? **Leitor de Código de Barras**: Scanner integrado para produtos
- ? **Docker Ready**: Pronto para deploy com Docker e Docker Compose
- ? **SSR (Server-Side Rendering)**: Melhor performance e SEO

---

## ? Características

### ?? Autenticação e Autorização
- Login seguro com JWT
- Recuperação de senha via e-mail
- Controle de acesso baseado em roles (GERENCIAL, VENDAS, CAIXA)
- Sessão com expiração automática

### ?? Dashboard Gerencial
- Gráficos de contas a pagar e receber
- Visão consolidada do fluxo de caixa
- Indicadores de performance
- Filtros por período personalizável

### ?? Gestão de Cadastros
- **Clientes**: Cadastro completo com histórico de compras
- **Fornecedores**: Gestão de fornecedores e produtos vinculados
- **Produtos**: Controle de estoque, preços e grupos
- **Formas de Pagamento**: Configuração de métodos de pagamento

### ?? Módulo Financeiro
- **Contas a Pagar**: Controle de despesas e fornecedores
- **Contas a Receber**: Gestão de recebimentos de clientes
- **Fluxo de Caixa**: Movimentações financeiras em tempo real
- Relatórios financeiros detalhados

### ?? Módulo de Vendas
- Emissão de pedidos de venda
- Controle de orçamentos
- Gestão de vendedores
- Relatórios de vendas por período

### ?? Módulo de Compras
- Recebimento de mercadorias
- Importação de XML de NFe
- Vinculação automática de produtos
- Controle de entrada de estoque

### ?? Controle de Estoque
- Movimentação de estoque em tempo real
- Inventário e balanço
- Relatórios de estoque por produto/grupo
- Alertas de estoque mínimo

### ????? Administração
- Gestão de usuários e permissões
- Aprovação de novos usuários
- Relatórios de acesso
- Configurações do sistema

---

## ?? Tecnologias

### Core
- **[Angular 18.0.0](https://angular.io/)** - Framework principal
- **[TypeScript 5.4.2](https://www.typescriptlang.org/)** - Linguagem de programação
- **[RxJS 7.8.0](https://rxjs.dev/)** - Programação reativa

### UI/UX
- **[Angular Material 18.2.2](https://material.angular.io/)** - Componentes UI
- **[SCSS](https://sass-lang.com/)** - Pré-processador CSS
- **[Chart.js 4.5.0](https://www.chartjs.org/)** - Gráficos interativos

### Funcionalidades
- **[jsPDF 3.0.1](https://github.com/parallax/jsPDF)** - Geração de PDFs
- **[jsPDF-AutoTable 5.0.2](https://github.com/simonbengtsson/jsPDF-AutoTable)** - Tabelas em PDF
- **[ngx-mask 18.0.0](https://github.com/JsDaddy/ngx-mask)** - Máscaras de input
- **[ngx-toastr 19.0.0](https://github.com/scttcper/ngx-toastr)** - Notificações toast
- **[jwt-decode 4.0.0](https://github.com/auth0/jwt-decode)** - Decodificação de JWT
- **[ZXing 0.21.3](https://github.com/zxing-js/library)** - Leitor de código de barras
- **[Video.js 8.21.0](https://videojs.com/)** - Player de vídeo

### Server & Build
- **[Angular SSR](https://angular.io/guide/ssr)** - Server-Side Rendering
- **[Express 4.18.2](https://expressjs.com/)** - Servidor Node.js
- **[Nginx](https://www.nginx.com/)** - Servidor web (produção)

### DevOps
- **[Docker](https://www.docker.com/)** - Containerização
- **[GitHub Actions](https://github.com/features/actions)** - CI/CD
- **[Karma](https://karma-runner.github.io/)** - Test runner
- **[Jasmine](https://jasmine.github.io/)** - Framework de testes

---

## ?? Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** >= 21.x
- **npm** >= 10.x
- **Angular CLI** >= 18.x
- **Git**
- **Docker** (opcional, para deploy)

### Verificar versões instaladas

```bash
node --version
npm --version
ng version
```

---

## ?? Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/LiteERP_Angular.git
cd LiteERP_Angular
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Edite o arquivo `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080' // URL da sua API backend
};
```

Para produção, edite `src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.seu-dominio.com'
};
```

---

## ?? Uso

### Servidor de Desenvolvimento

Execute o servidor de desenvolvimento:

```bash
npm start
```

Navegue para `http://localhost:4200/`. A aplicação será recarregada automaticamente ao modificar os arquivos.

### Servidor SSR (Server-Side Rendering)

Para executar com SSR:

```bash
npm run build
npm run serve:ssr:LiteERP
```

O servidor estará disponível em `http://localhost:4000/`.

---

## ?? Docker

### Build da Imagem

```bash
docker build -t lite-erp-frontend .
```

### Executar Container

```bash
docker run -d -p 80:80 \
  -e API_URL=https://api.seu-dominio.com \
  --name lite-erp \
  lite-erp-frontend
```

### Docker Compose

Copie o arquivo de exemplo:

```bash
cp docker-compose.example.yml docker-compose.yml
```

Edite as variáveis de ambiente e execute:

```bash
docker-compose up -d
```

### Variáveis de Ambiente Docker

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `API_URL` | URL da API backend | `https://api.lite-erp-enterprise.com` |

---

## ?? Estrutura do Projeto

```
LiteERP_Angular/
??? .github/
?   ??? workflows/          # GitHub Actions CI/CD
??? public/                 # Arquivos estáticos
?   ??? images/            # Imagens e ícones
??? src/
?   ??? app/
?   ?   ??? components/    # Componentes reutilizáveis
?   ?   ??? layouts/       # Layouts da aplicação
?   ?   ??? models/        # Interfaces e modelos
?   ?   ??? pages/         # Páginas principais
?   ?   ??? pipes/         # Pipes customizados
?   ?   ??? services/      # Serviços e interceptors
?   ?   ??? styles/        # Estilos globais
?   ?   ??? utils/         # Utilitários
?   ??? environments/      # Configurações de ambiente
?   ??? styles.scss        # Estilos globais
??? Dockerfile             # Configuração Docker
??? nginx.conf             # Configuração Nginx
??? server.ts              # Servidor Express SSR
??? package.json           # Dependências do projeto
```

---

## ?? Módulos Principais

### Componentes por Módulo

#### ?? Gerencial
- Dashboard com gráficos
- Sidebar de navegação
- Topbar com logout

#### ?? Cadastros
- Clientes (busca, cadastro, relatórios)
- Fornecedores (busca, cadastro, relatórios)
- Produtos (busca, cadastro, relatórios)
- Grupo de Produtos
- Formas de Pagamento

#### ?? Financeiro
- Contas a Pagar (busca, cadastro, relatórios)
- Contas a Receber (busca, cadastro, relatórios)
- Fluxo de Caixa

#### ?? Vendas
- Pedidos de Venda
- Novo Pedido
- Relatórios de Vendas

#### ?? Compras e Estoque
- Recebimento de Mercadorias
- Movimento de Estoque
- Relatórios de Estoque

#### ????? Administração
- Liberação de Usuários
- Relatório de Usuários

---

## ?? Configuração

### Autenticação

O sistema utiliza JWT (JSON Web Token) para autenticação. O token é armazenado no `sessionStorage` e enviado automaticamente em todas as requisições através do `authInterceptor`.

### Roles de Usuário

- `ROLE_GERENCIAL`: Acesso completo ao sistema
- `ROLE_VENDAS`: Acesso ao módulo de vendas
- `ROLE_CAIXA`: Acesso ao módulo de caixa

### Guards

O `AuthGuard` protege as rotas e verifica as permissões do usuário baseado em seu role.

---

## ?? Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm start` | Inicia o servidor de desenvolvimento na porta 4200 |
| `npm run build` | Compila o projeto para produção |
| `npm run watch` | Compila em modo watch (desenvolvimento) |
| `npm test` | Executa os testes unitários via Karma |
| `npm run serve:ssr:LiteERP` | Inicia o servidor SSR |

---

## ??? Build e Deploy

### Build para Produção

```bash
npm run build
```

Os arquivos compilados estarão em `dist/lite-erp/browser/`.

### Deploy com Docker

1. **Build da imagem:**
   ```bash
   docker build -t lite-erp-frontend:latest .
   ```

2. **Push para Docker Hub:**
   ```bash
   docker tag lite-erp-frontend:latest seu-usuario/lite-erp-frontend:latest
   docker push seu-usuario/lite-erp-frontend:latest
   ```

3. **Deploy em servidor:**
   ```bash
   docker pull seu-usuario/lite-erp-frontend:latest
   docker run -d -p 80:80 \
     -e API_URL=https://api.seu-dominio.com \
     --restart unless-stopped \
     --name lite-erp \
     seu-usuario/lite-erp-frontend:latest
   ```

---

## ?? Testes

### Executar Testes Unitários

```bash
npm test
```

Os testes são executados via [Karma](https://karma-runner.github.io) e [Jasmine](https://jasmine.github.io).

### Cobertura de Testes

```bash
npm test -- --code-coverage
```

O relatório de cobertura será gerado em `coverage/`.

---

## ?? CI/CD

O projeto possui workflows do GitHub Actions configurados para:

### Build e Push Docker

- **Arquivo**: `.github/workflows/docker-build-push.yml`
- **Trigger**: Push nas branches `main` ou `master`
- **Ações**:
  1. Checkout do código
  2. Setup do Node.js 21
  3. Instalação de dependências
  4. Build da aplicação Angular
  5. Build e push da imagem Docker para Docker Hub

### Build Simples

- **Arquivo**: `.github/workflows/simple-docker-build.yml`
- **Trigger**: Push nas branches `main` ou `master`
- **Ações**:
  1. Checkout do código
  2. Login no Docker Hub
  3. Build e push da imagem

### Configurar Secrets

No GitHub, configure os seguintes secrets:

- `DOCKERHUB_USERNAME`: Seu usuário do Docker Hub
- `DOCKERHUB_TOKEN`: Token de acesso do Docker Hub

---

## ?? Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

### Padrões de Código

- Use TypeScript strict mode
- Siga o guia de estilo do Angular
- Escreva testes para novas funcionalidades
- Documente funções e componentes complexos

---

## ?? Licença

Este projeto é privado e proprietário. Todos os direitos reservados.

---

## ????? Autor

Desenvolvido com ?? para gestão empresarial eficiente.

---

## ?? Suporte

Para suporte e dúvidas, entre em contato através dos canais oficiais do projeto.

---

<div align="center">

**[? Voltar ao topo](#-liteerp---sistema-de-gestão-empresarial)**

</div>