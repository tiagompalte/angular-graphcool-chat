import {Injectable} from "@angular/core";
import {Apollo, QueryRef} from "apollo-angular";
import {Observable, Subscription} from "rxjs";
import {User} from "../models/user.model";
import {
  ALL_USERS_QUERY,
  AllUsersQuery,
  GET_USER_BY_ID_QUERY,
  UPDATE_USER_MUTATION,
  UserQuery,
  USERS_SUBSCRIPTION
} from "./user.graphql";
import {map} from "rxjs/operators";

@Injectable({
  providedIn: "root"
})
export class UserService {
  users$: Observable<User[]>;
  private queryRef: QueryRef<AllUsersQuery>;
  private usersSubscriptions: Subscription;

  constructor(private apollo: Apollo) {}

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
      variables: { idToExclude }
    });

    this.queryRef.subscribeToMore({
      document: USERS_SUBSCRIPTION,
      updateQuery: (
        previous: AllUsersQuery,
        { subscriptionData }
      ): AllUsersQuery => {
        const subscriptionsUser: User = subscriptionData.data["User"].node;
        const newAllUsers: User[] = [...previous.allUsers];

        switch (subscriptionData.data["User"].mutation) {
          case "CREATED":
            newAllUsers.unshift(subscriptionsUser);
            break;
          case "UPDATED":
            const userToUpdateIndex = newAllUsers.findIndex(
              u => u.id === subscriptionsUser.id
            );
            if (userToUpdateIndex >= 0) {
              newAllUsers[userToUpdateIndex] = subscriptionsUser;
            }
            break;
        }

        return {
          ...previous,
          allUsers: newAllUsers.sort((a, b) => a.name.localeCompare(b.name))
        };
      }
    });

    return this.queryRef.valueChanges.pipe(map(res => res.data.allUsers));
  }

  getUserById(id: string): Observable<User> {
    return this.apollo
      .query<UserQuery>({
        query: GET_USER_BY_ID_QUERY,
        variables: { userId: id }
      })
      .pipe(map(res => res.data.User));
  }

  updateUser(user: User): Observable<User> {
    return this.apollo
      .mutate({
        mutation: UPDATE_USER_MUTATION,
        variables: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      })
      .pipe(map(res => res.data.updateUser));
  }
}
