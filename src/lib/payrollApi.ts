import api from "./api";

export const payrollApi = {
  // Get all payroll runs
  list: () => api.get("/payrolls/"),

  // Get single payroll (with payslips)
  get: (id: string) => api.get(`/payrolls/${id}/`),

  // Run payroll (IMPORTANT one)
  run: (data: { month: number; year: number }) =>
    api.post("/payrolls/run/", data),
    
    
    //important page calls
    
    listPayslips:()=>
        api.get("/employees/payslips/"),
    
  
  process: (id: string) =>
    api.post(`/payrolls/${id}/process/`),

  markPaid: (id: string) =>
    api.post(`/payrolls/${id}/mark_paid/`),

  exportCsv: (id: string) =>
    api.get(`/payrolls/${id}/export_excel/`, {
      responseType: "blob",
    }),
    
    };
    
    
    
export const salaryComponentsApi = {
  list: () => api.get('/salary-components/'),
  create: (data: any) => api.post('/salary-components/', data),
  update: (id: string, data: any) => api.patch(`/salary-components/${id}/`, data),
  delete: (id: string) => api.delete(`/salary-components/${id}/`),
};    


export const employeeSalaryOverridesApi = {
  list: () => api.get('/employee-salary-overrides/'),
  create: (data: any) => api.post('/employee-salary-overrides/', data),
  update: (id: string, data: any) => api.patch(`/employee-salary-overrides/${id}/`, data),
  delete: (id: string) => api.delete(`/employee-salary-overrides/${id}/`),
};