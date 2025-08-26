import { Card, Button, Empty, Skeleton } from "antd";
import { MoreVertical } from "lucide-react";
import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

export function StationDowntimeDistribution({
  data,
  title,
  isLoading = false,
}) {
  // Define a color palette for the chart
  const COLORS = [
    "#1890ff",
    "#13c2c2",
    "#52c41a",
    "#faad14",
    "#f5222d",
    "#722ed1",
    "#eb2f96",
    "#fa8c16",
  ];

  // Format the data for the pie chart if it exists
  const chartData = React.useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return [];
    }

    return data.map((item, index) => ({
      name: item.machine_type_name,
      value: parseFloat(item.percentage_of_total_downtime),
      hours: parseFloat(item.total_downtime_hours),
      color: COLORS[index % COLORS.length],
    }));
  }, [data]);

  return (
    <Card
      title={title ?? "Station Downtime Distribution"}
      className="shadow-lg bg-slate-800 border-slate-700 text-white rounded-lg"
      headStyle={{ color: "white", borderBottom: "1px solid #475569" }}
      extra={
        isLoading ? (
          <Skeleton.Button active shape="circle" />
        ) : (
          <Button type="text" icon={<MoreVertical size={16} />} />
        )
      }
    >
      <div className="h-96">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Skeleton.Avatar active size={200} shape="circle" />
          </div>
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                dataKey="value"
                label={({ name, value }) => `${name} (${value.toFixed(2)}%)`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => `${value}%`}
                contentStyle={{
                  backgroundColor: "#334155",
                  border: "none",
                  borderRadius: "4px",
                }}
                itemStyle={{ color: "white" }}
              />
              <Legend wrapperStyle={{ color: "white" }} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full">
            <Empty
              description={
                <span className="text-white">No downtime data available</span>
              }
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        )}
      </div>
    </Card>
  );
}
