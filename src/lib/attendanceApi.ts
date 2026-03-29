import api from "./api";

export const attendanceApi = {
  // ================= GET (FILTER BY EMPLOYEE) =================
  get: (id: number | string) =>
    api.get("/attendance/", {
      params: {
        employee_id: id,
      },
    }),

  // ================= LIST (WITH FILTERS + PAGINATION) =================
  list: (params?: {
    page?: number;
    page_size?: number;
    search?: string;
    status?: string;
    start_date?: string;
    end_date?: string;
  }) => {
    return api.get("/attendance/", {
      params,
    });
  },
};