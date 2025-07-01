import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { Context } from "../../../App";
import Sidebar from "../Sidebar";
import Loader from "../../ui/Loader";
import "./styles.scss";

const DashboardLayout = () => {
  const { isAuthenticated, isChecked, isManager } = useContext(Context);

  if (!isChecked) {
    return <Loader />;
  }

  if (!isAuthenticated || !isManager) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-main">
        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;