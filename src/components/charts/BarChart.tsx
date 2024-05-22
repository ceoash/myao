import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import Spinner from "../Spinner";
import { ApexOptions } from 'apexcharts';

const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

const PerformanceChart = ({
  data,
}: {
  data: {
    date: string;
    amount: number;
  }[];
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [display, setDisplay] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setTimeout(() => {
        setDisplay(true);
        setIsLoading(false);  // Ensure to set loading to false
      }, 1000);
    }
    console.log("line chart timeout re-rendered");
  }, [isLoading]);

  if (isLoading && !display) {
    return <Spinner />;
  }

  const values = data.map((item) => Number(item.amount || 0));
  const labels = data.map((item) => item.date);

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
      categories: labels, // Use dynamic labels
      show: true,
      labels: {
        show: true,
      },
      axisBorder: {
        show: true,
      },
      axisTicks: {
        show: true,
      },
    },
    yaxis: {
      min: 0,
      max: Math.max(...values) + 10, // Add some buffer above the max value
      labels: {
        formatter: function (value: number) {
          if (typeof value === 'number') return "£" + value.toLocaleString();
          return ""; // default value
        },
      },
    },
  } as ApexOptions;

  const series = [{
    name: "Amount",
    data: values,
  }];

  return (
    <div className="border m-4 rounded">
      <ApexChart
        type="bar"
        options={options}
        series={series}
        height={220}
        width={"100%"}
      />
    </div>
  );
}

export default PerformanceChart;
