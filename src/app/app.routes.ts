import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'pruebas',
    loadComponent: () => import('./pruebas/pruebas.page').then(m => m.PruebasPage),
    children: [
      {
        path: 'home',
        loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
      },
      {
        path: 'chat',
        loadComponent: () => import('./chat/chat.page').then(m => m.ChatPage),
      },
      {
        path: 'rutina',
        loadComponent: () => import('./rutina/rutina.page').then(m => m.RutinaPage),
      },
      {
        path: 'datos-personales',
        loadComponent: () => import('./datos-personales/datos-personales.page').then(m => m.DatosPersonalesPage),
      },
      {
        path: 'estadistica',
        loadComponent: () => import('./estadistica/estadistica.page').then(m => m.EstadisticaPage),
      },
      {
        path: 'seguimiento',
        loadComponent: () => import('./seguimiento/seguimiento.page').then(m => m.SeguimientoPage),
      },
      {
        path: 'nutri-move',
        loadComponent: () => import('./nutri-move/nutri-move.page').then(m => m.NutriMovePage),
      },
    ],
  },
  {
    path: 'registro',
    loadComponent: () => import('./registro/registro.page').then(m => m.RegistroPage),
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then(m => m.LoginPage),
  },
  {
    path: 'completar-perfil',
    loadComponent: () => import('./completar-perfil/completar-perfil.page').then( m => m.CompletarPerfilPage)
  },
];
