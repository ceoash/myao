import prisma from '@/libs/prismadb'


export default async function getConversations(id: any) {
  try {

    const conversations = await prisma?.conversation.findMany({
        where: {
            
            OR: [
                { participant1Id: id },
                { participant2Id: id }
            ],
        },
        orderBy: { createdAt: 'desc'},

    });

    const safeConversations = conversations?.map((conversation) => ({
      ...conversation,
      expireAt: conversation.createdAt.toISOString(),
      createdAt: conversation.createdAt.toISOString(),
      updatedAt: conversation.updatedAt.toISOString(),
    }));

    return safeConversations
  } catch (error: any) {
    throw new Error(error)
  }
}
