import React, { useEffect, useState } from "react";
import { earningData } from "../data/sidenavItems";
import locationListColumn, {
  enableDelete,
  enableEdit,
} from "../tablecolumns/locationListColDefinition";
import { Table, message, Popconfirm, Space, Input } from "antd";
import { useStateContext } from "../contexts/ContextProvider";
import Loading from "../components/Loading";
import CustomerFilterDropDown from "../components/CustomerFilterDropDown";
import {
  createLocation,
  deleteLocation,
  getLocation,
  updateLocation,
} from "../apicalls/locationAPICall";
import ReusableModal from "../components/ReusableModal";

const Location = () => {
  const { currentColor } = useStateContext();
  const [locationList, setLocationList] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activateBtn, setActivateBtn] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  const fetchAllLocation = async () => {
    try {
      setLoading(true);
      const fetchLocations = await getLocation();
      if (fetchLocations.success) {
        setLocationList(fetchLocations.data);
        setLoading(false);
      } else {
        setLoading(false);
        message.error("No locations found");
      }
    } catch (error) {
      setLoading(false);
      message.error(error.message);
    }
  };

  const handleEditClick = (e, record) => {
    setIsEditing(true);
    setSelectedJob({ jobDetails: record });
  };

  const closeEditModal = () => {
    setIsEditing(false);
    setSelectedJob(null);
  };

  const saveNewLocation = async (values) => {
    try {
      setLoading(true);
      const saveLoc = await createLocation(values);
      if (saveLoc.success) {
        setLoading(false);
        setActivateBtn(false);
        fetchAllLocation();
        message.success("Location created successfully");
      } else {
        message.info("Data not saved");
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      message.error(error.message);
    }
  };

  const updateExistingLocation = async (values) => {
    try {
      const payload = { id: selectedJob.jobDetails.locationId, ...values };
      const update = await updateLocation(payload);
      if (update.success) {
        message.success("Location updated successfully");
        setIsEditing(false);
        fetchAllLocation();
      }
    } catch (error) {
      message.error(error.message);
    }
  };

  const deleteLocationHandler = async (record) => {
    try {
      const payload = { id: record.locationId };
      const deleteLocData = await deleteLocation(payload);
      if (deleteLocData.success) {
        message.success("Location deleted successfully");
        fetchAllLocation();
      }
    } catch (error) {
      message.error(error.message);
    }
  };

  const enableInsertion = () => setActivateBtn(true);
  const closeModal = () => setActivateBtn(false);

  useEffect(() => {
    fetchAllLocation();
  }, []);

  const tableColumns = locationListColumn.map((col) => {
    if (col.key === "loc_name") {
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
              locationList?.map((loc) => ({
                text: loc.loc_name,
                value: loc.loc_name,
              })) || []
            }
          />
        ),
        onFilter: (value, record) => record.loc_name.includes(value),
        render: (_, record) => ({
          props: {
            style: { background: "#737B7C" },
          },
          children: (
            <div className="flex gap-3 cursor-pointer justify-center items-center">
              <div className="text-center justify-center items-center">
                <h1
                  style={{
                    fontSize: "13px",
                    textAlign: "center",
                    color: "#CDD1D2",
                  }}
                >
                  {record.loc_name}
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
          props: {
            style: { background: "#737B7C" },
          },
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
          props: {
            style: { background: "#737B7C" },
          },
          children: (
            <div className="flex gap-3 cursor-pointer justify-center items-center">
              <Popconfirm
                title="Are you sure to delete?"
                onConfirm={() => deleteLocationHandler(record)}
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
    locationList?.map((data, index) => ({
      key: index.toString(),
      serial: (index + 1).toString(),
      locationId: data.id,
      orgId: data.org_id,
      loc_name: data.loc_name,
      loc_description: data.loc_description,
      is_active: data.is_active ? "Active" : "Inactive",
      loc_code: data.loc_code,
    })) || [];

  const newLocationFields = [
    [
      {
        type: "input",
        name: "loc_name",
        label: "Name of Location",
        placeholder: "Ex. Amazon Forest",
        rules: [
          { required: true, message: "Please input the location name!" },
          { min: 3, message: "Location name must be at least 3 characters" },
          { max: 50, message: "Location name cannot exceed 50 characters" },
          {
            pattern: /^[a-zA-Z0-9\s]+$/,
            message: "Only letters, numbers, and spaces allowed",
          },
        ],
        colSpan: 24,
      },
      {
        type: "input",
        name: "loc_description",
        label: "Description",
        placeholder: "Ex. Bangalore",
        rules: [
          { required: true, message: "Please input the description!" },
          { min: 3, message: "Description must be at least 3 characters" },
          { max: 100, message: "Description cannot exceed 100 characters" },
        ],
        colSpan: 24,
      },
    ],
  ];

  const editLocationFields = [
    [
      {
        type: "input",
        name: "loc_name",
        label: "Name of Location",
        placeholder: "Ex. Amazon Forest",
        rules: [
          { required: true, message: "Please input the location name!" },
          { min: 3, message: "Location name must be at least 3 characters" },
          { max: 50, message: "Location name cannot exceed 50 characters" },
          {
            pattern: /^[a-zA-Z0-9\s]+$/,
            message: "Only letters, numbers, and spaces allowed",
          },
        ],
      },
      {
        type: "input",
        name: "loc_description",
        label: "Description",
        placeholder: "Ex. Bangalore",
        rules: [
          { required: true, message: "Please input the description!" },
          { min: 3, message: "Description must be at least 3 characters" },
          { max: 100, message: "Description cannot exceed 100 characters" },
        ],
      },
    ],
  ];

  return (
    <div className="mt-12">
      <h1 className="text-left ml-8 font-semibold dark:text-gray-300">
        Location List
      </h1>
      <div className="flex flex-wrap lg:flex-nowrap justify-center">
        <div className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg h-44 rounded-xl w-full lg:w-80 p-8 pt-9 m-3">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-bold text-gray-400">Total Locations</p>
              <p className="text-2xl">{locationList?.length || 0}</p>
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
              Add New Location
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

      <div className="flex items-center justify-center mt-3 lg:mt-4 pl-2 pr-2">
        <div className="items-center justify-center w-64 md:w-72 lg:w-96">
          <Input.Search
            placeholder="Search Location Name"
            onChange={(e) => {
              const searchTerm = e.target.value;
              setSearch(searchTerm);
              const filter = locationList.filter((item) =>
                item.loc_name.toLowerCase().includes(searchTerm.toLowerCase())
              );
              setFilteredData(filter);
            }}
          />
        </div>
      </div>

      <ReusableModal
        title="Add New Location"
        isOpen={activateBtn}
        onClose={closeModal}
        onSubmit={saveNewLocation}
        fields={newLocationFields}
        loading={loading}
        currentColor={currentColor}
      />

      <ReusableModal
        title="Edit Existing Location"
        isOpen={isEditing}
        onClose={closeEditModal}
        onSubmit={updateExistingLocation}
        initialValues={{
          loc_name: selectedJob?.jobDetails?.loc_name,
          loc_description: selectedJob?.jobDetails?.loc_description,
        }}
        fields={editLocationFields}
        loading={loading}
        currentColor={currentColor}
      />

      {loading ? (
        <Loading message="Loading!" />
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
              scroll={{ x: true }}
              bordered
              size="small"
              pagination={{
                defaultPageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: ["5", "10", "20", "50"],
              }}
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

export default Location;
