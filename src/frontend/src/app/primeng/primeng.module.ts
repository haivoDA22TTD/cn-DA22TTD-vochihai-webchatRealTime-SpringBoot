import { NgModule } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { DialogModule } from 'primeng/dialog';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { InputSwitchModule } from 'primeng/inputswitch';
import { DropdownModule } from 'primeng/dropdown';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { TooltipModule } from 'primeng/tooltip';



@NgModule({
  declarations: [],
  exports: [
    ButtonModule,
    InputTextModule,
    PasswordModule,
    DialogModule,
    AutoCompleteModule,
    InputSwitchModule,
    DropdownModule,
    OverlayPanelModule,
    TooltipModule,
  ]
})
export class PrimengModule { }
