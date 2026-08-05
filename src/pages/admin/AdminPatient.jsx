import { useState, useEffect } from "react";

import AdminLayout from "../../layouts/AdminLayout";
import "../../styles/admin-patient.css";

import AddPatientModal from "../../components/AddPatientModal";
import EditPatientModal from "../../components/EditPatientModal";

import {
    FaPlus,
    FaSearch,
    FaEdit,
    FaTrash,
    FaEye
} from "react-icons/fa";

function AdminPatient() {

    const [showModal, setShowModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    const [selectedPatient, setSelectedPatient] = useState(null);

    const [patients, setPatients] = useState([]);

    // Load Patients
    const loadPatients = () => {

        fetch("http://127.0.0.1:5000/api/patients/")
            .then((response) => response.json())
            .then((data) => {

                setPatients(data);

            })
            .catch((error) => {

                console.log(error);

            });

    };

    useEffect(() => {

        loadPatients();

    }, []);

    // Refresh after Add
    const addPatient = () => {

        loadPatients();

        setShowModal(false);

    };

    // Delete Patient
    const handleDelete = async (id) => {

        if (!window.confirm("Delete this patient?")) return;

        try {

            await fetch(

                `http://127.0.0.1:5000/api/patients/${id}`,

                {
                    method: "DELETE"
                }

            );

            loadPatients();

        }

        catch (error) {

            console.log(error);

        }

    };

            return (

        <AdminLayout>

            <div className="patient-page">

                <div className="page-header">

                    <h1>Patient Management</h1>

                    <button
                        className="add-btn"
                        onClick={() => setShowModal(true)}
                    >

                        <FaPlus />

                        Add Patient

                    </button>

                </div>

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
                            <th>Age</th>
                            <th>Gender</th>
                            <th>Disease</th>
                            <th>Risk</th>
                            <th>Actions</th>

                        </tr>

                    </thead>

                    <tbody>

                        {

                            patients.map((patient) => (

                                <tr key={patient.id}>

                                    <td>{patient.id}</td>

                                    <td>{patient.name}</td>

                                    <td>{patient.age}</td>

                                    <td>{patient.gender}</td>

                                    <td>{patient.disease}</td>

                                    <td>

                                        <span
                                            className={
                                                patient.risk === "High"
                                                    ? "high"
                                                    : patient.risk === "Medium"
                                                    ? "medium"
                                                    : "low"
                                            }
                                        >

                                            {patient.risk || "Not Predicted"}

                                        </span>

                                    </td>

                                    <td>

                                        <button title="View">

                                            <FaEye />

                                        </button>

                                        <button
                                            title="Edit"
                                            onClick={() => {

                                                setSelectedPatient(patient);

                                                setShowEditModal(true);

                                            }}
                                        >

                                            <FaEdit />

                                        </button>

                                        <button
                                            title="Delete"
                                            onClick={() => handleDelete(patient.id)}
                                        >

                                            <FaTrash />

                                        </button>

                                    </td>

                                </tr>

                            ))

                        }

                    </tbody>

                </table>
                                <AddPatientModal

                    show={showModal}

                    onClose={() => setShowModal(false)}

                    onAddPatient={addPatient}

                />

                <EditPatientModal

                    show={showEditModal}

                    patient={selectedPatient}

                    onClose={() => {

                        setShowEditModal(false);

                        loadPatients();

                    }}

                />

            </div>

        </AdminLayout>

    );

}

export default AdminPatient;