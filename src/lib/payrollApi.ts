import api from "./api";

export const payrollApi = {
  list: () => api.get("/payroll/"),
  create: (data: { employee_id: number; amount: number; date: string }) =>
    api.post("/payroll/", data),
};
