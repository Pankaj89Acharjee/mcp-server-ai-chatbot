import React, { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Table, message, Popconfirm, Input } from "antd";
import { useStateContext } from "../contexts/ContextProvider";
import Loading from "../components/Loading";
import CustomerFilterDropDown from "../components/CustomerFilterDropDown";
import ReusableModal from "../components/ReusableModal";
import { earningData } from "../data/sidenavItems";
import { getMachineStatus } from "../apicalls/machineStatusCall";
import { getMachineTypesByOrgAndRole } from "../apicalls/machineType";
import {
  createMachines,
  deleteMachines,
  getMachines,
  updateMachines,
} from "../apicalls/machinesCall";
import machinesColumn, {
  enableEdit,
} from "../tablecolumns/machinesColDefinition";

// Constants
const CACHE_TIME = 300000; // 5 minutes
const VALIDATION_PATTERNS = {
  machineName: /^[a-zA-Z0-9 _\-\/]+$/,
  serialNumber: /^[a-zA-Z0-9_-]+$/,
};

// Form field configuration factory
const createMachineFields = (machineTypes, machineStatus) => [
  [
    {
      name: "mc_name",
      label: "Machine Name",
      type: "input",
      rules: [
        { required: true, message: "Machine name is required" },
        { min: 3, message: "Machine name must be at least 3 characters" },
        { max: 50, message: "Machine name cannot exceed 50 characters" },
        {
          pattern: VALIDATION_PATTERNS.machineName,
          message:
            "Machine name can only contain alphanumeric characters, spaces, hyphens, underscores and slashes",
        },
      ],
      placeholder: "Ex. SD11",
    },
    {
      name: "machine_type_id",
      label: "Machine Type",
      type: "select",
      rules: [{ required: true, message: "Machine type is required" }],
      options:
        machineTypes?.map((mt) => ({
          value: mt.id,
          label: mt.mt_name,
        })) || [],
      placeholder: "Select machine type",
    },
  ],
  [
    {
      name: "mc_serial_no",
      label: "Machine Serial No",
      type: "input",
      rules: [
        { required: true, message: "Machine serial number is required" },
        { min: 6, message: "Serial number must be at least 6 characters" },
        { max: 10, message: "Serial number cannot exceed 10 characters" },
        {
          pattern: VALIDATION_PATTERNS.serialNumber,
          message:
            "Serial number can only contain alphanumeric characters, hyphens and underscores",
        },
      ],
      placeholder: "Ex. A25482",
    },
    {
      name: "machine_status_id",
      label: "Machine Status",
      type: "select",
      rules: [{ required: true, message: "Machine status is required" }],
      options:
        machineStatus?.map((ms) => ({
          value: ms.id,
          label: ms.ms_name,
        })) || [],
      placeholder: "Select machine status",
    },
  ],
  [
    {
      name: "mc_description",
      label: "Description",
      type: "input",
      rules: [
        { max: 500, message: "Description cannot exceed 500 characters" },
      ],
      placeholder: "Ex. Machine description",
    },
    {
      name: "rpm_multiply_factor",
      label: "RPM Multiply Factor",
      type: "number",
      rules: [{ required: true, message: "RPM Multiply Factor is required" }],
      placeholder: "Ex. 125",
      precision: 2,
    },
  ],
  [
    {
      name: "heat_shrink_temp",
      label: "Heat Sink Temp",
      type: "number",
      rules: [{ required: true, message: "Heat Sink Temp is required" }],
      placeholder: "Ex. Heat Sink Temp",
      precision: 2,
    },
    {
      name: "ambience_temp",
      label: "Ambience Temp",
      type: "number",
      rules: [{ required: true, message: "Ambience Temp is required" }],
      placeholder: "Ex. Ambience Temp",
      precision: 2,
    },
  ],
  [
    {
      name: "hs_thresold_temp",
      label: "HS Threshold Temp",
      type: "number",
      rules: [{ required: true, message: "HS Threshold Temp is required" }],
      placeholder: "Ex. HS Threshold Temp",
      precision: 2,
    },
    {
      name: "amb_thresold_temp",
      label: "Amb Threshold Temp",
      type: "number",
      rules: [{ required: true, message: "Amb Threshold Temp is required" }],
      placeholder: "Ex. Amb Threshold Temp",
      precision: 2,
    },
  ],
  [
    {
      name: "notify",
      label: "Notify for mail alert",
      type: "switch",
      checkedChildren: "Req",
      unCheckedChildren: "Not Req",
    },
  ],
];

// Table data transformation
const transformMachineData = (machines) => {
  if (!machines) return [];

  console.log("machines", machines);

  return machines.map((data, index) => ({
    key: index.toString(),
    serial: (index + 1).toString(),
    id: data.id,
    mc_name: data.mc_name,
    mc_serial_no: data.mc_serial_no,
    mt_name: data.mt_name,
    ms_name: data.ms_name,
    loc_name: data.loc_name,
    site_name: data.site_name,
    lt_name: data.lt_name,
    mc_description: data.mc_description,
    amb_thresold_temp: data.amb_thresold_temp,
    ambience_temp: data.ambience_temp,
    heat_shrink_temp: data.heat_shrink_temp,
    hs_thresold_temp: data.hs_thresold_temp,
    rpm_multiply_factor: data.rpm_multiply_factor,
    machine_status_id: data.machine_status_id,
    notify: data.notify,
    machine_type_id: data.machine_type_id,
  }));
};

// Main component
const MachinesPage = () => {
  const { currentColor } = useStateContext();
  const queryClient = useQueryClient();

  // State management
  const [modalState, setModalState] = useState({
    isAddModalOpen: false,
    isEditModalOpen: false,
  });
  const [selectedData, setSelectedData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Data fetching
  const { data: machines, isLoading: loadingMachines } = useQuery({
    queryKey: ["machines"],
    queryFn: async () => {
      const response = await getMachines();
      if (response.success) return response.data;
      throw new Error(response.message);
    },
    onError: (error) => {
      message.error(error.message);
    },
  });

  const { data: machineTypes, isLoading: isLoadingMachineTypes } = useQuery({
    queryKey: ["machineTypes"],
    queryFn: async () => {
      const response = await getMachineTypesByOrgAndRole();
      if (response.success) return response.data;
      throw new Error(response.message);
    },
    staleTime: CACHE_TIME,
  });

  const { data: machineStatus } = useQuery({
    queryKey: ["machineStatus"],
    queryFn: async () => {
      const response = await getMachineStatus();
      if (response.success) return response.data;
      throw new Error(response.message);
    },
    staleTime: CACHE_TIME,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: createMachines,
    onSuccess: () => {
      message.success("New machine saved successfully");
      queryClient.invalidateQueries(["machines"]);
      setModalState((prev) => ({ ...prev, isAddModalOpen: false }));
    },
    onError: (error) => {
      message.error(error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateMachines,
    onSuccess: () => {
      message.success("Updated Successfully!");
      handleCloseEditModal();
      queryClient.invalidateQueries(["machines"]);
    },
    onError: (error) => {
      message.error(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMachines,
    onSuccess: () => {
      message.success("Successfully deleted");
      queryClient.invalidateQueries(["machines"]);
    },
    onError: (error) => {
      message.error(error.message);
    },
  });

  // Event handlers
  const handleOpenAddModal = useCallback(() => {
    setModalState((prev) => ({ ...prev, isAddModalOpen: true }));
  }, []);

  const handleCloseAddModal = useCallback(() => {
    setModalState((prev) => ({ ...prev, isAddModalOpen: false }));
  }, []);

  const handleEditClick = useCallback((e, record) => {
    const eventData = enableEdit(e, record);
    setSelectedData(eventData);
    setModalState((prev) => ({ ...prev, isEditModalOpen: true }));
  }, []);

  const handleCloseEditModal = useCallback(() => {
    setModalState((prev) => ({ ...prev, isEditModalOpen: false }));
    setSelectedData(null);
  }, []);

  const handleDelete = useCallback(
    (record) => {
      deleteMutation.mutate(record);
    },
    [deleteMutation]
  );

  const handleDeleteCancel = useCallback(() => {
    message.error("Delete cancelled");
  }, []);

  const handleSearch = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleUpdateSubmit = useCallback(
    (values) => {
      updateMutation.mutate({
        id: selectedData?.jobDetails.id,
        ...values,
      });
    },
    [updateMutation, selectedData]
  );

  // Computed values
  const machineFields = useMemo(
    () => createMachineFields(machineTypes, machineStatus),
    [machineTypes, machineStatus]
  );

  const tableData = useMemo(() => transformMachineData(machines), [machines]);

  const filteredData = useMemo(() => {
    if (!searchTerm) return tableData;

    return tableData.filter(
      (item) =>
        item.mc_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.mt_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [tableData, searchTerm]);

  const machineTypeFilters = useMemo(
    () =>
      machines?.map((machine) => ({
        text: machine.mt_name,
        value: machine.mt_name,
      })) || [],
    [machines]
  );

  const tableColumns = useMemo(() => {
    return machinesColumn.map((col) => {
      if (col.key === "mt_name") {
        return {
          ...col,
          filterDropdown: (props) => (
            <CustomerFilterDropDown
              {...props}
              dataIndex={col.dataIndex}
              jobNames={machineTypeFilters}
            />
          ),
          onFilter: (value, record) => record.mt_name.includes(value),
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
                  {record.mt_name}
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
                  onConfirm={() => handleDelete(record)}
                  onCancel={handleDeleteCancel}
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
  }, [
    currentColor,
    machineTypeFilters,
    handleEditClick,
    handleDelete,
    handleDeleteCancel,
  ]);

  const editInitialValues = useMemo(
    () => ({
      mc_name: selectedData?.jobDetails?.mc_name,
      machine_type_id: selectedData?.jobDetails?.machine_type_id,
      mc_serial_no: selectedData?.jobDetails?.mc_serial_no,
      machine_status_id: selectedData?.jobDetails?.machine_status_id,
      mc_description: selectedData?.jobDetails?.mc_description,
      rpm_multiply_factor: selectedData?.jobDetails?.rpm_multiply_factor,
      heat_shrink_temp: selectedData?.jobDetails?.heat_shrink_temp,
      ambience_temp: selectedData?.jobDetails?.ambience_temp,
      hs_thresold_temp: selectedData?.jobDetails?.hs_thresold_temp,
      amb_thresold_temp: selectedData?.jobDetails?.amb_thresold_temp,
      notify: selectedData?.jobDetails?.notify,
    }),
    [selectedData]
  );

  if (loadingMachines) {
    return <Loading message="Loading Machines" />;
  }

  return (
    <div className="mt-12">
      <h1 className="text-left ml-8 font-semibold dark:text-gray-300">
        Machines
      </h1>

      {/* Summary Cards */}
      <div className="flex flex-wrap lg:flex-nowrap justify-center">
        <div className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg h-44 rounded-xl w-full lg:w-80 p-8 pt-9 m-3 bg-center">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-bold text-gray-400">Total Machines</p>
              <p className="text-2xl">{machines?.length || 0}</p>
            </div>
          </div>
          <div className="mt-6">
            <button
              type="button"
              style={{
                backgroundColor: isLoadingMachineTypes
                  ? "#737B7C"
                  : currentColor,
                color: "white",
                borderRadius: "10px",
              }}
              className="text-md p-3 hover:drop-shadow-xl disabled:cursor-not-allowed"
              onClick={handleOpenAddModal}
              disabled={isLoadingMachineTypes}
            >
              Add New Machine
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

      {/* Search */}
      <div className="flex items-center justify-center mt-3 lg:mt-4 pl-2 pr-2 md:pl-3 md:pr-3 lg:pl-4 lg:pr-4">
        <div className="items-center justify-center w-64 md:w-72 lg:w-96">
          <Input.Search
            placeholder="Search Machines"
            style={{ textAlign: "center" }}
            onChange={handleSearch}
          />
        </div>
      </div>

      {/* Add Machine Modal */}
      <ReusableModal
        title="Add New Machine"
        isOpen={modalState.isAddModalOpen}
        onClose={handleCloseAddModal}
        onSubmit={createMutation.mutate}
        initialValues={{ notify: false }}
        fields={machineFields}
        loading={createMutation.isLoading}
        currentColor={currentColor}
      />

      {/* Edit Machine Modal */}
      <ReusableModal
        title="Edit Machine"
        isOpen={modalState.isEditModalOpen}
        onClose={handleCloseEditModal}
        onSubmit={handleUpdateSubmit}
        initialValues={editInitialValues}
        fields={machineFields}
        loading={updateMutation.isLoading}
        currentColor={currentColor}
      />

      {/* Data Table */}
      <div className="bg-white dark:text-gray-200 dark:bg-main-dark-bg rounded-xl mt-3 lg:mt-6 flex md:flex-col items-center justify-center pt-3 pl-2 pr-2">
        <div className="items-center justify-center text-center w-72 md:w-[500px] lg:[w-700px] xl:w-[950px] mb-3 rounded-xl">
          <div className="w-full text-sm">
            <Table
              style={{
                backgroundColor: currentColor,
                padding: "5px",
                borderRadius: "10px",
              }}
              columns={tableColumns}
              dataSource={filteredData}
              className="uppercase text-center items-center justify-center mr-6"
              scroll={{ x: 1600, y: 400 }}
              bordered
              size="small"
              pagination={{
                className: "pagination",
                defaultPageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: ["5", "10", "20", "50"],
              }}
              responsive
              tableLayout="auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MachinesPage;
