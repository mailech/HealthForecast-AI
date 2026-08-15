import { Bell, Search, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("hf_token");

    navigate("/login", { replace: true });
  };

  return (
    <div className="bg-white h-20 shadow flex items-center justify-between px-8">

      {/* SEARCH */}

      <div className="flex items-center bg-slate-100 rounded-lg px-4 py-2 w-80">

        <Search
          size={18}
          className="text-gray-500"
        />

        <input
          type="text"
          placeholder="Search patients..."
          className="bg-transparent outline-none ml-3 w-full"
        />

      </div>


      {/* RIGHT SIDE */}

      <div className="flex items-center gap-5">

        {/* NOTIFICATION */}

        <button
          className="relative p-2 rounded-lg hover:bg-slate-100 transition"
          title="Notifications"
        >
          <Bell size={22} />

          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>


        {/* USER */}

        <div className="text-right">

          <h3 className="font-semibold text-slate-800">
            {user.name || "Test User"}
          </h3>

          <p className="text-sm text-gray-500 capitalize">
            {user.role || "Doctor"}
          </p>

        </div>


        {/* PROFILE */}

        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold">
          {(user.name || "T")
            .charAt(0)
            .toUpperCase()}
        </div>


        {/* LOGOUT */}

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition"
          title="Logout"
        >
          <LogOut size={19} />

          <span className="hidden lg:inline">
            Logout
          </span>
        </button>

      </div>

    </div>
  );
}

export default Navbar; 