import React from 'react'

import { CgEditBlackPoint } from "react-icons/cg";


function StatusChecker(status: string) {
  
    switch (status) {
        case "negotiation":
            return ( <div className='flex gap-1 items-center text-yellow-500'><CgEditBlackPoint className='text-yellow-500' /><span >Under Negotiation</span> </div>)
        case "accepted":
            return ( <div className='flex gap-1 items-center text-green-500'><CgEditBlackPoint /><span>Accepted</span></div> )
        case "rejected":
            return ( <div className='flex gap-1 items-center text-red-500'><CgEditBlackPoint /><span>Rejected</span></div> )
        case "cancelled":
            return ( <div className='flex gap-1 items-center text-red-500'><CgEditBlackPoint /><span>Cancelled</span></div> )
        case "completed":
            return ( <div className='flex gap-1 items-center text-green-500'><CgEditBlackPoint /><span>Completed</span></div> )
        case "expired":
            return ( <div className='flex gap-1 items-center text-red-500'><CgEditBlackPoint /><span>Expired</span></div> )
        default:
            return ( <div className='flex gap-1 items-center text-gray-500'><CgEditBlackPoint /><span>Pending</span> </div>)
      }
}

export default StatusChecker