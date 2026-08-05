import DoctorLayout from "../../layouts/DoctorLayout";
import "../../styles/doctor-patients.css";

import { useNavigate } from "react-router-dom";

import {
    FaSearch,
    FaEye
} from "react-icons/fa";

function Patients() {

    const navigate = useNavigate();

    const patients = [

        {
            id: "P001",
            name: "Rahul Kumar",
            disease: "Heart Disease",
            risk: "High"
        },

        {
            id: "P002",
            name: "Priya Sharma",
            disease: "Diabetes",
            risk: "Medium"
        },

        {
            id: "P003",
            name: "Arun Raj",
            disease: "Kidney Failure",
            risk: "High"
        }

    ];

    return (

        <DoctorLayout>

            <div className="patient-page">

                <h1>My Patients</h1>

                <div className="search-box">

                    <FaSearch />

                    <input
                        type="text"
                        placeholder="Search Patient..."
                    />

                </div>

                <table className="patient-table">

                    <thead>

                        <tr>

                            <th>ID</th>

                            <th>Name</th>

                            <th>Disease</th>

                            <th>Risk</th>

                            <th>Action</th>

                        </tr>

                    </thead>

                    <tbody>

                        {patients.map((patient) => (

                            <tr key={patient.id}>

                                <td>{patient.id}</td>

                                <td>{patient.name}</td>

                                <td>{patient.disease}</td>

                                <td>

                                    <span
                                        className={
                                            patient.risk === "High"
                                                ? "high"
                                                : "medium"
                                        }
                                    >
                                        {patient.risk}
                                    </span>

                                </td>

                                <td>

                                    <button
                                        onClick={() =>
                                            navigate("/doctor/patient-details")
                                        }
                                    >

                                        <FaEye />

                                    </button>

                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>

        </DoctorLayout>

    );

}

export default Patients;