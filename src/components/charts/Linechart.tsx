"use client";

import dynamic from "next/dynamic";
// import { getLast12Months } from "@/lib/utilities";
import { useEffect, useState } from "react";
import Spinner from "../Spinner";
import { ProfileUser } from "@/interfaces/authenticated";
const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });
import { ApexOptions } from 'apexcharts';



const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const date = new Date();
// const dayName = days[date.getDay()];

const weekEnd = date.getDay();
const sliceWeek = weekEnd - 6;
const arr = days
  .slice(sliceWeek, weekEnd + 1)
  .map((day) => day.slice(0, 3))
  .reverse();

export function LineChart({
  data,
  participant
}: {

  data: {
    sessionOffers: {
      createdAt: string;
      price: number;
    }[];

    participantOffers: {
      createdAt: string;
      price: number;
    }[];
  };
  participant?: {
    name: string;
   } | null;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [display, setDisplay] = useState(false);

  const [chartData, setChartData] = useState<any>([]);
  const [pValues, setPValues] = useState<number[]>([]);
  const [SValues, setSValues] = useState<number[]>([]);
  const [labels, setLabels] = useState<string[]>([]);

  useEffect(() => {
    if (data) {
      const aggregatedParicipantData = data.participantOffers.reduce(
        (acc: any, { createdAt, price }: any) => {
          acc[createdAt] = (acc[createdAt] || 0) + price;
          return acc;
        },
        {}
      );

      const aggregatedSessionData = data.sessionOffers.reduce(
        (acc: any, { createdAt, price }: any) => {
          acc[createdAt] = (acc[createdAt] || 0) + price;
          return acc;
        },
        {}
      );
        let pLabels = Object.keys(aggregatedParicipantData);
        let sLabels = Object.keys(aggregatedSessionData);
        let labels = pLabels.concat(sLabels);
        setLabels(labels);

        let pValues = Object.values(aggregatedParicipantData);
        let sValues = Object.values(aggregatedSessionData);
        setPValues(pValues as number[] || []);
        setSValues(sValues as number[] || []);
    }
    window.dispatchEvent(new Event("resize"));
  }, [data]);

  useEffect(() => {
    if (isLoading) {
      setTimeout(() => {
        setDisplay(true);
      }, 1000);
    }
    console.log("line chart timeout re-rendered");
  }, [isLoading]);

  if (isLoading && !display) {
    return <Spinner />;
  }

  // const last12Months = getLast12Months("short");

  const options: ApexOptions = {
    colors: ["#fdba74", "#dd7853"],
    stroke: {
      width: 3,
      curve: 'smooth',
      lineCap: 'butt'
    },
    chart: {
      
      zoom: {
        enabled: false,
      },
      toolbar: {
        show: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    grid: {
      borderColor: "transparent",

      padding: {
        top: 6,
        left: 6,
        bottom: 0,
      },
      row: {
        colors: ["#fff7ed", "transparent"], // takes an array which will be repeated on columns
        opacity: 0.5,
      },
      column: {
        colors: ["transparent", "transparent"],
      },
      xaxis: {
        lines: {
          show: false,
        },
        axisBorder: {
          show: true,
          color: "transparent",
          height: 1,
          width: "100%",
          offsetX: 0,
          offsetY: -10,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
        axisTicks: {
          show: true,
          borderType: "solid",
          color: "transparent",
          height: 6,
          offsetX: 0,
          offsetY: 0,
        },
      },
    },

    xaxis: {
      categories: labels,
      show: false,
      labels: {
        show: false,
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      min: 0, 
      max: Math.max(...pValues, ...SValues) + 1000, // where `buffer` is an additional space on top
      labels: {
        formatter: function (value: number) {
          if (typeof value === 'number') {
            return "£"+value.toFixed(0);
          }
          return ""; // default value
        },
      },
    },
  } as ApexOptions;

  const series = [ { name: "Your Offers", data: SValues }, { name: `${participant?.name || ""}'s Offers`, data: pValues }];

  return (
    <div className=" border m-4 rounded">
      <ApexChart
        type="line"
        options={{
          ...options,
        }}
        series={series}
        height={220}
        width={"100%"}
      />
    </div>
  );
}
