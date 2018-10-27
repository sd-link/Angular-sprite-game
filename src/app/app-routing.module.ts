import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BitRocketComponent } from './bit-rocket/bit-rocket.component';
import { CasinoComponent } from './casino/casino.component';

const routes: Routes = [
  { path: 'game/casino', component: CasinoComponent },
  { path: 'game/bit-rocket', component: BitRocketComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
