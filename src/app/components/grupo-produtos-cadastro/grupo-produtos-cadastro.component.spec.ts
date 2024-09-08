import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GrupoProdutosCadastroComponent } from './grupo-produtos-cadastro.component';

describe('GrupoProdutosCadastroComponent', () => {
  let component: GrupoProdutosCadastroComponent;
  let fixture: ComponentFixture<GrupoProdutosCadastroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GrupoProdutosCadastroComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GrupoProdutosCadastroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
