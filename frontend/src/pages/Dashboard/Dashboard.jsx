import Sidebar from "../../components/Sidebar/Sidebar";
import Navbar from "../../components/Navbar/Navbar";

function Dashboard() {
  return (
    <div className="flex">

      <Sidebar />

      <div className="flex-1 bg-gray-100 min-h-screen">

        <Navbar />

        <div className="p-8">

          <h2 className="text-3xl font-bold">
            Dashboard
          </h2>

          <p className="text-gray-500 mt-3">
            Welcome to HealthForecast AI
          </p>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;