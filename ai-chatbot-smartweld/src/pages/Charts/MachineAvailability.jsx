import React, { useState, useEffect } from 'react';
import { Table, Select, Card, Row, Col } from 'antd'; // Import Ant Design components
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, ComposedChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'; // Import Recharts components
import { SlidersHorizontal, MapPin, Building, Waypoints, User, Clock, HardHat, BotMessageSquare, ListTree, UserCog } from 'lucide-react'; // Import icons
import SummaryCard from '../../components/SummaryCard';
import FilterPanel from '../../components/FilterPanel';


// --- Mock Data ---

// Availability View Data (Previous)
const mockAvailabilitySummaryData = {
  machines: 14,
  availability: 72.46,
  stopDuration: 3412.48,
  arcOnHour: 83.12,
};
const mockPieData = [
  { name: 'No Material', value: 44.44, fill: '#8884d8' },
  { name: 'Process Trouble L...', value: 55.56, fill: '#82ca9d' },
];
const mockBarDataIdle = [ // Renamed to avoid conflict
  { name: '(Blank)', DurationMinutes: 2100 },
  { name: 'No Material', DurationMinutes: 125 },
  { name: 'Process Trouble Lana', DurationMinutes: 87 },
];
const mockTableData = [
  { key: '1', date: '11 Dec 2024', stationName: 'Bearing bush', startsFrom: '2024-12-11 07:05:29', stopDurationMin: 104.15, downtimeReason: 'No Material' },
  { key: '2', date: '11 Dec 2024', stationName: 'Cover welding', startsFrom: '2024-12-11 07:31:36', stopDurationMin: 10.63, downtimeReason: 'Process Trouble L...' },
  { key: '3', date: '11 Dec 2024', stationName: 'Top & Bottom welding', startsFrom: '2024-12-11 07:45:54', stopDurationMin: 42.32, downtimeReason: 'No Material' },
  { key: '4', date: '11 Dec 2024', stationName: 'Cover Welding 2', startsFrom: '2024-12-11 07:50:27', stopDurationMin: 47.20, downtimeReason: 'Process Trouble L...' },
];
const availabilityTableColumns = [
  { title: 'Date', dataIndex: 'date', key: 'date' },
  { title: 'Station Name', dataIndex: 'stationName', key: 'stationName' },
  { title: 'Starts from', dataIndex: 'startsFrom', key: 'startsFrom' },
  { title: 'stop duration (min)', dataIndex: 'stopDurationMin', key: 'stopDurationMin', align: 'right' },
  { title: 'Downtime Reason', dataIndex: 'downtimeReason', key: 'downtimeReason' },
];

// Production View Data (New)
const mockProductionSummaryData = {
  machines: 14,
  oee: 25.55,
  arcOnHour: 83.12,
  performance: 35.26,
  targetArcOnTime: 596.31,
  operatorName: 'SUDHIR...', // Placeholder
  avgSetJobDuration: 247,
  avgJobDurationAchieved: 241,
};
const mockArcOnTargetData = [
  { name: 'A', actual: 28, target: 30 }, // Example data
  { name: 'B', actual: 25, target: 30 },
  { name: 'C', actual: 29, target: 30 },
];
const mockAvgArcOnTimeData = [
  { jobSerial: '2024121...', arcOnTime: 200, targetArcOnTime: 250 },
  { jobSerial: '2024121...', arcOnTime: 220, targetArcOnTime: 250 },
  { jobSerial: '2024121...', arcOnTime: 180, targetArcOnTime: 250 },
  { jobSerial: '2024121...', arcOnTime: 350, targetArcOnTime: 250 },
  { jobSerial: '2024121...', arcOnTime: 240, targetArcOnTime: 250 },
  { jobSerial: '2024121...', arcOnTime: 260, targetArcOnTime: 250 },
  { jobSerial: '2024121...', arcOnTime: 190, targetArcOnTime: 250 },
  { jobSerial: '2024121...', arcOnTime: 300, targetArcOnTime: 250 },
  // Add more data points
];
const mockArcOnHourlyData = [
  { hour: '0', arcOnMin: 100, otherMetric: 50 }, // Example for clustered
  { hour: '1', arcOnMin: 120, otherMetric: 60 },
  { hour: '5', arcOnMin: 212, otherMetric: 100 },
  { hour: '6', arcOnMin: 200, otherMetric: 90 },
  { hour: '7', arcOnMin: 224, otherMetric: 110 },
  { hour: '8', arcOnMin: 190, otherMetric: 85 },
  { hour: '9', arcOnMin: 205, otherMetric: 95 },
  { hour: '10', arcOnMin: 215, otherMetric: 100 },
  { hour: '11', arcOnMin: 235, otherMetric: 115 },
  { hour: '12', arcOnMin: 112, otherMetric: 55 },
  { hour: '13', arcOnMin: 95, otherMetric: 45 },
  { hour: '14', arcOnMin: 197, otherMetric: 90 },
  { hour: '15', arcOnMin: 257, otherMetric: 120 },
  { hour: '16', arcOnMin: 285, otherMetric: 130 },
  { hour: '17', arcOnMin: 197, otherMetric: 95 },
  { hour: '18', arcOnMin: 171, otherMetric: 80 },
  { hour: '19', arcOnMin: 147, otherMetric: 70 },
  // Add more hours
];



// --- Main App Component ---
function App() {
  // --- State ---
  const [activeMainTab, setActiveMainTab] = useState("AVAILABILITY"); // Default tab
  const [activeSubTab, setActiveSubTab] = useState("Arc On"); // Default sub-tab for Production
  const [lastRefreshed, setLastRefreshed] = useState("06-01-2025 16:04:15"); // Example timestamp
  const [filters, setFilters] = useState({ // State to hold current filter values
    location: 'Jamshedpur',
    site: 'All',
    line: 'All',
    station: 'All',
    shift: 'All',
    operatorName: 'All',
    machine: 'All',
    jobName: 'All',
    jobSerial: 'All',
    operator: 'All',
  });

  // Data states (could be fetched based on filters/tabs)
  const [availabilitySummary, setAvailabilitySummary] = useState(mockAvailabilitySummaryData);
  const [pieData, setPieData] = useState(mockPieData);
  const [barDataIdle, setBarDataIdle] = useState(mockBarDataIdle);
  const [tableData, setTableData] = useState(mockTableData);
  const [productionSummary, setProductionSummary] = useState(mockProductionSummaryData);
  const [arcOnTargetData, setArcOnTargetData] = useState(mockArcOnTargetData);
  const [avgArcOnTimeData, setAvgArcOnTimeData] = useState(mockAvgArcOnTimeData);
  const [arcOnHourlyData, setArcOnHourlyData] = useState(mockArcOnHourlyData);


  // --- API Fetching Simulation ---
  useEffect(() => {
    // TODO: Fetch data based on activeMainTab, activeSubTab, and filters
    // Example: if (activeMainTab === 'AVAILABILITY') { fetchAvailabilityData(filters); }
    // Example: if (activeMainTab === 'PRODUCTION' && activeSubTab === 'Arc On') { fetchProductionArcOnData(filters); }

    // Using mock data for now:
    setAvailabilitySummary(mockAvailabilitySummaryData);
    setPieData(mockPieData);
    setBarDataIdle(mockBarDataIdle);
    setTableData(mockTableData);
    setProductionSummary(mockProductionSummaryData);
    setArcOnTargetData(mockArcOnTargetData);
    setAvgArcOnTimeData(mockAvgArcOnTimeData);
    setArcOnHourlyData(mockArcOnHourlyData);

    // Set timestamp
    const now = new Date();
    setLastRefreshed(now.toLocaleString('en-GB').replace(/,/g, '')); // Format DD-MM-YYYY HH:MM:SS

  }, [activeMainTab, activeSubTab, filters]); // Re-fetch when tabs or filters change

  // --- Event Handlers ---
  const handleMainTabClick = (tabName) => {
    setActiveMainTab(tabName);
    // Reset sub-tab if switching away from Production, or set default if switching to it
    if (tabName === "PRODUCTION") {
      setActiveSubTab("Arc On"); // Default to Arc On
    }
  };

  const handleSubTabClick = (subTabName) => {
    setActiveSubTab(subTabName);
  };

  const handleFilterChange = (filterId, value) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [filterId]: value,
    }));
    // Data fetching will be triggered by the useEffect hook
  };

  // --- Navigation Items ---
  const mainNavItems = ["SUMMARY", "AVAILABILITY", "PRODUCTION", "CONSUMPTION", "DEVIATION", "COST", "DOWNLOAD", "COMPARISON"];
  const productionSubNavItems = ["Arc On", "Job Count", "Job Serial"];

  // --- Filter Definitions ---
  const filterDefinitions = [
    { id: 'location', label: "Location", options: [{ value: 'All', label: 'All' }, { value: 'Jamshedpur', label: 'Jamshedpur' }], icon: MapPin, defaultValue: filters.location },
    { id: 'site', label: "Site", options: [{ value: 'All', label: 'All' }, { value: 'AB', label: 'AB' }], icon: Building, defaultValue: filters.site },
    { id: 'line', label: "Line", options: [{ value: 'All', label: 'All' }, { value: 'AN', label: 'AN' }], icon: Waypoints, defaultValue: filters.line },
    { id: 'shift', label: "Shift", options: [{ value: 'All', label: 'All' }, { value: 'A', label: 'A' }], icon: Clock, defaultValue: filters.shift },
    { id: 'station', label: "Station", options: [{ value: 'All', label: 'All' }, { value: 'AB', label: 'AB' }], icon: User, defaultValue: filters.station }, // Changed icon to User based on previous code
    // Add new filters only if Production tab is active? Or show all? Showing all for now.
    { id: 'machine', label: "Machine", options: [{ value: 'All', label: 'All' }, { value: 'M1', label: 'Machine 1' }], icon: BotMessageSquare, defaultValue: filters.machine }, // Example options
    { id: 'jobName', label: "Job Name", options: [{ value: 'All', label: 'All' }, { value: 'JobX', label: 'Job X' }], icon: HardHat, defaultValue: filters.jobName }, // Example options
    { id: 'jobSerial', label: "Job Serial", options: [{ value: 'All', label: 'All' }, { value: 'S123', label: 'Serial 123' }], icon: ListTree, defaultValue: filters.jobSerial }, // Example options
    { id: 'operator', label: "Operator", options: [{ value: 'All', label: 'All' }, { value: 'Op1', label: 'Operator 1' }], icon: UserCog, defaultValue: filters.operator }, // Example options - Operator Name filter seems separate in image? Added this based on dropdown list.
  ];


  // --- Render Logic ---
  const renderAvailabilityView = () => (
    <>
      {/* Summary Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}><SummaryCard title="Machine" value={availabilitySummary.machines} /></Col>
        <Col xs={24} sm={12} lg={6}><SummaryCard title="Availability" value={availabilitySummary.availability} unit="%" /></Col>
        <Col xs={24} sm={12} lg={6}><SummaryCard title="stop duration" value={availabilitySummary.stopDuration.toLocaleString()} unit="min" /></Col>
        <Col xs={24} sm={12} lg={6}><SummaryCard title="Arc On" value={availabilitySummary.arcOnHour} unit="Hour" /></Col>
      </Row>

      {/* Charts Row */}
      <Row gutter={[16, 16]} className='mb-6'>
        {/* Pie Chart Card */}
        <Col xs={24} md={8}>
          <Card title="Downtime duration by Reason type" className="bg-slate-800 border-slate-700 text-white h-full shadow-lg rounded-lg" headStyle={{ color: 'white', borderBottom: '1px solid #475569' }}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(2)}%)`}>
                  {pieData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.fill} />))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#334155', border: 'none', borderRadius: '4px' }} itemStyle={{ color: 'white' }} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        {/* Bar Chart Card */}
        <Col xs={24} md={16}>
          <Card title="Machine idle reason breakdown" className="bg-slate-800 border-slate-700 text-white h-full shadow-lg rounded-lg" headStyle={{ color: 'white', borderBottom: '1px solid #475569' }}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barDataIdle} margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                <YAxis label={{ value: 'Duration Minutes', angle: -90, position: 'insideLeft', fill: '#94a3b8', dx: -20 }} stroke="#94a3b8" />
                <Tooltip cursor={{ fill: 'rgba(200,200,200,0.1)' }} contentStyle={{ backgroundColor: '#334155', border: 'none', borderRadius: '4px' }} itemStyle={{ color: 'white' }} labelStyle={{ color: '#cbd5e1' }} />
                <Bar dataKey="DurationMinutes" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Table Card */}
      <Card className="bg-slate-800 border-slate-700 text-white shadow-lg rounded-lg" bodyStyle={{ padding: 0 }}>
        <Table dataSource={tableData} columns={availabilityTableColumns} pagination={false} className="dark-theme-table" size="small" />
        {/* Styles for table are included below in the main return */}
      </Card>
    </>
  );

  const renderProductionArcOnView = () => (
    <>
      {/* Summary Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={8} md={4}><SummaryCard title="Machine" value={productionSummary.machines} cardClassName="bg-slate-700 border-slate-600" /></Col>
        <Col xs={12} sm={8} md={4}><SummaryCard title="OEE" value={productionSummary.oee} unit="%" cardClassName="bg-slate-700 border-slate-600" /></Col>
        <Col xs={12} sm={8} md={4}><SummaryCard title="Arc On" value={productionSummary.arcOnHour} unit="Hour" cardClassName="bg-slate-700 border-slate-600" /></Col>
        <Col xs={12} sm={8} md={4}><SummaryCard title="Performance" value={productionSummary.performance} unit="%" cardClassName="bg-slate-700 border-slate-600" /></Col>
        <Col xs={12} sm={8} md={4}><SummaryCard title="Target Arc on time" value={productionSummary.targetArcOnTime} unit="hrs" cardClassName="bg-slate-700 border-slate-600" /></Col>
        <Col xs={12} sm={8} md={4}><SummaryCard title="Operator Name" value={productionSummary.operatorName} cardClassName="bg-slate-700 border-slate-600" /></Col>
        {/* Second row of summary cards */}
        <Col xs={12} sm={12} md={6}><SummaryCard title="Avg Set Job duration" value={productionSummary.avgSetJobDuration} cardClassName="bg-slate-600 border-slate-500" /></Col> {/* Different background */}
        <Col xs={12} sm={12} md={6}><SummaryCard title="Avg Job duration achieved" value={productionSummary.avgJobDurationAchieved} cardClassName="bg-slate-600 border-slate-500" /></Col> {/* Different background */}
      </Row>

      {/* Charts Row */}
      <Row gutter={[16, 16]}>
        {/* Bottom Left: Avg Arc on time by Job serial (Line + Stacked Column) */}
        <Col xs={24} lg={12}>
          <Card title="Avg Arc on time by Job serial" className="bg-slate-800 border-slate-700 text-white h-full shadow-lg rounded-lg" headStyle={{ color: 'white', borderBottom: '1px solid #475569' }}>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={avgArcOnTimeData} margin={{ top: 5, right: 5, left: 0, bottom: 40 }}> {/* Increased bottom margin for labels */}
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis
                  dataKey="jobSerial"
                  stroke="#94a3b8"
                  tick={{ fontSize: 9 }}
                  angle={-45} // Angle labels to prevent overlap
                  textAnchor="end" // Anchor angled labels correctly
                  interval={0} // Show all labels (might need adjustment for many data points)
                  height={50} // Allocate space for angled labels
                />
                <YAxis yAxisId="left" label={{ value: 'Arc-On Time (Sec)', angle: -90, position: 'insideLeft', fill: '#94a3b8', dx: -10 }} stroke="#94a3b8" />
                {/* Add second Y axis if needed for target time, or use same scale */}
                <Tooltip cursor={{ fill: 'rgba(200,200,200,0.1)' }} contentStyle={{ backgroundColor: '#334155', border: 'none', borderRadius: '4px' }} itemStyle={{ color: 'white' }} labelStyle={{ color: '#cbd5e1' }} />
                <Legend wrapperStyle={{ color: 'white', paddingTop: '10px' }} />
                <Bar yAxisId="left" dataKey="arcOnTime" name="Arc-On Time (Sec)" barSize={20} fill="#8884d8" />
                <Line yAxisId="left" type="monotone" dataKey="targetArcOnTime" name="Target arc-on time" stroke="#ff7300" />
              </ComposedChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Right Side: Two Charts Stacked */}
        <Col xs={24} lg={12} className="space-y-6">
          {/* Top Right: Arc On Target vs Actual (Bar) */}
          <Card title="Arc On Target vs Actual" className="bg-slate-800 border-slate-700 text-white shadow-lg rounded-lg" headStyle={{ color: 'white', borderBottom: '1px solid #475569' }}>
            <ResponsiveContainer width="100%" height={142}> {/* Adjusted height */}
              <BarChart data={arcOnTargetData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                <YAxis stroke="#94a3b8" />
                <Tooltip cursor={{ fill: 'rgba(200,200,200,0.1)' }} contentStyle={{ backgroundColor: '#334155', border: 'none', borderRadius: '4px' }} itemStyle={{ color: 'white' }} labelStyle={{ color: '#cbd5e1' }} />
                {/* <Legend /> */}
                <Bar dataKey="actual" name="Actual" fill="#82ca9d" />
                {/* Add target bar if needed, or represent target differently */}
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Bottom Right: Arc On Hourly (Clustered Column) */}
          <Card title="Arc On Hourly" className="bg-slate-800 border-slate-700 text-white shadow-lg rounded-lg" headStyle={{ color: 'white', borderBottom: '1px solid #475569' }}>
            <ResponsiveContainer width="100%" height={142}> {/* Adjusted height */}
              <BarChart data={arcOnHourlyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis dataKey="hour" label={{ value: 'Hour of day', position: 'insideBottom', dy: 10, fill: '#94a3b8' }} stroke="#94a3b8" tick={{ fontSize: 10 }} />
                <YAxis label={{ value: 'Arc-On Min', angle: -90, position: 'insideLeft', fill: '#94a3b8', dx: -10 }} stroke="#94a3b8" />
                <Tooltip cursor={{ fill: 'rgba(200,200,200,0.1)' }} contentStyle={{ backgroundColor: '#334155', border: 'none', borderRadius: '4px' }} itemStyle={{ color: 'white' }} labelStyle={{ color: '#cbd5e1' }} />
                {/* <Legend /> */}
                <Bar dataKey="arcOnMin" name="Arc-On Min" fill="#8884d8" />
                {/* Add second bar for clustered effect if needed */}
                {/* <Bar dataKey="otherMetric" name="Other Metric" fill="#82ca9d" /> */}
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </>
  );

  const renderProductionJobCountView = () => (
    <div className="text-center p-10 bg-slate-800 rounded-lg">
      <h2 className="text-xl text-slate-400">Job Count View - Content Goes Here</h2>
      {/* Add components for Job Count view */}
    </div>
  );

  const renderProductionJobSerialView = () => (
    <div className="text-center p-10 bg-slate-800 rounded-lg">
      <h2 className="text-xl text-slate-400">Job Serial View - Content Goes Here</h2>
      {/* Add components for Job Serial view */}
    </div>
  );


  return (
    <div className="min-h-screen dark:bg-slate-900 text-white p-4 md:p-8 font-sans">
      {/* Header */}
      <header className="flex flex-wrap justify-between items-center mb-4 gap-y-2">
        <h1 className="text-2xl uppercase bg-slate-100 dark:bg-slate-600 p-1 rounded-lg text-slate-500 dark:text-slate-300 md:text-3xl font-bold">
          {activeMainTab} Dashboard
        </h1>
        <div className="text-sm text-slate-400">
          Last Data Fetched at {lastRefreshed}
        </div>
      </header>

      {/* Main Navigation */}
      <nav className="mb-1">
        <ul className="flex flex-wrap justify-around gap-x-4 gap-y-2 border-b border-slate-700 pb-2">
          {mainNavItems.map(item => (
            <li key={item}>
              <button
                onClick={() => handleMainTabClick(item)}
                className={`py-2 px-3 rounded-md text-sm font-medium transition-colors duration-150 ${item === activeMainTab
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
              >
                {item}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Sub Navigation (Conditional) */}
      {activeMainTab === 'PRODUCTION' && (
        <nav className="my-4"> {/* Added margin top/bottom */}
          <ul className="flex flex-wrap gap-x-3 gap-y-2 justify-start"> {/* Align left */}
            {productionSubNavItems.map(item => (
              <li key={item}>
                <button
                  onClick={() => handleSubTabClick(item)}
                  className={`py-1 px-4 rounded-full text-xs font-semibold transition-colors duration-150 ${item === activeSubTab
                    ? 'bg-teal-500 text-white shadow-md' // Active style from image
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-slate-100' // Inactive style
                    }`}
                >
                  {item}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      )}


      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-4">

        {/* Left Column / Main Area (Conditional Content) */}
        {/* Added h-[calc(100vh-12rem)] and overflow-y-auto */}
        {/* Adjust '12rem' based on header/nav height */}
        <div className="lg:col-span-3 space-y-6 h-[calc(100vh-12rem)] overflow-y-auto pr-2">
          {activeMainTab === 'AVAILABILITY' && renderAvailabilityView()}
          {activeMainTab === 'PRODUCTION' && activeSubTab === 'Arc On' && renderProductionArcOnView()}
          {activeMainTab === 'PRODUCTION' && activeSubTab === 'Job Count' && renderProductionJobCountView()}
          {activeMainTab === 'PRODUCTION' && activeSubTab === 'Job Serial' && renderProductionJobSerialView()}
          {/* Add other main tab views here */}
          {activeMainTab !== 'AVAILABILITY' && activeMainTab !== 'PRODUCTION' && (
            <div className="text-center p-10 bg-slate-800 rounded-lg">
              <h2 className="text-xl text-slate-400">{activeMainTab} View - Content Goes Here</h2>
            </div>
          )}
        </div>

        {/* Right Column (Filters) */}
        {/* Added matching h-[calc(100vh-12rem)] and overflow-y-auto */}
        {/* Adjust '12rem' based on header/nav height */}
        <div className="lg:col-span-1 h-[calc(100vh-12rem)] overflow-y-auto pr-2"> {/* Added padding-right for scrollbar */}
          <FilterPanel filters={filterDefinitions} onFilterChange={handleFilterChange} />
        </div>
      </div>


      {/* Global Styles for Ant Components */}
      <style jsx global>{`
                /* Styles for Ant Table (Dark Theme) */
                .dark-theme-table .ant-table {
                    background: #1e293b; /* slate-800 */
                    color: #cbd5e1; /* slate-300 */
                    border-radius: 0.375rem; /* rounded-lg */
                }
                .dark-theme-table .ant-table-thead > tr > th {
                    background: #334155; /* slate-700 */
                    color: white;
                    border-bottom: 1px solid #475569; /* slate-600 */
                }
                 .dark-theme-table .ant-table-tbody > tr > td {
                    border-bottom: 1px solid #475569; /* slate-600 */
                    color: #cbd5e1; /* slate-300 */
                    padding: 8px 8px; /* Reduced padding */
                }
                .dark-theme-table .ant-table-tbody > tr.ant-table-row:hover > td {
                    background: #334155; /* slate-700 */
                }
                /* Styles for Ant Select (Dark Theme - already included in FilterSelect) */
                /* Styles for Recharts Text */
                .recharts-text, .recharts-label {
                    fill: #94a3b8; /* slate-400 */
                    font-size: 0.75rem; /* text-xs */
                }
                .recharts-legend-item-text {
                     color: #cbd5e1 !important; /* slate-300 */
                }
             `}</style>
    </div>
  );
}

export default App; // Export the main component

// Note: To run this, you need React, ReactDOM, Ant Design (antd), Recharts, and Lucide-React installed.
// npm install antd recharts lucide-react
// Also ensure Tailwind CSS is set up in your project.
// Ant Design's CSS needs to be imported typically in your main index.js or App.js: import 'antd/dist/reset.css';
