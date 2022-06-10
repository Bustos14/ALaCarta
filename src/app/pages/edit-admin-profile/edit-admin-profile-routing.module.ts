import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EditAdminProfilePage } from './edit-admin-profile.page';

const routes: Routes = [
  {
    path: '',
    component: EditAdminProfilePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EditAdminProfilePageRoutingModule {}
