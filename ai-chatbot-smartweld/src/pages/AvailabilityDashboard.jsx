import React, { useEffect, useMemo, useState } from "react";
import { Layout, Typography, Spin } from "antd";
import { AvailabilityPercentage } from "../components/AvailabilityDashboard/availability-percentage";
import { TimeMetric } from "../components/AvailabilityDashboard/time-metric";
import { StationDowntimeDistribution } from "../components/AvailabilityDashboard/station-downtime-distribution";
import { DowntimeRecords } from "../components/AvailabilityDashboard/downtime-records";
import dayjs from "dayjs";
import { useDateSelectionContext } from "../contexts/DateSelectionContext";
import { useQueries } from "@tanstack/react-query";
import { formatDate } from "../lib/utils";
import {
  getAvailabilitiesCards,
  getAvailabilitiesChart,
  getAvailabilitiesRecords,
} from "../apicalls/dashboardSupervisorAPICalls";

const { Content } = Layout;
const { Title } = Typography;

export default function AvailabilityDashboard() {
  const {
    selectedDate,
    dateType,
    selectedShifts,
    updateDateSelection,
    updateShiftSelection,
  } = useDateSelectionContext();

  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 5,
    },
  });

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
        queryKey: ["availabilities_cards", selectedDate, selectedShifts],
        queryFn: async () => {
          const { formattedDate, shifts } = getQueryParams();
          const { data } = await getAvailabilitiesCards(formattedDate, shifts);
          return data ?? {};
        },
        enabled: isQueryEnabled,
        staleTime: 5 * 60 * 1000, // 5 minutes cache
      },
      {
        queryKey: ["availabilities_chart", selectedDate, selectedShifts],
        queryFn: async () => {
          const { formattedDate, shifts } = getQueryParams();
          const { data } = await getAvailabilitiesChart(formattedDate, shifts);
          return data ?? {};
        },
        enabled: isQueryEnabled,
        staleTime: 5 * 60 * 1000,
      },
      {
        queryKey: [
          "availabilities_records",
          selectedDate,
          selectedShifts,
          tableParams.pagination,
        ],
        queryFn: async () => {
          const { formattedDate, shifts } = getQueryParams();
          const { data } = await getAvailabilitiesRecords(
            formattedDate,
            shifts,
            tableParams.pagination.current,
            tableParams.pagination.pageSize
          );
          return data ?? { data: [], pagination: { total: 0 } };
        },
        enabled: isQueryEnabled,
        staleTime: 5 * 60 * 1000,
      },
    ],
  });

  const [cardsQuery, chartQuery, recordsQuery] = queries;

  const handleTableChange = (pagination) => {
    setTableParams({
      pagination: {
        current: pagination.current,
        pageSize: pagination.pageSize,
        total: pagination.total,
      },
    });
  };

  // Check if any query is in loading state
  const isLoading =
    cardsQuery.isLoading || chartQuery.isLoading || recordsQuery.isLoading;

  return (
    <Layout className="min-h-[calc(100vh-4.5rem)] p-4 md:p-6">
      <Content>
        <Title level={2} className="text-white mb-6 text-3xl font-bold">
          Availability Dashboard
        </Title>

        {/* {isLoading ? (
          <div className="flex flex-col items-center justify-center h-[calc(100vh-15rem)]">
            <Spin size="large" tip="Loading dashboard data..." />
            <p className="mt-4 text-gray-400">Loading dashboard data...</p>
          </div>
        ) : (
          <> */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <AvailabilityPercentage
            percentage={parseFloat(cardsQuery.data?.overall_availability ?? 0)}
            isLoading={cardsQuery.isLoading}
          />
          <TimeMetric
            title="Running Time"
            hours={parseFloat(cardsQuery.data?.totalrunninghours ?? 0)}
            subtitle="Total running time"
            color="text-blue-500"
            isLoading={cardsQuery.isLoading}
          />
          <TimeMetric
            title="Idle Time"
            hours={parseFloat(cardsQuery.data?.totalidlehours ?? 0)}
            subtitle="Total idle time"
            color="text-amber-500"
            isLoading={cardsQuery.isLoading}
          />
          <TimeMetric
            title="Downtime"
            hours={parseFloat(cardsQuery.data?.totaldowntimehours ?? 0)}
            subtitle="Total downtime"
            color="text-red-500"
            isLoading={cardsQuery.isLoading}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
          <StationDowntimeDistribution
            data={chartQuery.data}
            isLoading={chartQuery.isLoading}
          />
          <DowntimeRecords
            records={recordsQuery.data?.data ?? []}
            loading={recordsQuery.isLoading}
            pagination={recordsQuery.data?.pagination}
            onTableChange={handleTableChange}
            isLoading={recordsQuery.isLoading}
          />
        </div>
        {/* </>
        )} */}
      </Content>
    </Layout>
  );
}
