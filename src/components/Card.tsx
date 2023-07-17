"use client";

interface CardProps {
  title: string;
  body?: React.ReactNode;
  children?: React.ReactNode;
  icon?: React.ReactNode;
  sidebar?: boolean;
  
}

const Card = ({ title, children, icon, sidebar }: CardProps) => {
  return (
    <div className="bg-white border-2 border-gray-200 rounded-md p-6 mb-6 shadow">
      {!sidebar ? (
        <div className="flex items-center space-x-2 font-semibold text-gray-900 leading-8 text-xl">
        <span className="text-orange-default">
          {icon}
        </span>
        <span className="tracking-wide first-letter:uppercase">{title}</span>
      </div>
      ) : (
        <h4>{title}</h4>
      )}
      <div className="flex gap-2 items-center">
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Card;
