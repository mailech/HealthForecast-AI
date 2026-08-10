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