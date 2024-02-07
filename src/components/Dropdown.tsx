"use client";

import React, { Dispatch, SetStateAction } from "react";
import Link from "next/link";
import { FaPlus } from "react-icons/fa";

const Dropdown = ({
  button,
  seperated,
  children,
  top,
  right,
  className,
  buttonClass,
  dropdownItems,
  setValue,
  value,
}: {
  button?: React.ReactNode | string;
  seperated?: React.ReactNode;
  children?: React.ReactNode;
  top?: boolean;
  right?: boolean;
  className?: string;
  buttonClass?: string;
  setValue?: Dispatch<SetStateAction<string>>;
  value?: string;
  dropdownItems?: {
    id: string;
    label: string;
  }[];
}) => {
  const [toggle, setToggle] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const pageClickEvent = (e: any) => {
      if (
        toggle &&
        dropdownRef.current !== null &&
        !dropdownRef.current.contains(e.target)
      ) {
        setToggle(!toggle);
      }
    };


    toggle && window.addEventListener("click", pageClickEvent);
    return () => window.removeEventListener("click", pageClickEvent);
  }, [toggle]);

  const handleClick = (id: string) => {
    if (setValue) {
      setValue(id);
    }
    setToggle(false);
  }

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        type="button"
        className=""
        onClick={() => setToggle(!toggle)}
      >
        {button ? button : <FaPlus className="inline-block" />}
      </button>
      {toggle && (
        <div
          id="dropdownMenu"
          className={`z-10 absolute text-left  bg-white border shadow rounded-md min-w-min ${
            right ? "right-0" : ""
          }  ${top ? "mb-12 bottom-0" : ""} ${className ? className : ""}`}
        >
          {children ? (
            <>
              <ul
                className=" text-sm text-gray-700 py-1"
                aria-labelledby="dropdown"
              >
                {children}
              </ul>
              {seperated && <div className="py-2">{seperated}</div>}
            </>
          ) : dropdownItems && dropdownItems.length > 0 ? (
            <>
              <ul
                className=" text-sm text-gray-700 py-1"
                aria-labelledby="dropdown"
              >
                {dropdownItems.map((item, idx) => (
                  <DropdownItem
                    key={idx}
                    id={item.id}
                    name={item.label}
                    onClick={() => handleClick(item.id)}
                    selected={value === item.id}
                  />
                ))}
              </ul>
              {seperated && <div className="py-2">{seperated}</div>}
            </>
          ) : (
            "Unable to render dropdown items"
          )}
        </div>
      )}
    </div>
  );
};

export default Dropdown;

export const DropdownItem = ({
  id,
  name,
  onClick,
  seperatated,
  link,
  children,
  selected,
}: {
  id: string;
  name?: string;
  onClick?: Dispatch<SetStateAction<string>>;
  link?: string;
  seperatated?: boolean;
  children?: React.ReactNode;
  selected?: boolean;
}) => {
  const className = `text-left block w-full px-3 py-1 text-gray-500 hover:bg-gray-100 whitespace-nowrap  ${
    seperatated ? "" : ""
  } ${selected ? "bg-gray-100" : ""}`;
  return (
    <li>
      {link ? (
        <Link href={link || "#"} className={className}>
          {children ? children : name ? name : "(No name)"}
        </Link>
      ) : onClick ? (
        <button
          onClick={() => (onClick ? onClick(id) : {})}
          className={className}
        >
          {children ? children : name ? name : "(No name)"}
        </button>
      ) : (
        <button type="button" className={className}>
          {children ? children : name ? name : "(No name)"}
        </button>
      )}
    </li>
  );
};
