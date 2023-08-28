import NextAuth, { NextAuthOptions } from "next-auth";
import { Provider } from "next-auth/providers";
import AzureADProvider from "next-auth/providers/azure-ad";
import GitHubProvider from "next-auth/providers/github";

const configureIdentityProvider = () => {
  const providers: Array<Provider> = [];

  if (process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET) {
    providers.push(
      GitHubProvider({
        clientId: process.env.AUTH_GITHUB_ID!,
        clientSecret: process.env.AUTH_GITHUB_SECRET!,
      })
    );
  }
  let profilePhotoSize = 48;
  if (
    process.env.AZURE_AD_CLIENT_ID &&
    process.env.AZURE_AD_CLIENT_SECRET &&
    process.env.AZURE_AD_TENANT_ID
  ) {
    providers.push(
      AzureADProvider({
        clientId: process.env.AZURE_AD_CLIENT_ID!,
        clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
        tenantId: process.env.AZURE_AD_TENANT_ID!,

        async profile(profile, tokens) {
          console.log("profile", profile);
          // https://docs.microsoft.com/en-us/graph/api/profilephoto-get?view=graph-rest-1.0#examples
          const response = await fetch(
            `https://graph.microsoft.com/v1.0/me/photos/${profilePhotoSize}x${profilePhotoSize}/$value`,
            { headers: { Authorization: `Bearer ${tokens.access_token}` } }
          );
          // Confirm that profile photo was returned
          let image;
          // TODO: Do this without Buffer
          if (response.ok && typeof Buffer !== "undefined") {
            try {
              const pictureBuffer = await response.arrayBuffer();
              const pictureBase64 =
                Buffer.from(pictureBuffer).toString("base64");
              image = `data:image/jpeg;base64, ${pictureBase64}`;
            } catch {}
          }
          return {
            roles: profile.groups ?? "guest",
            id: profile.sub,
            name: profile.name,
            email: profile.email,
            image: image ?? null,
          };
        },
      })
    );
  }
  return providers;
};

export const options: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [...configureIdentityProvider()],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    jwt({ token, user, profile }) {
      //console.log("token", token, "user", user, "profile", profile);
      if (user) {
        token.roles = user.roles;
      }
      return token;
    },
    session({ session, token }) {
      //console.log("token", token, "session", session);
      if (token && session.user) {
        session.user.roles = token.roles;
      }
      return session;
    },
  },
};

export const handlers = NextAuth(options);
