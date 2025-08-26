"use client";

import { Layout, Typography, Button, Spin } from "antd";
import { Percentage } from "../components/ui/percentage";
import { MetricCard } from "../components/ui/metric-card";
import { ParametersCard } from "../components/ui/parameters-card";
import { ProductivityRecords } from "../components/productivity-dashboard/productivity-records";
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import { useQueries } from "@tanstack/react-query";
import { formatDate } from "../lib/utils";
import { useDateSelectionContext } from "../contexts/DateSelectionContext";
import {
  getProductivityCards,
  getProductivityRecords,
} from "../apicalls/dashboardSupervisorAPICalls";

const { Content } = Layout;
const { Title } = Typography;

export default function ProductivityDashboard() {
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
      pageSize: 10,
      total: 0,
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
        queryKey: ["productivity_cards", selectedDate, selectedShifts],
        queryFn: async () => {
          const { formattedDate, shifts } = getQueryParams();
          const { data } = await getProductivityCards(formattedDate, shifts);
          return data ?? {};
        },
        enabled: isQueryEnabled,
        staleTime: 5 * 60 * 1000, // 5 minutes cache
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

  const [cardsQuery, recordsQuery] = queries;

  const parameters = useMemo(() => {
    return [
      {
        label: "Avg Current",
        value: `${parseFloat(
          cardsQuery.data?.averageParameters?.["Avg Current"] ?? 0
        )} A`,
      },
      {
        label: "Avg Voltage",
        value: `${parseFloat(
          cardsQuery.data?.averageParameters?.["Avg Voltage"] ?? 0
        )} V`,
      },
      {
        label: "Avg Gas flow",
        value: `${parseFloat(
          cardsQuery.data?.averageParameters?.["Avg Gas flow"] ?? 0
        )} L/min`,
      },
    ];
  }, [cardsQuery.data]);

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
    <Layout className="min-h-[calc(100vh-4.5rem)] w-full">
      <Content className="p-4 md:p-6">
        <div className="flex justify-between items-center mb-6">
          <Title level={2} className="text-gray-800 m-0 text-3xl font-bold">
            Productivity Dashboard
          </Title>
          <Link to="/dashboard/hourly-productions">
            <Button
              type="primary"
              size="large"
              className="bg-slate-600 hover:!bg-slate-800"
            >
              View Production Details
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
          <Percentage
            percentage={parseFloat(
              cardsQuery.data?.total_overall_productivity ?? 0
            )}
            isLoading={cardsQuery.isLoading}
            title="Productivity Percentage"
          />
          <MetricCard
            title="Target Jobs"
            value={parseFloat(cardsQuery.data?.total_target_jobs ?? 0)}
            subtitle="Target jobs for the period"
            valueColor="text-orange-500"
            isLoading={cardsQuery.isLoading}
          />
          <MetricCard
            title="Total Jobs Produced"
            value={parseFloat(cardsQuery.data?.job_count ?? 0)}
            subtitle="Total jobs completed"
            valueColor="text-blue-500"
            isLoading={cardsQuery.isLoading}
          />
          <MetricCard
            title="Total Arc-on Time"
            value={`${parseFloat(
              cardsQuery.data?.total_arc_on_hour ?? 0
            )} hours`}
            subtitle="Total welding time"
            valueColor="text-amber-500"
            isLoading={cardsQuery.isLoading}
          />
          <ParametersCard
            title="Average Parameters"
            parameters={parameters}
            isLoading={cardsQuery.isLoading}
          />
          <MetricCard
            title="Total Wire Consumption"
            value={`${parseFloat(
              cardsQuery.data?.total_calculated_wire_used ?? 0
            )} kg`}
            subtitle="Total wire used"
            valueColor="text-purple-500"
            isLoading={cardsQuery.isLoading}
          />
        </div>

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
