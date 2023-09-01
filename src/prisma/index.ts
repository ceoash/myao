import prisma from "@/libs/prismadb";
import { Prisma, PrismaClient } from "@prisma/client";

interface IActvity{
    type: string, 
    userId: string, 
    message: string, 
    user_message: string, 
    user_message_type: string, 
    action: string,
    listingId?: string,
    receiverId?: string,
    listing_message?: string,
    listing_message_type?: string
}

export const createListing = async (data: any) => {

    const listing = await prisma.listing.create({
      data,
      include: {
        user: true,
        seller: true,
        buyer: true,
        bids: {
          take: 1,
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });
    
    return listing;
  }

export const createMessage = async (
id: string,
sellerId: string,
buyerId: string,
userId: string,
type: string | null,
text?: string,
conversationId?: string,
image?: string | null
) => {

    let parsedImg = null;
    if (image) parsedImg = JSON.parse(image) || null;

    const message = await prisma.directMessage.create({
        data: {
            image: parsedImg[0],
            text: text,
            listingId: id,
            conversationId: conversationId || "",
            userId: userId,
            type: type || null,
            read: false,
            receiverId: sellerId === userId ? buyerId : sellerId
        },
        include: {
        user: true,
        listing: {
            select: {
            user: {
                select: {
                id: true,
                username: true,
                profile: true,
                },
            },
            buyer: {
                select: {
                id: true,
                username: true,
                profile: true,
                },
            },
            seller: {
                select: {
                id: true,
                username: true,
                profile: true,
                },
            },
            },
        },
        },
    });
    return message;
}


export function createActivity({
    type, 
    userId, 
    message, 
    user_message, 
    user_message_type, 
    action,
    listingId,
    receiverId,
    listing_message,
    listing_message_type,
}: IActvity) {
    if(type === 'Offer') {
    return prisma.activity.create({
            data: {
                userId,
                message,
                listingId,
                type,
                userActivity: {
                    create: {
                        message: user_message || '',
                        type: user_message_type || '',
                        action,
                    },
                },
                listingActivity: {
                    create: {
                        receiverId: receiverId || '',
                        message: listing_message || '',
                        type: listing_message_type || '',
                    }
                }
            }

        });

    };

    return prisma.activity.create({
        data: {
            userId,
            message,
            listingId,
            type,
            userActivity: {
                create: {
                    message: user_message || message,
                    type: user_message_type || type,
                    action,
                },
            },
        }


    });
}


    