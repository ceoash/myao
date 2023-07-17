import NextAuth, { AuthOptions } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/libs/prismadb"
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";


export const authOptions: AuthOptions = {
    adapter: PrismaAdapter(prisma),
    // Configure one or more authentication providers
    providers: [
        CredentialsProvider({
            // The name to display on the sign in form (e.g. "Sign in with...")
            name: "Credentials",
            // `credentials` is used to generate a form on the sign in page.
            // You can specify which fields should be submitted, by adding keys to the `credentials` object.
            // e.g. domain, username, password, 2FA token, etc.
            // You can pass any HTML attribute to the <input> tag through the object.
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

                // Add logic here to look up the user from the credentials supplied
                if(!credentials?.email || !credentials?.password) throw new Error("Invalid credentials")
                const user = await prisma.user.findUnique({
                    where: {
                        email: credentials.email
                    }
                });

                if (!user || !user.hashedPassword) {
                    throw new Error("Invalid credentials")
                };

                const isValid = await bcrypt.compare(credentials.password, user.hashedPassword)
                if (!isValid) {
                    throw new Error("Invalid credentials")
                };

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
              }
              return token;
          },
          session: ({ session, token }) => ({
            ...session,
            user: {
              ...session.user,
              id: token.sub,
            },
          }),
      },  
    pages: {    
        signIn: '/login',
    },
    debug: process.env.NODE_ENV === "development",
    session: {
        strategy: "jwt",
    },

    secret: process.env.NEXT_AUTH_SECRET,
    
}
export default NextAuth(authOptions)