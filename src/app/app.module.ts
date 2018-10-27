import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { BitRocketComponent } from './bit-rocket/bit-rocket.component';
import { BitRocketService } from '../services/bit-rocket/bit-rocket.service';
import { RocketBackgroundComponent } from './bit-rocket/background/rocket-background.component';
import { RocketGameComponent } from './bit-rocket/game/rocket-game.component';
import { RocketMessageComponent } from './bit-rocket/message/rocket-message.component';
import { CasinoComponent } from './casino/casino.component';

@NgModule({
  declarations: [
    AppComponent,
    RocketBackgroundComponent,
    BitRocketComponent,
    RocketGameComponent,
    RocketMessageComponent,
    CasinoComponent,
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
  ],
  providers: [
    BitRocketService,
  ],
  bootstrap: [
    AppComponent,
  ],
})

export class AppModule {}
