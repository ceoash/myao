import prisma from "@/libs/prismadb";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth/next";
export async function getSession() {
    return await getServerSession(authOptions);
}
export default async function getCurrentUser(session: any) {

    if (!session?.user?.email) {
        console.log('No session found');
        return null;
    }

    const currentUser = await prisma.user.findUnique({
        where: {
            email: session.user.email as string,
        },
        include: {
            profile: {
                include: {
                    social: true,
                },
            }
        },
    });

    if (!currentUser) {
        console.log('No user found');
        return null;
    }

    return {
      ...currentUser,
      createdAt: currentUser.createdAt.toISOString(),
      updatedAt: currentUser.updatedAt.toISOString(),
    };
}

