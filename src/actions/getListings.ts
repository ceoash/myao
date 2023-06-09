import prisma from '@/libs/prismadb'

export default async function getListings() {
  try {
    const listings = await prisma?.listing.findMany({
        orderBy: {
            createdAt: 'desc'
        },
    });

    const safeListings = listings?.map((listing) => ({
        ...listing,
        expireAt: listing.createdAt.toISOString(),
        createdAt: listing.createdAt.toISOString(),
        updatedAt: listing.updatedAt.toISOString(),
        }
    ))
    return safeListings
  } catch (error: any) {
    throw new Error(error)
}
}