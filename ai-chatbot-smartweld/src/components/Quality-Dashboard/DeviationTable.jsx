import React, { useState, useEffect } from "react";
import { Modal, Card, Button, Table, Input, Space } from "antd";
import { MoreOutlined, CloseOutlined, SearchOutlined } from "@ant-design/icons";

const DeviationTable = ({ isDeviationModalOpen, setIsDeviationModalOpen, deviationData, onChange, loading, pagination }) => {
      const [filteredData, setFilteredData] = useState([]);
      const [machineNameFilter, setMachineNameFilter] = useState("");
      const [machineTypeFilter, setMachineTypeFilter] = useState("");

      useEffect(() => {
            // Initialize with original data
            setFilteredData(deviationData || []);
      }, [deviationData]);

      // Handle local filtering
      useEffect(() => {
            if (!deviationData) return;

            let filtered = [...deviationData];

            if (machineNameFilter) {
                  filtered = filtered.filter(item =>
                        item.machine_name && item.machine_name.toLowerCase().includes(machineNameFilter.toLowerCase())
                  );
            }

            if (machineTypeFilter) {
                  filtered = filtered.filter(item =>
                        item.machine_type_name && item.machine_type_name.toLowerCase().includes(machineTypeFilter.toLowerCase())
                  );
            }

            setFilteredData(filtered);
      }, [deviationData, machineNameFilter, machineTypeFilter]);

      // Search input for Machine Name
      const getMachineNameSearchProps = () => ({
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                  <div style={{ padding: 8 }} className="bg-gray-800 dark:bg-gray-700 text-gray-900">
                        <Input
                              placeholder="Search Machine Name"
                              value={selectedKeys[0]}
                              onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                              onPressEnter={() => {
                                    confirm();
                                    setMachineNameFilter(selectedKeys[0]);
                              }}
                              style={{ width: 188, marginBottom: 8, display: 'block' }}
                              className="bg-gray-700 border-gray-600"
                        />
                        <Space>
                              <Button
                                    type="primary"
                                    onClick={() => {
                                          confirm();
                                          setMachineNameFilter(selectedKeys[0]);
                                    }}
                                    icon={<SearchOutlined />}
                                    size="small"
                                    style={{ width: 90 }}
                                    className="bg-blue-600"
                              >
                                    Search
                              </Button>
                              <Button
                                    onClick={() => {
                                          clearFilters();
                                          setMachineNameFilter("");
                                    }}
                                    size="small"
                                    style={{ width: 90 }}
                                    className="bg-gray-700 text-white"
                              >
                                    Reset
                              </Button>
                        </Space>
                  </div>
            ),
            filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
            onFilter: (value, record) => record.machine_name ? record.machine_name.toLowerCase().includes(value.toLowerCase()) : false,
      });

      // Search input for Machine Type
      const getMachineTypeSearchProps = () => ({
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                  <div style={{ padding: 8 }} className="bg-gray-800">
                        <Input
                              placeholder="Search Machine Type"
                              value={selectedKeys[0]}
                              onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                              onPressEnter={() => {
                                    confirm();
                                    setMachineTypeFilter(selectedKeys[0]);
                              }}
                              style={{ width: 188, marginBottom: 8, display: 'block' }}
                              className="bg-gray-700 border-gray-600"
                        />
                        <Space>
                              <Button
                                    type="primary"
                                    onClick={() => {
                                          confirm();
                                          setMachineTypeFilter(selectedKeys[0]);
                                    }}
                                    icon={<SearchOutlined />}
                                    size="small"
                                    style={{ width: 90 }}
                                    className="bg-blue-600"
                              >
                                    Search
                              </Button>
                              <Button
                                    onClick={() => {
                                          clearFilters();
                                          setMachineTypeFilter("");
                                    }}
                                    size="small"
                                    style={{ width: 90 }}
                                    className="bg-gray-700 text-white"
                              >
                                    Reset
                              </Button>
                        </Space>
                  </div>
            ),
            filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
            onFilter: (value, record) => record.machine_type_name ? record.machine_type_name.toLowerCase().includes(value.toLowerCase()) : false,
      });
      const deviationColumns = [
            {
                  title: "DATE",
                  dataIndex: "business_date",
                  key: "business_date",
                  render: (date) => new Date(date).toLocaleDateString(),
                  width: 100,
                  align: 'center'
            },
            {
                  title: "MACHINE NAME",
                  dataIndex: "machine_name",
                  key: "machine_name",
                  width: 150,
                  align: 'center',
                  ...getMachineNameSearchProps()
            },
            {
                  title: "MACHINE TYPE",
                  dataIndex: "machine_type_name",
                  key: "machine_type_name",
                  width: 150,
                  align: 'center',
                  ...getMachineTypeSearchProps()
            },
            {
                  title: "JOB NAME",
                  dataIndex: "job_name",
                  key: "job_name",
                  width: 100,
                  align: 'center'
            },
            {
                  title: "JOB SERIAL",
                  dataIndex: "job_serial",
                  key: "job_serial",
                  width: 150,
                  align: 'center'
            },
            {
                  title: "TARGET VALUE",
                  dataIndex: "target_value",
                  key: "target_value",
                  width: 120,
                  align: 'center'
            },
            {
                  title: "AVERAGE VALUE",
                  dataIndex: "avg_value",
                  key: "avg_value",
                  width: 120,
                  align: 'center'
            },
            {
                  title: "DEVIATION TYPE",
                  dataIndex: "threshold_type",
                  key: "threshold_type",
                  width: 150,
                  align: 'center'
            },
            {
                  title: "START TIME",
                  dataIndex: "threshold_start_time",
                  key: "threshold_start_time",
                  width: 150,
                  align: 'center'
            },
            {
                  title: "DURATION (S)",
                  dataIndex: "threshold_duration",
                  key: "threshold_duration",
                  width: 120,
                  align: 'center'
            },
            {
                  title: "OPERATOR",
                  dataIndex: "user_name",
                  key: "user_name",
                  width: 150,
                  align: 'center'
            },
            {
                  title: "RUNNING SEQ",
                  dataIndex: "running_seq",
                  key: "running_seq",
                  width: 150,
                  align: 'center'
            },
      ];

      return (
            <div className="bg-gray-900">
                  <Modal
                        open={isDeviationModalOpen}
                        onCancel={() => setIsDeviationModalOpen(false)}
                        className="dark-theme-model !w-4/6"
                        footer={null}
                        closeIcon={null}
                        style={{ top: 20 }}
                        styles={{
                              mask: {
                                    backgroundColor: 'rgba(0, 0, 0, 0.65)'
                              },
                              body: {
                                    padding: '0',
                                    height: 'auto',
                                    maxHeight: 'calc(100vh - 60px)',
                                    overflow: 'hidden',
                                    backgroundColor: '#111827' // dark 
                              },
                              content: {
                                    backgroundColor: '#111827', // dark
                                    height: 'auto'
                              }
                        }}
                  >
                        <Card
                              title={"Deviation Records"}
                              className="dark-theme-card bg-gray-900"
                              extra={
                                    <div className="flex space-x-2">
                                          <Button
                                                type="text"
                                                icon={<MoreOutlined />}
                                                className="!text-slate-50 hover:!text-slate-300"
                                          />
                                          <Button
                                                type="text"
                                                icon={<CloseOutlined />}
                                                onClick={() => setIsDeviationModalOpen(false)}
                                                className="!text-slate-50 hover:!text-slate-300"
                                          />
                                    </div>
                              }
                              styles={{
                                    header: {
                                          backgroundColor: '#1f2937', // dark header
                                          borderBottom: '1px solid #374151'
                                    },
                                    body: {
                                          padding: '12px',
                                          overflow: 'hidden',
                                          display: 'flex',
                                          flexDirection: 'column',
                                          backgroundColor: '#111827' // dark background for card body
                                    }
                              }}
                        >
                              <div className="flex-1 min-h-0 bg-gray-900 overflow-auto">
                                    <Table
                                          columns={deviationColumns}
                                          onChange={(pagination, filters, sorter) => {
                                                // Set the filters
                                                if (filters.machine_name && filters.machine_name.length) {
                                                      setMachineNameFilter(filters.machine_name[0]);
                                                }
                                                if (filters.machine_type_name && filters.machine_type_name.length) {
                                                      setMachineTypeFilter(filters.machine_type_name[0]);
                                                }
                                                // Pass the change event to parent component
                                                if (onChange) {
                                                      onChange(pagination, filters, sorter);
                                                }
                                          }}
                                          loading={loading}
                                          pagination={{
                                                ...pagination,
                                                showSizeChanger: true,
                                                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                                                position: ['bottomCenter'],
                                                className: "bg-gray-900",
                                                style: { marginBottom: 0 }
                                          }}
                                          dataSource={filteredData}
                                          size="middle"
                                          className="dark-theme-table"
                                          scroll={{
                                                x: 1500,
                                                y: 'calc(100vh - 280px)'
                                          }}
                                          bordered
                                          style={{ marginBottom: 0 }}
                                    />
                              </div>
                        </Card>
                  </Modal>
            </div>
      )
}

export default DeviationTable;