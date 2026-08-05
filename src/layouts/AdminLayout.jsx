import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import "../styles/sidebar.css";
import "../styles/navbar.css";
import "../styles/admin-layout.css";

function AdminLayout({ children }) {

    return (

        <div className="admin-layout">

            <Sidebar role="admin" />

            <div className="main-content">

                <Navbar />

                <div className="page-content">

                    {children}

                </div>

            </div>

        </div>

    );

}

export default AdminLayout;