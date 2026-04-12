// src/api/settings.ts
import api from "./api";
export const settingsApi = {
  // 🔹 GET
  getGeneral: () => api.get("/settings/general/"),
  getAttendance: () => api.get("/settings/attendance/"),
  getPayroll: () => api.get("/settings/payroll/"),
  getWorkLocation: () => api.get("/settings/work-location/"),

  // 🔹 PATCH
  updateGeneral: (data: any) =>
    api.patch("/settings/general/", data),

  updateAttendance: (data: any) =>
    api.patch("/settings/attendance/", data),

  updatePayroll: (data: any) =>
    api.patch("/settings/payroll/", data),

  updateWorkLocation: (data: any) =>
    api.patch("/settings/work-location/", data),
};