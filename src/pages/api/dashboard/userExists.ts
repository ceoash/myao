import prisma from "@/libs/prismadb";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Missing necessary parameters." });
  }
  
  try {
    
    const checkEmail = await prisma.user.findUnique({
      where: {
        email: email
      },
      select: {
        username: true
      }
    });

    if (checkEmail) {
        // If the email exists in the database
        return res.status(409).json({ error: "An account belonging to this email address already exists." });
      } else {
        // If the email does not exist in the database
        return res.status(200).json({ message: "No user found." });
    }

  } catch (error) {
    // Handle any errors and return an error response
    console.error("Error fetching user from email:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
}
