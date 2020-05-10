import {User} from '../../core/models/user.model';
import {Message} from './message.model';

export class Chat {
  id: string;
  createAt?: string;
  isGroup?: boolean;
  title?: string;
  users?: User[];
  messages?: Message[];
}
