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

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await api.get("/patients");

        const patients = response.data;

        const monthCounts = {};

        patients.forEach((patient) => {
          if (!patient.admission_date) return;

          const date = new Date(patient.admission_date);

          const month = date.toLocaleString("en-US", {
            month: "short",
          });

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

        const chartData = months.map((month) => ({
          month,
          patients: monthCounts[month] || 0,
        }));

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

    fetchPatients();
  }, []);

  return (
    <div className="bg-white rounded-xl shadow p-6 mt-6">

      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-800">
          Patient Admissions
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          Monthly patient admission overview
        </p>
      </div>

      {loading ? (
        <div className="h-[300px] flex items-center justify-center text-gray-500">
          Loading chart...
        </div>
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
              tick={{ fill: "#64748b" }}
            />

            <YAxis
              allowDecimals={false}
              tick={{ fill: "#64748b" }}
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