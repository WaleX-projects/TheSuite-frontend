import api from "./api";

export const companiesApi = {
  list: () => api.get("/company/"),
  get: (id: string) => api.get(`/company/${id}/`),
  create: (data: any) => api.post("/company/", data),
  update: (id: string, data: any) => api.put(`/company/${id}/`, data),
  delete: (id: string) => api.delete(`/company/${id}/`),
  listSettings:(id:string) =>api.get(`/company/settings/`),
  settings: ()=> api.put(`/company/settings/`)
};
