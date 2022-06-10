import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AdminRestaurantPageRoutingModule } from './admin-restaurant-routing.module';

import { AdminRestaurantPage } from './admin-restaurant.page';
import {ModalPage} from '../modal/modal.page' ;
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {ModalPageModule} from '../modal/modal.module';


@NgModule({
  entryComponents:[
    ModalPage
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AdminRestaurantPageRoutingModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    ModalPageModule,
  ],
  declarations: [AdminRestaurantPage]
})
export class AdminRestaurantPageModule {}
