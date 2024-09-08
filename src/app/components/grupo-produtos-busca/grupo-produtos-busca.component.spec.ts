import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GrupoProdutosBuscaComponent } from './grupo-produtos-busca.component';

describe('GrupoProdutosBuscaComponent', () => {
  let component: GrupoProdutosBuscaComponent;
  let fixture: ComponentFixture<GrupoProdutosBuscaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GrupoProdutosBuscaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GrupoProdutosBuscaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
