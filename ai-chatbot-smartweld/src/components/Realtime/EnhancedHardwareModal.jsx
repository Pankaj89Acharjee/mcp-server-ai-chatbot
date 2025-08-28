import React, { memo, useMemo, useState, useCallback } from "react";
import { Modal, Form, Select, Input, Badge, Spin, Empty } from "antd";
import {
  SearchOutlined,
  WifiOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";

const { Option } = Select;

const MachineOption = memo(({ machine, isSelected, onSelect }) => {
  const statusColor = useMemo(() => {
    switch (machine.status?.toLowerCase()) {
      case "running":
        return "#52c41a";
      case "stopped":
      case "stop":
        return "#faad14";
      default:
        return "#d9d9d9";
    }
  }, [machine.status]);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
                p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
                ${
                  isSelected
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-400"
                }
            `}
      onClick={() => onSelect(machine)}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 truncate">
              {machine.machine_name}
            </h4>
            <Badge
              color={statusColor}
              text={machine.status || "Unknown"}
              className="text-xs"
            />
          </div>

          <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
            <div className="flex justify-between">
              <span>Type:</span>
              <span className="font-medium">
                {machine.machine_type || "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Code:</span>
              <span className="font-mono">
                {machine.hardware_code || "N/A"}
              </span>
            </div>
            {machine.job_name && (
              <div className="flex justify-between">
                <span>Job:</span>
                <span className="font-medium truncate max-w-24">
                  {machine.job_name}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center space-y-2 ml-4">
          <WifiOutlined
            className={`text-lg ${
              machine.isConnected ? "text-green-500" : "text-red-500"
            }`}
          />
          {machine.isConnected && (
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          )}
        </div>
      </div>
    </motion.div>
  );
});

MachineOption.displayName = "MachineOption";

const MachineStats = memo(({ machines }) => {
  const stats = useMemo(() => {
    const total = machines.length;
    const running = machines.filter(
      (m) => m.status?.toLowerCase() === "running",
    ).length;
    const stopped = machines.filter(
      (m) =>
        m.status?.toLowerCase() === "stopped" ||
        m.status?.toLowerCase() === "stop",
    ).length;
    const connected = machines.filter((m) => m.isConnected).length;

    return { total, running, stopped, connected };
  }, [machines]);

  return (
    <div className="grid grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div className="text-center">
        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
          {stats.total}
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-400">Total</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
          {stats.running}
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-400">Running</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
          {stats.stopped}
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-400">Stopped</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
          {stats.connected}
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-400">
          Connected
        </div>
      </div>
    </div>
  );
});

MachineStats.displayName = "MachineStats";

const EnhancedHardwareModal = memo(
  ({
    openModal,
    setOpenModal,
    onSubmitHandler,
    machineNameChangeHandler,
    hardwareDetails = [],
    currentColor = "#1890ff",
    loading = false,
    selectedMachine = null,
    liveData = {},
  }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedMachineLocal, setSelectedMachineLocal] =
      useState(selectedMachine);
    const [filterStatus, setFilterStatus] = useState("all");

    // Enhanced machine data with live status
    const enhancedMachines = useMemo(() => {
      return hardwareDetails.map((machine) => ({
        ...machine,
        status:
          liveData[machine.hardware_code]?.status ||
          machine.status ||
          "unknown",
        isConnected: Boolean(liveData[machine.hardware_code]),
        lastUpdate: liveData[machine.hardware_code]?.timestamp || null,
      }));
    }, [hardwareDetails, liveData]);

    // Filtered machines based on search and status
    const filteredMachines = useMemo(() => {
      return enhancedMachines.filter((machine) => {
        const matchesSearch =
          !searchTerm ||
          machine.machine_name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          machine.hardware_code
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          machine.machine_type
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase());

        const matchesStatus =
          filterStatus === "all" ||
          machine.status?.toLowerCase() === filterStatus.toLowerCase();

        return matchesSearch && matchesStatus;
      });
    }, [enhancedMachines, searchTerm, filterStatus]);

    // Handle machine selection
    const handleMachineSelect = useCallback(
      async (machine) => {
        if (machineNameChangeHandler) {
          machineNameChangeHandler(machine.machine_name);
        }
        if (onSubmitHandler) {
          await onSubmitHandler({
            machine_name: machine.machine_name,
            selectedMachine: machine,
          });
        }
      },
      [onSubmitHandler, machineNameChangeHandler],
    );

    // Handle modal close
    const handleClose = useCallback(() => {
      setOpenModal(false);
      setSearchTerm("");
      setSelectedMachineLocal(null);
      setFilterStatus("all");
    }, [setOpenModal]);

    const modalVariants = {
      hidden: { opacity: 0, scale: 0.8 },
      visible: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.3, ease: "easeOut" },
      },
      exit: {
        opacity: 0,
        scale: 0.8,
        transition: { duration: 0.2 },
      },
    };

    return (
      <AnimatePresence>
        {openModal && (
          <Modal
            title={
              <div className="flex items-center space-x-2">
                <SettingOutlined className="text-blue-500" />
                <span>Select Machine for Live Monitoring</span>
              </div>
            }
            open={openModal}
            onCancel={handleClose}
            footer={null}
            width="90vw"
            style={{ maxWidth: "1200px" }}
            // className="enhanced-hardware-modal"
            destroyOnClose
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-6"
            >
              {/* Machine Statistics */}
              <MachineStats machines={enhancedMachines} />

              {/* Search and Filter Controls */}
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="flex-1">
                  <Input
                    placeholder="Search machines by name, code, or type..."
                    prefix={<SearchOutlined className="text-gray-400" />}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full not-dark-theme-input"
                    allowClear
                  />
                </div>

                <Select
                  value={filterStatus}
                  onChange={setFilterStatus}
                  style={{ width: 120 }}
                  className="flex-shrink-0"
                >
                  <Option value="all">All Status</Option>
                  <Option value="running">Running</Option>
                  <Option value="stop">Stopped</Option>
                  <Option value="unknown">Unknown</Option>
                </Select>
              </div>

              {/* Machine Selection */}
              <div className="max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Spin size="large" tip="Loading machines..." />
                  </div>
                ) : filteredMachines.length === 0 ? (
                  <Empty
                    description="No machines found"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                ) : (
                  <div
                    className={
                      "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-2"
                    }
                  >
                    {filteredMachines.map((machine) => (
                      <MachineOption
                        key={machine.hardware_code || machine.machine_name}
                        machine={machine}
                        isSelected={
                          selectedMachineLocal?.hardware_code ===
                          machine.hardware_code
                        }
                        onSelect={handleMachineSelect}
                      />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </Modal>
        )}
      </AnimatePresence>
    );
  },
);

EnhancedHardwareModal.displayName = "EnhancedHardwareModal";

export default EnhancedHardwareModal;
