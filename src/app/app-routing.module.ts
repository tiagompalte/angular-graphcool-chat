import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {DashboardModule} from './dashboard/dashboard.module';
import {AuthGuard} from './login/auth.guard';

const routes: Routes = [
  {path: 'dashboard', loadChildren: () => DashboardModule, canLoad: [AuthGuard]},
  {path: '', redirectTo: 'login', pathMatch: 'full'}
]

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
