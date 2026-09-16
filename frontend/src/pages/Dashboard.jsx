import MainLayout from "../layouts/MainLayout";
import DashboardCards from "../components/dashboard/DashboardCards";
import Charts from "../components/dashboard/Charts";
import RecentPatients from "../components/dashboard/RecentPatients";

function Dashboard() {
  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const userName = user.name || "Test User";
  const role = user.role?.toLowerCase();

  return (
    <MainLayout>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">
          Good Morning, {userName} 👋
        </h1>

        <p className="text-gray-500 mt-2">
          {role === "researcher"
            ? "Here's your research and analytics overview."
            : "Here's what's happening with your patients today."}
        </p>
      </div>

      {role !== "researcher" && (
        <DashboardCards />
      )}

      <Charts />

      {role !== "researcher" && (
        <RecentPatients />
      )}

      {role === "researcher" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-6">

          <h2 className="text-xl font-semibold text-slate-800">
            Research Access
          </h2>

          <p className="text-sm text-gray-500 mt-2">
            Your account has access to aggregated and
            privacy-safe healthcare information.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">

            <div className="bg-blue-50 rounded-lg p-4">
              <p className="font-medium text-blue-700">
                Aggregated Data
              </p>

              <p className="text-sm text-gray-500 mt-1">
                Population-level healthcare statistics.
              </p>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <p className="font-medium text-green-700">
                Privacy Protected
              </p>

              <p className="text-sm text-gray-500 mt-1">
                Patient identities are not exposed.
              </p>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <p className="font-medium text-purple-700">
                Research Analytics
              </p>

              <p className="text-sm text-gray-500 mt-1">
                Use research insights for analysis.
              </p>
            </div>

          </div>

        </div>
      )}

    </MainLayout>
  );
}

export default Dashboard; 