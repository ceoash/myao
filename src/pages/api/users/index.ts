import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/libs/prismadb";
import { User } from "@prisma/client";
import bcrypt from "bcrypt";

interface ErrorResponse {
  error: string;
}

interface UserResponse {
  user: User;
}

interface UsersResponse {
  users: User[];
}

export default async function users(
  req: NextApiRequest,
  res: NextApiResponse<UserResponse | ErrorResponse | UsersResponse>
) {
  const { method, body } = req;

  const {password, ...rest} = body

  rest.email ? rest.email = rest.email.toLowerCase() : null
  rest.username ? rest.username = rest.username.toLowerCase() : null
  rest.role ? rest.role = rest.role.toLowerCase() : null
  

  switch (method) {
    case "GET":
      try {
        const users = await prisma.user.findMany({
          include: {
            listings: {
              include: {
                bids: {
                  include: {
                    user: true,
                  },
                },
              },
            },
            bids: {
              include: {
                listing: true,
              },
            },
          },
        });
        res.status(200).json({ users });
      } catch (error) {
        if (error instanceof Error)
          res.status(400).json({ error: error.message });
      }
      break;
    case "POST":
      try {
        if (!password)
          return res.status(400).json({ error: "Missing required fields" });
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
          data: {
            ...rest,
            hashedPassword
          },
        });
        res.status(200).json({ user });
      } catch (error) {
          console.log(error)
        if (error instanceof Error)
          res.status(400).json({ error: error.message as string });
      }
      break;
    case "PUT":
      try {

        const {id, password, ...rest} = body

        if (!id) return res.status(400).json({ error: "Missing required fields" });

        const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

        let data = {
            ...rest,
            activated: true
        }

        if (hashedPassword) Object.assign(data, {hashedPassword})

        const user = await prisma.user.update({
          where: { id: body.id },
          data: data,
        });

        res.status(200).json({ user });

      } catch (error) {
        if (error instanceof Error)
          res.status(400).json({ error: error.message as string });
      }
      break;
    case "DELETE":
        try {
            const user = await prisma.user.delete({
            where: { id: body.id },
            });
            res.status(200).json({ user });
        } catch (error) {
            if (error instanceof Error)
            res.status(400).json({ error: error.message as string });
        }
        break;
    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
