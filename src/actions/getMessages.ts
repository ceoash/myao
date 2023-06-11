import prisma from '@/libs/prismadb'

interface IParams {
    userId: string
}

export default async function getMessages({ userId }: IParams) {
  try {
    
    const messages = await prisma?.directMessage.findMany({
        where: {
             userId: userId 
        },
        orderBy: {
            createdAt: 'desc'
        },
    });

    const safeMessages = messages?.map((message) => ({
        ...message,
        expireAt: message.createdAt.toISOString(),
        createdAt: message.createdAt.toISOString(),
        updatedAt: message.updatedAt.toISOString(),
        }
    ))
    return safeMessages
  } catch (error: any) {
    throw new Error(error)
}
}