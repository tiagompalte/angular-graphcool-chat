import gql from "graphql-tag";
import { Message } from "../models/message.model";

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
    }
    chat {
      id
    }
  }
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
