import React from "react";
import Card from "../ActivityCard";
import Button from "../Button";
import { Activity } from "@/interfaces/authenticated";

interface ActivityWidgetProps {
  title?: string;
  activities?: Activity[];
}


const ActivityWidget = ({ title, activities }: ActivityWidgetProps) => {
  return (
    <div className="flex-grow overflow-y-auto col-span-4 mt-4 lg:mt-0">
      <h2 className="text-2xl font-bold mb-4 first-letter:uppercase">
        {title ? title : "Activity"}
      </h2>
      {activities?.map((activity, i) => (
        <Card key={i} activity={activity} />
      ))}
      <div>

      <Button label="See All" link={`/dashboard/activity`} />
      </div>
    </div>
  );
};

export default ActivityWidget;
