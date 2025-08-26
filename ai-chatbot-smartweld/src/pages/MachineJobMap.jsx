import React, { useEffect, useState } from "react";
import { earningData } from "../data/sidenavItems";
import { getMachineJobInfo, getMachines } from "../apicalls/adminapicalls";
import machineJobMapColumn, {
  enableEdit,
  enableDelete,
} from "../tablecolumns/machineJobMapColDefinition";
import { Table, message, Popconfirm } from "antd";
import { useStateContext } from "../contexts/ContextProvider";
import Loading from "../components/Loading";
import CustomerFilterDropDown from "../components/CustomerFilterDropDown";
import {
  deleteMachineJobMapping,
  getJobs,
  saveMachineJobMapping,
  updateMachineJobMapping,
} from "../apicalls/jobs";
import ReusableModal from "../components/ReusableModal";
import SearchInput from "../components/SearchInput";

const MachineJobMap = () => {
  const { currentColor } = useStateContext();

  const [machineJob, setMachineJob] = useState(null);
  const [activateBtn, setActivateBtn] = useState(false);
  const [activateEditing, setActivateEditing] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [allMachines, setAllMachines] = useState([]);
  const [allJobs, setAllJobs] = useState([]);

  // Fetch machine-job mapping data
  const fetchMachineJob = async () => {
    try {
      setLoading(true);
      const getMacJobList = await getMachineJobInfo();
      if (getMacJobList.success === true) {
        setMachineJob(getMacJobList.data);
        //console.log("machineJob in fetchMachineJob", getMacJobList.data);
        setLoading(false);
      } else {
        setLoading(false);
        message.error("No Machine Mapped Job list found");
      }
    } catch (error) {
      setLoading(false);
      console.log("Error occurred", error);
      message.error(error.message);
    }
  };

  // Fetch all machines
  const getMachinesList = async () => {
    try {
      const getMachineData = await getMachines();
      if (getMachineData.success === true) {
        setAllMachines(getMachineData.data);
      }
    } catch (error) {
      console.log("Error occurred", error);
      message.error(error.message);
    }
  };

  // Fetch all jobs
  const getJobsList = async () => {
    //console.log("getJobsList called");
    try {
      const getJobsData = await getJobs();
      if (getJobsData.success === true) {
        setAllJobs(getJobsData.data);
      }
    } catch (error) {
      console.log("Error occurred", error);
      message.error(error.message);
    }
  };

  // Handle edit button click
  const handleEditClick = (e, jobId) => {
    const eventData = enableEdit(e, jobId);
    setSelectedJob(eventData);
    setActivateEditing(true);
  };

  // Close edit modal
  const closeEditModal = () => {
    setActivateEditing(false);
    setSelectedJob(null);
  };

  // Save a new job mapping
  const saveANewJob = async (values) => {
    try {
      setLoading(true);
      const payload = {
        job_id: values.job_name,
        machine_id: values.mc_name,
        job_seq: values.job_seq,
        job_serial: values.job_serial,
        is_current_job: values.is_current_job || false,
      };
      const saveNewMappedJob = await saveMachineJobMapping(payload);
      if (saveNewMappedJob.success === true) {
        message.success("New job mapped with machine successfully");
        setActivateBtn(false);
        fetchMachineJob();
      } else {
        message.error(saveNewMappedJob.message);
      }
    } catch (error) {
      message.error(error.message);
      console.log("Error in creating a new job", error);
    } finally {
      setLoading(false);
    }
  };

  // Update an existing job mapping
  const updateJob = async (values) => {
    try {
      setLoading(true);
      const payload = {
        id: selectedJob?.jobDetails.id,
        job_id: values.job_name,
        machine_id: values.mc_name,
        job_seq: values.job_seq,
        job_serial: values.job_serial,
        is_current_job: values.is_current_job || false,
      };
      const update = await updateMachineJobMapping(payload);
      if (update.success === true) {
        message.success("Updated Successfully!");
        closeEditModal();
        fetchMachineJob();
      } else {
        message.error(update.message);
      }
    } catch (error) {
      message.error(error.message);
      console.log("Error in updating", error);
    } finally {
      setLoading(false);
    }
  };

  // Delete a job mapping
  const deleteJobHandler = async (payload) => {
    try {
      setLoading(true);
      const deleteJobMap = await deleteMachineJobMapping({ ...payload });
      if (deleteJobMap.success === true) {
        message.success("Successfully deleted");
        fetchMachineJob();
      } else {
        message.error(deleteJobMap.message);
      }
    } catch (error) {
      message.error(error.message);
      console.log("Error in deleting", error);
    } finally {
      setLoading(false);
    }
  };

  const cancel = () => {
    message.error("Oh O! You were accidentally deleting data");
  };

  const enableInsertion = () => {
    setActivateBtn(true);
  };

  useEffect(() => {
    fetchMachineJob();
    getMachinesList();
    getJobsList();
  }, []);

  useEffect(() => {
    if (activateEditing && selectedJob) {
      setSelectedJob((prevSelectedJob) => ({
        ...prevSelectedJob,
        jobDetails: machineJob.find(
          (job) => job.id === prevSelectedJob?.jobDetails?.id
        ),
      }));
    }
  }, [activateEditing, machineJob]);

  // Field configurations for new job modal with validations
  const fieldsForNewJob = [
    [
      {
        type: "select",
        name: "job_name",
        label: "Job Name",
        placeholder: "Select job name",
        rules: [{ required: true, message: "Please select a job name" }],
        options: allJobs.map((job) => ({
          value: job.id,
          label: job.job_name,
        })),
      },
      {
        type: "select",
        name: "mc_name",
        label: "Machine Name",
        placeholder: "Select machine name",
        rules: [{ required: true, message: "Please select a machine name" }],
        options: allMachines.map((machine) => ({
          value: machine.id,
          label: machine.mc_name,
        })),
        colSpan: 12,
      },
    ],
    [
      {
        type: "input",
        name: "job_seq",
        label: "Job Sequence",
        placeholder: "Ex. 123",
        rules: [
          { required: true, message: "Job Sequence is required" },
          { pattern: /^[1-9]\d*$/, message: "Please enter a positive integer" },
        ],
        colSpan: 12,
      },
      {
        type: "input",
        name: "job_serial",
        label: "Job Serial",
        placeholder: "Ex. Serial1122",
        rules: [
          { required: true, message: "Job Serial is required" },
          {
            pattern: /^[a-zA-Z0-9]+$/,
            message: "Please enter alphanumeric characters only",
          },
        ],
        colSpan: 12,
      },
    ],
    [
      {
        type: "switch",
        name: "is_current_job",
        label: "Whether Current Job",
      },
    ],
  ];

  // Field configurations for edit job modal with validations
  const fieldsForEditJob = [
    [
      {
        type: "select",
        name: "job_name",
        label: "Job Name",
        placeholder: "Select job name",
        rules: [{ required: true, message: "Please select a job name" }],
        options: allJobs.map((job) => ({
          value: job.id,
          label: job.job_name,
        })),
      },
      {
        type: "select",
        name: "mc_name",
        label: "Machine Name",
        placeholder: "Select machine name",
        rules: [{ required: true, message: "Please select a machine name" }],
        options: allMachines.map((machine) => ({
          value: machine.id,
          label: machine.mc_name,
        })),
        colSpan: 12,
      },
    ],
    [
      {
        type: "input",
        name: "job_seq",
        label: "Job Sequence",
        placeholder: "Ex. 123",
        rules: [
          { required: true, message: "Job Sequence is required" },
          { pattern: /^[1-9]\d*$/, message: "Please enter a positive integer" },
        ],
        colSpan: 12,
      },
      {
        type: "input",
        name: "job_serial",
        label: "Job Serial",
        placeholder: "Ex. Serial1122",
        rules: [
          { required: true, message: "Job Serial is required" },
          {
            pattern: /^[a-zA-Z0-9]+$/,
            message: "Please enter alphanumeric characters only",
          },
        ],
        colSpan: 12,
      },
    ],
    [
      {
        type: "switch",
        name: "is_current_job",
        label: "Whether Current Job",
      },
    ],
  ];

  const tableColumns = [...machineJobMapColumn];

  const data =
    machineJob?.length > 0
      ? machineJob.map((data, index) => ({
          key: index.toString(),
          serial: (index + 1).toString(),
          id: data.id,
          job_id: data.job_id,
          job_name: data.job_name,
          job_seq: data.job_seq,
          job_serial: data.job_serial,
          machine_id: data.machine_id,
          mc_name: data.mc_name,
          is_current_job: Boolean(data.is_current_job),
        }))
      : [];

  const jobNameFilters = machineJob
    ? machineJob.map((job) => ({
        text: job.job_name,
        value: job.job_name,
      }))
    : [];

  return (
    <div className="mt-12">
      <h1 className="text-left ml-8 font-semibold dark:text-gray-300">
        Machine Job Mapping
      </h1>
      <div className="flex flex-wrap lg:flex-nowrap justify-center">
        <div className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg h-44 rounded-xl w-full lg:w-80 p-8 pt-9 m-3 bg-center">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-bold text-gray-400">
                Total Machine Job Mapped
              </p>
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

      <SearchInput
        placeholder="Search Job Names"
        data={machineJob || []}
        filterKey="job_name"
        setSearch={setSearch}
        onSearch={(filteredResults) => setFilteredData(filteredResults)}
      />

      <ReusableModal
        title="Add New Machine Job Mapping..."
        isOpen={activateBtn}
        onClose={() => setActivateBtn(false)}
        onSubmit={saveANewJob}
        fields={fieldsForNewJob}
        loading={loading}
        currentColor={currentColor}
      />

      <ReusableModal
        key={selectedJob?.jobDetails?.id || "edit-modal"}
        title="Edit Existing Machine Job Mapping..."
        isOpen={activateEditing}
        onClose={() => setActivateEditing(false)}
        onSubmit={updateJob}
        initialValues={{
          job_name: selectedJob?.jobDetails?.job_id,
          mc_name: selectedJob?.jobDetails?.machine_id,
          job_seq: selectedJob?.jobDetails?.job_seq,
          job_serial: selectedJob?.jobDetails?.job_serial,
          is_current_job: selectedJob?.jobDetails?.is_current_job,
        }}
        fields={fieldsForEditJob}
        loading={loading}
        currentColor={currentColor}
      />

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
                columns={tableColumns.map((col) => {
                  if (col.key === "job_name") {
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
                          jobNames={jobNameFilters}
                        />
                      ),
                      onFilter: (value, record) =>
                        record.job_name.includes(value),
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
                                {record.job_name}
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
                              onConfirm={() => deleteJobHandler(record)}
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
                  if (col.key === "is_current_job") {
                    return {
                      ...col,
                      render: (_, record) => ({
                        props: { style: { background: "#737B7C" } },
                        children: (
                          <div className="flex gap-3 cursor-pointer justify-center items-center">
                            {record.is_current_job ? (
                              <div className="p-1 flex items-center justify-center">
                                <div className="rounded-full bg-[#35f609] p-1 shadow-md">
                                  <h1 className="text-xs font-bold text-gray-700">
                                    True
                                  </h1>
                                </div>
                              </div>
                            ) : (
                              <div className="p-1 flex items-center justify-center">
                                <div className="rounded-full bg-[#ff4050] p-1 shadow-md">
                                  <h1 className="text-xs font-bold text-gray-700">
                                    False
                                  </h1>
                                </div>
                              </div>
                            )}
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

export default MachineJobMap;
