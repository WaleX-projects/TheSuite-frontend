/*import api from "./api";

export const leaveApi = {
  list: () => api.get("/leave/"),
  create: (data: { employee_id: number; start_date: string; end_date: string; reason: string }) =>
    api.post("/leave/", data),
  update: (id: number, status: string) => api.put(`/leave/${id}/`, { status }),
  listleavetype:()=> api.get("/leave-types/"),
  summary:()=> api.get(`/leave/${id}/summary/`)
};
*/
import api from "./api";

export interface LeaveRequest {
  id: string; // UUID
  employee: number | string;
  employee_name?: string;
  leave_type: string; // UUID
  leave_type_name?: string;
  start_date: string;
  end_date: string;
  status: "pending" | "approved" | "rejected";
  reason: string;
  days?: number;
  created_at?: string;
}

export interface LeaveType {
  id: string; // UUID
  name: string;
  days_allowed: number;
}

export const leaveApi = {
  list: (params?: { page?: number; search?: string; status?: string; employee?: string }) =>
    api.get("/leave/", { params }),

  create: (data: {
    employee: number | string;
    leave_type: string; // UUID
    start_date: string;
    end_date: string;
    reason: string;
  }) => api.post<LeaveRequest>("/leave/", data),

  updateStatus: (id: string, status: "approved" | "rejected") =>
    api.put(`/leave/${id}/`, { status }),

  listLeaveTypes: () => api.get<LeaveType[]>("/leave-types/"),

  // Optional: Summary (per employee or overall - adjust endpoint as needed)
  summary: (employeeId?: string) =>
    api.get(`/leave/summary/${employeeId ? employeeId + "/" : ""}`),
};