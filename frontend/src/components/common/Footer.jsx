function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 px-6 py-4 mt-auto">
      <div className="flex flex-col md:flex-row items-center justify-between gap-2">

        <p className="text-sm text-gray-500">
          © {new Date().getFullYear()} HealthForecast AI. All rights reserved.
        </p>

        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>AI-Powered Healthcare</span>
          <span>•</span>
          <span>Version 1.0.0</span>
        </div>

      </div>
    </footer>
  );
}

export default Footer; 