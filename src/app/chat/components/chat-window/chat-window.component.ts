import {Component, OnDestroy, OnInit} from "@angular/core";
import {ActivatedRoute, ParamMap} from "@angular/router";
import {Chat} from "../../models/chat.model";
import {Observable, of, Subscription} from "rxjs";
import {map, mergeMap, take, tap} from "rxjs/operators";
import {Title} from "@angular/platform-browser";
import {UserService} from "../../../core/services/user.service";
import {User} from "../../../core/models/user.model";
import {Message} from "../../models/message.model";
import {MessageService} from "../../services/message.service";
import {AuthService} from "../../../core/services/auth.service";
import {ChatService} from "../../services/chat.service";
import {BaseComponent} from '../../../shared/components/base.component';

@Component({
  selector: "app-chat-window",
  templateUrl: "./chat-window.component.html",
  styleUrls: ["./chat-window.component.scss"]
})
export class ChatWindowComponent extends BaseComponent<Message> implements OnInit, OnDestroy {
  chat: Chat;
  messages$: Observable<Message[]>;
  newMessage = "";
  recipientId: string = null;
  private subscriptions: Subscription[] = [];

  constructor(
    public authService: AuthService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private title: Title,
    private userService: UserService,
    private chatService: ChatService
  ) {
    super();
  }

  ngOnInit() {
    this.title.setTitle("Loading...");
    this.subscriptions.push(
      this.route.data
        .pipe(
          map(routeData => (this.chat = routeData.chat)),
          mergeMap(() => this.route.paramMap),
          tap((params: ParamMap) => {
            if (!this.chat) {
              this.recipientId = params.get("id");
              this.userService
                .getUserById(this.recipientId)
                .pipe(take(1))
                .subscribe((user: User) => this.title.setTitle(user.name));
              this.messages$ = of([]);
            } else {
              this.title.setTitle(this.chat.title || this.chat.users[0].name);
              this.messages$ = this.messageService.getChatMessages(
                this.chat.id
              );
            }
          })
        )
        .subscribe()
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
    this.title.setTitle("Angular Graphcool Chat");
  }

  sendMessage(): void {
    this.newMessage = this.newMessage.trim();
    if (this.newMessage) {
      if (this.chat) {
        this.messageService
          .createMessage({
            text: this.newMessage,
            chatId: this.chat.id,
            senderId: this.authService.authUser.id
          }).pipe(take(1)).subscribe();
        this.newMessage = '';
      } else {
        this.createPrivateChat();
      }
    }
  }

  private createPrivateChat() {
    this.chatService.createPrivateChat(this.recipientId).pipe(
      tap((chat: Chat) => {
        this.chat = chat;
        this.sendMessage();
      })
    ).subscribe();
  }
}
