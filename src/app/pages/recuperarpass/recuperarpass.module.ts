import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RecuperarpassPageRoutingModule } from './recuperarpass-routing.module';

import { RecuperarpassPage } from './recuperarpass.page';

import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RecuperarpassPageRoutingModule,
    SharedModule
  ],
  declarations: [RecuperarpassPage]
})
export class RecuperarpassPageModule {}
