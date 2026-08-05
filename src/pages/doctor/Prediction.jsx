import { useState } from "react";

import DoctorLayout from "../../layouts/DoctorLayout";
import "../../styles/prediction.css";

function Prediction() {

    const [patient, setPatient] = useState("");
    const [age, setAge] = useState("");
    const [bp, setBp] = useState("");
    const [heartRate, setHeartRate] = useState("");
    const [disease, setDisease] = useState("");

    const [result, setResult] = useState(null);

    const handlePrediction = () => {

        let risk = "Low";
        let probability = "25%";
        let color = "green";
        let recommendation = "Regular check-up.";

        if (
            age > 60 ||
            bp > 140 ||
            heartRate > 100
        ) {

            risk = "High";
            probability = "89%";
            color = "red";
            recommendation =
                "Immediate observation and follow-up required.";

        }

        else if (
            age > 45 ||
            bp > 120
        ) {

            risk = "Medium";
            probability = "58%";
            color = "orange";
            recommendation =
                "Monitor patient regularly.";

        }

        setResult({

            risk,
            probability,
            color,
            recommendation

        });

    };

    return (

        <DoctorLayout>

            <div className="prediction-page">

                <h1>

                    AI Risk Prediction

                </h1>

                <div className="prediction-form">

                    <select
                        value={patient}
                        onChange={(e) =>
                            setPatient(e.target.value)
                        }
                    >

                        <option value="">

                            Select Patient

                        </option>

                        <option>

                            Rahul Kumar

                        </option>

                        <option>

                            Priya Sharma

                        </option>

                        <option>

                            Arun Raj

                        </option>

                    </select>

                    <input
                        type="number"
                        placeholder="Age"
                        value={age}
                        onChange={(e) =>
                            setAge(e.target.value)
                        }
                    />

                    <input
                        type="number"
                        placeholder="Blood Pressure"
                        value={bp}
                        onChange={(e) =>
                            setBp(e.target.value)
                        }
                    />

                    <input
                        type="number"
                        placeholder="Heart Rate"
                        value={heartRate}
                        onChange={(e) =>
                            setHeartRate(e.target.value)
                        }
                    />

                    <input
                        type="text"
                        placeholder="Disease"
                        value={disease}
                        onChange={(e) =>
                            setDisease(e.target.value)
                        }
                    />

                    <button
                        onClick={handlePrediction}
                    >

                        Predict Risk

                    </button>
                                        {result && (

                        <div className="result-card">

                            <h2>

                                Prediction Result

                            </h2>

                            <h3
                                style={{
                                    color: result.color
                                }}
                            >

                                {result.risk} RISK

                            </h3>

                            <p>

                                <strong>

                                    Probability :

                                </strong>

                                {result.probability}

                            </p>

                            <p>

                                <strong>

                                    Recommendation :

                                </strong>

                            </p>

                            <p>

                                {result.recommendation}

                            </p>

                        </div>

                    )}

                </div>

            </div>

        </DoctorLayout>

    );

}

export default Prediction;