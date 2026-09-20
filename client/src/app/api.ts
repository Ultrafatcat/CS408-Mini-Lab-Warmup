import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Service()
export class Api {
    private http = inject(HttpClient);

    getHello() {
    return this.http.get<{ message: string }>('http://localhost:3000/api/hello');
    }
}
