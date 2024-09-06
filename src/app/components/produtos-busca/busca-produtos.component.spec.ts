import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProdutosBuscaComponent } from './busca-produtos.component';

describe('ProdutosBuscaComponent', () => {
  let component: ProdutosBuscaComponent;
  let fixture: ComponentFixture<ProdutosBuscaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProdutosBuscaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProdutosBuscaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
