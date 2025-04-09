import { Component, OnInit } from '@angular/core';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { ClientesService } from '../../services/clientes.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CidadesService } from '../../services/cidades.service';
import { VendedoresService } from '../../services/vendedores.service';
import { NavigateToSearchButtonComponent } from '../shared/navigate-to-search-button/navigate-to-search-button.component';

@Component({
  selector: 'app-cadastro-cliente',
  standalone: true,
  templateUrl: './clientes-cadastro.component.html',
  styleUrls: ['./clientes-cadastro.component.scss'],
  imports: [CommonModule, FormsModule, NgxMaskDirective,NavigateToSearchButtonComponent],
  providers: [provideNgxMask()]
})
export class ClientesCadastroComponent implements OnInit {
  isNew = true;
  isLoading = false;
  cliente: any = {
    id: null,
    tipoPessoa: '',
    cpf: '',
    cnpj: '',
    cpfCnpj: '',
    nomeFantasia: null,
    razaoSocial: '',
    cep: '',
    endereco: '',
    complemento: '',
    numero: '',
    bairro: '',
    cidade: {
      id: null,
      nome: '',
      estado: '',
      codigoIbge: ''
    },
    celular: '',
    telefone: '',
    rg: '',
    dataNascimento: '',
    email: '',
    estadoInscricaoEstadual: false,
    inscricaoEstadual: null,
    vendedor: {
      id: null
    },
    observacao: '',
    status: true,
    dataCadastro: '',
    limiteCredito: 0
  };

  urlClienteBusca = '/clientes-busca'

  cidades: any[] = []; // Para armazenar as cidades que retornarem da busca
  cidadeInput: string = ''; // Input do campo de cidade
  showCidadesList: boolean = false; // Controlar a exibição da lista de autocomplete
  loadingCidades: boolean = false; // Controlar o loading das cidades
  currentPage: number = 0; // Página atual do lazy loading
  pageSize: number = 10; // Quantidade de registros por página

  vendedorInput: string = '';
  vendedores: any[] = [];
  showVendedoresList: boolean = false;
  currentPageVendedores: number = 0;
  pageSizeVendedores: number = 10;
  loadingVendedores: boolean = false;

  activeTab = 'geral'; // Aba ativa, começa com "geral"
  message: string | null = null;
  isSuccess: boolean = true;
  errorMessage: string | null = null; // Para erros
  showAlert = false; // Exibir mensagem de sucesso ou erro

  constructor(
    private cidadesService: CidadesService,
    private clientesService: ClientesService,
    private vendedoresService: VendedoresService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'novo') {
      this.isNew = false;
      this.isLoading = true;
      this.clientesService.getClienteById(id).subscribe({
        next: (data) => {
          this.cliente = data;
          this.cidadeInput = this.cliente.cidade?.nome || '';
          this.vendedorInput = this.cliente.vendedor?.nome || '';
          this.isLoading = false;
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = 'Erro ao carregar cliente.';
          console.error('Erro ao carregar cliente:', err);
        }
      });
    } else {
      this.onNew();
    }
  }

  // Função que define se o campo de CPF ou CNPJ é exibido com base na seleção de tipo de pessoa
  get isPessoaFisica(): boolean {
    return this.cliente.tipoPessoa === 'fisica';
  }

  // Função para mascarar CPF ou CNPJ
  get cpfCnpjMask(): string {
    return this.cliente.tipoPessoa === 'fisica' ? '000.000.000-00' : '00.000.000/0000-00';
  }

  // Função para mascarar o CEP
  get cepMask(): string {
    return '00000-000';
  }

  // Função para mascarar o celular
  get celularMask(): string {
    return '(00) 00000-0000'; // Máscara para celular com 9 dígitos
  }

  // Função para mascarar o telefone fixo
  get telefoneMask(): string {
    return '(00) 0000-0000'; // Máscara para telefone fixo com 8 dígitos
  }

  // Função para formatar o CPF ou CNPJ
  formatCpfCnpj(value: string): string {
    if (!value) {
      return '';
    }

    // Verifica se o cliente é pessoa física e aplica a máscara de CPF
    if (this.cliente.tipoPessoa === 'fisica') {
      return value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }

    // Caso contrário, aplica a máscara de CNPJ
    return value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }



  // Função que define se o campo CPF/CNPJ é editável (somente quando for novo cliente)
  get isCpfCnpjEditable(): boolean {
    return this.isNew;
  }

  // Função que define se o ID é editável ou mostra a mensagem "Será gerado automaticamente"
  get idDisplay(): string {
    return this.isNew ? 'Gerado automaticamente' : this.cliente.id;
  }

  onSave(): void {
    if (!this.cliente.razaoSocial || !this.cliente.email) {
      this.exibirMensagem('Preencha todos os campos obrigatórios.', false);
      return;
    }

    this.isLoading = true;
    if (this.isNew) {

      if (this.isPessoaFisica && !this.cliente.cpfCnpj) {
        this.exibirMensagem('Preencha o CPF.', false);
        return;
      } else if (!this.isPessoaFisica && !this.cliente.cpfCnpj) {
        this.exibirMensagem('Preencha o CNPJ.', false);
        return;
      }
      if (this.isPessoaFisica) {
        this.cliente.cpf = this.cliente.cpfCnpj;
        this.cliente.cnpj = '';
      } else {
        this.cliente.cnpj = this.cliente.cpfCnpj;
        this.cliente.cpf = '';
      }


      this.clientesService.createCliente(this.cliente).subscribe({
        next: (response) => {
          this.cliente = response;
          this.isNew = false;
          this.isLoading = false;
          this.exibirMensagem('Cliente cadastrado com sucesso!', true);
        },
        error: (err) => {
          this.isLoading = false;
          this.exibirMensagem('Erro ao cadastrar cliente.', false);
          console.error(err);
        }
      });
    } else {
      this.clientesService.updateCliente(this.cliente.id, this.cliente).subscribe({
        next: () => {
          this.isLoading = false;
          this.exibirMensagem('Cliente atualizado com sucesso!', true);
        },
        error: (err) => {
          this.isLoading = false;
          this.exibirMensagem('Erro ao atualizar cliente.', false);
          console.error(err);
        }
      });
    }
  }

  onDelete(): void {
    if (this.cliente.id) {
      const confirmacao = confirm('Tem certeza que deseja deletar este cliente?');
      if (confirmacao) {
        this.isLoading = true;
        this.clientesService.deleteCliente(this.cliente.id).subscribe({
          next: () => {
            this.exibirMensagem('Cliente deletado com sucesso!', true);
            this.isLoading = false;
            this.router.navigate(['/clientes-busca']);
          },
          error: (err) => {
            this.isLoading = false;
            this.exibirMensagem('Erro ao deletar cliente. Tente novamente.', false);
            console.error('Erro ao deletar cliente:', err);
          }
        });
      }
    } else {
      this.exibirMensagem('Nenhum cliente selecionado para deletar.', false);
    }
  }

  onNew(): void {
    const today = new Date();
    this.cliente = {
      id: null,
      tipoPessoa: '',
      cpf: '',
      cnpj: '',
      nomeFantasia: null,
      razaoSocial: '',
      cep: '',
      endereco: '',
      complemento: '',
      numero: '',
      bairro: '',
      cidade: {
        id: null,
        nome: '',
        estado: '',
        codigoIbge: ''
      },
      celular: '',
      telefone: '',
      rg: '',
      dataNascimento: '',
      email: '',
      estadoInscricaoEstadual: false,
      inscricaoEstadual: null,
      vendedor: {
        id: null,
        nome: '',
        email: '',
        telefone: '',
        usuario: {
          id: null,
          nomeUsuario: '',
          email: '',
          senha: '',
          categoria_id: null,
          status: '',
          telefone: '',
          categoria: {
            id: null,
            nome_categoria: ''
          },
          role: ''
        }
      },
      observacao: '',
      status: true,
      dataCadastro: today.toISOString(),
      limiteCredito: 0
    };
    this.cidadeInput = '',
    this.cidades = [];
    this.vendedorInput = '',
    this.vendedores = [];
    this.isNew = true;
    this.message = null;
  }

  onConsultar(): void {
    this.router.navigate(['/clientes-busca']);
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  private exibirMensagem(msg: string, sucesso: boolean): void {
    this.message = msg;
    this.isSuccess = sucesso;
    this.showAlert = true;
  }

  onSearchCidades(event: Event): void {
    const inputValue = (event.target as HTMLInputElement).value;

    if (inputValue.length >= 2) {
      this.cidadeInput = inputValue;
      this.currentPage = 0;  // Reinicia a página para uma nova busca
      this.searchCidadesLazy();  // Executa a busca com a nova entrada
    } else {
      this.cidades = [];  // Limpa a lista de cidades quando o input é menor que 2 caracteres
      this.showCidadesList = false;  // Oculta a lista
    }
  }


  searchCidadesLazy(): void {
    this.loadingCidades = true;  // Ativa o indicador de carregamento

    this.cidadesService.searchCidades(this.cidadeInput, this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        console.log("Resposta do serviço de cidades:", response);

        // Verifica se a resposta é uma lista de cidades
        if (Array.isArray(response)) {
          if (this.currentPage === 0) {
            // Se estiver na primeira página, substitui as cidades anteriores
            this.cidades = response;
          } else {
            // Se não for a primeira página, concatena as novas cidades ao array existente
            this.cidades = [...this.cidades, ...response];
          }
          console.log("Cidades após processamento:", this.cidades);
          this.showCidadesList = true; // Exibe a lista de cidades
        } else {
          console.error('Formato de resposta inesperado:', response);
          this.cidades = [];
        }
        this.loadingCidades = false; // Desativa o indicador de carregamento
      },
      error: (err) => {
        console.error('Erro ao buscar cidades:', err);
        this.loadingCidades = false; // Desativa o indicador de carregamento em caso de erro
      }
    });
  }



  onSelectCidade(cidade: any): void {
    this.cliente.cidade = cidade;  // Associa a cidade selecionada ao cliente
    this.cidadeInput = cidade.nome;  // Atualiza o input de cidade com o nome selecionado
    this.showCidadesList = false;  // Oculta a lista de cidades após a seleção
  }

  onScroll(): void {
    if (!this.loadingCidades) {
      this.currentPage++;  // Incrementa a página atual para buscar mais resultados
      this.searchCidadesLazy();  // Busca mais cidades
    }
  }

  onSearchVendedores(event: Event): void {
    const inputValue = (event.target as HTMLInputElement).value;
    if (inputValue.length >= 2) {
      this.vendedorInput = inputValue;
      this.currentPage = 0;
      this.searchVendedoresLazy();
    } else {
      this.vendedores = [];
      this.showVendedoresList = false;
    }
  }

  searchVendedoresLazy(): void {
    this.loadingVendedores = true;

    this.vendedoresService.searchVendedores(this.vendedorInput, this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        if (Array.isArray(response)) {
          if (this.currentPage === 0) {
            this.vendedores = response;
          } else {
            this.vendedores = [...this.vendedores, ...response];
          }
          this.showVendedoresList = true;
        } else {
          this.vendedores = [];
        }
        this.loadingVendedores = false;
      },
      error: (err) => {
        console.error('Erro ao buscar vendedores:', err);
        this.loadingVendedores = false;
      }
    });
  }

  onSelectVendedor(vendedor: any): void {
    this.cliente.vendedor = vendedor;
    this.vendedorInput = vendedor.nome;
    this.showVendedoresList = false;
  }

  onScrollVendedores(): void {
    if (!this.loadingVendedores) {
      this.currentPage++;
      this.searchVendedoresLazy();
    }
  }

  setEstadoInscricaoEstadual(event: Event): void {
    const selectedValue = (event.target as HTMLSelectElement).value;

    // Convertendo para booleano
    this.cliente.estadoInscricaoEstadual = selectedValue === 'true';
  }

  // Método para buscar o endereço pelo CEP
  onBuscarCep(): void {
    if (this.cliente.cep.length === 8) {
      this.clientesService.getEnderecoByCep(this.cliente.cep).subscribe({
        next: (data) => {
          if (!data.erro) {
            this.cliente.endereco = data.logradouro;
            this.cliente.bairro = data.bairro;
            this.cliente.cidade.nome = data.localidade;
            this.cliente.cidade.estado = data.uf;

            // Busca a cidade pelo código IBGE e atualiza o campo cidade
            this.clientesService.getCidadeByCodigoIbge(data.ibge).subscribe({
              next: (cidade) => {
                this.cliente.cidade = cidade;  // Atualiza o cliente com os dados da cidade
                this.cidadeInput = cidade.nome;  // Atualiza o campo de input de cidade
              },
              error: (err) => {
                console.error('Erro ao buscar cidade pelo código IBGE:', err);
              }
            });
          } else {
            console.error('CEP não encontrado');
          }
        },
        error: (err) => {
          console.error('Erro ao buscar CEP:', err);
        }
      });
    } else {
      console.error('CEP inválido');
    }
  }
}
