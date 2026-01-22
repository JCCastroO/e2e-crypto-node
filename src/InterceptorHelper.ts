import type { AxiosResponse, InternalAxiosRequestConfig } from "axios";
import jwt from "jsonwebtoken";
import { decrypt, encrypt } from "./index.js";

export default class InterceptorHelper {
  public request(config: InternalAxiosRequestConfig): any {
    const authHeader = config.headers.Authorization as string;
    console.log("🚀 ~ InterceptorHelper ~ request ~ authHeader:", authHeader);
    if (!authHeader) {
      return config;
    }

    const token = authHeader.split(" ")[1] as string;
    console.log("🚀 ~ InterceptorHelper ~ request ~ token:", token);
    const key = this._getKey(token);
    console.log("🚀 ~ InterceptorHelper ~ request ~ key:", key);

    const data = JSON.stringify(config.data);
    console.log("🚀 ~ InterceptorHelper ~ request ~ data:", data);
    const encryptedData = encrypt(key, data);
    console.log(
      "🚀 ~ InterceptorHelper ~ request ~ encryptedData:",
      encryptedData,
    );

    config.data = encryptedData;
    return config;
  }

  public response(response: AxiosResponse): any {
    const authHeader = response.headers["X-Authorization"] as string;
    console.log("🚀 ~ InterceptorHelper ~ response ~ authHeader:", authHeader);
    if (!authHeader) {
      return response;
    }

    const token = authHeader.split(" ")[1] as string;
    console.log("🚀 ~ InterceptorHelper ~ response ~ token:", token);
    const key = this._getKey(token);
    console.log("🚀 ~ InterceptorHelper ~ response ~ key:", key);
    const encryptedData = response.data;
    console.log(
      "🚀 ~ InterceptorHelper ~ response ~ encryptedData:",
      encryptedData,
    );

    const decryptedData = decrypt(key, encryptedData);
    console.log(
      "🚀 ~ InterceptorHelper ~ response ~ decryptedData:",
      decryptedData,
    );

    response.data = decryptedData;
    return response;
  }

  private _getKey(token: string): string {
    const decoded = jwt.decode(token) as jwt.JwtPayload;
    const key = decoded["email"];

    return key;
  }
}
