import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () => import('./Pages/public/home/home').then(m => m.Home)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./Pages/loggedIn/dashboard/dashboard').then(m => m.Dashboard)
  },
  {
    path: 'portfolios',
    loadComponent: () => import('./Pages/loggedIn/portfolio-list/portfolio-list').then(m => m.PortfolioList)
  },
  {
    path: 'portfolio/:id',
    loadComponent: () => import('./Pages/loggedIn/portfolio/portfolio-overview/portfolio-overview').then(m => m.PortfolioOverview)
  },
  {
    path: 'stocks',
    loadComponent: () => import('./Pages/public/stock-overview/stock-overview').then(m => m.StockOverview)
  }
];
