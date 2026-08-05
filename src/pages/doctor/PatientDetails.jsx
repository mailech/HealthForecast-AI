import DoctorLayout from "../../layouts/DoctorLayout";
import "../../styles/patient-details.css";

function PatientDetails() {

    return (

        <DoctorLayout>

            <div className="patient-details">

                <div className="profile-card">

                    <img
                        src="https://i.pravatar.cc/150?img=12"
                        alt="Patient"
                    />

                    <div>

                        <h1>Rahul Kumar</h1>

                        <p>Patient ID : P001</p>

                        <p>Age : 56</p>

                        <p>Gender : Male</p>

                        <p>Blood Group : B+</p>

                    </div>

                </div>

                <div className="details-grid">
                                        <div className="detail-card">

                        <h2>Medical History</h2>

                        <ul>

                            <li>Heart Disease</li>

                            <li>Hypertension</li>

                            <li>Diabetes</li>

                        </ul>

                    </div>

                    <div className="detail-card">

                        <h2>Vital Signs</h2>

                        <p>Blood Pressure : 140 / 90</p>

                        <p>Heart Rate : 82 bpm</p>

                        <p>Temperature : 98.4 °F</p>

                        <p>Respiration : 18 bpm</p>

                    </div>

                    <div className="detail-card">

                        <h2>Current Medicines</h2>

                        <ul>

                            <li>Aspirin</li>

                            <li>Metformin</li>

                            <li>Atorvastatin</li>

                        </ul>

                    </div>

                    <div className="detail-card">

                        <h2>Lab Results</h2>

                        <p>Glucose : 145 mg/dL</p>

                        <p>Cholesterol : 210 mg/dL</p>

                        <p>BMI : 29</p>

                    </div>
                                        <div className="prediction-card">

                        <h2>AI Readmission Prediction</h2>

                        <h1>HIGH RISK</h1>

                        <h3>89%</h3>

                        <p>

                            Estimated probability of hospital readmission.

                        </p>

                    </div>

                    <div className="recommendation-card">

                        <h2>AI Recommendation</h2>

                        <ul>

                            <li>Weekly follow-up required</li>

                            <li>Monitor blood pressure daily</li>

                            <li>Maintain diabetic diet</li>

                            <li>Review medication every 2 weeks</li>

                        </ul>

                    </div>

                </div>

            </div>

        </DoctorLayout>

    );

}

export default PatientDetails;