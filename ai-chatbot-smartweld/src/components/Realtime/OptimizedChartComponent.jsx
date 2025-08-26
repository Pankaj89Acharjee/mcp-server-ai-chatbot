import { memo, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { Card, Skeleton } from "antd";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { safeToFixed, formatChartTooltip } from "../../utils/numberUtils";
import dayjs from "dayjs";

// Color palettes
const LINE_COLORS = [
  "#00E396",
  "#0090FF",
  "#FF4560",
  "#FEB019",
  "#775DD0",
  "#3F51B5",
  "#546E7A",
  "#D4526E",
  "#8D5B4C",
  "#F86624",
];

const THRESHOLD_COLORS = [
  { line: "#FF4560", text: "#FF6B7D" },
  { line: "#FEB019", text: "#FFD93D" },
  { line: "#775DD0", text: "#9C88FF" },
  { line: "#00E396", text: "#26FFAE" },
  { line: "#0090FF", text: "#40A9FF" },
  { line: "#FF6B35", text: "#FF8C69" },
];

// Optimized Custom Tooltip
const CustomTooltip = memo(({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-slate-800/95 rounded-lg px-3 py-2 border border-white/20 text-xs text-white shadow-xl backdrop-blur-sm">
      <div className="font-semibold mb-1 text-cyan-300">
        {dayjs(label).format("HH:mm:ss")}
      </div>
      {payload.map((entry, idx) => (
        <div key={idx} className="flex justify-between gap-2">
          <span style={{ color: entry.color }} className="font-medium">
            {entry.name}:
          </span>
          <span className="font-bold text-white">
            {formatChartTooltip
              ? formatChartTooltip(entry.value, entry.name, 2)
              : safeToFixed(entry.value, 2)}
          </span>
        </div>
      ))}
    </div>
  );
});

// Optimized Threshold Display
const ThresholdDisplay = memo(({ thresholds = [], isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex flex-wrap gap-2 mb-3">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton.Button key={i} active size="small" />
        ))}
      </div>
    );
  }

  if (!thresholds?.length) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-3">
      {thresholds.map((threshold, index) => {
        const colorTheme = THRESHOLD_COLORS[index % THRESHOLD_COLORS.length];
        return (
          <motion.div
            key={`${threshold.label}-${index}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-white/20 hover:bg-white/15 transition-all duration-200"
            style={{ borderColor: `${colorTheme.line}40` }}
          >
            <span className="text-white/80 text-xs font-medium">
              {threshold.label}:
            </span>
            <span
              className="text-xs font-bold ml-1"
              style={{ color: colorTheme.text }}
            >
              {typeof threshold.value === "number"
                ? safeToFixed(threshold.value, 1)
                : threshold.value || "N/A"}
              {threshold.unit && (
                <span className="text-white/70 ml-0.5">{threshold.unit}</span>
              )}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
});

// Chart Header Component
const ChartHeader = memo(({ title }) => (
  <div className="mb-4">
    <h3 className="text-white font-semibold text-sm lg:text-base truncate">
      {title}
    </h3>
  </div>
));

// Main Chart Component
const OptimizedChartComponent = memo(
  ({
    title,
    series = [],
    thresholds = [],
    hardwareCode = {},
    isLoading = false,
    height = 300,
    className = "",
    enableAnimations = true,
    showGrid = true,
    showLegend = false,
  }) => {
    const containerRef = useRef(null);

    // Memoized chart data transformation without maxDataPoints limit
    const chartData = useMemo(() => {
      if (!series?.length) {
        return [{ timestamp: Date.now(), "No Data": 0 }];
      }

      const dataMap = new Map();

      series.forEach((seriesItem, idx) => {
        const key = seriesItem.name || `Series ${idx + 1}`;
        if (Array.isArray(seriesItem.data)) {
          seriesItem.data
            .filter(
              (point) =>
                Array.isArray(point) &&
                point.length >= 2 &&
                typeof point[0] === "number" &&
                typeof point[1] === "number"
            )
            .sort((a, b) => a[0] - b[0])
            .forEach(([timestamp, value]) => {
              if (!dataMap.has(timestamp)) {
                dataMap.set(timestamp, { timestamp });
              }
              dataMap.get(timestamp)[key] = value;
            });
        }
      });

      return Array.from(dataMap.values()).sort(
        (a, b) => a.timestamp - b.timestamp
      );
    }, [series]);

    // Memoized line configuration
    const lineConfig = useMemo(() => {
      const configs = series?.length ? series : [{ name: "No Data" }];
      return configs.map((seriesItem, idx) => ({
        key: seriesItem.name || `Series ${idx + 1}`,
        color: seriesItem.color || LINE_COLORS[idx % LINE_COLORS.length],
      }));
    }, [series]);

    // Animation variants
    const cardVariants = {
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: "easeOut" },
      },
      hover: { y: -2, transition: { duration: 0.2 } },
    };

    return (
      <motion.div
        ref={containerRef}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
        className={`w-full ${className}`}
      >
        <Card
          className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 border-slate-600/50 shadow-2xl rounded-xl overflow-hidden backdrop-blur-sm hover:shadow-3xl transition-all duration-300"
          bodyStyle={{ padding: "16px", background: "transparent" }}
        >
          <ChartHeader title={title} />
          <ThresholdDisplay thresholds={thresholds} isLoading={isLoading} />

          {isLoading ? (
            <div
              className="flex items-center justify-center"
              style={{ height }}
            >
              <Skeleton.Node active>
                <div
                  className="w-full bg-white/10 rounded-lg animate-pulse"
                  style={{ height: height - 40 }}
                />
              </Skeleton.Node>
            </div>
          ) : (
            <div className="relative" style={{ height }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                >
                  {showGrid && (
                    <CartesianGrid stroke="#ffffff20" strokeDasharray="2 2" />
                  )}

                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(value) => dayjs(value).format("HH:mm:ss")}
                    tick={{ fill: "#fff", fontSize: 10 }}
                    minTickGap={10}
                  />

                  <YAxis
                    tick={{ fill: "#fff", fontSize: 10 }}
                    domain={["auto", "auto"]}
                    width={40}
                  />

                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{
                      stroke: "#00FFFF",
                      strokeWidth: 1,
                      strokeDasharray: "4 4",
                    }}
                  />

                  {lineConfig.map((conf) => (
                    <Line
                      key={conf.key}
                      type="monotone"
                      dataKey={conf.key}
                      stroke={conf.color}
                      strokeWidth={2.5}
                      dot={false}
                      isAnimationActive={enableAnimations}
                      connectNulls
                    />
                  ))}

                  {/* Enhanced Reference Lines with unique colors */}
                  {thresholds
                    .filter(
                      (threshold) =>
                        !["Current", "Voltage", "Flow Rate"].includes(
                          threshold.label
                        )
                    )
                    .map((threshold, index) => (
                      <ReferenceLine
                        key={`${threshold.label}-${index}`}
                        y={threshold.value}
                        label={{
                          value: threshold.label,
                          fontSize: 11,
                          fontWeight: "bold",
                          offset: 5,
                        }}
                        stroke={
                          THRESHOLD_COLORS[index % THRESHOLD_COLORS.length].line
                        }
                        strokeWidth={2}
                        strokeDasharray="4 4"
                        strokeOpacity={0.8}
                      />
                    ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Optimized Footer */}
          <div className="mt-3 flex justify-between items-center text-xs text-white/60">
            <span>Points: {chartData?.length || 0}</span>
            <span>Hardware: {hardwareCode?.hardware_code || "N/A"}</span>
          </div>
        </Card>
      </motion.div>
    );
  }
);

OptimizedChartComponent.displayName = "OptimizedChartComponent";
CustomTooltip.displayName = "CustomTooltip";
ThresholdDisplay.displayName = "ThresholdDisplay";
ChartHeader.displayName = "ChartHeader";

export default OptimizedChartComponent;
