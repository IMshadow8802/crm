import React from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "../components/Navbar";
import StatisticsCard from "../components/StatCard";
import statisticsCardsData from "../data/statisitcCardData";
import { Typography } from "@material-tailwind/react";
import LineChart from "../components/Charts/LineChart";
import PieChart from "../components/Charts/PieChart"

const Dashboard = () => {
  return (
    <div className="flex flex-col flex-grow">
      <Navbar title="DASHBOARD" />
      <Helmet>
        <title>Dashboard</title>
      </Helmet>
      <div className="mt-10">
        <div className="mb-12 grid gap-y-10 gap-x-6 md:grid-cols-2 xl:grid-cols-4">
          {statisticsCardsData.map(({ icon, title, footer, ...rest }) => (
            <StatisticsCard
              key={title}
              {...rest}
              title={title}
              icon={React.createElement(icon, {
                className: "w-6 h-6 text-white",
              })}
              footer={
                <Typography className="font-normal text-blue-gray-600">
                  <strong className={footer.color}>{footer.value}</strong>
                  &nbsp;{footer.label}
                </Typography>
              }
            />
          ))}
        </div>
        <div className="rounded-lg shadow-xl p-4 mb-6">
          <PieChart/>
        </div>
        <div className="rounded-lg shadow-xl p-4 mb-6">
          <LineChart/>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
