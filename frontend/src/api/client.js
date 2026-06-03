import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000",
  timeout: 8000
});

export const fetchRecords = () => api.get("/api/records");
export const createRecord = (data) => api.post("/api/records", data);
export const updateRecord = (id, data) => api.put(`/api/records/${id}`, data);
export const deleteRecord = (id) => api.delete(`/api/records/${id}`);

export const fetchSettings = () => api.get("/api/settings");
export const updateSettings = (settings) => api.put("/api/settings", settings);

export default api;
