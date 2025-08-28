import React, { useEffect, useState } from "react";
import { earningData } from "../data/sidenavItems";
import {
  deleteJob,
  getJobList,
  updateJobList,
  saveNewJob,
} from "../apicalls/adminapicalls";
import jobListColumn, {
  enableEdit,
  enableDelete,
} from "../tablecolumns/jobListColumnDefinition";
import {
  Table,
  message,
  Popconfirm,
  Space,
  Modal,
  Form,
  Input,
  Button,
  Input as TextArea,
} from "antd";
import { useStateContext } from "../contexts/ContextProvider";
import Loading from "../components/Loading";
import CustomerFilterDropDown from "../components/CustomerFilterDropDown";
import SearchInput from "../components/SearchInput";

const JobList = () => {
  const { currentColor } = useStateContext();
  const [jobList, setJobList] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activateBtn, setActivatebtn] = useState(false);
  const [activateEditing, setActivateEditing] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filtereddata, setFiltereddata] = useState([]);

  const fetchJobsList = async () => {
    try {
      setLoading(true);
      const getJobsList = await getJobList();
      if (getJobsList.success === true) {
        setJobList(getJobsList.data);
        setLoading(false);
      } else {
        setLoading(false);
        console.log("No Job list found");
        message.error("No Job list found");
      }
    } catch (error) {
      setLoading(false);
      console.log("Error occurred", error);
      message.error(error.message);
    }
  };

  const handleEditClick = (e, jobId) => {
    const eventData = enableEdit(e, jobId);
    setIsEditing(true);
    setActivateEditing(true);
    setSelectedJob(eventData);
  };

  const closeEditModal = () => {
    setIsEditing(false);
    setActivateEditing(false);
    setSelectedJob(null);
  };

  const saveANewJob = async (values) => {
    try {
      setLoading(true);
      const destructuringValues = {
        job_name: values?.job_name,
        job_description: values?.description,
        job_code: values?.job_code,
        sub_job_name: values?.sub_job_name,
      };
      const saveJob = await saveNewJob(destructuringValues);
      if (saveJob.success === true) {
        setActivatebtn(false);
        fetchJobsList();
      } else {
        message.info("Data not saved");
      }
    } catch (error) {
      message.error(error.message);
      console.log("Error in job creation", error);
    } finally {
      setLoading(false);
    }
  };

  const updateJob = async (values) => {
    try {
      setLoading(true);
      const payloadDestructure = {
        id: selectedJob?.jobDetails?.jobId,
        job_code: values.job_code,
        job_description: values.description,
        job_name: values.job_name,
        sub_job_name: values.sub_job_name,
      };
      const update = await updateJobList(payloadDestructure);
      if (update.success === true) {
        message.success("Job Updated Successfully");
        setIsEditing(false);
        setActivateEditing(false);
        fetchJobsList();
      }
    } catch (error) {
      message.error(error.message);
      console.log("Error in updating job", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteJobHandler = async (payload) => {
    try {
      const deleteJobData = await deleteJob({ id: payload.jobId });
      if (deleteJobData.success === true) {
        message.success("Job deleted successfully");
        fetchJobsList();
      }
    } catch (error) {
      message.error(error.message);
      console.log("Error in deleting job", error);
    }
  };

  const cancel = (e) => {
    message.error("Oh O! You were accidentally deleting data");
  };

  const closeModal = () => {
    setActivatebtn(false);
  };

  const enableInsertion = () => {
    setActivatebtn(true);
  };

  useEffect(() => {
    fetchJobsList();
  }, []);

  const tableColumns = [...jobListColumn];

  const data =
    jobList?.length > 0
      ? jobList?.map((data, index) => ({
          key: index.toString(),
          serial: (index + 1).toString(),
          jobId: data.id,
          orgId: data.org_id,
          location_id: data.location_id,
          site_id: data.site_id,
          job_name: data.job_name,
          sub_job_name: data.sub_job_name,
          job_code: data.job_code,
          job_description: data.job_description,
        }))
      : [];

  const jobNameFilters = jobList
    ? jobList.map((job) => ({
        text: job.job_name,
        value: job.job_name,
      }))
    : [];

  return (
    <div className="mt-12">
      <h1 className="text-left ml-8 font-semibold dark:text-gray-300">
        JOB List
      </h1>
      <div className="flex flex-wrap lg:flex-nowrap justify-center">
        <div className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg h-44 rounded-xl w-full lg:w-80 p-8 pt-9 m-3 bg-center">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-bold text-gray-400">Total Job List</p>
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
              Add New Job
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
        placeholder="Search Jobs"
        data={jobList || []}
        filterKey="job_name"
        setSearch={setSearch}
        onSearch={(filteredResults) => {
          setFiltereddata(filteredResults);
        }}
      />

      {!activateBtn ? (
        ""
      ) : (
        <Modal
          title="Add New Job"
          open={activateBtn}
          onCancel={closeModal}
          footer={false}
          className="text-center font-semibold"
        >
          <hr />
          <Form
            layout="vertical"
            className="p-2 rounded-lg text-white dark:bg-secondary-dark-bg dark:text-gray-200"
            onFinish={saveANewJob}
          >
            <Form.Item
              name="job_name"
              label="Job Name"
              rules={[
                { required: true, message: "Please input the job name!" },
                { min: 3, message: "Job name must be at least 3 characters." },
                { max: 50, message: "Job name cannot exceed 50 characters." },
                {
                  pattern: /^[a-zA-Z0-9]+(?: [a-zA-Z0-9]+)*$/,
                  message:
                    "Job name must contain at least one non-space character and only letters, numbers, and spaces.",
                },
              ]}
              className="text-center text-white"
            >
              <Input
                className="border-1 border-gray-600"
                placeholder="Ex. Micro Tasks"
              />
            </Form.Item>
            <Form.Item
              name="sub_job_name"
              label="Sub Job Name"
              rules={[
                {
                  min: 3,
                  message:
                    "Sub job name must be at least 3 characters if provided.",
                },
                {
                  max: 50,
                  message: "Sub job name cannot exceed 50 characters.",
                },
                {
                  pattern: /^[a-zA-Z0-9]+(?: [a-zA-Z0-9]+)*$/,
                  message:
                    "Sub job name must contain at least one non-space character and only letters, numbers, and spaces.",
                },
              ]}
              className="text-center text-white"
            >
              <Input
                className="border-1 border-gray-600"
                placeholder="Ex. Micro Tasks Sub Job"
              />
            </Form.Item>
            <Form.Item
              name="description"
              label="Description"
              rules={[
                {
                  max: 200,
                  message: "Description cannot exceed 200 characters.",
                },
              ]}
              className="text-center text-white"
            >
              <TextArea
                rows={4}
                className="border-1 border-gray-600"
                placeholder="Ex. Description about the job if any"
              />
            </Form.Item>
            <Form.Item
              name="job_code"
              label="Job Code"
              rules={[
                { required: true, message: "Please input the job code!" },
                {
                  pattern: /^[a-zA-Z0-9]{6}$/,
                  message:
                    "Job code must be exactly 6 alphanumeric characters.",
                },
                {
                  validator: (_, value) => {
                    if (
                      value &&
                      jobList.some((job) => job.job_code === value)
                    ) {
                      return Promise.reject("Job code already exists.");
                    }
                    return Promise.resolve();
                  },
                },
              ]}
              className="text-center text-white"
            >
              <Input
                className="border-1 border-gray-600"
                placeholder="Ex. P1A11A"
              />
            </Form.Item>
            <Form.Item className="flex items-center justify-end">
              <Space>
                <Button
                  style={{ backgroundColor: currentColor, color: "white" }}
                  htmlType="submit"
                  disabled={loading}
                >
                  Submit
                </Button>
                <Button
                  style={{ backgroundColor: currentColor, color: "white" }}
                  htmlType="reset"
                  disabled={loading}
                >
                  Reset
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      )}

      {!activateEditing && !isEditing ? (
        ""
      ) : (
        <Modal
          title="Edit Existing Job"
          open={activateEditing}
          onCancel={closeEditModal}
          footer={false}
          className="text-center font-semibold"
        >
          <hr style={{ height: "14px" }} />
          {selectedJob && (
            <Form
              layout="vertical"
              initialValues={{
                job_name: selectedJob?.jobDetails?.job_name,
                sub_job_name: selectedJob?.jobDetails?.sub_job_name,
                description: selectedJob?.jobDetails?.job_description,
                job_code: selectedJob?.jobDetails?.job_code,
              }}
              className="p-2 rounded-lg text-white dark:bg-secondary-dark-bg dark:text-gray-200"
              onFinish={updateJob}
            >
              <Form.Item
                name="job_name"
                label="Job Name"
                rules={[
                  { required: true, message: "Please input the job name!" },
                  {
                    min: 3,
                    message: "Job name must be at least 3 characters.",
                  },
                  { max: 50, message: "Job name cannot exceed 50 characters." },
                  {
                    pattern: /^[a-zA-Z0-9]+(?: [a-zA-Z0-9]+)*$/,
                    message:
                      "Job name must contain at least one non-space character and only letters, numbers, and spaces.",
                  },
                ]}
                className="text-center text-white"
              >
                <Input
                  className="border-1 border-gray-600"
                  placeholder="Ex. Micro Tasks"
                />
              </Form.Item>
              <Form.Item
                name="sub_job_name"
                label="Sub Job Name"
                rules={[
                  {
                    min: 3,
                    message:
                      "Sub job name must be at least 3 characters if provided.",
                  },
                  {
                    max: 50,
                    message: "Sub job name cannot exceed 50 characters.",
                  },
                  {
                    pattern: /^[a-zA-Z0-9]+(?: [a-zA-Z0-9]+)*$/,
                    message:
                      "Sub job name must contain at least one non-space character and only letters, numbers, and spaces.",
                  },
                ]}
                className="text-center text-white"
              >
                <Input
                  className="border-1 border-gray-600"
                  placeholder="Ex. Micro Tasks Sub Job"
                />
              </Form.Item>
              <Form.Item
                name="description"
                label="Description"
                rules={[
                  {
                    max: 200,
                    message: "Description cannot exceed 200 characters.",
                  },
                ]}
                className="text-center text-white"
              >
                <TextArea
                  rows={4}
                  className="border-1 border-gray-600"
                  placeholder="Ex. Description about the job if any"
                />
              </Form.Item>
              <Form.Item
                name="job_code"
                label="Job Code"
                rules={[
                  { required: true, message: "Please input the job code!" },
                  {
                    pattern: /^[a-zA-Z0-9]{6}$/,
                    message:
                      "Job code must be exactly 6 alphanumeric characters.",
                  },
                  {
                    validator: (_, value) => {
                      if (
                        value &&
                        jobList.some(
                          (job) =>
                            job.job_code === value &&
                            job.id !== selectedJob.jobDetails.jobId
                        )
                      ) {
                        return Promise.reject("Job code already exists.");
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
                className="text-center text-white"
              >
                <Input
                  className="border-1 border-gray-600"
                  placeholder="Ex. P1A11A"
                />
              </Form.Item>
              <Form.Item className="flex items-center justify-end">
                <Space>
                  <Button
                    style={{ backgroundColor: currentColor, color: "white" }}
                    htmlType="submit"
                    disabled={loading}
                  >
                    Submit
                  </Button>
                  <Button
                    style={{ backgroundColor: currentColor, color: "white" }}
                    htmlType="reset"
                    disabled={loading}
                    onClick={closeEditModal}
                  >
                    Cancel
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          )}
        </Modal>
      )}

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
                          <div className="flex gap-3 cursor-pointer justify-center items-center">
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
                  return col;
                })}
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

export default JobList;
