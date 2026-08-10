import { Bell, } from "lucide-react";

function Header({ title, subtitle }) {
  const role = localStorage.getItem("hf_role") || "Doctor";
  const email = localStorage.getItem("hf_email") || "user@hospital.com";
  const initial = role.charAt(0);

  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
        <p className="text-slate-500">{subtitle}</p>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-lg hover:bg-pista-100 transition">
          <Bell size={20} className="text-slate-600" />
          <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
            2
          </span>
        </button>

        <div className="flex items-center gap-2 pl-3 border-l border-pista-100">
          <div className="w-9 h-9 rounded-full bg-pista-500 text-white flex items-center justify-center font-semibold text-sm">
            {initial}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-slate-800 leading-tight">{role}</p>
            <p className="text-xs text-slate-400 leading-tight">{email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;