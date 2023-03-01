import { User } from "@prisma/client";
import { exclude } from "controllers/auth.controller";
import { Query, Send } from "express-serve-static-core";

export interface TypedRequest<T extends Query, U> extends Express.Request {
  params: T;
  body: U;
}

export interface ReqQuery {
  [id: string]: string;
}

export interface ResBodyEmployee {
  name?: string;
  email?: string;
  updatedAt?: Date;
  role?: string;
}

export interface ResBodyWorks {
  logoutAt?: Date;
  planedSlidePages?: number;
  didSlidePages?: number;
}

export interface ResBodyMemo {
  status?: number;
  memoUrl?: string;
}

export interface ReturnType<T> {
  message: string[];
  data: T;
}

export interface TypedResponse<ResBody, StatusCode extends number = number>
  extends Express.Response {
  status(code: StatusCode): this;
  json: Send<JsonResBody<ResBody>, this>;
}

interface ErrorResponse {
  message: string;
  code?: number;
}

interface JsonResBody<T> {
  data: T[] | T;
  errors: ErrorResponse[];
}

export interface GoogleOauthToken {
  access_token: string;
  id_token: string;
  expires_in: number;
  refresh_token: string;
  token_type: string;
  scope: string;
}

export interface GoogleUserResult {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
}

