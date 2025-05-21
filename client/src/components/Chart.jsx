import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
// import { chartData } from "../assets/data";

export const Chart = ({ data }) => {
  const chartData = [
    { name: "high", total: 0 },
    { name: "medium", total: 0 },
    { name: "normal", total: 0 },
    { name: "low", total: 0 },
    ...(data || []),
  ].reduce((acc, item) => {
    const existing = acc.find((i) => i.name === item.name);
    if (existing) {
      existing.total = item.total;
    }
    return acc;
  }, []);
  return (
    <ResponsiveContainer width={"100%"} height={300}>
      <BarChart width={150} height={40} data={data}>
        <XAxis
          dataKey="name"
          tick={{ fill: "#4b5563" }}
          label={{ position: "bottom" }}
        />
        <YAxis
          tick={{ fill: "#4b5563" }}
          label={{
            angle: -90,
            position: "left",
          }}
        />
        <Tooltip />
        <Legend />
        <CartesianGrid strokeDasharray="3 3" />
        <Bar dataKey="total" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
};
