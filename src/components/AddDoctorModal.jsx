import { useState } from "react";
import "../styles/modal.css";

function AddDoctorModal({ show, onClose, onAddDoctor }) {

    const [formData, setFormData] = useState({
        name: "",
        department: "",
        experience: "",
        status: "Active"
    });

    if (!show) return null;

    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

    };

    const handleSubmit = (e) => {

        e.preventDefault();

        onAddDoctor(formData);

        setFormData({
            name: "",
            department: "",
            experience: "",
            status: "Active"
        });

    };

    return (

        <div className="modal-overlay">

            <div className="modal">

                <h2>Add Doctor</h2>

                <form onSubmit={handleSubmit}>

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
                        type="text"
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
                            Save
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

export default AddDoctorModal;