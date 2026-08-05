import DoctorLayout from "../../layouts/DoctorLayout";
import "../../styles/doctor-dashboard.css";

import {
    FaUserInjured,
    FaHeartbeat,
    FaCalendarCheck,
    FaProcedures
} from "react-icons/fa";

function Dashboard() {

    return (

        <DoctorLayout>

            <div className="dashboard">

                <h1>Doctor Dashboard</h1>

                <p>Welcome to HealthForecast AI</p>

                <div className="cards">

                    <div className="card">

                        <FaUserInjured className="card-icon" />

                        <h2>45</h2>

                        <p>My Patients</p>

                    </div>

                    <div className="card">

                        <FaHeartbeat className="card-icon" />

                        <h2>12</h2>

                        <p>High Risk Patients</p>

                    </div>

                    <div className="card">

                        <FaCalendarCheck className="card-icon" />

                        <h2>18</h2>

                        <p>Today's Appointments</p>

                    </div>

                    <div className="card">

                        <FaProcedures className="card-icon" />

                        <h2>8</h2>

                        <p>Patients Admitted</p>

                    </div>

                </div>

                <div className="dashboard-row">

                    <div className="chart-box">

                        <h2>Patient Risk Analytics</h2>

                        <p>Chart will be integrated here.</p>

                    </div>

                    <div className="activity-box">

                        <h2>Recent Activities</h2>

                        <ul>

                            <li>✅ New Patient Assigned</li>

                            <li>✅ Risk Prediction Completed</li>

                            <li>✅ Treatment Updated</li>

                            <li>✅ Appointment Scheduled</li>

                        </ul>

                    </div>

                </div>

            </div>

        </DoctorLayout>

    );

}

export default Dashboard;