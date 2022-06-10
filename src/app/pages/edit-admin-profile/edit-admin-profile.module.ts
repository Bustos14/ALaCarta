import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditAdminProfilePageRoutingModule } from './edit-admin-profile-routing.module';

import { EditAdminProfilePage } from './edit-admin-profile.page';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        EditAdminProfilePageRoutingModule,
        ReactiveFormsModule
    ],
  declarations: [EditAdminProfilePage]
})
export class EditAdminProfilePageModule {}
