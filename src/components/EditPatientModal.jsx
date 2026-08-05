import { useState, useEffect } from "react";
import "../styles/modal.css";

function EditPatientModal({ show, patient, onClose }) {

    const [formData, setFormData] = useState({
        name: "",
        age: "",
        gender: "Male",
        disease: "",
        risk: "Low"
    });

    useEffect(() => {

        if (patient) {

            setFormData({

                name: patient.name || "",
                age: patient.age || "",
                gender: patient.gender || "Male",
                disease: patient.disease || "",
                risk: patient.risk || "Low"

            });

        }

    }, [patient]);

    if (!show || !patient) return null;

    const handleChange = (e) => {

        setFormData({

            ...formData,

            [e.target.name]: e.target.value

        });

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            const response = await fetch(

                `http://127.0.0.1:5000/api/patients/${patient.id}`,

                {

                    method: "PUT",

                    headers: {

                        "Content-Type": "application/json"

                    },

                    body: JSON.stringify(formData)

                }

            );

            const data = await response.json();

            alert(data.message);

            onClose();

        }

        catch (error) {

            console.log(error);

            alert("Failed to update patient");

        }

    };

    return (

        <div className="modal-overlay">

            <div className="modal">

                <h2>Edit Patient</h2>

                <form onSubmit={handleSubmit}>

                    <input
                        type="text"
                        name="name"
                        placeholder="Patient Name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="number"
                        name="age"
                        placeholder="Age"
                        value={formData.age}
                        onChange={handleChange}
                        required
                    />

                    <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                    >

                        <option value="Male">Male</option>

                        <option value="Female">Female</option>

                    </select>

                    <input
                        type="text"
                        name="disease"
                        placeholder="Disease"
                        value={formData.disease}
                        onChange={handleChange}
                        required
                    />

                    <select
                        name="risk"
                        value={formData.risk}
                        onChange={handleChange}
                    >

                        <option value="Low">Low</option>

                        <option value="Medium">Medium</option>

                        <option value="High">High</option>

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

export default EditPatientModal;