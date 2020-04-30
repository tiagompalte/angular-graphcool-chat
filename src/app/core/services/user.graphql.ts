import {User} from '../models/user.model';
import gql from 'graphql-tag';

export interface AllUserQuery {
  allUsers: User[];
}

export const ALL_USERS_QUERY = gql`
  query AllUsersQuery($idToExclude: ID!) {
    allUsers(
      orderBy: name_ASC,
      filter: {
        id_not: $idToExclude
      }
    ) {
      id
      name
      email
      createdAt
    }
  }
`;
