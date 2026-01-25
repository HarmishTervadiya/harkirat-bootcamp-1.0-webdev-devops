import { Request } from 'express';

interface User {
  id: number;
  name: string;
  role: string
}

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
export {};