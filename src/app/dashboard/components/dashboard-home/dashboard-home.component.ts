import {Component, OnInit} from '@angular/core';
import {MatSidenav} from '@angular/material/sidenav';
import {AuthService} from '../../../core/services/auth.service';

@Component({
  selector: 'app-dashboard-home',
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.scss']
})
export class DashboardHomeComponent implements OnInit {

  constructor(
    private authService: AuthService
  ) {
  }

  ngOnInit() {
  }

  onLogout(sidenav: MatSidenav) {
    sidenav.close().then(() => this.authService.logout());
  }

}
