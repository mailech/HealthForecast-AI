import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import api from "../../api/api";

function Charts() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const storedUser = localStorage.getItem("user");

  let user = {};

  try {
    user = storedUser
      ? JSON.parse(storedUser)
      : {};
  } catch {
    user = {};
  }

  const role = user.role?.toLowerCase();

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (role === "researcher") {
          const response = await api.get(
            "/research/summary"
          );

          const summary = response.data;

          setData([
            {
              name: "Patients",
              value: summary.total_patients || 0,
            },
            {
              name: "High Risk",
              value: summary.high_risk_patients || 0,
            },
            {
              name: "Predictions",
              value: summary.total_predictions || 0,
            },
          ]);

          return;
        }

        const response = await api.get(
          "/patients"
        );

        const patients = response.data;

        const monthCounts = {};

        patients.forEach((patient) => {
          if (!patient.admission_date) {
            return;
          }

          const date = new Date(
            patient.admission_date
          );

          const month = date.toLocaleString(
            "en-US",
            {
              month: "short",
            }
          );

          monthCounts[month] =
            (monthCounts[month] || 0) + 1;
        });

        const months = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];

        const chartData = months.map(
          (month) => ({
            month,
            patients:
              monthCounts[month] || 0,
          })
        );

        setData(chartData);

      } catch (error) {
        console.error(
          "Failed to load chart data:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [role]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-6">

      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-800">
          {role === "researcher"
            ? "Research Analytics"
            : "Patient Admissions"}
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          {role === "researcher"
            ? "Privacy-safe aggregated healthcare insights"
            : "Monthly patient admission overview"}
        </p>
      </div>

      {loading ? (
        <div className="h-[300px] flex items-center justify-center text-gray-500">
          Loading analytics...
        </div>
      ) : role === "researcher" ? (
        <ResponsiveContainer
          width="100%"
          height={300}
        >
          <LineChart
            data={data}
            margin={{
              top: 10,
              right: 20,
              left: 0,
              bottom: 5,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e5e7eb"
            />

            <XAxis
              dataKey="name"
              tick={{
                fill: "#64748b",
              }}
            />

            <YAxis
              allowDecimals={false}
              tick={{
                fill: "#64748b",
              }}
            />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="value"
              stroke="#2563eb"
              strokeWidth={3}
              dot={{ r: 5 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <ResponsiveContainer
          width="100%"
          height={300}
        >
          <LineChart
            data={data}
            margin={{
              top: 10,
              right: 20,
              left: 0,
              bottom: 5,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e5e7eb"
            />

            <XAxis
              dataKey="month"
              tick={{
                fill: "#64748b",
              }}
            />

            <YAxis
              allowDecimals={false}
              tick={{
                fill: "#64748b",
              }}
            />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="patients"
              stroke="#2563eb"
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}

    </div>
  );
}

export default Charts; 