import Dashboard from "@/components/Dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold" data-testid="heading-dashboard">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your inventory and recent activity</p>

        {/* Dashboard User Guide */}
        <Card className="mt-4 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <BookOpen className="h-5 w-5" />
              Dashboard Overview Guide
            </CardTitle>
          </CardHeader>
          <CardContent className="text-blue-700 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h4 className="font-semibold">Quick Health Check:</h4>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li><strong>Green Numbers:</strong> Everything running smoothly</li>
                  <li><strong>Orange Numbers:</strong> Need attention soon</li>
                  <li><strong>Red Numbers:</strong> Urgent action required</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold">Daily Routine:</h4>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li><strong>Check Low Stock:</strong> Address orange alerts first</li>
                  <li><strong>Review Alerts:</strong> See what was sent to suppliers</li>
                  <li><strong>Upload Reports:</strong> Update with latest inventory</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold">Next Steps:</h4>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li><strong>High Low Stock:</strong> Upload new inventory data</li>
                  <li><strong>Zero Suppliers:</strong> Add supplier contacts first</li>
                  <li><strong>No Products:</strong> Import or add products</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <Dashboard />
    </div>
  );
}