import React, { useMemo } from "react";
import { Radio, Typography, Button, Skeleton, message } from "antd";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { MoreVertical } from "lucide-react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { cn } from "../../lib/utils";

dayjs.extend(utc);
dayjs.extend(timezone);

const { Title } = Typography;

// Range and Data options
const timeRanges = [
  { value: "hour", label: "Hourly" },
  { value: "day", label: "Daily" },
  { value: "week", label: "Weekly" },
  { value: "month", label: "Monthly" },
];

const dataTypes = [
  { value: "production", label: "Production" },
  { value: "wire", label: "Wire" },
  { value: "gas", label: "Gas" },
];

// Field mappings (keys are lowercase to match option values)
const TIME_FIELDS = {
  hour: "Hour_Start_Time",
  day: "Day_Start_Date",
  week: "Week_Starting_Date",
  month: "Month_Starting_Date",
};

const COUNT_FIELDS = {
  production: "Arc_On_Min",
  wire: "Total_Calculated_Wire_Used",
  gas: "Total_Calculated_Gas_Used",
  energy: "Total_Energy_Used",
};

// Format strings based on range
const getTimeFormat = (range) => {
  switch (range) {
    case "hour":
      return "HH:mm";
    case "day":
      return "MMM D";
    case "week":
      return "MMM D"; // format only start; week handled in formatter
    case "month":
      return "MMM YYYY";
    default:
      return "HH:mm";
  }
};

// Helper to format a week span
const formatWeekRange = (date) => {
  const start = dayjs(date);
  const end = start.add(6, "day");
  return `${start.format("MMM D")} - ${end.format("MMM D")}`;
};

export const UsageChart = ({
  timeRange,
  setTimeRange,
  dataType,
  setDataType,
  data,
  isLoading,
  className,
  IsShowDataType = true,
  chartType = "bar",
}) => {
  // Memoized formatting
  const formattedData = useMemo(() => {
    if (!data || !Array.isArray(data)) {
      return [];
    }

    const timeField = TIME_FIELDS[timeRange];
    const countField = COUNT_FIELDS[dataType];

    if (!timeField || !countField) {
      return [];
    }

    const timeFormat = getTimeFormat(timeRange);

    return data.map((item, idx) => {
      const timeValue = item[timeField];
      const countValue = item[countField];

      return {
        key: String(idx + 1),
        time:
          timeValue && timeRange === "week"
            ? formatWeekRange(timeValue)
            : timeValue
            ? dayjs(timeValue).format(timeFormat)
            : "N/A",
        count: countValue !== undefined ? parseFloat(countValue) || 0 : 0,
      };
    });
  }, [data, timeRange, dataType]);

  // Generate dynamic title
  const getChartTitle = () => {
    const rangeLabel =
      timeRanges.find((r) => r.value === timeRange)?.label || "";
    const typeLabel = dataTypes.find((d) => d.value === dataType)?.label || "";
    return `${rangeLabel} ${typeLabel} Usage`;
  };

  // Handler for extra options
  const handleMoreOptions = () => {
    message.info("More options coming soon!");
  };

  return (
    <div
      className={cn(
        "bg-slate-800 text-white rounded-lg shadow-lg p-6 mb-6",
        className
      )}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <Title level={4} className="m-0 !text-slate-300">
          {getChartTitle()}
        </Title>
        <Radio.Group
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          buttonStyle="solid"
          className="dark-theme-radio"
        >
          {timeRanges.map(({ value, label }) => (
            <Radio.Button
              key={value}
              value={value}
              aria-label={`Select ${label} range`}
            >
              {label}
            </Radio.Button>
          ))}
        </Radio.Group>
      </div>

      {/* Data Type Selector */}
      {IsShowDataType && (
        <div className="mb-4 relative">
          <Radio.Group
            value={dataType}
            onChange={(e) => setDataType(e.target.value)}
            buttonStyle="solid"
            className="dark-theme-radio"
          >
            {dataTypes.map(({ value, label }) => (
              <Radio.Button
                key={value}
                value={value}
                aria-label={`Select ${label} data`}
              >
                {label}
              </Radio.Button>
            ))}
          </Radio.Group>
          <Button
            type="text"
            icon={<MoreVertical className="h-5 w-5 text-white" />}
            className="absolute right-0 top-0"
            onClick={handleMoreOptions}
            aria-label="More options"
          />
        </div>
      )}

      {/* Chart Area */}
      <div className="h-[400px] w-full overflow-hidden">
        {isLoading ? (
          <Skeleton active paragraph={{ rows: 10 }} className="bg-slate-600" />
        ) : formattedData.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-slate-400">No data available</p>
          </div>
        ) : chartType === "bar" ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={formattedData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#475569"
              />
              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#cbd5e1" }}
                label={{
                  value: `${
                    timeRanges.find((r) => r.value === timeRange)?.label
                  } Start`,
                  position: "insideBottom",
                  offset: -40,
                  fill: "#cbd5e1",
                }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#cbd5e1" }}
                label={{
                  value: dataTypes
                    .find((d) => d.value === dataType)
                    ?.label.toUpperCase(),
                  angle: -90,
                  position: "insideLeft",
                  fill: "#cbd5e1",
                }}
                domain={[0, "dataMax + 5"]}
              />
              <Tooltip
                cursor={{ fill: "rgba(0, 0, 0, 0.1)" }}
                contentStyle={{
                  backgroundColor: "#334155",
                  border: "none",
                  borderRadius: "8px",
                  color: "#fff",
                }}
                itemStyle={{ color: "#fff" }}
              />
              <Bar
                dataKey="count"
                fill="#94a3b8"
                radius={[4, 4, 0, 0]}
                barSize={20}
                name={dataTypes.find((d) => d.value === dataType)?.label}
                label={{ position: "top", fill: "#cbd5e1", fontSize: 12 }}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={formattedData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#475569"
              />
              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#cbd5e1" }}
                label={{
                  value: `${
                    timeRanges.find((r) => r.value === timeRange)?.label
                  } Start`,
                  position: "insideBottom",
                  offset: -40,
                  fill: "#cbd5e1",
                }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#cbd5e1" }}
                label={{
                  value: dataTypes
                    .find((d) => d.value === dataType)
                    ?.label.toUpperCase(),
                  angle: -90,
                  position: "insideLeft",
                  fill: "#cbd5e1",
                }}
                domain={[0, "dataMax + 5"]}
              />
              <Tooltip
                cursor={{ fill: "rgba(0, 0, 0, 0.1)" }}
                contentStyle={{
                  backgroundColor: "#334155",
                  border: "none",
                  borderRadius: "8px",
                  color: "#fff",
                }}
                itemStyle={{ color: "#fff" }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#94a3b8"
                strokeWidth={2}
                dot={{ fill: "#94a3b8", r: 4 }}
                activeDot={{ fill: "#94a3b8", r: 6 }}
                name={dataTypes.find((d) => d.value === dataType)?.label}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
