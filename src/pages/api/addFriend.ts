import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/libs/prismadb";

export default async function addFriend(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        const { userAddsId, friendAddsId } = req.body;

        // Ensure the necessary fields are included
        if (!userAddsId || !friendAddsId) {
            return res.status(400).json({ error: "Missing necessary parameters." });
        }

        try {
         
            const newFriendship = await prisma.friendship.create({
                data: {
                    userAddsId,
                    friendAddsId,
                },
            });

            res.status(200).json(newFriendship);
        } catch (error) {
            console.error("Error adding friend:", error);
            res.status(500).json({ error: "Something went wrong." });
        }
    } else {
        res.status(405).json({ error: "Method not allowed." });
    }
}
