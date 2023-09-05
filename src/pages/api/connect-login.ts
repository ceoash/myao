import prisma from "@/libs/prismadb";
import bcrypt from "bcrypt";


export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }
  const body = req.body;

  if (!body || !body.email || !body.token) {
    return res.status(400).json({ message: "Missing necessary parameters" });
  }

  try {
    const { email, token, connectTo, id, session } = body;


    const invitation = await prisma.invitation.findUnique({ where: { token } });
    if (!invitation) {
      return res.status(400).json({ message: "Invalid token" });
    }

    const hashedPassword = await bcrypt.hash(token, 10); // Temporary password

    const user = await prisma.user.create({
      data: {
        email,
        name: email,
        hashedPassword,
        username: email,
        inviterId: invitation.inviterId,
        activity: {
          create: {
            type: "settings",
            message: `Account created`,
            userActivity: {
              create: {
                message: `Welcome to your new account!`,
                type: "created",
                action: "/dashboard/profile/" + invitation.inviterId,
              },
            },
          },
        },
        profile: {
          create: {
            image: "/images/placeholders/avatar.png",
          },
        },
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        inviterId: true,
        username: true,
        activity: {
          take: 4,
          orderBy: {
            createdAt: "desc",
          }
        },
        activated: true,
        profile: {
          select: {
            id: true,
            image: true,
          },
        },
        inviter: {
          select: {
            email: true,
            id: true,
            username: true,
            type: true,
            createdAt: true,
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
      },
    };

    // Invalidate the token
    await prisma.invitation.delete({ where: { token } });

    return res.status(200).json({ safeUser, connectTo });
  } catch (err) {
    console.error(err);
    if (err instanceof Error) {
      return res.status(500).json({ message: err.message });
    } else {
      return res.status(500).json({ message: "An unexpected error occurred" });
    }
  }
}
