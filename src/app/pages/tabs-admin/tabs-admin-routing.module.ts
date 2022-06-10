import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TabsAdminPage } from './tabs-admin.page';
const routes: Routes = [
  {
    path: '',
    component: TabsAdminPage,
    children: [
      {
        path: 'admin-restaurant',
        loadChildren: () => import('../admin-restaurant/admin-restaurant.module').then(m => m.AdminRestaurantPageModule)
      },
      {
        path: 'admin-orders',
        loadChildren: () => import('../admin-orders/admin-orders.module').then(m => m.AdminOrdersPageModule)
      },
      {
        path: '',
        redirectTo: '/tabs-admin/admin-restaurant',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs-admin/admin-restaurant',
    pathMatch: 'full'
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsAdminPageRoutingModule {}
