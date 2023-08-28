import { redirect } from "next/navigation";
import { FC } from "react";
import { userSession } from "./helpers";

interface Props {
  children: React.ReactNode;
}

export const ProtectedPage: FC<Props> = async ({ children }) => {
  const _user = await userSession();
  const roles = _user?.roles;
  let hasRole = false;
  if (roles?.find((roleId: string) => roleId === process.env.USER_ROLE)) {
    //console.log("user has role");
    hasRole = true;
  } else {
    console.warn("user ", _user?.name, " does not have access");
  }

  if (!_user || !hasRole) {
    redirect("/unauthorized");
  }
  return <>{children}</>;
};
