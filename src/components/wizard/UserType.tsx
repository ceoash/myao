import React, { useState } from "react";

interface UserTypeProps {
  setValue: (id: any, value: string) => void;
  setUserType: (value: string) => void;
  userType: string;
  notrade?: boolean;
}

const UserType = ({
  setValue,
  setUserType,
  userType,
  notrade,
}: UserTypeProps) => {
  const handleSelect = (value: string) => {
    setValue("userType", value);
    setUserType(value);
  };

  return (
    <div
      className={`grid ${
        notrade ? "grid-cols-2" : "grid-cols-3"
      } auto-cols-fr gap-2`}
    >
      <div
        onClick={() => handleSelect("buyer")}
        className={`${
          userType === "buyer" && "bg-gray-100"
        } cursor-pointer flex flex-col items-center p-4 border-2 border-gray-200 rounded-md`}
      >
        <div className="mb-4">
          <img src="/icons/cat-accept.png" alt="buy" className=" h-12" />
        </div>
        <div>
          <h5>{notrade ? "I want to buy" : "I buy things"}</h5>
        </div>
      </div>
      <div
        onClick={() => handleSelect("seller")}
        className={`${
          userType === "seller" && "bg-gray-100"
        } cursor-pointer flex flex-col items-center p-4 border-2 border-gray-200 rounded-md`}
      >
        <div className="mb-2">
          <img src="/icons/dog-accept.png" alt="buy" className=" h-12" />
        </div>
        <div>
          <h5>{notrade ? "I want to sell" : "I sell things"}</h5>
        </div>
      </div>
      {!notrade && (
        <div
          onClick={() => handleSelect("trader")}
          className={`${
            userType === "trader" && "bg-gray-100"
          } cursor-pointer flex flex-col items-center p-4 border-2 border-gray-200 rounded-md`}
        >
          <div className="mb-2">
            <img src="/icons/gold-cat.png" alt="buy" className=" h-12" />
          </div>
          <div>
            <h5>I buy and sell</h5>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserType;
