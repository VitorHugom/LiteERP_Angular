import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const passwordsMatchValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const password = group.get('password');
  const confirmPassword = group.get('confirmPassword');

  if (!password || !confirmPassword) {
    return null; // se campos não existirem, não valida
  }

  if (password.value !== confirmPassword.value) {
    confirmPassword.setErrors({ passwordsDoNotMatch: true });
    return { passwordsDoNotMatch: true };
  }

  // Se o erro já estava setado e as senhas agora batem, limpa o erro do confirmPassword
  if (confirmPassword.hasError('passwordsDoNotMatch')) {
    confirmPassword.setErrors(null);
  }

  return null;
};
