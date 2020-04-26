import {Component, HostBinding, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {AuthService} from '../../../core/services/auth.service';
import {takeWhile} from 'rxjs/operators';
import {ErrorService} from '../../../core/services/error.service';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {

  loginForm: FormGroup;
  configs = {
    isLogin: true,
    actionText: 'SignIn',
    buttonActionText: 'Create account',
    isLoading: false
  };

  private nameControl = new FormControl('', [Validators.required, Validators.minLength(5)]);
  private alive = true;

  @HostBinding('class.app-login-spinner')
  private applySpinnerClass = true;

  constructor(
    private formBuilder: FormBuilder,
    public authService: AuthService,
    private errorService: ErrorService,
    private snackBar: MatSnackBar
  ) {
  }

  ngOnInit() {
    this.createForm();

    const userData = this.authService.getRememberMe();
    if (userData) {
      this.loginForm.get('email').setValue(userData.email);
      this.loginForm.get('password').setValue(userData.password);
    }
  }

  ngOnDestroy() {
    this.alive = false;
  }

  createForm() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(5)]]
    });
  }

  onSubmit() {
    this.configs.isLoading = true;
    const operation = (this.configs.isLogin) ? this.authService.signInUser(this.loginForm.value) : this.authService.signUpUser(this.loginForm.value);
    operation
      .pipe(
        takeWhile(() => this.alive)
      ).subscribe(res => {
        this.authService.setRememberMe(this.loginForm.value);
        const redirect = this.authService.redirectUrl || '/dashboard';
        this.authService.redirectUrl = null;
        this.configs.isLoading = false;
      },
      error => {
        this.snackBar.open(this.errorService.getErrorMessage(error), 'Done', {duration: 5000, verticalPosition: 'top'});
        this.configs.isLoading = false;
      });
  }

  changeAction() {
    this.configs.isLogin = !this.configs.isLogin;
    this.configs.actionText = !this.configs.isLogin ? 'SignUp' : 'SignIn';
    this.configs.buttonActionText = !this.configs.isLogin ? 'Already have account' : 'Create account';
    !this.configs.isLogin ? this.loginForm.addControl('name', this.nameControl) : this.loginForm.removeControl('name');
  }

  onKeepSigned() {
    this.authService.toggleKeepSigned();
  }

  onRememberMe() {
    this.authService.toggleRememberMe();
  }

}
