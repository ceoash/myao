import React from 'react'
import Skeleton from 'react-loading-skeleton';

const OfferSkeleton = () => {
    return (
        <div className="w-full md:mt-0 bg-white py-1  border border-t-0  border-gray-200  md:mb-0">
          
          <div className="md:py-4 md:flex md:gap-4 xl:gap-6 pl-6">
              <Skeleton height={100} width={100} />
            <div className="w-full  pt-2 pb-2 md:p-0 flex flex-col">
              <div className="w-full flex justify-between flex-grow border-b px-4 md:border-none">
                <div>
                  <Skeleton height={20} width={200} />
                    
                  <div>
                    <h2 className="text-sm mb-0 text-gray-500">
                      <Skeleton height={15} width={100} />
                    </h2>
                  </div>
                </div>
                <div className="flex justify-between md:block mb-2 pb-2 md:pb-0 md:m-0">
                  <div>
                    <div className="text-right text-sm">
                      <Skeleton height={15} width={100} />
                      <span className="underline">
                        <Skeleton height={30} width={40} />
                      </span>
                    </div>
    
                    <div className="font-extrabold md:text-2xl text-right">
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-grow my-2 px-4 justify-between  items-end">
                    <Skeleton height={15} width={40} />            
                    <Skeleton height={15} width={30} />            
                  
                
                
              </div>
            </div>
          </div>
        </div>
      );
}

export default OfferSkeleton