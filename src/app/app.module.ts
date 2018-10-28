import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { SlotStateComponent } from './slot/slot-state/slot-state.component';

@NgModule({
  declarations: [
    AppComponent,
    SlotStateComponent,
  ],
  imports: [
    BrowserModule,
  ],
  providers: [
  ],
  bootstrap: [
    AppComponent,
  ],
})

export class AppModule {}
