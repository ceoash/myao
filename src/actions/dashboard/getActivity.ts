import prisma from "@/libs/prismadb";
import { Session } from "next-auth";

export default async function getUserActivity(session: Session) {
  
    if(!session?.user?.id) { 

        console.log("No session found");
        return null;

    } else {

    const userActivity = await prisma.activity.findMany({
    where: {
        OR: [
            { type: { not: "offer" }, userId: session?.user?.id }, 
            { type: { not: "listing" }, userId: session?.user?.id }
        ],
    },
    include: { userActivity: true, listingActivity: true },
    orderBy: { createdAt: "desc" },
    take: 10,
        
    });

    if (!userActivity) return null;

    const transformActivity = userActivity.map((activity) => {
        let transformedUserActivity;
        if (Array.isArray(activity.userActivity)) {
            transformedUserActivity = activity.userActivity.map(subActivity => ({
                ...subActivity,
                createdAt: subActivity.createdAt.toISOString(),
                updatedAt: subActivity.updatedAt.toISOString()
            }));
        }
    
        let transformedListingActivity;
        if (Array.isArray(activity.listingActivity)) {
            transformedListingActivity = activity.listingActivity.map(subActivity => ({
                ...subActivity,
                createdAt: subActivity.createdAt.toISOString(),
                updatedAt: subActivity.updatedAt.toISOString()
            }));
        }
    
        return {
            ...activity,
            createdAt: activity.createdAt.toISOString(),
            userActivity: transformedUserActivity,
            listingActivity: transformedListingActivity
        };
    });
    
    
    return transformActivity;

  }

}
