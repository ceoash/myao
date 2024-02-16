import prisma from "@/libs/prismadb";
import { NextApiRequest, NextApiResponse } from "next";
import { msToTime } from "@/utils/formatTime"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { userId, sessionId } = req.body;
  const sessionUser = sessionId || null

  if (!userId ) {
    return res.status(400).json({ error: "Missing necessary parameters." });
  }
  
  try {

    let totalListingMessageResponseTime = 0;
    let totalListingMessageResponses = 0;
    let totalDirectMessageResponseTime = 0;
    let totalDirectMessageResponses = 0;
    let startMessageTime = 0;
    let startDirectMessage = 0;

    let completionResponseTime = 0;
    let completionResponses = 0;

    const conversations = await prisma.conversation.findMany({
      where: { id: userId },
      select: { id: true },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    const highestCompletedBid = await prisma.bid.findFirst({
      where: {
        listing: {
          OR: [{status: "accepted"}, {status: "completed"}]
        },
        userId: userId
      },
      orderBy: {
        price: 'desc'
      },
      select: {
        price: true
      }
    });

    const highestBid = await prisma.bid.findFirst({
      where: {
        userId: userId
      },
      orderBy: {
        price: 'desc'
      },
      select: {
        price: true
      }
    });
    

    const listings = await prisma.listing.findMany({
      where: { 
        OR: [
          { sellerId: userId },
          { buyerId: userId }
        ] 
      },
      select: {
        id: true
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    const completed = await prisma.listing.findMany({
      where: { 
        OR: [
          { sellerId: userId, status: "accepted" },
          { buyerId: userId, status: "accepted" }
        ] 
      },
      select: {
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    
    for(let listing of completed){
      const diff = listing.updatedAt.getTime() - listing.createdAt.getTime();
      completionResponseTime += diff;
      completionResponses++;
    }
    
  
    if(listings){
      for (const listing of listings) {
        const listingMessages = await prisma.message.findMany({
          where: { listingId: listing.id },
          select: { createdAt: true, userId: true },
          orderBy: { createdAt: 'desc' },
          take: 5
        });

        for (let i = 0; i < listingMessages.length; i++) {
          const message = listingMessages[i];
          if (message.userId !== userId) {
            startMessageTime = message.createdAt.getTime();
          } else if (startMessageTime !== 0) {
            const responseTime = startMessageTime - message.createdAt.getTime();
            totalListingMessageResponseTime += responseTime;
            totalListingMessageResponses++;
            startMessageTime = 0; 
          }
        }
      }
    }

    if(conversations){
      for (const conversation of conversations) {
         const conversationMessages = await prisma.directMessage.findMany({
          where: { conversationId: conversation.id },
          select: { userId: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
          take: 5
        });
    
        for (let i = 0; i < conversationMessages.length; i++) {
          const message = conversationMessages[i];
          if (message.userId !== userId) {
            startDirectMessage = message.createdAt.getTime();
          } else if (startDirectMessage !== 0) {
            const responseTime = startDirectMessage - message.createdAt.getTime();
            totalDirectMessageResponseTime += responseTime;
            totalDirectMessageResponses++;
            startDirectMessage = 0; 
          }
        }
      }
    }

    const completionCalc = completionResponseTime / completionResponses || 0;
    const averageDirectMessageResponseTime = totalDirectMessageResponseTime / totalDirectMessageResponses || 0;
    const averageListingMessageResponseTime = totalListingMessageResponseTime / totalListingMessageResponses || 0;
    const averageTimestamp = averageDirectMessageResponseTime + averageListingMessageResponseTime / 2;
    
    const averageResponseTime = msToTime(Math.trunc(averageTimestamp)); // calculated average response time based on message replies
    const averageCompletionTime = msToTime(Math.trunc(completionCalc)); // calculated average completion time
    
    const sharedListingsCount = await prisma?.listing.count({
        where: {
          OR: [
            { sellerId: userId as string, buyerId: sessionUser as string },
            { buyerId: userId as string, sellerId: sessionUser as string }, 
          ],
        },
      });

    const sentCount = await prisma?.listing.count({
        where: {
          OR: [
            { sellerId: userId as string, type: "seller" },
            { buyerId: userId as string, type: "buyer" },
          ],
        },
      });
    
      const completedSentCount = await prisma?.listing.count({
        where: {
          OR: [
            { sellerId: userId as string, type: "seller", status: "accepted" },
            { buyerId: userId as string, type: "buyer", status: "accepted" },
          ],
        },
      });

    const cancelledSentCount = await prisma?.listing.count({
        where: {
          OR: [
            { sellerId: userId as string, type: "seller", status: "cancelled" },
            { buyerId: userId as string, type: "buyer", status: "cancelled" },
          ],
        },
      });
    
    const receivedCount = await prisma?.listing.count({
        where: {
          OR: [
            { buyerId: userId as string, type: "seller" },
            { sellerId: userId as string, type: "buyer" },
          ],
        },
      });
    const completedReceivedCount = await prisma?.listing.count({
        where: {
          OR: [
            { buyerId: userId as string, type: "seller", status: "accepted" },
            { sellerId: userId as string, type: "buyer", status: "accepted" },
          ],
        },
      });
    const cancelledReceivedCount = await prisma?.listing.count({
        where: {
          OR: [
            { buyerId: userId as string, type: "seller", status: "cancelled" },
            { sellerId: userId as string, type: "buyer", status: "cancelled" },
          ],
        },
      });
    const bidsCount = await prisma?.bid.count({
        where: {
          userId
        },
      });

    return res.status(200).json({ sentCount, completedSentCount, cancelledSentCount, receivedCount, completedReceivedCount, cancelledReceivedCount, averageResponseTime, averageCompletionTime, bidsCount, highestCompletedBid: highestCompletedBid?.price || 0, highestBid: highestBid?.price || 0, sharedListingsCount  });
      
      
  } catch (error) {
    // Handle any errors and return an error response
    console.error("Error fetching listings:", error);
    res.status(500).json({ error: "Failed to fetch listings" });
  }
}
