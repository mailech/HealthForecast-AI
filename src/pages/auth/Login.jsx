import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/login.css";

function Login() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: "",
        password: "",
        role: "doctor"
    });

    const handleChange = (event) => {

        setFormData({

            ...formData,

            [event.target.name]: event.target.value

        });

    };

    const handleLogin = async (event) => {

        event.preventDefault();

        try {

            const response = await fetch(
                "http://127.0.0.1:5000/api/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({

                        username: formData.username,
                        password: formData.password

                    })
                }
            );

            const data = await response.json();

            if (data.success) {

                if (data.role !== formData.role) {

                    alert("Selected role does not match this account!");

                    return;

                }

                alert("Login Successful!");

                if (data.role === "admin") {

                    navigate("/admin/dashboard");

                }

                else if (data.role === "doctor") {

                    navigate("/doctor/dashboard");

                }

                else if (data.role === "researcher") {

                    navigate("/research/dashboard");

                }

                else if (data.role === "system") {

                    navigate("/system/dashboard");

                }

            }

            else {

                alert(data.message);

            }

        }

        catch (error) {

            console.log(error);

            alert("Server Connection Failed!");

        }

    };

    return (

        <div className="login-container">

            <div className="login-card">

                <div className="logo">

                    🏥

                </div>

                <h1>

                    HealthForecast AI

                </h1>

                <p>

                    Role-Based Hospital Readmission &
                    Patient Risk Intelligence System

                </p>

                <form onSubmit={handleLogin}>

                    <div className="input-group">

                        <label>

                            Username

                        </label>

                        <input
                            type="text"
                            name="username"
                            placeholder="Enter Username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />

                    </div>

                    <div className="input-group">

                        <label>

                            Password

                        </label>

                        <input
                            type="password"
                            name="password"
                            placeholder="Enter Password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />

                    </div>

                    <div className="input-group">

                        <label>

                            Select Role

                        </label>

                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                        >

                            <option value="doctor">

                                Doctor

                            </option>

                            <option value="admin">

                                Hospital Administrator

                            </option>

                            <option value="researcher">

                                Healthcare Researcher

                            </option>

                            <option value="system">

                                System Administrator

                            </option>

                        </select>

                    </div>

                    <button
                        type="submit"
                        className="login-btn"
                    >

                        Login

                    </button>

                </form>

            </div>

        </div>

    );

}

export default Login;