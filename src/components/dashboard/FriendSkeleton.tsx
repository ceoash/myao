import Skeleton from "react-loading-skeleton";

const FriendSkeleton = () => {
  return (
    <div className="flex">
      <div className="flex gap-1">
        <Skeleton width={20} height={20} circle />
        <Skeleton width={60} height={18} />
      </div>
      <div className="flex gap-1 ml-auto">
        <Skeleton width={40} height={20} />
        <Skeleton width={40} height={20} />
      </div>
    </div>
  );
};

export default FriendSkeleton;
