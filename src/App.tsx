import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import DashboardPage from "@/pages/DashboardPage";
import ProfilePage from "@/pages/ProfilePage";
import CompaniesPage from "@/pages/CompaniesPage";
import EmployeesPage from "@/pages/EmployeesPage";
import EmployeeDetailPage from "@/pages/EmployeeDetailPage";
import AttendancePage from "@/pages/AttendancePage";
import HolidayPage from "@/pages/HolidayPage"
import LeavePage from "@/pages/LeavePage";
import LeaveBalance from "@/pages/LeaveBalance"
import LeavePolicies from "@/pages/LeavePolicies";
import PayrollPage from "@/pages/PayrollPage";
import PayslipPage from "@/pages/Payslip";
import PayrollInputsPage from "@/pages/PayrollInput";
import SalaryComponentPage from "@/pages/SalaryComponentPage";
import SubscriptionsPage from "@/pages/SubscriptionsPage";
import PayrollSettingsPage from "@/pages/PayrollSettings";
import NotificationsPage from "@/pages/NotificationsPage";
import NotFound from "@/pages/NotFound";
import PayrollDetailPage from "@/pages/PayrollDetailPage";
import VerificationPage from "@/pages/VerificationPage";
import OrganizationPage from "@/pages/OrganizationPage";
import SettingsPage from "@/pages/SettingsPage";
import PositionPage from "@/pages/PositionPage";
import PositionDetailPage from "@/pages/PositionDetailPage";
import PolicyPage from "@/pages/PolicyPage"
import AihelperPage from "@/pages/AihelperPage";
//import PolicyDetailPage from "@/pages/PolicyDetailPage"
import PayrollReportPage from "@/pages/PayrollReport";
import EmployeeSalaryOverridesPage from "@/pages/EmployeeSalaryOverridesPage";
const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <AppLayout>{children}</AppLayout>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/companies" element={<ProtectedRoute><CompaniesPage /></ProtectedRoute>} />
            <Route path="/employees" element={<ProtectedRoute><EmployeesPage /></ProtectedRoute>} />
            <Route path="/employees/:id" element={<ProtectedRoute><EmployeeDetailPage /></ProtectedRoute>} />
            <Route path="/attendance" element={<ProtectedRoute><AttendancePage /></ProtectedRoute>} />
            <Route path="/holidays" element={<ProtectedRoute><HolidayPage /></ProtectedRoute>} />
            
            <Route path="/leave" element={<ProtectedRoute><LeavePage /></ProtectedRoute>} />
            <Route path="/leave-balance" element={<ProtectedRoute><LeaveBalance /></ProtectedRoute>} />
                       
            <Route path="/leave-policy" element={<ProtectedRoute><LeavePolicies /></ProtectedRoute>} />
            <Route path="/payroll/runs" element={<ProtectedRoute><PayrollPage /></ProtectedRoute>} />
            <Route path="/payroll/:id" element={<ProtectedRoute><PayrollDetailPage /></ProtectedRoute>} />
            <Route path="/payroll/inputs" element={<ProtectedRoute><PayrollInputsPage /></ProtectedRoute>} />
                        <Route path="/payroll/payslips" element={<ProtectedRoute><PayslipPage /></ProtectedRoute>} />
                           <Route path="/payroll/components" element={<ProtectedRoute><SalaryComponentPage /></ProtectedRoute>} />
                              <Route path="/payroll/employee-overrides" element={<ProtectedRoute><EmployeeSalaryOverridesPage /></ProtectedRoute>} />
                              
                          <Route path="/payroll/settings" element={<ProtectedRoute><PayrollSettingsPage /></ProtectedRoute>} />
                              <Route path="/reports/payroll" element={<ProtectedRoute><PayrollReportPage /></ProtectedRoute>} />
      
       
            <Route path="/verify-account/:token" element={<VerificationPage />} />
            
            
            <Route path="/ai" element={<ProtectedRoute><AihelperPage /></ProtectedRoute>} />
        
            <Route path="/departments" element={<ProtectedRoute><OrganizationPage /></ProtectedRoute>} />
            <Route path="/:dept_name/position/:id/" element={<ProtectedRoute><PositionPage /></ProtectedRoute>} />
                  <Route path="/position-detail/:id" element={<ProtectedRoute><PositionDetailPage /></ProtectedRoute>} />
                  <Route path="/policies" element={<ProtectedRoute><PolicyPage /></ProtectedRoute>} />
                  <Route path="/policies/:id" element={<ProtectedRoute><PolicyPage /></ProtectedRoute>} />
               
              <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            <Route path="/subscriptions" element={<ProtectedRoute><SubscriptionsPage /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
