import { Request, Response, RequestHandler, NextFunction } from 'express';

export const wrapAsync = (handler: (req: Request, res: Response, next: NextFunction) => void | Promise<void>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await handler(req, res, next);
    } catch (err) {
      console.error(err);
      res.status(500);
      res.send({ err: 'Unknown server error.' });
    }
  };
};
