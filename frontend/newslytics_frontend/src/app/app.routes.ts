import { Routes } from '@angular/router';
import { authGuard } from './auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/public/home/home').then(m => m.Home)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/loggedIn/dashboard/dashboard').then(m => m.Dashboard)
  },
  {
    path: 'portfolios',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/loggedIn/portfolio-list/portfolio-list').then(m => m.PortfolioList)
  },
  {
    path: 'portfolio/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/loggedIn/portfolio/portfolio-overview/portfolio-overview').then(m => m.PortfolioOverview)
  },
  {
    path: 'stocks',
    loadComponent: () => import('./pages/public/stock-overview/stock-overview').then(m => m.StockOverview)
  },
  {
    path: 'watchlist-detail',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/loggedIn/watchlist/watchlist-detail/watchlist-detail').then(m => m.WatchlistDetail)
  }
];
