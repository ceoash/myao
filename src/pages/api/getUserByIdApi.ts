import { getSession } from "next-auth/react";
import prisma from "@/libs/prismadb";

export default async function handler(req: any, res: any) {
  const session = await getSession({ req });

  if (session) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        profile: true,
      }
    });
    res.send(user);
  } else {
    // Not signed in
    res.status(401).send({});
  }
}
