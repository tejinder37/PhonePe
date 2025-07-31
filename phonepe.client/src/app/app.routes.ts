import { Routes } from '@angular/router';
import { PaymentComponent } from './components/payement/payement';
import { PaymentSuccessComponent } from './components/payement-success/payement-success';

export const routes: Routes = [
  { path: '', redirectTo: '/payment', pathMatch: 'full' },
  { path: 'payment', component: PaymentComponent },
  { path: 'payment-success', component: PaymentSuccessComponent },
  { path: '**', redirectTo: '/payment' },
];
