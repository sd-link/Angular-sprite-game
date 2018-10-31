import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SlotStateComponent } from './slot/slot-state/slot-state.component';
import { CasinoComponent } from './casino/casino.component'

const routes: Routes = [
  { path: 'game/slot', component: SlotStateComponent },
  { path: 'game/casino', component: CasinoComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
