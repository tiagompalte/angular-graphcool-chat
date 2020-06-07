import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {DashboardHomeComponent} from "./components/dashboard-home/dashboard-home.component";
import {AuthGuard} from "../login/auth.guard";
import {DashboardResourcesComponent} from './components/dashboard-resources/dashboard-resources.component';
import {ChatModule} from '../chat/chat.module';
import {UserModule} from '../user/user.module';

const routes: Routes = [
  {
    path: '',
    component: DashboardHomeComponent,
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    children: [
      {path: 'chat', loadChildren: () => ChatModule, canLoad: [AuthGuard]},
      {path: 'profile', loadChildren: () => UserModule, canLoad: [AuthGuard]},
      {path: '', component: DashboardResourcesComponent}
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule {
}
