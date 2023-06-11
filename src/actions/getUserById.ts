import prisma from '@/libs/prismadb'

interface IParams {
    id: string
}

export default async function getUserById({ id }: IParams) {

    try {
        const user = await prisma?.user.findUnique({
            where: {
                id: id // filter by the userId
            },
            include: {
                profile: true
            }
        });

        if (!user) {
            throw new Error('User not found')
        }

        return {
            ...user,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
        }
          
    } catch (error: any) {
        throw new Error(error)
    }

    
}
