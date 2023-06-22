import prisma from '@/libs/prismadb'

interface IParams {
    userId1: string;
    userId2: string;
}

export default async function checkBlocked({ userId1, userId2 }: IParams) {
  const user1IsBlocked = await prisma.blocked.findFirst({
    where: {
      userBlockedId: userId1, 
      friendBlockedId: userId2
    },
  });

  const user1HasBlocked = await prisma.blocked.findFirst({
    where: {
      userBlockedId: userId2,
      friendBlockedId: userId1
    },
  });

  const isBlockedBy = user1HasBlocked ? userId1 : userId2;

  return {
    isBlocked: Boolean(user1IsBlocked),
    isBlockedBy: String(isBlockedBy),
    hasBlocked: Boolean(user1HasBlocked)
  };
};


