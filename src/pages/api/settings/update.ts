import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/libs/prismadb";
import bcrypt from "bcrypt";
import { createActivity } from "@/prisma";

interface ErrorResponse {
  error: string;
}

export default async function UpdateProfile(
  req: NextApiRequest,
  res: NextApiResponse<any | ErrorResponse>
) {
  const {
    password,
    id,
    bio,
    username,
    name,
    image,
    message,
    connectToId,
    activated,
    userType,
    website,
  } = req.body;

  let connectTo = {};
  let newConversation = {};

  const now = Date.now()

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const findUser = await prisma.user.findUnique({
      where: { id: id },
    });

    if(!findUser) return res.status(404).json({error: "listing not found"})

    const now = Date.now()

  
    const user = await prisma.user.update({
      where: { id: findUser.id },
      data: {
        hashedPassword: hashedPassword,
        name: name,
        username: username.toLowerCase(),
        activated: activated,
        type: userType,
        updatedAt: new Date(now),
        profile: {
          upsert: {
            create: {
              bio: bio,
              image: image,
              website: website,
            },
            update: {
              bio: bio,
              image: image,
              website: website,
            },
          },
        },
      },
      include: {
        profile: true,
        inviter: {
          include: {
            profile: true,
          },
        },
      },
    });

    const safeUser = {
      ...user,
      email: user.email,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      inviterId: user.inviterId,
      inviter: {
        ...user.inviter,
        hashedPassword: undefined,
        password: undefined,
        email: user?.inviter?.email,
        emailVerified: undefined,
        createdAt: user?.inviter?.createdAt.toISOString(),
        updatedAt: user?.inviter?.updatedAt.toISOString(),
      },
      profile: true,
    };

    if (user.inviterId) {
      connectTo = await prisma.friendship.create({
        data: {
          followerId: user.id,
          followingId: user.inviterId,
          accepted: false,
        },
      });

      if (message) {
        newConversation = await prisma.conversation.create({
          data: {
            participant1Id: user.id,
            participant2Id: user.inviterId,
            directMessages: {
              create: {
                userId: user.id,
                text: message,
                type: "text",
                read: false
              },
            },
          },
        });
      }
    }

    const newActivity = createActivity({
      type: "account",
      message: `Settings updated`,
      user_message: "You updated your profile",
      user_message_type: "profile update",
      action: `/dashboard/profile/${id}`,
      userId: user.id,
    });

    const transactionOperations = [newActivity];

    try {
      const transactionResult = await prisma.$transaction(
        transactionOperations
      )
      res.status(200).json({ user, connectTo, newConversation, transactionResult });
    } catch (error) {
      res.status(404).json({ error: "Something went wrong" });
    }

  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
}
