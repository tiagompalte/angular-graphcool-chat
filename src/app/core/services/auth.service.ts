import {Injectable} from '@angular/core';
import {Observable, of, ReplaySubject, throwError} from 'rxjs';
import {Apollo} from 'apollo-angular';
import {AUTHENTICATE_USE_MUTATION, LOGGED_IN_USER_QUERY, LoggedInUserQuery, SIGNUP_USER_MUTATION} from './auth.graphql';
import {catchError, map, mergeMap, tap} from 'rxjs/operators';
import {StorageKeys} from '../../storage-keys';
import {Router} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  keepSigned: boolean;
  redirectUrl: string;
  private _isAuthenticated = new ReplaySubject<boolean>(1);

  constructor(
    private apollo: Apollo,
    private router: Router
  ) {
    this.init();
  }

  init() {
    this.keepSigned = JSON.parse(window.localStorage.getItem(StorageKeys.KEEP_SIGNED));
  }

  get isAuthenticated(): Observable<boolean> {
    return this._isAuthenticated.asObservable();
  }

  signInUser(variables: { email: string, password: string }): Observable<{ id: string, token: string }> {
    return this.apollo.mutate({
      mutation: AUTHENTICATE_USE_MUTATION,
      variables
    }).pipe(
      map(res => res.data.authenticateUser),
      tap(res => this.setAuthState({token: res && res.token, isAuthenticated: res !== null})),
      catchError(err => {
        this.setAuthState({token: null, isAuthenticated: false});
        return throwError(err);
      })
    )
  }

  signUpUser(variables: { name: string, email: string, password: string }): Observable<{ id: string, token: string }> {
    return this.apollo.mutate({
      mutation: SIGNUP_USER_MUTATION,
      variables
    }).pipe(
      map(res => res.data.signupUser),
      tap(res => this.setAuthState({token: res && res.token, isAuthenticated: res !== null})),
      catchError(err => {
        this.setAuthState({token: null, isAuthenticated: false});
        return throwError(err);
      })
    )
  }

  toggleKeepSigned() {
    this.keepSigned = !this.keepSigned;
    window.localStorage.setItem(StorageKeys.KEEP_SIGNED, String(this.keepSigned));
  }

  logout() {
    window.localStorage.removeItem(StorageKeys.AUTH_TOKEN);
    window.localStorage.removeItem(StorageKeys.KEEP_SIGNED);
    this.keepSigned = false;
    this._isAuthenticated.next(false);
    this.router.navigate(['/login']);
    this.apollo.getClient().resetStore();
  }

  autoLogin() {
    if (!this.keepSigned) {
      this._isAuthenticated.next(false);
      window.localStorage.removeItem(StorageKeys.AUTH_TOKEN);
      return of();
    }

    return this.validateToken()
      .pipe(
        tap(authData => {
          const token = window.localStorage.getItem(StorageKeys.AUTH_TOKEN);
          this.setAuthState({token, isAuthenticated: authData.isAuthenticated});
        }),
        mergeMap(res => of()),
        catchError(err => {
          this.setAuthState({token: null, isAuthenticated: false});
          return throwError(err);
        })
      );
  }

  private validateToken(): Observable<{ id: string; isAuthenticated: boolean }> {
    return this.apollo.query<LoggedInUserQuery>({query: LOGGED_IN_USER_QUERY})
      .pipe(map(res => {
        const user = res.data.loggedInUser;
        return {
          id: user && user.id,
          isAuthenticated: user !== null
        }
      }));
  }

  private setAuthState(authData: { token: string, isAuthenticated: boolean }) {
    if (authData.isAuthenticated) {
      window.localStorage.setItem(StorageKeys.AUTH_TOKEN, authData.token);
    }
    this._isAuthenticated.next(authData.isAuthenticated);
  }
}