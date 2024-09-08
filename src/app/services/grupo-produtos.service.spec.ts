import { TestBed } from '@angular/core/testing';

import { GrupoProdutosService } from './grupo-produtos.service';

describe('GrupoProdutosService', () => {
  let service: GrupoProdutosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GrupoProdutosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
