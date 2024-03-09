import { Activity, Bid, DirectMessage, Listing, ListingActivity, Profile, Review, User, UserActivity } from "@prisma/client";

interface IBid extends Bid { user: User; }

export interface OfferModalStore {
  isOpen: boolean;
  user?: User | null;
  listing?: CustomListing | null;
  section: string | null;
  data: any | null;
  onOpen: (user: any, listing: CustomListing, section: string, data: any, setListing?: (listing: CustomListing) => void)  => void;
  onClose: () => void;
  setListing?: (listing: CustomListing) => void; // New function type
}

export interface ExtendedActivity extends Activity {
  listingActivity?: ListingActivity;
  userActivity?: UserActivity;
  listing?: Listing;
}

export interface IDirectMessage {
  id: string;
  text: string | null;
  userId: string;
  conversationId: string;
  image: string | null;
  read: boolean;
}
export interface AdminDirectMessage {
  id: string;
  text: string | null;
  userId: string;
  conversationId: string;
  image: string | null;
  user: User;
  read: boolean;
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
  unreadNotifications?: number;
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
  unreadCount?: number;
}
export interface AdminConversation {
  id: string;
  participant1: IUser;
  participant2: IUser;
  participant1Id: string;
  participant2Id: string;
  createdAt: string;
  updatedAt: string;
  directMessages: AdminDirectMessage[];
  status?: string;
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

export interface CheckoutListingProps {
  id: string;
  price: number;
  title: string;
  userId: string;
}

export interface CheckoutProps {
  listing: CheckoutListingProps;
  options?: Object;
}

export interface INotification  {
  id: string;
  type: string;
  message: string;
  userId: string;
  read?: boolean;
  createdAt: string;
  updatedAt: string;
  action: string;
}


export interface dashboardProps {
  user: IUser;
  friends: any[];
  followings: IUser[];
  session: any;
  conversations: IConversation[];
  activities: ExtendedActivity[];
  listings: Listing[];
  sent?: Listing[];
  received?: Listing[];
  listingsCount?: number;
  requestsCount?: number;
  username?: string;
  countSent: number;
  countReceived: number;
  countPendingSent: number;
  countPendingReceived: number;
  countCompletedSent?: number;
  notifications: INotification[];
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
    user: IUser;
  }

export interface EventsProps{
  id: string,
  event: string, 
  price: string | number,
  date: string, 
  userId: string 
}

  interface MessageProps {
    buyerId: string;
    sellerId: string;
    listingId: string;
    text: string;
    id: string;
  }

  export interface CustomListing {
    activity?: ExtendedActivity[]
    bids: Bid[]
    buyer: {id: string, username: string, profile?: {
      image?: string;
    }}
    buyerId: string;
    category: string;
    subcategory?: string | null | undefined;
    completedById: string;
    createdAt: Date;
    description: string;
    expireAt: Date;
    id: string;
    image: string | null;
    messages: MessageProps[]
    location?: {
      city?: string,
      region?: string
    },
    options: {

    location: {
      city?: string,
      region?: string
    }, 
    condition: string, pickup: string, public: boolean, color?: string, size?: string, brand?: string, model?: string, year?: string, type?: string, material?: string, style?: string}
    price: string 
    reviews: Review[]
    seller: {id: string, username: string, profile?: {
      image?: string;
    }}
    sellerId: string
    status: string;
    title: string;
    type: string;
    updatedAt: Date;
    user: {
      id: string, username: string
    }
    userId: string;
    }
  
  export interface ActivityWidgetProps {
    title?: string;
    activities?: ExtendedActivity[];
  }

  export interface IActvity extends Activity {

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

export type ListingStatus = "awaiting approval" | "haggling" | "accepted" | "rejected" | "expired" | "completed" | "cancelled";

export interface DashListing extends Listing {
  status: ListingStatus;
}

export type ListingsMap = {
  [status in ListingStatus]?: DashListing[];
};

export interface IEmailTemplate {
  title: string, 
  name: string, 
  url: string, 
  image?: string,
  linkText: string, 
  listing?: { 
    id: string, 
    title: string, 
    price: string, 
    category: string,
    image: string | null, 
    user: { 
      username: string, 
      id: string}}, 
  body?: React.ReactNode
  description?: string
}