import {Component, OnInit} from "@angular/core";
import {Observable} from "rxjs";
import {Chat} from "../../models/chat.model";
import {ChatService} from "../../services/chat.service";
import {AuthService} from "../../../core/services/auth.service";
import {BaseComponent} from "../../../shared/components/base.component";
import {MatDialog} from "@angular/material/dialog";
import {ChatAddGroupComponent} from "../chat-add-group/chat-add-group.component";

@Component({
  selector: "app-chat-list",
  templateUrl: "./chat-list.component.html",
  styleUrls: ["./chat-list.component.scss"]
})
export class ChatListComponent extends BaseComponent<Chat> implements OnInit {
  chats$: Observable<Chat[]>;

  constructor(
    private authService: AuthService,
    private chatService: ChatService,
    private dialog: MatDialog
  ) {
    super();
  }

  ngOnInit() {
    this.chats$ = this.chatService.chats$;
  }

  getChatTitle(chat: Chat): string {
    return chat.title || chat.users[0].name;
  }

  getLastMessage(chat: Chat): string {
    const message = chat.messages[0];
    if (message) {
      const sender =
        message.sender.id === this.authService.authUser.id
          ? "You"
          : message.sender.name;
      return `${sender}: ${message.text}`;
    }
    return "No messages.";
  }

  onAddGroup() {
    this.dialog.open(ChatAddGroupComponent, { width: "400px", height: "80vh" });
  }
}
