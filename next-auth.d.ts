import NextAuth from 'next-auth';
import { User as NextAuthUser } from 'next-auth';

declare module 'next-auth' {
  interface User extends NextAuthUser {
    id: string;
    username: string | null;
  }

  interface Session {
    user: {
      id: string;
      username: string;
    } & DefaultSession['user'];
  }
  
}