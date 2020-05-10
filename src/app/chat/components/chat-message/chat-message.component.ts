import { Component, Input, OnInit } from "@angular/core";
import { Message } from "../../models/message.model";

@Component({
  selector: "app-chat-message",
  templateUrl: "./chat-message.component.html",
  styleUrls: ["./chat-message.component.scss"]
})
export class ChatMessageComponent implements OnInit {
  @Input() message: Message;
  @Input() isFromSender: boolean;
  arrowClass = {};

  constructor() {}

  ngOnInit() {
    this.arrowClass = {
      "arrow-left": !this.isFromSender,
      "arrow-right": this.isFromSender
    };
  }
}
