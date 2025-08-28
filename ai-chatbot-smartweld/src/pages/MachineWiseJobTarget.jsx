import React, { useEffect, useState } from "react";
import { earningData } from "../data/sidenavItems";
import machineWiseJobTargetColumn, {
  enableEdit,
  enableDelete,
} from "../tablecolumns/machineWiseJobTargetColDef";
import { Table, message, Popconfirm, Input } from "antd";
import { useStateContext } from "../contexts/ContextProvider";
import Loading from "../components/Loading";
import CustomerFilterDropDown from "../components/CustomerFilterDropDown";
import { getMachines } from "../apicalls/machinesCall";
import {
  createmachinewisejobtarget,
  deletemachinewisejobtarget,
  getmachinewisejobtarget,
  updatemachinewisejobtarget,
} from "../apicalls/machineJobTargetAPICall";
import { getJobs } from "../apicalls/jobs";
import { getAllShiftsList } from "../apicalls/shiftAPICall";
import dayjs from "dayjs";
import ReusableModal from "../components/ReusableModal";

const MachineWiseJobTarget = () => {
  const { currentColor } = useStateContext();
  const [jobTarget, setJobTarget] = useState(null);
  const [jobList, setJobList] = useState(null);
  const [machinesList, setMachinesList] = useState(null);
  const [shiftList, setShiftList] = useState(null);
  const [activateBtn, setActivatebtn] = useState(false);
  const [activateEditing, setActivateEditing] = useState(false);
  const [selectedMachineSpec, setSelectedMachineSpec] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filtereddata, setFiltereddata] = useState([]);
  const [fetched, setFetched] = useState(false);

  const fetchMachineWiseJobTarget = async (force = false) => {
    try {
      if (!fetched || force) {
        setLoading(true);
        const fetchJobTarget = await getmachinewisejobtarget();
        setJobTarget(fetchJobTarget.data);
        setLoading(false);
        setFetched(true);
      }
    } catch (error) {
      setLoading(false);
      console.log("Error occurred", error);
      message.error(error.message);
    }
  };

  const fetchMachineJobAndShift = async () => {
    try {
      if (!fetched) {
        const fetchJob = await getJobs();
        setJobList(fetchJob.data);
        const getMachinesList = await getMachines();
        setMachinesList(getMachinesList.data);
        const getShiftList = await getAllShiftsList();
        setShiftList(getShiftList.data);
        setLoading(false);
        setFetched(true);
      }
    } catch (error) {
      setLoading(false);
      console.log("Error occurred", error);
      message.error(error.message);
    }
  };

  const handleEditClick = (e, jobId) => {
    const eventData = enableEdit(e, jobId);
    setActivateEditing(true);
    setSelectedMachineSpec(eventData);
  };

  const closeEditModal = () => {
    setActivateEditing(false);
    setSelectedMachineSpec(null);
  };

  const closeModal = () => {
    setActivatebtn(false);
  };

  const createNewJobTarget = async (values) => {
    try {
      const payload = {
        job_id: values.job_name,
        machine_id: values.mc_name,
        shift_id: values.shift_name,
        target_arc_on_time: values.target_arc_on_time,
        target_cost: values.target_cost,
        target_date: values.target_date
          ? values.target_date.hour(12).toISOString()
          : null,
        target_deposit_kg: values.target_deposit_kg,
        target_job_count: values.target_job_count,
      };
      setLoading(true);
      const saveLoc = await createmachinewisejobtarget(payload);
      if (saveLoc.success === true) {
        message.success("Job Target Created Successfully");
        setLoading(false);
        setActivatebtn(false);
        await fetchMachineWiseJobTarget(true);
      } else {
        message.info("Data not saved");
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      message.error(error.message);
      console.log("Error in creating new job target", error);
    }
  };

  const updateJobTarget = async (values) => {
    try {
      const payload = {
        id: selectedMachineSpec?.jobDetails?.jobTargetId,
        job_id: values.job_name,
        machine_id: values.mc_name,
        shift_id: values.shift_name,
        target_arc_on_time: values.target_arc_on_time,
        target_cost: values.target_cost,
        target_date: values.target_date
          ? values.target_date.hour(12).toISOString()
          : null,
        target_deposit_kg: values.target_deposit_kg,
        target_job_count: values.target_job_count,
      };
      setLoading(true);
      const update = await updatemachinewisejobtarget(payload);
      if (update.success === true) {
        message.success("Machine Wise Job Target Updated Successfully");
        setActivateEditing(false);
        setFetched(false);
        await fetchMachineWiseJobTarget(true);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      message.error(error.message);
      console.log("Error in updating job target", error);
    }
  };

  const deleteHandler = async (payload) => {
    try {
      const payloadForDelete = { ...payload, id: payload.jobTargetId };
      const deleteSiteData = await deletemachinewisejobtarget(payloadForDelete);
      if (deleteSiteData.success === true) {
        message.success("Deleted successfully");
        await fetchMachineWiseJobTarget(true);
      }
    } catch (error) {
      message.error(error.message);
      console.log("Error in deleting", error);
    }
  };

  const cancel = () => {
    message.error("Oh O! You were accidentally deleting data");
  };

  const enableInsertion = () => {
    setActivatebtn(true);
  };

  useEffect(() => {
    fetchMachineWiseJobTarget();
    fetchMachineJobAndShift();
  }, []);

  const jobTargetFields = [
    [
      {
        name: "mc_name",
        label: "Machine Name",
        type: "select",
        rules: [{ required: true, message: "Machine name is required" }],
        options:
          machinesList?.map((machine) => ({
            value: machine.id,
            label: machine.mc_name,
          })) || [],
        colSpan: 24,
      },
    ],
    [
      {
        name: "job_name",
        label: "Job Name",
        type: "select",
        rules: [{ required: true, message: "Job name is required" }],
        options:
          jobList?.map((job) => ({ value: job.id, label: job.job_name })) || [],
        colSpan: 12,
      },
      {
        name: "shift_name",
        label: "Shift",
        type: "select",
        rules: [{ required: true, message: "Shift is required" }],
        options:
          shiftList?.map((shift) => ({
            value: shift.id,
            label: shift.shift_name,
          })) || [],
        colSpan: 12,
      },
    ],
    [
      {
        name: "target_arc_on_time",
        label: "Target Arc-on Time",
        type: "number",
        rules: [
          { required: true, message: "Target arc-on time is required" },
          { type: "number", min: 0, message: "Must be a positive number" },
        ],
        placeholder: "Ex. 10",
        precision: 2,
        min: 0,
        colSpan: 12,
      },
      {
        name: "target_job_count",
        label: "Number Of Target Jobs",
        type: "number",
        rules: [
          { required: true, message: "Number of target jobs is required" },
          { type: "number", min: 1, message: "Must be at least 1" },
          {
            validator: (_, value) =>
              value && !Number.isInteger(value)
                ? Promise.reject("Must be an integer")
                : Promise.resolve(),
          },
        ],
        placeholder: "e.g. 3",
        precision: 0,
        min: 1,
        colSpan: 12,
      },
    ],
    [
      {
        name: "target_cost",
        label: "Target Cost",
        type: "number",
        rules: [
          { required: true, message: "Target cost is required" },
          { type: "number", min: 0, message: "Must be a positive number" },
        ],
        placeholder: "Ex. 430",
        precision: 2,
        min: 0,
        colSpan: 12,
      },
      {
        name: "target_deposit_kg",
        label: "Target Deposit (Kg)",
        type: "number",
        rules: [
          { required: true, message: "Target deposit is required" },
          { type: "number", min: 0, message: "Must be a positive number" },
        ],
        placeholder: "Ex. 78",
        precision: 2,
        min: 0,
        colSpan: 12,
      },
    ],
    [
      {
        name: "target_date",
        label: "Target Date",
        type: "date",
        rules: [{ required: true, message: "Target date is required" }],
        format: "DD MMMM YYYY",
        colSpan: 24,
      },
    ],
  ];

  const tableColumns = [...machineWiseJobTargetColumn];
  const data =
    jobTarget?.length > 0
      ? jobTarget.map((data, index) => ({
          key: index.toString(),
          serial: (index + 1).toString(),
          jobTargetId: data.id,
          machine_id: data.machine_id,
          mc_name: data.mc_name,
          job_id: data.job_id,
          job_name: data.job_name,
          shift_id: data.shift_id,
          shift_name: data.shift_name,
          target_arc_on_time: data.target_arc_on_time,
          target_job_count: data.target_job_count,
          target_cost: data.target_cost,
          target_deposit_kg: data.target_deposit_kg,
          target_date: dayjs(data.target_date).format("MMMM DD, YYYY"),
        }))
      : [];

  const powerSpecsFilter = jobTarget
    ? jobTarget.map((power) => ({
        text: power.mc_name,
        value: power.mc_name,
      }))
    : [];

  return (
    <div className="mt-12">
      <h1 className="text-left ml-8 font-semibold dark:text-gray-300">
        Machinewise Job Target
      </h1>
      <div className="flex flex-wrap lg:flex-nowrap justify-center">
        {/* Top Hoarding section */}
        <div className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg h-44 rounded-xl w-full lg:w-80 p-8 pt-9 m-3 bg-center">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-bold text-gray-400">Total Target</p>
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
              Add New Target
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

      {/* For search button */}
      <div className="flex items-center justify-center mt-3 lg:mt-4 pl-2 pr-2 md:pl-3 md:pr-3 lg:pl-4 lg:pr-4">
        <div className="items-center justify-center w-64 md:w-72 lg:w-96">
          <Input.Search
            placeholder="Search"
            style={{ textAlign: "center" }}
            onChange={(e) => {
              const searchTerm = e.target.value;
              setSearch(searchTerm);
              const filter = jobTarget.filter((item) => {
                return (
                  item?.mc_name
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                  item?.job_name
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase())
                );
              });
              //console.log("Filtered data in searching", filter)
              setFiltereddata(filter);
            }}
          />
        </div>
      </div>

      {activateBtn && (
        <ReusableModal
          title="Add New Machinewise Job Target"
          isOpen={activateBtn}
          onClose={closeModal}
          onSubmit={createNewJobTarget}
          fields={jobTargetFields}
          loading={loading}
          currentColor={currentColor}
          isReset
        />
      )}

      {activateEditing && selectedMachineSpec && (
        <ReusableModal
          title="Edit Existing Machinewise Job Target"
          isOpen={activateEditing}
          onClose={closeEditModal}
          onSubmit={updateJobTarget}
          initialValues={{
            mc_name: selectedMachineSpec?.jobDetails?.machine_id,
            job_name: selectedMachineSpec?.jobDetails?.job_id,
            shift_name: selectedMachineSpec?.jobDetails?.shift_id,
            target_arc_on_time:
              selectedMachineSpec?.jobDetails?.target_arc_on_time,
            target_job_count: selectedMachineSpec?.jobDetails?.target_job_count,
            target_cost: selectedMachineSpec?.jobDetails?.target_cost,
            target_deposit_kg:
              selectedMachineSpec?.jobDetails?.target_deposit_kg,
            target_date: selectedMachineSpec?.jobDetails?.target_date
              ? dayjs(selectedMachineSpec?.jobDetails?.target_date)
              : null,
          }}
          fields={jobTargetFields}
          loading={loading}
          currentColor={currentColor}
        />
      )}

      {/* For Table section */}
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
                  if (col.key === "power_name") {
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
                          jobNames={powerSpecsFilter}
                        />
                      ),
                      onFilter: (value, record) =>
                        record.power_name.includes(value),
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
                                {record.power_name}
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
                              onConfirm={() => deleteHandler(record)}
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

export default MachineWiseJobTarget;
