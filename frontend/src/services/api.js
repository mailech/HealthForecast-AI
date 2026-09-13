const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("VITE_API_BASE_URL is not configured.");
}

/* ---------------- Authentication ---------------- */

const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token");

  return token
    ? {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      }
    : {
        "Content-Type": "application/json",
      };
};

const handleResponse = async (response) => {
  let data;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message =
      typeof data?.detail === "string"
        ? data.detail
        : "Something went wrong";

    throw new Error(message);
  }

  return data;
};

export const loginUser = async (email, password) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  const data = await handleResponse(response);

  localStorage.setItem("access_token", data.access_token);
  localStorage.setItem("user", JSON.stringify(data.user));

  return data;
};

export const logoutUser = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("user");
};

export const getCurrentUser = () => {
  const user = localStorage.getItem("user");

  if (!user) {
    return null;
  }

  try {
    return JSON.parse(user);
  } catch {
    localStorage.removeItem("user");
    return null;
  }
};

export const getAccessToken = () => {
  return localStorage.getItem("access_token");
};

/* ---------------- Patient Management ---------------- */

export const getPatients = async () => {
  const response = await fetch(`${API_BASE_URL}/patients`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
};

/*
 * Researcher-only endpoint.
 * Returns anonymized patient information without
 * directly identifying information such as name,
 * phone number, or address.
 */
export const getAnonymizedPatients = async () => {
  const response = await fetch(
    `${API_BASE_URL}/patients/research/anonymized`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  return handleResponse(response);
};

export const getPatientById = async (patientId) => {
  const response = await fetch(
    `${API_BASE_URL}/patients/${patientId}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  return handleResponse(response);
};

export const createPatient = async (patientData) => {
  const response = await fetch(`${API_BASE_URL}/patients`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(patientData),
  });

  return handleResponse(response);
};

export const updatePatient = async (patientId, patientData) => {
  const response = await fetch(
    `${API_BASE_URL}/patients/${patientId}`,
    {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(patientData),
    }
  );

  return handleResponse(response);
};

export const deletePatient = async (patientId) => {
  const response = await fetch(
    `${API_BASE_URL}/patients/${patientId}`,
    {
      method: "DELETE",
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    return handleResponse(response);
  }

  return true;
};

/* ---------------- Medical History ---------------- */

export const getMedicalHistory = async (patientId) => {
  const response = await fetch(
    `${API_BASE_URL}/patients/${patientId}/medical-history`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  return handleResponse(response);
};

export const addMedicalHistory = async (
  patientId,
  historyData
) => {
  const response = await fetch(
    `${API_BASE_URL}/patients/${patientId}/medical-history`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(historyData),
    }
  );

  return handleResponse(response);
};

/* ---------------- Treatments ---------------- */

export const getTreatments = async (patientId) => {
  const response = await fetch(
    `${API_BASE_URL}/patients/${patientId}/treatments`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  return handleResponse(response);
};

export const addTreatment = async (
  patientId,
  treatmentData
) => {
  const response = await fetch(
    `${API_BASE_URL}/patients/${patientId}/treatments`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(treatmentData),
    }
  );

  return handleResponse(response);
};

/* ---------------- Admissions ---------------- */

export const getAdmissions = async (patientId) => {
  const response = await fetch(
    `${API_BASE_URL}/patients/${patientId}/admissions`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  return handleResponse(response);
};

export const addAdmission = async (
  patientId,
  admissionData
) => {
  const response = await fetch(
    `${API_BASE_URL}/patients/${patientId}/admissions`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(admissionData),
    }
  );

  return handleResponse(response);
};

/* ---------------- ML Readmission Prediction ---------------- */

export const predictReadmission = async (patientData) => {
  const response = await fetch(
    `${API_BASE_URL}/predictions/readmission`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        patient_data: patientData,
      }),
    }
  );

  return handleResponse(response);
};

/* ---------------- Health Check ---------------- */

export const checkBackendHealth = async () => {
  const response = await fetch(
    `${API_BASE_URL}/health`
  );

  return handleResponse(response);
};

export async function predictPatientReadmission(patientId) {
  const response = await fetch(
    `${API_BASE_URL}/predictions/readmission/${patientId}`,
    {
      method: "POST",
      headers: getAuthHeaders(),
    }
  );

  return handleResponse(response);
}

export const getPredictionAnalytics = async () => {
  const response = await fetch(
    `${API_BASE_URL}/predictions/analytics`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  return handleResponse(response);
};


export async function getTreatmentEffectiveness() {
  const response = await fetch(
    `${API_BASE_URL}/treatments/effectiveness`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  return handleResponse(response);
}