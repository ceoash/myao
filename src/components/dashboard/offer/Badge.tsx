import React from "react";

interface OfferTypeBadgeProps {
  noBg?: boolean;
  children: React.ReactNode;
  danger?: boolean;
  success?: boolean;
  primary?: boolean;
  secondary?: boolean;
  info?: boolean;
}

const Badge = ({
  noBg,
  children,
  danger,
  success,
  primary,
  secondary,
  info,
}: OfferTypeBadgeProps) => {
  return (
    <div
      className={`
      ml-4
      text-xs
      inline-flex
      items-center
      font-bold
      leading-sm
      uppercase
      px-3
      py-1
      ${noBg}
      ${success && ' bg-green-200 text-green-700} rounded-full'}
      ${danger && ' bg-red-200 text-red-500} rounded-full'}
      ${info && ' bg-orange-200 text-orange-400} rounded-full'}
      ${primary && ' bg-gray-200 text-gray-700} rounded-full'}
      ${secondary && ' bg-orange-50 text-orange-400} rounded-full'}
      `}
    >
      {children}
    </div>
  );
};

export default Badge;
