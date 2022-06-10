import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ErrorStateMatcher, MatNativeDateModule, ShowOnDirtyErrorStateMatcher} from '@angular/material/core';
import {HttpClientModule} from '@angular/common/http';


@NgModule({
  providers: [
    {provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher}
  ],
  declarations: [],
  imports: [CommonModule],
  exports:[FormsModule, ReactiveFormsModule, MatNativeDateModule, HttpClientModule]
})
export class AppMaterialModule { }
