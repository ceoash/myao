import prisma from "@/libs/prismadb";

export default async function getUserActivity(session: any) {
    if (!session?.user?.email) {
        console.log('No session found');
        return null;
    }

    const userActivity = await prisma.user.findUnique({
        where: {
            email: session.user.email as string,
        },
       select: {
        activities: true,
         },

    });

    if (!userActivity) {
        return null;
    }

    return userActivity;
}
