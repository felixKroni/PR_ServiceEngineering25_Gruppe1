import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const token = authService.token;
    const isAuthEndpoint = req.url.includes('/auth/');
    
    const publicEndpoints = [
        '/aktie/search',
        '/aktie/trending',
        '/aktien'
    ];
    const isPublicEndpoint = publicEndpoints.some(endpoint => req.url.includes(endpoint));

    if (!token) {
        if (!isAuthEndpoint && !isPublicEndpoint) {
            authService.notifyAuthRequired();
        }
        return next(req);
    }

    const authReq = req.clone({
        setHeaders: {
            Authorization: `Bearer ${token}`
        }
    });

    return next(authReq);
};
