import { useState, useEffect } from "react";

import AdminLayout from "../../layouts/AdminLayout";
import "../../styles/admin-doctors.css";

import AddDoctorModal from "../../components/AddDoctorModal";
import EditDoctorModal from "../../components/EditDoctorModal";

import {
    FaPlus,
    FaSearch,
    FaEye,
    FaEdit,
    FaTrash
} from "react-icons/fa";

function AdminDoctors() {

    const [showModal, setShowModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    const [selectedDoctor, setSelectedDoctor] = useState(null);

    const [doctors, setDoctors] = useState([]);

    // Load Doctors
    const loadDoctors = () => {

        fetch("http://127.0.0.1:5000/api/doctors/")
            .then((response) => response.json())
            .then((data) => {

                setDoctors(data);

            })
            .catch((error) => {

                console.log(error);

            });

    };

    useEffect(() => {

        loadDoctors();

    }, []);

    // Refresh after Add
    const addDoctor = () => {

        loadDoctors();

        setShowModal(false);

    };

    // Delete Doctor
    const handleDelete = async (id) => {

        if (!window.confirm("Delete this doctor?")) return;

        try {

            await fetch(

                `http://127.0.0.1:5000/api/doctors/${id}`,

                {
                    method: "DELETE"
                }

            );

            loadDoctors();

        }

        catch (error) {

            console.log(error);

        }

    };
        return (

        <AdminLayout>

            <div className="doctor-page">

                <div className="page-header">

                    <h1>Doctor Management</h1>

                    <button
                        className="add-btn"
                        onClick={() => setShowModal(true)}
                    >

                        <FaPlus />

                        Add Doctor

                    </button>

                </div>

                <div className="search-box">

                    <FaSearch />

                    <input
                        type="text"
                        placeholder="Search Doctor..."
                    />

                </div>

                <table className="patient-table">

                    <thead>

                        <tr>

                            <th>ID</th>
                            <th>Doctor ID</th>
                            <th>Name</th>
                            <th>Department</th>
                            <th>Experience</th>
                            <th>Status</th>
                            <th>Actions</th>

                        </tr>

                    </thead>

                    <tbody>

                        {

                            doctors.map((doctor) => (

                                <tr key={doctor.id}>

                                    <td>{doctor.id}</td>

                                    <td>{doctor.doctor_id}</td>

                                    <td>{doctor.name}</td>

                                    <td>{doctor.department}</td>

                                    <td>{doctor.experience} Years</td>

                                    <td>

                                        <span
                                            className={
                                                doctor.status === "Active"
                                                    ? "low"
                                                    : "high"
                                            }
                                        >

                                            {doctor.status}

                                        </span>

                                    </td>

                                    <td>

                                        <button title="View">

                                            <FaEye />

                                        </button>

                                        <button
                                            title="Edit"
                                            onClick={() => {

                                                setSelectedDoctor(doctor);

                                                setShowEditModal(true);

                                            }}
                                        >

                                            <FaEdit />

                                        </button>

                                        <button
                                            title="Delete"
                                            onClick={() => handleDelete(doctor.id)}
                                        >

                                            <FaTrash />

                                        </button>

                                    </td>

                                </tr>

                            ))

                        }

                    </tbody>

                </table>
                                <AddDoctorModal

                    show={showModal}

                    onClose={() => setShowModal(false)}

                    onAddDoctor={addDoctor}

                />

                <EditDoctorModal

                    show={showEditModal}

                    doctor={selectedDoctor}

                    onDoctorUpdated={loadDoctors}

                    onClose={() => {

                        setShowEditModal(false);

                    }}

                />

            </div>

        </AdminLayout>

    );

}

export default AdminDoctors;