import { User, Listing } from "@prisma/client";

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
};


  