import { Routes } from '@angular/router';
import { Home } from './home';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: Home,
    title: 'СЬОХ — Майстерня автомобільних інтер’єрів',
  },
  {
    path: 'privacy-policy',
    loadComponent: () => import('./privacy-policy/privacy-policy').then((page) => page.PrivacyPolicyPage),
    title: 'Privacy Policy — СЬОХ / Syoh',
  },
  {
    path: 'legal-information',
    loadComponent: () => import('./legal-information/legal-information').then((page) => page.LegalInformationPage),
    title: 'Правова інформація — СЬОХ / Syoh',
  },
  { path: '**', redirectTo: '' },
];
