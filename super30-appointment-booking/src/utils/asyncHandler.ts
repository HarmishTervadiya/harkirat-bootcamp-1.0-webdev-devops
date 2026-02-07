import type { NextFunction, Request, RequestHandler, Response } from "express";

type AsyncRequestHandler = {
  req: Request;
  res: Response;
  next: NextFunction;
};

export const asyncHandler = async (requestHandler: RequestHandler) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};
