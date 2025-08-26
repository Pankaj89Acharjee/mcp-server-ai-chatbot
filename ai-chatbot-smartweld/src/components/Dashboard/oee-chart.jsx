import React from "react";
import { Button, Typography } from "antd";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { CloseOutlined } from "@ant-design/icons";

const { Title } = Typography;

// Top‐level OEE breakdown
const breakdownData = [
  { metric: "Availability", value: 92 },
  { metric: "Performance", value: 88 },
  { metric: "Quality", value: 75 },
  { metric: "Planned Production Time", value: 95 },
  { metric: "Run Time", value: 97 },
  { metric: "Ideal Cycle Time", value: 90 },
  { metric: "Actual Cycle Time", value: 85 },
  { metric: "Good Parts", value: 78 },
  { metric: "Total Parts", value: 72 },
];

// Detailed sub‑metrics
const detailData = [
  { metric: "Planned Production Time", value: 95 },
  { metric: "Run Time", value: 97 },
  { metric: "Ideal Cycle Time", value: 90 },
  { metric: "Actual Cycle Time", value: 85 },
  { metric: "Good Parts", value: 78 },
  { metric: "Total Parts", value: 72 },
];

export const OEEChart = ({ setIsModalOpen }) => (
  <div className="bg-slate-800 text-white rounded-lg shadow-lg p-6">
    {/* Title */}
    <div className="flex justify-between items-center mb-4">
      <Title level={4} className="!text-slate-300">
        Overall Equipment Effectiveness (OEE)
      </Title>
      <Button
        type="text"
        icon={<CloseOutlined />}
        onClick={() => setIsModalOpen(false)}
        className="!text-slate-50 hover:!text-slate-300"
      />
    </div>

    {/* Breakdown Chart */}
    <div className="h-[400px] w-full">
      <ResponsiveContainer>
        <BarChart
          data={breakdownData}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#475569"
          />
          <XAxis
            dataKey="metric"
            tick={{ fontSize: 12, fill: "#cbd5e1" }}
            tickLine={false}
            axisLine={false}
            interval={0}
            angle={-30}
            textAnchor="end"
          />
          <YAxis
            tick={{ fontSize: 12, fill: "#cbd5e1" }}
            tickLine={false}
            axisLine={false}
            domain={[0, 100]}
          />
          <Tooltip
            cursor={{ fill: "rgba(0, 0, 0, 0.1)" }}
            contentStyle={{
              backgroundColor: "#334155",
              border: "none",
              borderRadius: 8,
              color: "#fff",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
            }}
            itemStyle={{ color: "#fff" }}
          />
          <Bar
            dataKey="value"
            fill="#94a3b8"
            radius={[4, 4, 0, 0]}
            barSize={30}
            label={{ position: "top", fill: "#cbd5e1", fontSize: 12 }}
            name="Percentage"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>

    {/* Detailed Metrics Chart */}
    {/* <Title level={5} className="!text-slate-300 mb-4">
      Detailed Metrics
    </Title>
    <div style={{ width: "100%", height: 320 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={detailData}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 160, bottom: 20 }}
          barCategoryGap="20%"
        >
          <CartesianGrid
            strokeDasharray="3 3"
            horizontal={false}
            stroke="#475569"
          />
          <XAxis
            type="number"
            domain={[0, 100]}
            tick={{ fontSize: 12, fill: "#cbd5e1" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            dataKey="metric"
            type="category"
            width={150}
            tick={{ fontSize: 12, fill: "#cbd5e1" }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            cursor={{ fill: "rgba(0, 0, 0, 0.1)" }}
            contentStyle={{
              backgroundColor: "#334155",
              border: "none",
              borderRadius: 8,
              color: "#fff",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
            }}
            itemStyle={{ color: "#fff" }}
          />
          <Bar
            dataKey="value"
            fill="#94a3b8"
            radius={[4, 4, 0, 0]}
            barSize={14}
            label={{ position: "right", fill: "#cbd5e1", fontSize: 12 }}
            name="Percentage"
          />
        </BarChart>
      </ResponsiveContainer>
    </div> */}
  </div>
);
