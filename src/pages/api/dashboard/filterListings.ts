import prisma from "@/libs/prismadb";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  if(req.method !== "GET") return res.status(400).json({error: "Only GET requests allowed"})
  const listingId = (req.query.listingId as string) || "";
  const userId = (req.query.userId as string) || "";
  const status = (req.query.status as string) || "";
  const orderBy = (req.query.orderBy as string) || "";
  const from = (req.query.from as string) || "";
  const to = (req.query.to as string) || "";
  const userType = (req.query.userType as string) || "";

  let where = {};

  if (listingId) {
    where = {
      ...where,
      listingId,
    };
  } else {
    if (userId) {
      where = {
        ...where,
        userId,
      };
    }

    if (userType === "seller") {
      where = {
        ...where,
        sellerId: userId,
      };
    }

    if (userType === "buyer") {
      where = {
        ...where,
        buyerId: userId,
      };
    }

    if (status) {
      where = {
        ...where,
        status,
      };
    }
    if (from) {
      where = {
        ...where,
        createdAt: {
          gte: new Date(from),
        },
      };
    }

    if (to) {
      where = {
        ...where,
        createdAt: {
          lte: new Date(to),
        },
      };
    }

    if (orderBy === "recent") {
      where = {
        ...where,
        orderBy: {
          createdAt: "desc",
        },
      };
    }

    if (orderBy === "oldest") {
      where = {
        ...where,
        orderBy: {
          createdAt: "asc",
        },
      };
    }

    if (orderBy === "highest") {
      where = {
        ...where,
        orderBy: {
          price: "desc",
        },
      };
    }

    if (orderBy === "lowest") {
      where = {
        ...where,
        orderBy: {
          price: "asc",
        },
      };
    }
  }

  if (listingId) {
    try {
      const listing = await prisma.listing.findUnique({
        where: {
          id: listingId,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              profile: {
                select: {
                  image: true,
                },
              },
            },
          },
          bids: {
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
          },
          buyer: {
            select: {
              id: true,
              username: true,
              profile: {
                select: {
                  image: true,
                },
              },
            },
          },
          seller: {
            select: {
              id: true,
              username: true,
              profile: {
                select: {
                  image: true,
                },
              },
            },
          },
          messages: {
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  profile: {
                    select: {
                      image: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      return res.status(200).json({ listings: [listing] });
    } catch (error) {
      console.error("Error fetching listing:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  try {
    const listings = await prisma.listing.findMany({
      where: {
        ...where,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profile: {
              select: {
                image: true,
              },
            },
          },
        },
        bids: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
        buyer: {
          select: {
            id: true,
            username: true,
            profile: {
              select: {
                image: true,
              },
            },
          },
        },
        seller: {
          select: {
            id: true,
            username: true,
            profile: {
              select: {
                image: true,
              },
            },
          },
        },
        messages: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
          include: {
            user: {
              select: {
                id: true,
                username: true,
                profile: {
                  select: {
                    image: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return res.status(200).json({ listings });
  } catch (error) {
    console.error("Error fetching listings:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
