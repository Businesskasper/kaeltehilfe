import { toDate, useCrudHook } from "../utils";

export type UserRole = "ADMIN" | "OPERATOR";

export type AdminLogin = {
  role: "ADMIN";
  email: string;
  username: string;
  identityProviderId: string;
  firstname: string;
  lastname: string;
  createOn: Date;
};

export type OperatorLogin = {
  role: "OPERATOR";
  email: string;
  username: string;
  identityProviderId: string;
  registrationNumber: string;
  createOn: Date;
};

export type Login = AdminLogin | OperatorLogin;

export type LoginPost = {
  role: "ADMIN";
  email: string;
  firstname: string;
  lastname: string;
  password: string;
};

export type LoginPatch = {
  email?: string;
  firstname?: string;
  lastname?: string;
};

export const useLogins = () =>
  useCrudHook<Login, never, LoginPost, LoginPatch>({
    key: "logins",
    transformer: { createOn: (value) => toDate(value) ?? new Date() },
  });

export const isOperatorLogin = (login: Login): login is OperatorLogin => {
  return login.role?.toUpperCase() === "OPERATOR";
};
export const isAdminLogin = (login: Login): login is OperatorLogin => {
  return login.role?.toUpperCase() === "ADMIN";
};
