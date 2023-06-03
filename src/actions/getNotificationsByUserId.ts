import prisma from '@/libs/prismadb'

interface IParams {
    id: string
}

export default async function getNotificationsByUserId({ id }: IParams) {
    console.log(id);
    try {
        const notification = await prisma?.notification.findMany({
            where: {
                userId: id // filter by the userId
            },
        });

        if (!notification) {
            throw new Error('User not found')
        }

        return {
            ...notification,

        }
          
    } catch (error: any) {
        throw new Error(error)
    }

    
}
