import { Listing } from "@prisma/client";
import { User as PrismaUser, Profile as PrismaProfile } from "@prisma/client";

export interface Profile extends PrismaProfile {}

export interface User extends PrismaUser {
  profile?: Profile;
  followers?: User[];
  followings?: User[];
  listings?: Listing[];
}

export type SafeUser = Omit<
User,
"createdAt" | "updatedAt" > & {
createdAt: string;
updatedAt: string;
};

export type SafeListing = Omit<
Listing,
"createdAt" | "updatedAt" | "expireAt" > & {
createdAt: string;
updatedAt: string;
expireAt: string;
bidderId?: string;
bidder?: User; 
};


  