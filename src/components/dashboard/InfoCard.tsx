import Button from "./Button";
import Skeleton from "react-loading-skeleton";
import { useRouter } from "next/navigation";

interface ICardProps {
  title?: string;
  text?: string;
  icon?: string;
  number?: number;
  badge?: string;
  link?: string;
  color: string;
  span?: string;
  className?: string;
  isLoading?: boolean;
  center?: boolean;
  inline?: boolean;
  button?: {
    label: string;
    onClick: () => void;
    options: any;
    lg: boolean;
  };
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
  center,
  link, 
  inline
}: ICardProps) => {

  const router = useRouter();
  return (
    <div
      onClick={() => link && router.push(link)}
      className={`p-4 ${className} rounded-xl text-gray-800 ${
        span ? span : "col-span-2"
      } `}
    >
      <div className="flex gap-2 items-center">
        {isLoading ? <Skeleton circle height={70}/> : icon && (
          <div>
            <img
              src={icon}
              className={`w-[70px] border border-${color}-100 rounded-full bg-white p-1.5`}
            />
          </div>
        )}
        <div className={`flex-1`}>
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
                className={`text-xs ${color === 'orange' ? 'bg-orange-300' : color} hidden lg:block rounded-full p-1 px-2 border-${color}-500 text-white -mb-2`}
              >
                {isLoading ? <Skeleton /> : badge}
              </div>
            )}
          </div>
          <div className={`mt-2 ${isLoading ?  <Skeleton /> : center && 'text-center'}`}>{text ? text : !button && title}</div>
          {button && button.lg ? (
            <div className="mt-5 mr-auto">
              {isLoading ? <Skeleton /> : 
              <button onClick={button.onClick} className="rounded-xl text-2xl font-bold bg-orange-default p-2 px-4 pt-1">
                <span className="text-xl font-bold text-white"> {button.label} </span>
              </button> }
            </div>
          ) : button ? (
            <div className="mt-5 mr-auto">
            {isLoading ? <Skeleton /> : <Button label={button.label} onClick={button.onClick} options={button.options} /> }
              
            </div>
          ) : ""}
        </div>
      </div>
    </div>
  );
};

export default InfoCard;
