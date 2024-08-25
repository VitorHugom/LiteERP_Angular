import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SignupService {
  private baseUrl = 'http://localhost:8080/auth/register';

  constructor(private http: HttpClient) {}

  register(signupData: any): Observable<any> {
    return this.http.post(this.baseUrl, signupData);
  }
}
