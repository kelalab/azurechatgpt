import { createHash } from "crypto";
import { getServerSession } from "next-auth";
import { options } from "./auth-api";

export const userSession = async (): Promise<UserModel | null> => {
  const session = await getServerSession(options);
  if (session && session.user) {
    //console.log("session.user", session, session?.user.roles);
    return session.user as UserModel;
  }

  return null;
};

export const userHashedId = async (): Promise<string> => {
  const user = await userSession();
  if (user?.email) {
    return hashValue(user.email);
  } else if (user?.name) {
    return hashValue(user.name);
  }

  throw new Error("User not found");
};

export type UserModel = {
  name: string;
  image: string;
  email: string;
  roles: string[];
};

export const hashValue = (value: string): string => {
  const hash = createHash("sha256");
  hash.update(value);
  return hash.digest("hex");
};
