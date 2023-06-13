import prisma from "@/libs/prismadb";

interface SafeConversation {
  createdAt: string;
  updatedAt: string;
  participant1: SafeUser;
  participant2: SafeUser;
  directMessages: SafeDirectMessage[];
}

interface SafeUser {
  createdAt: string;
  updatedAt: string;
}

interface SafeDirectMessage {
  createdAt: string;
  updatedAt: string;
  user: SafeUser;
}

export default async function getConversationsByUserId(userId: string): Promise<SafeConversation[]> {
  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [{ participant1Id: userId }, { participant2Id: userId }],
    },
    include: {
      directMessages: {
        include: {
          user: true,
        },
      },
      participant1: true,
      participant2: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  const safeConversations: SafeConversation[] = conversations?.map((conversation) => ({
    ...conversation,
    createdAt: conversation.createdAt.toISOString(),
    updatedAt: conversation.updatedAt.toISOString(),
    participant1: {
      ...conversation.participant1,
      createdAt: conversation.participant1.createdAt.toISOString(),
      updatedAt: conversation.participant1.updatedAt.toISOString(),
    },
    participant2: {
      ...conversation.participant2,
      createdAt: conversation.participant2.createdAt.toISOString(),
      updatedAt: conversation.participant2.updatedAt.toISOString(),
    },
    directMessages: conversation.directMessages.map((message) => ({
      ...message,
      createdAt: message.createdAt.toISOString(),
      updatedAt: message.updatedAt.toISOString(),
      user: {
        ...message.user,
        createdAt: message.user.createdAt.toISOString(),
        updatedAt: message.user.updatedAt.toISOString(),
      },
    })),
  }));

  return safeConversations;
}
