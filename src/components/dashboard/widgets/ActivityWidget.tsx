import Card from "../ActivityCard";
import Link from "next/link";
import { ExtendedActivity } from "@/interfaces/authenticated";

interface ActivityWidgetProps {
  title?: string;
  activities?: ExtendedActivity[];
}

const ActivityWidget = ({ title, activities }: ActivityWidgetProps) => {
    
  return (
    <div className="flex-grow overflow-y-auto col-span-4 mt-4 lg:mt-0">
      <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold mb-4 first-letter:uppercase">
        {title ? title : "Activity"}
      </h2>
      <Link className="text-sm" href={`/dashboard/activity`} >
        See All
        </Link>
      </div>
      {activities?.map((activity, i) => (
        <Card key={i} activity={activity} />
      ))}
      
    </div>
  );
};

export default ActivityWidget;
