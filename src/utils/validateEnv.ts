import { cleanEnv, str } from "envalid";

function validateEnv() {
  cleanEnv(process.env, {
    DATABASE_URL: str(),

    FRONTEND_ORIGIN: str(),
    // NODE_ENV: str(),

    SENDGRID_API_KEY: str(),

    JWT_ACCESS_TOKEN_PRIVATE_KEY: str(),
    JWT_ACCESS_TOKEN_PUBLIC_KEY: str(),
    JWT_REFRESH_TOKEN_PRIVATE_KEY: str(),
    JWT_REFRESH_TOKEN_PUBLIC_KEY: str(),

    GOOGLE_CLIENT_ID: str(),
    GOOGLE_CLIENT_SECRET: str(),
    GOOGLE_OAUTH_REDIRECT: str(),
  });
}

export default validateEnv;
