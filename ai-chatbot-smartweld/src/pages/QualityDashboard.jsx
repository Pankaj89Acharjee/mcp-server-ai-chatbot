"use client";

import { useState, useEffect, useMemo } from "react";
import { Layout, Button, Card, Table, Tag, Typography, Select, } from "antd";
import { MoreOutlined } from "@ant-design/icons";
// import QualityPercentageChart from "@/components/quality-percentage-chart";
import { MetricCard } from "../components/ui/metric-card";
import React from "react";
import { Percentage } from "../components/ui/percentage";
import DeviationTable from "../components/Quality-Dashboard/DeviationTable";
import { getAllDeviationRecords } from "../apicalls/dashboardSupervisorAPICalls";
import { useDateSelectionContext } from "../contexts/DateSelectionContext";
import dayjs from "dayjs";
import { formatDate } from "../lib/utils";
import { useQueries } from "@tanstack/react-query";


const { Content } = Layout;
const { Title, Text } = Typography;




export default function QualityDashboard() {
  const [isDeviationModalOpen, setIsDeviationModalOpen] = useState(false);
  
  const [pagination, setPagination] = React.useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const { selectedDate, dateType, selectedShifts, updateDateSelection, updateShiftSelection } = useDateSelectionContext();

  const reasonOptions = [
    { value: "Weld quality issue", label: "Weld quality issue" },
    { value: "Material defect", label: "Material defect" },
    { value: "Alignment issue", label: "Alignment issue" },
    { value: "Calibration needed", label: "Calibration needed" },
    { value: "Other", label: "Other" },
  ];

  const [qualityRecords, setQualityRecords] = useState([
    {
      key: "1",
      station: "Welding Station 1",
      jobModel: "Front Panel",
      jobSerial: "SN-2024-001",
      operator: "John Smith",
      status: "reworked",
      reason: "Weld quality issue",
      date: "2024-03-15",
      time: "10:30:45 AM",
    },
    {
      key: "2",
      station: "Welding Station 2",
      jobModel: "Rear Frame",
      jobSerial: "SN-2024-002",
      operator: "Jane Doe",
      status: "rejected",
      reason: "Material defect",
      date: "2024-03-15",
      time: "11:45:30 AM",
    },
    {
      key: "3",
      station: "Welding Station 3",
      jobModel: "Side Panel",
      jobSerial: "SN-2024-003",
      operator: "Mike Johnson",
      status: "reworked",
      reason: null, // Uses Select dropdown for this row
      date: "2024-03-15",
      time: "02:15:20 PM",
    },
    {
      key: "4",
      station: "Welding Station 4",
      jobModel: "Support Bracket",
      jobSerial: "SN-2024-004",
      operator: "Sarah Wilson",
      status: "rejected",
      reason: null, // Uses Select dropdown for this row
      date: "2024-03-15",
      time: "03:30:15 PM",
    },
  ]);

  // Check if the date and shifts are selected
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

  }


  // Use parallel queries for better performance
  const queries = useQueries({
    queries: [
      {
        queryKey: ["deviation_records", selectedDate, selectedShifts, pagination?.current, pagination.pageSize],
        queryFn: async () => {
          const { formattedDate, shifts } = getQueryParams();
          const { data } = await getAllDeviationRecords(
            formattedDate,
            shifts,
            pagination?.current,
            pagination.pageSize
          );
          return data ?? { data: [], pagination: { total: 0 } };
        },
        enabled: isQueryEnabled,
        staleTime: 5 * 60 * 1000,
      },
    ],
  });


  const [deviationRecordsQuery] = queries;

  console.log("deviationRecordsQuery.data", deviationRecordsQuery.data);

  const isLoading = deviationRecordsQuery.isLoading;


  const formattedDeviationRecords = useMemo(() => {
    if (!deviationRecordsQuery.data?.data || !Array.isArray(deviationRecordsQuery.data.data)) return [];

    return deviationRecordsQuery.data.data.map((record, index) => {
      return {
        key: String(index + 1),
        machine_name: record["machine_name"] || "Unknown",
        job_name: record["job_name"] || "Unknown",
        job_serial: record["job_serial"] || "Unknown",
        user_name: record["user_name"] || "Not assigned",
        status: record["status"] || "Unknown",
        reason: record["reason"] || "Unknown",
        business_date: record["business_date"] || "Unknown",
        threshold_start_time: record["threshold_start_time"] || "Unknown",
        threshold_duration: record["threshold_duration"] || "Unknown",
        threshold_type: record["threshold_type"] || "Unknown",
        running_seq: record["running_seq"] || "Unknown",
        target_value: record["target_value"] || "Unknown",
        avg_value: record["avg_value"] || "Unknown",
        machine_type_name: record["machine_type_name"] || "Unknown",
        shift_name: record["shift_name"] || "Unknown",
      };
    });
  }, [deviationRecordsQuery.data]);








  // Handle pagination change
  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
  };






  const handleReasonChange = (key, value) => {
    setQualityRecords((prev) =>
      prev.map((item) => (item.key === key ? { ...item, reason: value } : item))
    );
  };

  const columns = [
    { title: "STATION", dataIndex: "station", key: "station" },
    { title: "JOB MODEL", dataIndex: "jobModel", key: "jobModel" },
    { title: "JOB SERIAL", dataIndex: "jobSerial", key: "jobSerial" },
    { title: "OPERATOR", dataIndex: "operator", key: "operator" },
    {
      title: "STATUS",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag
          color={status === "reworked" ? "gold" : "error"}
          className={`px-2 py-0.5 ${status === "reworked" ? "bg-yellow-800" : "bg-red-800"
            }`}
        >
          {status}
        </Tag>
      ),
    },
    {
      title: "REASON",
      dataIndex: "reason",
      key: "reason",
      render: (reason, record) =>
        reason ? (
          <Text className="text-slate-300">{reason}</Text>
        ) : (
          <Select
            className="dark-theme-select"
            placeholder="Select reason"
            onChange={(value) => handleReasonChange(record.key, value)}
            style={{ width: 180 }}
            options={reasonOptions}
          />
        ),
    },
    { title: "DATE", dataIndex: "date", key: "date" },
    { title: "TIME", dataIndex: "time", key: "time" },
  ];



  return (
    <Layout className="min-h-screen">
      <Content className="p-4 md:p-6">
        <div className="flex justify-between items-center mb-6">
          <Title level={2} className="text-slate-800 m-0 text-3xl font-bold">
            Quality Dashboard
          </Title>
          <Button
            type="primary"
            size="large"
            className="bg-slate-600 hover:!bg-slate-800"
            onClick={() => setIsDeviationModalOpen(true)}
            disabled={isLoading}
          >
            View Deviation Details
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Percentage percentage={85} title={"Quality Percentage"} />
          <MetricCard
            title="Total Jobs"
            value="150"
            subtitle="Total jobs produced"
            valueColor="text-blue-600"
          />
          <MetricCard
            title="Reworked Jobs"
            value="15"
            subtitle="Jobs requiring rework"
            valueColor="text-amber-500"
          />
          <MetricCard
            title="Rejected Jobs"
            value="8"
            subtitle="Jobs rejected"
            valueColor="text-red-600"
          />
        </div>

        <Card
          title={"Quality Records"}
          className="dark-theme-card"
          extra={<Button type="text" icon={<MoreOutlined />} />}
        >
          <div className="overflow-x-auto">
            <Table
              columns={columns}
              dataSource={qualityRecords}
              pagination={true}
              size="large"
              className="dark-theme-table min-w-[37.5rem]"
              scroll={{ x: 1500 }}
            />
          </div>
        </Card>

        <DeviationTable
          isDeviationModalOpen={isDeviationModalOpen}
          setIsDeviationModalOpen={setIsDeviationModalOpen}
          deviationData={formattedDeviationRecords}
          onChange={handleTableChange}
          loading={deviationRecordsQuery.isLoading}
          pagination={pagination}
        />

      </Content>
    </Layout>
  );
}
