import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in .env.local");
}

export type AuthTokenPayload = {
  userId: string;
  role: "user" | "staff" | "owner";
  provider: "google" | "kakao" | "apple";
  email?: string;
};

export function signAuthToken(payload: AuthTokenPayload) {
  return jwt.sign(payload, JWT_SECRET as string, {
    expiresIn: "30d",
  });
}

export function verifyAuthToken(token: string): AuthTokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET as string) as AuthTokenPayload;
  } catch (error) {
    return null;
  }
}

export function getBearerToken(request: Request) {
  const authorization = request.headers.get("authorization");

  if (!authorization) {
    return null;
  }

  const [type, token] = authorization.split(" ");

  if (type !== "Bearer" || !token) {
    return null;
  }

  return token;
}

export function getAuthUserFromRequest(request: Request) {
  const token = getBearerToken(request);

  if (!token) {
    return null;
  }

  return verifyAuthToken(token);
}
