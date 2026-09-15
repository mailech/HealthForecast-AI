import { useEffect, useState } from "react";
import API from "./api";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Prediction from "./pages/prediction";
import Dashboard from "./pages/Dashboard";
import HealthProfile from "./pages/HealthProfile";
import AdminDashboard from "./pages/AdminDashboard";


function App() {
  const [page, setPage] = useState("home");
  const [isAdmin, setIsAdmin] = useState(false);


  // ==========================================
  // CHECK CURRENT USER / ADMIN STATUS
  // ==========================================

  useEffect(() => {
    const checkCurrentUser = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setIsAdmin(false);
          return;
        }

        const response = await API.get(
          `/auth/me?token=${token}`
        );

        setIsAdmin(
          response.data?.role === "admin"
        );

      } catch {
        setIsAdmin(false);
      }
    };

    checkCurrentUser();
  }, [page]);


  // ==========================================
  // CHECK LOGIN
  // ==========================================

  const isLoggedIn = () => {
    return Boolean(
      localStorage.getItem("token")
    );
  };


  // ==========================================
  // LOGIN PAGE
  // ==========================================

  if (page === "login") {
    return (
      <div className="auth-page">

        <button
          className="back-button"
          onClick={() => setPage("home")}
        >
          ← Back to Home
        </button>

        <Login setPage={setPage} />

      </div>
    );
  }


  // ==========================================
  // REGISTER PAGE
  // ==========================================

  if (page === "register") {
    return (
      <div className="auth-page">

        <button
          className="back-button"
          onClick={() => setPage("home")}
        >
          ← Back to Home
        </button>

        <Register setPage={setPage} />

      </div>
    );
  }


  // ==========================================
  // ADMIN DASHBOARD PAGE
  // ==========================================

  if (page === "admin") {

    if (!isLoggedIn()) {
      return (
        <div className="auth-page">

          <button
            className="back-button"
            onClick={() => setPage("home")}
          >
            ← Back to Home
          </button>

          <div className="login-required-message">

            <h1>
              🔒 Login Required
            </h1>

            <p>
              Please login to access the admin dashboard.
            </p>

            <button
              className="primary-button"
              onClick={() => setPage("login")}
            >
              Login →
            </button>

          </div>

        </div>
      );
    }

    return (
      <div className="auth-page">

        <button
          className="back-button"
          onClick={() => setPage("dashboard")}
        >
          ← Back to Dashboard
        </button>

        <AdminDashboard setPage={setPage} />

      </div>
    );
  }


  // ==========================================
  // DASHBOARD PAGE
  // ==========================================

  if (page === "dashboard") {

    if (!isLoggedIn()) {
      return (
        <div className="auth-page">

          <button
            className="back-button"
            onClick={() => setPage("home")}
          >
            ← Back to Home
          </button>

          <div className="login-required-message">

            <h1>
              🔒 Login Required
            </h1>

            <p>
              Please login to access your dashboard.
            </p>

            <button
              className="primary-button"
              onClick={() => setPage("login")}
            >
              Login →
            </button>

          </div>

        </div>
      );
    }

    return (
      <div className="auth-page">

        <button
          className="back-button"
          onClick={() => setPage("home")}
        >
          ← Back to Home
        </button>

        <Dashboard setPage={setPage} />

      </div>
    );
  }


  // ==========================================
  // HEALTH PROFILE PAGE
  // ==========================================

  if (page === "health-profile") {

    if (!isLoggedIn()) {
      return (
        <div className="auth-page">

          <button
            className="back-button"
            onClick={() => setPage("home")}
          >
            ← Back to Home
          </button>

          <div className="login-required-message">

            <h1>
              🔒 Login Required
            </h1>

            <p>
              Please login to manage your health profile.
            </p>

            <button
              className="primary-button"
              onClick={() => setPage("login")}
            >
              Login →
            </button>

          </div>

        </div>
      );
    }

    return (
      <div className="auth-page">

        <button
          className="back-button"
          onClick={() => setPage("dashboard")}
        >
          ← Back to Dashboard
        </button>

        <HealthProfile />

      </div>
    );
  }


  // ==========================================
  // PREDICTION PAGE
  // ==========================================

  if (page === "prediction") {

    if (!isLoggedIn()) {
      return (
        <div className="auth-page">

          <button
            className="back-button"
            onClick={() => setPage("home")}
          >
            ← Back to Home
          </button>

          <div className="login-required-message">

            <h1>
              🔒 Login Required
            </h1>

            <p>
              Please login to use the heart disease
              prediction system.
            </p>

            <button
              className="primary-button"
              onClick={() => setPage("login")}
            >
              Login →
            </button>

          </div>

        </div>
      );
    }

    return (
      <div className="auth-page">

        <button
          className="back-button"
          onClick={() => setPage("home")}
        >
          ← Back to Home
        </button>

        <Prediction />

      </div>
    );
  }


  // ==========================================
  // HOME PAGE
  // ==========================================

  return (
    <div className="app">

      {/* ==========================================
          NAVBAR
      ========================================== */}

      <header className="navbar">

        <div className="logo">
          ❤️ HealthForecast <span>AI</span>
        </div>


        <div className="nav-buttons">

          <button
            onClick={() => setPage("login")}
          >
            Login
          </button>


          <button
            onClick={() => setPage("dashboard")}
          >
            Dashboard
          </button>


          <button
            onClick={() => setPage("prediction")}
          >
            Prediction
          </button>


          {/* ADMIN BUTTON
              Visible only to administrators
          */}

          {isAdmin && (
            <button
              onClick={() => setPage("admin")}
            >
              Admin Dashboard
            </button>
          )}


          <button
            className="register-button"
            onClick={() => setPage("register")}
          >
            Register
          </button>

        </div>

      </header>


      {/* ==========================================
          MAIN CONTENT
      ========================================== */}

      <main>

        {/* HERO */}

        <section className="hero-section">

          <div className="hero-content">

            <p className="tagline">
              AI-POWERED HEALTH INSIGHTS
            </p>

            <h1>
              Predict Your Health.
              <br />
              <span>
                Protect Your Future.
              </span>
            </h1>

            <p className="hero-text">
              HealthForecast AI uses machine learning
              to estimate your heart disease risk and
              provide meaningful health insights.
            </p>

            <div className="hero-buttons">

              <button
                className="primary-button"
                onClick={() =>
                  setPage("register")
                }
              >
                Get Started →
              </button>

              <button
                className="secondary-button"
                onClick={() =>
                  setPage("login")
                }
              >
                Login
              </button>

            </div>

          </div>


          <div className="hero-card">

            <div className="heart-icon">
              ❤️
            </div>

            <h2>
              Health Risk Prediction
            </h2>

            <p>
              AI-assisted analysis of important
              health parameters.
            </p>

            <div className="prediction-box">

              <span>
                AI Prediction
              </span>

              <strong>
                Ready to Analyze
              </strong>

            </div>

          </div>

        </section>


        {/* ==========================================
            FEATURES
        ========================================== */}

        <section className="features-section">

          <h2>
            Why HealthForecast AI?
          </h2>

          <div className="feature-grid">

            <div className="feature-card">

              <div className="feature-icon">
                🤖
              </div>

              <h3>
                AI Prediction
              </h3>

              <p>
                Machine learning helps estimate
                potential heart disease risk from
                health information.
              </p>

            </div>


            <div className="feature-card">

              <div className="feature-icon">
                🔒
              </div>

              <h3>
                Secure Account
              </h3>

              <p>
                Create an account and keep your health
                information associated with your profile.
              </p>

            </div>


            <div className="feature-card">

              <div className="feature-icon">
                📊
              </div>

              <h3>
                Health Insights
              </h3>

              <p>
                View your health information and
                prediction results in one place.
              </p>

            </div>

          </div>

        </section>


        {/* ==========================================
            HOW IT WORKS
        ========================================== */}

        <section className="how-section">

          <h2>
            How It Works
          </h2>

          <div className="steps">

            <div className="step">

              <div className="step-number">
                1
              </div>

              <h3>
                Create Account
              </h3>

              <p>
                Register securely with your email
                and password.
              </p>

            </div>


            <div className="step">

              <div className="step-number">
                2
              </div>

              <h3>
                Enter Health Data
              </h3>

              <p>
                Provide the required health information.
              </p>

            </div>


            <div className="step">

              <div className="step-number">
                3
              </div>

              <h3>
                Get Prediction
              </h3>

              <p>
                Our AI model estimates your heart
                disease risk.
              </p>

            </div>

          </div>

        </section>

      </main>


      {/* ==========================================
          FOOTER
      ========================================== */}

      <footer>

        <p>
          © 2026 HealthForecast AI •
          AI-based health risk estimation
        </p>

        <p className="disclaimer">
          This system is for educational purposes
          and is not a medical diagnosis.
        </p>

      </footer>

    </div>
  );
}

export default App;