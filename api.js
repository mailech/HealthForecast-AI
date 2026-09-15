import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000",
});

export const predictHeartDisease = async (token, data) => {
  const response = await API.post(
    `/health/predict?token=${token}`,
    data
  );

  return response.data;
};

export default API;