import React from "react";

interface HeadingProps {
  title: string;
  description: string;
  nounderline?: boolean;
  center?: boolean;
}

const Heading = ({ title, description, nounderline, center }: HeadingProps) => {
  return (
    <div
      className={`${!nounderline && `border-b border-gray-200 `} ${
        center && "text-center"
      } pb-4 mb-4 hidden md:block`}
    >
      {center ? (
        <>
          {" "}
          <h2 className="-mb-[1.5px] capitalize">{title}</h2>
          <p className="text-sm font-bold">{description}</p>
        </>
      ) : (
        <>
          <h4 className="capitalize">{title}</h4>
          <p className="text-sm">{description}</p>
        </>
      )}
    </div>
  );
};

export default Heading;
