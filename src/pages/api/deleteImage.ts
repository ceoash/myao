import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/libs/prismadb";

interface ErrorResponse {
  error: string;
}

interface SuccessResponse {
    success: boolean;
    message: string;
}

export default async function deleteListing(
  req: NextApiRequest,
  res: NextApiResponse<SuccessResponse| ErrorResponse>
) {
    if (req.method === 'DELETE') {
        const { publicId } = req.body;
    
        if (!publicId) {
          return res.status(400).json({ success: false, message: 'publicId is required' });
        }

        try {
          const result = await cloudinary.v2.uploader.destroy(publicId);
          if (result.result === 'ok') {
            res.status(200).json({ success: true, message: 'Image deleted successfully!' });
          } else {
            res.status(400).json({ success: false, message: 'Failed to delete image!' });
          }
        } catch (error) {
          console.error('Error deleting image:', error);
          res.status(500).json({ success: false, message: 'Server error!' });
        }
      } else {
        res.setHeader('Allow', ['DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
      }
}
