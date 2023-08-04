import React from "react";

interface CardProps {
  children?: React.ReactNode;
  title?: string;
  icon?: React.ReactNode;
}

const Card = ({ children, title, icon }: CardProps) => {
  return (
    <div className="bg-white p-3 border border-gray-200 rounded-lg mb-6">
      <div className="">
        <div>
          <div className={`flex items-center space-x-2 font-semibold text-gray-900 leading-8 mb-3 ${ title && `border-b border-gray-200`} pb-2`}>
            {icon && <span className="text-orange-400">{icon}</span>}
            <span className="tracking-wide first-letter:uppercase">{title}</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Card;
