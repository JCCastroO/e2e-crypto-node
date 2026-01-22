import type { Express } from "express";
import type { AxiosInstance } from "axios";
import CryptoHelper from "./CryptoHelper.js";
import MiddlewareHelper from "./MiddlewareHelper.js";
import InterceptorHelper from "./InterceptorHelper.js";

const cryptoHelper = new CryptoHelper();
const middlewareHelper = new MiddlewareHelper();
const interceptorHelper = new InterceptorHelper();

function encrypt(key: string, text: string): string {
  return cryptoHelper.encrypt(key, text);
}

function decrypt(key: string, hash: string): string {
  return cryptoHelper.decrypt(key, hash);
}

function addMiddlewares(app: Express): void {
  console.log(
    "🚀 ~ addMiddlewares ~ addMiddlewares:",
    "Registrando Middlewares",
  );
  app.use(middlewareHelper.request);
  app.use(middlewareHelper.response);
}

function addInterceptors(axios: AxiosInstance): void {
  console.log(
    "🚀 ~ addInterceptors ~ addInterceptors:",
    "Registrando Interceptors",
  );
  axios.interceptors.request.use(interceptorHelper.request);
  axios.interceptors.response.use(interceptorHelper.response);
}

export { encrypt, decrypt, addMiddlewares, addInterceptors };
