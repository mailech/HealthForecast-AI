import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function DoctorLayout({ children }) {

    return (

        <div className="admin-layout">

            <Sidebar role="doctor" />

            <div className="main-content">

                <Navbar />

                <div className="page-content">

                    {children}

                </div>

            </div>

        </div>

    );

}

export default DoctorLayout;