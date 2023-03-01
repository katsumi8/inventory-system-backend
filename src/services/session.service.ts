import axios from "axios";
import qs from "qs";
import { GoogleOauthToken, GoogleUserResult } from "types";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID as unknown as string;
const GOOGLE_CLIENT_SECRET = process.env
  .GOOGLE_CLIENT_SECRET as unknown as string;
const GOOGLE_OAUTH_REDIRECT = process.env
  .GOOGLE_OAUTH_REDIRECT as unknown as string;


export const getGoogleOauthToken = async ({
  code,
}: {
  code: string;
}): Promise<GoogleOauthToken> => {
  const rootURl = "https://oauth2.googleapis.com/token";

  const options = {
    code,
    client_id: GOOGLE_CLIENT_ID,
    client_secret: GOOGLE_CLIENT_SECRET,
    redirect_uri: GOOGLE_OAUTH_REDIRECT,
    grant_type: "authorization_code",
  };

  try {
    const { data } = await axios.post<GoogleOauthToken>(
      rootURl,
      qs.stringify(options),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    return data;
  } catch (err: any) {
    console.log("Failed to fetch Google Oauth Tokens");
    throw new Error(err);
  }
};

export async function getGoogleUser({
  id_token,
  access_token,
}: {
  id_token: string;
  access_token: string;
}): Promise<GoogleUserResult> {
  try {
    const { data } = await axios.get<GoogleUserResult>(
      `https://www.googleapis.com/oauth2/v2/userinfo?alt=json&access_token=${access_token}`,
      {
        headers: {
          Authorization: `Bearer ${id_token}`,
        },
      }
    );

    return data;
  } catch (err: any) {
    console.log(err);
    throw Error(err);
  }
}
