import { Component } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(
    private apollo: Apollo
  ) {
    this.allUsers();
    //this.createUser();
  }

  allUsers(): void {
    this.apollo.query({
      query: gql`
        query {
          allUsers {
            id
            name
            email
          }
        }
      `
    }).subscribe(res => console.log(res));
  }

  createUser() {
    this.apollo.mutate({
      mutation: gql`
        mutation CreateNewUser($name: String!, $email: String!, $password: String!) {
          createUser(name: $name, email: $email, password: $password) {
            id
            name
            email
          }
        }
      `,
      variables: {
        name: 'Iron Man',
        email: 'ironman@avengers.com',
        password: '123456'
      }
    }).subscribe(res => console.log(res));
  }

}
