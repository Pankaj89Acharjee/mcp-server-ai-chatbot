import React, { useEffect, useState } from "react";
import { earningData } from "../data/sidenavItems";
import lineListColumn, {
  enableEdit,
  enableDelete,
} from "../tablecolumns/lineListColDefinition";
import { Table, message, Popconfirm, Space, Input } from "antd";
import { useStateContext } from "../contexts/ContextProvider";
import Loading from "../components/Loading";
import CustomerFilterDropDown from "../components/CustomerFilterDropDown";
import { getLocation } from "../apicalls/locationAPICall";
import { getSites } from "../apicalls/siteAPICall";
import {
  createLineType,
  deleteLineType,
  getAllLines,
  updateLineType,
} from "../apicalls/lineTypesCall";
import ReusableModal from "../components/ReusableModal"; // Adjust the import path as needed

const Line = () => {
  const { currentColor } = useStateContext();

  const [siteList, setSiteList] = useState(null);
  const [filteredSitesForAdd, setFilteredSitesForAdd] = useState([]);
  const [filteredSitesForEdit, setFilteredSitesForEdit] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [activateBtn, setActivateBtn] = useState(false);
  const [activateEditing, setActivateEditing] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [locationList, setLocationList] = useState(null);
  const [lineList, setLineList] = useState(null);
  const [fetched, setFetched] = useState(false);

  // Fetch initial data
  const fetchLocationSiteAndLine = async (force = false) => {
    try {
      if (!fetched || force) {
        setLoading(true);
        const fetchLocations = await getLocation();
        setLocationList(fetchLocations.data);
        const fetchSites = await getSites();
        setSiteList(fetchSites.data);
        const fetchLine = await getAllLines();
        setLineList(fetchLine.data);
        setLoading(false);
        setFetched(true);
      }
    } catch (error) {
      setLoading(false);
      message.error(error.message);
    }
  };

  // Handle edit click
  const handleEditClick = (job) => {
    console.log("Job", job);
    setSelectedJob(job);
    setIsEditing(true);
    setActivateEditing(true);
  };

  // Close edit modal
  const closeEditModal = () => {
    setIsEditing(false);
    setActivateEditing(false);
    setSelectedJob(null);
  };

  // Save new line
  const saveNewLine = async (values) => {
    try {
      const payload = {
        loc_id: values.loc_name,
        site_id: values.site_name,
        lt_description: values.lt_description,
        lt_name: values.lt_name,
      };
      setLoading(true);
      const saveLoc = await createLineType(payload);
      if (saveLoc.success) {
        setLoading(false);
        setActivateBtn(false);
        await fetchLocationSiteAndLine(true);
        message.success("Line added successfully");
      } else {
        message.info("Data not saved");
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      message.error(error.message);
    }
  };

  // Update existing line
  const updateExistingLine = async (values) => {
    try {
      const payload = {
        id: selectedJob.lineTypeId,
        loc_id: values.loc_name,
        site_id: values.site_name,
        lt_name: values.lt_name,
        lt_description: values.lt_description,
      };
      setLoading(true);
      const update = await updateLineType(payload);
      if (update.success) {
        message.success("Line updated successfully");
        setIsEditing(false);
        setActivateEditing(false);
        await fetchLocationSiteAndLine(true);
      }
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete line
  const deleteLineHandler = async (payload) => {
    try {
      const deletePayload = { ...payload, id: payload.lineTypeId };
      const deleteSiteData = await deleteLineType(deletePayload);
      if (deleteSiteData.success) {
        message.success("Line deleted successfully");
        await fetchLocationSiteAndLine(true);
      }
    } catch (error) {
      message.error(error.message);
    }
  };

  // Open add modal
  const enableInsertion = () => {
    setActivateBtn(true);
  };

  // Set initial filtered sites for edit modal
  useEffect(() => {
    if (selectedJob && siteList) {
      const initialFilteredSites = siteList.filter(
        (site) => site.loc_id === selectedJob.loc_id
      );
      setFilteredSitesForEdit(initialFilteredSites);
    }
  }, [selectedJob, siteList]);

  // Fetch data on mount
  useEffect(() => {
    fetchLocationSiteAndLine();
  }, []);

  // Form fields for Add modal
  const fieldsForAdd = [
    [
      {
        type: "select",
        name: "loc_name",
        label: "Location",
        rules: [{ required: true, message: "Location is required" }],
        options: locationList
          ? locationList.map((loc) => ({ value: loc.id, label: loc.loc_name }))
          : [],
        placeholder: "Select a location",
        onChange: (value, form) => {
          const filtered = siteList.filter((site) => site.loc_id === value);
          setFilteredSitesForAdd(filtered);
        },
        colSpan: 24,
      },
      {
        type: "select",
        name: "site_name",
        label: "Site",
        rules: [{ required: true, message: "Site is required" }],
        options: filteredSitesForAdd.map((site) => ({
          value: site.id,
          label: site.site_name,
        })),
        placeholder: "Select a site",
        colSpan: 24,
      },
    ],
    [
      {
        type: "input",
        name: "lt_name",
        label: "Line Type Name",
        rules: [
          {
            required: true,
            message: "Line Type Name is required",
          },
        ],
        placeholder: "Ex. Line A",
        colSpan: 24,
      },
      {
        type: "input",
        name: "lt_description",
        label: "Line Description",
        rules: [
          { max: 100, message: "Description cannot exceed 100 characters" },
        ],
        placeholder: "Ex. Morning Shift",
        colSpan: 24,
      },
    ],
  ];

  // Form fields for Edit modal
  const fieldsForEdit = [
    [
      {
        type: "select",
        name: "loc_name",
        label: "Location",
        rules: [{ required: true, message: "Location is required" }],
        options: locationList
          ? locationList.map((loc) => ({ value: loc.id, label: loc.loc_name }))
          : [],
        placeholder: "Select a location",
        onChange: (value, form) => {
          const filtered = siteList.filter((site) => site.loc_id === value);
          setFilteredSitesForEdit(filtered);
        },
        colSpan: 24,
      },
      {
        type: "select",
        name: "site_name",
        label: "Site",
        rules: [{ required: true, message: "Site is required" }],
        options: filteredSitesForEdit.map((site) => ({
          value: site.id,
          label: site.site_name,
        })),
        placeholder: "Select a site",
        colSpan: 24,
      },
    ],
    [
      {
        type: "input",
        name: "lt_name",
        label: "Line Type Name",
        rules: [{ required: true, message: "Line Type Name is required" }],
        placeholder: "Ex. Line A",
        colSpan: 24,
      },
      {
        type: "input",
        name: "lt_description",
        label: "Line Description",
        rules: [
          { max: 100, message: "Description cannot exceed 100 characters" },
        ],
        placeholder: "Ex. Morning Shift",
        colSpan: 24,
      },
    ],
  ];

  // Data for table
  const data =
    lineList?.length > 0
      ? lineList.map((data, index) => ({
          key: index.toString(),
          serial: (index + 1).toString(),
          lineTypeId: data.id,
          loc_id: data.loc_id,
          loc_name: data.loc_name,
          lt_name: data.lt_name,
          lt_description: data.lt_description,
          site_name: data.site_name,
          site_id: data.site_id,
        }))
      : [];

  const lineNameFilters = lineList
    ? lineList.map((line) => ({ text: line.lt_name, value: line.lt_name }))
    : [];

  return (
    <div className="mt-12">
      <h1 className="text-left ml-8 font-semibold dark:text-gray-300">
        Line Type List
      </h1>
      <div className="flex flex-wrap lg:flex-nowrap justify-center">
        <div className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg h-44 rounded-xl w-full lg:w-80 p-8 pt-9 m-3 bg-center">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-bold text-gray-400">Total Lines</p>
              <p className="text-2xl">{lineList?.length || 0}</p>
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
              Add New Line
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
            placeholder="Search Line Name"
            style={{ textAlign: "center" }}
            onChange={(e) => {
              const searchTerm = e.target.value;
              setSearch(searchTerm);
              const filter = lineList.filter((item) =>
                item.lt_name.toLowerCase().includes(searchTerm.toLowerCase())
              );
              setFilteredData(filter);
            }}
          />
        </div>
      </div>

      {/* Add Modal */}
      {activateBtn && (
        <ReusableModal
          key={"add"}
          title="Add New Line"
          isOpen={activateBtn}
          onClose={() => setActivateBtn(false)}
          onSubmit={saveNewLine}
          fields={fieldsForAdd}
          loading={loading}
          currentColor={currentColor}
        />
      )}

      {/* Edit Modal */}
      {activateEditing && selectedJob && (
        <ReusableModal
          key={activateEditing && selectedJob && selectedJob.lt_name}
          title="Edit Existing Line"
          isOpen={activateEditing}
          onClose={closeEditModal}
          onSubmit={updateExistingLine}
          initialValues={{
            loc_name: selectedJob?.loc_id,
            site_name: selectedJob?.site_id,
            lt_name: selectedJob?.lt_name,
            lt_description: selectedJob?.lt_description,
          }}
          fields={fieldsForEdit}
          loading={loading}
          currentColor={currentColor}
        />
      )}

      {/* Table */}
      {loading ? (
        <Loading message="Loading!" />
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
                columns={lineListColumn.map((col) => {
                  if (col.key === "lt_name") {
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
                          jobNames={lineNameFilters}
                        />
                      ),
                      onFilter: (value, record) =>
                        record.lt_name.includes(value),
                      render: (_, record) => ({
                        props: { style: { background: "#737B7C" } },
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
                                {record.lt_name}
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
                              onClick={() => handleEditClick(record)}
                              className="edit text-md"
                              style={{ color: currentColor }}
                            >
                              <span className="material-symbols-outlined">
                                edit
                              </span>
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
                              onConfirm={() => deleteLineHandler(record)}
                              onCancel={() =>
                                message.error(
                                  "Oh O! You were accidentally deleting data"
                                )
                              }
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
                })}
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
        </div>
      )}
    </div>
  );
};

export default Line;
