import api from "./api";

export const payrollApi = {
  // Get all payroll runs
  list: () => api.get("/payrolls/"),

  // Get single payroll (with payslips)
  get: (id: string) => api.get(`/payrolls/${id}/`),

  // Run payroll (IMPORTANT one)
  run: (data: { company: string; month: number; year: number }) =>
    api.post("/payrolls/run/", data),
    
  
  process: (id: string) =>
    api.post(`/payrolls/${id}/process/`),

  markPaid: (id: string) =>
    api.post(`/payrolls/${id}/mark_paid/`),

  exportCsv: (id: string) =>
    api.get(`/payrolls/${id}/export_csv/`, {
      responseType: "blob",
    }),
    
    };