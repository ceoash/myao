"use client";

import Link from "next/link";

interface MenuItemProps {
  label: string;
  icon?: React.ReactNode;
  link?: boolean;
  url?: string;
  onClick?: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, label, onClick, link, url }) => {
  return !link ? (
    <div
      onClick={onClick}
      className="
        px-4
        pt-2
        pb-2
        hover:bg-gray-100
        cursor-pointer
        transition
        duration-200
        font-semibold
        flex
        gap-2
        items-center
        hover:text-orange-default
        flex-nowrap
        w-full
    "
    >
      {icon && <span>{icon}</span>}
      {label}
    </div>
  ) : (
    <Link href={url || "#"} className="
    px-4
    pt-2
    pb-2
    hover:bg-gray-100
    cursor-pointer
    transition
    duration-200
    font-semibold
    flex
    gap-2
    items-center
    hover:text-orange-default
">
    <span>{label}</span>
    </Link>
  );
};

export default MenuItem;
