import AdminLayout from "../../layouts/AdminLayout";
import "../../styles/admin-dashboard.css";
import StatCard from "../../components/StatCard";

import {
    FaUserInjured,
    FaUserMd,
    FaHeartbeat,
    FaChartLine
} from "react-icons/fa";

function AdminDashboard() {

    return (

        <AdminLayout>

            <div className="dashboard">

                <h1>
                    Admin Dashboard
                </h1>

                <p>
                    Welcome to HealthForecast AI
                </p>

                {/* Statistics Cards */}

                <div className="cards">

                    <StatCard
                        icon={<FaUserInjured />}
                        value="245"
                        title="Total Patients"
                    />

                    <StatCard
                        icon={<FaUserMd />}
                        value="28"
                        title="Total Doctors"
                    />

                    <StatCard
                        icon={<FaHeartbeat />}
                        value="18"
                        title="High Risk Patients"
                    />

                    <StatCard
                        icon={<FaChartLine />}
                        value="92%"
                        title="Recovery Rate"
                    />

                </div>

                {/* Dashboard Bottom Section */}

                <div className="dashboard-row">

                    <div className="chart-box">

                        <h2>
                            Readmission Analytics
                        </h2>

                        <p>
                            Chart will be integrated here.
                        </p>

                    </div>

                    <div className="activity-box">

                        <h2>
                            Recent Activities
                        </h2>

                        <ul>

                            <li>✅ New Patient Added</li>

                            <li>✅ AI Prediction Generated</li>

                            <li>✅ Doctor Updated</li>

                            <li>✅ Monthly Report Generated</li>

                        </ul>

                    </div>

                </div>

            </div>

        </AdminLayout>

    );

}

export default AdminDashboard;