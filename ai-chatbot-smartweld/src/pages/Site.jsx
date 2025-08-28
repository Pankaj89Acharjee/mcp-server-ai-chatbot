// import React, { useEffect, useState } from "react";
// import { earningData } from "../data/sidenavItems";
// import siteListColumn, {
//   enableDelete,
//   enableEdit,
// } from "../tablecolumns/siteListColDefinition";
// import { Table, message, Popconfirm, Space, Input } from "antd";
// import { useStateContext } from "../contexts/ContextProvider";
// import Loading from "../components/Loading";
// import CustomerFilterDropDown from "../components/CustomerFilterDropDown";
// import { getLocation } from "../apicalls/locationAPICall";
// import {
//   createSite,
//   deleteSite,
//   getSites,
//   updateSites,
// } from "../apicalls/siteAPICall";
// import ReusableModal from "../components/ReusableModal";

// const Site = () => {
//   const { currentColor } = useStateContext();
//   const [siteList, setSiteList] = useState(null);
//   const [activateBtn, setActivateBtn] = useState(false);
//   const [activateEditing, setActivateEditing] = useState(false);
//   const [selectedJob, setSelectedJob] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [search, setSearch] = useState("");
//   const [filteredData, setFilteredData] = useState([]);
//   const [locationList, setLocationList] = useState(null);
//   const [fetched, setFetched] = useState(false);

//   // Fetch all sites
//   const fetchAllSite = async () => {
//     try {
//       setLoading(true);
//       const fetchSites = await getSites();
//       if (fetchSites.success) {
//         setSiteList(fetchSites.data);
//         setLoading(false);
//       } else {
//         setLoading(false);
//         message.error("Found no site");
//       }
//     } catch (error) {
//       setLoading(false);
//       message.error(error.message);
//     }
//   };

//   // Fetch all locations
//   const fetchAllLocation = async () => {
//     try {
//       if (!fetched) {
//         const fetchLocations = await getLocation();
//         if (fetchLocations.success) {
//           setLocationList(fetchLocations.data);
//           setFetched(true);
//         } else {
//           message.error("Found no location");
//         }
//       }
//     } catch (error) {
//       message.error(error.message);
//     }
//   };

//   // Handle form submission for adding a new site
//   const saveNewSite = async (values) => {
//     try {
//       const payload = {
//         ...values,
//         loc_id: values.loc_name,
//       };
//       setLoading(true);
//       const saveLoc = await createSite(payload);
//       if (saveLoc.success) {
//         setLoading(false);
//         setActivateBtn(false);
//         fetchAllSite();
//         message.success("Site created successfully");
//       } else {
//         message.info("Data not saved");
//         setLoading(false);
//       }
//     } catch (error) {
//       setLoading(false);
//       message.error(error.message);
//     }
//   };

//   // Handle form submission for updating an existing site
//   const updateExistingLocation = async (payload) => {
//     try {
//       const updatePayload = {
//         id: selectedJob.siteId,
//         loc_id: payload.loc_name,
//         site_name: payload.site_name,
//         site_description: payload.site_description,
//       };
//       setLoading(true);
//       const update = await updateSites(updatePayload);
//       if (update.success) {
//         message.success("Site updated successfully");
//         setActivateEditing(false);
//         setSelectedJob(null);
//         fetchAllSite();
//       }
//     } catch (error) {
//       message.error(error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle site deletion
//   const deleteSiteHandler = async (payload) => {
//     try {
//       const deletePayload = { id: payload.siteId };
//       const deleteSiteData = await deleteSite(deletePayload);
//       if (deleteSiteData.success) {
//         message.success("Site deleted successfully");
//         fetchAllSite();
//       }
//     } catch (error) {
//       message.error(error.message);
//     }
//   };

//   // Handle edit click
//   const handleEditClick = (record) => {
//     setActivateEditing(true);
//     setSelectedJob(record);
//   };

//   // Close modals
//   const closeModal = () => setActivateBtn(false);
//   const closeEditModal = () => {
//     setActivateEditing(false);
//     setSelectedJob(null);
//   };

//   useEffect(() => {
//     fetchAllSite();
//     fetchAllLocation();
//   }, []);

//   // Define form fields with validations
//   const siteFields = [
//     [
//       {
//         type: "select",
//         name: "loc_name",
//         label: "Location",
//         rules: [{ required: true, message: "Location is required" }],
//         placeholder: "Select location",
//         options:
//           locationList?.map((location) => ({
//             value: location.id,
//             label: location.loc_name,
//           })) || [],
//         colSpan: 24,
//       },
//     ],
//     [
//       {
//         type: "input",
//         name: "site_name",
//         label: "Name of Site",
//         rules: [
//           { required: true, message: "Site name is required" },
//           { min: 3, message: "Site name must be at least 3 characters" },
//           { max: 50, message: "Site name cannot exceed 50 characters" },
//           {
//             pattern: /^[A-Za-z][A-Za-z0-9 ]*$/,
//             message:
//               "Site name must start with a letter and contain only letters, numbers, and spaces",
//           },
//         ],
//         placeholder: "Ex. Amazon Forest",
//         colSpan: 24,
//       },
//     ],
//     [
//       {
//         type: "input",
//         name: "site_description",
//         label: "Site Description",
//         rules: [
//           { required: true, message: "Site description is required" },
//           { min: 5, message: "Site description must be at least 5 characters" },
//           {
//             max: 100,
//             message: "Site description cannot exceed 100 characters",
//           },
//         ],
//         placeholder: "Ex. Morning Shift",
//         colSpan: 24,
//       },
//     ],
//   ];

//   // Prepare table data
//   const data =
//     siteList?.map((data, index) => ({
//       key: index.toString(),
//       serial: (index + 1).toString(),
//       siteId: data.id,
//       loc_id: data.loc_id,
//       loc_name: data.loc_name,
//       site_description: data.site_description,
//       site_name: data.site_name,
//     })) || [];

//   const siteNameFilters =
//     siteList?.map((location) => ({
//       text: location.site_name,
//       value: location.site_name,
//     })) || [];

//   return (
//     <div className="mt-12">
//       <h1 className="text-left ml-8 font-semibold dark:text-gray-300">
//         Site List
//       </h1>
//       <div className="flex flex-wrap lg:flex-nowrap justify-center">
//         {/* Top section */}
//         <div className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg h-44 rounded-xl w-full lg:w-80 p-8 pt-9 m-3 bg-center">
//           <div className="flex justify-between items-center">
//             <div>
//               <p className="font-bold text-gray-400">Total Sites</p>
//               <p className="text-2xl">{siteList?.length || 0}</p>
//             </div>
//           </div>
//           <div className="mt-6">
//             <button
//               type="button"
//               style={{
//                 backgroundColor: currentColor,
//                 color: "white",
//                 borderRadius: "10px",
//               }}
//               className="text-md p-3 hover:drop-shadow-xl"
//               onClick={() => setActivateBtn(true)}
//             >
//               Add New Site
//             </button>
//           </div>
//         </div>
//         {/* Card Icons Section */}
//         <div className="flex flex-wrap mt-3 justify-center gap-1 items-center">
//           {earningData.map((item) => (
//             <div
//               key={item.title}
//               className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg md:w-56 p-4 pt-9 rounded-2xl"
//             >
//               <button
//                 style={{ backgroundColor: item.iconColor }}
//                 className="text-2xl opacity-0.9 rounded-full p-4 hover:drop-shadow-xl"
//               />
//               <p className="mt-3">
//                 <span className="text-lg font-semibold">{item.amount}</span>
//               </p>
//               <p className="text-sm text-gray-400 mt-1">{item.title}</p>
//             </div>
//           ))}
//         </div>
//       </div>
//       {/* Search Section */}
//       <div className="flex items-center justify-center mt-3 lg:mt-4 pl-2 pr-2 md:pl-3 md:pr-3 lg:pl-4 lg:pr-4">
//         <div className="items-center justify-center w-64 md:w-72 lg:w-96">
//           <Input.Search
//             placeholder="Search Site Name"
//             style={{ textAlign: "center" }}
//             onChange={(e) => {
//               const searchTerm = e.target.value;
//               setSearch(searchTerm);
//               const filter = siteList.filter((item) =>
//                 item.site_name.toLowerCase().includes(searchTerm.toLowerCase())
//               );
//               setFilteredData(filter);
//             }}
//           />
//         </div>
//       </div>
//       {/* Reusable Modals */}
//       {activateBtn && (
//         <ReusableModal
//           key={"add"}
//           title="Add New Site"
//           isOpen={activateBtn}
//           onClose={closeModal}
//           onSubmit={saveNewSite}
//           initialValues={{}}
//           fields={siteFields}
//           loading={loading}
//           currentColor={currentColor}
//           className="text-center font-semibold"
//         />
//       )}
//       {activateEditing && selectedJob && (
//         <ReusableModal
//           key={activateEditing && selectedJob && selectedJob.siteId}
//           title="Edit Existing Site"
//           isOpen={activateEditing}
//           onClose={closeEditModal}
//           onSubmit={updateExistingLocation}
//           initialValues={{
//             loc_name: selectedJob.loc_id,
//             site_name: selectedJob.site_name,
//             site_description: selectedJob.site_description,
//           }}
//           fields={siteFields}
//           loading={loading}
//           currentColor={currentColor}
//           className="text-center font-semibold"
//         />
//       )}
//       {/* Table Section */}
//       {loading ? (
//         <Loading message="Loading!" />
//       ) : (
//
//     </div>
//   );
// };

// export default Site;

import React, { useEffect, useState } from "react";
import { earningData } from "../data/sidenavItems";
import siteListColumn, {
  enableDelete,
  enableEdit,
} from "../tablecolumns/siteListColDefinition";
import { Table, message, Popconfirm, Space, Input } from "antd";
import { useStateContext } from "../contexts/ContextProvider";
import Loading from "../components/Loading";
import CustomerFilterDropDown from "../components/CustomerFilterDropDown";
import { getLocation } from "../apicalls/locationAPICall";
import {
  createSite,
  deleteSite,
  getSites,
  updateSites,
} from "../apicalls/siteAPICall";
import ReusableModal from "../components/ReusableModal";

const Site = () => {
  const { currentColor } = useStateContext();
  const [siteList, setSiteList] = useState(null);
  const [activateBtn, setActivateBtn] = useState(false);
  const [activateEditing, setActivateEditing] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [locationList, setLocationList] = useState(null);
  const [fetched, setFetched] = useState(false);

  // Fetch all sites
  const fetchAllSite = async () => {
    try {
      setLoading(true);
      const fetchSites = await getSites();
      if (fetchSites.success) {
        setSiteList(fetchSites.data);
        setLoading(false);
      } else {
        setLoading(false);
        message.error("Found no site");
      }
    } catch (error) {
      setLoading(false);
      message.error(error.message);
    }
  };

  // Fetch all locations
  const fetchAllLocation = async () => {
    try {
      if (!fetched) {
        const fetchLocations = await getLocation();
        if (fetchLocations.success) {
          setLocationList(fetchLocations.data);
          setFetched(true);
        } else {
          message.error("Found no location");
        }
      }
    } catch (error) {
      message.error(error.message);
    }
  };

  // Handle form submission for adding a new site
  const saveNewSite = async (values) => {
    try {
      const payload = {
        ...values,
        loc_id: values.loc_name,
      };
      setLoading(true);
      const saveLoc = await createSite(payload);
      if (saveLoc.success) {
        setLoading(false);
        setActivateBtn(false);
        fetchAllSite();
        message.success("Site created successfully");
      } else {
        message.info("Data not saved");
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      message.error(error.message);
    }
  };

  // Handle form submission for updating an existing site
  const updateExistingLocation = async (payload) => {
    try {
      const updatePayload = {
        id: selectedJob.siteId,
        loc_id: payload.loc_name,
        site_name: payload.site_name,
        site_description: payload.site_description,
      };
      setLoading(true);
      const update = await updateSites(updatePayload);
      if (update.success) {
        message.success("Site updated successfully");
        setActivateEditing(false);
        setSelectedJob(null);
        fetchAllSite();
      }
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle site deletion
  const deleteSiteHandler = async (payload) => {
    try {
      const deletePayload = { id: payload.siteId };
      const deleteSiteData = await deleteSite(deletePayload);
      if (deleteSiteData.success) {
        message.success("Site deleted successfully");
        fetchAllSite();
      }
    } catch (error) {
      message.error(error.message);
    }
  };

  // Handle edit click
  const handleEditClick = (record) => {
    setActivateEditing(true);
    setSelectedJob(record);
  };

  // Close modals
  const closeModal = () => setActivateBtn(false);
  const closeEditModal = () => {
    setActivateEditing(false);
    setSelectedJob(null);
  };

  useEffect(() => {
    fetchAllSite();
    fetchAllLocation();
  }, []);

  // Define form fields with validations
  const siteFields = [
    [
      {
        type: "select",
        name: "loc_name",
        label: "Location",
        rules: [{ required: true, message: "Location is required" }],
        placeholder: "Select location",
        options:
          locationList?.map((location) => ({
            value: String(location.id), // Convert to string
            label: location.loc_name,
          })) || [],
        colSpan: 24,
      },
    ],
    [
      {
        type: "input",
        name: "site_name",
        label: "Name of Site",
        rules: [
          { required: true, message: "Site name is required" },
          { min: 3, message: "Site name must be at least 3 characters" },
          { max: 50, message: "Site name cannot exceed 50 characters" },
          {
            pattern: /^[A-Za-z][A-Za-z0-9 ]*$/,
            message:
              "Site name must start with a letter and contain only letters, numbers, and spaces",
          },
        ],
        placeholder: "Ex. Amazon Forest",
        colSpan: 24,
      },
    ],
    [
      {
        type: "input",
        name: "site_description",
        label: "Site Description",
        rules: [
          { required: true, message: "Site description is required" },
          { min: 5, message: "Site description must be at least 5 characters" },
          {
            max: 100,
            message: "Site description cannot exceed 100 characters",
          },
        ],
        placeholder: "Ex. Morning Shift",
        colSpan: 24,
      },
    ],
  ];

  // Prepare table data
  const data =
    siteList?.map((data, index) => ({
      key: index.toString(),
      serial: (index + 1).toString(),
      siteId: data.id,
      loc_id: data.loc_id,
      loc_name: data.loc_name,
      site_description: data.site_description,
      site_name: data.site_name,
    })) || [];

  const siteNameFilters =
    siteList?.map((location) => ({
      text: location.site_name,
      value: location.site_name,
    })) || [];

  return (
    <div className="mt-12">
      <h1 className="text-left ml-8 font-semibold dark:text-gray-300">
        Site List
      </h1>
      <div className="flex flex-wrap lg:flex-nowrap justify-center">
        {/* Top section */}
        <div className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg h-44 rounded-xl w-full lg:w-80 p-8 pt-9 m-3 bg-center">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-bold text-gray-400">Total Sites</p>
              <p className="text-2xl">{siteList?.length || 0}</p>
            </div>
          </div>
          <div className="mt-6">
            <button
              type="button"
              style={{
                backgroundColor: fetched ? currentColor : "gray",
                color: "white",
                borderRadius: "10px",
              }}
              className={`text-md p-3 hover:drop-shadow-xl ${
                !fetched && "cursor-not-allowed"
              }`}
              onClick={() => fetched && setActivateBtn(true)}
              disabled={!fetched}
            >
              Add New Site
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
      {/* Search Section */}
      <div className="flex items-center justify-center mt-3 lg:mt-4 pl-2 pr-2 md:pl-3 md:pr-3 lg:pl-4 lg:pr-4">
        <div className="items-center justify-center w-64 md:w-72 lg:w-96">
          <Input.Search
            placeholder="Search Site Name"
            style={{ textAlign: "center" }}
            onChange={(e) => {
              const searchTerm = e.target.value;
              setSearch(searchTerm);
              const filter = siteList.filter((item) =>
                item.site_name.toLowerCase().includes(searchTerm.toLowerCase())
              );
              setFilteredData(filter);
            }}
          />
        </div>
      </div>
      {/* Reusable Modals */}
      {activateBtn && fetched && (
        <ReusableModal
          title="Add New Site"
          isOpen={activateBtn}
          onClose={closeModal}
          onSubmit={saveNewSite}
          initialValues={{}}
          fields={siteFields}
          loading={loading}
          currentColor={currentColor}
          className="text-center font-semibold"
        />
      )}
      {activateEditing && selectedJob && fetched && (
        <ReusableModal
          title="Edit Existing Site"
          isOpen={activateEditing}
          onClose={closeEditModal}
          onSubmit={updateExistingLocation}
          initialValues={{
            loc_name: String(selectedJob.loc_id), // Convert to string
            site_name: selectedJob.site_name,
            site_description: selectedJob.site_description,
          }}
          fields={siteFields}
          loading={loading}
          currentColor={currentColor}
          className="text-center font-semibold"
        />
      )}
      {/* Table Section */}
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
                columns={siteListColumn.map((col) => {
                  if (col.key === "site_name") {
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
                          jobNames={siteNameFilters}
                        />
                      ),
                      onFilter: (value, record) =>
                        record.site_name.includes(value),
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
                                {record.site_name}
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
                              onClick={() => fetched && handleEditClick(record)}
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
                        props: {
                          style: { background: "#737B7C" },
                        },
                        children: (
                          <div className="flex gap-3 cursor-pointer justify-center items-center">
                            <Popconfirm
                              title="Are you sure to delete?"
                              onConfirm={() => deleteSiteHandler(record)}
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

export default Site;
