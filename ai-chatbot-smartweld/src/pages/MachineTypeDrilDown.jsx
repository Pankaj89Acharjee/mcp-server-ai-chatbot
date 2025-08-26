import React, {
  useState,
  useEffect,
  useCallback,
 
  useMemo,
} from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { Card, Row, Col, Progress, Skeleton } from "antd";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar } from "recharts";
import { ArrowLeft } from "lucide-react";
import useWebSocket from "../customHooks/useWebSocket";
import { getHardwareList } from '../apicalls/machineJobRunInfoCall';
import { getMachinesByType } from "../apicalls/dashboardSupervisorAPICalls";
import { getOperatorsByOrg } from '../apicalls/usersApiCall';
import { getPreviousJobSerialAndName } from "../apicalls/machineType";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useDateSelectionContext } from "../contexts/DateSelectionContext";
import { formatDate } from "../lib/utils";

// Mock Data for Charts
const mockPieData = [
  { name: "Planned", value: 44.44, fill: "#8884d8" },
  { name: "Unplanned", value: 55.56, fill: "#82ca9d" },
];

const mockBarDataIdle = [
  { name: "(Blank)", DurationMinutes: 2100 },
  { name: "No Material", DurationMinutes: 125 },
  { name: "Process Trouble Lana", DurationMinutes: 87 },
];

const MachineTypeDrillDown = () => {
    const { machineTypeId } = useParams();
    const location = useLocation();
    const [machines, setMachines] = useState(location.state?.machines || null);
    const [machineType, setMachineType] = useState(location.state?.machineType || "");
    const [pieData, setPieData] = useState(mockPieData);
    const [isLoading, setIsLoading] = useState(!location.state?.machines);
    const [error, setError] = useState(null);
    const [liveMachineData, setLiveMachineData] = useState({});
    // Add state for metrics
    const [metrics, setMetrics] = useState({
        arcingTime: location.state?.arcingTime || 0,
        wireConsumed: location.state?.wireConsumed || 0,
        gasConsumed: location.state?.gasConsumed || 0,
        jobProduced: location.state?.jobProduced || 0
    });

    // WebSocket Setup
    const webSocketURL = process.env.REACT_APP_SOCKET_SERVER_URL;
    const { socketRef, isSocketConnected } = useWebSocket(webSocketURL);

    const { selectedDate, dateType, updateDateSelection, updateShiftSelection, selectedShifts } = useDateSelectionContext();

    // React Query hooks for API calls
    const { data: hardwareInfo = [], isLoading: isHardwareLoading } = useQuery({
        queryKey: ['hardwareInfo'],
        queryFn: async () => {
            const response = await getHardwareList();
            return response.data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    const { data: users = [], isLoading: isUsersLoading } = useQuery({
        queryKey: ['operators'],
        queryFn: async () => {
            const response = await getOperatorsByOrg();
            return response.data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    const { data: previousJobSerial = [], isLoading: isPreviousJobLoading } = useQuery({
        queryKey: ['previousJobSerial', machineType],
        queryFn: async () => {
            const response = await getPreviousJobSerialAndName({ machineTypeName: machineType });
            return response.data;
        },
        enabled: !!machineType, // Only run query if machineType exists
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    // Static Data from Image (for demonstration)
    const staticLiveMachineData = {
        "MC-1": { current: 150, voltage: 20, gasFr: 10 },
        "MC-2": { current: 150, voltage: 20, gasFr: 10 },
    };



    // Get date & shifts from Context
    useEffect(() => {
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



  // WebSocket Listeners
  useEffect(() => {
    if (!socketRef.current || !isSocketConnected || !machines) {
      return;
    }

    // Initialize liveMachineData with static values as fallback
    const initialLiveData = {};
    machines.forEach((machine) => {
      if (machine.hardware_code) {
        initialLiveData[machine.hardware_code] = {
          status: "NO STATUS",
          current: staticLiveMachineData[machine.hardware_code]?.current || 0,
          voltage: staticLiveMachineData[machine.hardware_code]?.voltage || 0,
          gasFr: staticLiveMachineData[machine.hardware_code]?.gasFr || 0,
          rfid: "0",
        };
      }
    });

    setLiveMachineData((prev) => {
      if (Object.keys(prev).length === 0) {
        return initialLiveData;
      }
      return prev;
    });

    // Setup listeners for real-time updates
    const listeners = {};
    machines.forEach((machine) => {
      const hardwareCode = machine.hardware_code;
      if (!hardwareCode) return;

            const listener = (data) => {
                setLiveMachineData((prevData) => ({
                    ...prevData,
                    [hardwareCode]: {
                        ...prevData[hardwareCode],
                        status: data.mstatus || prevData[hardwareCode].status || "NO STATUS",
                        current: (data.cur ?? prevData[hardwareCode].current ?? staticLiveMachineData[hardwareCode]?.current) || 0,
                        voltage: (data.volt ?? prevData[hardwareCode].voltage ?? staticLiveMachineData[hardwareCode]?.voltage) || 0,
                        gasFr: (data.gasFR ?? prevData[hardwareCode].gasFr ?? staticLiveMachineData[hardwareCode]?.gasFr) || 0,
                        rfid: data.oid ?? prevData[hardwareCode].rfid ?? "0",
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
    }, [isSocketConnected, machines, socketRef]);





    // Data Fetching if not passed through <Link  {state}> 
    useEffect(() => {
        const fetchMachineData = async () => {
            if (location.state?.arcingTime === 'N/A') {
                setIsLoading(true);
                setError(null);
                try {
                    // Use date from context
                    const datePayload = formatDate(selectedDate || dayjs(), dateType)

                    const shifts = selectedShifts.length ? selectedShifts : ["A", "B", "C"];

                    // Fetch machine data
                    const { data } = await getMachinesByType(
                        [machineTypeId], //since ids are passed as an array in query
                        datePayload,
                        shifts
                    );

                    //console.log("Data received as Parameters", data)
                    if (data) {
                        // Update metrics state with API data
                        setMetrics(prevMetrics => ({
                            ...prevMetrics,
                            arcingTime: data.arcTime ? Object.values(data.arcTime)[0]?.arc_time || 0 : prevMetrics.arcingTime,
                            wireConsumed: data.wireConsumed ? Object.values(data.wireConsumed)[0]?.total_calculated_wire_used || 0 : prevMetrics.wireConsumed,
                            gasConsumed: data.gasConsumed ? Object.values(data.gasConsumed)[0]?.total_calculated_gas_used || 0 : prevMetrics.gasConsumed,
                            jobProduced: data.totalJobs ? Object.values(data.totalJobs)[0]?.total_jobs_produced || 0 : prevMetrics.jobProduced
                        }));
                    } else {

                    }
                } catch (error) {
                    console.error("Error fetching machine data:", error);
                    setError(`Failed to fetch machine data: ${error.message}`);
                    setMachines([]);
                    setMachineType("Unknown Type");
                } finally {
                    setIsLoading(false);
                }
            } else if (location.state?.machines) {
                setIsLoading(false);
            }
        };

        fetchMachineData();
    }, [location.state, machineTypeId, formattedDate, selectedShifts]);

    // Searching and assigning operators according to hardware oid
    const getOperatorForMachine = useCallback((machineCode) => {
        const machineData = liveMachineData[machineCode];
        if (!machineData?.rfid || !users?.length) return null;
        return users.find((usr) => usr.rf_id === machineData.rfid) || 'Not assigned';
    }, [liveMachineData, users]);

  // Get threshold values for a specific machine
  const getThresholdValues = useCallback(
    (machineCode) => {
      const hardware = hardwareInfo.find(
        (hard) => hard.hardware_code === machineCode
      );
      if (!hardware) return null;

      return {
        voltage: {
          low: hardware.low_weld_volt_threshold,
          high: hardware.high_weld_volt_threshold,
        },
        current: {
          low: hardware.low_weld_cur_threshold,
          high: hardware.high_weld_cur_threshold,
        },
        gas: {
          low: hardware.low_weld_gas_threshold,
          high: hardware.high_weld_gas_threshold,
        },
      };
    },
    [hardwareInfo]
  );

    // Loading state
    if (isLoading || isHardwareLoading || isUsersLoading || isPreviousJobLoading) {
        return (
            <div className="min-h-screen dark:bg-slate-900 text-white p-4 md:p-8 font-sans">
                <header className="flex flex-wrap justify-between items-center mb-4 gap-y-2 border-b border-slate-700 pb-4">
                    <Skeleton.Input active size="large" style={{ width: 300 }} />
                </header>

                <Skeleton active className="mb-6" />

                <div className="space-y-6">
                    {/* Top Cards Row */}
                    <Row gutter={[16, 16]}>
                        {[1, 2, 3, 4].map((item) => (
                            <Col xs={24} sm={12} lg={6} key={item}>
                                <Card className="bg-slate-800 border-slate-700 text-white shadow-lg rounded-lg h-full text-center">
                                    <Skeleton active avatar paragraph={{ rows: 2 }} />
                                </Card>
                            </Col>
                        ))}
                    </Row>

                    {/* Downtime Analysis Row */}
                    <Row gutter={[16, 16]}>
                        <Col xs={24} md={24} lg={9}>
                            <Card className="bg-slate-800 border-slate-700 text-white h-full shadow-lg rounded-lg">
                                <Skeleton active avatar paragraph={{ rows: 4 }} />
                            </Card>
                        </Col>
                        <Col xs={24} lg={15}>
                            <Card className="bg-slate-800 border-slate-700 text-white shadow-lg rounded-lg h-full">
                                <Skeleton active avatar paragraph={{ rows: 4 }} />
                            </Card>
                        </Col>
                    </Row>

                    {/* Job Information and Machine Process Parameters Row */}
                    <Row gutter={[16, 16]}>
                        <Col xs={24} lg={12}>
                            <Card className="bg-slate-800 border-slate-700 text-white shadow-lg rounded-lg h-full">
                                <Row gutter={[16, 16]}>
                                    <Col xs={24} md={12}>
                                        <Skeleton active avatar paragraph={{ rows: 7 }} />
                                    </Col>
                                    <Col xs={24} md={12}>
                                        <Skeleton active avatar paragraph={{ rows: 7 }} />
                                    </Col>
                                </Row>
                            </Card>
                        </Col>
                        <Col xs={24} lg={12}>
                            <Card className="bg-slate-800 border-slate-700 text-white shadow-lg rounded-lg h-full">
                                <div className="space-y-3">
                                    {[1, 2, 3].map((item) => (
                                        <div key={item} className="border-b border-slate-700 pb-3 last:border-b-0">
                                            <Skeleton active avatar paragraph={{ rows: 4 }} />
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </Col>
                    </Row>
                </div>
            </div>
        );
    }

  if (error) {
    return <div className="p-4 text-center text-red-600">Error: {error}</div>;
  }

    if (!machines || machines.length === 0) {
        return (
            <div className="p-4">
                <h1 className="text-xl font-bold mb-4">
                    Machine Type: {machineType || `ID ${machineTypeId}`}
                </h1>
                <p>No machines found for this type.</p>
                <Link
                    to="/dashboard"
                    className="text-blue-500 hover:underline mt-4 inline-block"
                >
                    ← Back to Dashboard
                </Link>
            </div>
        );
    }

  return (
    <div className="min-h-screen dark:bg-slate-900 text-white p-4 md:p-8 font-sans">
      <header className="flex flex-wrap justify-between items-center mb-4 gap-y-2 border-b border-slate-700 pb-4">
        <h1 className="text-2xl uppercase bg-slate-100 dark:bg-slate-600 p-1 rounded-lg text-slate-500 dark:text-slate-300 md:text-3xl font-bold">
          {`Machine Type: ${
            machineType || `ID ${machines[0]?.machine_type_id || "Loading..."}`
          }`}
        </h1>
      </header>

      <Link
        to="/dashboard"
        className="text-blue-400 hover:underline mb-6 inline-flex items-center"
      >
        <ArrowLeft className="mr-2" size={16} /> Back to Dashboard
      </Link>

      {!isLoading && !error && (
        <div className="space-y-6">
          {/* Top Cards Row */}
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <Card
                className="bg-slate-800 border-slate-700 text-white shadow-lg rounded-lg h-full text-center"
                title="Availability"
                headStyle={{
                  color: "white",
                  borderBottom: "1px solid #475569",
                }}
              >
                <ResponsiveContainer width="100%" height={100}>
                  <RadialBarChart
                    cx="50%"
                    cy="50%"
                    innerRadius="60%"
                    outerRadius="90%"
                    barSize={10}
                    data={[]}
                    startAngle={180}
                    endAngle={0}
                  >
                    <RadialBar dataKey="value" cornerRadius={10} />
                    <text
                      x="50%"
                      y="55%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-xl font-bold"
                      fill="white"
                    ></text>
                  </RadialBarChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card
                className="bg-slate-800 border-slate-700 text-white shadow-lg rounded-lg h-full text-center"
                title="Productivity"
                headStyle={{
                  color: "white",
                  borderBottom: "1px solid #475569",
                }}
              >
                <ResponsiveContainer width="100%" height={100}>
                  <RadialBarChart
                    cx="50%"
                    cy="50%"
                    innerRadius="60%"
                    outerRadius="90%"
                    barSize={10}
                    data={[]}
                    startAngle={180}
                    endAngle={0}
                  >
                    <RadialBar dataKey="value" cornerRadius={10} />
                    <text
                      x="50%"
                      y="55%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-xl font-bold"
                      fill="white"
                    ></text>
                  </RadialBarChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card
                className="bg-slate-800 border-slate-700 text-white shadow-lg rounded-lg h-full text-center"
                title="Quality"
                headStyle={{
                  color: "white",
                  borderBottom: "1px solid #475569",
                }}
              >
                <ResponsiveContainer width="100%" height={100}>
                  <RadialBarChart
                    cx="50%"
                    cy="50%"
                    innerRadius="60%"
                    outerRadius="90%"
                    barSize={10}
                    data={[]}
                    startAngle={180}
                    endAngle={0}
                  >
                    <RadialBar dataKey="value" cornerRadius={10} />
                    <text
                      x="50%"
                      y="55%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-xl font-bold"
                      fill="white"
                    ></text>
                  </RadialBarChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card
                className="bg-slate-800 border-slate-700 text-white shadow-lg rounded-lg h-full text-center"
                title="OEE"
                headStyle={{
                  color: "white",
                  borderBottom: "1px solid #475569",
                }}
              >
                <ResponsiveContainer width="100%" height={100}>
                  <RadialBarChart
                    cx="50%"
                    cy="50%"
                    innerRadius="60%"
                    outerRadius="90%"
                    barSize={10}
                    data={[]}
                    startAngle={180}
                    endAngle={0}
                  >
                    <RadialBar dataKey="value" cornerRadius={10} />
                    <text
                      x="50%"
                      y="55%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-xl font-bold"
                      fill="white"
                    ></text>
                  </RadialBarChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>

          {/* Downtime Analysis Row */}
          <Row gutter={[16, 16]}>
            <Col xs={24} md={24} lg={9}>
              <Card
                title="Downtime duration by Reason type"
                className="bg-slate-800 border-slate-700 text-white h-full shadow-lg rounded-lg"
                headStyle={{
                  color: "white",
                  borderBottom: "1px solid #475569",
                }}
              >
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} (${(percent * 100).toFixed(2)}%)`
                      }
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#334155",
                        border: "none",
                        borderRadius: "4px",
                      }}
                      itemStyle={{ color: "white" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            <Col xs={24} lg={15}>
              <Card
                className="bg-slate-800 border-slate-700 text-white shadow-lg rounded-lg h-full"
                title="Downtime Breakdown Metrics"
                headStyle={{
                  color: "white",
                  borderBottom: "1px solid #475569",
                }}
              >
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={20}>
                    <div className="h-full flex flex-col">
                      <h3 className="text-md font-semibold text-white mb-2 text-center md:text-left">
                        Breakdown by Reason (%):
                      </h3>
                      <ResponsiveContainer width="100%" height={180}>
                        <BarChart
                          data={mockBarDataIdle}
                          margin={{ top: 5, right: 20, left: 30, bottom: 5 }}
                        >
                          <XAxis
                            dataKey="name"
                            stroke="#94a3b8"
                            tick={{ fontSize: 10 }}
                          />
                          <YAxis
                            label={{
                              value: "Duration Minutes",
                              angle: -90,
                              position: "insideLeft",
                              fill: "#94a3b8",
                              dx: -20,
                            }}
                            stroke="#94a3b8"
                          />
                          <Tooltip
                            cursor={{ fill: "rgba(200,200,200,0.1)" }}
                            contentStyle={{
                              backgroundColor: "#334155",
                              border: "none",
                              borderRadius: "4px",
                            }}
                            itemStyle={{ color: "white" }}
                            labelStyle={{ color: "#cbd5e1" }}
                          />
                          <Bar dataKey="DurationMinutes" fill="#82ca9d" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>

                    {/* Job Information and Machine Process Parameters Row */}
                    <Row gutter={[16, 16]}>
                        <Col xs={24} lg={12}>
                            <Card
                                className="bg-slate-800 border-slate-700 text-white shadow-lg rounded-lg h-full"
                                title="Job Information"
                                headStyle={{
                                    color: "white",
                                    borderBottom: "1px solid #475569",
                                }}
                            >
                                <Row gutter={[16, 16]}>
                                    <Col xs={24} md={12}>
                                        <h3 className="text-md font-semibold text-white mb-2">
                                            Production Metrics:
                                        </h3>
                                        <ul className="space-y-1 text-sm text-slate-300">
                                            {[
                                                { label: 'Jobs Produced', value: metrics.jobProduced || 0 },
                                                { label: 'Target Count', value: machines[0]?.targetCount || 0 },
                                                { label: 'Arc On Time', value: metrics.arcingTime || 0 },
                                                { label: 'Wire Consumed', value: metrics.wireConsumed || 0 },
                                                { label: 'Gas Consumed', value: metrics.gasConsumed ? `${metrics.gasConsumed} L` : '0 L' },
                                                { label: 'Defect Quantity', value: machines[0]?.defectQty || 0 },
                                                { label: 'No. of Machines', value: location.state?.numberOfMachines || 0 }
                                            ].map(({ label, value }) => (
                                                <li key={label} className="flex justify-between items-center">
                                                    <span>{label}:</span>
                                                    <span className="font-semibold text-white">
                                                        {value}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </Col>
                                    <Col xs={24} md={12}>
                                        <h3 className="text-md font-semibold text-white mb-2">
                                            Job Details:
                                        </h3>
                                        <ul className="space-y-1 text-sm text-slate-300">
                                            {[
                                                {
                                                    label: 'Running Job Model',
                                                    value: machines[0]?.job_name,
                                                    fallback: 'No Job Running'
                                                },
                                                {
                                                    label: 'Current Job Serial',
                                                    value: machines[0]?.job_serial,
                                                    fallback: 'No Serial Available'
                                                },
                                                {
                                                    label: 'Previous Job Serial',
                                                    value: previousJobSerial[0]?.job_serial,
                                                    fallback: 'No Previous Serial'
                                                },
                                                {
                                                    label: 'Previous Job Model',
                                                    value: previousJobSerial[0]?.job_name,
                                                    fallback: 'No Previous Job'
                                                },
                                                {
                                                    label: 'Idle Time',
                                                    value: machines[0]?.idle_time,
                                                    fallback: 'Not Available'
                                                }
                                            ].map(({ label, value, fallback }) => (
                                                <li key={label} className="flex justify-between items-center">
                                                    <span>{label}:</span>
                                                    <span className="font-semibold text-white">
                                                        {value || fallback}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </Col>
                                </Row>
                            </Card>
                        </Col>
                        <Col xs={24} lg={12}>
                            <Card
                                className="bg-slate-800 border-slate-700 text-white shadow-lg rounded-lg h-full"
                                title="Machine Process Parameters"
                                headStyle={{
                                    color: "white",
                                    borderBottom: "1px solid #475569",
                                }}
                            >
                                <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                                    {machines.map((machine) => {
                                        const operator = getOperatorForMachine(machine.hardware_code);
                                        const thresholds = getThresholdValues(machine.hardware_code);
                                        return (
                                            <div key={machine.hardware_code} className="border-b border-slate-700 pb-3 last:border-b-0">
                                                <div className="flex justify-between text-sm text-slate-300 mb-1">
                                                    <span>{machine.machine_name || "Unnamed Machine"}</span>
                                                    <div className="flex items-center gap-2">
                                                        {operator && (
                                                            <span className="px-2 py-1 rounded text-xs text-slate-400 bg-yellow-500/20">
                                                                Operator: {operator.user_first_name || 'Not Assigned'} {operator.user_last_name || ''}
                                                            </span>
                                                        )}
                                                        <span className={`px-2 py-1 rounded text-xs font-medium ${liveMachineData[machine.hardware_code]?.status === "running"
                                                            ? "bg-green-500/20 text-green-400 uppercase"
                                                            : liveMachineData[machine.hardware_code]?.status === "stop"
                                                                ? "bg-red-500/20 text-red-400 uppercase"
                                                                : "bg-yellow-500/20 text-yellow-400 uppercase"
                                                            }`}>
                                                            {liveMachineData[machine.hardware_code]?.status || "NO STATUS"}
                                                        </span>
                                                    </div>
                                                </div>
                                                {/* Voltage */}
                                                {thresholds?.voltage && liveMachineData[machine.hardware_code]?.voltage !== undefined ? (
                                                    <div className="border-b border-slate-700 last:border-b-0 mt-2">
                                                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                                                            <span>Voltage: {liveMachineData[machine.hardware_code].voltage  <= 5 ? 0 : liveMachineData[machine.hardware_code].voltage} V</span>
                                                        </div>
                                                        <Progress
                                                            percent={Math.min(
                                                                100,
                                                                Math.max(
                                                                    0,
                                                                    ((liveMachineData[machine.hardware_code].voltage -
                                                                        thresholds.voltage.low) /
                                                                        (thresholds.voltage.high -
                                                                            thresholds.voltage.low)) *
                                                                    100
                                                                )
                                                            )}
                                                            showInfo={false}
                                                            strokeColor={
                                                                liveMachineData[machine.hardware_code].voltage > thresholds.voltage.high ||
                                                                liveMachineData[machine.hardware_code].voltage < thresholds.voltage.low
                                                                    ? "#ef4444"
                                                                    : "#82ca9d"
                                                            }
                                                            size="small"
                                                        />
                                                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                                                            <span>Low: {thresholds.voltage.low}V</span>
                                                            <span>High: {thresholds.voltage.high}V</span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="h-2 bg-slate-700 rounded w-full"></div>
                                                )}
                                                {/* Current */}
                                                {thresholds?.current && liveMachineData[machine.hardware_code]?.current !== undefined ? (
                                                    <div className="border-b border-slate-700 last:border-b-0 mt-2">
                                                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                                                            <span>Current: {liveMachineData[machine.hardware_code].current <= 20 ? 0 : liveMachineData[machine.hardware_code].current} A</span>
                                                        </div>
                                                        <Progress
                                                            percent={Math.min(
                                                                100,
                                                                Math.max(
                                                                    0,
                                                                    ((liveMachineData[machine.hardware_code].current -
                                                                        thresholds.current.low) /
                                                                        (thresholds.current.high -
                                                                            thresholds.current.low)) *
                                                                    100
                                                                )
                                                            )}
                                                            showInfo={false}
                                                            strokeColor={
                                                                liveMachineData[machine.hardware_code].current > thresholds.current.high ||
                                                                liveMachineData[machine.hardware_code].current < thresholds.current.low
                                                                    ? "#ef4444"
                                                                    : "#8884d8"
                                                            }
                                                            size="small"
                                                        />
                                                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                                                            <span>Low: {thresholds.current.low}A</span>
                                                            <span>High: {thresholds.current.high}A</span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="h-2 bg-slate-700 rounded w-full"></div>
                                                )}
                                                {/* Gas Flow */}
                                                {thresholds?.gas && liveMachineData[machine.hardware_code]?.gasFr !== undefined ? (
                                                    <div className="border-b border-slate-700 last:border-b-0 mt-2">
                                                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                                                            <span>Gas Flow: {liveMachineData[machine.hardware_code].gasFr <= 5 ? 0 : liveMachineData[machine.hardware_code].gasFr} L/min</span>
                                                        </div>
                                                        <Progress
                                                            percent={Math.min(
                                                                100,
                                                                Math.max(
                                                                    0,
                                                                    ((liveMachineData[machine.hardware_code].gasFr -
                                                                        thresholds.gas.low) /
                                                                        (thresholds.gas.high -
                                                                            thresholds.gas.low)) *
                                                                    100
                                                                )
                                                            )}
                                                            showInfo={false}
                                                            strokeColor={
                                                                liveMachineData[machine.hardware_code].gasFr > thresholds.gas.high ||
                                                                liveMachineData[machine.hardware_code].gasFr < thresholds.gas.low
                                                                    ? "#ef4444"
                                                                    : "#03C9D7"
                                                            }
                                                            size="small"
                                                        />
                                                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                                                            <span>Low: {thresholds.gas.low}L/min</span>
                                                            <span>High: {thresholds.gas.high}L/min</span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="h-2 bg-slate-700 rounded w-full"></div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </Card>
                        </Col>
                    </Row>
                </div>
            )}
        </div>
    );
};

export default MachineTypeDrillDown;
