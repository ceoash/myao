import prisma from "@/libs/prismadb";
import bcrypt from "bcrypt";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).end(); // Method not allowed
  }

  try {
    const body = req.body;
    const { email, name, password, username } = body;

    const hashedPassword = await bcrypt.hash(password, 10);
    const formattedUsername = username.toLowerCase().replace(/\s/g, "");
    const now = Date.now();
    const user = await prisma.user.create({
      data: {
        email,
        name,
        hashedPassword,
        username: formattedUsername,
        activated: true,
        activity: {
          create: {
            type: "settings",
            message: `Account created`,
            userActivity: {
              create: {
                message: `Welcome to your new account!`,
                type: "created",
                action: "/dashboard/profile/" + formattedUsername,
              },
            },
          },
        },
      },
    });

     await prisma.notification.create({
      data: {
        userId: user.id,
        type: "profile",
        message: `update your profile`,
        action: "/dashboard/settings/",
        read: false,
      },
    });
     await prisma.notification.create({
      data: {
        userId: user.id,
        type: "payment",
        message: `Add payment method`,
        action: "/dashboard/settings/",
        read: false,
      },
    });

    return res.status(200).json(user);
  } catch (err) {
    console.error(err);
    if (err instanceof Error) {
      return res.status(500).json({ message: err.message });
    } else {
      return res.status(500).json({ message: "An unexpected error occurred" });
    }
  }
}
