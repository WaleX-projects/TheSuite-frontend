import api from "./api";

export const authApi = {
  login: (email: string, password: string) =>
    api.post("/accounts/login/", { email, password }),
  register: (data: {
    email: string; password: string; first_name: string; last_name: string; phone: string;
    company_data: { name: string; address: string; industry?: string; country: string; timezone: string };
  }) => api.post("/accounts/register/", data),
  getProfile: () => api.get("/accounts/profile/"),
  resetPasswordRequest: (email: string) =>
    api.post("/accounts/reset-password-request/", { email }),
  resetPassword: (token: string, password: string) =>
    api.post(`/accounts/reset-password/${token}/`, { password }),
};
