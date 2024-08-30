import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiberacaoUsuarioComponent } from './liberacao-usuario.component';

describe('LiberacaoUsuarioComponent', () => {
  let component: LiberacaoUsuarioComponent;
  let fixture: ComponentFixture<LiberacaoUsuarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LiberacaoUsuarioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LiberacaoUsuarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
