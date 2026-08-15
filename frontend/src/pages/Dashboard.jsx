import MainLayout from "../layouts/MainLayout";
import DashboardCards from "../components/dashboard/DashboardCards";
import Charts from "../components/dashboard/Charts";
import RecentPatients from "../components/dashboard/RecentPatients";

function Dashboard() {
  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const userName = user.name || "Test User";

  return (
    <MainLayout>

      {/* PAGE HEADER */}

      <div className="mb-8">

        <h1 className="text-3xl font-bold text-slate-800">
          Good Morning, {userName} 👋
        </h1>

        <p className="text-gray-500 mt-2">
          Here's what's happening with your patients today.
        </p>

      </div>


      {/* STAT CARDS */}

      <DashboardCards />


      {/* CHART */}

      <Charts />


      {/* RECENT PATIENTS */}

      <RecentPatients />

    </MainLayout>
  );
}

export default Dashboard; 