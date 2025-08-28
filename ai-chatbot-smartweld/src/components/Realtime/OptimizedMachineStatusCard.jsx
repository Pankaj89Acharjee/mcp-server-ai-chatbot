import React, { memo, useMemo } from "react";
import { motion } from "framer-motion";
import { AiFillSetting, AiOutlineMore, AiOutlineWifi } from "react-icons/ai";
import { FiPlay, FiPause, FiAlertCircle } from "react-icons/fi";
import { Badge, Tooltip } from "antd";
import {
  formatCurrent,
  formatVoltage,
  formatTemperature,
} from "../../utils/numberUtils";

const StatusIndicator = memo(({ status, className = "" }) => {
  const statusConfig = useMemo(() => {
    switch (status?.toLowerCase()) {
      case "running":
        return {
          color: "text-green-400",
          bgColor: "bg-green-500/20",
          icon: FiPlay,
          animation: "running-animation",
          label: "Running",
        };
      case "stop":
      case "stopped":
        return {
          color: "text-amber-400",
          bgColor: "bg-amber-500/20",
          icon: FiPause,
          animation: "animate-none",
          label: "Stopped",
        };
      default:
        return {
          color: "text-gray-400",
          bgColor: "bg-gray-500/20",
          icon: FiAlertCircle,
          animation: "animate-none",
          label: "No Status",
        };
    }
  }, [status]);

  const Icon = statusConfig.icon;

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`p-2 rounded-full ${statusConfig.bgColor}`}>
        <Icon
          className={`text-xl ${statusConfig.color} ${statusConfig.animation}`}
        />
      </div>
      <span className="text-white font-semibold text-sm sm:text-base lg:text-lg uppercase">
        {statusConfig.label}
      </span>
    </div>
  );
});

StatusIndicator.displayName = "StatusIndicator";

const ConnectionStatus = memo(({ isConnected, className = "" }) => (
  <Tooltip title={isConnected ? "Connected" : "Disconnected"}>
    <div
      className={`p-2 bg-green-900/80 backdrop-blur-sm rounded-xl ${className}`}
    >
      <AiOutlineWifi
        className={`text-xl ${
          isConnected ? "text-white animate-pulse" : "text-white/50"
        }`}
      />
    </div>
  </Tooltip>
));

ConnectionStatus.displayName = "ConnectionStatus";

const MachineGear = memo(({ status, className = "" }) => {
  const gearConfig = useMemo(() => {
    switch (status?.toLowerCase()) {
      case "running":
        return {
          color: "text-green-300",
          animation: "running-animation",
          scale: "scale-110",
        };
      case "stop":
      case "stopped":
        return {
          color: "text-amber-500",
          animation: "animate-none",
          scale: "scale-100",
        };
      default:
        return {
          color: "text-white/70",
          animation: "animate-none",
          scale: "scale-95",
        };
    }
  }, [status]);

  return (
    <div
      className={`transition-all duration-500 ${gearConfig.scale} ${className}`}
    >
      <AiFillSetting
        className={`text-6xl sm:text-7xl lg:text-8xl ${gearConfig.color} ${gearConfig.animation} drop-shadow-lg`}
      />
    </div>
  );
});

MachineGear.displayName = "MachineGear";

const OptimizedMachineStatusCard = memo(
  ({
    realtimeData = {},
    selectedMachine = {},
    setOpenModal,
    isConnected = false,
    lastUpdate = null,
    className = "",
  }) => {
    const cardVariants = {
      hidden: { opacity: 0, y: 20, scale: 0.95 },
      visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
          type: "spring",
          duration: 0.6,
          bounce: 0.3,
        },
      },
      hover: {
        y: -2,
        scale: 1.02,
        transition: { duration: 0.2 },
      },
    };

    const backgroundGradient = useMemo(() => {
      const status = realtimeData.status?.toLowerCase();
      switch (status) {
        case "running":
          return "bg-gradient-to-br from-emerald-600 via-green-500 to-teal-600";
        case "stop":
        case "stopped":
          return "bg-gradient-to-br from-amber-600 via-orange-500 to-red-500";
        default:
          return "bg-gradient-to-br from-gray-600 via-slate-500 to-gray-700";
      }
    }, [realtimeData.status]);

    const machineName = useMemo(() => {
      if (!selectedMachine || Object.keys(selectedMachine).length === 0) {
        return "Select Machine";
      }
      return selectedMachine.machine_name || "Unknown Machine";
    }, [selectedMachine]);

    const handleMoreClick = () => {
      if (setOpenModal) {
        setOpenModal(true);
      }
    };

    return (
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
        className={`
                ${backgroundGradient}
                shadow-2xl
                rounded-2xl
                w-full
                max-w-md
                mx-auto
                p-4 sm:p-6
                relative
                overflow-hidden
                backdrop-blur-sm
                border
                border-white/10
                ${className}
            `}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/20 to-transparent" />
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-xl" />
        </div>

        {/* Header with Status */}
        <div className="relative z-10 flex justify-between items-start mb-4">
          <StatusIndicator status={realtimeData.status} />

          {/* Connection Status */}
          <ConnectionStatus
            isConnected={isConnected}
            className="absolute top-0 right-0"
          />
        </div>

        {/* Main Content */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4">
          {/* Machine Gear Animation */}
          <div className="flex-shrink-0">
            <MachineGear status={realtimeData.status} />
          </div>

          {/* Machine Info */}
          <div className="flex-grow text-center sm:text-left">
            <div className="space-y-2">
              <h2 className="text-white text-sm sm:text-base lg:text-lg font-medium leading-tight break-words">
                {machineName}
              </h2>

              {selectedMachine?.machine_type && (
                <Badge
                  count={selectedMachine.machine_type}
                  style={{
                    backgroundColor: "rgba(255,255,255,0.2)",
                    color: "white",
                    fontSize: "10px",
                  }}
                />
              )}

              {lastUpdate && (
                <p className="text-white/70 text-xs">
                  Last update: {new Date(lastUpdate).toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Live Data Indicators */}
        {realtimeData.status === "running" && (
          <div className="relative z-10 mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="bg-white/10 rounded-lg p-2">
              <p className="text-white/70 text-xs">Current</p>
              <p className="text-white font-semibold text-sm">
                {formatCurrent(realtimeData.current)}
              </p>
            </div>
            <div className="bg-white/10 rounded-lg p-2">
              <p className="text-white/70 text-xs">Voltage</p>
              <p className="text-white font-semibold text-sm">
                {formatVoltage(realtimeData.voltage)}
              </p>
            </div>
            <div className="bg-white/10 rounded-lg p-2">
              <p className="text-white/70 text-xs">Temp</p>
              <p className="text-white font-semibold text-sm">
                {formatTemperature(realtimeData.machineTemp)}
              </p>
            </div>
          </div>
        )}

        {/* More Options Button */}
        <Tooltip title="Machine Settings">
          <button
            onClick={handleMoreClick}
            className="
                        absolute
                        bottom-4
                        right-4
                        bg-white/20
                        hover:bg-white/30
                        backdrop-blur-sm
                        rounded-lg
                        p-2
                        text-white
                        transition-all
                        duration-200
                        hover:scale-110
                        focus:outline-none
                        focus:ring-2
                        focus:ring-white/50
                        z-50
                    "
          >
            <AiOutlineMore className="text-lg" />
          </button>
        </Tooltip>

        {/* Pulse Animation for Active Status */}
        {realtimeData.status === "running" && (
          <div className="absolute inset-0 rounded-2xl animate-pulse bg-green-400/5 pointer-events-none" />
        )}
      </motion.div>
    );
  },
);

OptimizedMachineStatusCard.displayName = "OptimizedMachineStatusCard";

export default OptimizedMachineStatusCard;
