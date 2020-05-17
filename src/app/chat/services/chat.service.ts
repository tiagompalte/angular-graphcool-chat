import { Injectable } from "@angular/core";
import { Observable, Subscription } from "rxjs";
import { Chat } from "../models/chat.model";
import { Apollo } from "apollo-angular";
import { AuthService } from "../../core/services/auth.service";
import {
  AllChatsQuery,
  CHAT_BY_ID_OR_BY_USERS_QUERY,
  ChatQuery,
  CREATE_PRIVATE_CHAT_MUTATION,
  USER_CHATS_QUERY
} from "./chat.graphql";
import { map } from "rxjs/operators";
import { NavigationEnd, Router } from "@angular/router";

@Injectable({
  providedIn: "root"
})
export class ChatService {
  chats$: Observable<Chat[]>;
  private subscription: Subscription[] = [];

  constructor(
    private apollo: Apollo,
    private authService: AuthService,
    private router: Router
  ) {}

  startChatsMonitoring(): void {
    this.chats$ = this.getUserChats();
    this.subscription.push(this.chats$.subscribe());
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd && !this.router.url.includes("chat")) {
        this.onDestroy();
      }
    });
  }

  getUserChats(): Observable<Chat[]> {
    return this.apollo
      .watchQuery<AllChatsQuery>({
        query: USER_CHATS_QUERY,
        variables: {
          loggedUserId: this.authService.authUser.id
        }
      })
      .valueChanges.pipe(
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
          const userChatsVariables = {
            loggedUserId: this.authService.authUser.id
          };

          const userChatsData = store.readQuery<AllChatsQuery>({
            query: USER_CHATS_QUERY,
            variables: userChatsVariables
          });

          userChatsData.allChats = [createChat, ...userChatsData.allChats];

          store.writeQuery({
            query: USER_CHATS_QUERY,
            variables: userChatsVariables,
            data: userChatsData
          });

          const variables = {
            chatId: targetUserId,
            loggedUserId: this.authService.authUser.id,
            targetUserId
          };

          const data = store.readQuery<AllChatsQuery>({
            query: CHAT_BY_ID_OR_BY_USERS_QUERY,
            variables
          });

          data.allChats = [createChat];

          store.writeQuery({
            query: CHAT_BY_ID_OR_BY_USERS_QUERY,
            variables,
            data
          });
        }
      })
      .pipe(map(res => res.data.createChat));
  }

  private onDestroy() {
    this.subscription.forEach(s => s.unsubscribe());
    this.subscription = [];
  }
}
