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
                include: {
                    userBlocked: true,
                },
            },
            blockedFriends: {
                include: {
                    friendBlocked: true,
                },
            },
        },
    });

    if (!currentUser) {
        return null;
    }

    const usersBlockedByCurrentUser = currentUser.blockedFriends.map(record => record.friendBlocked);
    const usersWhoBlockedCurrentUser = currentUser.blockedBy.map(record => record.userBlocked);

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
      blockedBy: usersWhoBlockedCurrentUser.map(user => ({
        ...user,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      })),
      blockedFriends: usersBlockedByCurrentUser.map(user => ({
        ...user,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      })),
      inviter: currentUser.inviter ? {
            ...currentUser.inviter,
            createdAt: currentUser.inviter.createdAt.toISOString(),
            updatedAt: currentUser.inviter.updatedAt.toISOString(),
            }
        : null,
    };
}
