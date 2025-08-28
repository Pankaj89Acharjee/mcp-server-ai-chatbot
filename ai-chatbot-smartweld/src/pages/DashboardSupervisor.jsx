import React, { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import "antd/dist/reset.css";
import { Col, Modal, Row, Spin, message } from "antd";
import dayjs from "dayjs";
import { SlidersHorizontal, FileWarning, Building, Clock, HardHat, BotMessageSquare, ListTree, UserCog } from "lucide-react";

// Components
import StationCard from "../components/StationCard";
import SummaryCard from "../components/SummaryCard";
import { OEEChart } from "../components/Dashboard/oee-chart";

// Context
import { useDateSelectionContext } from "../contexts/DateSelectionContext";
import useWebSocket from "../customHooks/useWebSocket";

// API and utils
import { getOperatorsStations } from "../apicalls/machineType";
import { getCardsValueForDashboard, getMachinesByType } from "../apicalls/dashboardSupervisorAPICalls";
import { formatDate } from "../lib/utils";

const DashboardSupervisor = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { selectedDate, dateType, selectedShifts, updateDateSelection, updateShiftSelection } = useDateSelectionContext();

  // Set defaults if needed
  React.useEffect(() => {
    if (!selectedDate) {
      updateDateSelection(dayjs());
    }

    if (!selectedShifts || selectedShifts.length === 0) {
      updateShiftSelection(["A", "B", "C"]);
    }
  }, [selectedDate, selectedShifts, updateDateSelection, updateShiftSelection]);

  // Format date for API calls
  const formattedDate = useMemo(() => {
    if (!selectedDate) return null;

    if (dateType === "range" && Array.isArray(selectedDate)) {
      return {
        startDate: selectedDate[0].format("YYYY-MM-DD"),
        endDate: selectedDate[1].format("YYYY-MM-DD"),
      };
    }
    return selectedDate.format("YYYY-MM-DD");
  }, [selectedDate, dateType]);

  // WebSocket connection
  const webSocketURL = process.env.REACT_APP_SOCKET_SERVER_URL;
  const { socketRef, isSocketConnected } = useWebSocket(webSocketURL);

  // Query: Dashboard metrics
  const metricsQuery = useQuery({
    queryKey: ["dashboardMetrics", formattedDate, selectedShifts],
    queryFn: async () => {
      const response = await getCardsValueForDashboard(
        formattedDate,
        selectedShifts
      );

      if (response.error) {
        throw new Error(response.error);
      }

      if (!response.data) {
        throw new Error("No data received from the server");
      }

      return response.data;
    },
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
    enabled: !!formattedDate && !!selectedShifts && selectedShifts.length > 0,
    staleTime: 8 * 60 * 1000, // Consider data stale after 8 minutes
  });

  // Query: Hardware info
  const hardwareInfoQuery = useQuery({
    queryKey: ["hardwareInfo"],
    queryFn: async () => {
      const response = await getOperatorsStations();
      return response.data || [];
    },
    staleTime: 30 * 60 * 1000, // Hardware info doesn't change often
    onError: (error) => {
      console.error("Error fetching hardware info:", error);
      message.error("Failed to fetch hardware information");
    },
  });

  // Process hardware info to group by machine type
  const groupedMachines = useMemo(() => {
    if (!hardwareInfoQuery.data) return {};

    return hardwareInfoQuery.data.reduce((acc, hw) => {
      if (!hw.hardware_code) return acc;

      const type = hw.machine_type || "Uncategorized";
      if (type !== "All") {
        acc[type] = acc[type] || [];
        acc[type].push({
          ...hw,
          high_weld_cur_threshold: hw.high_weld_cur_threshold ?? Infinity,
          high_weld_gas_threshold: hw.high_weld_gas_threshold ?? Infinity,
          high_weld_volt_threshold: hw.high_weld_volt_threshold ?? Infinity,
          low_weld_cur_threshold: hw.low_weld_cur_threshold ?? 0,
          low_weld_gas_threshold: hw.low_weld_gas_threshold ?? 0,
          low_weld_volt_threshold: hw.low_weld_volt_threshold ?? 0,
        });
      }
      return acc;
    }, {});
  }, [hardwareInfoQuery.data]);

  // Get machine type IDs for station data query
  const machineTypeIds = useMemo(() => {
    return Object.values(groupedMachines)
      .map((machines) => machines[0]?.machine_type_id)
      .filter((id) => id != null);
  }, [groupedMachines]);

  // Query: Station data for each machine type
  const stationDataQuery = useQuery({
    queryKey: ["stationData", machineTypeIds, formattedDate, selectedShifts],
    queryFn: async () => {
      if (machineTypeIds.length === 0) return {};

      const datePayload = formatDate(selectedDate || dayjs(), dateType);
      const shifts = selectedShifts.length ? selectedShifts : ["A", "B", "C"];

      const { data } = await getMachinesByType(
        machineTypeIds,
        datePayload,
        shifts
      );

      return data || {};
    },
    enabled:
      machineTypeIds.length > 0 &&
      !!formattedDate &&
      !!selectedShifts &&
      selectedShifts.length > 0,
    staleTime: 5 * 60 * 1000,
  });


  //console.log("data assignment", stationDataQuery);


  // Process station data into a map by station ID
  const stationDataMap = useMemo(() => {
    const result = {};
    const data = stationDataQuery.data;


    // Process availability data
    if (data && data.availability) {
      Object.values(data.availability).forEach((availData) => {
        if (availData && availData.station_id != null) {
          const stationId = availData.station_id;
          if (!result[stationId]) {
            result[stationId] = { station_id: stationId };
          }
          result[stationId].availability = Number(availData.availability || 0);
        }
      });
    }

    // Process productivity data
    if (data?.productivity) {
      Object.values(data.productivity).forEach((production) => {
        const { station_id, productivity_by_station } = production;
        if (station_id != null) {
          result[station_id] = result[station_id] || {
            station_id: station_id,
          };
          result[station_id].productivity = production.productivity_by_station || 0;
        }
      });
    }

    // Process total jobs data
    if (data?.totalJobs) {
      Object.values(data.totalJobs).forEach((jobData) => {
        const { machine_type_id, total_jobs_produced } = jobData;
        if (machine_type_id != null) {
          result[machine_type_id] = result[machine_type_id] || {
            station_id: machine_type_id,
          };
          result[machine_type_id].totalJobs = Number(total_jobs_produced || 0);
        }
      });
    }

    // Process last-run availability counts
    if (data?.lastRun) {
      Object.values(data.lastRun).forEach((runData) => {
        const { machine_type_id, availability_count } = runData;
        if (machine_type_id != null) {
          result[machine_type_id] = result[machine_type_id] || {
            station_id: machine_type_id,
          };
          // Map this into its own field – e.g. lastRun
          result[machine_type_id].lastRun = Number(availability_count || 0);
        }
      });
    }

    // Process arc time data
    if (data?.arcTime) {
      Object.values(data.arcTime).forEach((timeData) => {
        const { station_id, arc_time } = timeData;
        if (station_id != null) {
          result[station_id] = result[station_id] || {
            station_id: station_id,
          };
          result[station_id].arcTime = Number(arc_time || 0);
        }
      });
    }


    // Process wire consumed data
    if (data?.wireConsumed) {
      Object.values(data.wireConsumed).forEach((wireData) => {
        const { station_id, total_calculated_wire_used } = wireData;
        if (station_id != null) {
          result[station_id] = result[station_id] || {
            station_id: station_id,
          };
          result[station_id].wireConsumed = total_calculated_wire_used;
        }
      });
    }


    // Process gas consumed data
    if (data?.gasConsumed) {
      Object.values(data.gasConsumed).forEach((gasData) => {
        const { station_id, total_calculated_gas_used } = gasData;
        if (station_id != null) {
          result[station_id] = result[station_id] || {
            station_id: station_id,
          };
          result[station_id].gasConsumed = Number(total_calculated_gas_used || 0);
        }
      });
    }





    return result;
  }, [stationDataQuery.data]);

  // Prepare machine type entries with station data
  const machineTypeEntries = useMemo(() => {
    return Object.entries(groupedMachines)
      .map(([type, machines]) => {
        const machineTypeId = machines[0]?.machine_type_id;
        const stationData = machineTypeId
          ? stationDataMap[machineTypeId]
          : undefined;
        return [type, { station: stationData, machines }];
      })
      .sort(([a], [b]) =>
        a === "Uncategorized"
          ? 1
          : b === "Uncategorized"
            ? -1
            : a.localeCompare(b)
      );
  }, [groupedMachines, stationDataMap]);

  // Live machine data state
  const [liveMachineData, setLiveMachineData] = useState({});






  // Setup WebSocket listeners
  React.useEffect(() => {
    if (!socketRef.current || !isSocketConnected || !hardwareInfoQuery.data) {
      return;
    }

    const listeners = {};

    // Initialize liveMachineData with default values for all machines
    const initialLiveData = {};
    hardwareInfoQuery.data.forEach((element) => {
      if (element.hardware_code) {
        initialLiveData[element.hardware_code] = {
          status: "NO STATUS",
          current: 0,
          voltage: 0,
          gasFr: 0,
          rfid: "0",
          wire_thickness: element.wire_thickness ?? "0",
        };
      }
    });

    // Only update if it's different from current state
    setLiveMachineData((prev) => {
      if (Object.keys(prev).length === 0) {
        return initialLiveData;
      }
      return prev;
    });

    // Setup listeners for each hardware item
    hardwareInfoQuery.data.forEach((element) => {
      const hardwareCode = element.hardware_code;
      if (!hardwareCode) return;

      const listener = (data) => {
        setLiveMachineData((prevData) => {
          const prevHardwareData = prevData[hardwareCode] || {};
          return {
            ...prevData,
            [hardwareCode]: {
              ...prevHardwareData,
              status: data.mstatus || prevHardwareData.status || "NO STATUS",
              current: data.cur ?? prevHardwareData.current ?? 0,
              voltage: data.volt ?? prevHardwareData.voltage ?? 0,
              gasFr: data.gasFR ?? prevHardwareData.gasFr ?? 0,
              rfid: data.oid ?? prevHardwareData.rfid ?? "0",
            },
          };
        });
      };

      socketRef.current.on(hardwareCode, listener);
      listeners[hardwareCode] = listener;
    });

    // Cleanup listeners
    return () => {
      if (socketRef.current) {
        Object.entries(listeners).forEach(([code, listener]) => {
          // eslint-disable-next-line react-hooks/exhaustive-deps
          socketRef.current.off(code, listener);
        });
      }
    };
  }, [isSocketConnected, hardwareInfoQuery.data, socketRef]);

  // Helper function for formatting percentages consistently
  const formatPercentage = (value) => `${parseFloat(value ?? 0).toFixed(1)}%`;

  // Summary card data
  const summaryTop = useMemo(
    () => [
      {
        link: "/dashboard/availabilities/1",
        title: "Overall Availability",
        icon: Building,
        value: metricsQuery.isLoading
          ? "Loading..."
          : formatPercentage(metricsQuery.data?.overall_availability),
        loading: metricsQuery.isLoading,
      },
      {
        link: "/dashboard/productivities",
        title: "Overall Productivity",
        icon: HardHat,
        value: metricsQuery.isLoading
          ? "Loading..."
          : formatPercentage(metricsQuery.data?.overall_productivity),
        unit: "%",
        loading: metricsQuery.isLoading,
      },
      {
        link: "/dashboard/qualities",
        title: "Overall Quality",
        icon: ListTree,
        value: metricsQuery.isLoading
          ? "Loading..."
          : formatPercentage(metricsQuery.data?.overall_quality),
        unit: "%",
        loading: metricsQuery.isLoading,
      },
      {
        onClick: () => setIsModalOpen(true),
        title: "Overall OEE",
        icon: UserCog,
        value: metricsQuery.isLoading
          ? "Loading..."
          : formatPercentage(metricsQuery.data?.overall_oee),
        unit: "%",
        loading: metricsQuery.isLoading,
      },
      {
        link: "/dashboard/productivities",
        title: "Total Jobs Produced",
        icon: BotMessageSquare,
        value: metricsQuery.isLoading
          ? "Loading..."
          : formatPercentage(metricsQuery.data?.overall_jobs),
        loading: metricsQuery.isLoading,
      },
      {
        link: "/dashboard/qualities",
        title: "Total Defects",
        icon: FileWarning,
        value: metricsQuery.isLoading
          ? "Loading..."
          : formatPercentage(metricsQuery.data?.total_defects),
        loading: metricsQuery.isLoading,
      },
    ],
    [metricsQuery.data, metricsQuery.isLoading, setIsModalOpen]
  );

  const summaryBottom = useMemo(
    () => [
      {
        title: "Running Stations",
        icon: FileWarning,
        value: 10,
      },
      {
        title: "Idle Stations",
        icon: Clock,
        value: 5,
      },
      {
        title: "Stopped Stations",
        icon: SlidersHorizontal,
        value: 15,
      },
    ],
    []
  );

  // Manual refetch function for user interaction
  const refreshData = () => {
    queryClient.invalidateQueries(["dashboardMetrics"]);
    queryClient.invalidateQueries(["stationData"]);
    message.info("Refreshing dashboard data...");
  };

  // Loading state for initial rendering
  if (hardwareInfoQuery.isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-gray-900">
        <Spin size="large" tip="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="flex flex-col mt-12 md:mt-4 min-h-screen bg-gray-100 dark:bg-gray-900">
      <main className="flex flex-col items-center gap-4 px-4 py-4 flex-grow overflow-hidden">
        {/* Top Summary Section */}
        <div className="w-full max-w-7xl p-3 bg-white dark:bg-gray-800 rounded-lg shadow text-center text-gray-600 dark:text-gray-300 text-sm flex-shrink-0">
          <div className="flex justify-between items-center mb-2">
            <div className="text-xs text-gray-500 dark:text-gray-300">
              {metricsQuery.dataUpdatedAt && (
                <span>
                  Last updated:{" "}
                  {dayjs(new Date(metricsQuery.dataUpdatedAt)).format(
                    "HH:mm:ss"
                  )}
                  {metricsQuery.isFetching && (
                    <span className="ml-2">(Refreshing...)</span>
                  )}
                </span>
              )}
            </div>
            <button
              className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
              onClick={refreshData}
              disabled={metricsQuery.isFetching}
            >
              Refresh
            </button>
          </div>
          <Row gutter={[16, 16]}>
            {summaryTop.map((item, idx) => (
              <Col xs={24} sm={12} lg={4} key={idx}>
                <SummaryCard {...item} />
              </Col>
            ))}
          </Row>
          <Row gutter={[16, 16]} className="mt-3">
            {summaryBottom.map((item, idx) => (
              <Col xs={24} sm={12} lg={8} key={idx}>
                <SummaryCard {...item} />
              </Col>
            ))}
          </Row>
        </div>

        {/* Machine Cards Section */}
        <div className="w-full max-w-7xl flex-grow overflow-y-auto pb-4 rounded-lg">
          {machineTypeEntries.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {machineTypeEntries.map(([type, entry]) => (
                <StationCard
                  key={type}
                  machineType={type}
                  machines={entry.machines}
                  station={entry.station}
                  liveMachineData={liveMachineData}
                  isLoadingStationData={
                    stationDataQuery.isLoading && !entry.station
                  }
                />
              ))}
            </div>
          ) : stationDataQuery.isLoading || hardwareInfoQuery.isLoading ? (
            <div className="flex justify-center items-center h-full">
              <Spin tip="Loading station information..." />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-neutral-500 dark:text-neutral-400">
              {hardwareInfoQuery.data?.length === 0 && !isSocketConnected
                ? "Initializing and fetching machine data..."
                : "No machine stations found."}
            </div>
          )}
        </div>

        {/* Charts Section */}
        <div className="w-full max-w-6xl p-3 mt-auto bg-white dark:bg-gray-800 rounded-lg shadow text-center text-gray-600 dark:text-gray-300 text-sm flex-shrink-0">
          [Placeholder for Charts Below Scrollable Cards]
        </div>
      </main>

      {/* OEE Chart Modal */}
      <Modal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        className="dark-theme-model !w-4/6"
        footer={null}
        closeIcon={null}
      >
        <OEEChart setIsModalOpen={setIsModalOpen} />
      </Modal>
    </div>
  );
};

export default DashboardSupervisor;
