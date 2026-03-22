import api from "./api";

export const attendanceApi = {
  list: () => api.get("/attendance/"),
};
