import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

export const DB_JSON_FILE_NAME = 'db.json';

type Username = string;

export type Birthday = {
  user_id: number;
  friend_name: string;
  date: number;
  time_created: number;
};

type UserData = {
  id: number;
  password: string;
  token: string;
  birthdays: Birthday[];
};

export type DB = {
  internal_state: {
    user_id: number;
  };
  users: Record<Username, UserData>;
};

export const initDb = (dbJsonPath = path.join(process.cwd(), 'db.json')) => {
  let db: DB = {} as DB;

  return {
    db,
    async load() {
      try {
        await fs.lstat(dbJsonPath);
      } catch (err) {
        if (err.code === 'ENOENT') {
          await fs.writeFile(dbJsonPath, JSON.stringify(getEmptyDb()));
        } else {
          throw err;
        }
      }

      const fileContents = await fs.readFile(dbJsonPath);
      for (const [key, val] of Object.entries(JSON.parse(String(fileContents)) as DB)) {
        db[key] = val;
      }
    },
    async write() {
      return fs.writeFile(dbJsonPath, JSON.stringify(db));
    },
  };
};

function getEmptyDb(): DB {
  return {
    internal_state: {
      user_id: 0,
    },
    users: {},
  };
}
