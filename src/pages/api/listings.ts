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

    const { title, description, price, image, sellerId, category, buyerId  } = req.body;

    

    try {
      if (buyerId){
      const listing = await prisma.listing.create({
        data: {
          title,
          description,
          category,
          price,
          image,
          sellerId,
          status: "awaiting approval",
          buyerId,
        },
        include: {
          seller: true,
          buyer: true,
        },
      });

      /* await prisma.notification.create({
        data: 
          {
            message: "You have been invited to a new listing",
            read: false,
            url: `/dashboard/offers/${listing.id}`,
            userId: buyerId,
            sellerId: sellerId,
          },
      }) */
      await axios.post("/api/email/sendUserEmailInvitation", {
        email: listing?.buyer?.email,
        seller: listing?.seller?.name,
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
          sellerId,
          status: "pending",
        },
        include: {
          seller: true,
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
    const { title, description, price, image, buyerId, category } = req.body;

    try {
      const listing = await prisma.listing.update({
        where: { id },
        data: { title, description, category, price, image, buyerId },
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
