import type { AxiosResponse, InternalAxiosRequestConfig } from "axios";
import jwt from "jsonwebtoken";
import { decrypt, encrypt } from "./index.js";

export default class InterceptorHelper {
  public request(config: InternalAxiosRequestConfig): any {
    const token = this._getToken(config.headers.Authorization as string);
    const key = this._getKey(token);

    const data = JSON.stringify(config.data);
    const encryptedData = encrypt(key, data);

    config.data = encryptedData;
    return config;
  }

  public response(response: AxiosResponse): any {
    const token = this._getToken(response.headers["X-Authorization"] as string);
    const key = this._getKey(token);
    const encryptedData = response.data;

    const decryptedData = decrypt(key, encryptedData);

    response.data = decryptedData;
    return response;
  }

  private _getToken(authorization: string): string {
    const token = authorization.split(" ")[1] as string;
    return token;
  }

  private _getKey(token: string): string {
    const decoded = jwt.decode(token) as jwt.JwtPayload;
    const key = decoded["email"];

    return key;
  }
}
