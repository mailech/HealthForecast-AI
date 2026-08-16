import { useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";

import {
  FaUserCircle,
  FaEnvelope,
  FaUserTag,
  FaLock,
  FaSave,
} from "react-icons/fa";

function Profile() {

  // =====================================================
  // Get logged-in user
  // =====================================================

  const storedUser = localStorage.getItem("user");

  const loggedInUser = storedUser
    ? JSON.parse(storedUser)
    : null;


  // =====================================================
  // Profile State
  // =====================================================

  const [profile, setProfile] = useState({
    name: loggedInUser?.name || "",
    email: loggedInUser?.email || "",
    role: loggedInUser?.role || "",
  });


  const [message, setMessage] = useState("");


  // =====================================================
  // Handle Changes
  // =====================================================

  const handleChange = (e) => {

    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });

    setMessage("");
  };


  // =====================================================
  // Save Profile
  // =====================================================

  const handleSave = () => {

    // Update localStorage
    const updatedUser = {
      ...loggedInUser,
      name: profile.name,
      email: profile.email,
      role: profile.role,
    };

    localStorage.setItem(
      "user",
      JSON.stringify(updatedUser)
    );

    setMessage("Profile updated successfully.");
  };


  return (
    <DashboardLayout>

      {/* =================================================
          Header
      ================================================= */}

      <div className="mb-8">

        <h1 className="text-3xl font-bold">
          My Profile
        </h1>

        <p className="text-gray-500 mt-1">
          Manage your HealthForecast AI account.
        </p>

      </div>


      <div className="grid lg:grid-cols-3 gap-8">


        {/* =================================================
            Left Profile Card
        ================================================= */}

        <div className="bg-white rounded-xl shadow p-8 text-center">

          <FaUserCircle
            size={120}
            className="mx-auto text-blue-600"
          />


          <h2 className="text-2xl font-bold mt-5">
            {profile.name || "User"}
          </h2>


          <p className="text-blue-600 font-semibold mt-2">
            {profile.role || "Healthcare Professional"}
          </p>


          {/* User Details */}

          <div className="mt-8 space-y-5 text-left">


            {/* Email */}

            <div className="flex items-start gap-3">

              <FaEnvelope className="text-blue-600 mt-1" />

              <div>

                <p className="text-xs text-gray-400">
                  Email
                </p>

                <p className="text-gray-700 break-all">
                  {profile.email || "Not provided"}
                </p>

              </div>

            </div>


            {/* Role */}

            <div className="flex items-start gap-3">

              <FaUserTag className="text-purple-600 mt-1" />

              <div>

                <p className="text-xs text-gray-400">
                  Role
                </p>

                <p className="text-gray-700">
                  {profile.role || "Not provided"}
                </p>

              </div>

            </div>

          </div>

        </div>


        {/* =================================================
            Right Profile Form
        ================================================= */}

        <div className="lg:col-span-2 bg-white rounded-xl shadow p-8">

          <h2 className="text-2xl font-bold mb-6">
            Account Information
          </h2>


          <div className="grid md:grid-cols-2 gap-5">


            {/* Name */}

            <div>

              <label className="block text-sm font-medium text-gray-600 mb-2">
                Full Name
              </label>

              <input
                name="name"
                value={profile.name}
                onChange={handleChange}
                placeholder="Full Name"
                className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

            </div>


            {/* Email */}

            <div>

              <label className="block text-sm font-medium text-gray-600 mb-2">
                Email Address
              </label>

              <input
                name="email"
                type="email"
                value={profile.email}
                onChange={handleChange}
                placeholder="Email"
                className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

            </div>


            {/* Role */}

            <div>

              <label className="block text-sm font-medium text-gray-600 mb-2">
                Role
              </label>

              <input
                value={profile.role}
                disabled
                className="w-full border rounded-lg p-3 bg-gray-100 text-gray-500 cursor-not-allowed"
              />

            </div>

          </div>


          {/* =================================================
              Account Information
          ================================================= */}

          <div className="mt-10">

            <h3 className="text-xl font-bold flex items-center gap-2 mb-4">

              <FaLock />

              Security

            </h3>


            <div className="bg-gray-50 rounded-xl p-5">

              <p className="text-gray-600">
                Your account is protected using secure
                authentication.
              </p>

              <p className="text-sm text-gray-400 mt-2">
                Password management can be updated through
                the secure authentication system.
              </p>

            </div>

          </div>


          {/* =================================================
              Success Message
          ================================================= */}

          {message && (

            <div className="mt-6 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg">
              {message}
            </div>

          )}


          {/* =================================================
              Save Button
          ================================================= */}

          <button
            onClick={handleSave}
            className="mt-8 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition"
          >

            <FaSave />

            Save Changes

          </button>

        </div>

      </div>

    </DashboardLayout>
  );
}

export default Profile;