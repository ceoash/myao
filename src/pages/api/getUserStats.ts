import prisma from "@/libs/prismadb";

export default async function getUser(
    req: any,
    res: any
) {
    if (req.method === "GET") {
    let { username } = req.query;
    console.log(username);
    const user = await prisma.user.findUnique({
      where: { username: username.toLowerCase() },
      include: {
        profile: {
          select: {
            image: true,
          }
        },
      }
    });
    console.log(user);
    res.send(user);
  } else {
    // Not signed in
    res.status(401).send({});
  }
}
