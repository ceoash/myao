import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/libs/prismadb";
import { Listing } from ".prisma/client";
import axios from "axios";

interface ErrorResponse {
  error: string;
}

export default async function listingsApi(
  req: NextApiRequest,
  res: NextApiResponse<Listing | ErrorResponse>
) {
  if (req.method === "POST") {

    const { title, description, price, image, senderId, category, recipientId, status  } = req.body;

    try {
      if (recipientId){
      const listing = await prisma.listing.create({
        data: {
          title,
          description,
          category,
          price,
          image,
          senderId,
          status: "negotiating",
          recipientId,
        },
        include: {
          sender: true,
          recipient: true,
        },
      });

      await prisma.notification.create({
        data: 
          {
            message: "You have been invited to a new listing",
            read: false,
            url: `/dashboard/offers/${listing.id}`,
            userId: recipientId,
            senderId: senderId,
          },
      })
      await axios.post("/api/email/sendUserEmailInvitation", {
        email: listing?.recipient?.email,
        sender: listing?.sender?.name,
        url: listing?.id,
      })
      .then((response) => {
        if (response.status === 200) {
          console.log("Invitation sent successfully!");
        }
      })
      .catch((err) => {
        console.log("Something went wrong!");
      });
      res.status(200).json(listing);
    } else {
      const listing = await prisma.listing.create({
        data: {
          title,
          description,
          category,
          price,
          image,
          senderId,
          status: "pending",
        },
        include: {
          sender: true,
        },
      });

      res.status(200).json(listing);
    }
      
    } catch (error) {
      console.error("Error creating listing:", error);
      res.status(500).json({ error: "Something went wrong" });
    }
  } else if (req.method === "PUT") {
    const id = req.query.id as string;
    const { title, description, price, image, senderId, category } = req.body;

    try {
      const listing = await prisma.listing.update({
        where: { id },
        data: { title, description, category, price, image, senderId },
      });
      res.status(200).json(listing);
    } catch (error) {
      console.error("Error updating listing:", error);
      res.status(500).json({ error: "Something went wrong" });
    }
  } else {
    res.status(405).json({ error: "Listing edit not allowed" });
  }
}
