import api from "./api";

export const leaveApi = {
  list: () => api.get("/leave/"),
  create: (data: { employee_id: number; start_date: string; end_date: string; reason: string }) =>
    api.post("/leave/", data),
  update: (id: number, status: string) => api.put(`/leave/${id}/`, { status }),
};
