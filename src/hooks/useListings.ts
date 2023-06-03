import prisma from "@/libs/prismadb";
import { Listing } from "@prisma/client";
import { useEffect, useState } from "react";

const fetchListings = async (): Promise<Listing[]> => {
  const listings = await prisma.listing.findMany();
  return listings;
};

const useListings = (): Listing[] => {
  const [listings, setListings] = useState<Listing[]>([]);

  useEffect(() => {
    const getListings = async () => {
      const fetchedListings = await fetchListings();
      setListings(fetchedListings);
    };

    getListings();
  }, []);

  return listings;
};

export default useListings;
