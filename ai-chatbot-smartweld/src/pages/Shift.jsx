import React, { useEffect, useState } from "react";
import { earningData } from "../data/sidenavItems";
import shiftListColumn, {
  enableEdit,
  enableDelete,
} from "../tablecolumns/shiftListColDefinition";
import { Table, message, Popconfirm, Space, Input, Button } from "antd";
import { useStateContext } from "../contexts/ContextProvider";
import Loading from "../components/Loading";
import CustomerFilterDropDown from "../components/CustomerFilterDropDown";
import {
  createNewShiftData,
  DeleteShiftData,
  getAllShiftsList,
  updateShiftData,
} from "../apicalls/shiftAPICall";
import dayjs from "dayjs";
import ReusableModal from "../components/ReusableModal"; // Adjust the import path as needed

const shiftFormFields = [
  [
    {
      type: "input",
      name: "shift_name",
      label: "Shift Name",
      rules: [
        { required: true, message: "Please input the shift name!" },
        {
          pattern: /^[a-zA-Z0-9 ]+$/,
          message: "Shift name can only include letters, numbers, and spaces.",
        },
      ],
      placeholder: "Ex. Morning Shift",
      colSpan: 12,
    },
    {
      type: "input",
      name: "shift_description",
      label: "Description",
      rules: [
        { required: true, message: "Please input the shift description!" },
        {
          min: 5,
          message: "Description must be at least 5 characters long.",
        },
      ],
      placeholder: "Ex. Shift from 9 AM to 5 PM",
      colSpan: 12,
    },
  ],
  [
    {
      type: "time",
      name: "shift_start_time",
      label: "Start Time",
      rules: [{ required: true, message: "Please select the start time!" }],
      format: "h:mm A",
      colSpan: 12,
    },
    {
      type: "time",
      name: "shift_end_time",
      label: "End Time",
      rules: [
        { required: true, message: "Please select the end time!" },
        ({ getFieldValue }) => ({
          validator(_, value) {
            if (!value || getFieldValue("shift_start_time") < value) {
              return Promise.resolve();
            }
            return Promise.reject(
              new Error("End time must be after start time!")
            );
          },
        }),
      ],
      format: "h:mm A",
      colSpan: 12,
    },
  ],
  [
    {
      type: "number",
      name: "break_duration",
      label: "Break Duration (minutes)",
      rules: [
        { required: true, message: "Please input the break duration!" },
        {
          type: "number",
          min: 0,
          max: 120,
          message: "Break duration must be between 0 and 120 minutes.",
        },
      ],
      placeholder: "Ex. 30",
      colSpan: 24,
    },
  ],
];

const Shift = () => {
  const { currentColor } = useStateContext();

  const [shiftList, setShiftList] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("add"); // "add" or "edit"
  const [selectedShift, setSelectedShift] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  const fetchAllShifts = async () => {
    try {
      setLoading(true);
      const fetchShifts = await getAllShiftsList();
      if (fetchShifts.success === true) {
        setShiftList(fetchShifts.data);
        setLoading(false);
      } else {
        setLoading(false);
        message.error("Found no shifts");
      }
    } catch (error) {
      setLoading(false);
      message.error(error.message);
    }
  };

  const enableInsertion = () => {
    setModalType("add");
    setSelectedShift(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (e, shift) => {
    setSelectedShift(shift);
    setModalType("edit");
    setIsModalOpen(true);
  };

  const onSubmit = async (values) => {
    try {
      setLoading(true);
      const formattedValues = {
        ...values,
        shift_start_time: values.shift_start_time.format("HH:mm:ss"),
        shift_end_time: values.shift_end_time.format("HH:mm:ss"),
      };

      if (modalType === "add") {
        await createNewShiftData(formattedValues);
        message.success("Shift created successfully");
      } else if (modalType === "edit") {
        await updateShiftData({
          id: selectedShift.shiftId,
          ...formattedValues,
        });
        message.success("Shift updated successfully");
      }
      setIsModalOpen(false);
      fetchAllShifts();
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteShiftHandler = async (payload) => {
    try {
      const payloadForDelete = { id: payload.shiftId };
      const deleteShiftData = await DeleteShiftData(payloadForDelete);
      if (deleteShiftData.success === true) {
        message.success("Shift deleted successfully");
        fetchAllShifts();
      }
    } catch (error) {
      message.error(error.message);
    }
  };

  const cancel = () => {
    message.error("Oh O! You were accidentally deleting data");
  };

  useEffect(() => {
    fetchAllShifts();
  }, []);

  const tableColumns = shiftListColumn.map((col) => {
    if (col.key === "shift_name") {
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
              shiftList?.map((shift) => ({
                text: shift.shift_name,
                value: shift.shift_name,
              })) || []
            }
          />
        ),
        onFilter: (value, record) => record.shift_name.includes(value),
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
                {record.shift_name}
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
                onClick={(e) => handleEditClick(e, record)}
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
                onConfirm={() => deleteShiftHandler(record)}
                onCancel={cancel}
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
    shiftList?.length > 0
      ? shiftList.map((data, index) => ({
          key: index.toString(),
          serial: (index + 1).toString(),
          shiftId: data.id,
          orgId: data.org_id,
          break_duration: Number(data.break_duration),
          shift_name: data.shift_name,
          shift_start_time: data.shift_start_time,
          shift_end_time: data.shift_end_time,
          shift_description: data.shift_description,
        }))
      : [];

  return (
    <div className="mt-12">
      <h1 className="text-left ml-8 font-semibold dark:text-gray-300">
        Shift List
      </h1>
      <div className="flex flex-wrap lg:flex-nowrap justify-center">
        <div className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg h-44 rounded-xl w-full lg:w-80 p-8 pt-9 m-3 bg-center">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-bold text-gray-400">Total Shifts</p>
              <p className="text-2xl">250</p>
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
              className="text-md p-3 hover:drop-shadow-xl"
              onClick={enableInsertion}
            >
              Add New Shift
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
            placeholder="Search Shift Name"
            onChange={(e) => {
              const searchTerm = e.target.value;
              setSearch(searchTerm);
              const filter = shiftList.filter((item) =>
                item.shift_name.toLowerCase().includes(searchTerm.toLowerCase())
              );
              setFilteredData(filter);
            }}
          />
        </div>
      </div>

      <ReusableModal
        key={
          modalType === "edit" && selectedShift ? selectedShift.shiftId : "add"
        }
        title={modalType === "add" ? "Add New Shift" : "Edit Shift"}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={onSubmit}
        initialValues={
          modalType === "edit" && selectedShift
            ? {
                shift_name: selectedShift.shift_name,
                shift_description: selectedShift.shift_description,
                shift_start_time: dayjs(
                  selectedShift.shift_start_time,
                  "HH:mm:ss"
                ),
                shift_end_time: dayjs(selectedShift.shift_end_time, "HH:mm:ss"),
                break_duration: selectedShift.break_duration,
              }
            : {}
        }
        fields={shiftFormFields}
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
              onRow={(record) => ({
                onClick: (e) => {
                  const target = e.target;
                  // {console.log("Value of target on clicking", target)}
                  if (target.tagName.toLowerCase() === "span") {
                    if (target.classList.contains("edit")) {
                      enableEdit(e, record);
                    } else if (target.classList.contains("delete")) {
                      enableDelete(e, record);
                    }
                  }
                },
              })}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Shift;
