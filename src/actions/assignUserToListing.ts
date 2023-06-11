import prisma from '@/libs/prismadb'

interface IParams {
    listingId: string; 
    userId: string; 
}

export default async function assignUserToListing({ listingId, userId }: IParams) {
    try {
        const listing = await prisma.listing.update({
            where: {
                id: listingId,
            },
            data: {
                sellerId: userId,
            },
        });

        if (!listing) {
            throw new Error('Listing not found')
        }

        return {
            ...listing,
            createdAt: listing.createdAt.toISOString(),
            updatedAt: listing.updatedAt.toISOString(),
        }
    } catch (error: any) {
        throw new Error(error)
    }
}
