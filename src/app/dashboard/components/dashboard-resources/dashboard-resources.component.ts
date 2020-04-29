import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-dashboard-resources',
  templateUrl: './dashboard-resources.component.html',
  styleUrls: ['./dashboard-resources.component.scss']
})
export class DashboardResourcesComponent implements OnInit {

  @Input() isMenu = false;
  @Output() close = new EventEmitter<void>();

  resources: any[] = [
    {
      url: '/dashboard/chat',
      icon: 'chat_bubble',
      title: 'My Chats'
    }
  ];

  constructor() { }

  ngOnInit() {
    if (this.isMenu) {
      this.resources.unshift({
        url: '/dashboard',
        icon: 'home',
        title: 'Home'
      })
    }
  }

  onClose() {
    this.close.emit();
  }

}
