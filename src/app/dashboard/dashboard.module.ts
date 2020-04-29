import {NgModule} from '@angular/core';

import {DashboardRoutingModule} from './dashboard-routing.module';
import {SharedModule} from '../shared/shared.module';
import { DashboardHomeComponent } from './components/dashboard-home/dashboard-home.component';
import { DashboardHeaderComponent } from './components/dashboard-header/dashboard-header.component';
import { DashboardResourcesComponent } from './components/dashboard-resources/dashboard-resources.component';

@NgModule({
  declarations: [DashboardHomeComponent, DashboardHeaderComponent, DashboardResourcesComponent],
  imports: [
    SharedModule,
    DashboardRoutingModule
  ]
})
export class DashboardModule { }
