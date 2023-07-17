import { CgEditBlackPoint } from "react-icons/cg";

function StatusChecker(status: string) {
  
    switch (status) {
        case "negotiating":
            return ( <div className='flex gap-1 items-center text-yellow-500'><CgEditBlackPoint/><span >Haggle On</span> </div>)
        case "awaiting approval": 
            return ( <div className='flex gap-1 items-center text-teal-500'><CgEditBlackPoint/><span >Awaiting</span> </div>)
        case "accepted":
            return ( <div className='flex gap-1 items-center text-green-500'><CgEditBlackPoint /><span>Accepted</span></div> )
        case "rejected":
            return ( <div className='flex gap-1 items-center text-red-500'><CgEditBlackPoint /><span>Declined</span></div> )
        case "cancelled":
            return ( <div className='flex gap-1 items-center text-red-500'><CgEditBlackPoint /><span>Terminated</span></div> )
        case "completed":
            return ( <div className='flex gap-1 items-center text-green-500'><CgEditBlackPoint /><span>Agreed</span></div> )
        case "expired":
            return ( <div className='flex gap-1 items-center text-red-500'><CgEditBlackPoint /><span>Expired</span></div> )
        default:
            return ( <div className='flex gap-1 items-center text-gray-500'><CgEditBlackPoint /><span>Pending</span> </div>)
      }
}

export default StatusChecker