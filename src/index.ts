import cors from 'cors';
import express from 'express';

import { Birthday, initDb } from './db';
import { DbActions } from './fns';
import { wrapAsync } from './wrap-async';

const { db, load: loadDb, write: writeDb } = initDb();

const dbActions = new DbActions(db);

const app = express();

app.disable('x-powered-by');
app.disable('etag');

app.use(cors());

const tokenMiddleware = (req, res, next) => {
  if (!dbActions.checkUserToken(req.query.token)) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }
  next();
};

const apiV1Router = express.Router();

const authRouter = express.Router();

authRouter.get(
  '/token',
  wrapAsync(async (req, res) => {
    const { username, password } = req.query;
    if (!username || !password) {
      res.status(400).json({ error: 'no "username" or "password"' });
      return;
    }
    if (db.users[username as string] !== undefined && db.users[username as string].password !== password) {
      res.status(401).json({ error: 'incorrect credentials' });
      return;
    } else if (db.users[username as string] === undefined) {
      dbActions.insertFreshlyCreatedUser(username as string, password as string);
      await writeDb();
    }
    res.json({
      token: db.users[username as string].token,
      id: db.users[username as string].id,
      username: username as string,
    });
  })
);
authRouter.get('/me', tokenMiddleware, (req, res) => {
  const [username] = (req.query.token as string).split(':');

  res.json({
    token: db.users[username].token,
    id: db.users[username].id,
    username,
  });
});

const birthdayRouter = express.Router();

birthdayRouter.post(
  '/',
  tokenMiddleware,
  wrapAsync(async (req, res) => {
    if (!(req.query.username && req.query.friend_name && req.query.date)) {
      res.status(400).json({ error: 'asbent paramaters' });
      return;
    }

    const [username] = (req.query.token as string).split(':');

    const birthday: Birthday = {
      date: Number(req.query.date),
      user_id: db.users[username]?.id,
      friend_name: req.query.friend_name as string,
      time_created: Date.now(),
    };

    if (db.users[username].birthdays.find((bd) => bd.friend_name === birthday.friend_name)) {
      res.status(409);
      res.json({ error: `день рождения для пользователя ${username} уже добавлен` });
      return;
    }

    db.users[username].birthdays = [...db.users[username].birthdays, birthday];
    await writeDb();
    res.json(birthday);
  })
);
birthdayRouter.delete(
  '/',
  tokenMiddleware,
  wrapAsync(async (req, res) => {
    const username = req.query.username as string;
    const friendName = req.query.friend_name as string;

    if (!(req.query.username && req.query.friend_name)) {
      res.status(400).json({ error: 'asbent paramaters "username" or "friend_name"' });
      return;
    }
    const birthday = db.users[username].birthdays.find((bd) => bd.friend_name === friendName);
    if (!birthday) {
      res.status(400).json({ error: `no birthday for friend "${friendName}" exists` });
      return;
    }
    db.users[username].birthdays = db.users[username].birthdays.filter((bd) => bd.friend_name !== friendName);
    await writeDb();
    res.json(birthday);
  })
);

apiV1Router.use('/auth', authRouter);
apiV1Router.use('/birthday', birthdayRouter);

apiV1Router.get('/birthdays', tokenMiddleware, async (req, res) => {
  await new Promise((res) => setTimeout(res, 200));
  const [username] = (req.query.token as string).split(':');
  res.json(db.users[username].birthdays);
});

app.use('/api/v1', apiV1Router);

run()

async function run() {
  await loadDb()
  app.listen(8776, () => console.log('http api listening on http://localhost:' + 8776));
}
