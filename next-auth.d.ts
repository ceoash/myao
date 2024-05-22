import NextAuth from 'next-auth';
import { User as NextAuthUser } from 'next-auth';

declare module 'next-auth' {
  interface User extends NextAuthUser {
    id: string;
    username: string | null;
    role?: string | null | undefined;
  }

  interface Session {
    user: {
      id: string;
      username: string;
      role?: string | null | undefined;
    } & DefaultSession['user'];
  }
  
}