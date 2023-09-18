import prisma from "@/libs/prismadb";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ error: "Missing necessary parameters." });
  }
  
  try {
    
    const username = await prisma.user.findUnique({
      where: {
        id: id
      },
      select: {
        username: true,
    
      },
    });
    
    return res.status(200).json({ username: username });
  } catch (error) {
    // Handle any errors and return an error response
    console.error("Error fetching listings:", error);
    res.status(500).json({ error: "Failed to fetch listings" });
  }
}
