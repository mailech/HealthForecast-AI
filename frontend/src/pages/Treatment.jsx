import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const Treatment = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user } = useAuth();

    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);

    const [form, setForm] = useState({
        diagnosis: "",
        treatment_plan: "",
        medication: "",
        dosage: "",
        status: "Ongoing",
        doctor_notes: "",
        follow_up_date: ""
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    // ==========================================
    // LOAD PATIENTS
    // ==========================================

    useEffect(() => {
        const loadPatients = async () => {
            try {
                const response = await api.get("/patients");

                const list = response.data.patients || [];

                setPatients(list);

                const patientId = searchParams.get("patient");

                if (patientId) {
                    const patient = list.find(
                        (p) =>
                            String(p.id) === String(patientId)
                    );

                    if (patient) {
                        setSelectedPatient(patient);
                    }
                }
            } catch (err) {
                console.error("Patient loading error:", err);
                setError("Unable to load patients.");
            } finally {
                setLoading(false);
            }
        };

        loadPatients();
    }, [searchParams]);

    // ==========================================
    // PATIENT CHANGE
    // ==========================================

    const handlePatientChange = (e) => {
        const id = e.target.value;

        const patient = patients.find(
            (p) => String(p.id) === String(id)
        );

        setSelectedPatient(patient || null);
        setMessage("");
        setError("");
    };

    // ==========================================
    // FORM CHANGE
    // ==========================================

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    // ==========================================
    // SAVE TREATMENT
    // ==========================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");

        if (!selectedPatient) {
            setError("Please select a patient.");
            return;
        }

        if (!form.diagnosis) {
            setError("Please enter the diagnosis.");
            return;
        }

        if (!form.treatment_plan) {
            setError("Please enter the treatment plan.");
            return;
        }

        // Get logged-in doctor ID
        const doctorId = user?.id;

        if (!doctorId) {
            setError(
                "Doctor information not found. Please login again."
            );
            return;
        }

        setSaving(true);

        try {
            const response = await api.post(
                "/treatments",
                {
                    patient_id: selectedPatient.id,
                    doctor_id: doctorId,
                    diagnosis: form.diagnosis,
                    treatment_plan: form.treatment_plan,
                    medication: form.medication,
                    dosage: form.dosage,
                    status: form.status,
                    doctor_notes: form.doctor_notes,
                    follow_up_date:
                        form.follow_up_date || null
                }
            );

            if (response.data.success) {
                setMessage(
                    "✓ Treatment saved successfully."
                );

                // Clear treatment fields
                setForm({
                    diagnosis: "",
                    treatment_plan: "",
                    medication: "",
                    dosage: "",
                    status: "Ongoing",
                    doctor_notes: "",
                    follow_up_date: ""
                });
            } else {
                setError(
                    response.data.message ||
                    "Failed to save treatment."
                );
            }
        } catch (err) {
            console.error(
                "Treatment save error:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Failed to save treatment."
            );
        } finally {
            setSaving(false);
        }
    };

    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {
        return (
            <div className="page-loading">
                Loading patients...
            </div>
        );
    }

    return (
        <div className="risk-page">

            {/* HEADER */}

            <div className="risk-header">

                <div>

                    <button
                        className="back-btn"
                        onClick={() =>
                            navigate("/dashboard")
                        }
                    >
                        ← Dashboard
                    </button>

                    <h1>
                        Treatment Management
                    </h1>

                    <p>
                        Create and manage personalized
                        treatment plans for patients.
                    </p>

                </div>

            </div>

            {/* SUCCESS */}

            {message && (
                <div
                    style={{
                        background: "#edf9f4",
                        border: "1px solid #c5ead9",
                        color: "#19704f",
                        padding: "14px 18px",
                        borderRadius: "12px",
                        marginBottom: "22px",
                        fontSize: "14px"
                    }}
                >
                    {message}
                </div>
            )}

            {/* ERROR */}

            {error && (
                <div className="risk-error">
                    ⚠️ {error}
                </div>
            )}

            <div className="risk-layout">

                {/* ==================================
                    TREATMENT FORM
                ================================== */}

                <div className="risk-card">

                    <div className="card-title">

                        <div className="title-icon">
                            💊
                        </div>

                        <div>
                            <h2>
                                Treatment Plan
                            </h2>

                            <p>
                                Enter treatment information
                                for the selected patient.
                            </p>
                        </div>

                    </div>

                    <form onSubmit={handleSubmit}>

                        {/* PATIENT */}

                        <div className="form-group">

                            <label>
                                Select Patient
                            </label>

                            <select
                                value={
                                    selectedPatient?.id ||
                                    ""
                                }
                                onChange={
                                    handlePatientChange
                                }
                            >

                                <option value="">
                                    Choose a patient
                                </option>

                                {patients.map(
                                    (patient) => (
                                        <option
                                            key={
                                                patient.id
                                            }
                                            value={
                                                patient.id
                                            }
                                        >
                                            {
                                                patient.patient_id
                                            }{" "}
                                            -{" "}
                                            {patient.name}
                                        </option>
                                    )
                                )}

                            </select>

                        </div>

                        {/* DIAGNOSIS */}

                        <div className="form-group">

                            <label>
                                Diagnosis
                            </label>

                            <input
                                type="text"
                                name="diagnosis"
                                value={
                                    form.diagnosis
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="e.g. Type 2 Diabetes"
                            />

                        </div>

                        {/* GRID */}

                        <div className="form-grid">

                            {/* TREATMENT PLAN */}

                            <div className="form-group">

                                <label>
                                    Treatment Plan
                                </label>

                                <input
                                    type="text"
                                    name="treatment_plan"
                                    value={
                                        form.treatment_plan
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="e.g. Diabetes Management"
                                />

                            </div>

                            {/* MEDICATION */}

                            <div className="form-group">

                                <label>
                                    Medication
                                </label>

                                <input
                                    type="text"
                                    name="medication"
                                    value={
                                        form.medication
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="e.g. Metformin"
                                />

                            </div>

                            {/* DOSAGE */}

                            <div className="form-group">

                                <label>
                                    Dosage
                                </label>

                                <input
                                    type="text"
                                    name="dosage"
                                    value={
                                        form.dosage
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="e.g. 500mg twice daily"
                                />

                            </div>

                            {/* STATUS */}

                            <div className="form-group">

                                <label>
                                    Status
                                </label>

                                <select
                                    name="status"
                                    value={
                                        form.status
                                    }
                                    onChange={
                                        handleChange
                                    }
                                >

                                    <option value="Ongoing">
                                        Ongoing
                                    </option>

                                    <option value="Completed">
                                        Completed
                                    </option>

                                    <option value="Paused">
                                        Paused
                                    </option>

                                </select>

                            </div>

                            {/* FOLLOW UP */}

                            <div className="form-group">

                                <label>
                                    Follow-up Date
                                </label>

                                <input
                                    type="date"
                                    name="follow_up_date"
                                    value={
                                        form.follow_up_date
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />

                            </div>

                        </div>

                        {/* DOCTOR NOTES */}

                        <div className="form-group">

                            <label>
                                Doctor Notes
                            </label>

                            <textarea
                                name="doctor_notes"
                                value={
                                    form.doctor_notes
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="Enter treatment instructions and follow-up notes..."
                                rows="4"
                                style={{
                                    width: "100%",
                                    boxSizing: "border-box",
                                    border:
                                        "1px solid #d8e4ec",
                                    borderRadius:
                                        "10px",
                                    padding: "14px",
                                    fontSize: "14px",
                                    resize: "vertical",
                                    outline: "none",
                                    fontFamily:
                                        "inherit"
                                }}
                            />

                        </div>

                        {/* SAVE */}

                        <button
                            type="submit"
                            className="predict-btn"
                            disabled={saving}
                        >
                            {saving
                                ? "Saving Treatment..."
                                : "💊 Create Treatment Plan"}
                        </button>

                    </form>

                </div>

                {/* ==================================
                    PATIENT SUMMARY
                ================================== */}

                <div className="risk-result-card">

                    {!selectedPatient ? (

                        <div className="empty-result">

                            <div className="empty-icon">
                                👨‍⚕️
                            </div>

                            <h2>
                                Patient Summary
                            </h2>

                            <p>
                                Select a patient to view
                                their information.
                            </p>

                        </div>

                    ) : (

                        <div
                            className="prediction-result"
                            style={{
                                textAlign: "left"
                            }}
                        >

                            <div
                                style={{
                                    textAlign: "center"
                                }}
                            >

                                <div className="result-icon">
                                    👤
                                </div>

                                <p className="result-label">
                                    SELECTED PATIENT
                                </p>

                                <h2
                                    style={{
                                        margin:
                                            "6px 0 25px",
                                        color:
                                            "#173b59"
                                    }}
                                >
                                    {
                                        selectedPatient.name
                                    }
                                </h2>

                            </div>

                            <div
                                style={{
                                    background:
                                        "#f6f9fb",
                                    borderRadius:
                                        "12px",
                                    padding:
                                        "18px"
                                }}
                            >

                                <p>
                                    <strong>
                                        Patient ID:
                                    </strong>{" "}
                                    {
                                        selectedPatient.patient_id
                                    }
                                </p>

                                <p>
                                    <strong>
                                        Age:
                                    </strong>{" "}
                                    {
                                        selectedPatient.age ||
                                        "Not available"
                                    }
                                </p>

                                <p>
                                    <strong>
                                        Gender:
                                    </strong>{" "}
                                    {
                                        selectedPatient.gender ||
                                        "Not available"
                                    }
                                </p>

                                <p>
                                    <strong>
                                        Blood Group:
                                    </strong>{" "}
                                    {
                                        selectedPatient.blood_group ||
                                        "Not available"
                                    }
                                </p>

                                <p>
                                    <strong>
                                        Diseases:
                                    </strong>{" "}
                                    {
                                        selectedPatient.existing_diseases ||
                                        "None recorded"
                                    }
                                </p>

                            </div>

                            <button
                                className="view-patient-btn"
                                style={{
                                    marginTop:
                                        "22px",
                                    width: "100%"
                                }}
                                onClick={() =>
                                    navigate(
                                        `/patients/${selectedPatient.id}`
                                    )
                                }
                            >
                                View Full Patient Profile →
                            </button>

                        </div>

                    )}

                </div>

            </div>

            <div className="prediction-disclaimer">

                <strong>
                    Clinical Information:
                </strong>{" "}
                Treatment information should be entered
                and reviewed by authorized healthcare
                professionals.

            </div>

        </div>
    );
};

export default Treatment;