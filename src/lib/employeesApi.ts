import api from "./api";

export const employeesApi = {
  list: (search?: string) => api.get("/employees/", { params: search ? { search } : {} }),
  get: (id: number) => api.get(`/employees/${id}/`),
  create: (data: any) => api.post("/employees/", data),
  update: (id: number, data: any) => api.put(`/employees/${id}/`, data),
  deactivate: (id: number) => api.delete(`/employees/${id}/deactivate`),
};
