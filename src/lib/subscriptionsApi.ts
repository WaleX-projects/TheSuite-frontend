import api from "./api";

export const subscriptionsApi = {
  list: () => api.get("/subscriptions/"),
  create: (data: { company: number; plan: string; status: string }) =>
    api.post("/subscriptions/", data),
  update: (id: number, data: any) => api.put(`/subscriptions/${id}/`, data),
  delete: (id: number) => api.delete(`/subscriptions/${id}/`),
};
