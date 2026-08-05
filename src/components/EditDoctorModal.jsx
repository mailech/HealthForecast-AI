import { useState, useEffect } from "react";
import "../styles/modal.css";

function EditDoctorModal({
    show,
    onClose,
    doctor,
    onDoctorUpdated
}) {

    const [formData, setFormData] = useState({
        doctor_id: "",
        name: "",
        department: "",
        experience: "",
        status: "Active"
    });

    useEffect(() => {

        if (doctor) {

            setFormData({
                doctor_id: doctor.doctor_id || "",
                name: doctor.name || "",
                department: doctor.department || "",
                experience: doctor.experience || "",
                status: doctor.status || "Active"
            });

        }

    }, [doctor]);

    if (!show) return null;

    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            await fetch(
                `http://127.0.0.1:5000/api/doctors/${doctor.id}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(formData)
                }
            );

            alert("Doctor Updated Successfully");

            onDoctorUpdated();

            onClose();

        }

        catch (error) {

            console.log(error);

        }

    };

    return (

        <div className="modal-overlay">

            <div className="modal">

                <h2>Edit Doctor</h2>

                <form onSubmit={handleSubmit}>

                    <input
                        type="text"
                        name="doctor_id"
                        placeholder="Doctor ID"
                        value={formData.doctor_id}
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="text"
                        name="name"
                        placeholder="Doctor Name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="text"
                        name="department"
                        placeholder="Department"
                        value={formData.department}
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="number"
                        name="experience"
                        placeholder="Experience"
                        value={formData.experience}
                        onChange={handleChange}
                        required
                    />

                    <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                    >

                        <option>Active</option>

                        <option>Inactive</option>

                    </select>

                    <div className="modal-buttons">

                        <button
                            type="submit"
                            className="save-btn"
                        >
                            Update
                        </button>

                        <button
                            type="button"
                            className="cancel-btn"
                            onClick={onClose}
                        >
                            Cancel
                        </button>

                    </div>

                </form>

            </div>

        </div>

    );

}

export default EditDoctorModal;