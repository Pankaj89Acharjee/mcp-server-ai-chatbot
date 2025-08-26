import React, { useEffect, useState } from "react";
import { earningData } from "../data/sidenavItems";
import fillerMaterialColumn, {
  enableEdit,
  enableDelete,
} from "../tablecolumns/fillerMaterialColDefinition";
import { Table, message, Popconfirm, Space, Input } from "antd";
import { useStateContext } from "../contexts/ContextProvider";
import Loading from "../components/Loading";
import CustomerFilterDropDown from "../components/CustomerFilterDropDown";
import {
  createFillerMaterials,
  deleteFillerMaterials,
  getFillerMaterials,
  updateFillerMaterials,
} from "../apicalls/fillerMaterialAPICalls";
import ReusableModal from "../components/ReusableModal"; // Adjust the import path as needed

const FillerMaterial = () => {
  const { currentColor } = useStateContext();

  const [fillerMaterial, setFillerMaterial] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [activateBtn, setActivatebtn] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filtereddata, setFiltereddata] = useState([]);

  const getFillerMatList = async () => {
    try {
      setLoading(true);
      const fetchMaterialList = await getFillerMaterials();
      if (fetchMaterialList.success === true) {
        setFillerMaterial(fetchMaterialList.data);
      } else {
        message.error(fetchMaterialList.message);
      }
    } catch (error) {
      console.log("Error occurred", error);
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (e, jobId) => {
    const eventData = enableEdit(e, jobId);
    setIsEditing(true);
    setSelectedData(eventData);
  };

  const closeEditModal = () => {
    setIsEditing(false);
    setSelectedData(null);
  };

  const closeModal = () => {
    setActivatebtn(false);
  };

  const createNewFillerMaterial = async (values) => {
    try {
      setSaved(true);
      const saveNewFillerMat = await createFillerMaterials({ ...values });
      if (saveNewFillerMat.success === true) {
        message.success("New filler material created successfully");
        setActivatebtn(false);
        getFillerMatList();
      } else {
        message.error(saveNewFillerMat.message);
      }
    } catch (error) {
      message.error(error.message);
      console.log("Error in creating new filler material", error);
    } finally {
      setSaved(false);
    }
  };

  const updateSheildingGas = async (values) => {
    try {
      setLoading(true);
      const payload = {
        id: selectedData?.jobDetails.id,
        ...values,
      };
      const update = await updateFillerMaterials(payload);
      if (update.success === true) {
        message.success("Updated Successfully!");
        closeEditModal();
        getFillerMatList();
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

  const deleteMachStatus = async (payload) => {
    try {
      setLoading(true);
      const deleteMaterial = await deleteFillerMaterials({ ...payload });
      if (deleteMaterial.success === true) {
        message.success("Successfully deleted");
        getFillerMatList();
      } else {
        message.error(deleteMaterial.message);
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
    setActivatebtn(true);
  };

  const fillerMaterialFilters = fillerMaterial
    ? fillerMaterial.map((job) => ({
        text: job.fm_name,
        value: job.fm_name,
      }))
    : [];

  useEffect(() => {
    getFillerMatList();
  }, []);

  const tableColumns = [...fillerMaterialColumn];

  const data =
    fillerMaterial?.length > 0
      ? fillerMaterial.map((data, index) => ({
          key: index.toString(),
          serial: (index + 1).toString(),
          id: data.id,
          fm_name: data.fm_name,
          wire_diameter_mm: parseFloat(data.wire_diameter_mm ?? 0),
          cost_per_kg: parseFloat(data.cost_per_kg ?? 0),
          trade_name: data.trade_name,
          fm_description: data.fm_description,
          roller_diameter: parseFloat(data.roller_diameter ?? 0),
          calssification: data.calssification,
          wire_density: parseFloat(data.wire_density ?? 0),
          wire_weight_per_length: parseFloat(data.wire_weight_per_length ?? 0),
        }))
      : [];

  const fields = [
    [
      {
        type: "input",
        name: "fm_name",
        label: "Filler Material Name",
        rules: [
          { required: true, message: "Filler material name is required" },
          {
            pattern: /^[A-Za-z0-9\s().]+$/,
            message:
              "Must be alphanumeric and may include spaces, parentheses, and periods",
          },
          { max: 50, message: "Cannot exceed 50 characters" },
        ],

        placeholder: "Ex. SD11",
      },
      {
        type: "input",
        name: "trade_name",
        label: "Trade Name",
        rules: [
          { required: true, message: "Trade name is required" },
          { pattern: /^[a-zA-Z0-9]+$/, message: "Must be alphanumeric" },
          { max: 50, message: "Cannot exceed 50 characters" },
        ],
        placeholder: "Ex. SD11",
      },
    ],
    [
      {
        type: "input",
        name: "fm_description",
        label: "Filler Material Description",
        rules: [{ max: 200, message: "Cannot exceed 200 characters" }],
        placeholder: "Ex. A25482",
        colSpan: 24,
      },
    ],
    [
      {
        type: "number",
        name: "cost_per_kg",
        label: "Cost Per Kg",
        rules: [
          { required: true, message: "Cost per kg is required" },
          { type: "number", min: 0, message: "Must be a positive number" },
        ],
        placeholder: "Ex. 100",
        precision: 2,
        min: 0,
      },
      {
        type: "number",
        name: "roller_diameter",
        label: "Roller Diameter",
        rules: [
          { required: true, message: "Roller diameter is required" },
          { type: "number", min: 0, message: "Must be a positive number" },
        ],
        placeholder: "Ex. 10",
        min: 0,
      },
    ],
    [
      {
        type: "input",
        name: "calssification",
        label: "Classification",
        rules: [
          { required: true, message: "Classification is required" },
          { pattern: /^[a-zA-Z0-9]+$/, message: "Must be alphanumeric" },
        ],
        placeholder: "Ex. A25482",
        min: 0,
      },
      {
        type: "number",
        name: "wire_diameter_mm",
        label: "Wire Diameter (mm)",
        rules: [
          { required: true, message: "Wire diameter is required" },
          { type: "number", min: 0, message: "Must be a positive number" },
        ],
        placeholder: "Ex. 1.2",
        min: 0,
      },
    ],
    [
      {
        type: "number",
        name: "wire_density",
        label: "Wire Density (gm/cc)",
        rules: [
          { required: true, message: "Wire density is required" },
          { type: "number", min: 0, message: "Must be a positive number" },
        ],
        placeholder: "Ex. 7.8",
        min: 0,
      },
      {
        type: "number",
        name: "wire_weight_per_length",
        label: "Wire Weight Per Length",
        rules: [
          { required: true, message: "Wire weight per length is required" },
          { type: "number", min: 0, message: "Must be a positive number" },
        ],
        placeholder: "Ex. 0.5",
        min: 0,
      },
    ],
  ];

  return (
    <div className="mt-12">
      <h1 className="text-left ml-8 font-semibold dark:text-gray-300">
        Filler Material
      </h1>
      <div className="flex flex-wrap lg:flex-nowrap justify-center">
        <div className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg h-44 rounded-xl w-full lg:w-80 p-8 pt-9 m-3 bg-center">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-bold text-gray-400">Total Filler Materials</p>
              <p className="text-2xl">{fillerMaterial.length}</p>
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
              onClick={enableInsertion}
            >
              Add New Filler Material
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
            placeholder="Search Filler Material Name"
            onChange={(e) => {
              const searchTerm = e.target.value;
              setSearch(searchTerm);
              const filter = fillerMaterial.filter((item) =>
                item.fm_name.toLowerCase().includes(searchTerm.toLowerCase())
              );
              setFiltereddata(filter);
            }}
          />
        </div>
      </div>

      {activateBtn && (
        <ReusableModal
          title="Add New Filler Material"
          isOpen={activateBtn}
          onClose={closeModal}
          onSubmit={createNewFillerMaterial}
          fields={fields}
          loading={saved}
          currentColor={currentColor}
        />
      )}

      {isEditing && (
        <ReusableModal
          title="Edit Filler Material"
          isOpen={isEditing}
          onClose={closeEditModal}
          onSubmit={updateSheildingGas}
          initialValues={selectedData?.jobDetails}
          fields={fields}
          loading={loading}
          currentColor={currentColor}
        />
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
                  if (col.key === "fm_name") {
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
                          jobNames={fillerMaterialFilters}
                        />
                      ),
                      onFilter: (value, record) =>
                        record.fm_name.includes(value),
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
                                {record.fm_name}
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
                              onConfirm={() => deleteMachStatus(record)}
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

export default FillerMaterial;
