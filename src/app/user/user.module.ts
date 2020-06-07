import {NgModule} from "@angular/core";

import {UserRoutingModule} from "./user-routing.module";
import {UserProfileComponent} from "./components/user-profile/user-profile.component";
import {SharedModule} from "../shared/shared.module";

@NgModule({
  declarations: [UserProfileComponent],
  imports: [SharedModule, UserRoutingModule]
})
export class UserModule {}
