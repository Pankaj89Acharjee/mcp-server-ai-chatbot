import React, { useEffect, useState } from "react";
import { earningData } from "../data/sidenavItems";
import machineStatusColumn from "../tablecolumns/machineStatusColDefinition";
import { Table, message, Popconfirm, Space, Button, Input } from "antd";
import { useStateContext } from "../contexts/ContextProvider";
import Loading from "../components/Loading";
import CustomerFilterDropDown from "../components/CustomerFilterDropDown";
import {
  createMachineStatus,
  deleteMachineStatus,
  getMachineStatus,
  updateMachineStatus,
} from "../apicalls/machineStatusCall";
import ReusableModal from "../components/ReusableModal";

const MachineStatus = () => {
  const { currentColor } = useStateContext();
  const [machineStatus, setMachineStatus] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activateBtn, setActivateBtn] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  // Validation regex patterns
  const VALIDATIONS = {
    ms_name: {
      regex: /^[A-Za-z0-9-_]{3,20}$/,
      message:
        "Status must be 3-20 characters, alphanumeric with hyphen or underscore",
    },
    ms_description: {
      regex: /^[A-Za-z0-9\s-_.,]{5,100}$/,
      message:
        "Description must be 5-100 characters, alphanumeric with allowed special characters",
    },
  };

  // Form field configurations for ReusableModal
  const formFields = [
    [
      {
        type: "input",
        name: "ms_name",
        label: "Machine Status",
        placeholder: "Ex. SD11",
        rules: [
          { required: true, message: "Machine status is required" },
          {
            pattern: VALIDATIONS.ms_name.regex,
            message: VALIDATIONS.ms_name.message,
          },
          {
            validator: async (_, value) => {
              if (value && machineStatus) {
                const exists = machineStatus.some(
                  (item) => item.ms_name.toLowerCase() === value.toLowerCase()
                );
                if (exists && !isEditing) {
                  return Promise.reject("Status name already exists");
                }
              }
              return Promise.resolve();
            },
          },
        ],
        colSpan: 24,
      },
    ],
    [
      {
        type: "input",
        name: "ms_description",
        label: "Machine Description",
        placeholder: "Enter description",
        rules: [
          { required: true, message: "Description is required" },
          {
            pattern: VALIDATIONS.ms_description.regex,
            message: VALIDATIONS.ms_description.message,
          },
          { min: 5, message: "Description must be at least 5 characters" },
          { max: 100, message: "Description cannot exceed 100 characters" },
        ],
        colSpan: 24,
      },
    ],
    [
      {
        type: "switch",
        name: "is_active",
        label: "Active Status",
        checkedChildren: "Active",
        unCheckedChildren: "Inactive",
        colSpan: 24,
      },
    ],
  ];

  const fetchMachineStatus = async () => {
    try {
      setLoading(true);
      const fetchMacStatus = await getMachineStatus();
      if (fetchMacStatus.success) {
        setMachineStatus(fetchMacStatus.data);
      } else {
        message.error(fetchMacStatus.message);
      }
    } catch (error) {
      console.error("Error fetching machine status:", error);
      message.error("Failed to fetch machine status");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (record) => {
    setIsEditing(true);
    setSelectedData({
      jobDetails: {
        id: record.id,
        ms_name: record.ms_name,
        ms_description: record.ms_description,
        is_active: record.is_active,
      },
    });
  };

  const closeModal = () => {
    setActivateBtn(false);
    setIsEditing(false);
    setSelectedData(null);
  };

  const saveMachineStatus = async (values) => {
    try {
      setLoading(true);
      const response = await createMachineStatus(values);
      if (response.success) {
        message.success("Machine status created successfully");
        setActivateBtn(false);
        await fetchMachineStatus();
      } else {
        message.error(response.message);
      }
    } catch (error) {
      console.error("Error creating machine status:", error);
      message.error("Failed to create machine status");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (values) => {
    try {
      setLoading(true);
      const payload = {
        id: selectedData.jobDetails.id,
        ...values,
      };
      const response = await updateMachineStatus(payload);
      if (response.success) {
        message.success("Machine status updated successfully");
        closeModal();
        await fetchMachineStatus();
      } else {
        message.error(response.message);
      }
    } catch (error) {
      console.error("Error updating machine status:", error);
      message.error("Failed to update machine status");
    } finally {
      setLoading(false);
    }
  };

  const deleteMachStatus = async (record) => {
    try {
      setLoading(true);
      const response = await deleteMachineStatus({ id: record.id });
      if (response.success) {
        message.success("Machine status deleted successfully");
        await fetchMachineStatus();
      } else {
        message.error(response.message);
      }
    } catch (error) {
      console.error("Error deleting machine status:", error);
      message.error("Failed to delete machine status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMachineStatus();
  }, []);

  const tableColumns = machineStatusColumn.map((col) => {
    if (col.key === "ms_name") {
      return {
        ...col,
        filterDropdown: ({
          setSelectedKeys,
          selectedKeys,
          confirm,
          clearFilters,
        }) => (
          <CustomerFilterDropDown
            setSelectedKeys={setSelectedKeys}
            selectedKeys={selectedKeys}
            confirm={confirm}
            clearFilters={clearFilters}
            dataIndex={col.dataIndex}
            jobNames={
              machineStatus?.map((mcType) => ({
                text: mcType.ms_name,
                value: mcType.ms_name,
              })) || []
            }
          />
        ),
        onFilter: (value, record) => record.ms_name.includes(value),
        render: (_, record) => ({
          props: { style: { background: "#737B7C" } },
          children: (
            <div className="flex gap-3 cursor-pointer justify-center items-center">
              <h1
                style={{
                  fontSize: "13px",
                  textAlign: "center",
                  color: "#CDD1D2",
                }}
              >
                {record.ms_name}
              </h1>
            </div>
          ),
        }),
      };
    }
    if (col.key === "edit") {
      return {
        ...col,
        render: (_, record) => ({
          props: { style: { background: "#737B7C" } },
          children: (
            <div className="flex gap-3 cursor-pointer justify-center items-center">
              <i
                onClick={() => handleEditClick(record)}
                className="edit text-md"
                style={{ color: currentColor }}
              >
                <span className="material-symbols-outlined">edit</span>
              </i>
            </div>
          ),
        }),
      };
    }
    if (col.key === "delete") {
      return {
        ...col,
        render: (_, record) => ({
          props: { style: { background: "#737B7C" } },
          children: (
            <div className="flex gap-3 cursor-pointer justify-center items-center">
              <Popconfirm
                title="Are you sure to delete?"
                onConfirm={() => deleteMachStatus(record)}
                onCancel={() => message.info("Deletion cancelled")}
                okText="Sure"
                cancelText="Cancel"
                overlayClassName="custom-popconfirm"
              >
                <i className="delete">
                  <span
                    className="material-symbols-outlined text-xl font-bold"
                    style={{ color: currentColor }}
                  >
                    delete
                  </span>
                </i>
              </Popconfirm>
            </div>
          ),
        }),
      };
    }
    return col;
  });

  const data =
    machineStatus?.map((data, index) => ({
      key: index.toString(),
      serial: (index + 1).toString(),
      id: data.id,
      is_active: data.is_active,
      ms_description: data.ms_description,
      ms_name: data.ms_name,
    })) || [];

  return (
    <div className="mt-12">
      <h1 className="text-left ml-8 font-semibold dark:text-gray-300">
        Machine Status
      </h1>
      <div className="flex flex-wrap lg:flex-nowrap justify-center">
        <div className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg h-44 rounded-xl w-full lg:w-80 p-8 pt-9 m-3 bg-center">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-bold text-gray-400">Total Machine Types</p>
              <p className="text-2xl">{machineStatus?.length || 0}</p>
            </div>
          </div>
          <div className="mt-6">
            <button
              type="button"
              style={{
                backgroundColor: currentColor,
                color: "white",
                borderRadius: "10px",
              }}
              className={`text-md p-3 hover:drop-shadow-xl`}
              onClick={() => setActivateBtn(true)}
            >
              Add New Status
            </button>
          </div>
        </div>
        <div className="flex flex-wrap mt-3 justify-center gap-1 items-center">
          {earningData.map((item) => (
            <div
              key={item.title}
              className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg md:w-56 p-4 pt-9 rounded-2xl"
            >
              <button
                style={{ backgroundColor: item.iconColor }}
                className="text-2xl opacity-0.9 rounded-full p-4 hover:drop-shadow-xl"
              />
              <p className="mt-3">
                <span className="text-lg font-semibold">{item.amount}</span>
              </p>
              <p className="text-sm text-gray-400 mt-1">{item.title}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-center mt-3 lg:mt-4 pl-2 pr-2 md:pl-3 md:pr-3 lg:pl-4 lg:pr-4">
        <div className="items-center justify-center w-64 md:w-72 lg:w-96">
          <Input.Search
            placeholder="Search Machine Status"
            onChange={(e) => {
              const searchTerm = e.target.value;
              setSearch(searchTerm);
              const filtered =
                machineStatus?.filter((item) =>
                  item.ms_name.toLowerCase().includes(searchTerm.toLowerCase())
                ) || [];
              setFilteredData(filtered);
            }}
          />
        </div>
      </div>
      <ReusableModal
        title={isEditing ? "Edit Machine Status" : "Add New Machine Status"}
        isOpen={activateBtn || isEditing}
        onClose={closeModal}
        onSubmit={isEditing ? updateStatus : saveMachineStatus}
        initialValues={
          isEditing
            ? {
                ms_name: selectedData?.jobDetails?.ms_name,
                ms_description: selectedData?.jobDetails?.ms_description,
                is_active: selectedData?.jobDetails?.is_active,
              }
            : {}
        }
        fields={formFields}
        loading={loading}
        currentColor={currentColor}
      />
      {loading ? (
        <Loading message="Loading!">Loader</Loading>
      ) : (
        <div className="bg-white dark:text-gray-200 dark:bg-main-dark-bg rounded-xl mt-3 lg:mt-6 flex md:flex-col items-center justify-center pt-3 pl-2 pr-2">
          <div className="items-center justify-center text-center w-72 md:w-[500px] lg:w-[950px] mb-3 rounded-xl">
            <Table
              style={{
                backgroundColor: currentColor,
                padding: "5px",
                borderRadius: "10px",
              }}
              columns={tableColumns}
              dataSource={search ? filteredData : data}
              className="uppercase text-center items-center justify-center mr-6"
              scroll={{ x: true }}
              bordered
              size="small"
              pagination={{
                className: "pagination",
                defaultPageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: ["5", "10", "20", "50"],
              }}
              responsive
              tableLayout="primary"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MachineStatus;
