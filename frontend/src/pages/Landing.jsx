import { Link } from "react-router-dom";
import landingPageImage from "../assets/landingPageImage.jpg";
import {
  FaHeartbeat,
  FaHospital,
  FaChartLine,
  FaUserMd,
  FaArrowRight,
} from "react-icons/fa";

function Landing() {
  const features = [
    {
      icon: <FaHeartbeat className="text-4xl text-red-500" />,
      title: "Risk Prediction",
      desc: "Predict high-risk patients using AI-powered analytics.",
    },
    {
      icon: <FaHospital className="text-4xl text-blue-500" />,
      title: "Readmission Forecast",
      desc: "Reduce unnecessary hospital readmissions.",
    },
    {
      icon: <FaChartLine className="text-4xl text-green-500" />,
      title: "Healthcare Analytics",
      desc: "Interactive dashboards for better clinical insights.",
    },
    {
      icon: <FaUserMd className="text-4xl text-cyan-500" />,
      title: "Clinical Support",
      desc: "Assist doctors with intelligent recommendations.",
    },
  ];

  return (
    <div className="bg-slate-50 min-h-screen">

      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full bg-white/90 backdrop-blur shadow-sm z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-8 py-4">

          <h1 className="text-3xl font-bold text-blue-700">
            HealthForecast AI
          </h1>

          <div className="flex items-center gap-8">

            <a href="#features" className="hover:text-blue-600">
              Features
            </a>

            <a href="#about" className="hover:text-blue-600">
              About
            </a>

            <Link
              to="/login"
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl"
            >
              Login
            </Link>

          </div>

        </div>
      </nav>

      {/* Hero */}

      <section className="pt-36 pb-24">

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center px-8">

          <div>

            <p className="text-blue-600 font-semibold uppercase tracking-widest">
              AI Powered Healthcare
            </p>

            <h1 className="text-6xl font-extrabold text-slate-800 leading-tight mt-4">

              Predict Hospital

              <span className="text-blue-600">
                {" "}Readmissions
              </span>

              Before They Happen

            </h1>

            <p className="mt-8 text-lg text-gray-600 leading-8">

              HealthForecast AI helps hospitals identify high-risk
              patients, predict readmission probability,
              improve recovery planning, and support doctors
              with intelligent clinical insights.

            </p>

            <div className="mt-10 flex gap-5">

              <Link
                to="/login"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl flex items-center gap-3"
              >
                Get Started
                <FaArrowRight />
              </Link>

              <button className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-4 rounded-xl transition">
                Learn More
              </button>

            </div>

          </div>

          <div>
 <img
  src={landingPageImage}
  alt="HealthForecast AI"
  className="w-full max-w-lg rounded-3xl shadow-2xl hover:scale-105 transition-all duration-500"
/>

          </div>

        </div>

      </section>

      {/* Features */}

      <section
        id="features"
        className="py-24 bg-white"
      >

        <div className="max-w-7xl mx-auto px-8">

          <h2 className="text-4xl font-bold text-center">
            Platform Features
          </h2>

          <p className="text-center text-gray-500 mt-4">
            AI-powered solutions for modern healthcare.
          </p>

          <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8 mt-16">

            {features.map((item) => (

              <div
                key={item.title}
                className="bg-slate-50 rounded-2xl shadow-md hover:shadow-xl transition p-8 text-center"
              >

                <div className="flex justify-center">
                  {item.icon}
                </div>

                <h3 className="text-2xl font-bold mt-6">
                  {item.title}
                </h3>

                <p className="mt-4 text-gray-600">
                  {item.desc}
                </p>

              </div>

            ))}

          </div>

        </div>

      </section>

      {/* How It Works */}

      <section
        id="about"
        className="py-24 bg-slate-100"
      >

        <div className="max-w-6xl mx-auto px-8">

          <h2 className="text-4xl font-bold text-center">
            How It Works
          </h2>

          <div className="grid md:grid-cols-4 gap-10 mt-16 text-center">

            <div>
              <div className="text-6xl">📋</div>
              <h3 className="font-bold mt-4">Patient Data</h3>
            </div>

            <div>
              <div className="text-6xl">🤖</div>
              <h3 className="font-bold mt-4">AI Analysis</h3>
            </div>

            <div>
              <div className="text-6xl">📈</div>
              <h3 className="font-bold mt-4">Risk Prediction</h3>
            </div>

            <div>
              <div className="text-6xl">💙</div>
              <h3 className="font-bold mt-4">Clinical Support</h3>
            </div>

          </div>

        </div>

      </section>

      {/* CTA */}

    <section className="py-24 bg-gradient-to-br from-cyan-100 via-white to-blue-100 text-slate-900 text-center">
            <h2 className="text-5xl font-bold">
          Ready to Transform Healthcare?
        </h2>

        <p className="mt-6 text-xl opacity-90">
          Start using AI-powered patient risk intelligence today.
        </p>

        <Link
          to="/login"
          className="inline-block mt-10 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-8 py-4 rounded-xl font-semibold hover:scale-105 transition"
          >
          Launch Dashboard
        </Link>

      </section>

      {/* Footer */}

      <footer className="bg-slate-900 text-white py-8">

        <div className="max-w-7xl mx-auto text-center">

          <h2 className="text-2xl font-bold">
            HealthForecast AI
          </h2>

          <p className="mt-3 text-gray-400">
            Hospital Readmission Prediction & Patient Risk Intelligence System
          </p>

          <p className="mt-6 text-gray-500">
            © 2026 HealthForecast AI. All Rights Reserved.
          </p>

        </div>

      </footer>

    </div>
  );
}

export default Landing;