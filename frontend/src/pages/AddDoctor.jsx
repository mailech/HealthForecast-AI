import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const AddDoctor = () => {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: ""
    });

    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setMessage("");
        setLoading(true);

        try {
            await api.post("/auth/register", {
                name: form.name,
                email: form.email,
                password: form.password,
                role: "doctor"
            });

            setMessage("Doctor account created successfully.");

            setForm({
                name: "",
                email: "",
                password: ""
            });

            // Redirect to User Management after 1 second
            setTimeout(() => {
                navigate("/users");
            }, 1000);

        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                "Failed to create doctor account."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-add-doctor-page">

            <div className="admin-add-doctor-header">

                <div>
                    <p className="admin-eyebrow">
                        DOCTOR MANAGEMENT
                    </p>

                    <h1>Add Doctor</h1>

                    <p>
                        Create a new doctor account for the healthcare system.
                    </p>
                </div>

                <button
                    className="admin-back-button"
                    onClick={() => navigate("/admin-dashboard")}
                >
                    ← Back to Dashboard
                </button>

            </div>


            <div className="admin-add-doctor-card">

                <div className="admin-form-icon">
                    👨‍⚕️
                </div>

                <h2>Doctor Account</h2>

                <p className="admin-form-description">
                    Enter the doctor's details below to create a secure account.
                </p>


                <form onSubmit={handleSubmit}>

                    {/* Doctor Name */}

                    <div className="admin-form-group">

                        <label>
                            Doctor Name
                        </label>

                        <input
                            type="text"
                            name="name"
                            placeholder="Enter doctor name"
                            value={form.name}
                            onChange={handleChange}
                            required
                        />

                    </div>


                    {/* Email */}

                    <div className="admin-form-group">

                        <label>
                            Email Address
                        </label>

                        <input
                            type="email"
                            name="email"
                            placeholder="doctor@example.com"
                            value={form.email}
                            onChange={handleChange}
                            required
                        />

                    </div>


                    {/* Password */}

                    <div className="admin-form-group">

                        <label>
                            Password
                        </label>

                        <input
                            type="password"
                            name="password"
                            placeholder="Create a password"
                            value={form.password}
                            onChange={handleChange}
                            required
                            minLength="6"
                        />

                    </div>


                    {/* Message */}

                    {message && (
                        <div className="admin-form-message">
                            {message}
                        </div>
                    )}


                    {/* Submit */}

                    <button
                        type="submit"
                        className="admin-create-doctor-button"
                        disabled={loading}
                    >
                        {loading
                            ? "Creating..."
                            : "Create Doctor Account"}
                    </button>

                </form>

            </div>

        </div>
    );
};

export default AddDoctor;