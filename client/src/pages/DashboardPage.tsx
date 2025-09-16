import Dashboard from "@/components/Dashboard";

export default function DashboardPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold" data-testid="heading-dashboard">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your inventory and recent activity</p>
      </div>
      <Dashboard />
    </div>
  );
}