import React, { useEffect, useState } from "react";
import { earningData } from "../data/sidenavItems";
import machineHardareColumn from "../tablecolumns/machineHardwareMapColDef";
import { Table, message, Popconfirm, Space, Input } from "antd";
import { useStateContext } from "../contexts/ContextProvider";
import Loading from "../components/Loading";
import CustomerFilterDropDown from "../components/CustomerFilterDropDown";
import { getMachines } from "../apicalls/machinesCall";
import {
  createHardwareMachinesMapping,
  deleteHardwareMachinesMapping,
  getHardwareMachinesMappedData,
  getHardwaresByOrg,
  updateHardwareMachinesMapping,
} from "../apicalls/hardwareMachineMap";
import ReusableModal from "../components/ReusableModal"; // Adjust the import path as needed

const HardwareMachineMapping = () => {
  const { currentColor } = useStateContext();

  // State variables
  const [mappedMacHard, setMappedMacHard] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filtereddata, setFiltereddata] = useState([]);
  const [machine, setMachine] = useState([]);
  const [hardwares, setHardwares] = useState([]);

  // Fetch mapped hardware-machine data
  const getHardMachMapData = async () => {
    try {
      setLoading(true);
      const fetchMac = await getHardwareMachinesMappedData();
      if (fetchMac.success === true) {
        setMappedMacHard(fetchMac.data);
      } else {
        message.error(fetchMac.message);
      }
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch available machines
  const fetchMachines = async () => {
    try {
      const fetchMachines = await getMachines();
      if (fetchMachines.success === true) {
        setMachine(fetchMachines.data);
      } else {
        message.error(fetchMachines.message);
      }
    } catch (error) {
      message.error(error.message);
    }
  };

  // Fetch available hardwares
  const fetchHardwares = async () => {
    try {
      setLoading(true);
      const fetchMacStatus = await getHardwaresByOrg();
      if (fetchMacStatus.success === true) {
        setHardwares(fetchMacStatus.data);
      } else {
        message.error(fetchMacStatus.message);
      }
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle edit button click
  const handleEditClick = (record) => {
    setSelectedData(record);
    setIsEditing(true);
  };

  // Close edit modal
  const closeEditModal = () => {
    setIsEditing(false);
    setSelectedData(null);
  };

  // Save new hardware-machine mapping
  const saveNewHardwareMachine = async (values) => {
    const payload = {
      hardware_id: values.hardware_id,
      machine_id: values.machine_id,
    };
    try {
      setSaved(true);
      const saveNewMachine = await createHardwareMachinesMapping(payload);
      if (saveNewMachine.success === true) {
        message.success("New machine and hardware mapped successfully");
        setIsCreating(false);
        getHardMachMapData();
      } else {
        message.error(saveNewMachine.message);
      }
    } catch (error) {
      message.error(error.message);
    } finally {
      setSaved(false);
    }
  };

  // Update existing hardware-machine mapping
  const updateMachine = async (values) => {
    const payload = {
      id: selectedData.id,
      hardware_id: values.hardware_id,
      machine_id: values.machine_id,
    };
    try {
      setLoading(true);
      const update = await updateHardwareMachinesMapping(payload);
      if (update.success === true) {
        message.success("Updated Successfully!");
        closeEditModal();
        getHardMachMapData();
      } else {
        message.error(update.message);
      }
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete hardware-machine mapping
  const deleteMachStatus = async (record) => {
    try {
      setLoading(true);
      const deleteStatus = await deleteHardwareMachinesMapping({
        id: record.id,
      });
      if (deleteStatus.success === true) {
        message.success("Successfully deleted");
        getHardMachMapData();
      } else {
        message.error(deleteStatus.message);
      }
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Cancel deletion
  const cancel = () => {
    message.error("Oh O! You were accidentally deleting data");
  };

  // Open create modal
  const enableInsertion = () => {
    setIsCreating(true);
  };

  // Close create modal
  const closeModal = () => {
    setIsCreating(false);
  };

  // Fetch data on component mount
  useEffect(() => {
    getHardMachMapData();
    fetchMachines();
    fetchHardwares();
  }, []);

  // Define reusable modal fields
  const getModalFields = (machines, hardwares) => [
    [
      {
        type: "select",
        name: "machine_id",
        label: "Machine Name",
        rules: [{ required: true, message: "Machine name is required" }],
        options: machines
          ? machines.map((m) => ({ value: m.id, label: m.mc_name }))
          : [],
        placeholder: "Select machine type",
        colSpan: 24,
      },
      {
        type: "select",
        name: "hardware_id",
        label: "Hardware Name",
        rules: [{ required: true, message: "Hardware name is required" }],
        options: hardwares
          ? hardwares.map((h) => ({ value: h.id, label: h.hw_name }))
          : [],
        placeholder: "Select hardware type",
        colSpan: 24,
      },
    ],
  ];

  // Table columns configuration
  const tableColumns = [...machineHardareColumn].map((col) => {
    if (col.key === "hw_name") {
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
              mappedMacHard
                ? mappedMacHard.map((mcType) => ({
                    text: mcType.hw_name,
                    value: mcType.hw_name,
                  }))
                : []
            }
          />
        ),
        onFilter: (value, record) => record.hw_name.includes(value),
        render: (_, record) => ({
          props: { style: { background: "#737B7C" } },
          children: (
            <div className="text-center">
              <h1 style={{ fontSize: "13px", color: "#CDD1D2" }}>
                {record.hw_name}
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

  // Table data source
  const data =
    mappedMacHard?.length > 0
      ? mappedMacHard.map((data, index) => ({
          key: index.toString(),
          serial: (index + 1).toString(),
          id: data.id,
          hw_name: data.hw_name,
          hardware_id: data.hardware_id,
          mc_name: data.mc_name,
          machine_id: data.machine_id,
          created_on: data.created_on.substring(0, 10),
        }))
      : [];

  return (
    <div className="mt-12">
      <h1 className="text-left ml-8 font-semibold dark:text-gray-300">
        Hardware Machine Mapping
      </h1>
      <div className="flex flex-wrap lg:flex-nowrap justify-center">
        {/* Top Hoarding Section */}
        <div className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg h-44 rounded-xl w-full lg:w-80 p-8 pt-9 m-3 bg-center">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-bold text-gray-400">Total Mapped</p>
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
              className={`text-md p-3 hover:drop-shadow-xl`}
              onClick={enableInsertion}
            >
              Start New Mapping
            </button>
          </div>
        </div>

        {/* Card Icons Section */}
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

      {/* Search Bar */}
      <div className="flex items-center justify-center mt-3 lg:mt-4 pl-2 pr-2 md:pl-3 md:pr-3 lg:pl-4 lg:pr-4">
        <div className="items-center justify-center w-64 md:w-72 lg:w-96">
          <Input.Search
            placeholder="Search Machine Status"
            style={{ textAlign: "center" }}
            onChange={(e) => {
              const searchTerm = e.target.value;
              setSearch(searchTerm);
              const filter = mappedMacHard.filter(
                (item) =>
                  item.mc_name
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                  item.hw_name.toLowerCase().includes(searchTerm.toLowerCase())
              );
              setFiltereddata(filter);
            }}
          />
        </div>
      </div>

      {/* Create Modal */}
      {isCreating && (
        <ReusableModal
          title="Add New Machine"
          isOpen={isCreating}
          onClose={closeModal}
          onSubmit={saveNewHardwareMachine}
          initialValues={{}}
          fields={getModalFields(machine, hardwares)}
          loading={saved}
          currentColor={currentColor}
        />
      )}

      {/* Edit Modal */}
      {isEditing && (
        <ReusableModal
          title="Edit Machine"
          isOpen={isEditing}
          onClose={closeEditModal}
          onSubmit={updateMachine}
          initialValues={{
            machine_id: selectedData?.machine_id,
            hardware_id: selectedData?.hardware_id,
          }}
          fields={getModalFields(machine, hardwares)}
          loading={loading}
          currentColor={currentColor}
        />
      )}

      {/* Table Section */}
      {loading ? (
        <Loading message="Loading!">Loader</Loading>
      ) : (
        <div className="bg-white dark:text-gray-200 dark:bg-main-dark-bg rounded-xl mt-3 lg:mt-6 flex md:flex-col items-center justify-center pt-3 pl-2 pr-2">
          <div className="items-center justify-center text-center w-72 md:w-[500px] lg:w-[950px] mb-3 rounded-xl">
            <div className="w-full text-sm">
              <Table
                style={{
                  backgroundColor: currentColor,
                  padding: "5px",
                  borderRadius: "10px",
                }}
                columns={tableColumns}
                dataSource={search ? filtereddata : data}
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
        </div>
      )}
    </div>
  );
};

export default HardwareMachineMapping;
