import { randomUUID } from 'crypto';

import type { DB } from './db';

export class DbActions {
  constructor(private db: DB) {}

  checkUserToken(token: string | undefined): boolean {
    if (token === undefined) {
      return false;
    }

    const [userPart, tokenBodyPart] = token.split(':');

    if (this.db.users[userPart]?.token === undefined) {
      return false;
    }

    return this.db.users[userPart].token === token;
  }

  insertFreshlyCreatedUser(username: string, password: string) {
    this.db.users[username] = {
      id: ++this.db.internal_state.user_id,
      password,
      token: `${username}:${randomUUID()}`,
      birthdays: [],
    };
  }
}
