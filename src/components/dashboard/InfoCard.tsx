import React from "react";
import Button from "./Button";
import Skeleton from "react-loading-skeleton";
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
  isLoading?: boolean;
  center?: boolean;
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
  isLoading,
  center
}: ICardProps) => {
  return (
    <div
      className={`p-4 ${className} rounded-xl text-gray-800 ${
        span ? span : "col-span-2"
      } `}
    >
      <div className="flex gap-2 items-center">
        {isLoading ? <Skeleton circle height={70}/> : icon && (
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
                {isLoading ? <Skeleton /> : number}
              </div>
            )}

            {!icon && (
              <div className={`font-bold text-xl leading-none first-letter:uppercase w-full ${center && 'justify-center'}`}>{ isLoading ?  <Skeleton /> : title}</div>
            )}
            {badge && (
              <div
                className={`text-xs bg-${color}-400 hidden lg:block rounded-full p-1 px-2 border-${color}-500 text-white -mb-2`}
              >
                {isLoading ? <Skeleton /> : badge}
              </div>
            )}
          </div>
          <div className={`mt-2 ${isLoading ?  <Skeleton /> : center && 'text-center'}`}>{text ? text : !button && title}</div>
          {button && (
            <div className="mt-5 mr-auto">
            {isLoading ? <Skeleton /> : <Button label={button.label} onClick={button.onClick} options={{}} /> }
              
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InfoCard;
