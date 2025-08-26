import "../../App.css";
import React, { useCallback } from "react";
import { Routes, Route } from "react-router-dom";
import { FiSidebar } from "react-icons/fi";
import { TooltipComponent } from "@syncfusion/ej2-react-popups";

// Components
import { Navbar, Sidebar, ThemeSettings } from "../../components";

// Context
import { useStateContext } from "../../contexts/ContextProvider";
import { useAuth } from "../../contexts/AuthProvider";

// Pages
import { Dashboard, JobList, Users } from "../../pages";
import MachineJobMap from "../../pages/MachineJobMap";
import MachineTypes from "../../pages/MachineTypes";
import MachineStatus from "../../pages/MachineStatus";
import Machinespage from "../../pages/Machinespage";
import HardwareMachineMapping from "../../pages/HardwareMachineMapping";
import DowntimeReason from "../../pages/DowntimeReason";
import ShieldingGas from "../../pages/ShieldingGas";
import FillerMaterial from "../../pages/FillerMaterial";
import AuthGurad from "../../authentication/AuthGurad";
import Shift from "../../pages/Shift";
import Location from "../../pages/Location";
import Site from "../../pages/Site";
import Line from "../../pages/Line";
import MachinePowerSpecs from "../../pages/MachinePowerSpecs";
import MachineWiseJobTarget from "../../pages/MachineWiseJobTarget";
import OptimizedRealtime from "../../pages/OptimizedRealtime";
import MachineLive from "../../pages/MachineLive";
import ReportDownload from "../../pages/ReportDownload";
import JobConfig from "../../pages/JobConfig";
import MachineJobSerialMapping from "../../pages/MachineJobSerialMapping";
import MachineAvailability from "../../pages/Charts/MachineAvailability";
import MachineTypeDrilDown from "../../pages/MachineTypeDrilDown";
import AvailabilityDashboard from "../../pages/AvailabilityDashboard";
import ProductivityDashboard from "../../pages/ProductivityDashboard";
import HourlyProductionDashboard from "../../pages/HourlyProductionDashboard";
import QualityDashboard from "../../pages/QualityDashboard";
import MaintainanceDashboard from "../../pages/MaintainanceDashboard";

// Auth guard
import AuthGuard from "../../authentication/AuthGurad";

// Custom hooks
import useIdleTimer from "../../customHooks/useIdleTimers";
import PlannedDowntimeManagement from "../../pages/PlannedDowntimeManagement";
import ChatResponse from "../../pages/ChatResponse";

const DashboardLayout = () => {
  const {
    activeMenu,
    themeSettings,
    setThemeSettings,
    currentColor,
    currentTheme,
  } = useStateContext();

  const { auth, isAuthenticated } = useAuth();

  // Idle timer settings
  const idleTimeout = 900000; // 15 minutes
  const warningDuration = 6000; // 6 seconds

  // Use idle timer hook
  useIdleTimer(idleTimeout, warningDuration, isAuthenticated());

  // Define route configuration for better maintainability
  const routeConfig = [
    // Dashboard routes
    {
      path: "/dashboard",
      roles: [
        "ADMIN",
        "ADMINISTRATOR",
        "SUPERADMIN",
        "SUPERVISOR",
        "OPERATOR",
        "ORGADMIN",
      ],
      component: Dashboard,
    },
    {
      path: "/dashboard/:machineTypeId",
      roles: [
        "ADMIN",
        "ADMINISTRATOR",
        "SUPERADMIN",
        "SUPERVISOR",
        "OPERATOR",
        "ORGADMIN",
      ],
      component: MachineTypeDrilDown,
    },
    {
      path: "/dashboard/availabilities/:id",
      roles: [
        "ADMIN",
        "ADMINISTRATOR",
        "SUPERADMIN",
        "SUPERVISOR",
        "OPERATOR",
        "ORGADMIN",
      ],
      component: AvailabilityDashboard,
    },
    {
      path: "/dashboard/productivities",
      roles: [
        "ADMIN",
        "ADMINISTRATOR",
        "SUPERADMIN",
        "SUPERVISOR",
        "OPERATOR",
        "ORGADMIN",
      ],
      component: ProductivityDashboard,
    },
    {
      path: "/dashboard/hourly-productions",
      roles: [
        "ADMIN",
        "ADMINISTRATOR",
        "SUPERADMIN",
        "SUPERVISOR",
        "OPERATOR",
        "ORGADMIN",
      ],
      component: HourlyProductionDashboard,
    },
    {
      path: "/dashboard/qualities",
      roles: [
        "ADMIN",
        "ADMINISTRATOR",
        "SUPERADMIN",
        "SUPERVISOR",
        "OPERATOR",
        "ORGADMIN",
      ],
      component: QualityDashboard,
    },
    // Job routes
    {
      path: "/jobList",
      roles: [
        "ADMIN",
        "SUPERADMIN",
        "SUPERVISOR",
        "ADMINISTRATOR",
        "OPERATOR",
        "ORGADMIN",
      ],
      component: JobList,
    },
    {
      path: "/machineJobMapping",
      roles: ["ADMIN", "ADMINISTRATOR", "SUPERVISOR", "ORGADMIN"],
      component: MachineJobMap,
    },
    {
      path: "/machineJobTarget",
      roles: ["ADMIN", "ADMINISTRATOR", "SUPERVISOR", "ORGADMIN"],
      component: MachineWiseJobTarget,
    },
    {
      path: "/jobConfig",
      roles: ["ADMIN", "SUPERADMIN", "SUPERVISOR", "OPERATOR", "ORGADMIN"],
      component: JobConfig,
    },
    {
      path: "/jobSerialMap",
      roles: ["OPERATOR"],
      component: MachineJobSerialMapping,
    },
    // Machine routes
    {
      path: "/machineType",
      roles: ["ADMIN", "ADMINISTRATOR", "SUPERVISOR", "ORGADMIN"],
      component: MachineTypes,
    },
    {
      path: "/machineStatus",
      roles: ["ADMIN", "ADMINISTRATOR", "SUPERVISOR", "ORGADMIN"],
      component: MachineStatus,
    },
    {
      path: "/allMachine",
      roles: ["ADMIN", "ADMINISTRATOR", "SUPERVISOR", "ORGADMIN"],
      component: Machinespage,
    },
    {
      path: "/machineHardwareMapping",
      roles: ["ADMIN", "ADMINISTRATOR", "SUPERVISOR", "ORGADMIN"],
      component: HardwareMachineMapping,
    },
    {
      path: "/downtime",
      roles: ["ADMIN", "ADMINISTRATOR", "SUPERVISOR", "ORGADMIN", "OPERATOR"],
      component: DowntimeReason,
    },
    {
      path: "/machineLive",
      roles: ["ADMIN", "ADMINISTRATOR", "SUPERVISOR", "ORGADMIN", "OPERATOR"],
      component: MachineLive,
    },
    {
      path: "/machineAvailability",
      roles: ["ADMIN", "SUPERADMIN", "SUPERVISOR", "OPERATOR", "ORGADMIN"],
      component: MachineAvailability,
    },
    // Consumables routes
    {
      path: "/shieldingGas",
      roles: ["ADMIN", "ADMINISTRATOR", "SUPERVISOR", "ORGADMIN"],
      component: ShieldingGas,
    },
    {
      path: "/fillerMaterial",
      roles: ["ADMIN", "ADMINISTRATOR", "SUPERVISOR", "ORGADMIN"],
      component: FillerMaterial,
    },
    {
      path: "/powerSpecification",
      roles: ["ADMIN", "ADMINISTRATOR", "SUPERVISOR", "ORGADMIN"],
      component: MachinePowerSpecs,
    },
    // Organization routes
    {
      path: "/allUsers",
      roles: ["ADMIN", "ADMINISTRATOR", "SUPERVISOR", "ORGADMIN"],
      component: Users,
    },
    {
      path: "/shifts",
      roles: ["ADMIN", "ADMINISTRATOR", "SUPERVISOR", "ORGADMIN"],
      component: Shift,
    },
    {
      path: "/location",
      roles: ["ADMIN", "ADMINISTRATOR", "SUPERVISOR", "ORGADMIN"],
      component: Location,
    },
    {
      path: "/site",
      roles: ["ADMIN", "ADMINISTRATOR", "SUPERVISOR", "ORGADMIN"],
      component: Site,
    },
    {
      path: "/line",
      roles: ["ADMIN", "ADMINISTRATOR", "SUPERVISOR", "ORGADMIN"],
      component: Line,
    },
    // Analytics routes
    {
      path: "/realTime",
      roles: ["ADMIN", "ADMINISTRATOR", "SUPERVISOR", "ORGADMIN"],
      component: OptimizedRealtime,
    },
    {
      path: "/reportsDownload",
      roles: ["ADMIN", "ADMINISTRATOR", "SUPERVISOR", "ORGADMIN"],
      component: ReportDownload,
    },
    // Maintenance routes
    {
      path: "/maintainance",
      roles: ["ADMIN", "SUPERVISOR"],
      component: MaintainanceDashboard,
    },
    {
      path: "/plannedDowntime",
      roles: ["ADMIN", "SUPERVISOR"],
      component: PlannedDowntimeManagement,
    },
    {
      path: "/aiChat",
      roles: ["ADMIN", "ADMINISTRATOR", "SUPERVISOR", "ORGADMIN"],
      component: ChatResponse,
    },
  ];

  // Memoized rendering of routes to prevent unnecessary re-renders
  const renderRoutes = useCallback(() => {
    return routeConfig.map((route, index) => (
      <Route
        key={`route-${index}`}
        path={route.path}
        element={
          <AuthGuard requiredRoles={route.roles}>
            <route.component />
          </AuthGuard>
        }
      />
    ));
  }, []);

  return (
    <div className={currentTheme === "Dark" ? "dark" : ""}>
      <div className="flex relative dark:bg-main-dark-bg">
        {/* Settings floating button */}
        <div className="fixed right-4 bottom-4" style={{ zIndex: "1000" }}>
          <TooltipComponent content="Settings" position="Top">
            <button
              type="button"
              className="text-3xl p-3 text-white hover:drop-shadow-xl hover:bg-gray-400"
              style={{ background: currentColor, borderRadius: "50%" }}
              onClick={() => setThemeSettings(true)}
            >
              <FiSidebar />
            </button>
          </TooltipComponent>
        </div>

        {/* Sidebar with conditional width */}
        <div
          className={
            activeMenu
              ? "w-72 fixed sidebar dark:bg-secondary-dark-bg bg-white"
              : "w-0 dark:bg-secondary-dark-bg"
          }
        >
          <Sidebar />
        </div>

        {/* Main content area */}
        <div
          className={`dark:bg-main-dark-bg bg-main-bg min-h-screen ${activeMenu ? "w-[calc(100vw-18.375rem)]" : "w-full"
            } ${activeMenu ? "md:ml-72" : "flex-1"}`}
        >
          {/* Navbar */}
          <div className="fixed md:static bg-main-bg dark:bg-main-dark-bg navbar w-full">
            <Navbar />
          </div>

          {/* Theme settings panel */}
          {themeSettings && <ThemeSettings />}

          {/* Routes */}
          <Routes>{renderRoutes()}</Routes>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
