import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProdutosCadastroComponent } from './produtos-cadastro.component';

describe('ProdutosCadastroComponent', () => {
  let component: ProdutosCadastroComponent;
  let fixture: ComponentFixture<ProdutosCadastroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProdutosCadastroComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProdutosCadastroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
