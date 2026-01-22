import type { AxiosResponse, InternalAxiosRequestConfig } from "axios";
import jwt from "jsonwebtoken";
import { decrypt, encrypt } from "./index.js";

export default class InterceptorHelper {
  public request(config: InternalAxiosRequestConfig): any {
    const authHeader = config.headers.Authorization as string;
    if (!authHeader) {
      return config;
    }

    const token = authHeader.split(" ")[1] as string;
    const decoded = jwt.decode(token) as jwt.JwtPayload;
    const key = decoded["email"];

    const data = JSON.stringify(config.data);
    const encryptedData = encrypt(key, data);

    config.data = encryptedData;
    config.headers["Content-Type"] = "text/plain";
    return config;
  }

  public response(response: AxiosResponse): any {
    const authHeader = response.headers["x-authorization"] as string;
    if (!authHeader) {
      return response;
    }

    const token = authHeader.split(" ")[1] as string;
    const decoded = jwt.decode(token) as jwt.JwtPayload;
    const key = decoded["email"];
    const encryptedData = response.data;

    const decryptedData = decrypt(key, encryptedData);

    response.data = JSON.parse(decryptedData);
    response.headers["Content-Type"] = "application/json";

    return response;
  }
}
