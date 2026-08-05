import AdminLayout from "../../layouts/AdminLayout";
import "../../styles/admin-reports.css";

import {
    FaFilePdf,
    FaFileExcel,
    FaChartBar
} from "react-icons/fa";

function AdminReports() {

    return (

        <AdminLayout>

            <div className="reports-page">

                <h1>Reports & Analytics</h1>

                <p>Generate and download hospital reports.</p>

                <div className="report-cards">

                    <div className="report-card">

                        <FaChartBar className="report-icon"/>

                        <h2>Readmission Report</h2>

                        <button>View Report</button>

                    </div>

                    <div className="report-card">

                        <FaFilePdf className="report-icon"/>

                        <h2>Export PDF</h2>

                        <button>Download</button>

                    </div>

                    <div className="report-card">

                        <FaFileExcel className="report-icon"/>

                        <h2>Export Excel</h2>

                        <button>Download</button>

                    </div>

                </div>

            </div>

        </AdminLayout>

    );

}

export default AdminReports;