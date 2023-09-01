import prisma from "@/libs/prismadb";

interface SafeConversation {
  createdAt: string;
  updatedAt: string;
  participant1Id: string;
  participant2Id: string;
  participant1: SafeUser;
  participant2: SafeUser;
  directMessages: SafeDirectMessage[];
  friendStatus?: boolean;
  blockedStatus?: boolean;
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
  blockedBy: {
    friendBlockedId: string;
  }[];
}

interface SafeDirectMessage {
  createdAt: string;
  updatedAt: string;
  user: SafeUser;
}


const formatDate = (date: Date): string => {
  return date ? date.toISOString() : "";
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
      createdAt: user?.profile?.createdAt
        ? formatDate(user.profile.createdAt)
        : null,
      updatedAt: user?.profile?.updatedAt
        ? formatDate(user.profile.updatedAt)
        : null,
    },
  };
};

const transformConversation = (conversation: any, userId?: string): any => {
 
  return {
    ...conversation,
    id: conversation.id,
    participant1Id: conversation.participant1Id,
    participant2Id: conversation.participant2Id,
    participant1: transformUser(conversation.participant1),
    participant2: transformUser(conversation.participant2),
    createdAt: formatDate(conversation.createdAt),
    updatedAt: formatDate(conversation.updatedAt),
    directMessages: conversation.directMessages.map(transformDirectMessage),
  };
};

export default async function getConversationById(id: string) {

  

  const conversation = await prisma.conversation.findUnique({
    where: {
      id: id,
    },
    include: {
      directMessages: {
        orderBy: { createdAt: "desc" },
        take: 20,
        include: {
          listing: true,
          user: {
            select: {
              id: true,
              username: true,
              profile: {
                select: {
                  image: true,
                },
              },
            },
          },
        },
      },
      participant1: {
        select: {
          id: true,
          username: true,
          profile: {
            select: {
              image: true,
            },
          },
        },
      },
      participant2: {
        select: {
          id: true,
          username: true,
          profile: {
            select: {
              image: true,
            },
          }
        },
      },
    },
  });

  return transformConversation(conversation);



}
