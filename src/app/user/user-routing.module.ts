import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {UserProfileComponent} from "./components/user-profile/user-profile.component";
import {AuthGuard} from "../login/auth.guard";

const routes: Routes = [
  { path: "", component: UserProfileComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule {}
