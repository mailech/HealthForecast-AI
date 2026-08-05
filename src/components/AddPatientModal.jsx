import { useState } from "react";
import "../styles/modal.css";

function AddPatientModal({ show, onClose, onAddPatient }) {

    const [formData, setFormData] = useState({

        name: "",
        age: "",
        gender: "Male",
        disease: ""

    });

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

            // ===========================
            // Predict Risk
            // ===========================

            const predictResponse = await fetch(

                "http://127.0.0.1:5000/api/predict/",

                {

                    method: "POST",

                    headers: {

                        "Content-Type": "application/json"

                    },

                    body: JSON.stringify({

                        age: Number(formData.age),

                        gender: formData.gender,

                        disease: formData.disease

                    })

                }

            );

            if (!predictResponse.ok) {

                throw new Error("Prediction API Failed");

            }

            const prediction = await predictResponse.json();

            console.log("Prediction:", prediction);

            // ===========================
            // Save Patient
            // ===========================

            const patientData = {

                name: formData.name,

                age: Number(formData.age),

                gender: formData.gender,

                disease: formData.disease,

                risk: prediction.risk

            };

            const response = await fetch(

                "http://127.0.0.1:5000/api/patients/",

                {

                    method: "POST",

                    headers: {

                        "Content-Type": "application/json"

                    },

                    body: JSON.stringify(patientData)

                }

            );

            if (!response.ok) {

                throw new Error("Failed to Save Patient");

            }

            const data = await response.json();

            console.log("Patient Saved:", data);

            alert(

                `${data.message}\n\nPredicted Risk: ${prediction.risk}`

            );

            if (onAddPatient) {

                onAddPatient();

            }

            setFormData({

                name: "",

                age: "",

                gender: "Male",

                disease: ""

            });

            onClose();

        }

        catch (error) {

            console.error(error);

            alert(error.message);

        }

    };

    return (

        <div className="modal-overlay">

            <div className="modal">

                <h2>Add New Patient</h2>

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

export default AddPatientModal;