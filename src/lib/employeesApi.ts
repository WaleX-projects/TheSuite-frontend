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

  update: (id: string, data: any) =>
    api.put(`/employees/${id}/`, data),

  deactivate: (id: string) =>
    api.patch(`/employees/${id}/deactivate/`),
    activate: (id: string) =>
    api.patch(`/employees/${id}/activate/`),

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
    
   // In your API.ts
bulkCreate: (formData: FormData) =>
  api.post("/bulk/", formData, {
    headers: {
      // Set to undefined so the browser can auto-detect and add the boundary
      "Content-Type": undefined, 
    },
  }),

};


export const departmentApi = {
  list: () => api.get("/department/"),
  create: (data: { name: string }) =>
    api.post("/department/", data),
    
   delete: ( id: string ) =>
    api.delete(`/department/${id}/`),
    
   update :(id:string, data: { name: string }) =>
    api.patch(`/department/${id}/`, data),
};

export const positionApi = {
    get: (department_id: string) =>
    api.get(`/position/?department_id=${department_id}`),
  
  list: () => api.get("/position/"),
  create: (data: any) =>
  api.post("/position/", data),
  update: (id:string, payload)=> api.put(`/position/${id}/`,payload),
  delete:(id:string)=>api.delete(`/position/${id}/`)
};