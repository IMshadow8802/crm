import React from "react";
import { Helmet } from "react-helmet";
import Navbar from "../components/Navbar";
import {
 BanknotesIcon,
 UserPlusIcon,
 UserIcon,
 ChartBarIcon,
} from "@heroicons/react/24/solid";

const Dashboard = () => {
 const cardData = [
    {
      color: "indigo",
      icon: BanknotesIcon,
      title: "Today's Money",
      value: "₹53k",
      footer: {
        color: "text-green-500",
        value: "+55%",
        label: "than last week",
      },
    },
    {
      color: "pink",
      icon: UserIcon,
      title: "Today's Users",
      value: "2,300",
      footer: {
        color: "text-green-500",
        value: "+3%",
        label: "than last month",
      },
    },
    {
      color: "green",
      icon: UserPlusIcon,
      title: "New Clients",
      value: "3,462",
      footer: {
        color: "text-red-500",
        value: "-2%",
        label: "than yesterday",
      },
    },
    {
      color: "amber",
      icon: ChartBarIcon,
      title: "Sales",
      value: "₹103,430",
      footer: {
        color: "text-green-500",
        value: "+5%",
        label: "than yesterday",
      },
    },
 ];

 const cardColors = {
    indigo: "bg-indigo-100 text-indigo-700",
    pink: "bg-pink-100 text-pink-700",
    green: "bg-green-100 text-green-700",
    amber: "bg-amber-100 text-amber-700",
 };

 return (
    <div className="flex flex-col flex-grow">
      <Navbar title="DASHBOARD" />
      <Helmet>
        <title>Dashboard</title>
      </Helmet>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
        {cardData.map((card, index) => (
          <div
            key={index}
            className={`p-4 ${cardColors[card.color]} rounded-lg shadow-md`}
          >
            <div className="flex items-center">
              <div className="w-10 h-10 p-2 rounded-full bg-white">
                <card.icon className={`w-8 h-8 text-${card.color}-600`} />
              </div>
              <div className="ml-4">
                <h1 className="text-xl font-semibold">{card.title}</h1>
                <h2 className="text-3xl font-bold">{card.value}</h2>
              </div>
            </div>
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm">{card.footer.label}</div>
              <div className={`text-xl font-bold ${card.footer.color}`}>
                {card.footer.value}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
 );
};

export default Dashboard;