import React from "react";

interface OfferTypeBadgeProps {
  type: string;
  noBg?: boolean;
}

const OfferTypeBadge = ({ type, noBg }: OfferTypeBadgeProps) => {
  return type === "buyerOffer" ? (
    <div className={`ml-4 text-xs inline-flex items-center font-bold leading-sm uppercase px-3 py-${noBg }1 bg-green-200 text-green-700 rounded-full`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="feather feather-arrow-right mr-2"
      >
        <line x1="5" y1="12" x2="19" y2="12"></line>
        <polyline points="12 5 19 12 12 19"></polyline>
      </svg>
      Buy
    </div>
  ) : (
<div className={`ml-4 text-xs inline-flex items-center font-bold leading-sm uppercase px-3 py-1 ${!noBg && 'bg-orange-200' } text-orange-700 rounded-full`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="feather feather-arrow-right mr-2 rotate-180"
      >
        <line x1="5" y1="12" x2="19" y2="12"></line>
        <polyline points="12 5 19 12 12 19"></polyline>
      </svg>
      Sale
    </div>
  );
};

export default OfferTypeBadge;
