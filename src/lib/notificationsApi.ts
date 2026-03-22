import api from "./api";

export const notificationsApi = {
  list: () => api.get("/notifications/"),
  create: (data: { employee: number; message: string; type: string }) =>
    api.post("/notifications/", data),
  markRead: (id: number) => api.put(`/notifications/${id}/`, { read: true }),
};
