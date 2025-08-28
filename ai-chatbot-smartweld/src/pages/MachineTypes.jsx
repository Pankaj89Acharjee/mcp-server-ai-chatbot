import React, { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Table, message, Popconfirm, Input } from "antd";
import { useStateContext } from "../contexts/ContextProvider";
import Loading from "../components/Loading";
import CustomerFilterDropDown from "../components/CustomerFilterDropDown";
import ReusableModal from "../components/ReusableModal";
import { earningData } from "../data/sidenavItems";
import { getAllLines } from "../apicalls/lineTypesCall";
import {
  deleteMachineType,
  getMachineTypesByOrgAndRole,
  saveNewMachineType,
  updateMachineTypes,
} from "../apicalls/machineType";
import machineTypesColumn, {
  enableEdit,
  enableDelete,
} from "../tablecolumns/machineTypesColDefinition";

// Constants
const CACHE_TIME = 300000; // 5 minutes
const VALIDATION_RULES = {
  MACHINE_TYPE_MAX_LENGTH: 50,
  DESCRIPTION_MAX_LENGTH: 200,
};

// Custom hooks for data fetching
const useMachineTypes = () => {
  return useQuery({
    queryKey: ["machineTypes"],
    queryFn: async () => {
      const response = await getMachineTypesByOrgAndRole();
      if (response.success) return response.data;
      throw new Error(response.message || "Failed to fetch machine types");
    },
    staleTime: CACHE_TIME,
    onError: (error) => {
      message.error(error.message);
    },
  });
};

const useLineTypes = () => {
  return useQuery({
    queryKey: ["lineTypes"],
    queryFn: async () => {
      const response = await getAllLines();
      if (response.success) return response.data;
      throw new Error(response.message || "Failed to fetch line types");
    },
    staleTime: CACHE_TIME,
    onError: (error) => {
      message.error(error.message);
    },
  });
};

// Form field configuration factory
const createMachineTypeFields = (lineTypes) => [
  [
    {
      type: "select",
      name: "lt_name",
      label: "Line",
      rules: [{ required: true, message: "Line is required" }],
      options:
        lineTypes?.map((line) => ({
          value: line.id,
          label: line.lt_name,
        })) || [],
      placeholder: "Select line name",
      colSpan: 24,
    },
  ],
  [
    {
      type: "input",
      name: "mt_name",
      label: "Machine Type",
      rules: [
        { required: true, message: "Machine type is required" },
        {
          max: VALIDATION_RULES.MACHINE_TYPE_MAX_LENGTH,
          message: `Maximum ${VALIDATION_RULES.MACHINE_TYPE_MAX_LENGTH} characters allowed`,
        },
        {
          pattern: /^[a-zA-Z0-9 _\-\/]+$/,
          message:
            "Machine type can only contain alphanumeric characters, spaces, hyphens, underscores and slashes",
        },
      ],
      placeholder: "Ex. SD11",
      colSpan: 24,
    },
  ],
  [
    {
      type: "input",
      name: "mt_description",
      label: "Description",
      rules: [
        {
          max: VALIDATION_RULES.DESCRIPTION_MAX_LENGTH,
          message: `Maximum ${VALIDATION_RULES.DESCRIPTION_MAX_LENGTH} characters allowed`,
        },
      ],
      placeholder: "Ex. Description of machine type",
      colSpan: 24,
    },
  ],
];

// Data transformation utility
const transformMachineTypeData = (machineTypes) => {
  if (!machineTypes?.length) return [];

  return machineTypes.map((data, index) => ({
    key: index.toString(),
    serial: (index + 1).toString(),
    id: data.id,
    line_type_id: data.line_type_id,
    loc_id: data.loc_id,
    loc_name: data.loc_name,
    lt_name: data.lt_name,
    mt_code: data.mt_code,
    mt_description: data.mt_description,
    created_on: data.created_on?.substring(0, 10),
    mt_name: data.mt_name,
    site_id: data.site_id,
    site_name: data.site_name,
  }));
};

// Main component
const MachineTypes = () => {
  const { currentColor } = useStateContext();
  const queryClient = useQueryClient();

  // State management
  const [modalState, setModalState] = useState({
    isAddModalOpen: false,
    isEditModalOpen: false,
  });
  const [selectedData, setSelectedData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Data fetching with TanStack Query
  const {
    data: machineTypes,
    isLoading: loadingMachineTypes,
    error: machineTypesError,
  } = useMachineTypes();

  const { data: lineTypes, isLoading: loadingLineTypes } = useLineTypes();

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (values) => {
      const payload = {
        line_type_id: values.lt_name,
        mt_name: values.mt_name,
        mt_description: values.mt_description,
      };
      const response = await saveNewMachineType(payload);
      if (response.success) return response.data;
      throw new Error(response.message || "Failed to create machine type");
    },
    onSuccess: () => {
      message.success("New machine type saved successfully");
      queryClient.invalidateQueries(["machineTypes"]);
      setModalState((prev) => ({ ...prev, isAddModalOpen: false }));
    },
    onError: (error) => {
      message.error(error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (values) => {
      const payload = {
        id: selectedData?.jobDetails.id,
        line_type_id: values.lt_name,
        mt_name: values.mt_name,
        mt_description: values.mt_description,
      };
      const response = await updateMachineTypes(payload);
      if (response.success) return response.data;
      throw new Error(response.message || "Failed to update machine type");
    },
    onSuccess: () => {
      message.success("Updated Successfully!");
      queryClient.invalidateQueries(["machineTypes"]);
      handleCloseEditModal();
    },
    onError: (error) => {
      message.error(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await deleteMachineType(payload);
      if (response.success) return response.data;
      throw new Error(response.message || "Failed to delete machine type");
    },
    onSuccess: () => {
      message.success("Successfully deleted");
      queryClient.invalidateQueries(["machineTypes"]);
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
    console.log("e", e, "record", record);
    const eventData = enableEdit(e, record);
    console.log("eventData", eventData);
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

  // Computed values
  const machineTypeFields = useMemo(
    () => createMachineTypeFields(lineTypes),
    [lineTypes]
  );

  const tableData = useMemo(
    () => transformMachineTypeData(machineTypes),
    [machineTypes]
  );

  const filteredData = useMemo(() => {
    if (!searchTerm) return tableData;

    return tableData.filter((item) =>
      item.mt_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [tableData, searchTerm]);

  const machineTypeFilters = useMemo(
    () =>
      machineTypes?.map((mcType) => ({
        text: mcType.mt_name,
        value: mcType.mt_name,
      })) || [],
    [machineTypes]
  );

  const tableColumns = useMemo(() => {
    return machineTypesColumn.map((col) => {
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
              <div
                key={record.id}
                className="flex gap-3 cursor-pointer justify-center items-center"
              >
                <div className="text-center justify-center items-center">
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
      lt_name: selectedData?.jobDetails?.line_type_id,
      mt_name: selectedData?.jobDetails?.mt_name,
      mt_description: selectedData?.jobDetails?.mt_description,
    }),
    [selectedData]
  );

  // Handle table row clicks
  const handleRowClick = useCallback(
    (record) => ({
      onClick: (e) => {
        const target = e.target;
        if (target.tagName.toLowerCase() === "span") {
          if (target.classList.contains("edit")) {
            enableEdit(e, record);
          } else if (target.classList.contains("delete")) {
            enableDelete(e, record);
          }
        }
      },
    }),
    []
  );

  // Loading state
  if (loadingMachineTypes || loadingLineTypes) {
    return <Loading message="Loading Machine Types" />;
  }

  // Error state
  if (machineTypesError) {
    return (
      <div className="mt-12 text-center">
        <h1 className="text-red-500">Error loading machine types</h1>
        <p>{machineTypesError.message}</p>
      </div>
    );
  }

  return (
    <div className="mt-12">
      <h1 className="text-left ml-8 font-semibold dark:text-gray-300">
        Machine Types
      </h1>

      {/* Summary Cards */}
      <div className="flex flex-wrap lg:flex-nowrap justify-center">
        <div className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg h-44 rounded-xl w-full lg:w-80 p-8 pt-9 m-3 bg-center">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-bold text-gray-400">Total Machine Types</p>
              <p className="text-2xl">{machineTypes?.length || 0}</p>
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
              onClick={handleOpenAddModal}
            >
              Add New Type
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
            placeholder="Search Machine Types"
            style={{ textAlign: "center" }}
            onChange={handleSearch}
          />
        </div>
      </div>

      {/* Add Machine Type Modal */}
      <ReusableModal
        title="Add New Machine Type"
        isOpen={modalState.isAddModalOpen}
        onClose={handleCloseAddModal}
        onSubmit={createMutation.mutate}
        initialValues={{}}
        fields={machineTypeFields}
        loading={createMutation.isLoading}
        currentColor={currentColor}
        className="text-center font-semibold"
      />

      {/* Edit Machine Type Modal */}
      <ReusableModal
        title="Edit Machine Type"
        isOpen={modalState.isEditModalOpen}
        onClose={handleCloseEditModal}
        onSubmit={updateMutation.mutate}
        initialValues={editInitialValues}
        fields={machineTypeFields}
        loading={updateMutation.isLoading}
        currentColor={currentColor}
        className="text-center font-semibold"
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
              tableLayout="auto"
              onRow={handleRowClick}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MachineTypes;
