import prisma from '@/libs/prismadb'

interface IParams {
    userId1: string;
    userId2: string;
}

export default async function checkFriendship({ userId1, userId2 }: IParams) {

  const result = await prisma.friendship.findFirst({
    where: {
      OR: [
        { followerId: userId1, followingId: userId2 },
        { followerId: userId2, followingId: userId1 },
      ],
    },
  });
  
  return result !== null;
};