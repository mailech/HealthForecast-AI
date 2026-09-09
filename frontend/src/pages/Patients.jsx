import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const Patients = () => {
    const navigate = useNavigate();

    const [patients, setPatients] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    const [form, setForm] = useState({
        patient_id: "",
        name: "",
        age: "",
        gender: "Male",
        contact: "",
        blood_group: "",
        medical_history: "",
        existing_diseases: ""
    });

    const loadPatients = async () => {
        try {
            const response = await api.get("/patients");

            if (response.data.success) {
                setPatients(response.data.patients || []);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPatients();
    }, []);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const addPatient = async (e) => {
        e.preventDefault();

        try {
            const response = await api.post("/patients", {
                ...form,
                age: Number(form.age)
            });

            if (response.data.success) {
                alert("Patient added successfully");

                setShowForm(false);

                setForm({
                    patient_id: "",
                    name: "",
                    age: "",
                    gender: "Male",
                    contact: "",
                    blood_group: "",
                    medical_history: "",
                    existing_diseases: ""
                });

                loadPatients();
            }
        } catch (error) {
            alert(
                error.response?.data?.message ||
                "Failed to add patient"
            );
        }
    };

    const filteredPatients = patients.filter((patient) =>
        `${patient.name} ${patient.patient_id}`
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    return (
        <div className="dashboard-page">

            {/* SIDEBAR */}
            <aside className="dashboard-sidebar">

                <div className="dashboard-brand">
                    <div className="dashboard-brand-icon">+</div>

                    <div>
                        <h2>Final Healthcare</h2>
                        <span>Healthcare Platform</span>
                    </div>
                </div>

                <nav className="dashboard-nav">

                    <button
                        className="nav-item"
                        onClick={() => navigate("/dashboard")}
                    >
                        <span>▦</span>
                        Dashboard
                    </button>

                    <button className="nav-item active">
                        <span>♙</span>
                        Patients
                    </button>

                    <button
                        className="nav-item"
                        onClick={() => navigate("/risk-prediction")}
                    >
                        <span>✦</span>
                        AI Risk Analysis
                    </button>

                    <button
                        className="nav-item"
                        onClick={() => navigate("/readmission")}
                    >
                        <span>↗</span>
                        Readmission
                    </button>

                    <button
                        className="nav-item"
                        onClick={() => navigate("/treatment")}
                    >
                        <span>✚</span>
                        Treatment
                    </button>

                    <button
                        className="nav-item"
                        onClick={() => navigate("/analytics")}
                    >
                        <span>◫</span>
                        Analytics
                    </button>

                    <button
                        className="nav-item"
                        onClick={() => navigate("/reports")}
                    >
                        <span>▤</span>
                        Reports
                    </button>

                </nav>

            </aside>


            {/* MAIN */}
            <main className="dashboard-main">

                <header className="patients-page-header">

                    <div>
                        <p className="dashboard-label">
                            PATIENT MANAGEMENT
                        </p>

                        <h1>Patients</h1>

                        <p className="dashboard-subtitle">
                            Manage and monitor patient records.
                        </p>
                    </div>

                    <button
                        className="add-patient-button"
                        onClick={() => setShowForm(true)}
                    >
                        + Add Patient
                    </button>

                </header>


                {/* SEARCH */}
                <div className="patients-toolbar">

                    <div className="patient-search">
                        <span>⌕</span>

                        <input
                            type="text"
                            placeholder="Search by patient name or ID..."
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                        />
                    </div>

                    <div className="patient-count">
                        {filteredPatients.length} Patients
                    </div>

                </div>


                {/* TABLE */}
                <div className="dashboard-panel patients-list-panel">

                    {loading ? (

                        <div className="empty-state">
                            Loading patients...
                        </div>

                    ) : filteredPatients.length === 0 ? (

                        <div className="empty-state">

                            <div className="empty-icon">
                                ♙
                            </div>

                            <h4>No patients found</h4>

                            <p>
                                Add a patient to create a medical record.
                            </p>

                            <button
                                className="primary-small-button"
                                onClick={() => setShowForm(true)}
                            >
                                + Add Patient
                            </button>

                        </div>

                    ) : (

                        <div className="patient-table">

                            <div className="patient-table-header">

                                <span>Patient</span>
                                <span>Age</span>
                                <span>Gender</span>
                                <span>Blood Group</span>
                                <span>Contact</span>
                                <span>Action</span>

                            </div>


                            {filteredPatients.map((patient) => (

                                <div
                                    className="patient-row patient-row-six"
                                    key={patient.id}
                                >

                                    <div className="patient-name">

                                        <div className="patient-avatar">
                                            {patient.name?.charAt(0)}
                                        </div>

                                        <div>
                                            <strong>
                                                {patient.name}
                                            </strong>

                                            <small>
                                                {patient.patient_id}
                                            </small>
                                        </div>

                                    </div>

                                    <span>
                                        {patient.age}
                                    </span>

                                    <span>
                                        {patient.gender}
                                    </span>

                                    <span>
                                        {patient.blood_group || "—"}
                                    </span>

                                    <span>
                                        {patient.contact || "—"}
                                    </span>

                                    <button
                                        className="view-patient-button"
                                        onClick={() =>
                                            navigate(
                                                `/patients/${patient.id}`
                                            )
                                        }
                                    >
                                        View →
                                    </button>

                                </div>

                            ))}

                        </div>

                    )}

                </div>

            </main>


            {/* ADD PATIENT MODAL */}

            {showForm && (

                <div className="modal-overlay">

                    <div className="patient-modal">

                        <div className="modal-header">

                            <div>
                                <p className="dashboard-label">
                                    NEW RECORD
                                </p>

                                <h2>Add Patient</h2>

                                <p>
                                    Enter the patient's basic information.
                                </p>
                            </div>

                            <button
                                className="modal-close"
                                onClick={() => setShowForm(false)}
                            >
                                ×
                            </button>

                        </div>


                        <form onSubmit={addPatient}>

                            <div className="form-grid">

                                <div className="form-group">

                                    <label>Patient ID</label>

                                    <input
                                        name="patient_id"
                                        value={form.patient_id}
                                        onChange={handleChange}
                                        placeholder="P002"
                                        required
                                    />

                                </div>


                                <div className="form-group">

                                    <label>Full Name</label>

                                    <input
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        placeholder="Patient name"
                                        required
                                    />

                                </div>


                                <div className="form-group">

                                    <label>Age</label>

                                    <input
                                        type="number"
                                        name="age"
                                        value={form.age}
                                        onChange={handleChange}
                                        placeholder="45"
                                        required
                                    />

                                </div>


                                <div className="form-group">

                                    <label>Gender</label>

                                    <select
                                        name="gender"
                                        value={form.gender}
                                        onChange={handleChange}
                                    >
                                        <option>Male</option>
                                        <option>Female</option>
                                        <option>Other</option>
                                    </select>

                                </div>


                                <div className="form-group">

                                    <label>Contact</label>

                                    <input
                                        name="contact"
                                        value={form.contact}
                                        onChange={handleChange}
                                        placeholder="9876543210"
                                    />

                                </div>


                                <div className="form-group">

                                    <label>Blood Group</label>

                                    <select
                                        name="blood_group"
                                        value={form.blood_group}
                                        onChange={handleChange}
                                    >
                                        <option value="">
                                            Select
                                        </option>
                                        <option>A+</option>
                                        <option>A-</option>
                                        <option>B+</option>
                                        <option>B-</option>
                                        <option>AB+</option>
                                        <option>AB-</option>
                                        <option>O+</option>
                                        <option>O-</option>
                                    </select>

                                </div>

                            </div>


                            <div className="form-group">

                                <label>Medical History</label>

                                <textarea
                                    name="medical_history"
                                    value={form.medical_history}
                                    onChange={handleChange}
                                    placeholder="Previous medical history..."
                                />

                            </div>


                            <div className="form-group">

                                <label>Existing Diseases</label>

                                <textarea
                                    name="existing_diseases"
                                    value={form.existing_diseases}
                                    onChange={handleChange}
                                    placeholder="Diabetes, hypertension..."
                                />

                            </div>


                            <div className="modal-actions">

                                <button
                                    type="button"
                                    className="cancel-button"
                                    onClick={() =>
                                        setShowForm(false)
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="save-patient-button"
                                >
                                    Save Patient
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
};

export default Patients;