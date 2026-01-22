import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { decrypt, encrypt } from "./index.js";

export default class MiddlewareHelper {
  public request(req: Request, res: Response, next: NextFunction): any {
    const authHeader = req.headers["Authorization"] as string;
    if (!authHeader) {
      return next();
    }

    const token = authHeader.split(" ")[1] as string;

    try {
      const decoded = jwt.decode(token) as jwt.JwtPayload;
      const key = decoded["email"];
      const encryptedBody = req.body;

      const decryptedBody = decrypt(key, encryptedBody);

      req.body = decryptedBody;
      return next();
    } catch (error) {
      return res.status(500).send("Internal Server Error");
    }
  }

  public response(req: Request, res: Response, next: NextFunction): any {
    const originalSend = res.send;

    const authHeader = req.headers["Authorization"] as string;
    if (!authHeader) {
      return next();
    }

    const token = authHeader.split(" ")[1] as string;

    try {
      const decoded = jwt.decode(token) as jwt.JwtPayload;
      const key = decoded["email"];

      res.send = (body): Response => {
        res.removeHeader("Authorization");

        res.setHeader("X-Authorization", authHeader);
        res.setHeader("Access-Control-Expose-Headers", "X-Authorization");
        res.setHeader("Content-Type", "text/plain");

        const data = JSON.stringify(body);
        const encryptedBody = encrypt(key, data);

        return originalSend.call(this, encryptedBody);
      };

      return next();
    } catch (error) {
      return res.status(500).send("Internal Server Error");
    }
  }
}
