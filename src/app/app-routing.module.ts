import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { NoAuthGuard } from './guards/no-auth.guard';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('./pages/auth/auth.module').then( m => m.AuthPageModule), canActivate:[NoAuthGuard]
  },
  {
    path: 'ejercicios',
    loadChildren: () => import('./pages/ej/ejercicios/ejercicios.module').then( m => m.EjerciciosPageModule), canActivate:[AuthGuard]
  },
  {
    path: 'perfil',
    loadChildren: () => import('./pages/perfil/perfil.module').then( m => m.PerfilPageModule), canActivate:[AuthGuard]
  },
  {
    path: 'recuperarpass',
    loadChildren: () => import('./pages/recuperarpass/recuperarpass.module').then( m => m.RecuperarpassPageModule), canActivate:[AuthGuard]
  },
  {
    path: 'ranking',
    loadChildren: () => import('./pages/ranking/ranking.module').then( m => m.RankingPageModule), canActivate:[AuthGuard]
  },
  
   
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
