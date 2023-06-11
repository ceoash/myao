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
    tiktok,
  } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const user = await prisma.user.update({
      where: { id: id },
      data: {
        name: name,
        email: email,
        username: username,
        profile: {
          upsert: {
            create: {
              address: address,
              city: city,
              postcode: postcode,
              image: image,
              website: website,
              bio: bio,
              social: {
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
            update: {
              address: address,
              city: city,
              postcode: postcode,
              image: image,
              website: website,
              bio: bio,
              social: {
                update: {
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
      include: {
        profile: {
          include: {
            social: true,
          },
        },
      },
    });

    console.log("Updated user:", user);
    res.status(200).json(user);
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
}

