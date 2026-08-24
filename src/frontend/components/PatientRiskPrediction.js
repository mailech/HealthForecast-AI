import React, { useState, useEffect } from 'react';
import axios from 'axios';

function PatientRiskPrediction() {
    const [patientData, setPatientData] = useState({});
    const [prediction, setPrediction] = useState(null);

    const handlePredict = async () => {
        try {
            const response = await axios.post('/api/patientRiskPrediction/predict', patientData);
            setPrediction(response.data.prediction);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div>
            <h1>Patient Risk Prediction</h1>
            <button onClick={handlePredict}>Predict</button>
            {prediction && <p>Prediction: {prediction}</p>}
        </div>
    );
}

export default PatientRiskPrediction;