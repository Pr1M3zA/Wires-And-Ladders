type ApiClientVerb = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export default class ApiClient {
   private baseUrl: string;

   constructor(baseUrl: string) {
      this.baseUrl = baseUrl;
   }

   private getOptions(verb: ApiClientVerb, body?: unknown, token: string = ''): RequestInit {
      const headers: Record<string, string> = {
         'Content-Type': 'application/json',
      };
      if (token) {
         headers['authorization'] = token;
      }
      return {
         method: verb,
         headers,
         body: body ? JSON.stringify(body) : null,
      }
   }

   async get(path: string, token: string = '') {
      return fetch(`${this.baseUrl}/${path}`, this.getOptions('GET', null, token));
   }
   async post(path: string, body: unknown, token: string = '') {
      return fetch(`${this.baseUrl}/${path}`, this.getOptions('POST', body, token));
   }
   async put(path: string, body: unknown, token: string = '') {
      return fetch(`${this.baseUrl}/${path}`, this.getOptions('PUT', body, token));
   }
   async delete(path: string, token: string = '') {
      return fetch(`${this.baseUrl}/${path}`, this.getOptions('DELETE', null, token));
   }

}