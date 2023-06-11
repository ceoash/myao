import prisma from '@/libs/prismadb'

interface IParams {
    userId1: string;
    userId2: string;
}

export default async function checkFriendship({ userId1, userId2 }: IParams) {

  const result = await prisma.friendship.findFirst({
    where: {
      OR: [
        { userAddsId: userId1, friendAddsId: userId2 },
        { userAddsId: userId2, friendAddsId: userId1 },
      ],
    },
  });
  
  return result !== null;
};