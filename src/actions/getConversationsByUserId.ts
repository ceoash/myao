import prisma from "@/libs/prismadb";
import { SafeListing } from "@/types";

interface SafeConversation {
  createdAt: string;
  updatedAt: string;
  participant1Id: string;
  participant2Id: string;
  participant1: SafeUser;
  participant2: SafeUser;
  directMessages: SafeDirectMessage[];
  friendStatus?: boolean;
  blockedStatus?: {isBlocked: boolean, hasBlocked: boolean};
  listing?: SafeListing;
}

interface SafeUser {
  id: string;
  createdAt: string;
  updatedAt: string;
  profile: {
    image: string | null;
    createdAt: string | null;
    updatedAt: string | null;
  };

}

interface SafeDirectMessage {
  createdAt: string;
  updatedAt: string;
  user: SafeUser;
}

const formatDate = (date: Date): string => {
  return date.toISOString();
};

const transformDirectMessage = (directMessage: any): SafeDirectMessage => {
  const { userId, user, ...rest } = directMessage;
  return {
    ...rest,
    createdAt: formatDate(directMessage.createdAt),
    updatedAt: formatDate(directMessage.updatedAt),
    user: transformUser(directMessage.user),
    listing: directMessage.listing
      ? {
          ...directMessage.listing,
          createdAt: formatDate(directMessage.listing.createdAt),
          updatedAt: formatDate(directMessage.listing.updatedAt),
          
        }
      : null,
    

  };
};



const transformUser = (user: any): SafeUser => {
  
  return {
    ...user,
    id: user.id,
    createdAt: formatDate(user.createdAt),
    updatedAt: formatDate(user.updatedAt),
    profile: {
      image: user?.profile?.image || null,
      createdAt: user?.profile?.createdAt ? formatDate(user.profile.createdAt) : null,
      updatedAt: user?.profile?.updatedAt ? formatDate(user.profile.updatedAt) : null,
    },
  };
};



export default async function getConversationsByUserId(userId: string): Promise<SafeConversation[]> {
  
  if (!userId) {
    throw new Error('No userId provided');
  }

  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [{ participant1Id: userId }, { participant2Id: userId }],
    },
    include: {
      directMessages: {
        orderBy: { createdAt: 'desc' },
        include: {
          listing: true,
          user: true
          },
        },
    
      participant1: {
        include: {
          profile: true,
          blockedBy: true,
          blockedFriends: true,
        },
      },
      participant2: {
        include: {
          profile: true,
          blockedBy: true,
          blockedFriends: true,
        },
      },
    },
  }
   
  );
  

  const safeConversations: SafeConversation[] = conversations?.map((conversation) => ({
    ...conversation,
    createdAt: conversation.createdAt.toISOString(),
    updatedAt: conversation.updatedAt.toISOString(),
    participant1: transformUser(conversation.participant1),
    participant2: transformUser(conversation.participant2),
    directMessages: conversation.directMessages.map(transformDirectMessage),

  }))

  return safeConversations;
}

