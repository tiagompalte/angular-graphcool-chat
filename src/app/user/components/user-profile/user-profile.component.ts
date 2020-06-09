import {Component, HostBinding, OnInit} from "@angular/core";
import {User} from "../../../core/models/user.model";
import {AuthService} from "../../../core/services/auth.service";
import {UserService} from "../../../core/services/user.service";
import {take} from "rxjs/operators";
import {MatSnackBar} from "@angular/material/snack-bar";
import {ErrorService} from "../../../core/services/error.service";
import {MatDialog} from "@angular/material/dialog";
import {ImagePreviewComponent} from "../../../shared/components/image-preview/image-preview.component";

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
    private errorService: ErrorService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.user = this.authService.authUser;
  }

  triggerInputFile(input: HTMLInputElement): void {
    input.click();
  }

  onSelectImage(event: Event): void {
    const input: HTMLInputElement = <HTMLInputElement>event.target;
    const file: File = input.files[0];
    const dialogRef = this.dialog.open<ImagePreviewComponent, { image: File }>(
      ImagePreviewComponent,
      {
        data: { image: file },
        panelClass: "mat-dialog-no-padding",
        maxHeight: "80vh"
      }
    );

    dialogRef
      .afterClosed()
      .pipe(take(1))
      .subscribe(dialogData => {
        input.value = "";
        if (dialogData && dialogData.canSave) {
          this.isLoading = true;
          let message = "";
          this.userService
            .updateUserPhoto(
              dialogData.selectedImage,
              this.authService.authUser
            )
            .pipe(take(1))
            .subscribe(
              (user: User) => {
                message = "Profile updated!";
                this.authService.authUser.photo = user.photo;
              },
              error => (message = this.errorService.getErrorMessage(error)),
              () => {
                this.showMessage(message);
                this.isLoading = false;
              }
            );
        }
      });
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
          this.showMessage(message);
          this.isLoading = false;
        }
      );
  }

  private showMessage(message: string): void {
    this.snackBar.open(message, "OK", {
      duration: 3000,
      verticalPosition: "top"
    });
  }
}
