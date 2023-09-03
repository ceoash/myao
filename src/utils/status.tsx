function StatusChecker(status: string) {
  switch (status) {
    case "negotiating":
      return (
        <span className="inline-flex items-center bg-orange-100 text-orange-800 text-sm  mr-2 px-2.5 py-0.5 rounded-full ">
          <span className="w-2 h-2 mr-1 bg-orange-500 rounded-full"></span>
          Haggling
        </span>
      );

    case "awaiting approval":
      return (
        <span className="inline-flex items-center bg-orange-100 text-gray-800 text-sm  mr-2 px-2.5 py-0.5 rounded-full ">
          <span className="w-2 h-2 mr-1 bg-orange-400 rounded-full"></span>
          Awaiting response
        </span>
      );

    case "accepted":
      return (
        <span className="inline-flex items-center bg-yellow-100 text-yellow-800 text-sm  mr-2 px-2.5 py-0.5 rounded-full ">
          <span className="w-2 h-2 mr-1 bg-yellow-500 rounded-full"></span>
          Awaiting payment
        </span>
      );

    case "rejected":
      return (
        <span className="inline-flex items-center bg-red-100 text-red-800 text-sm  mr-2 px-2.5 py-0.5 rounded-full ">
          <span className="w-2 h-2 mr-1 bg-red-500 rounded-full"></span>
          Declined
        </span>
      );

    case "cancelled":
      return (
        <span className="inline-flex items-center bg-red-100 text-red-800 text-sm  mr-2 px-2.5 py-0.5 rounded-full ">
          <span className="w-2 h-2 mr-1 bg-red-500 rounded-full"></span>
          Terminated
        </span>
      );

    case "completed":
      return (
        <span className="inline-flex items-center bg-green-100 text-green-800 text-sm  mr-2 px-2.5 py-0.5 rounded-full" >
          <span className="w-2 h-2 mr-1 bg-green-500 rounded-full"></span>
          Paid
        </span>
      );

    case "expired":
      return (
        <span className="inline-flex items-center bg-red-100 text-red-800 text-sm  mr-2 px-2.5 py-0.5 rounded-full">
          <span className="w-2 h-2 mr-1 bg-red-500 rounded-full"></span>
          Expired
        </span>
      );

    default:
      return (
        <span className="inline-flex items-center bg-gray-100 text-gray-800 text-sm  mr-2 px-2.5 py-0.5 rounded-full">
          <span className="w-2 h-2 mr-1 bg-gray-500 rounded-full"></span>
          Pending
        </span>
      );
  }
}

export default StatusChecker;
