import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Table,
  Form,
  Input,
  Select,
  Button,
  Modal,
  DatePicker,
  Card,
  Layout,
  Typography,
  message,
} from "antd";
import api from "../apicalls";
import moment from "moment";

const { Option } = Select;
const { Content } = Layout;
const { Title } = Typography;

const PlannedDowntimeManagement = () => {
  const [form] = Form.useForm();
  const [searchParams, setSearchParams] = useState({});
  const [sorter, setSorter] = useState({});
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);

  // Hardcoded shifts (consider fetching from API in production)
  const shifts = [
    { shift_id: 13, shift_name: "A" },
    { shift_id: 14, shift_name: "B" },
    { shift_id: 15, shift_name: "C" },
  ];

  // Fetch stations for dropdown
  const { data: stations, isLoading: isStationsLoading } = useQuery({
    queryKey: ["stations"],
    queryFn: () => api.get("/downtime/stations").then((res) => res.data),
  });

  // Fetch planned downtimes with search, sort, and pagination parameters
  const {
    data: downtimes,
    isLoading: isDowntimesLoading,
    refetch,
  } = useQuery({
    queryKey: ["downtimes", searchParams, sorter, pagination],
    queryFn: () =>
      api
        .get("/downtime/planned/all", {
          params: {
            ...searchParams,
            ...sorter,
            page: pagination.current,
            pageSize: pagination.pageSize,
          },
        })
        .then((res) => res.data),
    keepPreviousData: true,
  });

  // Mutations for create and update
  const createMutation = useMutation({
    mutationFn: (data) => api.post("/downtime/planned/create", data),
    onSuccess: () => {
      refetch();
      setIsModalOpen(false);
      setCurrentRecord(null);
      message.success("Created successfully");
    },
    onError: (error) => {
      message.error(error.message || "Failed to create");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data) => api.put(`/downtime/planned/update/${data.id}`, data),
    onSuccess: () => {
      refetch();
      setIsModalOpen(false);
      setCurrentRecord(null);
      message.success("Updated successfully");
    },
    onError: (error) => {
      message.error(error.message || "Failed to update");
    },
  });

  const isSaving = createMutation.isLoading || updateMutation.isLoading;

  // Open modal for creating a new entry
  const handleCreate = () => {
    setCurrentRecord(null);
    setIsModalOpen(true);
  };

  // Open modal for updating an existing entry
  const handleUpdate = (record) => {
    setCurrentRecord(record);
    setIsModalOpen(true);
  };

  // Set form values when modal opens
  useEffect(() => {
    if (isModalOpen) {
      if (currentRecord) {
        form.setFieldsValue({
          machine_type_id: currentRecord.machine_type_id,
          shift_id: currentRecord.shift_id,
          from_time: moment(currentRecord.from_time, "HH:mm:ss"),
          to_time: moment(currentRecord.to_time, "HH:mm:ss"),
          dt_reason: currentRecord.dt_reason,
        });
      } else {
        form.resetFields();
      }
    }
  }, [isModalOpen, currentRecord, form]);

  // Column search props with enhanced filtering
  const getColumnSearchProps = (dataIndex) => {
    if (dataIndex === "from_time" || dataIndex === "to_time") {
      return {
        filterDropdown: ({
          setSelectedKeys,
          selectedKeys,
          confirm,
          clearFilters,
        }) => {
          const [start, end] = selectedKeys[0]
            ? selectedKeys[0].split("-")
            : ["", ""];
          return (
            <div style={{ padding: 8 }}>
              <DatePicker.TimePicker
                value={start ? moment(start, "HH:mm:ss") : null}
                onChange={(time) => {
                  const startStr = time ? time.format("HH:mm:ss") : "";
                  setSelectedKeys([`${startStr}-${end}`]);
                }}
                style={{ width: 188, marginBottom: 8, display: "block" }}
                placeholder="Start Time"
              />
              <DatePicker.TimePicker
                value={end ? moment(end, "HH:mm:ss") : null}
                onChange={(time) => {
                  const endStr = time ? time.format("HH:mm:ss") : "";
                  setSelectedKeys([`${start}-${endStr}`]);
                }}
                style={{ width: 188, marginBottom: 8, display: "block" }}
                placeholder="End Time"
              />
              <Button
                type="primary"
                onClick={() => confirm()}
                size="small"
                style={{ width: 90, marginRight: 8 }}
              >
                Search
              </Button>
              <Button
                onClick={() => clearFilters()}
                size="small"
                style={{ width: 90 }}
              >
                Reset
              </Button>
            </div>
          );
        },
      };
    }
    return {
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder={`Search ${dataIndex}`}
            value={selectedKeys[0]}
            onChange={(e) =>
              setSelectedKeys(e.target.value ? [e.target.value] : [])
            }
            onPressEnter={() => confirm()}
            style={{ width: 188, marginBottom: 8, display: "block" }}
          />
          <Button
            type="primary"
            onClick={() => confirm()}
            size="small"
            style={{ width: 90, marginRight: 8 }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters()}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
        </div>
      ),
    };
  };

  // Define table columns with search and sort
  const columns = [
    {
      title: "Machine Type",
      dataIndex: "machine_type_name",
      sorter: true,
      ...getColumnSearchProps("machine_type_name"),
      filteredValue: searchParams["machine_type_name"]
        ? [searchParams["machine_type_name"]]
        : null,
    },
    {
      title: "Shift",
      dataIndex: "shift_display_name",
      sorter: true,
      ...getColumnSearchProps("shift_display_name"),
      filteredValue: searchParams["shift_display_name"]
        ? [searchParams["shift_display_name"]]
        : null,
    },
    {
      title: "From Time",
      dataIndex: "from_time",
      sorter: true,
      ...getColumnSearchProps("from_time"),
      filteredValue: searchParams["from_time"]
        ? [searchParams["from_time"]]
        : null,
    },
    {
      title: "To Time",
      dataIndex: "to_time",
      sorter: true,
      ...getColumnSearchProps("to_time"),
      filteredValue: searchParams["to_time"] ? [searchParams["to_time"]] : null,
    },
    {
      title: "Reason",
      dataIndex: "dt_reason",
      sorter: true,
      ...getColumnSearchProps("dt_reason"),
      filteredValue: searchParams["dt_reason"]
        ? [searchParams["dt_reason"]]
        : null,
    },
    {
      title: "Action",
      render: (_, record) => (
        <Button onClick={() => handleUpdate(record)}>Edit</Button>
      ),
    },
  ];

  // Handle table changes (pagination, filters, sorting)
  const handleTableChange = (pagination, filters, sorter) => {
    const newSearchParams = {};
    Object.keys(filters).forEach((key) => {
      if (filters[key] && filters[key].length > 0) {
        newSearchParams[key] = filters[key][0];
      }
    });
    setSearchParams(newSearchParams);
    setSorter(
      sorter.field
        ? {
            sortField: sorter.field,
            sortOrder: sorter.order === "ascend" ? "ASC" : "DESC",
          }
        : {}
    );
    setPagination({
      current: pagination.current,
      pageSize: pagination.pageSize,
    });
  };

  return (
    <Layout className="min-h-[calc(100vh-4.5rem)] p-4 md:p-6">
      <Content>
        <Title level={2} className="text-white mb-6 text-3xl font-bold">
          Planned Downtime Management
        </Title>
        <Card
          className="dark-theme-card m-4"
          headStyle={{ color: "white", borderBottom: "1px solid #475569" }}
          extra={
            <Button
              onClick={handleCreate}
              disabled={isStationsLoading}
              className="!bg-slate-700"
            >
              Add New
            </Button>
          }
        >
          <Table
            columns={columns}
            dataSource={downtimes?.data}
            rowKey="id"
            onChange={handleTableChange}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: downtimes?.total,
              showSizeChanger: true,
            }}
            loading={isDowntimesLoading}
            className="dark-theme-table"
          />

          <Modal
            title={
              currentRecord
                ? "Update Planned Downtime"
                : "Create Planned Downtime"
            }
            className="dark-theme-modal"
            open={isModalOpen}
            onOk={async () => {
              try {
                const values = await form.validateFields();
                const formattedValues = {
                  ...values,
                  from_time: values.from_time.format("HH:mm:ss"),
                  to_time: values.to_time.format("HH:mm:ss"),
                };
                if (currentRecord) {
                  updateMutation.mutate({
                    id: currentRecord.id,
                    ...formattedValues,
                  });
                } else {
                  createMutation.mutate(formattedValues);
                }
              } catch (info) {
                console.log("Error:", info);
              }
            }}
            onCancel={() => {
              setIsModalOpen(false);
              setCurrentRecord(null);
              form.resetFields();
            }}
            okText="Save"
            cancelText="Cancel"
            okButtonProps={{ loading: isSaving }}
            cancelButtonProps={{ style: { color: "#000" } }}
          >
            <Form form={form} layout="vertical">
              <Form.Item
                name="machine_type_id"
                label="Machine Type"
                rules={[
                  { required: true, message: "Please select a machine type" },
                ]}
              >
                <Select loading={isStationsLoading} placeholder="Machine Type">
                  {stations?.data.map((st) => (
                    <Option key={st.machine_type_id} value={st.machine_type_id}>
                      {st.machine_type_name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                name="shift_id"
                label="Shift"
                rules={[{ required: true, message: "Please select a shift" }]}
              >
                <Select placeholder="Shift">
                  {shifts.map((sh) => (
                    <Option key={sh.shift_id} value={sh.shift_id}>
                      {sh.shift_name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                name="from_time"
                label="From Time"
                rules={[{ required: true, message: "Please select from time" }]}
              >
                <DatePicker.TimePicker format="HH:mm:ss" />
              </Form.Item>
              <Form.Item
                name="to_time"
                label="To Time"
                rules={[{ required: true, message: "Please select to time" }]}
              >
                <DatePicker.TimePicker format="HH:mm:ss" />
              </Form.Item>
              <Form.Item
                name="dt_reason"
                label="Reason"
                rules={[{ required: true, message: "Please enter a reason" }]}
              >
                <Input placeholder="Reason" />
              </Form.Item>
            </Form>
          </Modal>
        </Card>
      </Content>
    </Layout>
  );
};

export default PlannedDowntimeManagement;
