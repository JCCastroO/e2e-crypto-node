import type { Request, Response, NextFunction } from "express";
import CryptoHelper from "./CryptoHelper.js";
import MiddlewareHelper from "./MiddlewareHelper.js";

const cryptoHelper = new CryptoHelper();
const middlewareHelper = new MiddlewareHelper();

function encrypt(key: string, text: string): string {
  return cryptoHelper.encrypt(key, text);
}

function decrypt(key: string, hash: string): string {
  return cryptoHelper.decrypt(key, hash);
}

function addMiddlewares(req: Request, res: Response, next: NextFunction): void {
  middlewareHelper.request(req, res, next);
  middlewareHelper.response(req, res, next);
}

export { encrypt, decrypt, addMiddlewares };
