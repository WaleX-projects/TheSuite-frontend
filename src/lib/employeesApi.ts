import api from "./api";

export const employeesApi = {
  list: (search?: string) => api.get("/employees/", { params: search ? { search } : {} }),
  get: (id: number) => api.get(`/employees/${id}/`),
  create: (data: any) => api.post("/employees/", data),
  update: (id: number, data: any) => api.put(`/employees/${id}/`, data),
  deactivate: (id: number) => api.delete(`/employees/${id}/deactivate`),
  listEmployeepayslip: (employeeId: string) =>
    api.get(`/employees/${employeeId}/payslips/`),
    
};

export const departmentListApi = {
  list: () => api.get("/department/"),
};

export const positionListApi = {
  get: (department_id: string) =>
    api.get(`/position/?department_id=${department_id}`),
};