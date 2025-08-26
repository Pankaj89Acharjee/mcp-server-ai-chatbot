/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, Button, Progress, Input, Select, message, Spin } from "antd";
import { WarningOutlined } from "@ant-design/icons";
import {
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import useWebSocket from "../customHooks/useWebSocket";
import {
  currentlyrunningShift,
  getHardwareMachWireDetails,
  getMachineLoginMetrics,
  getMachineTimeline,
  getMachineTypesForOperator,
  getPreviousJobSerialAndName,
  machineIdlenessStatus,
  updateJobSerial,
} from "../apicalls/machineType";
import { getOperatorsByOrg } from "../apicalls/usersApiCall";
import { RiBankCardFill } from "react-icons/ri";
import { UsageChart } from "../components/productivity-dashboard/hourly-production-chart";
import { useDateSelectionContext } from "../contexts/DateSelectionContext";
import { formatDate } from "../lib/utils";
import dayjs from "dayjs";
import { getProductivityProductionChart } from "../apicalls/dashboardSupervisorAPICalls";
import { getDowntimeCounts } from "../apicalls/downtimeCalls";

// Helper function to calculate progress percentage
const calculateProgress = (value, lowThreshold, highThreshold) => {
  if (
    lowThreshold === undefined ||
    highThreshold === undefined ||
    value === undefined
  )
    return 0;
  const min = Math.min(lowThreshold, highThreshold);
  const max = Math.max(lowThreshold, highThreshold);
  return max - min === 0
    ? value >= min
      ? 100
      : 0
    : Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
};

export default function OperatorDashboard() {
  const [serialNumber, setSerialNumber] = useState("");
  const [selectedJob, setSelectedJob] = useState("");
  const [liveMachineData, setLiveMachineData] = useState({});
  const [selectedMachineType, setSelectedMachineType] = useState("");
  const queryClient = useQueryClient();
  const [timeRange, setTimeRange] = useState("hour");
  const [dataType, setDataType] = useState("production");
  const [machineMetrics, setMachineMetrics] = useState([]);
  const [shiftLogs, setShiftLogs] = useState([]);
  const [machineIdle, setMachineIdle] = useState([]);
  const [machineTimeline, setMachineTimeline] = useState([]);

  // WebSocket Setup
  const webSocketURL = process.env.REACT_APP_SOCKET_SERVER_URL;
  const { socketRef, isSocketConnected } = useWebSocket(webSocketURL);

  const { selectedDate, dateType, selectedShifts } = useDateSelectionContext();

  const isQueryEnabled =
    !!selectedDate && !!selectedShifts && selectedShifts.length > 0;

  // Extract common query preparation logic
  const getQueryParams = () => {
    const formattedDate = formatDate(selectedDate || dayjs(), dateType);
    const shifts = selectedShifts?.length ? selectedShifts : ["A", "B", "C"];
    return { formattedDate, shifts };
  };

  const chartQuery = useQuery({
    queryKey: [
      "productivity_production_chart",
      selectedDate,
      selectedShifts,
      timeRange,
      dataType,
    ],
    queryFn: async () => {
      const { formattedDate, shifts } = getQueryParams();
      const { data } = await getProductivityProductionChart(
        formattedDate,
        shifts,
        timeRange,
        dataType
      );
      return data ?? {};
    },
    enabled: isQueryEnabled,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch Hardware Info
  const { data: hardwareList } = useQuery({
    queryKey: ["hardware_info", selectedDate, selectedShifts],
    queryFn: async () => {
      const { formattedDate, shifts } = getQueryParams();
      const response = await getHardwareMachWireDetails(formattedDate, shifts);
      //console.log("Response for hardware info", response.data)
      return Array.isArray(response.data) ? response.data : [response.data];
    },
    enabled: isQueryEnabled,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch Downtime Counts
  const { data: downtimeCounts, isLoading: isDowntimeLoading } = useQuery({
    queryKey: ["downtime_counts"],
    queryFn: getDowntimeCounts,
    staleTime: 5 * 60 * 1000,
  });

  // Group machines by type
  const groupedMachines = useMemo(() => {
    //console.log("Hardware List in Grouping fx", hardwareList)
    if (!hardwareList || !Array.isArray(hardwareList)) return {};

    return hardwareList.reduce((acc, hw) => {
      if (!hw.hardware_code) return acc;
      const type = hw.machine_type ?? "Uncategorized";
      if (type !== "All") {
        acc[type] = acc[type] ?? [];
        acc[type].push({
          ...hw,
          high_weld_cur_threshold: hw.high_weld_cur_threshold ?? Infinity,
          high_weld_gas_threshold: hw.high_weld_gas_threshold ?? Infinity,
          high_weld_volt_threshold: hw.high_weld_volt_threshold ?? Infinity,
          low_weld_cur_threshold: hw.low_weld_cur_threshold ?? 0,
          low_weld_gas_threshold: hw.low_weld_gas_threshold ?? 0,
          low_weld_volt_threshold: hw.low_weld_volt_threshold ?? 0,
          wire_spool_capacity: hw.wire_spool_capacity ?? 15,
        });
      }
      return acc;
    }, {});
  }, [hardwareList]);

  // WebSocket Listeners
  useEffect(() => {
    if (
      !socketRef.current ||
      !isSocketConnected ||
      !selectedMachineType ||
      !groupedMachines[selectedMachineType]
    )
      return;

    const initialLiveDataForType = {};
    groupedMachines[selectedMachineType].forEach((machine) => {
      if (machine.hardware_code) {
        initialLiveDataForType[machine.hardware_code] = liveMachineData[
          machine.hardware_code
        ] || {
          status: "NO STATUS",
          current: 0,
          voltage: 0,
          gasFr: 0,
          rfid: "0",
          wire_spool_weight: machine.wire_spool_weight,
        };
      }
    });
    setLiveMachineData(initialLiveDataForType);

    const listeners = {};
    groupedMachines[selectedMachineType].forEach((machine) => {
      const hardwareCode = machine.hardware_code;
      if (!hardwareCode) return;

      const listener = (data) => {
        setLiveMachineData((prev) => ({
          ...prev,
          [hardwareCode]: {
            status:
              data.mstatus?.toUpperCase() ||
              prev[hardwareCode]?.status ||
              "NO STATUS",
            current: data.cur ?? prev[hardwareCode]?.current ?? 0,
            voltage: data.volt ?? prev[hardwareCode]?.voltage ?? 0,
            gasFr: data.gasFR ?? prev[hardwareCode]?.gasFr ?? 0,
            rfid: data.oid ?? prev[hardwareCode]?.rfid ?? "0",
            wire_spool_weight:
              data.wire_spool_weight ?? prev[hardwareCode]?.wire_spool_weight,
          },
        }));
      };
      socketRef.current.on(hardwareCode, listener);
      listeners[hardwareCode] = listener;
    });

    return () => {
      if (socketRef.current) {
        Object.entries(listeners).forEach(([code, listener]) => {
          socketRef.current.off(code, listener);
        });
      }
    };
  }, [groupedMachines, isSocketConnected, selectedMachineType, socketRef]);

  // Fetch Operators
  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: async () => (await getOperatorsByOrg()).data || [],
    onError: (error) => {
      console.error("Error fetching operators:", error);
      message.error("Failed to fetch operator data");
    },
  });

  // Fetch Previous Jobs
  const { data: previousJobs, isLoading: isPrevJobsLoading } = useQuery({
    queryKey: ["previous_jobs", selectedMachineType],
    queryFn: async () => {
      if (!selectedMachineType) return [];
      return (
        await getPreviousJobSerialAndName({
          machineTypeName: selectedMachineType,
        })
      ).data;
    },
    enabled: !!selectedMachineType,
    onError: (error) => {
      console.error("Error fetching previous jobs:", error);
      message.error("Failed to fetch previous jobs");
    },
  });

  // Fetch Machine Types
  const { data: machineTypes } = useQuery({
    queryKey: ["machine_types_for_operator"],
    queryFn: async () => (await getMachineTypesForOperator()).data || [],
    onError: (error) => {
      console.error("Error fetching machine types:", error);
      message.error("Failed to fetch machine types");
    },
  });

  // Jobs for selected machine type
  const jobsForSelectedType = useMemo(() => {
    if (!machineTypes || !selectedMachineType) return [];
    const jobs = machineTypes
      .filter((mt) => mt.mt_name === selectedMachineType)
      .map((mt) => mt.job_name);
    return [...new Set(jobs)];
  }, [machineTypes, selectedMachineType]);

  // Previous Job State
  const [previousJob, setPreviousJob] = useState({
    job_name: "",
    job_serial: "",
  });

  // Set Initial Machine Type and Reset Selected Job
  useEffect(() => {
    // console.log("groupedMachines", Object.keys(groupedMachines));
    // console.log("selectedMachineType", selectedMachineType);

    if (!selectedMachineType && Object.keys(groupedMachines).length > 0) {
      const firstType = Object.keys(groupedMachines)[0];
      // console.log("firstGrType", firstType);
      setSelectedMachineType(firstType);
      setSelectedJob(""); // Reset job when machine type changes
    }
  }, [groupedMachines, selectedMachineType]);

  // Set Selected Job and Previous Job
  useEffect(() => {
    if (previousJobs?.length > 0) {
      if (!selectedJob || !jobsForSelectedType.includes(selectedJob)) {
        setSelectedJob(previousJobs[0].job_name);
      }
      setPreviousJob({
        job_name: previousJobs[0].job_name || "",
        job_serial: previousJobs[0].job_serial || "",
      });
    } else {
      setSelectedJob("");
      setPreviousJob({ job_name: "", job_serial: "" });
    }
  }, [previousJobs, jobsForSelectedType]);

  // Operator and Machine Logic
  const getOperatorForMachine = useCallback(
    (machineCode) => {
      const machineData = liveMachineData[machineCode];
      return machineData?.rfid && users?.length
        ? users.find((usr) => usr.rf_id === machineData.rfid) || null
        : null;
    },
    [liveMachineData, users]
  );

  const currentOperator = useMemo(() => {
    if (!users || !selectedMachineType || !groupedMachines[selectedMachineType])
      return null;
    for (const machine of groupedMachines[selectedMachineType] || []) {
      const operator = getOperatorForMachine(machine.hardware_code);
      if (operator) return operator;
    }
    return null;
  }, [
    users,
    selectedMachineType,
    liveMachineData,
    groupedMachines,
    getOperatorForMachine,
  ]);

  const currentMachine = useMemo(() => {
    if (!currentOperator || !groupedMachines[selectedMachineType]) return null;
    return groupedMachines[selectedMachineType].find(
      (m) => liveMachineData[m.hardware_code]?.rfid === currentOperator.rf_id
    );
  }, [currentOperator, liveMachineData, selectedMachineType, groupedMachines]);

  // Add this new logic:
  const isAnyMachineRunning = useMemo(() => {
    return (
      groupedMachines[selectedMachineType]?.some(
        (machine) =>
          liveMachineData[machine.hardware_code]?.status === "RUNNING"
      ) || false
    );
  }, [groupedMachines, selectedMachineType, liveMachineData]);

  // Map Job Mutation
  const mapJobMutation = useMutation({
    mutationFn: async ({ serialNumber, jobName, machineType }) => {
      return (
        await updateJobSerial({
          job_name: jobName,
          machine_type_name: machineType,
          job_serial: serialNumber,
        })
      ).data;
    },
    onSuccess: () => {
      message.success("Job mapped successfully!");
      queryClient.invalidateQueries({ queryKey: ["hardware_info"] });
      queryClient.invalidateQueries({
        queryKey: ["previous_jobs", selectedMachineType],
      });
    },
    onError: (error) => {
      console.error("Error mapping job:", error);
      message.error("Error mapping job!");
    },
  });

  const handleMapJob = () => {
    if (!selectedJob || !serialNumber || !selectedMachineType) {
      message.error(
        "Please select a machine type, job, and enter a serial number."
      );
      return;
    }
    mapJobMutation.mutate({
      serialNumber,
      jobName: selectedJob,
      machineType: selectedMachineType,
    });
  };

  // useEffect for Machine Metrics
  useEffect(() => {
    const fetchMachineMetrics = async () => {
      if (
        selectedMachineType &&
        groupedMachines[selectedMachineType]?.length > 0
      ) {
        const firstMachine = groupedMachines[selectedMachineType][0];
        const { formattedDate, shifts } = getQueryParams();

        try {
          const [
            machineMetricsResponse,
            shiftNameResponse,
            idlenessStatus,
            machineTimeline,
          ] = await Promise.all([
            getMachineLoginMetrics({
              machineTypeId: firstMachine.machine_type_id,
              businessDate: formattedDate,
              shifts: shifts,
            }),
            currentlyrunningShift({
              machineTypeId: firstMachine.machine_type_id,
            }),
            machineIdlenessStatus({
              machineTypeId: firstMachine.machine_type_id,
            }),
            getMachineTimeline({
              machineTypeId: firstMachine.machine_type_id,
              businessDate: formattedDate,
              shifts: shifts,
            }),
          ]);

          if (machineMetricsResponse.success) {
            const metrics = machineMetricsResponse.data.map((machData) => ({
              shiftName: machData.shift_name || "N/A",
              machineStartTime: machData.first_machine_start_time || "N/A",
              shiftTiming: machData.time_of_day_category || "N/A",
            }));
            setMachineMetrics(metrics);
          } else {
            message.error("Failed to fetch machine metrics");
            setMachineMetrics([]);
          }

          if (shiftNameResponse.success) {
            // console.log("Shift Name Response", shiftNameResponse.data[0].arc_start_time)
            setShiftLogs({
              machineLastRun: shiftNameResponse.data[0].arc_end_time || "N/A",
              shiftName: shiftNameResponse.data[0].shift_name || "N/A",
            });
          } else {
            message.error("Failed to fetch shift information");
            setShiftLogs({});
          }

          if (idlenessStatus.success) {
            //console.log("Idleness Status", idlenessStatus.data)

            setMachineIdle(idlenessStatus.data[0].idle_from_time);
          } else {
            message.error("Failed to fetch machine idleness status");
            setMachineIdle([]);
          }

          if (machineTimeline.success) {
            //console.log("Machine Timeline", machineTimeline.data)
            setMachineTimeline({
              runningDuration: machineTimeline.data[0].total_arc_duration_hours,
              idleDuration: machineTimeline.data[0].total_stop_duration_hours,
              totalDuration:
                Number(machineTimeline.data[0].total_arc_duration_hours) +
                Number(machineTimeline.data[0].total_stop_duration_hours),
            });
          } else {
            message.error("Failed to fetch machine timeline");
            setMachineTimeline([]);
          }
        } catch (error) {
          console.error("Error fetching machine metrics:", error);
          message.error("Error fetching machine metrics");
          setMachineMetrics([]);
          setShiftLogs({});
        }
      }
    };

    fetchMachineMetrics();
  }, [selectedMachineType, groupedMachines, selectedDate, selectedShifts]);

  const handleMachineTypeChange = async (value) => {
    setSelectedMachineType(value);
  };

  //console.log("Machine Metrics", machineMetrics)

  const handleJobChange = (value) => setSelectedJob(value);

  const cardHeadStyle = {
    backgroundColor: "#1e293b",
    borderBottom: "1px solid #334155",
    color: "#e2e8f0",
  };
  const cardClassName =
    "dark-theme-card bg-slate-800 border-slate-700 text-slate-200 shadow-lg";

  return (
    <div className="p-4 space-y-4 dark:bg-slate-900 min-h-screen rounded-xl">
      {/* Row 1: Operator Dashboard & Production Trend */}
      <div className="flex flex-col lg:flex-row gap-4">
        <Card
          title="Operator Dashboard"
          className={`${cardClassName} lg:w-2/5`}
          styles={{ header: cardHeadStyle }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-400">Operator Name</div>
              <div className="font-semibold min-h-[20px]">
                {currentOperator
                  ? `${currentOperator.user_first_name} ${currentOperator.user_last_name}`
                  : "Not Assigned"}
              </div>
            </div>
            <div>
              <div className="text-gray-400">Current Job Name</div>
              <div className="font-semibold min-h-[20px] truncate">
                {currentMachine?.job_name || "Not Assigned"}
              </div>
            </div>
            <div>
              <div className="text-gray-400">Status</div>
              <div
                className={`font-semibold min-h-[20px] ${
                  isAnyMachineRunning ? "text-green-400" : "text-red-400"
                }`}
              >
                {isAnyMachineRunning ? "Active" : "Inactive"}
              </div>
            </div>
            <div>
              <div className="text-gray-400">Operator Working Hours</div>
              <div className="text-green-400 font-semibold min-h-[20px]">
                4.6 hours
              </div>
            </div>
            <div className="col-span-1 sm:col-span-2">
              <div className="text-gray-400 mb-1">Station Type</div>
              <Select
                className="w-full dark-theme-select"
                value={selectedMachineType}
                onChange={handleMachineTypeChange}
                placeholder="Select Machine Type"
              >
                {Object.entries(groupedMachines).map(([type]) => (
                  <Select.Option key={type} value={type}>
                    {type}
                  </Select.Option>
                ))}
              </Select>
            </div>
            <div className="col-span-1 sm:col-span-2">
              <div className="text-gray-400 mb-1">Select Job</div>
              <Select
                showSearch
                className="w-full dark-theme-select"
                value={selectedJob}
                onChange={handleJobChange}
                placeholder="Select a job..."
                loading={isPrevJobsLoading}
              >
                {jobsForSelectedType.map((job, index) => (
                  <Select.Option key={index} value={job}>
                    {job}
                  </Select.Option>
                ))}
              </Select>
            </div>
            <div className="col-span-1 sm:col-span-2">
              <div className="text-gray-400 mb-1">Serial Number</div>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Enter serial number"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-slate-200 placeholder-slate-500"
                />
                <Button
                  type="primary"
                  className="bg-blue-600 hover:bg-blue-700 border-none"
                  onClick={handleMapJob}
                  loading={mapJobMutation.isPending}
                >
                  Map
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <UsageChart
          timeRange={timeRange}
          setTimeRange={setTimeRange}
          dataType={dataType}
          setDataType={setDataType}
          data={chartQuery.data}
          isLoading={chartQuery.isLoading}
          IsShowDataType={false}
          className={`${cardClassName} lg:w-3/5 m-0`}
          chartType="line"
        />
      </div>

      {/* Row 2: Job Info, Wire Spool, Rework Job */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* For Job Information Section */}
        <Card
          title="Job Information"
          className={cardClassName}
          styles={{ header: cardHeadStyle }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-3">
              <div className="flex items-start">
                <RiBankCardFill className="text-lg mt-1" />
                <div className="flex flex-col ml-3">
                  <div className="font-semibold text-slate-300">
                    Current Job
                  </div>
                  <div className="text-gray-400 mt-0.5">
                    Serial Number:{" "}
                    <span className="text-slate-200">
                      {currentMachine?.job_serial || "N/A"}
                    </span>
                  </div>
                  <div className="text-gray-400">
                    Job Name:{" "}
                    <span className="text-slate-200 truncate">
                      {currentMachine?.job_name || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start">
                <RiBankCardFill className="text-lg mt-1" />
                <div className="flex flex-col ml-3">
                  <div className="font-semibold text-slate-300">
                    Previous Job Details
                  </div>
                  <div className="text-gray-400 mt-0.5">
                    Serial Number:{" "}
                    <span className="text-slate-200">
                      {previousJob.job_serial || "N/A"}
                    </span>
                  </div>
                  <div className="text-gray-400">
                    Job Name:{" "}
                    <span className="text-slate-200 truncate">
                      {previousJob.job_name || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start">
                <RiBankCardFill className="text-lg mt-1" />
                <div className="flex flex-col ml-3">
                  <div className="font-semibold text-slate-300">
                    Target Quantity
                  </div>
                  <div className="text-gray-400 mt-0.5">
                    <span className="text-slate-200">
                      {currentMachine?.job_serial || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start">
                <RiBankCardFill className="text-lg mt-1" />
                <div className="flex flex-col ml-3">
                  <div className="font-semibold text-slate-300">Completed</div>
                  <div className="text-gray-400 mt-0.5">
                    <span className="text-slate-200">
                      {currentMachine?.job_serial || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* For Wire Spool Section */}
        <Card
          title="Wire Spool Status"
          className={cardClassName}
          styles={{ header: cardHeadStyle }}
        >
          <div className="space-y-3 text-sm max-h-48 overflow-y-auto pr-1">
            {(groupedMachines[selectedMachineType] || [])
              .slice(0, 4)
              .map((machine) => {
                //console.log("Machone array", machine)

                // Modification required here
                //******************************************************************************************* */
                const liveData = liveMachineData[machine.hardware_code] || {};
                const currentWeight =
                  liveData.wire_spool_weight ?? machine.wire_spool_weight ?? 0;
                const capacity = machine.wire_spool_capacity ?? 15;
                const percent =
                  capacity > 0 ? (currentWeight / capacity) * 100 : 0;
                let strokeColor =
                  percent < 10
                    ? "#ef4444"
                    : percent < 30
                    ? "#eab308"
                    : "#22c55e";

                return (
                  <div
                    key={machine.hardware_code}
                    className="bg-slate-700/50 p-2 rounded"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-slate-300">
                        {machine.machine_name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">{`${machine.wire_used} kg / ${capacity} kg`}</span>
                        <Button
                          size="small"
                          className="bg-slate-600 hover:bg-slate-500 text-slate-300 border-none text-xs px-1.5 py-0.5"
                        >
                          Reset
                        </Button>
                      </div>
                    </div>
                    <Progress
                      percent={percent}
                      showInfo={false}
                      strokeColor={strokeColor}
                      trailColor="#475569"
                      size="small"
                    />
                    {percent < 10 && (
                      <div className="flex items-center mt-1 text-red-400 text-xs">
                        <WarningOutlined className="mr-1" /> Wire spool low.
                        Replace soon.
                      </div>
                    )}
                  </div>
                );
              })}
            {(!groupedMachines[selectedMachineType] ||
              groupedMachines[selectedMachineType].length === 0) && (
              <p className="text-slate-500">No machines for selected type.</p>
            )}
          </div>
        </Card>

        {/* Re-work Job Card */}
        <Card
          title="Rework Job Status"
          className={cardClassName}
          styles={{ header: cardHeadStyle }}
        >
          <div className="border-l-4 border-yellow-500 pl-3">
            <div className="font-semibold text-slate-300">Rework Details</div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 justify-between mt-2 bg-slate-700/50 p-3 rounded">
              <div>
                <div className="text-gray-400 text-sm">Current Running Job</div>
                <div className="text-slate-200">
                  {currentMachine?.job_serial || "N/A"}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-2 sm:mt-0 justify-end items-center flex-1 w-full">
                <Button className="bg-yellow-500 hover:bg-yellow-600 text-white border-none">
                  Rework
                </Button>
                <Button className="bg-red-500 hover:bg-red-600 text-white border-none">
                  Reject
                </Button>
              </div>
            </div>
          </div>
          <p className="text-sm text-slate-500 mt-3 text-center">
            Reworked Job Details
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3 text-sm">
              <div className="border-l-4 border-gray-500 pl-3">
                <div className="font-semibold text-slate-300">
                  Re-worked Jobs
                </div>
                <div className="text-gray-400 mt-0.5">
                  <span className="text-slate-200">N/A</span>
                </div>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <div className="border-l-4 border-gray-500 pl-3">
                <div className="font-semibold text-slate-300">
                  Rejected Jobs
                </div>
                <div className="text-gray-400 mt-0.5">
                  <span className="text-slate-200">N/A</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Row 3: Live Process Parameters & Right Column */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Live Process Parameters Section */}
        <Card
          title="Live Process Parameters"
          className={`${cardClassName} lg:w-3/5`}
          styles={{ header: cardHeadStyle }}
        >
          {isSocketConnected && groupedMachines[selectedMachineType] ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[450px] overflow-y-auto pr-1 text-sm">
              {groupedMachines[selectedMachineType].map((machine) => {
                const liveData = liveMachineData[machine.hardware_code] || {};
                const operator = getOperatorForMachine(machine.hardware_code);
                return (
                  <div
                    key={machine.hardware_code}
                    className="bg-slate-700/50 p-3 rounded"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-blue-400 font-semibold truncate">
                        {machine.machine_name}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          liveData.status === "RUNNING"
                            ? "bg-green-500/20 text-green-400"
                            : liveData.status === "STOP"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}
                      >
                        {liveData.status}
                      </span>
                    </div>
                    {operator && (
                      <div className="text-xs text-slate-400 mb-2">
                        Operator: {operator.user_first_name}{" "}
                        {operator.user_last_name}
                      </div>
                    )}
                    {["Voltage", "Current", "Gas Flow"].map((param) => {
                      let value = 0,
                        low = 0,
                        high = Infinity,
                        unit = "",
                        paramKey = "";
                      if (param === "Voltage") {
                        value = liveData.voltage || 0;
                        low = machine.low_weld_volt_threshold;
                        high = machine.high_weld_volt_threshold;
                        unit = "V";
                        paramKey = "voltage";
                      } else if (param === "Current") {
                        value = liveData.current || 0;
                        low = machine.low_weld_cur_threshold;
                        high = machine.high_weld_cur_threshold;
                        unit = "A";
                        paramKey = "current";
                      } else {
                        value = liveData.gasFr || 0;
                        low = machine.low_weld_gas_threshold;
                        high = machine.high_weld_gas_threshold;
                        unit = "L/min";
                        paramKey = "gasFr";
                      }
                      const strokeColor =
                        value > high || (value < low && value !== 0)
                          ? "#ef4444"
                          : value === 0
                          ? "#6b7280"
                          : paramKey === "current"
                          ? "#8884d8"
                          : paramKey === "voltage"
                          ? "#82ca9d"
                          : "#03C9D7";

                      return (
                        <div key={param} className="mt-1.5">
                          <div className="flex justify-between text-xs text-slate-400 mb-0.5">
                            <span>
                              {param}: {value} {unit}
                            </span>
                          </div>
                          <Progress
                            percent={calculateProgress(value, low, high)}
                            showInfo={false}
                            strokeColor={strokeColor}
                            size="small"
                            trailColor="#475569"
                          />
                          <div className="flex justify-between text-[10px] text-slate-500 leading-tight">
                            <span>
                              Low: {low} {unit}
                            </span>
                            <span>
                              High: {high} {unit}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex justify-center items-center h-64">
              <Spin tip="Loading live data..." />
            </div>
          )}
        </Card>

        <div className="lg:w-2/5 flex flex-col gap-4">
          {/* Machine Timeline Section */}
          <Card
            title="Machine Timeline"
            className={`${cardClassName} flex-1`}
            styles={{ header: cardHeadStyle }}
          >
            <div className="h-40 md:h-48 min-h-[150px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    {
                      name: "Timeline",
                      Production: machineTimeline.runningDuration || 0,
                      Idle: machineTimeline.idleDuration || 0,
                      totalDuration: machineTimeline.totalDuration || 0,
                    },
                  ]}
                  layout="vertical"
                  stackOffset="expand"
                >
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" hide />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: "#011627",
                      borderColor: "#475569",
                      borderRadius: "0.375rem",
                    }}
                    formatter={(value) => `${value} Hrs`}
                  />
                  <Bar
                    dataKey="Production"
                    stackId="a"
                    fill="#3bbcca"
                    barSize={25}
                    radius={[5, 0, 0, 5]}
                  />
                  <Bar dataKey="Idle" stackId="a" fill="#eab308" barSize={25} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-around text-xs mt-2 text-slate-400">
              <div className="flex items-center">
                <span className="w-2.5 h-2.5 bg-blue-500 rounded-sm mr-1.5"></span>
                Production (
                {(
                  (machineTimeline.runningDuration /
                    machineTimeline.totalDuration) *
                    100 || 0
                ).toFixed(0)}
                %)
              </div>
              <div className="flex items-center">
                <span className="w-2.5 h-2.5 bg-yellow-500 rounded-sm mr-1.5"></span>
                Idle (
                {(
                  (machineTimeline.idleDuration /
                    machineTimeline.totalDuration) *
                    100 || 0
                ).toFixed(0)}
                %)
              </div>
              <div className="flex items-center">
                <span className="text-slate-400">
                  Total Duration:{" "}
                  {machineTimeline.totalDuration?.toFixed(2) || 0} Hrs
                </span>
              </div>
            </div>
          </Card>

          {/* MAchine Metrics Section */}
          <Card
            title="Machine Metrics"
            className={`${cardClassName} flex-1`}
            styles={{ header: cardHeadStyle }}
          >
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div>
                <div className="text-gray-400">Start Time</div>
                {machineMetrics.length > 0 ? (
                  machineMetrics.map((metric, index) => (
                    <div key={index} className="text-slate-200">
                      {metric.machineStartTime || "N/A"}
                      <span className="ml-2 justify-start">
                        {metric.shiftTiming}
                      </span>
                      <span className="ml-2 justify-start">
                        {" "}
                        Shift: {metric.shiftName}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-200">N/A</div>
                )}
              </div>
              <div>
                <div className="text-gray-400">Idle From</div>
                <div className="text-slate-200">{machineIdle}</div>
              </div>
              <div>
                <div className="text-gray-400">Latest Running Status</div>
                <div className="text-slate-200">
                  {shiftLogs.machineLastRun || "N/A"}
                </div>
              </div>
              <div>
                <div className="text-gray-400">Last Update</div>
                <div className="text-slate-200">N/A</div>
              </div>
              <div className="col-span-2">
                <div className="text-gray-400">
                  Current Shift:{" "}
                  <span className="text-slate-200">
                    {shiftLogs.shiftName || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Downtime Counts Section */}
          <Card
            title="Downtime Counts"
            className={`${cardClassName} flex-1`}
            styles={{ header: cardHeadStyle }}
          >
            {isDowntimeLoading ? (
              <div className="flex justify-center items-center h-24">
                <Spin tip="Loading downtime counts..." />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-400">Planned Downtime</div>
                  <div className="text-slate-200">
                    {downtimeCounts?.total_planned_downtime || 0}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400">Unplanned Downtime</div>
                  <div className="text-slate-200">
                    {downtimeCounts?.total_unplanned_downtime || 0}
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
