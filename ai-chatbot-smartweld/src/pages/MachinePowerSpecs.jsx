import React, { useEffect, useState } from "react";
import { earningData } from "../data/sidenavItems";
import powerSpecsListColumn, {
  enableEdit,
  enableDelete,
} from "../tablecolumns/powerSpecsColDefinition";
import {
  Table,
  message,
  Popconfirm,
  Space,
  Modal,
  Form,
  Input,
  Button,
  Select,
  InputNumber,
} from "antd";
import { useStateContext } from "../contexts/ContextProvider";
import Loading from "../components/Loading";
import CustomerFilterDropDown from "../components/CustomerFilterDropDown";
import {
  createmachinePowerSpecification,
  deletemachinePowerSpecification,
  getmachinePowerSpecification,
  updatemachinePowerSpecification,
} from "../apicalls/powerSpecAPICall";
import { getMachines } from "../apicalls/machinesCall";

const ReusableModal = ({
  title,
  isOpen,
  onClose,
  onSubmit,
  initialValues,
  fields,
  loading,
  currentColor,
  className,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue(initialValues);
  }, [initialValues, form]);

  return (
    <Modal
      title={title}
      open={isOpen}
      onCancel={onClose}
      footer={false}
      className={`text-center font-semibold ${className}`}
    >
      <hr />
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
        onFinish={onSubmit}
        className="p-2 rounded-lg text-white dark:bg-secondary-dark-bg dark:text-gray-200"
      >
        {fields.map((field, index) => (
          <Form.Item
            key={index}
            name={field.name}
            label={field.label}
            rules={field.rules}
            className="text-center text-white"
          >
            {field.type === "select" ? (
              <Select
                placeholder={field.placeholder}
                className="border border-gray-500 rounded-md text-left"
              >
                {field.options.map((option) => (
                  <Select.Option key={option.value} value={option.value}>
                    {option.label}
                  </Select.Option>
                ))}
              </Select>
            ) : field.type === "number" ? (
              <InputNumber
                className="border-1 border-gray-600 w-full"
                placeholder={field.placeholder}
                min={field.min}
                max={field.max}
                step={field.step}
                precision={field.precision}
              />
            ) : (
              <Input
                className="border-1 border-gray-600"
                placeholder={field.placeholder}
              />
            )}
          </Form.Item>
        ))}
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
              onClick={() => {
                form.resetFields();
                onClose();
              }}
              disabled={loading}
            >
              Cancel
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

const MachinePowerSpecs = () => {
  const { currentColor } = useStateContext();
  const [powerSpecList, setPowerSpecList] = useState(null);
  const [machineList, setMachineList] = useState(null);
  const [activateBtn, setActivatebtn] = useState(false);
  const [activateEditing, setActivateEditing] = useState(false);
  const [selectedMachineSpec, setSelectedMachineSpec] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filtereddata, setFiltereddata] = useState([]);
  const [fetched, setFetched] = useState(false);

  const fetchPowerSpecsAndMachines = async (force = false) => {
    try {
      if (!fetched || force) {
        setLoading(true);
        const fetchPowers = await getmachinePowerSpecification();
        setPowerSpecList(fetchPowers.data);
        const fetchMachines = await getMachines();
        setMachineList(fetchMachines.data);
        setLoading(false);
        setFetched(true);
      }
    } catch (error) {
      setLoading(false);
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

  const saveNewLine = async (values) => {
    try {
      const payload = {
        machine_id: values.mc_name,
        cost_per_unit: values.cost_per_unit,
        efficiency: values.efficiency,
        power_factor: values.power_factor,
        power_name: values.power_name,
      };
      setLoading(true);
      const saveLoc = await createmachinePowerSpecification(payload);
      if (saveLoc.success) {
        message.success("Specification added successfully");
        setActivatebtn(false);
        await fetchPowerSpecsAndMachines(true);
      } else {
        message.info("Data not saved");
      }
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const updatePowerSpecs = async (values) => {
    try {
      const payload = {
        id: selectedMachineSpec.jobDetails.specId,
        machine_id: values.mc_name,
        cost_per_unit: values.cost_per_unit,
        efficiency: values.efficiency,
        power_factor: values.power_factor,
        power_name: values.power_name,
      };
      const update = await updatemachinePowerSpecification(payload);
      if (update.success) {
        message.success("Power Specification Updated Successfully");
        setActivateEditing(false);
        await fetchPowerSpecsAndMachines(true);
      }
    } catch (error) {
      message.error(error.message);
    }
  };

  const deleteLineHandler = async (payload) => {
    try {
      const deletePayload = { ...payload, id: payload.specId };
      const deleteSiteData = await deletemachinePowerSpecification(
        deletePayload
      );
      if (deleteSiteData.success) {
        message.success("Specification deleted successfully");
        await fetchPowerSpecsAndMachines(true);
      }
    } catch (error) {
      message.error(error.message);
    }
  };

  const cancel = () => {
    message.error("Oh O! You were accidentally deleting data");
  };

  const closeModal = () => {
    setActivatebtn(false);
  };

  const enableInsertion = () => {
    setActivatebtn(true);
  };

  useEffect(() => {
    fetchPowerSpecsAndMachines();
  }, []);

  const formFields = [
    {
      name: "mc_name",
      label: "Machine Name",
      type: "select",
      rules: [{ required: true, message: "Machine name is required" }],
      placeholder: "Select machine name",
      options:
        machineList?.map((machine) => ({
          value: machine.id,
          label: machine.mc_name,
        })) || [],
    },
    {
      name: "power_name",
      label: "Power Name",
      type: "input",
      rules: [
        { required: true, message: "Power name is required" },
        {
          pattern: /^(?=.*[A-Za-z0-9])[A-Za-z0-9\s]+$/,
          message:
            "Power name must contain at least one letter or number and can only include letters, numbers, and spaces",
        },
      ],
      placeholder: "Ex. Power Source A",
    },
    {
      name: "power_factor",
      label: "Power Factor",
      type: "number",
      rules: [
        { required: true, message: "Power factor is required" },
        {
          type: "number",
          min: 0,
          max: 1,
          message: "Power factor must be between 0 and 1",
        },
      ],
      placeholder: "Ex. 0.85",
      min: 0,
      max: 1,
      precision: 2,
    },
    {
      name: "efficiency",
      label: "Efficiency (%)",
      type: "number",
      rules: [
        { required: true, message: "Efficiency is required" },
        {
          type: "number",
          min: 0,
          max: 100,
          message: "Efficiency must be between 0 and 100",
        },
      ],
      placeholder: "Ex. 95",
      min: 0,
      max: 100,
      precision: 2,
    },
    {
      name: "cost_per_unit",
      label: "Cost Per Unit",
      type: "number",
      rules: [
        { required: true, message: "Cost per unit is required" },
        {
          type: "number",
          min: 0,
          message: "Cost per unit must be a positive number",
        },
      ],
      placeholder: "Ex. 5.50",
      min: 0,
      precision: 2,
    },
  ];

  const tableColumns = powerSpecsListColumn.map((col) => {
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
            jobNames={
              powerSpecList?.map((power) => ({
                text: power.power_name,
                value: power.power_name,
              })) || []
            }
          />
        ),
        onFilter: (value, record) => record.power_name.includes(value),
        render: (_, record) => {
          return {
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
                    {record.power_name}
                  </h1>
                </div>
              </div>
            ),
          };
        },
      };
    }
    if (col.key === "edit") {
      return {
        ...col,
        render: (_, record) => {
          return {
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
          };
        },
      };
    }
    if (col.key === "delete") {
      return {
        ...col,
        render: (_, record) => {
          return {
            props: {
              style: { background: "#737B7C" },
            },
            children: (
              <div className="flex gap-3 cursor-pointer justify-center items-center">
                <Popconfirm
                  title="Are you sure to delete?"
                  onConfirm={() => deleteLineHandler(record)}
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
          };
        },
      };
    }
    return col;
  });

  const data =
    powerSpecList?.map((data, index) => ({
      key: index.toString(),
      serial: (index + 1).toString(),
      specId: data.id,
      machine_id: data.machine_id,
      mc_name: data.mc_name,
      power_name: data.power_name,
      efficiency: parseFloat(data.efficiency ?? 0),
      cost_per_unit: parseFloat(data.cost_per_unit ?? 0),
      power_factor: parseFloat(data.power_factor ?? 0),
    })) || [];

  return (
    <div className="mt-12">
      <h1 className="text-left ml-8 font-semibold dark:text-gray-300">
        Power Specification List
      </h1>
      <div className="flex flex-wrap lg:flex-nowrap justify-center">
        <div className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg h-44 rounded-xl w-full lg:w-80 p-8 pt-9 m-3">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-bold text-gray-400">Total Specs</p>
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
              Add New Specification
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
            placeholder="Search Power Name"
            onChange={(e) => {
              const searchTerm = e.target.value;
              setSearch(searchTerm);
              const filter =
                powerSpecList?.filter((item) =>
                  item.power_name
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())
                ) || [];
              setFiltereddata(filter);
            }}
          />
        </div>
      </div>
      <ReusableModal
        title="Add New Specification"
        isOpen={activateBtn}
        onClose={closeModal}
        onSubmit={saveNewLine}
        initialValues={{}}
        fields={formFields}
        loading={loading}
        currentColor={currentColor}
      />
      {selectedMachineSpec && (
        <ReusableModal
          title="Edit Existing Specification"
          isOpen={activateEditing}
          onClose={closeEditModal}
          onSubmit={updatePowerSpecs}
          initialValues={{
            mc_name: selectedMachineSpec.jobDetails.machine_id,
            power_name: selectedMachineSpec.jobDetails.power_name,
            power_factor: selectedMachineSpec.jobDetails.power_factor,
            efficiency: selectedMachineSpec.jobDetails.efficiency,
            cost_per_unit: selectedMachineSpec.jobDetails.cost_per_unit,
          }}
          fields={formFields}
          loading={loading}
          currentColor={currentColor}
        />
      )}
      {loading ? (
        <Loading message="Loading!" />
      ) : (
        <div className="bg-white dark:text-gray-200 dark:bg-main-dark-bg rounded-xl mt-3 lg:mt-6 flex md:flex-col items-center justify-center pt-3 pl-2 pr-2">
          <div className="w-72 md:w-[500px] lg:w-[950px] mb-3">
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

export default MachinePowerSpecs;
