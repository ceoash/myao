import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/libs/prismadb";
import bcrypt from "bcrypt";

const registerUser = async (name: string, email: string, password: string, username: string) => {
  // Check if a user with the provided email exists
  const existingUser = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });

  if (existingUser) {
    throw new Error("Email already exists.");
  } else {
    // Create the user account
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        name: name,
        email: email,
        hashedPassword: hashedPassword,
        username: username,
        activated: true,
        status: "active",
        role: "user",
      },
    });

    await prisma.notification.create({
      data: {
        userId: newUser.id,
        type: "profile",
        message: `update your profile`,
        action: "/dashboard/settings/",
        read: false,
      },
    });
     await prisma.notification.create({
      data: {
        userId: newUser.id,
        type: "payment",
        message: `Add payment method`,
        action: "/dashboard/settings/",
        read: false,
      },
    });

    return newUser;
  }
}


export default async function handler(  req: NextApiRequest,
  res: NextApiResponse) {

  const { email, name, password, username } = req.body;
  if (!email || !name || !password || !username) {
    return res.status(400).json({ message: "Missing necessary parameters" });
  }

  try {
    // Attempt to register the user
    const newUser = await registerUser(name, email, password, username );

    if (newUser) {
      return res.status(201).json({ message: "Registration successful!" });
    } else {
      return res.status(400).json({ message: "Registration failed." });
    }
  } catch (error) {
    if ((error as any)?.message as string === "Email already exists.") {
      return res.status(409).json({ message: "This email address already registered with us. Reset your password" });
    }
    console.error("Registration error:", error);
    return res.status(500).json({ message: "An error occurred. Please try again later." });
  }
}


