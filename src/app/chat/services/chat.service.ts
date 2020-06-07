import { Injectable } from "@angular/core";
import { Observable, Subscription } from "rxjs";
import { Chat } from "../models/chat.model";
import { Apollo, QueryRef } from "apollo-angular";
import { AuthService } from "../../core/services/auth.service";
import {
  AllChatsQuery,
  CHAT_BY_ID_OR_BY_USERS_QUERY,
  ChatQuery,
  CREATE_GROUP_MUTATION,
  CREATE_PRIVATE_CHAT_MUTATION,
  USER_CHATS_QUERY,
  USER_CHATS_SUBSCRIPTION
} from "./chat.graphql";
import { map } from "rxjs/operators";
import { NavigationEnd, Router } from "@angular/router";
import {
  AllMessagesQuery,
  GET_CHAT_MESSAGES_QUERY,
  USER_MESSAGES_SUBSCRIPTION
} from "./message.graphql";
import { Message } from "../models/message.model";
import { UserService } from "../../core/services/user.service";
import {BaseService} from '../../core/services/base.service';

@Injectable({
  providedIn: "root"
})
export class ChatService extends BaseService {
  chats$: Observable<Chat[]>;
  private queryRef: QueryRef<AllChatsQuery>;
  private subscription: Subscription[] = [];

  constructor(
    private apollo: Apollo,
    private authService: AuthService,
    private router: Router,
    private userService: UserService
  ) {
    super();
  }

  startChatsMonitoring(): void {
    if (!this.chats$) {
      this.chats$ = this.getUserChats();
      this.subscription.push(this.chats$.subscribe());
      this.subscription.push(
        this.router.events.subscribe(event => {
          if (
            event instanceof NavigationEnd &&
            !this.router.url.includes("chat")
          ) {
            this.stopChatsMonitoring();
            this.userService.stopUserMonitoring();
          }
        })
      );
    }
  }

  private stopChatsMonitoring() {
    this.subscription.forEach(s => s.unsubscribe());
    this.subscription = [];
  }

  getUserChats(): Observable<Chat[]> {
    this.queryRef = this.apollo.watchQuery<AllChatsQuery>({
      query: USER_CHATS_QUERY,
      variables: {
        loggedUserId: this.authService.authUser.id
      },
      fetchPolicy: "network-only"
    });

    this.queryRef.subscribeToMore({
      document: USER_CHATS_SUBSCRIPTION,
      variables: {
        loggedUserId: this.authService.authUser.id
      },
      updateQuery: (
        previous: AllChatsQuery,
        { subscriptionData }
      ): AllChatsQuery => {
        const newChat: Chat = new subscriptionData.data["Chat"].node();
        if (previous.allChats.every(chat => chat.id !== newChat.id)) {
          return {
            ...previous,
            allChats: [newChat, ...previous.allChats]
          };
        }
        return previous;
      }
    });

    this.queryRef.subscribeToMore({
      document: USER_MESSAGES_SUBSCRIPTION,
      variables: {
        loggedUserId: this.authService.authUser.id
      },
      updateQuery: (
        previous: AllChatsQuery,
        { subscriptionData }
      ): AllChatsQuery => {
        const newMessage: Message = subscriptionData.data["Message"].node;
        try {
          if (newMessage.sender.id !== this.authService.authUser.id) {
            const apolloClient = this.apollo.getClient();
            const chatMessageVariables = { chatId: newMessage.chat.id };
            const chatMessagesData = apolloClient.readQuery<AllMessagesQuery>({
              query: GET_CHAT_MESSAGES_QUERY,
              variables: chatMessageVariables
            });
            chatMessagesData.allMessages = [
              ...chatMessagesData.allMessages,
              newMessage
            ];
            apolloClient.writeQuery({
              query: GET_CHAT_MESSAGES_QUERY,
              variables: chatMessageVariables,
              data: chatMessagesData
            });
          }
        } catch (e) {
          console.log("AllChatsQuery not found!");
        }
        const chatToUpdateIndex: number = previous.allChats
          ? previous.allChats.findIndex(chat => chat.id === newMessage.chat.id)
          : -1;
        if (chatToUpdateIndex > -1) {
          const newAllChats = [...previous.allChats];
          const chatToUpdate: Chat = Object.assign(
            {},
            newAllChats[chatToUpdateIndex]
          );
          chatToUpdate.messages = [newMessage];
          newAllChats[chatToUpdateIndex] = chatToUpdate;
          return {
            ...previous,
            allChats: newAllChats
          };
        }
        return previous;
      }
    });

    return this.queryRef.valueChanges.pipe(
      map(res => res.data.allChats),
      map((chats: Chat[]) => {
        const chatsToOrder = chats.slice();
        return chatsToOrder.sort((a, b) => {
          const valueA =
            a.messages.length > 0
              ? new Date(a.messages[0].createdAt).getTime()
              : new Date(a.createAt).getTime();
          const valueB =
            b.messages.length > 0
              ? new Date(b.messages[0].createdAt).getTime()
              : new Date(b.createAt).getTime();
          return valueB - valueA;
        });
      })
    );
  }

  getChatByIdOrByUsers(chatOrUserId: string): Observable<Chat> {
    return this.apollo
      .query<ChatQuery | AllChatsQuery>({
        query: CHAT_BY_ID_OR_BY_USERS_QUERY,
        variables: {
          chatId: chatOrUserId,
          loggedUserId: this.authService.authUser.id,
          targetUserId: chatOrUserId
        }
      })
      .pipe(
        map(res =>
          res.data["Chat"] ? res.data["Chat"] : res.data["allChats"][0]
        )
      );
  }

  createPrivateChat(targetUserId: string): Observable<Chat> {
    return this.apollo
      .mutate({
        mutation: CREATE_PRIVATE_CHAT_MUTATION,
        variables: {
          loggedUserId: this.authService.authUser.id,
          targetUserId
        },
        update: (store, { data: { createChat } }) => {

          this.readAndWriteQuery<Chat>({
            store,
            newRecord: createChat,
            query: USER_CHATS_QUERY,
            queryName: 'allChats',
            arrayOperation: 'unshift',
            variables: {loggedUserId: this.authService.authUser.id}
          });

          this.readAndWriteQuery<Chat>({
            store,
            newRecord: createChat,
            query: CHAT_BY_ID_OR_BY_USERS_QUERY,
            queryName: 'allChats',
            arrayOperation: 'singleRecord',
            variables: {
              chatId: targetUserId,
              loggedUserId: this.authService.authUser.id,
              targetUserId
            }
          });
        }
      })
      .pipe(map(res => res.data.createChat));
  }

  createGroup(variables: {
    title: string;
    usersIds: string[];
  }): Observable<Chat> {
    variables.usersIds.push(this.authService.authUser.id);
    return this.apollo
      .mutate({
        mutation: CREATE_GROUP_MUTATION,
        variables: {
          ...variables,
          loggedUserId: this.authService.authUser.id
        },
        optimisticResponse:{
          __typename: 'Mutation',
          createChat: {
            __typename: 'Chat',
            id: '',
            title: variables.title,
            createdAt: new Date().toISOString(),
            isGroup: true,
            users: [
              {
                __typename: 'User',
                id: '',
                name: '',
                email: '',
                createdAt: new Date().toISOString()
              }
            ],
            messages: []
          }
        },
        update: (store, { data: { createChat } }) => {

          this.readAndWriteQuery<Chat>({
            store,
            newRecord: createChat,
            query: USER_CHATS_QUERY,
            queryName: 'allChats',
            arrayOperation: 'unshift',
            variables: {loggedUserId: this.authService.authUser.id}
          });

        }
      })
      .pipe(map(res => res.data.createChat));
  }
}
