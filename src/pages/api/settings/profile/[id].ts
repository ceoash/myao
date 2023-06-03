import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/libs/prismadb";
import { User } from ".prisma/client";
import { Prisma } from "@prisma/client";

interface ErrorResponse {
  error: string;
}

export default async function UpdateProfile(
  req: NextApiRequest,
  res: NextApiResponse<User | ErrorResponse>
) {
  
    const id = req.query.id as string;
    const { 
        name,
        email,
        username,
        address,
        city,
        postcode,
        image,
        website,
        bio,
        instagram,
        facebook,
        twitter,
        youtube,
        twitch,
        reddit,
        linkedin,
        tiktok
    } = req.body;

    console.log(website);

    if (!name || !email ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      const user = await prisma.user.update({
        where: { id: id },
        data: {
          name: name,
          email: email,
          profile: {
            connectOrCreate: {
              where: { userId: id },
              create: {
                address: address,
                city: city,
                postcode: postcode,
                username: username,
                image: image,
                website: website,
                bio: bio,
                social: {
                  connectOrCreate: {
                    where: { profileId: id },
                    create: {
                      instagram: instagram,
                      facebook: facebook,
                      twitter: twitter,
                      youtube: youtube,
                      twitch: twitch,
                      reddit: reddit,
                      linkedin: linkedin,
                      tiktok: tiktok,
                    },
                  },
                },
              },
            },
          },
        },
        include: {
          profile: {
            include: {
              social: true,
            },
          },
        },
      });
      console.log("Updated user:", user); // Add this line to check the updated user object
      res.status(200).json(user);
    } catch (error) {
      console.error("Error updating listing:", error);
      res.status(500).json({ error: "Something went wrong" });
    }
  
}
