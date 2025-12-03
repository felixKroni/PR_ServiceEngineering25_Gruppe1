import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const token = authService.token;
    const isAuthEndpoint = req.url.includes('/auth/');
    
    // Public endpoints that don't require authentication
    const publicEndpoints = [
        '/aktie/search',
        '/aktie/trending',
        '/aktien'
    ];
    const isPublicEndpoint = publicEndpoints.some(endpoint => req.url.includes(endpoint));

    if (!token) {
        // Only show auth required modal for non-public, non-auth endpoints
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
