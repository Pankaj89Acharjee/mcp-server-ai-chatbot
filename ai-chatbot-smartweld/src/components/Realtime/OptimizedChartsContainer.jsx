import { memo, useMemo, useCallback, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Row, Col, Empty } from "antd";
import OptimizedChartComponent from "./OptimizedChartComponent";
import {
  chartValueFormatter,
  formatChartTooltip,
  safeToNumber,
  safeToFixed,
} from "../../utils/numberUtils";

const OptimizedChartsContainer = memo(
  ({
    selectedMachine = {},
    realtimeData = {},
    isLoading = false,
    connectionError = null,
    className = "",
    updateInterval = 1000,
    maxDataPoints = 100,
  }) => {
    const [lastUpdateTime, setLastUpdateTime] = useState(Date.now());
    const updateTimeoutRef = useRef(null);

    // Helper function to convert string values to numbers and format series data
    const formatSeriesData = useCallback(
      (data, fallbackValue = 0) => {
        if (!data || !Array.isArray(data)) {
          return [[Date.now(), fallbackValue]];
        }

        return data
          .filter(
            (point) =>
              Array.isArray(point) &&
              point.length >= 2 &&
              !isNaN(point[0]) &&
              point[1] !== null &&
              point[1] !== undefined
          )
          .map(([timestamp, value]) => [
            timestamp,
            safeToNumber(value, fallbackValue),
          ])
          .slice(-maxDataPoints);
      },
      [maxDataPoints]
    );

    // Helper function to get current value from series or direct value
    const getCurrentValue = useCallback(
      (series, directValue, fallbackValue = 0) => {
        // First try to get from direct value
        if (directValue !== null && directValue !== undefined) {
          return safeToNumber(directValue, fallbackValue);
        }

        // Then try to get from series
        if (series && Array.isArray(series) && series.length > 0) {
          const lastPoint = series[series.length - 1];
          if (Array.isArray(lastPoint) && lastPoint.length >= 2) {
            return safeToNumber(lastPoint[1], fallbackValue);
          }
        }

        return fallbackValue;
      },
      []
    );

    // Enhanced chart configurations with proper data handling
    const chartConfigs = useMemo(() => {
      if (!selectedMachine || Object.keys(selectedMachine).length === 0) {
        return [];
      }

      // Extract the hardware code - handle both direct hardware code and object
      const hardwareCode = selectedMachine.hardware_code || selectedMachine;

      // Get chart data for the specific machine
      let chartData = {};

      // Handle different data structures
      if (typeof hardwareCode === "string" && realtimeData[hardwareCode]) {
        chartData = realtimeData[hardwareCode];
      } else if (Object.keys(realtimeData).length > 0) {
        // If no exact match, use the first available data
        const firstKey = Object.keys(realtimeData)[0];
        chartData = realtimeData[firstKey];
      }

      const baseConfig = {
        chart: {
          animations: {
            enabled: true,
            easing: "linear",
            dynamicAnimation: {
              speed: 800,
              enabled: true,
            },
          },
          toolbar: {
            show: true,
            offsetX: 0,
            offsetY: 0,
            tools: {
              download: true,
              selection: true,
              zoom: true,
              zoomin: true,
              zoomout: true,
              pan: true,
              reset: true,
            },
            export: {
              csv: {
                filename: undefined,
                columnDelimiter: ",",
                headerCategory: "Time",
                headerValue: "Value",
              },
              png: {
                filename: undefined,
              },
              svg: {
                filename: undefined,
              },
            },
          },
          zoom: {
            enabled: true,
            type: "x",
            autoScaleYaxis: true,
          },
          pan: {
            enabled: true,
            type: "x",
          },
        },
        stroke: {
          curve: "smooth",
          width: 2.5,
          lineCap: "round",
        },
        markers: {
          size: 0,
          hover: { size: 6, sizeOffset: 2 },
          strokeColors: "#fff",
          strokeWidth: 2,
        },
        fill: {
          type: "gradient",
          gradient: {
            shade: "dark",
            type: "vertical",
            shadeIntensity: 0.3,
            opacityFrom: 0.8,
            opacityTo: 0.1,
            stops: [0, 90, 100],
          },
        },
        xaxis: {
          type: "datetime",
          range: updateInterval * maxDataPoints,
          labels: {
            dateTimeUTC: false,
            formatter: (value) => {
              if (!value) return "";
              const date = new Date(value);
              return date.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false,
              });
            },
            style: {
              fontSize: "10px",
              colors: "#ffffff",
              fontFamily: "Inter, sans-serif",
            },
            rotate: -45,
          },
          tickAmount: 6,
          crosshairs: {
            show: true,
            stroke: {
              color: "#b6f7ff",
              width: 1,
              dashArray: 3,
            },
          },
        },
        yaxis: {
          labels: {
            style: {
              fontSize: "10px",
              colors: "#ffffff",
              fontFamily: "Inter, sans-serif",
            },
            formatter: (val) => chartValueFormatter(val, 1),
          },
          crosshairs: {
            show: true,
            stroke: {
              color: "#b6f7ff",
              width: 1,
              dashArray: 3,
            },
          },
        },
        grid: {
          borderColor: "#ffffff20",
          strokeDashArray: 2,
          xaxis: { lines: { show: true } },
          yaxis: { lines: { show: true } },
        },
        tooltip: {
          theme: "dark",
          style: {
            fontSize: "12px",
            fontFamily: "Inter, sans-serif",
          },
          x: { format: "HH:mm:ss" },
          y: {
            formatter: (val, { seriesIndex, w }) => {
              const seriesName = w.config.series[seriesIndex]?.name || "";
              return formatChartTooltip(val, seriesName, 2);
            },
          },
          marker: { show: true },
        },
        legend: {
          show: false,
        },
      };

      return [
        {
          id: "current",
          title: "Current Monitoring",
          series: [
            {
              name: "Current",
              data: formatSeriesData(chartData?.currentSeries, 0),
              color: "#00E396",
            },
          ],
          options: {
            ...baseConfig,
            colors: ["#00E396"],
            stroke: { ...baseConfig.stroke, colors: ["#00E396"] },
            yaxis: {
              ...baseConfig.yaxis,
              title: {
                text: "Current (A)",
                style: { color: "#ffffff", fontSize: "12px" },
              },
            },
            annotations: {
              yaxis: [
                {
                  y: safeToNumber(
                    selectedMachine?.high_weld_cur_threshold,
                    100
                  ),
                  borderColor: "#ff4757",
                  strokeDashArray: 5,
                  label: {
                    text: `UCL: ${safeToFixed(
                      selectedMachine?.high_weld_cur_threshold,
                      1,
                      "100"
                    )}A`,
                    style: { color: "#fff", background: "#ff4757" },
                    position: "right",
                  },
                },
                {
                  y: safeToNumber(selectedMachine?.weld_curr, 80),
                  borderColor: "#ffa502",
                  strokeDashArray: 5,
                  label: {
                    text: `SET: ${safeToFixed(
                      selectedMachine?.weld_curr,
                      1,
                      "80"
                    )}A`,
                    style: { color: "#fff", background: "#ffa502" },
                    position: "right",
                  },
                },
                {
                  y: safeToNumber(selectedMachine?.low_weld_cur_threshold, 60),
                  borderColor: "#3742fa",
                  strokeDashArray: 5,
                  label: {
                    text: `LCL: ${safeToFixed(
                      selectedMachine?.low_weld_cur_threshold,
                      1,
                      "60"
                    )}A`,
                    style: { color: "#fff", background: "#3742fa" },
                    position: "right",
                  },
                },
              ],
            },
          },
          thresholds: [
            {
              label: "UCL",
              value: safeToNumber(
                selectedMachine?.high_weld_cur_threshold,
                100
              ),
              unit: "A",
            },
            {
              label: "SET",
              value: safeToNumber(selectedMachine?.weld_curr, 80),
              unit: "A",
            },
            {
              label: "LCL",
              value: safeToNumber(selectedMachine?.low_weld_cur_threshold, 60),
              unit: "A",
            },
            {
              label: "Current",
              value: getCurrentValue(
                chartData?.currentSeries,
                chartData?.current,
                0
              ),
              unit: "A",
            },
          ],
          status: connectionError ? "disconnected" : "connected",
        },
        {
          id: "voltage",
          title: "Voltage Monitoring",
          series: [
            {
              name: "Voltage",
              data: formatSeriesData(chartData?.voltageSeries, 0),
              color: "#ff6b6b",
            },
          ],
          options: {
            ...baseConfig,
            colors: ["#ff6b6b"],
            stroke: { ...baseConfig.stroke, colors: ["#ff6b6b"] },
            yaxis: {
              ...baseConfig.yaxis,
              title: {
                text: "Voltage (V)",
                style: { color: "#ffffff", fontSize: "12px" },
              },
            },
            annotations: {
              yaxis: [
                {
                  y: safeToNumber(
                    selectedMachine?.high_weld_volt_threshold,
                    100
                  ),
                  borderColor: "#ff4757",
                  strokeDashArray: 5,
                  label: {
                    text: `UCL: ${safeToFixed(
                      selectedMachine?.high_weld_volt_threshold,
                      1,
                      "100"
                    )}V`,
                    style: { color: "#fff", background: "#ff4757" },
                    position: "right",
                  },
                },
                {
                  y: safeToNumber(selectedMachine?.weld_volt, 80),
                  borderColor: "#ffa502",
                  strokeDashArray: 5,
                  label: {
                    text: `SET: ${safeToFixed(
                      selectedMachine?.weld_volt,
                      1,
                      "80"
                    )}V`,
                    style: { color: "#fff", background: "#ffa502" },
                    position: "right",
                  },
                },
                {
                  y: safeToNumber(selectedMachine?.low_weld_volt_threshold, 60),
                  borderColor: "#3742fa",
                  strokeDashArray: 5,
                  label: {
                    text: `LCL: ${safeToFixed(
                      selectedMachine?.low_weld_volt_threshold,
                      1,
                      "60"
                    )}V`,
                    style: { color: "#fff", background: "#3742fa" },
                    position: "right",
                  },
                },
              ],
            },
          },
          thresholds: [
            {
              label: "UCL",
              value: safeToNumber(
                selectedMachine?.high_weld_volt_threshold,
                100
              ),
              unit: "V",
            },
            {
              label: "SET",
              value: safeToNumber(selectedMachine?.weld_volt, 80),
              unit: "V",
            },
            {
              label: "LCL",
              value: safeToNumber(selectedMachine?.low_weld_volt_threshold, 60),
              unit: "V",
            },
            {
              label: "Voltage",
              value: getCurrentValue(
                chartData?.voltageSeries,
                chartData?.voltage,
                0
              ),
              unit: "V",
            },
          ],
          status: connectionError ? "disconnected" : "connected",
        },
        {
          id: "gasfr",
          title: "Gas Flow Rate Monitoring",
          series: [
            {
              name: "Gas Flow Rate",
              data: formatSeriesData(chartData?.gasFRSeries, 0),
              color: "#4ecdc4",
            },
          ],
          options: {
            ...baseConfig,
            colors: ["#4ecdc4"],
            stroke: { ...baseConfig.stroke, colors: ["#4ecdc4"] },
            yaxis: {
              ...baseConfig.yaxis,
              title: {
                text: "Flow Rate (L/m)",
                style: { color: "#ffffff", fontSize: "12px" },
              },
            },
            annotations: {
              yaxis: [
                {
                  y: safeToNumber(
                    selectedMachine?.high_weld_gas_threshold,
                    100
                  ),
                  borderColor: "#ff4757",
                  strokeDashArray: 5,
                  label: {
                    text: `UCL: ${safeToFixed(
                      selectedMachine?.high_weld_gas_threshold,
                      1,
                      "100"
                    )}`,
                    style: { color: "#fff", background: "#ff4757" },
                    position: "right",
                  },
                },
                {
                  y: safeToNumber(selectedMachine?.weld_gas, 80),
                  borderColor: "#ffa502",
                  strokeDashArray: 5,
                  label: {
                    text: `SET: ${safeToFixed(
                      selectedMachine?.weld_gas,
                      1,
                      "80"
                    )}`,
                    style: { color: "#fff", background: "#ffa502" },
                    position: "right",
                  },
                },
                {
                  y: safeToNumber(selectedMachine?.low_weld_gas_threshold, 60),
                  borderColor: "#3742fa",
                  strokeDashArray: 5,
                  label: {
                    text: `LCL: ${safeToFixed(
                      selectedMachine?.low_weld_gas_threshold,
                      1,
                      "60"
                    )}`,
                    style: { color: "#fff", background: "#3742fa" },
                    position: "right",
                  },
                },
              ],
            },
          },
          thresholds: [
            {
              label: "UCL",
              value: safeToNumber(
                selectedMachine?.high_weld_gas_threshold,
                100
              ),
              unit: "L/m",
            },
            {
              label: "SET",
              value: safeToNumber(selectedMachine?.weld_gas, 80),
              unit: "L/m",
            },
            {
              label: "LCL",
              value: safeToNumber(selectedMachine?.low_weld_gas_threshold, 60),
              unit: "L/m",
            },
            {
              label: "Flow Rate",
              value: getCurrentValue(
                chartData?.gasFRSeries,
                chartData?.gasFR,
                0
              ),
              unit: "L/m",
            },
          ],
          status: connectionError ? "disconnected" : "connected",
        },
      ];
    }, [
      selectedMachine,
      realtimeData,
      maxDataPoints,
      updateInterval,
      connectionError,
      formatSeriesData,
      getCurrentValue,
    ]);

    // Auto-update logic
    useEffect(() => {
      updateTimeoutRef.current = setTimeout(() => {
        setLastUpdateTime(Date.now());
      }, updateInterval);

      return () => {
        if (updateTimeoutRef.current) {
          clearTimeout(updateTimeoutRef.current);
        }
      };
    }, [updateInterval, lastUpdateTime]);

    const containerVariants = {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.2,
          delayChildren: 0.1,
        },
      },
    };

    const itemVariants = {
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5 },
      },
    };

    // Show empty state if no machine selected
    if (!selectedMachine || Object.keys(selectedMachine).length === 0) {
      return (
        <div className={`w-full py-8 ${className}`}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div className="text-center">
                <span className="text-slate-700 block mb-2">
                  Please select a machine to view real-time charts
                </span>
              </div>
            }
          />
        </div>
      );
    }

    return (
      <>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={`w-full ${className}`}
        >
          {/* Chart Title Section */}
          <motion.div variants={itemVariants} className="mb-6 text-center">
            <h2 className="text-slate-400 text-xl lg:text-2xl font-bold mb-2">
              Real-time Machine Metrics
            </h2>
            <p className="text-slate-600 text-sm">
              Live monitoring for{" "}
              {selectedMachine?.machine_name || "Selected Machine"}
            </p>
            <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-green-500 mx-auto mt-2 rounded-full" />
          </motion.div>

          {/* Charts Grid */}
          <Row gutter={[16, 24]} className="w-full">
            <AnimatePresence>
              {chartConfigs.map((chartConfig, index) => {
                return (
                  <Col
                    key={chartConfig.id}
                    xs={24}
                    lg={12}
                    xl={8}
                    className="flex"
                  >
                    <motion.div
                      variants={itemVariants}
                      className="w-full"
                      layout
                      layoutId={chartConfig.id}
                    >
                      <OptimizedChartComponent
                        title={chartConfig.title}
                        series={chartConfig.series}
                        options={chartConfig.options}
                        thresholds={chartConfig.thresholds}
                        hardwareCode={selectedMachine}
                        isLoading={isLoading}
                        status={chartConfig.status}
                        height={320}
                        maxDataPoints={maxDataPoints}
                        updateInterval={updateInterval}
                        showGrid={true}
                        showLegend={false}
                        chartType="line"
                        className={`h-full stagger-${index + 1}`}
                      />
                    </motion.div>
                  </Col>
                );
              })}
            </AnimatePresence>
          </Row>
        </motion.div>
      </>
    );
  }
);

OptimizedChartsContainer.displayName = "OptimizedChartsContainer";

export default OptimizedChartsContainer;
