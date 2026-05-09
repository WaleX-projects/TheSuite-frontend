import api from "./api"; // your axios instance

export const subscriptionsApi = {
  // 📦 Get current subscription
  get: () => api.get("/subscription/"),

  // 🆕 Create subscription (trial or first time)
  create: (data: { company: number; plan: number }) =>
    api.post("/subscription/create/", data),

  // 🔼 Upgrade subscription
  upgrade: (data: { plan_id: number; interval: string }) =>
    api.post("/subscription/upgrade/", data),

  // 💰 List all plans (pricing page)
  listPlans: () => api.get("/plans/"),
};