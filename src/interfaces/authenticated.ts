import { DirectMessage, Listing, Profile, User } from "@prisma/client";

export interface IUser extends User{
    profile: Profile
    followers: User[]
    followings: User[]
}

export interface dashboardProps {
  listings: ListingsMap;
  user: IUser;
  requests: ListingsMap;
  negotiations: Listing[];
  friends: any[];
  followings: IUser[];
  session: any;
  conversations: IConversation[];
  activities: Activity[];
  allListings?: Listing[];
  allRequests?: Listing[];
  listingsCount?: number;
  requestsCount?: number;
  username?: string;
}

export interface IConversation {
    id: string;
    participant1Id: string;
    participant2Id: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    participant1: IUser;
    participant2: IUser;
    directMessages: DirectMessage[];
  }

export interface Activity {
    modelId?: string;
    message: string;
    value?: string
    type: string;
    action?: string;
    userId: string;
    createdAt?: Date;
  }
  
  export interface ActivityWidgetProps {
    title?: string;
    activities?: Activity[];
  }

  export interface GolablListing {
      id: string;
      title: string | null;
      description: string | null; 
      image: string | null; 
      price: string;
      status: ListingStatus | null;
      sellerId: string;
      buyerId: string;
      bidderId: string;
      seller: User;
      buyer: User;
      bidder: User;
      createdAt: string;
      updatedAt: string;
      expireAt: string | undefined;
  }

export type ListingStatus = "awaiting approval" | "negotiating" | "accepted" | "rejected" | "expired" | "completed" | "cancelled";

export interface DashListing extends Listing {
  status: ListingStatus;
}

export type ListingsMap = {
  [status in ListingStatus]?: DashListing[];
};