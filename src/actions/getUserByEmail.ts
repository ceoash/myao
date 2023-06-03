import prisma from '@/libs/prismadb'

interface IParams {
    email: string
}

export default async function getBidByID({ email }: IParams) {
    try {
        const user = await prisma?.user.findUnique({
            where: {
                email: email
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