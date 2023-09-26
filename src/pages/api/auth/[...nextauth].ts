import NextAuth, { AuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/libs/prismadb";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcrypt";

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),

  providers: [
    GoogleProvider({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      // The name to display on the sign in form (e.g. "Sign in with...")
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "text",
          placeholder: "Enter email",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "Enter Password",
        },
      },

      async authorize(credentials) {
        const now = Date.now();

        // Add logic here to look up the user from the credentials supplied
        if (!credentials?.email || !credentials?.password)
          throw new Error("Invalid credentials");
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
          select: {
            id: true,
            username: true,
            email: true,
            hashedPassword: true,
            options: true,
          },
        });        

        if (user) {
          user.username = user.username || "defaultUsername";
          await prisma.notification.createMany({
            data: {
              userId: user.id,
              type: "alert",
              message: `Your last login was ${now.toLocaleString()}`,
              action: "/dashboard/offers?tab=sent",
              read: false,
            },
          });
        }

        if (!user || !user.hashedPassword) {
          throw new Error("Invalid credentials");
        }

        /*  prisma.user.update({
                    where: {
                        id: user.id,
                    },
                    data: {
                        options: {
                                create: {
                                    current: now,
                                    previous: user?.options?.,
                                },
                                update: {
                                    currentLogin: now,
                                    previous: now,
                                },
                            
                        },
                    },
                }); */

        const isValid = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        );
        if (!isValid) {
          throw new Error("Invalid credentials");
        }

        return user;
      },
    }),
    // ...add more providers here
  ],
  callbacks: {
    jwt({ token, account, user }) {
      if (account) {
        token.accessToken = account.access_token;
        token.id = user?.id;
        token.email = user?.email;
        token.username = user?.username;
      }
      return token;
    },
    session: ({ session, token }) => ({
      ...session,
      name: "myao_session_v2",
      user: {
        ...session.user,
        id: token.sub,
        email: token.email,
        username: token.username,
      },
    }),
  },
  pages: {
    signIn: "/login",
  },
  debug: process.env.NODE_ENV === "development",
  session: {
    strategy: "jwt",
  },

  secret: "temp-secret-myao-v2",
};
export default NextAuth(authOptions);
