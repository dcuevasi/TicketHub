import { Routes } from '@angular/router';
import { authGuard } from './services/auth.guard';

export const routes: Routes = [
	{ path: '', redirectTo: '/dashboard', pathMatch: 'full' },
	{ 
		path: 'login', 
		loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
	},
	{ 
		path: 'dashboard', 
		loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
		canActivate: [authGuard],
		data: { animation: 'DashboardPage' }
	},
	{ 
		path: 'tickets', 
		loadComponent: () => import('./components/tickets-list/tickets-list.component').then(m => m.TicketsListComponent),
		canActivate: [authGuard],
		data: { animation: 'TicketsPage' }
	},
];
