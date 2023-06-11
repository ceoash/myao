import prisma from '@/libs/prismadb'

interface IParams {
    username: string
}

export default async function getUserByUsername({ username }: IParams) {
    try {
        const user = await prisma?.user.findUnique({
            where: {
                username: username
            },
            
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