import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <div className="w-64 h-screen bg-cyan-900 text-white">

      <div className="text-2xl font-bold text-center py-8">
        🏥 HealthForecast AI
      </div>

      <nav className="space-y-2 px-5">

        <Link
          to="/dashboard"
          className="block p-3 rounded-lg hover:bg-cyan-700"
        >
          📊 Dashboard
        </Link>

        <Link
          to="/patients"
          className="block p-3 rounded-lg hover:bg-cyan-700"
        >
          👨‍⚕️ Patients
        </Link>

        <Link
          to="/analytics"
          className="block p-3 rounded-lg hover:bg-cyan-700"
        >
          📈 Analytics
        </Link>

        <Link
          to="/reports"
          className="block p-3 rounded-lg hover:bg-cyan-700"
        >
          📄 Reports
        </Link>

      </nav>

    </div>
  );
}

export default Sidebar;