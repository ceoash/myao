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
  title = "Welcome to your dashboard",
  description = "Create your first offer to get started",
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
        justify-center
        items-center
        bg-white
        border-2
        shadow
        rounded-md
        mb-10

    "
    >
      <Heading title={title} description={description} nounderline center={true} />
      <div>
        {showReset && (
            <button onClick={offerModal.onOpen} className="focus:ring-2 focus:ring-offset-2 focus:ring-orange-600 mt-4 sm:mt-0 inline-flex items-center justify-start px-4 py-3 bg-orange-default hover:bg-orange-600 focus:outline-none rounded">
            <div className="text-sm font-medium leading-none text-white">
              Get Started
            </div>
          </button>
          
        )}
      </div>
    </div>
  );
};

export default EmptyState;
