import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/api";


function Signup() {

  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");


  const handleSignup = async (e) => {

    e.preventDefault();

    setError("");
    setSuccess("");


    if (password !== confirmPassword) {

      setError("Passwords do not match.");

      return;
    }


    setLoading(true);


    try {

      await api.post(
        "/users/register",
        {
          name,
          email,
          password,
        }
      );


      setSuccess(
        "Account created successfully. You can now login."
      );


      setTimeout(() => {
        navigate("/login");
      }, 1200);


    } catch (err) {

      console.error(
        "SIGNUP ERROR:",
        err
      );

      setError(
        err.response?.data?.detail ||
        "Unable to create account. Please try again."
      );

    } finally {

      setLoading(false);

    }
  };


  return (

    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">

      <div className="w-full max-w-md">

        <div className="bg-white rounded-2xl shadow-xl p-8">


          <div className="text-center mb-8">

            <h1 className="text-3xl font-bold text-blue-600">
              HealthForecast AI
            </h1>

            <p className="text-gray-500 mt-2">
              Create your Patient Account
            </p>

          </div>


          {error && (

            <div className="mb-5 bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-sm">
              {error}
            </div>

          )}


          {success && (

            <div className="mb-5 bg-green-50 border border-green-200 text-green-600 rounded-lg px-4 py-3 text-sm">
              {success}
            </div>

          )}


          <form onSubmit={handleSignup}>


            <div className="mb-4">

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                placeholder="Enter your name"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                required
                minLength={2}
              />

            </div>


            <div className="mb-4">

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="Enter your email"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                required
              />

            </div>


            <div className="mb-4">

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="Create a password"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                required
                minLength={6}
              />

            </div>


            <div className="mb-6">

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>

              <input
                type="password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                placeholder="Confirm your password"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                required
              />

            </div>


            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-60"
            >
              {loading
                ? "Creating Account..."
                : "Create Account"}
            </button>


          </form>


          <div className="text-center mt-6">

            <span className="text-gray-500 text-sm">
              Already have an account?
            </span>

            <Link
              to="/login"
              className="text-blue-600 font-semibold text-sm ml-1 hover:underline"
            >
              Login
            </Link>

          </div>


        </div>


        <p className="text-center text-gray-400 text-sm mt-6">
          © 2026 HealthForecast AI
        </p>

      </div>

    </div>
  );
}


export default Signup;