import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientesCadastroComponent } from './clientes-cadastro.component';

describe('ClientesCadastroComponent', () => {
  let component: ClientesCadastroComponent;
  let fixture: ComponentFixture<ClientesCadastroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientesCadastroComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientesCadastroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
