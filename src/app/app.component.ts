import {Component, OnInit} from '@angular/core';
import {AuthService} from './core/services/auth.service';
import {take} from 'rxjs/operators';
import {ErrorService} from './core/services/error.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {AppConfigService} from './core/services/app-config.service';

@Component({
  selector: 'app-root',
  template: '<router-outlet></router-outlet>',
})
export class AppComponent implements OnInit {
  constructor(
    private appConfigService: AppConfigService,
    private errorService: ErrorService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
  }

  ngOnInit(): void {
    this.authService.autoLogin().pipe(take(1)).subscribe(null, error => {
      const message = this.errorService.getErrorMessage(error);
      this.snackBar.open(`Error: ${message}`, 'Done', {duration: 5000, verticalPosition: 'top'})
    });
  }

}
