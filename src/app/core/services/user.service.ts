import {Injectable} from '@angular/core';
import {Apollo} from 'apollo-angular';
import {Observable} from 'rxjs';
import {User} from '../models/user.model';
import {ALL_USERS_QUERY, AllUserQuery, GET_USER_BY_ID_QUERY, UserQuery} from './user.graphql';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private apollo: Apollo
  ) {
  }

  allUsers(idToExclude: string): Observable<User[]> {
    return this.apollo.query<AllUserQuery>({
      query: ALL_USERS_QUERY,
      variables: {idToExclude}
    }).pipe(map(res => res.data.allUsers));
  }

  getUserById(id: string): Observable<User> {
    return this.apollo.query<UserQuery>({
      query: GET_USER_BY_ID_QUERY,
      variables: {userId: id}
    }).pipe(map(res => res.data.User))
  }
}
