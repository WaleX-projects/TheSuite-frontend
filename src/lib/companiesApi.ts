import api from "./api";

export const companiesApi = {
  list: () => api.get("/companies/"),
  get: (id: number) => api.get(`/companies/${id}/`),
  create: (data: any) => api.post("/companies/", data),
  update: (id: number, data: any) => api.put(`/companies/${id}/`, data),
  delete: (id: number) => api.delete(`/companies/${id}/`),
};
