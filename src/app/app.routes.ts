import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
    
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'chat',
    loadComponent: () => import('./chat/chat.page').then( m => m.ChatPage)
  },
  {
    path: 'datos-personales',
    loadComponent: () => import('./datos-personales/datos-personales.page').then( m => m.DatosPersonalesPage)
  },
  {
    path: 'estadistica',
    loadComponent: () => import('./estadistica/estadistica.page').then( m => m.EstadisticaPage)
  },
  {
    path: 'home1',
    loadComponent: () => import('./home1/home1.page').then( m => m.Home1Page)
  },
  {
    path: 'pruebas',
    loadComponent: () => import('./pruebas/pruebas.page').then( m => m.PruebasPage),
    children:[ {
      path: 'home',
      loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
    },
    {
      path: 'chat',
      loadComponent: () => import('./chat/chat.page').then( m => m.ChatPage)
    },
    {
      path: 'datos-personales',
      loadComponent: () => import('./datos-personales/datos-personales.page').then( m => m.DatosPersonalesPage)
    },
    {
      path: 'estadistica',
      loadComponent: () => import('./estadistica/estadistica.page').then( m => m.EstadisticaPage)
    },
    {
      path: 'seguimiento',
      loadComponent: () => import('./seguimiento/seguimiento.page').then( m => m.SeguimientoPage)
    },
    


  ]
  },
  {
    path: 'nutri-move',
    loadComponent: () => import('./nutri-move/nutri-move.page').then( m => m.NutriMovePage)
  },
  {
    path: 'seguimiento',
    loadComponent: () => import('./seguimiento/seguimiento.page').then( m => m.SeguimientoPage)
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'rutina',
    loadComponent: () => import('./rutina/rutina.page').then( m => m.RutinaPage)
  },
  {
    path: 'registro',
    loadComponent: () => import('./registro/registro.page').then( m => m.RegistroPage)
  },
  // {
  //    path: 'example',
  //    loadComponent: () => import('./example/example.page').then( m => m.ExamplePage)
  //  },
];
