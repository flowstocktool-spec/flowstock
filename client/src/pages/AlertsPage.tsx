import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Clock, CheckCircle, BookOpen } from "lucide-react";

// Mock data - todo: remove mock functionality
const recentAlerts = [
  {
    id: '1',
    productName: 'Wireless Headphones',
    sku: 'WH-001',
    supplierName: 'TechCorp',
    supplierEmail: 'orders@techcorp.com',
    sentAt: '2024-01-15 10:30',
    status: 'sent'
  },
  {
    id: '2',
    productName: 'Bluetooth Speaker',
    sku: 'BS-002',
    supplierName: 'AudioPlus',
    supplierEmail: 'supply@audioplus.com',
    sentAt: '2024-01-15 09:15',
    status: 'sent'
  },
  {
    id: '3',
    productName: 'Phone Case',
    sku: 'PC-003',
    supplierName: 'CaseMaster',
    supplierEmail: 'business@casemaster.com',
    sentAt: '2024-01-14 16:45',
    status: 'sent'
  },
];

const alertStats = {
  todayCount: 5,
  weekCount: 23,
  monthCount: 89,
  totalSent: 456,
};

export default function AlertsPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold" data-testid="heading-alerts">Alerts</h1>
        <p className="text-muted-foreground">Track notifications sent to suppliers</p>

        {/* Alerts User Guide */}
        <Card className="mt-4 bg-orange-50 border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <BookOpen className="h-5 w-5" />
              Understanding Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="text-orange-700 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold">Automatic Triggers:</h4>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li><strong>Low Stock:</strong> When stock hits minimum quantity</li>
                  <li><strong>Out of Stock:</strong> When inventory reaches zero</li>
                  <li><strong>Upload Processing:</strong> During CSV file imports</li>
                  <li><strong>Real-time:</strong> Sent immediately when triggered</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold">Monitoring Tips:</h4>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li><strong>Daily Check:</strong> Review "Today" count each morning</li>
                  <li><strong>Follow Up:</strong> Contact suppliers who receive multiple alerts</li>
                  <li><strong>Adjust Thresholds:</strong> Modify minimum quantities if too many alerts</li>
                  <li><strong>Email Setup:</strong> Ensure Settings → Email is configured</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alert Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-alerts-today">{alertStats.todayCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-alerts-week">{alertStats.weekCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-alerts-month">{alertStats.monthCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
            <CheckCircle className="h-4 w-4 text-chart-1" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-alerts-total">{alertStats.totalSent}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Alerts */}
      <Card data-testid="card-recent-alerts">
        <CardHeader>
          <CardTitle>Recent Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentAlerts.map((alert) => (
              <div 
                key={alert.id} 
                className="flex items-center justify-between p-4 border rounded-md hover-elevate"
                data-testid={`item-alert-${alert.id}`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{alert.productName}</h4>
                    <Badge variant="outline">{alert.sku}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Sent to <strong>{alert.supplierName}</strong> ({alert.supplierEmail})
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{alert.sentAt}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="default">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Sent
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}