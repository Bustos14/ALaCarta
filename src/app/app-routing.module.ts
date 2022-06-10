import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
const routes: Routes = [
  {
    path: 'tabs',
    loadChildren: () => import('./pages/tabs/tabs.module').then(m => m.TabsPageModule),
   // ...canActivate(redirectUnauthorizedToLogin),
  },
  {
    path: '',
    loadChildren: () => import('./pages/login/login.module').then(m => m.LoginPageModule),
  },
  {
    path: 'register',
    loadChildren: () => import('./pages/register/register.module').then(m => m.RegisterPageModule)
  },
  {
    path: 'register-admin',
    loadChildren: () => import('./pages/register-admin/register-admin.module').then(m => m.RegisterAdminPageModule),
    //...canActivate(redirectUnauthorizedToLogin),
  },
  {
    path: 'tabs-admin',
    loadChildren: () => import('./pages/tabs-admin/tabs-admin.module').then(m => m.TabsAdminPageModule)
  },
  {
    path: 'edit-admin-profile',
    loadChildren: () => import('./pages/edit-admin-profile/edit-admin-profile.module').then(m => m.EditAdminProfilePageModule)
  },
  {
    path: 'restaurant-details/:aId',
    loadChildren: () => import('./pages/restaurant-details/restaurant-details.module').then(m => m.RestaurantDetailsPageModule)
  },
  {
    path: 'cart-modal',
    loadChildren: () => import('./pages/cart-modal/cart-modal.module').then( m => m.CartModalPageModule)
  },
  {
    path: 'edit-profile',
    loadChildren: () => import('./pages/edit-profile/edit-profile.module').then( m => m.EditProfilePageModule)
  },
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
