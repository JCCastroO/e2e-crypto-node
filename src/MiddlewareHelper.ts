import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { decrypt, encrypt } from "./index.js";

export default class MiddlewareHelper {
  public request(req: Request, res: Response, next: NextFunction): any {
    const token = this._getToken(req, next);

    try {
      const key = this._getKey(token);
      const encryptedBody = req.body;

      const decryptedBody = decrypt(key, encryptedBody);

      req.body = decryptedBody;
      next();
    } catch (error) {
      return res.status(500).send("Internal Server Error");
    }
  }

  public response(req: Request, res: Response, next: NextFunction): any {
    const originalSend = res.send;

    const token = this._getToken(req, next);

    try {
      const key = this._getKey(token);

      res.setHeader("X-Authorization", req.headers.authorization as string);
      res.removeHeader("authorization");

      res.send = (body): Response => {
        const data = JSON.stringify(body);
        const encryptedBody = encrypt(key, data);

        return originalSend.call(this, encryptedBody);
      };

      next();
    } catch (error) {
      return res.status(500).send("Internal Server Error");
    }
  }

  private _getToken(req: Request, next: NextFunction): string {
    const authHeader = req.headers.authorization as string;
    if (!authHeader) {
      next();
    }

    const token = authHeader.split(" ")[1] as string;
    return token;
  }

  private _getKey(token: string): string {
    const decoded = jwt.decode(token) as jwt.JwtPayload;
    const key = decoded["email"];

    return key;
  }
}
