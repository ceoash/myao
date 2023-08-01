import prisma from "@/libs/prismadb";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth/next";

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
            },
            inviter: {
                include: {
                    profile: true,
                },
            },
            followers: true,
            followings: true,
            blockedBy: {
                select: {
                    id: true,
                },
            },
            blockedFriends: {
                select: {
                    id: true,
                },
            },
        },
    });

    if (!currentUser) {
        return null;
    }

    return {
      ...currentUser,
      createdAt: currentUser.createdAt.toISOString(),
      updatedAt: currentUser.updatedAt.toISOString(),
      followings: currentUser.followings.map(friendship => ({
        ...friendship,
        createdAt: friendship.createdAt.toISOString(),
        updatedAt: friendship.updatedAt.toISOString(),
      })),
      followers: currentUser.followers.map(friendship => ({
        ...friendship,
        createdAt: friendship.createdAt.toISOString(),
        updatedAt: friendship.updatedAt.toISOString(),
      })),
      inviter: currentUser.inviter ? {
            ...currentUser.inviter,
            createdAt: currentUser.inviter.createdAt.toISOString(),
            updatedAt: currentUser.inviter.updatedAt.toISOString(),
            }
        : null,
    };
}
