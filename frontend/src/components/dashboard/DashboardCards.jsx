import { useEffect, useState } from "react";
import StatCard from "./StatCard";

import {
  Users,
  Activity,
  HeartPulse,
  AlertTriangle,
} from "lucide-react";

import api from "../../api/api";


function DashboardCards() {

  const [stats, setStats] = useState({
    patients: 0,
    doctors: 0,
    high_risk: 0,
    users: 0,
  });

  const [loading, setLoading] = useState(true);


  const fetchStats = async () => {

    try {

      const response =
        await api.get("/dashboard/stats");

      setStats(response.data);

    } catch (error) {

      console.error(
        "Failed to fetch dashboard stats:",
        error
      );

    } finally {

      setLoading(false);

    }
  };


  useEffect(() => {
    fetchStats();
  }, []);


  return (

    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

      <StatCard
        title="Total Patients"
        value={
          loading
            ? "..."
            : stats.patients
        }
        color="bg-blue-100"
        icon={
          <Users className="text-blue-600" />
        }
      />


      <StatCard
        title="High Risk"
        value={
          loading
            ? "..."
            : stats.high_risk
        }
        color="bg-red-100"
        icon={
          <AlertTriangle className="text-red-600" />
        }
      />


      <StatCard
        title="Doctors"
        value={
          loading
            ? "..."
            : stats.doctors
        }
        color="bg-green-100"
        icon={
          <HeartPulse className="text-green-600" />
        }
      />


      <StatCard
        title="Total Users"
        value={
          loading
            ? "..."
            : stats.users
        }
        color="bg-yellow-100"
        icon={
          <Activity className="text-yellow-600" />
        }
      />

    </div>

  );
}

export default DashboardCards; 