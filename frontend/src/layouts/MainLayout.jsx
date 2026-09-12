import Sidebar from "../components/common/Sidebar";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";

function MainLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-900">

      <Sidebar />

      <div className="flex-1 flex flex-col min-h-screen">

        <Navbar />

        <main className="flex-1 p-6 bg-slate-100 dark:bg-slate-900">
          {children}
        </main>

        <Footer />

      </div>

    </div>
  );
}

export default MainLayout;