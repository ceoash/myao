import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/libs/prismadb";
import { User } from "@prisma/client";

interface ErrorResponse {
  error: string;
}

export default async function checkUsernames(
  req: NextApiRequest,
  res: NextApiResponse<any | ErrorResponse>
) {
    if (req.method !== 'POST') {
      return res.status(405).end(); // Method not allowed
    }
    
    try {
      const usernames = req.body;
      
      if (!usernames || !Array.isArray(usernames)) {
        return res.status(400).json({ error: "Missing necessary parameters." });
      }

      const availableUsernames = await Promise.all(usernames.map(async (username: string) => {
        return new Promise(async (resolve) => {
          try {
            const user = await prisma.user.findUnique({
              where: {
                username: username.toLowerCase(),
              },
            });
            
            resolve(user ? null : username);
          } catch (err) {
            console.error(`Error checking username: ${username}`, err);
            resolve(null);
          }
        });
      }));
  
      // Filter out null values and return available usernames
      return res.status(200).json(availableUsernames?.filter(Boolean));
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        return res.status(500).json({ message: err.message as string });
      } else {
        return res.status(500).json({ message: 'An unexpected error occurred' });
      }
    }
  }