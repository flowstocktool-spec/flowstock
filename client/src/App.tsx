import { Switch, Route } from "wouter";
import { Suspense, lazy } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import ThemeToggle from "@/components/ThemeToggle";

// Lazy load all page components
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const ProductsPage = lazy(() => import("@/pages/ProductsPage"));
const SuppliersPage = lazy(() => import("@/pages/SuppliersPage"));
const UploadPage = lazy(() => import("@/pages/UploadPage"));
const AlertsPage = lazy(() => import("@/pages/AlertsPage"));
const UserGuidePage = lazy(() => import("@/pages/UserGuidePage"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));
const NotFound = lazy(() => import("@/pages/not-found"));

function Router() {
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
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

export default function App() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SidebarProvider style={style as React.CSSProperties}>
          <div className="flex h-screen w-full">
            <AppSidebar />
            <div className="flex flex-col flex-1">
              <header className="flex items-center justify-between p-4 border-b bg-background">
                <SidebarTrigger data-testid="button-sidebar-toggle" />
                <div className="flex items-center gap-4">
                  <span className="text-lg font-semibold">StockAlert Pro</span>
                  <ThemeToggle />
                </div>
              </header>
              <main className="flex-1 overflow-auto bg-background">
                <Router />
              </main>
            </div>
          </div>
        </SidebarProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}