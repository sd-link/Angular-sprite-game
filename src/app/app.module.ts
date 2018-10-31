import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { SlotStateComponent } from './slot/slot-state/slot-state.component';
import { AppRoutingModule } from './app-routing.module';
import { CasinoComponent } from './casino/casino.component';

@NgModule({
  declarations: [
    AppComponent,
    SlotStateComponent,
    CasinoComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [
  ],
  bootstrap: [
    AppComponent,
  ],
})

export class AppModule {}
