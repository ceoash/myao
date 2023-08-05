import prisma from "@/libs/prismadb";
import bcrypt from "bcrypt";

interface IUser {
  id: string;
}


export default async function handler(req: any, res: any) {
  
  if (req.method !== "POST") {
    return res.status(405).end(); 
  }
  const body = req.body;

  if (!body || !body.email || !body.token) {
    return res.status(400).json({ message: "Missing necessary parameters" });
  }

  try {
    const { email, token, connectTo } = body;

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
        activities: [{ type: "user", message: "Account created", action: "/dashboard/settings", value: "Update your profile"} ],
        profile: {
            create: {
                image: "/images/placeholders/avatar.png"
            }
        }
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
    }

    // Invalidate the token
    await prisma.invitation.delete({ where: { token } });

    return res.status(200).json({ safeUser, connectTo});
  } catch (err) {
    console.error(err);
    if (err instanceof Error) {
      return res.status(500).json({ message: err.message });
    } else {
      return res.status(500).json({ message: "An unexpected error occurred" });
    }
  }
}
