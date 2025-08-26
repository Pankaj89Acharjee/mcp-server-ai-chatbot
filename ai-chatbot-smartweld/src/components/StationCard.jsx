import { motion } from "framer-motion";
import { Link } from "react-router-dom";

// --- Helper Function  ---
const getLiveParamsAndColor = (
  hardwareCode,
  machinePresets,
  liveMachineData
) => {
  const liveData = liveMachineData[hardwareCode] || {
    status: "NO STATUS",
    current: 0,
    voltage: 0,
    gasFr: 0,
    rfid: "0",
    wire_thickness: "0",
  };

  const actual = {
    current: liveData.current > 5 ? liveData.current : 0,
    voltage: liveData.voltage > 5 ? liveData.voltage : 0,
    gasFr: liveData.gasFr > 1 ? liveData.gasFr : 0,
    rfid: liveData.rfid || "NA",
    runningStatus: liveData.status?.toUpperCase() || "NO STATUS",
    wire_thickness:
      machinePresets.wire_thickness ?? liveData.wire_thickness ?? "N/A",
  };

  const colors = {
    red: "#f71e1e", // Red for errors/stopped/no status
    green: "#5ae31b", // Green for running
    yellow: "#fbe70a", // Yellow for idle/stopped normally
    grey: "#808080", // Grey for offline/unknown
    default: "#FFFFFF", // Default white text
  };

  let statusColor;
  let textColor = colors.default;

  switch (actual.runningStatus) {
    case "RUNNING":
      statusColor = colors.green;
      break;
    case "STOP":
      statusColor = colors.yellow;
      textColor = "#333";
      break;
    case "ERROR":
      statusColor = colors.red;
      break;
    case "NO STATUS":
    default:
      statusColor = colors.grey;
      break;
  }

  const paramColors = {
    // Keep for potential future use, though not displayed now
    current: actual.current > 0 ? colors.green : colors.red,
    voltage: actual.voltage > 0 ? colors.green : colors.red,
    gas: actual.gasFr > 0 ? colors.green : colors.red,
    wire: colors.default,
  };

  return {
    actual,
    statusColor,
    textColor,
    paramColors,
  };
};

// --- Station Card Component ---
const StationCard = ({ machineType, machines, liveMachineData, station }) => {

  //console.log("station data", station);

  const numberOfMachines = machines.length;
  const runningJobModel = (machines[0] || {}).job_name || "N/A";
  const jobProduced = station?.totalJobs ?? "N/A";
  const partsStatus = station?.parts_status ?? "N/A";
  const defectQty = station?.defect_qty ?? "N/A";
  const arcingTime = station?.arcTime ?? "N/A";
  //const efficiency = station?.efficiency ?? "N/A";
  const lastRuntime = station?.lastRun ?? "N/A";
  const availability = station?.availability ?? "N/A";
  const productivity = station?.productivity ?? "N/A";
  const quality = station?.quality ?? "N/A";
  //const gasConsumed = station?.gas_consumed ?? "N/A";
  //const wireConsumed = station?.wireConsumed ?? "N/A";
  const targetCount = station?.target_count ?? "N/A";
  const oee = station?.oee ?? "N/A";

  // Determine the layout class based on the number of machines
  let machineLayoutClass = "";

  if (numberOfMachines <= 1) {
    machineLayoutClass = "flex flex-col items-center justify-center"; // For 0 or 1 machine
  } else if (numberOfMachines === 2) {
    machineLayoutClass = "grid grid-cols-2 gap-2"; // For exactly 2 machines
  } else {
    machineLayoutClass =
      "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-2"; // For 3+ machines
  }

  return (
    <Link
      to={`/dashboard/${machines[0].machine_type_id}`}
      state={{
        //From it we can pass data from this Component to the target component
        machineType: machineType,
        machines: machines,
        numberOfMachines: numberOfMachines,
        //liveMachineData: liveMachineData,
        jobProduced: station?.totalJobs ?? "N/A",
        arcingTime: station?.arcTime ?? "N/A",
        gasConsumed: station?.gasConsumed ?? "N/A",
        wireConsumed: station?.wireConsumed ?? "N/A",
        targetCount: targetCount,
        defectQty: defectQty,
      }}
      className="block"
    >
      {/* Use motion.div directly if you want animation per card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col bg-white dark:bg-gray-800 rounded-md shadow overflow-hidden border border-gray-200 dark:border-gray-700 h-full"
      >
        {/* Card Header */}
        <div className="bg-gray-700 dark:bg-gray-900 p-2 items-center flex-shrink-0">
          <h3
            className="text-base font-semibold text-white text-center truncate"
            title={machineType}
          >
            {machineType}
          </h3>
        </div>
        {/* Card Body */}
        <div className="p-3 flex-grow flex flex-col overflow-hidden">
          {/* Summary Section */}
          <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[11px] text-gray-600 dark:text-gray-300 mb-2 flex-shrink-0">
            {/* ... summary items ... */}
            <span>Machines:</span>
            <span className="font-medium text-right">{numberOfMachines}</span>
            <span className="truncate">Job Model:</span>
            <span
              className="font-medium text-right truncate"
              title={runningJobModel}
            >
              {runningJobModel}
            </span>
            <span>Job Status:</span>
            <span className="font-medium text-right">{jobProduced}</span>
            <span>Parts Status:</span>
            <span className="font-medium text-right">{partsStatus}</span>
            <span>Defects:</span>
            <span className="font-medium text-right">{defectQty}</span>
            <span>Arc Time:</span>
            <span className="font-medium text-right">{arcingTime}</span>
            {/* <span>Efficiency:</span>
            <span className="font-medium text-right">{efficiency}</span> */}
            <span>Last Run:</span>
            <span className="font-medium text-right">{lastRuntime}</span>
            <span>Avail:</span>
            <span className="font-medium text-right">{availability}</span>
            <span>Prod:</span>
            <span className="font-medium text-right">{productivity}</span>
            <span>Quality:</span>
            <span className="font-medium text-right">{quality}</span>
            <span>OEE:</span>
            <span className="font-medium text-right">{oee}</span>
          </div>
          {/* Mini Graph Placeholder */}
          {/* <div className="h-12 bg-gray-100 dark:bg-gray-700 my-2 flex items-center justify-center text-[10px] text-gray-400 rounded flex-shrink-0">
            [Mini Graph]
          </div> */}
          {/* Individual Machines Section */}
          <div className="mt-2 border-t border-gray-200 dark:border-gray-600 pt-2 flex flex-col flex-grow overflow-hidden">
            <h4 className="text-xs text-center font-semibold text-gray-700 dark:text-gray-200 mb-2 flex-shrink-0">
              Machines ({numberOfMachines}):
            </h4>
            {/* Scrollable Container */}
            <div className="flex-grow overflow-y-auto pr-1">
              {/* Container for Machines - Apply conditional layout class */}
              <div className={machineLayoutClass}>
                {" "}
                {/* Apply dynamic class here */}
                {machines.map((hardware) => {
                  if (!hardware.hardware_code) return null;

                  const { actual, statusColor } = getLiveParamsAndColor(
                    hardware.hardware_code,
                    hardware,
                    liveMachineData
                  );

                  return (
                    <div
                      key={hardware.hardware_code}

                      className="relative flex flex-row items-center justify-between p-1.5 rounded bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 min-h-[40px]" // Changed to flex-row, justify-between
                      title={`${hardware.machine_name} - ${actual.runningStatus}`}
                    >

                      <div className="flex flex-col items-start flex-grow overflow-hidden mr-2">
                        {" "}

                        <span className="text-[10px] font-medium text-gray-700 dark:text-gray-200 truncate w-full">
                          {" "}

                          {hardware.machine_name || "Unnamed"}
                        </span>
                        <span className="text-[9px] text-gray-500 dark:text-gray-400 truncate w-full">
                          {" "}

                          {hardware.operator_name || "No Operator"}
                        </span>
                      </div>

                      {/* Status Indicator Dot (fixed size, stays right) */}
                      <span
                        className="flex-shrink-0 h-2.5 w-2.5 rounded-full" // Added flex-shrink-0
                        style={{ backgroundColor: statusColor }}
                        title={`Status: ${actual.runningStatus}`}
                      ></span>
                    </div>
                  );
                })}
              </div>
            </div>{" "}
            {/* End Scrollable Container */}
          </div>{" "}
          {/* End Individual Machines Section */}
        </div>{" "}
        {/* End Card Body */}
      </motion.div>
    </Link>
  );
};

export default StationCard;
