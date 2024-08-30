import { TestBed } from '@angular/core/testing';

import { BuscaLiberacaoService } from './busca-liberacao.service';

describe('BuscaLiberacaoService', () => {
  let service: BuscaLiberacaoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BuscaLiberacaoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
