import api from "./api";

export const employeesApi = {
  // 🔥 UPDATED LIST (supports everything)
  list: (params?: {
    search?: string;
    department?: string;
    position?: string;
    page?: number;
    page_size?: number;
  }) =>
    api.get("/employees/", {
      params: {
        ...(params?.search && { search: params.search }),
        ...(params?.department && { department: params.department }),
        ...(params?.position && { position: params.position }),
        ...(params?.page && { page: params.page }),
        ...(params?.page_size && { page_size: params.page_size }),
      },
    }),

  get: (id: number) => api.get(`/employees/${id}/`),

  create: (data: any) => api.post("/employees/", data),

  update: (id: number, data: any) =>
    api.put(`/employees/${id}/`, data),

  deactivate: (id: string) =>
    api.patch(`/employees/${id}/deactivate/`),

  listEmployeepayslip: (employeeId: string) =>
    api.get(`/employees/${employeeId}/payslips/`),

  resolveAccount: ({
    bank_code,
    account_number,
  }: {
    bank_code: string;
    account_number: string;
  }) =>
    api.get("/employees/resolve-account/", {
      params: { bank_code, account_number },
    }),
};


export const departmentApi = {
  list: () => api.get("/department/"),
  create: (data: { name: string }) =>
    api.post("/department/", data),
};

export const positionApi = {
    get: (department_id: string) =>
    api.get(`/position/?department_id=${department_id}`),
  
  list: () => api.get("/position/"),
  create: (data: { title: string; department_id: string }) =>
    api.post("/position/", data),
};