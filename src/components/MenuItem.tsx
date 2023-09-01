"use client";

import { link } from "fs";
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
    "
    >
      {icon && <span>{icon}</span>}
      {label}
    </div>
  ) : (
    <div className="
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
    <Link href={url || '#'}>{label}</Link>
    </div>
  );
};

export default MenuItem;
