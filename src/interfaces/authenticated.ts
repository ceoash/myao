import { Bid, DirectMessage, Listing, Profile, User } from "@prisma/client";



interface IBid extends Bid { user: User; }

export interface IDirectMessage {
  id: string;
  text: string | null;
  userId: string;
  conversationId: string;
  image: string | null;
}

interface IBlockedStatus {
  isBlocked: boolean;
  hasBlocked: boolean;
  isBlockedBy: string;
}

export interface IUser extends User {
  profile: {
    id: string;
    image: string;
    bio: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
  };
  directMessages: IDirectMessage[];
  friends: IUser[];
  blockedFriends: any[];
  blockedBy: any[];
  buyer: any[];
  seller: any[];
}

export interface Conversation {
  id: string;
  participant1: IUser;
  participant2: IUser;
  participant1Id: string;
  participant2Id: string;
  createdAt: string;
  updatedAt: string;
  directMessages: DirectMessage[];
  friendStatus?: boolean;
  blockedStatus?: boolean;
  status?: string;
  currentUser?: any
}

export interface ProfileUser extends User {
  profile: Profile;
  bids?: IBid[];
  averageResponseTime?: any;
  averageCompletionTime?: any;
  sentCount?: any;
  receivedCount?: any;
  cancelledReceivedCount?: any;
  cancelledSentCount?: any;
  completedReceivedCount?: any;
  completedSentCount?: any;
  bidsCount?: any;
  trustScore?: any;
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
  countSent: number;
  countReceived: number;
  countPendingSent: number;
  countPendingReceived: number;
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