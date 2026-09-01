import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = (e) => {
        e.preventDefault();

        if (
            email === "admin@healthforecast.com" &&
            password === "admin123"
        ) {
            navigate("/dashboard");
        } else {
            alert("Invalid Email or Password");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-cyan-600 to-indigo-700">

            <div className="bg-white rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] p-10 w-[520px]">

                <h1 className="text-[2.7rem] font-extrabold text-center text-cyan-700 whitespace-nowrap">
                    HealthForecast AI
                </h1>

                <p className="text-center text-gray-500 mt-4 mb-8 text-lg">
                    Intelligent Healthcare Prediction System
                </p>

                <form onSubmit={handleLogin} className="space-y-6">

                    <div>
                        <label className="block font-semibold mb-2 text-lg">
                            Email
                        </label>

                        <input
                            type="email"
                            placeholder="Enter Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full border border-gray-300 rounded-xl p-4 text-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                        />
                    </div>

                    <div>
                        <label className="block font-semibold mb-2 text-lg">
                            Password
                        </label>

                        <input
                            type="password"
                            placeholder="Enter Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full border border-gray-300 rounded-xl p-4 text-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-cyan-600 text-white font-bold py-4 rounded-xl text-xl hover:bg-cyan-700 hover:scale-[1.02] transition-all duration-300 shadow-lg"
                    >
                        Login
                    </button>

                </form>

            </div>

        </div>
    );
}

export default Login;