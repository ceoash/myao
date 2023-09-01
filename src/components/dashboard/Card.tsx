import React from "react";

interface CardProps {
  children?: React.ReactNode;
  title?: string;
  icon?: React.ReactNode;
  className?: string;
}

const Card = ({ children, title, icon, className}: CardProps) => {
  return (
    <div className={`bg-white p-3 border border-gray-200 rounded-lg mb-6 ${className && className}`}>
      <div className="">
        <div>
          <div className={`flex items-center space-x-2 font-semibold text-gray-900 leading-8 mb-3 ${ title && `border-b border-gray-200`} pb-2`}>
            {icon && <span className="text-orange-default">{icon}</span>}
            <span className="tracking-wide first-letter:uppercase">{title}</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Card;
