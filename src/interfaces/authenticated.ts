import { Bid, DirectMessage, Listing, Profile, User } from "@prisma/client";

export interface IUser extends User{
    profile: Profile
    followers: User[]
    followings: User[]
}

export interface dashboardProps {
  user: IUser;
  friends: any[];
  followings: IUser[];
  session: any;
  conversations: IConversation[];
  activities: Activity[];
  sent?: Listing[];
  received?: Listing[];
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
      seller: User;
      buyer: User;
      bids: Bid[]
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