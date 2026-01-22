import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { decrypt, encrypt } from "./index.js";

export default class MiddlewareHelper {
  public request(req: Request, res: Response, next: NextFunction): any {
    const authHeader = req.headers.authorization as string;
    console.log("🚀 ~ MiddlewareHelper ~ request ~ authHeader:", authHeader);
    if (!authHeader) {
      next();
    }

    const token = authHeader.split(" ")[1] as string;
    console.log("🚀 ~ MiddlewareHelper ~ request ~ token:", token);

    try {
      const key = this._getKey(token);
      console.log("🚀 ~ MiddlewareHelper ~ request ~ key:", key);
      const encryptedBody = req.body;
      console.log(
        "🚀 ~ MiddlewareHelper ~ request ~ encryptedBody:",
        encryptedBody,
      );

      const decryptedBody = decrypt(key, encryptedBody);
      console.log(
        "🚀 ~ MiddlewareHelper ~ request ~ decryptedBody:",
        decryptedBody,
      );

      req.body = decryptedBody;
      next();
    } catch (error) {
      return res.status(500).send("Internal Server Error");
    }
  }

  public response(req: Request, res: Response, next: NextFunction): any {
    const originalSend = res.send;

    const authHeader = req.headers.authorization as string;
    console.log("🚀 ~ MiddlewareHelper ~ response ~ authHeader:", authHeader);
    if (!authHeader) {
      next();
    }

    const token = authHeader.split(" ")[1] as string;
    console.log("🚀 ~ MiddlewareHelper ~ response ~ token:", token);

    try {
      const key = this._getKey(token);
      console.log("🚀 ~ MiddlewareHelper ~ response ~ key:", key);

      res.setHeader("X-Authorization", req.headers.authorization as string);
      res.removeHeader("authorization");

      res.send = (body): Response => {
        const data = JSON.stringify(body);
        console.log("🚀 ~ MiddlewareHelper ~ response ~ data:", data);
        const encryptedBody = encrypt(key, data);
        console.log(
          "🚀 ~ MiddlewareHelper ~ response ~ encryptedBody:",
          encryptedBody,
        );

        return originalSend.call(this, encryptedBody);
      };

      next();
    } catch (error) {
      return res.status(500).send("Internal Server Error");
    }
  }

  private _getKey(token: string): string {
    const decoded = jwt.decode(token) as jwt.JwtPayload;
    const key = decoded["email"];

    return key;
  }
}
