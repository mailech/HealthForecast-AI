import React, { useState } from "react";

// Use 127.0.0.1 instead of localhost
const AI_API_URL = "http://localhost:8001";

export default function Readmission() {
  const [form, setForm] = useState({
    age: 30,
    previous_admissions: 0,
    length_of_stay: 3,
    chronic_conditions: 0,
  });

  const [analyzing, setAnalyzing] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const analyzeReadmission = async (event) => {
    event.preventDefault();

    setAnalyzing(true);
    setResponse(null);
    setError("");

    const requestBody = {
      age: Number(form.age),
      previous_admissions: Number(form.previous_admissions),
      length_of_stay: Number(form.length_of_stay),
      chronic_conditions: Number(form.chronic_conditions),
    };

    try {
      console.log("Sending request to AI service:", requestBody);

      const controller = new AbortController();

      const timeout = setTimeout(() => {
        controller.abort();
      }, 30000);

      const result = await fetch(
        `${AI_API_URL}/predict-readmission`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        }
      );

      clearTimeout(timeout);

      const responseText = await result.text();

      let data;

      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error("AI service returned an invalid response.");
      }

      console.log("AI service response:", data);

      if (!result.ok) {
        throw new Error(
          data.detail ||
            data.message ||
            `Prediction failed with status ${result.status}`
        );
      }

      if (!data.success) {
        throw new Error(
          data.message || "AI service returned an unsuccessful response."
        );
      }

      if (!data.prediction_result) {
        throw new Error("Prediction result is missing from AI response.");
      }

      setResponse(data);
    } catch (err) {
      console.error("Readmission prediction error:", err);

      if (err.name === "AbortError") {
        setError(
          "The AI service took too long to respond. Please try again."
        );
      } else if (err instanceof TypeError) {
        setError(
          "Unable to connect to the AI service. Make sure Docker AI service is running."
        );
      } else {
        setError(err.message || "Readmission prediction failed.");
      }
    } finally {
      setAnalyzing(false);
    }
  };

  const predictionResult = response?.prediction_result;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.leftCard}>
          <div style={styles.header}>
            <div style={styles.icon}>🏥</div>

            <div>
              <h1 style={styles.title}>Readmission Assessment</h1>

              <p style={styles.subtitle}>
                Enter previous hospitalization information.
              </p>
            </div>
          </div>

          {error && <div style={styles.error}>⚠️ {error}</div>}

          <form onSubmit={analyzeReadmission}>
            <label style={styles.label}>Select Patient</label>

            <select style={styles.input} defaultValue="P004">
              <option value="P004">P004 - Bala</option>
              <option value="P001">P001 - Patient 1</option>
              <option value="P002">P002 - Patient 2</option>
              <option value="P003">P003 - Patient 3</option>
            </select>

            <div style={styles.grid}>
              <div>
                <label style={styles.label}>Age</label>

                <input
                  type="number"
                  name="age"
                  min="0"
                  max="120"
                  value={form.age}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>

              <div>
                <label style={styles.label}>
                  Previous Admissions
                </label>

                <input
                  type="number"
                  name="previous_admissions"
                  min="0"
                  value={form.previous_admissions}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>

              <div>
                <label style={styles.label}>Length of Stay</label>

                <input
                  type="number"
                  name="length_of_stay"
                  min="0"
                  value={form.length_of_stay}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>

              <div>
                <label style={styles.label}>
                  Chronic Conditions
                </label>

                <input
                  type="number"
                  name="chronic_conditions"
                  min="0"
                  value={form.chronic_conditions}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={analyzing}
              style={{
                ...styles.button,
                opacity: analyzing ? 0.7 : 1,
              }}
            >
              {analyzing
                ? "⏳ Analyzing..."
                : "🏥 Analyze Readmission Risk"}
            </button>
          </form>
        </div>

        <div style={styles.resultCard}>
          {!response ? (
            <>
              <div style={styles.largeIcon}>🏥</div>

              <h2 style={styles.resultTitle}>
                Readmission Result
              </h2>

              <p style={styles.resultText}>
                Complete the assessment to estimate
                <br />
                readmission risk.
              </p>
            </>
          ) : (
            <>
              <div style={styles.largeIcon}>📊</div>

              <h2 style={styles.resultTitle}>
                Readmission Result
              </h2>

              <div style={styles.resultBox}>
                <p style={styles.resultLabel}>Prediction</p>

                <h3
                  style={{
                    ...styles.prediction,
                    color:
                      predictionResult?.readmission_prediction === 1
                        ? "#d32f2f"
                        : "#1683ad",
                  }}
                >
                  {predictionResult?.readmission_prediction === 1
                    ? "High Readmission Risk"
                    : "Low Readmission Risk"}
                </h3>

                <div style={styles.detailRow}>
                  <span>Readmission Probability</span>

                  <strong>
                    {predictionResult?.readmission_probability ?? 0}%
                  </strong>
                </div>

                <div style={styles.detailRow}>
                  <span>Risk Score</span>

                  <strong>
                    {predictionResult?.risk_score ?? 0}
                  </strong>
                </div>

                <div style={styles.detailRow}>
                  <span>Risk Level</span>

                  <strong>
                    {predictionResult?.risk_level || "Unknown"}
                  </strong>
                </div>

                <div style={styles.recommendation}>
                  <strong>Recommendation</strong>

                  <p>
                    {predictionResult?.recommendation ||
                      "Continue clinical monitoring."}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f4f8fb",
    padding: "35px",
    boxSizing: "border-box",
  },

  container: {
    maxWidth: "1400px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "1.3fr 0.8fr",
    gap: "35px",
  },

  leftCard: {
    background: "#ffffff",
    borderRadius: "25px",
    padding: "40px",
    boxShadow: "0 8px 30px rgba(0,0,0,0.06)",
  },

  resultCard: {
    background: "#ffffff",
    borderRadius: "25px",
    padding: "40px",
    minHeight: "550px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 8px 30px rgba(0,0,0,0.06)",
  },

  header: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    marginBottom: "35px",
  },

  icon: {
    width: "65px",
    height: "65px",
    borderRadius: "20px",
    background: "#e9f8f7",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "32px",
  },

  largeIcon: {
    width: "110px",
    height: "110px",
    borderRadius: "35px",
    background: "#e9f8f7",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "55px",
    marginBottom: "25px",
  },

  title: {
    margin: 0,
    color: "#153b64",
    fontSize: "30px",
  },

  subtitle: {
    marginTop: "8px",
    color: "#7890aa",
    fontSize: "17px",
  },

  label: {
    display: "block",
    color: "#173d63",
    fontWeight: "700",
    marginBottom: "10px",
    marginTop: "20px",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "17px",
    border: "1px solid #d5e2ec",
    borderRadius: "14px",
    fontSize: "16px",
    color: "#173d63",
    background: "#ffffff",
    outline: "none",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    columnGap: "25px",
  },

  button: {
    width: "100%",
    marginTop: "35px",
    padding: "18px",
    border: "none",
    borderRadius: "14px",
    background: "#1683ad",
    color: "#ffffff",
    fontSize: "17px",
    fontWeight: "700",
    cursor: "pointer",
  },

  resultTitle: {
    color: "#153b64",
    fontSize: "30px",
    margin: "0 0 15px",
    textAlign: "center",
  },

  resultText: {
    color: "#7890aa",
    fontSize: "17px",
    textAlign: "center",
    lineHeight: "1.7",
  },

  error: {
    background: "#fff0f0",
    border: "1px solid #ffbaba",
    color: "#c62828",
    padding: "15px",
    borderRadius: "12px",
    marginBottom: "20px",
  },

  resultBox: {
    width: "100%",
    background: "#f7fbfd",
    borderRadius: "18px",
    padding: "25px",
    boxSizing: "border-box",
  },

  resultLabel: {
    color: "#7890aa",
    margin: 0,
  },

  prediction: {
    fontSize: "24px",
    margin: "10px 0 25px",
  },

  detailRow: {
    display: "flex",
    justifyContent: "space-between",
    borderBottom: "1px solid #dce8ef",
    padding: "13px 0",
    color: "#173d63",
    gap: "20px",
  },

  recommendation: {
    marginTop: "20px",
    padding: "15px",
    background: "#e9f8f7",
    borderRadius: "12px",
    color: "#173d63",
  },
};