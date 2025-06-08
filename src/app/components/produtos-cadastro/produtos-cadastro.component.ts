import { Component, OnInit } from '@angular/core';
import { ProdutosService } from '../../services/produtos.service';
import { GrupoProdutosService } from '../../services/grupo-produtos.service';
import { ActivatedRoute, Router} from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NavigateToSearchButtonComponent } from '../shared/navigate-to-search-button/navigate-to-search-button.component';
import { CameraScannerComponent } from '../camera-scanner/camera-scanner.component';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FooterButtonComponent } from '../shared/footer-button/footer-button.component';


@Component({
  selector: 'app-cadastro-produto',
  standalone: true,
  templateUrl: './produtos-cadastro.component.html',
  styleUrls: ['./produtos-cadastro.component.scss'],
  imports: [CommonModule, FormsModule,NavigateToSearchButtonComponent, MatIconModule, MatButtonModule,FooterButtonComponent, ReactiveFormsModule]
})
export class ProdutosCadastroComponent implements OnInit {

  geralForm: FormGroup = new FormGroup({
    id: new FormControl<string | null>(null),
    descricao: new FormControl<string>('', { nonNullable: true, validators: Validators.required }),
    grupoProdutos: new FormControl<string[]>([], { nonNullable: true, validators: Validators.required }),
    marca: new FormControl<string>(''),
    dataUltimaCompra: new FormControl<string>('', { nonNullable: true, validators: Validators.required }),
  })

  tributacaoForm: FormGroup = new FormGroup({
    codEan: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    codNcm: new FormControl<string>('', { nonNullable: true, validators: [Validators.required, Validators.minLength(8)] }),
    codCest: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
  })

  valoresForm: FormGroup = new FormGroup({
    precoCompra: new FormControl<number>(0, { nonNullable: true, validators: [Validators.required, Validators.min(0)] }),
    precoVenda: new FormControl<number>(0, { nonNullable: true, validators: [Validators.required, Validators.min(0)] }),
    peso: new FormControl<number>(0, { nonNullable: true, validators: [Validators.required, Validators.min(0)] }),
  })

  isNew = true;
  produto: any = {
    id: null,
    descricao: '',
    grupoProdutos: null,
    marca: '',
    dataUltimaCompra: '',
    codEan: '',
    codNcm: '',
    codCest: '',
    precoCompra: null,
    precoVenda: null,
    peso: null,
  };

  buttons = [
  { text: 'Novo', color: 'novo-button', type: 'button', event: 'novo' },
  { text: 'Gravar', color: 'gravar-button', type: 'submit', event: 'gravar' },
  { text: 'Deletar', color: 'deletar-button', type: 'button', event: 'deletar' },
  { text: 'Consultar', color: 'consultar-button', type: 'button', event: 'consultar' },
  ]

  urlProdutosBusca = '/busca-produtos'

  gruposProdutos: any[] = []; // Armazena todos os grupos de produtos
  activeTab = 'geral'; // Aba ativa, começa com "geral"
  message: string | null = null; // Mensagem de feedback
  isSuccess: boolean = true; // Status da operação

  constructor(
    private dialog: MatDialog,
    private produtoService: ProdutosService,
    private grupoProdutosService: GrupoProdutosService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id && id !== 'novo') {
      this.isNew = false;
      this.produtoService.getProdutoById(id).subscribe({
        next: (data) => {
          this.produto = data;
          this.geralForm.patchValue({
            descricao: this.produto.descricao,
            grupoProdutos: this.produto.grupoProdutos,
            dataUltimaCompra: this.produto.dataUltimaCompra,
          });
          this.tributacaoForm.patchValue({
            codEan: this.produto.codEan,
            codNcm: this.produto.codNcm,
            codCest: this.produto.codCest,
          });
          this.valoresForm.patchValue({
            precoCompra: this.produto.precoCompra,
            precoVenda: this.produto.precoVenda,
            peso: this.produto.peso,
          });

          // Carregar grupos de produtos após obter o produto
          this.loadGruposProdutos();
        },
        error: (err) => {
          console.error('Erro ao carregar produto:', err);
        }
      });
    } else {
      this.isNew = true; // Indica que é um novo produto
      this.loadGruposProdutos(); // Carregar grupos de produtos para novos produtos
    }
  }

  // Método para tratar eventos dos botões
  tratarEvento(evento: string) {
    if (evento === 'novo') {
      this.onNew();
    } else if (evento === 'gravar') {
      this.onSave();
    } else if (evento === 'deletar') {
      this.onDelete();
    }else if (evento === 'consultar') {
      this.onConsultar();

    }
  }

  // Carregar grupos de produtos
  loadGruposProdutos(): void {
    this.grupoProdutosService.getGruposProdutos().subscribe({
  next: (data) => {
    this.gruposProdutos = data;

    if (this.produto?.grupoProdutos?.id) {
      const grupoSelecionado = this.gruposProdutos.find(
        g => g.id === this.produto.grupoProdutos.id
      );

      if (grupoSelecionado) {
        this.geralForm.get('grupoProdutos')?.setValue(grupoSelecionado);
      }
    }
  },
  error: (err) => {
    console.error('Erro ao carregar grupos de produtos:', err);
  }
});

  }

  onSave(): void {
    this.geralForm.markAllAsTouched();
    this.tributacaoForm.markAllAsTouched();
    this.valoresForm.markAllAsTouched();

    if (this.geralForm.invalid || this.tributacaoForm.invalid || this.valoresForm.invalid) {
      return;
    }

    const payload = {
      ...this.geralForm.getRawValue(),
      ...this.tributacaoForm.getRawValue(),
      ...this.valoresForm.getRawValue()
    };

    if (this.isNew) {
      this.produtoService.createProduto(payload).subscribe({
        next: (created) => {
          this.produto = created;

          this.geralForm.patchValue({
            descricao: created.descricao,
            dataUltimaCompra: created.dataUltimaCompra,
            grupoProdutos: this.gruposProdutos.find(g => g.id === created.grupoProdutos.id) ?? null
          });
          this.tributacaoForm.patchValue({
            codEan: created.codEan,
            codNcm: created.codNcm,
            codCest: created.codCest
          });
          this.valoresForm.patchValue({
            precoCompra: created.precoCompra,
            precoVenda: created.precoVenda,
            peso: created.peso
          });

          this.isNew = false;
          this.setActiveTab('geral');
          this.exibirMensagem('Produto cadastrado com sucesso!', true);

          this.router.navigate(['/cadastro-produto', created.id], { replaceUrl: true });
        },
        error: (err) => {
          this.exibirMensagem('Erro ao cadastrar produto.', false);
          console.error(err);
        }
      });
    } else {
      const updated = {
        id: this.produto.id,
        ...payload
      };
      this.produtoService.updateProduto(this.produto.id, updated).subscribe({
        next: () => this.exibirMensagem('Produto atualizado com sucesso!', true),
        error: () => this.exibirMensagem('Erro ao atualizar produto.', false)
      });
    }
  }


  onDelete(): void {
    if (this.produto.id) {
      const confirmacao = confirm('Tem certeza que deseja deletar este produto?');
      if (confirmacao) {
        this.produtoService.deleteProduto(this.produto.id).subscribe({
          next: () => {
            this.exibirMensagem('Produto deletado com sucesso!', true);
            this.router.navigate(['/busca-produtos']);
          },
          error: (err) => {
            this.exibirMensagem('Erro ao deletar produto. Tente novamente.', false);
            console.error('Erro ao deletar produto:', err);
          }
        });
      }
    } else {
      this.exibirMensagem('Nenhum produto selecionado para deletar.', false);
    }
  }

  onNew(): void {
    this.isNew = true;

    this.geralForm.reset()
    this.tributacaoForm.reset()
    this.valoresForm.reset()
  }

  setActiveTab(tab: string): void {

    if(tab == 'tributacao') {
      this.geralForm.markAllAsTouched()
      if(!this.geralForm.invalid) {
        this.activeTab = tab;
      }
    }else if(tab == 'valores') {
      this.tributacaoForm.markAllAsTouched()
      if(!this.tributacaoForm.invalid) {
        this.activeTab = tab;
      }
    }else if(tab == 'geral'){
      this.activeTab = tab;
    }
  }

  onConsultar(): void {
    this.router.navigate(['/busca-produtos']);
  }

  exibirMensagem(mensagem: string, isSuccess: boolean): void {
    this.message = mensagem;
    this.isSuccess = isSuccess;
    setTimeout(() => {
      this.message = null;
    }, 3000);
  }

  startScanner(): void {
    const dialogRef = this.dialog.open(CameraScannerComponent, {
      width: '100vw',
      height: '100vh',
      maxWidth: '100vw',
      maxHeight: '100vh',
      panelClass: 'full-screen-dialog',
      backdropClass: 'scanner-backdrop',
      data: {
        videoConstraints: {
          facingMode: 'environment',
          width:  { ideal: 1920 },
          height: { ideal: 1080 }
        }
      }
    });

    dialogRef.afterClosed().subscribe((barcode: string|undefined) => {
      if (barcode) {
        this.tributacaoForm.get('codEan')!.setValue(barcode);
      }
    });
  }

}
