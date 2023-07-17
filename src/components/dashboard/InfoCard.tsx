import React from "react";
import Button from "./Button";
interface ICardProps {
  title?: string;
  text?: string;
  icon?: string;
  number?: number;
  badge?: string;
  button?: {
    label: string;
    onClick: () => void;
  };
  color: string;
  span?: string;
  className?: string;
}

const InfoCard = ({
  title,
  icon,
  number,
  button,
  badge,
  color,
  text,
  span,
  className,
}: ICardProps) => {
  console.log("color", color);
  return (
    <div
      className={`p-4 ${className} rounded-xl text-gray-800 ${
        span ? span : "col-span-2"
      } `}
    >
      <div className="flex gap-2 items-center">
        {icon && (
          <div>
            <img
              src={icon}
              className={`w-[70px] border border-${color}-200 rounded-full bg-white p-1.5`}
            />
          </div>
        )}
        <div className="flex-1">
          <div className="flex justify-between">
            {icon && (
              <div className="font-bold text-2xl leading-none -mb-2">
                {number}
              </div>
            )}

            {!icon && (
              <div className="font-bold text-xl leading-none first-letter:uppercase">{title}</div>
            )}
            {badge && (
              <div
                className={`text-xs bg-${color}-400 hidden lg:block rounded-full p-1 px-2 border-${color}-500 text-white -mb-2`}
              >
                {badge}
              </div>
            )}
          </div>
          <div className="mt-2">{text ? text : !button && title}</div>
          {button && (
            <div className="mt-5">
            <Button label={button.label} onClick={button.onClick} options={{
                
            }} />
              
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InfoCard;
