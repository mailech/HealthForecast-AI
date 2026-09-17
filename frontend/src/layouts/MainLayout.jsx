import Sidebar from "../components/common/Sidebar";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";


function MainLayout({ children }) {

  return (

    <div className="min-h-screen bg-[#F5F7FA]">

      {/* DARK SIDEBAR */}

      <Sidebar />


      {/* RIGHT SIDE */}

      <div className="ml-[260px] flex min-h-screen flex-col">

        {/* TOP NAVBAR */}

        <Navbar />


        {/* PAGE CONTENT */}

        <main className="flex-1 bg-[#F5F7FA] px-6 py-6">

          {children}

        </main>


        <Footer />

      </div>

    </div>

  );
}


export default MainLayout;