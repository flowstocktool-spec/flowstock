import { Switch, Route } from "wouter";
import { Suspense, lazy } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import ThemeToggle from "@/components/ThemeToggle";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";

// Lazy load all page components
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const ProductsPage = lazy(() => import("@/pages/ProductsPage"));
const SuppliersPage = lazy(() => import("@/pages/SuppliersPage"));
const UploadPage = lazy(() => import("@/pages/UploadPage"));
const AlertsPage = lazy(() => import("@/pages/AlertsPage"));
const UserGuidePage = lazy(() => import("@/pages/UserGuidePage"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));
const NotFound = lazy(() => import("@/pages/not-found"));

// Authentication pages
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/RegisterPage"));
const ForgotPasswordPage = lazy(() => import("@/pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("@/pages/ResetPasswordPage"));

function AuthenticatedRouter() {
  return (
    <Suspense fallback={<div className="p-6 text-center" data-testid="status-loading-app">Loading...</div>}>
      <Switch>
        <Route path="/" component={DashboardPage} />
        <Route path="/products" component={ProductsPage} />
        <Route path="/suppliers" component={SuppliersPage} />
        <Route path="/upload" component={UploadPage} />
        <Route path="/alerts" component={AlertsPage} />
        <Route path="/guide" component={UserGuidePage} />
        <Route path="/settings" component={SettingsPage} />
        <Route component={DashboardPage} /> {/* Default to dashboard for authenticated users */}
      </Switch>
    </Suspense>
  );
}

function UnauthenticatedRouter() {
  return (
    <Suspense fallback={<div className="p-6 text-center" data-testid="status-loading-auth">Loading...</div>}>
      <Switch>
        <Route path="/login" component={LoginPage} />
        <Route path="/register" component={RegisterPage} />
        <Route path="/forgot-password" component={ForgotPasswordPage} />
        <Route path="/reset-password" component={ResetPasswordPage} />
        <Route component={LoginPage} /> {/* Default to login for unauthenticated users */}
      </Switch>
    </Suspense>
  );
}

function AuthenticatedLayout() {
  const { user, logout } = useAuth();
  
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <TooltipProvider>
      <SidebarProvider style={style as React.CSSProperties}>
        <div className="flex h-screen w-full">
          <AppSidebar />
          <div className="flex flex-col flex-1">
            <header className="flex items-center justify-between p-4 border-b bg-background">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <div className="flex items-center gap-4">
                <span className="text-lg font-semibold">StockAlert Pro</span>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span data-testid="text-current-user">{user?.username}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={logout}
                    data-testid="button-logout"
                  >
                    <LogOut className="h-4 w-4 mr-1" />
                    Logout
                  </Button>
                  <ThemeToggle />
                </div>
              </div>
            </header>
            <main className="flex-1 overflow-auto bg-background">
              <AuthenticatedRouter />
            </main>
          </div>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
}

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground" data-testid="status-loading-auth">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <AuthenticatedLayout />;
  }

  return <UnauthenticatedRouter />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}