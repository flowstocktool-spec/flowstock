import StockUpload from "@/components/StockUpload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Calendar } from "lucide-react";

// Mock data - todo: remove mock functionality
const recentUploads = [
  { id: '1', filename: 'amazon_stock_report_2024_01_15.csv', uploadedAt: '2024-01-15 09:30', processed: true },
  { id: '2', filename: 'shopify_inventory_2024_01_14.xlsx', uploadedAt: '2024-01-14 14:22', processed: true },
  { id: '3', filename: 'ebay_stock_levels_2024_01_13.csv', uploadedAt: '2024-01-13 16:45', processed: true },
];

export default function UploadPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold" data-testid="heading-upload">Stock Reports</h1>
        <p className="text-muted-foreground">Upload and manage your inventory reports</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <StockUpload />
        </div>

        <div>
          <Card data-testid="card-recent-uploads">
            <CardHeader>
              <CardTitle>Recent Uploads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentUploads.map((upload) => (
                  <div 
                    key={upload.id} 
                    className="flex items-center gap-3 p-3 border rounded-md hover-elevate"
                    data-testid={`item-upload-${upload.id}`}
                  >
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{upload.filename}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {upload.uploadedAt}
                      </div>
                    </div>
                    {upload.processed && (
                      <div className="text-sm text-chart-1 font-medium">Processed</div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}