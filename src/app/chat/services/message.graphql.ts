import gql from "graphql-tag";
import {Message} from "../models/message.model";
import {FileFragment} from '../../core/services/file.graphql';

export interface AllMessagesQuery {
  allMessages: Message[];
}

const MessageFragment = gql`
  fragment MessageFragment on Message {
    id
    text
    createdAt
    sender {
      id
      name
      email
      createdAt
      photo {
        ...FileFragment
      }
    }
    chat {
      id
    }
  }
  ${FileFragment}
`;

export const GET_CHAT_MESSAGES_QUERY = gql`
  query getChatMessagesQuery($chatId: ID!) {
    allMessages(filter: { chat: { id: chatId } }, orderBy: createdAt_ASC) {
      ...MessageFragment
    }
  }
  ${MessageFragment}
`;

export const CREATE_MESSAGE_MUTATION = gql`
  mutation createMessageMutation($text: String!, $chatId: ID!, $senderId: ID!) {
    createMessage(text: $text, chatId: $chatId, senderId: $senderId) {
      ...MessageFragment
    }
  }
  ${MessageFragment}
`;

export const USER_MESSAGES_SUBSCRIPTION = gql`
  subscription UserMessagesSubscription($loggedUserId: ID!) {
    Message(
      filter: {
        mutation_in: [ CREATED ],
        node: {
          chat: {
            users_some: {
              id: $loggedUserId
            }
          }
        }
      }
    ) {
      mutation
      node {
        ...MessageFragment
      }
    }
  }
  ${MessageFragment}
`;
