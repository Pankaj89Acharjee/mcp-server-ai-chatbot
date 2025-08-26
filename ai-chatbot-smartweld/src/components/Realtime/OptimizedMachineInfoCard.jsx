import React, { memo } from "react";
import { motion } from "framer-motion";
import { HiOutlineUser, HiViewGrid } from "react-icons/hi";
import { AiFillFire, AiTwotoneFire } from "react-icons/ai";
import { Skeleton } from "antd";
import { formatTemperature } from "../../utils/numberUtils";

const InfoCard = memo(
  ({
    icon: Icon,
    title,
    value,
    subValue,
    bgGradient,
    iconBg,
    iconColor = "text-white",
    isLoading = false,
    isAlert = false,
    className = "",
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "tween", duration: 0.6, ease: "easeOut" }}
      className={`${bgGradient} shadow-lg rounded-2xl p-4 pt-6 h-full min-h-[140px] flex flex-col ${className}`}
    >
      <div className="flex-shrink-0 mb-3">
        <button
          style={{ backgroundColor: iconBg }}
          className={`text-lg rounded-full p-2 hover:shadow-xl transition-all duration-200 ${iconColor} ${isAlert ? "animate-pulse" : ""}`}
        >
          <Icon className={isAlert ? "animate-bounce" : ""} />
        </button>
      </div>

      <div className="flex-grow flex flex-col justify-between">
        <div>
          <h3 className="text-white font-semibold text-sm lg:text-base mb-1 leading-tight">
            {title}
          </h3>

          {isLoading ? (
            <Skeleton.Input active size="small" className="!bg-white/20" />
          ) : (
            <p
              className={`text-gray-100 font-medium text-xs lg:text-sm break-words ${isAlert ? "text-amber-300 font-bold" : ""}`}
            >
              {value || "N/A"}
            </p>
          )}
        </div>

        {subValue && (
          <p className="text-gray-200 text-xs mt-1 opacity-90">{subValue}</p>
        )}
      </div>
    </motion.div>
  ),
);

InfoCard.displayName = "InfoCard";

const OptimizedMachineInfoCard = memo(
  ({ realtimeData, selectedMachine, filterOperators, isLoading = false }) => {
    // Memoized card configurations
    const cardConfigs = React.useMemo(() => {
      const operatorName = filterOperators
        ? `${filterOperators.user_first_name || ""} ${filterOperators.user_last_name || ""}`.trim()
        : null;

      const isTempAlert =
        selectedMachine?.heat_shrink_temp > realtimeData?.machineTemp &&
        realtimeData?.status === "running";

      return [
        {
          id: "operator",
          icon: HiOutlineUser,
          title:
            realtimeData?.status !== "running" &&
            realtimeData?.status !== "stop"
              ? "Operator Name"
              : "Current Operator",
          value: operatorName || "Not Assigned",
          subValue: realtimeData?.operatorId
            ? `ID: ${realtimeData.operatorId}`
            : "",
          bgGradient: "bg-gradient-to-r from-cyan-500 via-blue-500 to-sky-900",
          iconBg: "blanchedalmond",
          iconColor: "text-gray-800",
        },
        {
          id: "job",
          icon: HiViewGrid,
          title: "Job Name",
          value: selectedMachine?.job_name,
          subValue: selectedMachine?.job_serial
            ? `Serial: ${selectedMachine.job_serial}`
            : "",
          bgGradient: "bg-gradient-to-r from-cyan-500 via-blue-500 to-gray-700",
          iconBg: "#063CD9",
        },
        {
          id: "ambient",
          icon: AiFillFire,
          title: "Ambient Temp",
          value: formatTemperature(realtimeData?.ambienceTemp),
          bgGradient:
            "bg-gradient-to-r from-cyan-500 via-purple-500 to-gray-700",
          iconBg: "rgb(228, 106, 118)",
        },
        {
          id: "machine",
          icon: AiTwotoneFire,
          title: "Machine Temp",
          value: formatTemperature(realtimeData?.machineTemp),
          subValue: selectedMachine?.heat_shrink_temp
            ? `Target: ${formatTemperature(selectedMachine.heat_shrink_temp)}`
            : "",
          bgGradient: "bg-gradient-to-r from-cyan-500 via-green-500 to-sky-900",
          iconBg: "rgb(10, 228, 102)",
          isAlert: isTempAlert,
        },
      ];
    }, [realtimeData, selectedMachine, filterOperators]);

    return (
      <div className="w-full">
        {/* Mobile: 1 column, Tablet: 2 columns, Desktop: 4 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          {cardConfigs.map((card) => (
            <div key={card.id} className="h-full">
              <InfoCard
                icon={card.icon}
                title={card.title}
                value={card.value}
                subValue={card.subValue}
                bgGradient={card.bgGradient}
                iconBg={card.iconBg}
                iconColor={card.iconColor}
                isLoading={isLoading}
                isAlert={card.isAlert}
                className="w-full"
              />
            </div>
          ))}
        </div>
      </div>
    );
  },
);

OptimizedMachineInfoCard.displayName = "OptimizedMachineInfoCard";

export default OptimizedMachineInfoCard;
