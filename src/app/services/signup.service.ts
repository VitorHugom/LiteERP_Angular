import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SignupService {
  private baseUrl = environment.apiUrl + '/auth/register';

  constructor(private http: HttpClient) {}

  register(signupData: any): Observable<any> {
    return this.http.post(this.baseUrl, signupData);
  }
}
