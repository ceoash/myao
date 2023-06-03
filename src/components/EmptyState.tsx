'use client'

import { useRouter } from "next/navigation";
import React from "react";
import Heading from "./modals/Heading";
import OfferModal from "./modals/OfferModal";
import useOfferModal from "@/hooks/useOfferModal";
import { BiPlus } from "react-icons/bi";


interface EmptyStateProps {
  title?: string;
  description?: string;
  showReset?: boolean;
}
const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No data to display",
  description = "Create an offer to get started",
  showReset,
}) => {
  const router = useRouter();
  const offerModal = useOfferModal();

  return (
    <div
      className="
        h-full
        flex
        flex-col
        flex-1
        justify-center
        items-center
        gap-4

    "
    >
      <Heading title={title} description={description} />
      <div>
        {showReset && (
            <button onClick={offerModal.onOpen} className="focus:ring-2 focus:ring-offset-2 focus:ring-orange-600 mt-4 sm:mt-0 inline-flex items-center justify-start px-4 py-3 bg-orange-500 hover:bg-orange-600 focus:outline-none rounded">
            <p className="text-sm font-medium leading-none text-white">
              Create Offer
            </p>
            <BiPlus className="text-xl text-white ml-2 border-2 rounded-full" />
          </button>
          
        )}
      </div>
    </div>
  );
};

export default EmptyState;
