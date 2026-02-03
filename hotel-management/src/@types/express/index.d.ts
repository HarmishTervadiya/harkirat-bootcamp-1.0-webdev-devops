import { Request } from "express";

interface User {
  id: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export {};
