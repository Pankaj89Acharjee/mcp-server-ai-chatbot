import React, { useMemo } from "react";
import { Card, Table, Skeleton, Space } from "antd";
import FilterDropDown from "../ui/filter-dropdown";

export function ProductivityRecords({
  records,
  title,
  pagination,
  onTableChange,
  isLoading,
}) {
  const renderCell = (text) =>
    isLoading ? <Skeleton active paragraph={false} /> : text;

  const onFilter = (dataIndex) => (value, record) => {
    const fieldValue = record[dataIndex];
    if (fieldValue == null) return false;
    if (value.startsWith("__search__")) {
      const searchText = value.slice(10).toLowerCase();
      return fieldValue.toLowerCase().includes(searchText);
    } else {
      return fieldValue.toLowerCase() === value.toLowerCase();
    }
  };

  // Compute unique filter options for each filterable column
  const stationFilters = useMemo(
    () =>
      Array.from(new Set(records?.map((r) => r["Station Name"] || "")))
        .filter((text) => text)
        .map((text) => ({ text, value: text })),
    [records]
  );

  const machineFilters = useMemo(
    () =>
      Array.from(new Set(records?.map((r) => r["Machine Name"] || "")))
        .filter((text) => text)
        .map((text) => ({ text, value: text })),
    [records]
  );

  const jobNameFilters = useMemo(
    () =>
      Array.from(new Set(records?.map((r) => r["Job Name"] || "")))
        .filter((text) => text)
        .map((text) => ({ text, value: text })),
    [records]
  );

  const siteFilters = useMemo(
    () =>
      Array.from(new Set(records?.map((r) => r["Site Name"] || "")))
        .filter((text) => text)
        .map((text) => ({ text, value: text })),
    [records]
  );

  const columns = useMemo(
    () => [
      {
        title: "Station",
        dataIndex: "station",
        key: "station",
        render: renderCell,
        sorter: (a, b) => a.station.localeCompare(b.station),
        filterDropdown: ({
          setSelectedKeys,
          selectedKeys,
          confirm,
          clearFilters,
        }) => (
          <FilterDropDown
            setSelectedKeys={setSelectedKeys}
            selectedKeys={selectedKeys}
            confirm={confirm}
            clearFilters={clearFilters}
            dataIndex="station"
            options={stationFilters}
          />
        ),
        onFilter: onFilter("station"),
      },
      {
        title: "Machine",
        dataIndex: "machine",
        key: "machine",
        render: renderCell,
        sorter: (a, b) => a.machine.localeCompare(b.machine),
        filterDropdown: ({
          setSelectedKeys,
          selectedKeys,
          confirm,
          clearFilters,
        }) => (
          <FilterDropDown
            setSelectedKeys={setSelectedKeys}
            selectedKeys={selectedKeys}
            confirm={confirm}
            clearFilters={clearFilters}
            dataIndex="machine"
            options={machineFilters}
          />
        ),
        onFilter: onFilter("machine"),
      },
      {
        title: "Job Name",
        dataIndex: "jobName",
        key: "jobName",
        render: renderCell,
        sorter: (a, b) => a.jobName.localeCompare(b.jobName),
        filterDropdown: ({
          setSelectedKeys,
          selectedKeys,
          confirm,
          clearFilters,
        }) => (
          <FilterDropDown
            setSelectedKeys={setSelectedKeys}
            selectedKeys={selectedKeys}
            confirm={confirm}
            clearFilters={clearFilters}
            dataIndex="jobName"
            options={jobNameFilters}
          />
        ),
        onFilter: onFilter("jobName"),
      },
      {
        title: "Job Serial",
        dataIndex: "jobSerial",
        key: "jobSerial",
        render: renderCell,
        sorter: (a, b) => a.jobSerial.localeCompare(b.jobSerial),
      },
      {
        title: "Operator",
        dataIndex: "operator",
        key: "operator",
        render: renderCell,
        sorter: (a, b) => a.operator.localeCompare(b.operator),
      },
      {
        title: "Avg Current",
        dataIndex: "avgCurrent",
        key: "avgCurrent",
        render: renderCell,
        sorter: (a, b) => parseFloat(a.avgCurrent) - parseFloat(b.avgCurrent),
      },
      {
        title: "Avg Voltage",
        dataIndex: "avgVoltage",
        key: "avgVoltage",
        render: renderCell,
        sorter: (a, b) => parseFloat(a.avgVoltage) - parseFloat(b.avgVoltage),
      },
      {
        title: "Avg Gas Flow",
        dataIndex: "avgGasFlow",
        key: "avgGasFlow",
        render: renderCell,
        sorter: (a, b) => parseFloat(a.avgGasFlow) - parseFloat(b.avgGasFlow),
      },
      {
        title: "Arcing Time",
        dataIndex: "arcingTime",
        key: "arcingTime",
        render: renderCell,
        sorter: (a, b) => parseFloat(a.arcingTime) - parseFloat(b.arcingTime),
      },
      {
        title: "Gas Used",
        dataIndex: "gasUsed",
        key: "gasUsed",
        render: renderCell,
        sorter: (a, b) => parseFloat(a.gasUsed) - parseFloat(b.gasUsed),
      },
      {
        title: "Energy Used",
        dataIndex: "energyUsed",
        key: "energyUsed",
        render: renderCell,
        sorter: (a, b) => parseFloat(a.energyUsed) - parseFloat(b.energyUsed),
      },
      {
        title: "Wire Used",
        dataIndex: "wireUsed",
        key: "wireUsed",
        render: renderCell,
        sorter: (a, b) => parseFloat(a.wireUsed) - parseFloat(b.wireUsed),
      },
      {
        title: "Site",
        dataIndex: "site",
        key: "site",
        render: renderCell,
        sorter: (a, b) => a.site.localeCompare(b.site),
        filterDropdown: ({
          setSelectedKeys,
          selectedKeys,
          confirm,
          clearFilters,
        }) => (
          <FilterDropDown
            setSelectedKeys={setSelectedKeys}
            selectedKeys={selectedKeys}
            confirm={confirm}
            clearFilters={clearFilters}
            dataIndex="site"
            options={siteFilters}
          />
        ),
        onFilter: onFilter("site"),
      },
      {
        title: "Date",
        dataIndex: "date",
        key: "date",
        render: renderCell,
        sorter: (a, b) => new Date(a.date) - new Date(b.date),
      },
      {
        title: "Time",
        dataIndex: "time",
        key: "time",
        render: renderCell,
        sorter: (a, b) => a.time.localeCompare(b.time),
      },
    ],
    [isLoading, stationFilters, machineFilters, jobNameFilters, siteFilters]
  );

  const dummyData = useMemo(
    () =>
      Array.from({ length: pagination?.pageSize || 10 }, (_, i) => ({
        key: `loading-${i}`,
        jobSerial: "Loading...",
      })),
    [pagination?.pageSize]
  );

  const dataSource = useMemo(() => {
    if (isLoading || !Array.isArray(records)) return dummyData;
    return records.map((record, idx) => ({
      key: String(idx + 1),
      station: record["Station Name"] || "Unknown",
      machine: record["Machine Name"] || "Unknown",
      jobName: record["Job Name"] || "Unknown",
      jobSerial: record["Job Serial"] || "Unknown",
      operator: record["Operator Name"] || "Not assigned",
      avgCurrent: record["Avg Current"]
        ? `${parseFloat(record["Avg Current"]).toFixed(1)} A`
        : "N/A",
      avgVoltage: record["Avg Voltage"]
        ? `${parseFloat(record["Avg Voltage"]).toFixed(1)} V`
        : "N/A",
      avgGasFlow: record["Avg Gas Flow"]
        ? `${parseFloat(record["Avg Gas Flow"]).toFixed(1)} L/min`
        : "N/A",
      arcingTime: record["Arching Time (Minutes)"]
        ? `${parseFloat(record["Arching Time (Minutes)"]).toFixed(2)} minutes`
        : "N/A",
      gasUsed: record["Gas Used"]
        ? `${parseFloat(record["Gas Used"]).toFixed(1)} L`
        : "N/A",
      energyUsed: record["Energy Used"]
        ? `${parseFloat(record["Energy Used"]).toFixed(1)} kWh`
        : "N/A",
      wireUsed: record["Wire Used"]
        ? `${parseFloat(record["Wire Used"]).toFixed(3)} kg`
        : "N/A",
      site: record["Site Name"] || "Unknown",
      date: record["business_date"] || "Invalid Date",
      time: record["arc_start_time"] || "Invalid Time",
    }));
  }, [records, isLoading, dummyData]);

  return (
    <Card
      title={title}
      className="shadow-lg bg-slate-800 border-slate-700 text-white rounded-lg"
      headStyle={{ color: "white", borderBottom: "1px solid #475569" }}
      extra={
        isLoading ? (
          <Space size="small">
            <Skeleton.Input style={{ width: 100 }} active />
            <Skeleton.Input style={{ width: 50 }} active />
            <Skeleton.Input style={{ width: 80 }} active />
          </Space>
        ) : (
          <div className="flex items-center gap-4 text-slate-300 text-sm">
            <span>Total Jobs: {pagination?.total || 0}</span>
            <span>Page: {pagination?.current || 1}</span>
            <span>Per Page: {pagination?.pageSize || 10}</span>
          </div>
        )
      }
    >
      <Table
        columns={columns}
        dataSource={dataSource}
        pagination={
          isLoading
            ? false
            : {
                ...pagination,
                showSizeChanger: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} items`,
              }
        }
        onChange={onTableChange}
        size="large"
        className="dark-theme-table dark-theme-select"
        rowClassName="text-white text-xs sm:text-sm"
        scroll={{ x: 1800 }}
      />
    </Card>
  );
}
