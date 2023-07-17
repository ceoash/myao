import { getSession } from "next-auth/react";
import prisma from "@/libs/prismadb";
import { User } from "@prisma/client";
import { ErrorResponse } from "@/components/UsernameSelect";
import { NextApiRequest, NextApiResponse } from "next";

export default async function getUser(
    req: any,
    res: any
) {
    if (req.method === "GET") {
    let { username } = req.query;
    const user = await prisma.user.findUnique({
      where: { username: username },
      include: {
        profile: {
          select: {
            image: true,
          }
        },
      }
    });
    res.send(user);
  } else {
    // Not signed in
    res.status(401).send({});
  }
}
