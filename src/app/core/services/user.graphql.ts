import {User} from "../models/user.model";
import gql from "graphql-tag";

export interface AllUsersQuery {
  allUsers: User[];
}

export interface UserQuery {
  User: User;
}

const UserFragment = gql`
  fragment UserFragment on User {
    id
    name
    email
    createdAt
  }
`;

export const ALL_USERS_QUERY = gql`
  query AllUsersQuery($idToExclude: ID!) {
    allUsers(orderBy: name_ASC, filter: { id_not: $idToExclude }) {
      ...UserFragment
    }
  }
  ${UserFragment}
`;

export const GET_USER_BY_ID_QUERY = gql`
  query GetUserByIdQuery($userId: ID!) {
    User(id: $userId) {
      ...UserFragment
    }
  }
  ${UserFragment}
`;

export const UPDATE_USER_MUTATION = gql`
  mutation UpdateUserMutation($id: ID!, $name: String!, $email: String!) {
    updateUser(id: $id, name: $name, email: $email) {
      ...UserFragment
    }
  }
  ${UserFragment}
`;

export const USERS_SUBSCRIPTION = gql`
  subscription UsersSubscription {
    User(filter: { mutation_in: [CREATED, UPDATED] }) {
      mutation
      node {
        ...UserFragment
      }
    }
  }
  ${UserFragment}
`;
