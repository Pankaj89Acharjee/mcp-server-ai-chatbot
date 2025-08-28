import React, { useEffect, useState } from "react";
import { earningData } from "../data/sidenavItems";
import shieldingColumn from "../tablecolumns/shieldingColDefinition";
import { Table, message, Popconfirm, Input} from "antd";
import { useStateContext } from "../contexts/ContextProvider";
import Loading from "../components/Loading";
import CustomerFilterDropDown from "../components/CustomerFilterDropDown";
import {
  createShieldingGas,
  deleteShieldingGas,
  getShieldingGroup,
  getShieldingList,
  updateShieldingGas,
} from "../apicalls/shieldingAPICalls";
import ReusableModal from "../components/ReusableModal";

const ShieldingGas = () => {
  const { currentColor } = useStateContext();
  const [gases, setGases] = useState([]);
  const [filteredGasNames, setFilteredGasNames] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activateBtn, setActivateBtn] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [gasGroups, setGasGroups] = useState([]);

  // Fetch shielding gases
  const getShieldingGases = async () => {
    try {
      setLoading(true);
      const fetchGasList = await getShieldingList();
      if (fetchGasList.success) {
        setGases(fetchGasList.data);
      } else {
        message.error(fetchGasList.message);
      }
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch gas groups
  const fetchGasGroups = async () => {
    try {
      const getGasGrouping = await getShieldingGroup();
      if (getGasGrouping.success) {
        setGasGroups(getGasGrouping.data);
      } else {
        message.error(getGasGrouping.message);
      }
    } catch (error) {
      message.error(error.message);
    }
  };

  // Handle edit click
  const handleEditClick = (e, record) => {
    setIsEditing(true);
    setSelectedData(record);
  };

  // Save new shielding gas
  const saveNewShieldingGas = async (values) => {
    const payload = {
      gas_group_id: values.lookup_value,
      gas_cost_per_litre: parseInt(values.gas_cost_per_litre, 10),
      gas_description: values.gas_description,
      gas_name: values.gas_name,
    };
    try {
      setSaved(true);
      const saveNewGas = await createShieldingGas(payload);
      if (saveNewGas.success) {
        message.success("New shielding gas created successfully");
        setActivateBtn(false);
        getShieldingGases();
      } else {
        message.error(saveNewGas.message);
      }
    } catch (error) {
      message.error(error.message);
    } finally {
      setSaved(false);
    }
  };

  // Update shielding gas
  const updateShieldingGasHandle = async (values) => {
    const payload = {
      id: selectedData?.id,
      gas_name: values.gas_name,
      gas_description: values.gas_description,
      gas_group_id: values.lookup_value || selectedData?.gas_group_id,
      gas_cost_per_litre: parseInt(values.gas_cost_per_litre, 10),
    };
    try {
      setLoading(true);
      const update = await updateShieldingGas(payload);
      if (update.success) {
        message.success("Updated Successfully!");
        setIsEditing(false);
        setSelectedData(null);
        getShieldingGases();
      } else {
        message.error(update.message);
      }
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete shielding gas
  const deleteMachStatus = async (record) => {
    try {
      setLoading(true);
      const deleteStatus = await deleteShieldingGas(record);
      if (deleteStatus.success) {
        message.success("Successfully deleted");
        getShieldingGases();
      } else {
        message.error(deleteStatus.message);
      }
    } catch (error) {
      message.error(error.message);
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
    getShieldingGases();
    fetchGasGroups();
  }, []);

  useEffect(() => {
    if (gases.length > 0) {
      const filteredGasNames = Array.from(
        new Set(gases.map((gas) => gas.gas_name))
      ).map((gas_name) => ({
        text: gas_name,
        value: gas_name,
      }));
      setFilteredGasNames(filteredGasNames);
    }
  }, [gases]);

  const tableColumns = [...shieldingColumn];

  const data =
    gases.length > 0
      ? gases.map((data, index) => ({
          key: index.toString(),
          serial: (index + 1).toString(),
          id: data.id,
          gas_name: data.gas_name,
          gas_description: data.gas_description,
          gas_cost_per_litre: parseFloat(data.gas_cost_per_litre ?? 0),
          lookup_value: data.lookup_value,
          gas_group_id: data.gas_group_id,
        }))
      : [];

  // Form fields with comprehensive validations
  const formFields = [
    [
      {
        type: "input",
        name: "gas_name",
        label: "Shielding Gas Name",
        rules: [
          { required: true, message: "Gas name is required" },
          {
            pattern: /^[A-Za-z0-9+-]+$/,
            message:
              "Gas name must be alphanumeric with hyphens and plus signs allowed",
          },
          { min: 2, message: "Gas name must be at least 2 characters" },
          { max: 50, message: "Gas name cannot exceed 50 characters" },
        ],
        placeholder: "Ex. Argon-123",
      },
      {
        type: "input",
        name: "gas_description",
        label: "Gas Description",
        rules: [
          { max: 200, message: "Description cannot exceed 200 characters" },
          {
            pattern: /^[A-Za-z0-9\s.,-,+]*$/,
            message:
              "Description can only contain letters, numbers, spaces, commas, periods, and hyphens",
          },
        ],
        placeholder: "Ex. High-purity shielding gas",
      },
    ],
    [
      {
        type: "number",
        name: "gas_cost_per_litre",
        label: "Gas Cost/Litre",
        rules: [
          { required: true, message: "Gas cost per litre is required" },
          { type: "number", min: 0, message: "Cost must be a positive number" },
          {
            type: "number",
            max: 1000000,
            message: "Cost cannot exceed 1,000,000",
          },
        ],
        placeholder: "Ex. 150.50",
        precision: 2,
      },
      {
        type: "select",
        name: "lookup_value",
        label: "Shielding Gas Group",
        rules: [{ required: true, message: "Gas group is required" }],
        options: gasGroups.map((group) => ({
          value: group.id,
          label: group.lookup_value,
        })),
        placeholder: "Select gas group",
      },
    ],
  ];

  return (
    <div className="mt-12">
      <h1 className="text-left ml-8 font-semibold dark:text-gray-300">
        Shielding Gas
      </h1>
      <div className="flex flex-wrap lg:flex-nowrap justify-center">
        <div className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg h-44 rounded-xl w-full lg:w-80 p-8 pt-9 m-3 bg-center">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-bold text-gray-400">Total Gases</p>
              <p className="text-2xl">{gases.length}</p>
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
              Add New Gas
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
        <div className="items-center justify-center w-64 md:w-72 lg:w-96">
          <Input.Search
            placeholder="Search Shielding Gas"
            onChange={(e) => {
              const searchTerm = e.target.value;
              setSearch(searchTerm);
              const filter = gases.filter(
                (item) =>
                  item.gas_name
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                  (item.gas_description &&
                    item.gas_description
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase())) ||
                  item.gas_cost_per_litre.toString().includes(searchTerm) ||
                  item.lookup_value
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())
              );
              setFilteredData(filter);
            }}
          />
        </div>
      </div>

      {/* Create Modal */}
      <ReusableModal
        title="Add New Shielding Gas"
        isOpen={activateBtn}
        onClose={() => setActivateBtn(false)}
        onSubmit={saveNewShieldingGas}
        initialValues={{}}
        fields={formFields}
        loading={saved}
        currentColor={currentColor}
      />

      {/* Edit Modal */}
      {isEditing && selectedData && (
        <ReusableModal
          title="Edit Shielding Gas"
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
          onSubmit={updateShieldingGasHandle}
          initialValues={{
            gas_name: selectedData.gas_name,
            gas_description: selectedData.gas_description,
            gas_cost_per_litre: selectedData.gas_cost_per_litre,
            lookup_value: selectedData.gas_group_id,
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
          <div className="items-center justify-center text-center w-72 md:w-[500px] lg:w-[950px] mb-3 rounded-xl">
            <div className="w-full text-sm">
              <Table
                style={{
                  backgroundColor: currentColor,
                  padding: "5px",
                  borderRadius: "10px",
                }}
                columns={tableColumns.map((col) => {
                  if (col.key === "gas_name") {
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
                          jobNames={filteredGasNames}
                        />
                      ),
                      onFilter: (value, record) =>
                        record.gas_name.includes(value),
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
                              {record.gas_name}
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
                              onConfirm={() => deleteMachStatus(record)}
                              onCancel={cancel}
                              okText="Sure"
                              cancelText="Cancel"
                              overlayClassName="custom-popconfirm"
                            >
                              <i style={{ color: currentColor }}>
                                <span className="material-symbols-outlined text-xl font-bold">
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
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShieldingGas;
