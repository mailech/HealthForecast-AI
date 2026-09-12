import { useEffect, useState } from "react";
import {
  FaUsers,
  FaDatabase,
  FaRobot,
  FaClipboardList,
  FaShieldAlt,
} from "react-icons/fa";
import api from "../services/api";
import DashboardLayout from "../layouts/DashboardLayout";

function SystemAdminDashboard() {
  const [users, setUsers] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const [model, setModel] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [
          usersResponse,
          datasetsResponse,
          modelResponse,
          logsResponse,
        ] = await Promise.all([
          api.get("/api/admin/users"),
          api.get("/api/admin/datasets"),
          api.get("/api/admin/model"),
          api.get("/api/admin/audit-logs"),
        ]);

        setUsers(usersResponse.data);
        setDatasets(datasetsResponse.data);
        setModel(modelResponse.data);
        setAuditLogs(logsResponse.data);
      } catch (err) {
        console.error(err);

        setError(
          err.response?.data?.detail ||
          "Unable to load system administration data."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  return (
    <DashboardLayout>
      <div className="p-6">

        <div className="mb-8">
          <div className="flex items-center gap-3">
            <FaShieldAlt className="text-slate-700 text-3xl" />

            <h1 className="text-3xl font-bold text-slate-800">
              System Administration
            </h1>
          </div>

          <p className="text-gray-500 mt-2">
            Platform administration, security, users, datasets and AI model governance.
          </p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-gray-500">
            Loading system information...
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

              <div className="bg-white rounded-xl shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500">
                      Platform Users
                    </p>

                    <h2 className="text-3xl font-bold text-slate-800 mt-2">
                      {users.length}
                    </h2>
                  </div>

                  <FaUsers className="text-blue-500 text-3xl" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500">
                      Datasets
                    </p>

                    <h2 className="text-3xl font-bold text-slate-800 mt-2">
                      {datasets.length}
                    </h2>
                  </div>

                  <FaDatabase className="text-green-500 text-3xl" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500">
                      AI Model
                    </p>

                    <h2 className="text-xl font-bold text-slate-800 mt-3">
                      {model?.model_loaded
                        ? "Loaded"
                        : "Unavailable"}
                    </h2>
                  </div>

                  <FaRobot className="text-purple-500 text-3xl" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500">
                      Audit Events
                    </p>

                    <h2 className="text-3xl font-bold text-slate-800 mt-2">
                      {auditLogs.length}
                    </h2>
                  </div>

                  <FaClipboardList className="text-orange-500 text-3xl" />
                </div>
              </div>

            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">

              <div className="bg-white rounded-xl shadow p-6">

                <h2 className="text-xl font-semibold text-slate-800 mb-5">
                  User Roles
                </h2>

                {[
                  "Doctor",
                  "Hospital Administrator",
                  "Healthcare Researcher",
                  "System Administrator",
                ].map((role) => {

                  const count = users.filter(
                    (user) => user.role === role
                  ).length;

                  return (
                    <div
                      key={role}
                      className="flex justify-between py-3 border-b"
                    >
                      <span>{role}</span>
                      <strong>{count}</strong>
                    </div>
                  );
                })}

              </div>

              <div className="bg-white rounded-xl shadow p-6">

                <h2 className="text-xl font-semibold text-slate-800 mb-5">
                  AI Model Information
                </h2>

                <div className="space-y-3 text-gray-600">

                  <p>
                    <strong>Status:</strong>{" "}
                    {model?.model_loaded
                      ? "Loaded"
                      : "Unavailable"}
                  </p>

                  <p>
                    <strong>Threshold:</strong>{" "}
                    {model?.threshold ?? "N/A"}
                  </p>

                  <p>
                    <strong>Features:</strong>{" "}
                    {model?.features?.length ?? 0}
                  </p>

                </div>

              </div>

            </div>

            <div className="bg-white rounded-xl shadow p-6 mt-8">

              <h2 className="text-xl font-semibold text-slate-800 mb-5">
                Recent Platform Activity
              </h2>

              {auditLogs.length === 0 ? (
                <p className="text-gray-500">
                  No audit activity available.
                </p>
              ) : (
                auditLogs.slice(0, 8).map((log, index) => (
                  <div
                    key={log._id || index}
                    className="flex justify-between gap-4 py-3 border-b"
                  >
                    <div>
                      <p className="font-medium text-slate-700">
                        {log.action}
                      </p>

                      <p className="text-sm text-gray-500">
                        {log.user_name || "System"}
                      </p>
                    </div>

                    <span className="text-sm text-gray-400">
                      {log.role}
                    </span>
                  </div>
                ))
              )}

            </div>

          </>
        )}

      </div>
    </DashboardLayout>
  );
}

export default SystemAdminDashboard;