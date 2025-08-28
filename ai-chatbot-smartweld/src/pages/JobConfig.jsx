import React, { useEffect, useState } from "react";
import { earningData } from "../data/sidenavItems";
import {
  deleteJobConfig,
  getJobConfigList,
  updateJobConfigList,
  saveNewJobConfig,
  getmachinejobmappings,
} from "../apicalls/jobConfigAPICalls";
import jobConfigColumn, {
  enableEdit,
  enableDelete,
} from "../tablecolumns/jobConfigColDefinition";
import { Table, message, Popconfirm, Input, Space } from "antd";
import { useStateContext } from "../contexts/ContextProvider";
import Loading from "../components/Loading";
import CustomerFilterDropDown from "../components/CustomerFilterDropDown";
import { getShieldingList } from "../apicalls/shieldingAPICalls";
import { getFillerMaterials } from "../apicalls/fillerMaterialAPICalls";
import ReusableModal from "../components/ReusableModal";

const JobConfig = () => {
  const { currentColor } = useStateContext();

  const [jobConfigList, setJobConfigList] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedJobConfig, setSelectedJobConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [macJob, setMacJob] = useState([]);
  const [shieldingGas, setShieldingGas] = useState([]);
  const [fillerMaterial, setFillerMaterial] = useState([]);

  // Fetch job configurations
  const fetchJobConfig = async () => {
    try {
      setLoading(true);
      const response = await getJobConfigList();
      if (response.success) {
        setJobConfigList(response.data);
      } else {
        message.error("No job config list found");
      }
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch dropdown data
  const getDropDownListData = async () => {
    try {
      const [machineJobData, gasData, fillerData] = await Promise.all([
        getmachinejobmappings(),
        getShieldingList(),
        getFillerMaterials(),
      ]);
      setMacJob(machineJobData.data || []);
      setShieldingGas(gasData.data || []);
      setFillerMaterial(fillerData.data || []);
    } catch (error) {
      message.error("Failed to fetch dropdown data");
    }
  };

  useEffect(() => {
    fetchJobConfig();
    getDropDownListData();
  }, []);

  // Handle edit click
  const handleEditClick = (job) => {
    setSelectedJobConfig(job);
    setIsEditModalOpen(true);
  };

  // Handle delete
  const deleteJobConfigHandler = async (payload) => {
    try {
      const response = await deleteJobConfig({ id: payload.jobConfigId });
      if (response.success) {
        message.success("Job deleted successfully");
        fetchJobConfig();
      }
    } catch (error) {
      message.error(error.message);
    }
  };

  // Save new job config
  const saveANewJobConfig = async (values) => {
    const machineJob = macJob.find(
      (item) => item.id === Number(values.machine_job)
    );
    if (!machineJob) {
      message.error("Invalid Machine Job Selection");
      return;
    }

    const payload = {
      machine_job_info_id: machineJob.id,
      machine_id: machineJob.machine_id,
      job_id: machineJob.job_id,
      shielding_gas_id: values.shielding_gas,
      filler_material_id: values.filler_material,
      weld_curr: values.weld_current,
      weld_volt: values.weld_volt,
      weld_gas: values.weld_gas,
      heat_shrink_temp: values.heat_sink_temp,
      ambience_temp: values.ambience_temp,
      high_weld_cur_threshold: values.high_weld_curr,
      low_weld_cur_threshold: values.low_weld_curr,
      high_weld_volt_threshold: values.high_weld_volt,
      low_weld_volt_threshold: values.low_weld_volt,
      high_weld_gas_threshold: values.high_weld_gas,
      low_weld_gas_threshold: values.low_weld_gas,
      event_threshold_dur: values.event_threshold_dur,
      wire_consumption: values.wire_per_job,
      gas_consumption: values.gas_per_job,
      job_duration: values.arc_dur_per_job,
      per_job_cost: values.cost_per_job,
    };

    try {
      setLoading(true);
      const response = await saveNewJobConfig(payload);
      if (response.success) {
        message.success("Job configuration saved successfully");
        setIsAddModalOpen(false);
        fetchJobConfig();
      } else {
        message.error(response.message || "Failed to save job configuration");
      }
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Update job config
  const updateJobConfig = async (values) => {
    const machineJob = macJob.find(
      (item) => item.id === Number(values.machine_job)
    );
    if (!machineJob) {
      message.error("Invalid Machine Job Selection");
      return;
    }

    const payload = {
      id: selectedJobConfig.jobConfigId,
      machine_job: String(values.machine_job),
      machine_id: machineJob.machine_id,
      job_id: machineJob.job_id,
      shielding_gas_id: Number(values.shielding_gas),
      filler_material_id: Number(values.filler_material),
      weld_curr: values.weld_current,
      weld_volt: values.weld_volt,
      weld_gas: values.weld_gas,
      heat_shrink_temp: values.heat_sink_temp,
      ambience_temp: values.ambience_temp,
      high_weld_cur_threshold: values.high_weld_curr,
      low_weld_cur_threshold: values.low_weld_curr,
      high_weld_volt_threshold: values.high_weld_volt,
      low_weld_volt_threshold: values.low_weld_volt,
      high_weld_gas_threshold: values.high_weld_gas,
      low_weld_gas_threshold: values.low_weld_gas,
      event_threshold_dur: values.event_threshold_dur,
      wire_consumption: values.wire_per_job,
      gas_consumption: values.gas_per_job,
      job_duration: values.arc_dur_per_job,
      per_job_cost: values.cost_per_job,
    };

    try {
      setLoading(true);
      const response = await updateJobConfigList(payload);
      if (response.success) {
        message.success("Job configuration updated successfully");
        setIsEditModalOpen(false);
        fetchJobConfig();
      } else {
        message.error(response.message || "Failed to update job configuration");
      }
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Field definitions for ReusableModal
  const fields = [
    [
      {
        type: "select",
        name: "machine_job",
        label: "Machine-Job",
        placeholder: "Select a machine‑job",
        rules: [{ required: true, message: "Please select a machine - job" }],
        options: macJob.map((m) => ({
          value: m.id,
          label: `${m.mc_name} - ${m.job_name}`,
        })),
        colSpan: 12,
      },
      {
        type: "select",
        name: "shielding_gas",
        label: "Shielding Gas",
        placeholder: "Select a shielding gas",
        rules: [{ required: true, message: "Please select a shielding gas" }],
        options: shieldingGas.map((g) => ({ value: g.id, label: g.gas_name })),
        colSpan: 12,
      },
    ],
    [
      {
        type: "select",
        name: "filler_material",
        label: "Filler Material",
        placeholder: "Select a filler material",
        rules: [{ required: true, message: "Please select a filler material" }],
        options: fillerMaterial.map((f) => ({ value: f.id, label: f.fm_name })),
        colSpan: 7,
      },
      {
        type: "number",
        name: "weld_current",
        label: "Weld Current",
        rules: [
          { required: true, message: "Weld current is required" },
          {
            pattern: /^\d{3,}(\.\d+)?$/,
            message: "Must be a number with 3+ digits",
          },
        ],
        placeholder: "Ex. 100",
        colSpan: 6,
        min: 0,
        precision: 2,
      },
      {
        type: "number",
        name: "weld_volt",
        label: "Weld Voltage",
        rules: [
          { required: true, message: "Weld voltage is required" },
          {
            pattern: /^\d{2,}(\.\d+)?$/,
            message: "Must be a number with 2+ digits",
          },
        ],
        placeholder: "Ex. 20",
        colSpan: 6,
        min: 0,
        precision: 2,
      },
      {
        type: "number",
        name: "weld_gas",
        label: "Weld Gas",
        rules: [
          { required: true, message: "Weld gas is required" },
          {
            pattern: /^\d{2,}(\.\d+)?$/,
            message: "Must be a number with 2+ digits",
          },
        ],
        placeholder: "Ex. 10",
        colSpan: 5,
        min: 0,
        precision: 2,
      },
    ],
    [
      {
        type: "number",
        name: "heat_sink_temp",
        label: "Heat Sink Temp",
        rules: [{ pattern: /^\d+(\.\d+)?$/, message: "Must be a number" }],
        placeholder: "Ex. 25",
        colSpan: 12,
        min: 0,
        precision: 2,
      },
      {
        type: "number",
        name: "ambience_temp",
        label: "Ambience Temp",
        rules: [{ pattern: /^\d+(\.\d+)?$/, message: "Must be a number" }],
        placeholder: "Ex. 30",
        colSpan: 12,
        min: 0,
        precision: 2,
      },
    ],
    [
      {
        type: "number",
        name: "high_weld_curr",
        label: "High Weld Current Threshold",
        rules: [{ pattern: /^\d+(\.\d+)?$/, message: "Must be a number" }],
        placeholder: "Ex. 150",
        colSpan: 8,
        min: 0,
        precision: 2,
      },
      {
        type: "number",
        name: "high_weld_volt",
        label: "High Weld Volt Threshold",
        rules: [{ pattern: /^\d+(\.\d+)?$/, message: "Must be a number" }],
        placeholder: "Ex. 30",
        colSpan: 8,
        min: 0,
        precision: 2,
      },
      {
        type: "number",
        name: "high_weld_gas",
        label: "High Weld Gas Threshold",
        rules: [{ pattern: /^\d+(\.\d+)?$/, message: "Must be a number" }],
        placeholder: "Ex. 15",
        colSpan: 8,
        min: 0,
        precision: 2,
      },
    ],
    [
      {
        type: "number",
        name: "low_weld_curr",
        label: "Low Weld Current Threshold",
        rules: [{ pattern: /^\d+(\.\d+)?$/, message: "Must be a number" }],
        placeholder: "Ex. 50",
        colSpan: 8,
        min: 0,
        precision: 2,
      },
      {
        type: "number",
        name: "low_weld_volt",
        label: "Low Weld Volt Threshold",
        rules: [{ pattern: /^\d+(\.\d+)?$/, message: "Must be a number" }],
        placeholder: "Ex. 10",
        colSpan: 8,
        min: 0,
        precision: 2,
      },
      {
        type: "number",
        name: "low_weld_gas",
        label: "Low Weld Gas Threshold",
        rules: [],
        placeholder: "Ex. 5",
        colSpan: 8,
        min: 0,
        precision: 2,
      },
    ],
    [
      {
        type: "number",
        name: "wire_per_job",
        label: "Wire Consumption Per Job",
        rules: [],
        placeholder: "Ex. 2.5",
        colSpan: 8,
        min: 0,
        precision: 2,
      },
      {
        type: "number",
        name: "gas_per_job",
        label: "Gas Consumption Per Job",
        rules: [],
        placeholder: "Ex. 1.5",
        colSpan: 8,
        min: 0,
        precision: 2,
      },
      {
        type: "number",
        name: "cost_per_job",
        label: "Cost Per Job",
        rules: [
          { required: true, message: "Cost is required" },
          {
            pattern: /^\d{2,}(\.\d+)?$/,
            message: "Must be a number with 2+ digits",
          },
        ],
        placeholder: "Ex. 50",
        colSpan: 8,
        min: 0,
        precision: 2,
      },
    ],
    [
      {
        type: "number",
        name: "arc_dur_per_job",
        label: "Arc Duration Per Job (sec)",
        rules: [{ pattern: /^\d+(\.\d+)?$/, message: "Must be a number" }],
        placeholder: "Ex. 10",
        colSpan: 12,
        min: 0,
        precision: 2,
      },
      {
        type: "number",
        name: "event_threshold_dur",
        label: "Event Threshold Dur (sec)",
        rules: [
          { required: true, message: "Event threshold is required" },
          { pattern: /^\d+$/, message: "Must be a whole number" },
        ],
        placeholder: "Ex. 5",
        colSpan: 12,
        min: 0,
        precision: 2,
      },
    ],
  ];

  // Table data mapping
  const data =
    jobConfigList?.length > 0
      ? jobConfigList.map((item, index) => ({
          key: index.toString(),
          serial: (index + 1).toString(),
          jobConfigId: item.id,
          job_name: item.job_name,
          job_id: item.job_id,
          mc_name: item.mc_name,
          machine_id: item.machine_id,
          machine_job: `${item.machine_id}-${item.job_id}`,
          machine_job_info_id: item.machine_job_info_id,
          gas_name: item.gas_name,
          fm_name: item.fm_name,
          filler_material_id: item.filler_material_id,
          shielding_gas_id: item.shielding_gas_id,
          weld_curr: parseFloat(item.weld_curr ?? 0),
          weld_volt: parseFloat(item.weld_volt ?? 0),
          weld_gas: parseFloat(item.weld_gas ?? 0),
          heat_shrink_temp: parseFloat(item.heat_shrink_temp ?? 0),
          ambience_temp: parseFloat(item.ambience_temp ?? 0),
          high_weld_cur_threshold: parseFloat(
            item.high_weld_cur_threshold ?? 0
          ),
          low_weld_cur_threshold: parseFloat(item.low_weld_cur_threshold ?? 0),
          high_weld_volt_threshold: parseFloat(
            item.high_weld_volt_threshold ?? 0
          ),
          low_weld_volt_threshold: parseFloat(
            item.low_weld_volt_threshold ?? 0
          ),
          high_weld_gas_threshold: parseFloat(
            item.high_weld_gas_threshold ?? 0
          ),
          low_weld_gas_threshold: parseFloat(item.low_weld_gas_threshold ?? 0),
          event_threshold_dur: parseFloat(item.event_threshold_dur ?? 0),
          wire_consumption: parseFloat(item.wire_consumption ?? 0),
          gas_consumption: parseFloat(item.gas_consumption ?? 0),
          per_job_cost: parseFloat(item.per_job_cost ?? 0),
          job_duration: parseFloat(item.job_duration ?? 0),
        }))
      : [];

  const jobNameFilters = jobConfigList.map((job) => ({
    text: job.job_name,
    value: job.job_name,
  }));
  const machineNameFilters = jobConfigList.map((machine) => ({
    text: machine.mc_name,
    value: machine.mc_name,
  }));

  const tableColumns = jobConfigColumn.map((col) => {
    if (col.key === "job_name" || col.key === "mc_name") {
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
            jobNames={col.key === "job_name" ? jobNameFilters : undefined}
            machineNames={
              col.key === "mc_name" ? machineNameFilters : undefined
            }
          />
        ),
        onFilter: (value, record) => record[col.key].includes(value),
        render: (_, record) => ({
          props: { style: { background: "#737B7C" } },
          children: (
            <div className="text-center">
              <h1 style={{ fontSize: "13px", color: "#CDD1D2" }}>
                {record[col.key]}
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
            <div className="flex justify-center">
              <span
                className="material-symbols-outlined cursor-pointer"
                style={{ color: currentColor }}
                onClick={() => handleEditClick(record)}
              >
                edit
              </span>
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
                onConfirm={() => deleteJobConfig(record)}
                onCancel={() =>
                  message.error("Oh O! You were accidentally deleting data")
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
  });

  return (
    <div className="flex-nowrap justify-center">
      <h1 className="text-lg ml-8 font-semibold dark:text-gray-300">
        JOB CONFIGURATION
      </h1>
      <div className="flex flex-wrap lg:flex-nowrap justify-center">
        <div className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg h-44 rounded-xl w-full lg:w-80 p-8 pt-9 m-3">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-bold text-gray-400">
                Total Job Configuration List
              </p>
              <p className="text-2xl">{jobConfigList.length}</p>
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
              onClick={() => setIsAddModalOpen(true)}
            >
              Add New Job Configuration
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
        <div className="w-64 md:w-72 lg:w-96">
          <Input.Search
            placeholder="Search Jobs"
            onChange={(e) => {
              const term = e.target.value;
              setSearch(term);
              setFilteredData(
                jobConfigList.filter((item) =>
                  item.job_name.toLowerCase().includes(term.toLowerCase())
                )
              );
            }}
          />
        </div>
        <div className="w-64 md:w-72 lg:w-96 ml-10">
          <Input.Search
            placeholder="Search Machines"
            onChange={(e) => {
              const term = e.target.value;
              setSearch(term);
              setFilteredData(
                jobConfigList.filter((item) =>
                  item.mc_name.toLowerCase().includes(term.toLowerCase())
                )
              );
            }}
          />
        </div>
      </div>

      <ReusableModal
        key={"add"}
        title="Add New Job Configuration"
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={saveANewJobConfig}
        initialValues={{}}
        fields={fields}
        loading={loading}
        currentColor={currentColor}
        className={"!w-[800px]"}
      />

      {selectedJobConfig && (
        <ReusableModal
          key={selectedJobConfig.machine_job_info_id}
          title="Edit Job Configuration"
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={updateJobConfig}
          initialValues={{
            machine_job: selectedJobConfig.machine_job_info_id,
            shielding_gas: selectedJobConfig.shielding_gas_id,
            filler_material: selectedJobConfig.filler_material_id,
            weld_current: selectedJobConfig.weld_curr,
            weld_volt: selectedJobConfig.weld_volt,
            weld_gas: selectedJobConfig.weld_gas,
            heat_sink_temp: selectedJobConfig.heat_shrink_temp,
            ambience_temp: selectedJobConfig.ambience_temp,
            high_weld_curr: selectedJobConfig.high_weld_cur_threshold,
            low_weld_curr: selectedJobConfig.low_weld_cur_threshold,
            high_weld_volt: selectedJobConfig.high_weld_volt_threshold,
            low_weld_volt: selectedJobConfig.low_weld_volt_threshold,
            high_weld_gas: selectedJobConfig.high_weld_gas_threshold,
            low_weld_gas: selectedJobConfig.low_weld_gas_threshold,
            event_threshold_dur: selectedJobConfig.event_threshold_dur,
            wire_per_job: selectedJobConfig.wire_consumption,
            gas_per_job: selectedJobConfig.gas_consumption,
            arc_dur_per_job: selectedJobConfig.job_duration,
            cost_per_job: selectedJobConfig.per_job_cost,
          }}
          fields={fields}
          loading={loading}
          currentColor={currentColor}
          className={"!w-[800px]"}
        />
      )}

      {loading ? (
        <Loading message="Loading!" />
      ) : (
        <div className="bg-white dark:text-gray-200 dark:bg-main-dark-bg rounded-xl mt-3 lg:mt-6 flex flex-col items-center justify-center pt-3 px-2">
          <div className="w-full md:w-4/5 lg:w-[90%] overflow-x-auto mb-3 rounded-xl">
            <Table
              style={{
                backgroundColor: currentColor,
                padding: "5px",
                borderRadius: "10px",
              }}
              columns={tableColumns}
              dataSource={search ? filteredData : data}
              className="uppercase text-center"
              scroll={{ x: true }}
              bordered
              size="small"
              pagination={{
                defaultPageSize: 5,
                showSizeChanger: true,
                pageSizeOptions: ["5", "10", "20", "50"],
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default JobConfig;
