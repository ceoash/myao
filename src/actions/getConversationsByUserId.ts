import prisma from "@/libs/prismadb";
import { SafeListing } from "@/types";
import { User } from "@prisma/client";

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

let friends: string[] = [];
let blocked: string[] = [];

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

const transformConversation = (conversation: any, userId: string): any => {
  const participantId =
    conversation.participant1Id === userId
      ? conversation.participant2Id
      : conversation.participant1Id;

  if (conversation.participant1Id === userId) {
    conversation.participant1.followers.map(
      (follower: { followerId: string }) => friends.push(follower.followerId)
    );
    conversation.participant1.followings.map(
      (following: { followingId: string }) =>
        friends.push(following.followingId)
    );
    conversation.participant1.blockedFriends.map(
      (blocker: { friendBlockedId: string }) =>
        blocked.push(blocker.friendBlockedId)
    );
  }

  if (conversation.participant2Id === userId) {
    conversation.participant2.followers.map(
      (follower: { followerId: string }) => friends.push(follower.followerId)
    );
    conversation.participant2.followings.map(
      (following: { followingId: string }) =>
        friends.push(following.followingId)
    );
    conversation.participant2.blockedFriends.map(
      (blocker: { friendBlockedId: string }) =>
        blocked.push(blocker.friendBlockedId)
    );
  }

  return {
    ...conversation,
    id: conversation.id,
    participant1Id: conversation.participant1Id,
    participant2Id: conversation.participant2Id,
    participant1: transformUser(conversation.participant1),
    participant2: transformUser(conversation.participant2),
    createdAt: formatDate(conversation.createdAt),
    updatedAt: formatDate(conversation.updatedAt),
    friendStatus: friends.includes(participantId),
    blockedStatus: blocked.includes(participantId),
    directMessages: conversation.directMessages.map(transformDirectMessage),
  };
};

async function getUser(userId: string): Promise<any> {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      followers: {
        select: {
          followerId: true,
        },
      },
      followings: {
        select: {
          followingId: true,
        },
      },
      blockedFriends: {
        select: {
          friendBlockedId: true,
        },
      },
    },
  });
  return user;
}

export default async function getConversationsByUserId(
  userId: string,
  currentUser?: any
): Promise<SafeConversation[]> {

  const user = currentUser ? currentUser : await getUser(userId);

  if (!user) {
    throw new Error("No user provided");
  }

  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [{ participant1Id: userId, status: { not: "declined"} }, { participant2Id: userId, status: { not: "declined"} }, ],
      
      participant1Id: {
        notIn: user.blockedFriends.map(
          (blocker: { friendBlockedId: string }) => blocker.friendBlockedId
        ),
      },
      participant2Id: {
        notIn: user.blockedFriends.map(
          (blocker: { friendBlockedId: string }) => blocker.friendBlockedId
        ),
      },
    },
    orderBy: { updatedAt: "desc" },
    include: {
      directMessages: {
        orderBy: { createdAt: "desc" },
        take: 5,
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
          followers: {
            select: {
              followerId: true,
            },
          },
          followings: {
            select: {
              followingId: true,
            },
          },
          blockedBy: {
            select: {
              userBlockedId: true,
            },
          },
          blockedFriends: {
            select: {
              friendBlockedId: true,
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
          },
          followers: {
            select: {
              followerId: true,
            },
          },
          followings: {
            select: {
              followingId: true,
            },
          },
          blockedBy: {
            select: {
              userBlockedId: true,
            },
          },
          blockedFriends: {
            select: {
              friendBlockedId: true,
            },
          },
        },
      },
    },
  });

  if (!conversations) return [];
  return conversations.map((conversation) =>
    transformConversation(conversation, userId)
  );
}
