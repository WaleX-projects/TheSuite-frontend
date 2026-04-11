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
  
  
  dashboard:()=> api.get('/attendance/dashboard/'),
  
};


export const holidayApi = {
  // ================= GET ALL HOLIDAYS =================
  list: () => api.get("/holidays/"),

  // ================= GET BY FILTER =================
  get: (params?: { year?: number }) =>
    api.get("/holidays/", {
      params: {
        ...(params?.year && { year: params.year }),
      },
    }),

  // ================= CREATE HOLIDAY =================
  create: (data: {
    name: string;
    date: string;
    is_global?: boolean;
  }) => api.post("/holidays/", data),

  // ================= UPDATE HOLIDAY =================
  update: (id: number | string, data: any) =>
    api.put(`/holidays/${id}/`, data),

  // ================= PARTIAL UPDATE =================
  patch: (id: number | string, data: any) =>
    api.patch(`/holidays/${id}/`, data),

  // ================= DELETE HOLIDAY =================
  delete: (id: number | string) =>
    api.delete(`/holidays/${id}/`),
};