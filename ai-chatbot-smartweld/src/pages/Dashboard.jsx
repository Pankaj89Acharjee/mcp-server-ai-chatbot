import React from "react";
import DashboardSupervisor from "./DashboardSupervisor";
import useAuth from "../customHooks/useAuth";
import DashboardOperator from "./DashboardOperator";
import NewDashboardOperator from "./NewDashboardOperator";

const Dashboard = () => {
  const { auth } = useAuth();

  console.log("auth: ", auth);

  return (
    <>
      {/* Dashboard For Supervisor */}

      {auth.role === "SUPERVISOR" && <DashboardSupervisor />}

      {/* Dashboard For Operator */}
      {/* {auth.role === "OPERATOR" && <DashboardOperator />} */}
      {auth.role === "OPERATOR" && <NewDashboardOperator />}

      {/* Dashboard For Admin */}
    </>
  );
};

export default Dashboard;
