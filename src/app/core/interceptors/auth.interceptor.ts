import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { tap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getToken();

  const reqAutenticado = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(reqAutenticado).pipe(
    tap(event => {
      // se o backend devolveu um token renovado no header, salva
      if ((event as any).headers) {
        const novoToken = (event as any).headers.get('Authorization');
        if (novoToken?.startsWith('Bearer ')) {
          auth.atualizarToken(novoToken.replace('Bearer ', ''));
        }
      }
    })
  );
};
