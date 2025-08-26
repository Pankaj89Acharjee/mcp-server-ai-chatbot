import React, { useMemo } from "react";
import { Card, Table, Skeleton, Space, Button } from "antd";
import { MoreVertical } from "lucide-react";
import FilterDropDown from "../ui/filter-dropdown"; // Assuming this is available as in ProductivityRecords
import { DatePicker } from "antd";

export function DowntimeRecords({
  records,
  title,
  pagination,
  onTableChange,
  isLoading,
}) {
  // Render function for table cells, showing skeletons during loading
  const renderCell = (text) =>
    isLoading ? <Skeleton active paragraph={false} /> : text;

  // Filter function supporting both exact match and search (mirroring ProductivityRecords)
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

  // Dummy data for loading state
  const dummyData = useMemo(
    () =>
      Array.from({ length: pagination?.pageSize || 10 }, (_, i) => ({
        key: `loading-${i}`,
        downtime_reason: "Loading...", // Consistent with ProductivityRecords style
      })),
    [pagination?.pageSize]
  );

  // Transform records into dataSource with default values for missing fields
  const dataSource = useMemo(() => {
    if (isLoading || !Array.isArray(records)) return dummyData;
    return records.map((record, idx) => ({
      key: String(idx + 1),
      station_name: record.station_name || "Unknown",
      business_date: record.business_date || "Invalid Date",
      shift_name: record.shift_name || "Unknown",
      operator_name: record.operator_name || "Not assigned",
      downtime_start: record.downtime_start || "Invalid Time",
      downtime_end: record.downtime_end || "Invalid Time",
      downtime_reason: record.downtime_reason || "Unknown",
    }));
  }, [records, isLoading, dummyData]);

  // Compute unique filter options for categorical columns
  const stationFilters = useMemo(
    () =>
      Array.from(new Set(records?.map((r) => r.station_name || "")))
        .filter((text) => text)
        .map((text) => ({ text, value: text })),
    [records]
  );

  const shiftFilters = useMemo(
    () =>
      Array.from(new Set(records?.map((r) => r.shift_name || "")))
        .filter((text) => text)
        .map((text) => ({ text, value: text })),
    [records]
  );

  const operatorFilters = useMemo(
    () =>
      Array.from(new Set(records?.map((r) => r.operator_name || "")))
        .filter((text) => text)
        .map((text) => ({ text, value: text })),
    [records]
  );

  const reasonFilters = useMemo(
    () =>
      Array.from(new Set(records?.map((r) => r.downtime_reason || "")))
        .filter((text) => text)
        .map((text) => ({ text, value: text })),
    [records]
  );

  // Define table columns with sorting and filtering
  const columns = useMemo(
    () => [
      {
        title: "STATION",
        dataIndex: "station_name",
        key: "station_name",
        render: renderCell,
        sorter: (a, b) => a?.station_name?.localeCompare(b?.station_name),
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
            dataIndex="station_name"
            options={stationFilters}
          />
        ),
        onFilter: onFilter("station_name"),
      },
      {
        title: "SHIFT",
        dataIndex: "shift_name",
        key: "shift_name",
        render: renderCell,
        sorter: (a, b) => a?.shift_name?.localeCompare(b?.shift_name),
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
            dataIndex="shift_name"
            options={shiftFilters}
          />
        ),
        onFilter: onFilter("shift_name"),
      },
      {
        title: "OPERATOR",
        dataIndex: "operator_name",
        key: "operator_name",
        render: renderCell,
        sorter: (a, b) => a?.operator_name?.localeCompare(b?.operator_name),
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
            dataIndex="operator_name"
            options={operatorFilters}
          />
        ),
        onFilter: onFilter("operator_name"),
      },
      {
        title: "DATE",
        dataIndex: "business_date",
        key: "business_date",
        render: renderCell,
        sorter: (a, b) => new Date(a.business_date) - new Date(b.business_date),
      },
      {
        title: "DOWNTIME START",
        dataIndex: "downtime_start",
        key: "downtime_start",
        render: renderCell,
        sorter: (a, b) =>
          new Date(a.downtime_start) - new Date(b.downtime_start),
      },
      {
        title: "DOWNTIME END",
        dataIndex: "downtime_end",
        key: "downtime_end",
        render: renderCell,
        sorter: (a, b) => new Date(a.downtime_end) - new Date(b.downtime_end),
      },
      {
        title: "REASON",
        dataIndex: "downtime_reason",
        key: "downtime_reason",
        render: renderCell,
        sorter: (a, b) => a.downtime_reason?.localeCompare(b.downtime_reason),
      },
    ],
    [isLoading, stationFilters, shiftFilters, operatorFilters, reasonFilters]
  );

  return (
    <Card
      title={title ?? "Downtime Records"}
      className="shadow-lg bg-slate-800 border-slate-700 text-white rounded-lg overflow-hidden"
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
            <span>Total Records: {pagination?.total || 0}</span>
            <span>Page: {pagination?.current || 1}</span>
            <span>Per Page: {pagination?.pageSize || 10}</span>
            <Button type="text" icon={<MoreVertical size={16} />} />
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
