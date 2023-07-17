import prisma from "@/libs/prismadb";
import { Prisma, User } from "@prisma/client";

export function createActivityForUser(userId: string, newActivity: any, activities: any): Prisma.Prisma__UserClient<any> {

    const allActivities = activities
    allActivities.push(newActivity)
    
    return prisma.user.update({
        where: { id: userId },
        data: {
            activities: allActivities
        },
        select: {
            activities: true
        }
    });

}