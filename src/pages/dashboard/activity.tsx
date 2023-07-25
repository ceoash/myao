import getUserActivity from "@/actions/dashboard/getActivity";
import getCurrentUser from "@/actions/getCurrentUser";
import ActivityCard from "@/components/dashboard/ActivityCard";
import Button from "@/components/dashboard/Button";
import { Activity } from "@/interfaces/authenticated";
import { Meta } from "@/layouts/meta";
import { Dash } from "@/templates/dash";
import { timeInterval } from "@/utils/formatTime";
import { User } from "@prisma/client";
import { set } from "date-fns";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import { useEffect, useState } from "react";

interface IIndexProps {
  session: any;
  activities: Activity[];
}


const PAGE_SIZE = 10;  // Number of activities to show at once.

const Index = ({ session, activities }: any) => {
  const [timeSinceCreated, setTimeSinceCreated] = useState<string | null>(null);
  const [allActivities, setAllActivities] = useState<Activity[]>([]);
  const [displayedActivities, setDisplayedActivities] = useState<Activity[]>([]);
  const [pageNumber, setPageNumber] = useState(1); 

  useEffect(() => { 
    const sortedActivities = activities.activities.slice().reverse();
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
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold leading-tight -mb-2">
                Activity
              </h2>
            </div>
            <div className="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4  mb-20">
              {displayedActivities.map((activity, i) => <ActivityCard key={i} activity={activity} />)}
              {displayedActivities.length < allActivities.length && (
                <Button onClick={loadMore}>Load more activities</Button>
              )}
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
