import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/libs/prismadb';
import { Listing } from '.prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse<Listing | { error: string }>) {
  if (req.method === 'GET') {
    try {
      const { id } = req.query;

      const listing = await prisma.listing.findUnique({
        where: {
          id: String(id),
        },
      });

      if (listing) {
        res.status(200).json(listing);
      } else {
        res.status(404).json({ error: 'Listing not found' });
      }
    } catch (error) {
      console.error('API error:', error);
      res.status(500).json({ error: 'Something went wrong' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}