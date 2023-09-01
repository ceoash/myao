import getUserActivity from "@/actions/dashboard/getActivity";
import getCurrentUser from "@/actions/getCurrentUser";
import ActivityCard from "@/components/dashboard/ActivityCard";
import Button from "@/components/dashboard/Button";
import Card from "@/components/dashboard/Card";
import { ExtendedActivity } from "@/interfaces/authenticated";
import { Meta } from "@/layouts/meta";
import { Dash } from "@/templates/dash";
import { timeInterval } from "@/utils/formatTime";
import { User } from "@prisma/client";
import { set } from "date-fns";
import { GetServerSideProps } from "next";
import { Session } from "next-auth";
import { getSession } from "next-auth/react";
import { useEffect, useState } from "react";

interface IIndexProps {
  session: Session;
  activities: ExtendedActivity[];
}
const PAGE_SIZE = 10;  // Number of activities to show at once.

const Index = ({ session, activities }: IIndexProps) => {
  const [timeSinceCreated, setTimeSinceCreated] = useState<string | null>(null);
  const [allActivities, setAllActivities] = useState<ExtendedActivity[]>([]);
  const [displayedActivities, setDisplayedActivities] = useState<ExtendedActivity[]>([]);
  const [pageNumber, setPageNumber] = useState(1); 

  useEffect(() => { 
    let sortedActivities: ExtendedActivity[] = [];
    if(activities){
     sortedActivities = activities?.slice().reverse() || [];
    }
    setAllActivities(sortedActivities);
    setDisplayedActivities(sortedActivities.slice(0, PAGE_SIZE));
  },[activities]);

  const loadMore = () => {
    const nextPageNumber = pageNumber + 1;
    setPageNumber(nextPageNumber);
    setDisplayedActivities(allActivities.slice(0, nextPageNumber * PAGE_SIZE));
  };

  return (
    <Dash meta={<Meta title="" description="" />}>
      <div>
        <div className="w-full mx-auto px-4 sm:px-8">
          <div className="pt-6">
            <div className="flex justify-between items-center mb-8">
              <h3 >
                Activity
              </h3>
            </div>
            <div className="md:grid  md:grid-cols-6 gap-6">
            <div className="  px-4 sm:px-6 py-6 rounded-lg border border-gray-200  mb-20 bg-white md:col-span-4">
              {displayedActivities.map((activity, i) => <ActivityCard key={i} page activity={activity} />)}
              {displayedActivities.length < allActivities.length && (
                <Button onClick={loadMore}>Load more activities</Button>
              )}
            </div>
             {/*  <Card title="Total Activities" className="lg:col-span-2" /> */}
            </div>
            
          </div>
        </div>
      </div>
    </Dash>
  );
};

export const getServerSideProps: GetServerSideProps<any> = async (context) => {
  try {
    const session = await getSession(context);
    if (!session) {
      return {
        redirect: {
          destination: "/login",
          permanent: false,
        },
      };
    }

    const activities = await getUserActivity(session);

    return {
      props: {
        session: session,
        activities: activities,
      },
    };
  } catch (error) {
    console.error("Error fetching listings:", error);
    return {
      props: {
        listings: [],
      },
    };
  }
};


export default Index;
