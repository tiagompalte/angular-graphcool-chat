import {Injectable} from '@angular/core';
import {Apollo, QueryRef} from 'apollo-angular';
import {Observable, Subscription} from 'rxjs';
import {User} from '../models/user.model';
import {ALL_USERS_QUERY, AllUsersQuery, GET_USER_BY_ID_QUERY, NEW_USERS_SUBSCRIPTION, UserQuery} from './user.graphql';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  users$: Observable<User[]>;
  private queryRef: QueryRef<AllUsersQuery>;
  private usersSubscriptions: Subscription;

  constructor(
    private apollo: Apollo
  ) {
  }

  startUsersMonitoring(idToExclude: string) {
    if (!this.users$) {
      this.users$ = this.allUsers(idToExclude);
      this.usersSubscriptions = this.users$.subscribe();
    }
  }

  stopUserMonitoring() {
    if (this.usersSubscriptions) {
      this.usersSubscriptions.unsubscribe();
      this.usersSubscriptions = null;
      this.users$ = null;
    }
  }

  allUsers(idToExclude: string): Observable<User[]> {
    this.queryRef = this.apollo.watchQuery<AllUsersQuery>({
      query: ALL_USERS_QUERY,
      variables: {idToExclude}
    });

    this.queryRef.subscribeToMore({
      document: NEW_USERS_SUBSCRIPTION,
      updateQuery: (previous: AllUsersQuery, {subscriptionData}): AllUsersQuery => {
        const newUser: User = subscriptionData.data["User"].node;
        return {
          ...previous,
          allUsers: ([newUser, ...previous.allUsers]).sort((a, b) => a.name.localeCompare(b.name))
        }
      }
    })

    return this.queryRef.valueChanges.pipe(map(res => res.data.allUsers));
  }

  getUserById(id: string): Observable<User> {
    return this.apollo.query<UserQuery>({
      query: GET_USER_BY_ID_QUERY,
      variables: {userId: id}
    }).pipe(map(res => res.data.User))
  }
}
