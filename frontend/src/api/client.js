const API_BASE_URL = "http://localhost:8000";

export async function login(email, password) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error("Login failed. Please check your email and password.");
  }

  return response.json();
}

export async function getPatients() {
  const token = localStorage.getItem("hf_token");
  const response = await fetch(`${API_BASE_URL}/patients/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to load patients.");
  }
  return response.json();
}

export async function predictRisk(data) {
  const token = localStorage.getItem("hf_token");
  const response = await fetch(`${API_BASE_URL}/risk/predict`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Failed to get risk prediction.");
  }
  return response.json();
}

export async function getTreatments() {
  const token = localStorage.getItem("hf_token");
  const response = await fetch(`${API_BASE_URL}/treatments/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to load treatments.");
  }
  return response.json();
}

export async function getRecommendation(riskCategory, diagnosis) {
  const token = localStorage.getItem("hf_token");
  const response = await fetch(`${API_BASE_URL}/decision-support/recommend`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ risk_category: riskCategory, diagnosis: diagnosis }),
  });
  if (!response.ok) {
    throw new Error("Failed to get care recommendation.");
  }
  return response.json();
}
export async function getAnalyticsSummary() {
  const token = localStorage.getItem("hf_token");
  const response = await fetch(`${API_BASE_URL}/analytics/summary`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to load analytics.");
  }
  return response.json();
}

export async function getModelInfo() {
  const token = localStorage.getItem("hf_token");
  const response = await fetch(`${API_BASE_URL}/model/info`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to load model info.");
  }
  return response.json();
}


export async function getPatientRecommendations() {
  const token = localStorage.getItem("hf_token");
  const response = await fetch(`${API_BASE_URL}/decision-support/patient-recommendations`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to load care recommendations.");
  }
  return response.json();
}

export async function getUsers() {
  const token = localStorage.getItem("hf_token");
  const response = await fetch(`${API_BASE_URL}/auth/users`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to load users.");
  }
  return response.json();
}

export async function createUser(fullName, email, password, role) {
  const token = localStorage.getItem("hf_token");
  const response = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ full_name: fullName, email, password, role }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to create user.");
  }
  return response.json();
}


export async function getDoctors() {
  const token = localStorage.getItem("hf_token");
  const response = await fetch(`${API_BASE_URL}/patients/doctors`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to load doctors.");
  }
  return response.json();
}

export async function createPatient(patientData) {
  const token = localStorage.getItem("hf_token");
  const response = await fetch(`${API_BASE_URL}/patients/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(patientData),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to create patient.");
  }
  return response.json();
}


export async function downloadPatientReport(patientId) {
  const token = localStorage.getItem("hf_token");
  const response = await fetch(`${API_BASE_URL}/patients/${patientId}/report`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to download report.");
  }
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `patient_${patientId}_report.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}