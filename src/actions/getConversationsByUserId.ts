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
    user: {
      ...user,
      createdAt: formatDate(user.createdAt),
      updatedAt: formatDate(user.updatedAt),
      profile: {
        image: user?.profile?.image || null,
        createdAt: user?.profile?.createdAt ? formatDate(user.profile.createdAt) : null,
        updatedAt: user?.profile?.updatedAt ? formatDate(user.profile.updatedAt) : null,
      },
      blockedFriends: user?.blockedFriends.map((blockedFriend: any) => ({
        ...blockedFriend,
        createdAt: formatDate(blockedFriend.createdAt),
        updatedAt: formatDate(blockedFriend.updatedAt),
      })),
      blockedBy: user?.blockedBy.map((blocked: any) => ({
        ...blocked,
        createdAt: formatDate(blocked.createdAt),
        updatedAt: formatDate(blocked.updatedAt),
      })),
    },
    listing: directMessage.listing
      ? {
          ...directMessage.listing,
          createdAt: formatDate(directMessage.listing.createdAt),
          updatedAt: formatDate(directMessage.listing.updatedAt),
          seller: {
            ...directMessage.listing.seller,
            createdAt: formatDate(directMessage.listing.seller.createdAt),
            updatedAt: formatDate(directMessage.listing.seller.updatedAt),
            profile: {
              image: directMessage.listing.seller?.profile?.image || null,
              createdAt: directMessage.listing.seller?.profile?.createdAt ? formatDate(directMessage.listing.seller.profile.createdAt) : null,
              updatedAt: directMessage.listing.seller?.profile?.updatedAt ? formatDate(directMessage.listing.seller.profile.updatedAt) : null,
            },
          },
          buyer: {
            ...directMessage.listing.buyer,
            createdAt: formatDate(directMessage.listing.buyer.createdAt),
            updatedAt: formatDate(directMessage.listing.buyer.updatedAt),
            profile: {
              image: directMessage.listing.buyer?.profile?.image || null,
              createdAt: directMessage.listing.buyer?.profile?.createdAt ? formatDate(directMessage.listing.buyer.profile.createdAt) : null,
              updatedAt: directMessage.listing.buyer?.profile?.updatedAt ? formatDate(directMessage.listing.buyer.profile.updatedAt) : null,
            },
          },
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
    blockedFriends: user?.blockedFriends.map((blockedFriend: any) => ({
      ...blockedFriend,
      createdAt: formatDate(blockedFriend.createdAt),
      updatedAt: formatDate(blockedFriend.updatedAt),
    })),
    blockedBy: user?.blockedBy.map((blocked: any) => ({
      ...blocked,
      createdAt: formatDate(blocked.createdAt),
      updatedAt: formatDate(blocked.updatedAt),
    })),
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
          user: {
            include: {
              profile: true,
              blockedBy: true,
              blockedFriends: true,
            },
          },
          listing: {
            include: {
              seller: {
                include: {
                  profile: true,
                },
              },
              buyer: {
                include: {
                  profile: true,
                },
              },
            },
          },
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
    orderBy: {
      updatedAt: 'desc',
    },
  });
  

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

