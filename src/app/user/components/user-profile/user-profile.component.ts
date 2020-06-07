import {Component, HostBinding, OnInit} from "@angular/core";
import {User} from "../../../core/models/user.model";
import {AuthService} from "../../../core/services/auth.service";
import {UserService} from "../../../core/services/user.service";
import {take} from "rxjs/operators";
import {MatSnackBar} from "@angular/material/snack-bar";
import {ErrorService} from "../../../core/services/error.service";

@Component({
  selector: "app-user-profile",
  templateUrl: "./user-profile.component.html",
  styleUrls: ["./user-profile.component.scss"]
})
export class UserProfileComponent implements OnInit {
  user: User;
  isEditing = false;
  isLoading = false;
  @HostBinding("class.app-user-profile") private applyHostClass = true;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private snackBar: MatSnackBar,
    private errorService: ErrorService
  ) {}

  ngOnInit() {
    this.user = JSON.parse(JSON.stringify(this.authService.authUser));
  }

  onSave() {
    this.isLoading = true;
    this.isEditing = false;
    let message = "";
    this.userService
      .updateUser(this.user)
      .pipe(take(1))
      .subscribe(
        () => (message = "Profile updated!"),
        error => (message = this.errorService.getErrorMessage(error)),
        () => {
          this.snackBar.open(message, "OK", {
            duration: 3000,
            verticalPosition: "top"
          });
          this.isLoading = false;
        }
      );
  }
}
