import api from "./api";

export const settingsApi = {
  // ==================== COMPANY ====================
  getCompany: () => api.get("/companies/settings/"),

  updateCompany: (data: {
    company_name: string;
    timezone: string;
    date_format: string;
    currency: string;
  }) => api.patch("/companies/settings/", data),

  // ==================== ATTENDANCE ====================
  getAttendance: () => api.get("/companies/attendance/settings/"),

  updateAttendance: (data: {
    work_hours_per_day: number;
    allow_late_arrival: boolean;
    late_arrival_grace_minutes: number;
    require_face_verification: boolean;
    geo_fencing_enabled: boolean;
  }) => api.patch("/companies/attendance/settings/", data),

  // ==================== PAYROLL ====================
  getPayroll: () => api.get("/companies/payroll/settings/"),

  updatePayroll: (data: {
    payroll_day: number;
    tax_rate: number;
    allow_manual_payslip: boolean;
  }) => api.patch("/companies/payroll/settings/", data),

  // ==================== LEAVE ====================
  getLeave: () => api.get("/companies/leave/settings/"),

  updateLeave: (data: {
    default_annual_leave_days: number;
    default_sick_leave_days: number;
    carry_forward_enabled: boolean;
    max_carry_forward_days: number;
    leave_approval_required: boolean;
  }) => api.patch("/companies/leave/settings/", data),

  // ==================== SYSTEM ====================
  getSystem: () => api.get("/companies/system/settings/"),

  updateSystem: (data: {
    email_notifications_enabled: boolean;
    allow_self_registration: boolean;
    maintenance_mode: boolean;
    session_timeout_minutes: number;
  }) => api.patch("/companies/system/settings/", data),

  // ==================== WORK LOCATION ====================
  getWorkLocation: () => api.get("/companies/work-location/"),

  updateWorkLocation: (data: {
    name?: string;
    latitude: number;
    longitude: number;
    radius_meters: number;
    is_enabled?: boolean;
  }) => api.patch("/companies/work-location/", data),
};