import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CheckTutorial } from './providers/check-tutorial.service';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/tutorial',
    pathMatch: 'full'
  },
  {
    path: 'account',
    loadChildren: () => import('./pages/account/account.module').then(m => m.AccountModule)
  },
  {
    path: 'support',
    loadChildren: () => import('./pages/support/support.module').then(m => m.SupportModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then(m => m.LoginModule)
  },
  {
    path: 'signup',
    loadChildren: () => import('./pages/signup/signup.module').then(m => m.SignUpModule)
  },
  {
    path: 'app',
    loadChildren: () => import('./pages/tabs-page/tabs-page.module').then(m => m.TabsModule)
  },
  {
    path: 'tutorial',
    loadChildren: () => import('./pages/tutorial/tutorial.module').then(m => m.TutorialModule),
    canLoad: [CheckTutorial]
  },
  {
    path: 'movies',
    loadChildren: './pages/movies/movies.module#MoviesPageModule'
  },
  {
    path: 'movies/:id',
    loadChildren: './pages/movie-details/movie-details.module#MovieDetailsPageModule'
  },
  {
    path: 'captions',
    loadChildren: './pages/home/home.module#HomePageModule'
  },
  // {
  //   path: 'movies',
  //   loadChildren: () => import('./pages/movies/movies.module#MoviesPageModule').then(m => m.MoviesPageModule)
  // },
  // {
  //   path: 'movies/:id',
  //   loadChildren: () => import('./pages/movie-details/movie-details.module#MovieDetailsPageModule').then(m => m.MovieDetailsPageModule)
  // }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
