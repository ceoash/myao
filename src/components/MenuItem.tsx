"use client";

import { link } from "fs";

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
        hover:bg-neutral-100
        cursor-pointer
        transition
        duration-200
        font-semibold
        flex
        gap-2
        items-center
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
    hover:bg-neutral-100
    cursor-pointer
    transition
    duration-200
    font-semibold
    flex
    gap-2
    items-center
">
    <a href={url}>{label}</a>
    </div>
  );
};

export default MenuItem;
