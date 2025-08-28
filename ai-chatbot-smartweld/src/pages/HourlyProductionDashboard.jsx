"use client";
import { Layout, Button } from "antd";
import { ArrowLeft } from "lucide-react";
import { UsageChart } from "../components/productivity-dashboard/hourly-production-chart";
import { Link } from "react-router-dom";
import { ProductivityRecords } from "../components/productivity-dashboard/productivity-records";
import { useQueries } from "@tanstack/react-query";

import { useEffect, useMemo, useState } from "react";
import { useDateSelectionContext } from "../contexts/DateSelectionContext";
import { formatDate } from "../lib/utils";
import {
  getProductivityProductionChart,
  getProductivityRecords,
} from "../apicalls/dashboardSupervisorAPICalls";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const { Content } = Layout;

export default function HourlyProductionPage() {
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const [timeRange, setTimeRange] = useState("hour");
  const [dataType, setDataType] = useState("production");
  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 10,
      total: 0,
    },
  });

  const {
    selectedDate,
    dateType,
    selectedShifts,
    updateDateSelection,
    updateShiftSelection,
  } = useDateSelectionContext();

  // Set defaults if needed
  useEffect(() => {
    if (!selectedDate) {
      updateDateSelection(dayjs());
    }

    if (!selectedShifts || selectedShifts.length === 0) {
      updateShiftSelection(["A", "B", "C"]);
    }
  }, [selectedDate, selectedShifts, updateDateSelection, updateShiftSelection]);

  const isQueryEnabled =
    !!selectedDate && !!selectedShifts && selectedShifts.length > 0;

  // Extract common query preparation logic
  const getQueryParams = () => {
    const formattedDate = formatDate(selectedDate || dayjs(), dateType);
    const shifts = selectedShifts?.length ? selectedShifts : ["A", "B", "C"];
    return { formattedDate, shifts };
  };

  // Use parallel queries for better performance
  const queries = useQueries({
    queries: [
      {
        queryKey: [
          "productivity_production_chart",
          selectedDate,
          selectedShifts,
          timeRange,
          dataType,
        ],
        queryFn: async () => {
          const { formattedDate, shifts } = getQueryParams();
          const { data } = await getProductivityProductionChart(
            formattedDate,
            shifts,
            timeRange,
            dataType
          );
          return data ?? {};
        },
        enabled: isQueryEnabled,
        staleTime: 5 * 60 * 1000,
      },

      {
        queryKey: [
          "productivity_records",
          selectedDate,
          selectedShifts,
          tableParams.pagination?.current,
          tableParams.pagination.pageSize,
        ],
        queryFn: async () => {
          const { formattedDate, shifts } = getQueryParams();
          const { data } = await getProductivityRecords(
            formattedDate,
            shifts,
            tableParams.pagination?.current,
            tableParams.pagination.pageSize
          );
          return data ?? { data: [], pagination: {} };
        },
        enabled: isQueryEnabled,
        staleTime: 5 * 60 * 1000,
      },
    ],
  });

  const [chartQuery, recordsQuery] = queries;

  const handleTableChange = (pagination) => {
    setTableParams({
      pagination: {
        current: pagination.current,
        pageSize: pagination.pageSize,
        total: pagination.total,
      },
    });
  };

  return (
    <Layout className="min-h-[calc(100vh-4.5rem)]">
      <Content className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-slate-800 m-0">
            Productivity Chart
          </h1>
          <Link to="/dashboard/productivities">
            <Button
              type="primary"
              size="large"
              className="bg-slate-600 hover:!bg-slate-700"
            >
              <div className="flex items-center">
                <ArrowLeft className="mr-2 h-5 w-5" />
                Back to Productivity
              </div>
            </Button>
          </Link>
        </div>

        <UsageChart
          timeRange={timeRange}
          setTimeRange={setTimeRange}
          dataType={dataType}
          setDataType={setDataType}
          data={chartQuery.data}
          isLoading={chartQuery.isLoading}
        />
        <ProductivityRecords
          records={recordsQuery.data?.data}
          title="Productivity Records"
          pagination={recordsQuery.data?.pagination}
          onTableChange={handleTableChange}
          isLoading={recordsQuery.isLoading}
        />
      </Content>
    </Layout>
  );
}
