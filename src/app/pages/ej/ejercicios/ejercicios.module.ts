import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EjerciciosPageRoutingModule } from './ejercicios-routing.module';

import { EjerciciosPage } from './ejercicios.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EjerciciosPageRoutingModule,
    SharedModule
  ],
  declarations: [EjerciciosPage]
})
export class EjerciciosPageModule {}
