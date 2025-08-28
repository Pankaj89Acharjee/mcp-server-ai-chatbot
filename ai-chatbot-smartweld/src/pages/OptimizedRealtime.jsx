import React, { memo, useCallback, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { message, Alert, Button, Layout } from "antd";

// Context and Hooks
import { useStateContext } from "../contexts/ContextProvider";
import useOptimizedWebSocket from "../customHooks/useOptimizedWebSocket";

// API Calls
import { getHardwareList } from "../apicalls/machineJobRunInfoCall";
import { getOperatorsByOrg } from "../apicalls/usersApiCall";

// Optimized Components
import OptimizedMachineStatusCard from "../components/Realtime/OptimizedMachineStatusCard";
import OptimizedMachineInfoCard from "../components/Realtime/OptimizedMachineInfoCard";
import OptimizedChartsContainer from "../components/Realtime/OptimizedChartsContainer";
import EnhancedHardwareModal from "../components/Realtime/EnhancedHardwareModal";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

// Main Optimized Realtime Component
const OptimizedRealtime = memo(() => {
  const { currentColor } = useStateContext();

  // Local state
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  // Refs for performance optimization
  const lastUpdateRef = useRef(null);

  // WebSocket URL from environment
  const webSocketURL = process.env.REACT_APP_SOCKET_SERVER_URL;

  // Fetch hardware list with React Query
  const {
    data: hardwareDetails = [],
    isLoading: isLoadingHardware,
    error: hardwareError,
    refetch: refetchHardware,
  } = useQuery({
    queryKey: ["hardwareList"],
    queryFn: async () => {
      const response = await getHardwareList();
      return response?.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    onError: (error) => {
      message.error(`Failed to load machines: ${error.message}`);
    },
  });

  // Fetch operators data
  const { data: operators = [], isLoading: isLoadingOperators } = useQuery({
    queryKey: ["operators"],
    queryFn: async () => {
      const response = await getOperatorsByOrg();
      return response?.data || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    onError: (error) => {
      console.warn("Failed to load operators:", error);
    },
  });

  // Initialize WebSocket with optimized hook
  const { isConnected, connectionError, realtimeData, getHardwareData } =
    useOptimizedWebSocket(webSocketURL, hardwareDetails);

  // Get current machine data
  const currentMachineData = useMemo(() => {
    if (!selectedMachine?.hardware_code) {
      return {
        status: "NO STATUS",
        current: 0,
        voltage: 0,
        gasFR: 0,
        machineTemp: 0,
        ambienceTemp: 0,
        operatorId: "",
        timestamp: Date.now(),
      };
    }
    return getHardwareData(selectedMachine.hardware_code);
  }, [selectedMachine, getHardwareData]);

  // Find operator information
  const currentOperator = useMemo(() => {
    if (!currentMachineData.operatorId || !operators.length) {
      return null;
    }
    return operators.find((op) => op.rf_id === currentMachineData.operatorId);
  }, [currentMachineData.operatorId, operators]);

  // Handle machine selection
  const handleMachineSelection = useCallback(
    async (formData) => {
      try {
        const machine = hardwareDetails.find(
          (hw) => hw.machine_name === formData.machine_name
        );

        if (machine) {
          setSelectedMachine(machine);
          message.success(`Connected to ${machine.machine_name}`);

          // Update component mount time for performance tracking
          lastUpdateRef.current = Date.now();
        }

        setOpenModal(false);
      } catch (error) {
        message.error(`Failed to select machine: ${error.message}`);
      }
    },
    [hardwareDetails]
  );

  // Handle machine name change (for backward compatibility)
  const handleMachineNameChange = useCallback(
    (machineName) => {
      const machine = hardwareDetails.find(
        (hw) => hw.machine_name === machineName
      );
      if (machine && machine !== selectedMachine) {
        setSelectedMachine(machine);
      }
    },
    [hardwareDetails, selectedMachine]
  );

  // Memoized loading state
  const isLoading = useMemo(() => {
    return isLoadingHardware || isLoadingOperators;
  }, [isLoadingHardware, isLoadingOperators]);

  // Error boundary
  if (hardwareError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <Alert
          message="Failed to Load Hardware"
          description={hardwareError.message}
          type="error"
          showIcon
          action={
            <Button onClick={refetchHardware} type="primary">
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <Layout className="min-h-[calc(100vh-4.5rem)] mt-[4.5rem] lg:mt-0 relative overflow-hidden">
      <div className="relative z-10 p-4 lg:p-6">
        {/* Header Section */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-slate-700 mb-2">
                Real-time Machine Metrics
              </h1>
              <p className="text-slate-400 text-sm lg:text-base">
                Live monitoring and analytics dashboard
              </p>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <AnimatePresence mode="wait">
          {!isLoading && (
            <motion.div
              key="main-content"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="space-y-8"
            >
              {/* Status Cards Section */}
              <motion.div
                variants={fadeInUp}
                className="grid grid-cols-1 xl:grid-cols-12 gap-6"
              >
                {/* Machine Status Card */}
                <div className="xl:col-span-4">
                  <OptimizedMachineStatusCard
                    realtimeData={currentMachineData}
                    selectedMachine={selectedMachine}
                    setOpenModal={setOpenModal}
                    isConnected={isConnected}
                    lastUpdate={lastUpdateRef.current}
                  />
                </div>

                {/* Machine Info Cards */}
                <div className="xl:col-span-8">
                  <OptimizedMachineInfoCard
                    realtimeData={currentMachineData}
                    selectedMachine={selectedMachine}
                    filterOperators={currentOperator}
                    isLoading={isLoadingOperators}
                  />
                </div>
              </motion.div>

              {/* Charts Section */}
              <motion.div variants={fadeInUp}>
                <OptimizedChartsContainer
                  selectedMachine={selectedMachine}
                  realtimeData={realtimeData}
                  isLoading={!selectedMachine}
                  connectionError={connectionError}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Enhanced Hardware Selection Modal */}
      <EnhancedHardwareModal
        openModal={openModal}
        setOpenModal={setOpenModal}
        onSubmitHandler={handleMachineSelection}
        machineNameChangeHandler={handleMachineNameChange}
        hardwareDetails={hardwareDetails}
        currentColor={currentColor}
        loading={isLoading}
        selectedMachine={selectedMachine}
        liveData={realtimeData}
      />
    </Layout>
  );
});

OptimizedRealtime.displayName = "OptimizedRealtime";

export default OptimizedRealtime;
