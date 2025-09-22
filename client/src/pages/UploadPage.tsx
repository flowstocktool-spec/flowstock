
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Calendar, CheckCircle, AlertCircle, TrendingUp, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Mock data - in production this would come from API
const recentUploads = [
  { 
    id: '1', 
    filename: 'amazon_stock_report_2024_01_15.csv', 
    uploadedAt: '2024-01-15 09:30', 
    processed: true,
    platform: 'Amazon',
    recordsProcessed: 150,
    alertsGenerated: 12
  },
  { 
    id: '2', 
    filename: 'shopify_inventory_2024_01_14.xlsx', 
    uploadedAt: '2024-01-14 14:22', 
    processed: true,
    platform: 'Shopify',
    recordsProcessed: 89,
    alertsGenerated: 5
  },
  { 
    id: '3', 
    filename: 'ebay_stock_levels_2024_01_13.csv', 
    uploadedAt: '2024-01-13 16:45', 
    processed: true,
    platform: 'eBay',
    recordsProcessed: 234,
    alertsGenerated: 18
  },
  { 
    id: '4', 
    filename: 'etsy_inventory_2024_01_12.xlsx', 
    uploadedAt: '2024-01-12 11:20', 
    processed: true,
    platform: 'Etsy',
    recordsProcessed: 67,
    alertsGenerated: 3
  },
];

const uploadStats = {
  totalUploads: 24,
  totalRecordsProcessed: 3456,
  totalAlertsGenerated: 145,
  lastUpload: '2024-01-15 09:30'
};

export default function UploadPage() {
  const handleNavigateToProducts = () => {
    window.location.href = '/products';
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold" data-testid="heading-upload">Stock Reports</h1>
        <p className="text-muted-foreground">View upload history and processing results</p>

        {/* Upload User Guide */}
        <Card className="mt-4 bg-indigo-50 border-indigo-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-800">
              <BookOpen className="h-5 w-5" />
              Stock Upload Guide
            </CardTitle>
          </CardHeader>
          <CardContent className="text-indigo-700 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold">File Requirements:</h4>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li><strong>Formats:</strong> CSV, Excel (.xlsx), TSV supported</li>
                  <li><strong>Required Columns:</strong> SKU/Handle and Stock/Quantity</li>
                  <li><strong>Optional:</strong> Product Name, Price for better matching</li>
                  <li><strong>Platform Detection:</strong> Auto-detects Amazon, Shopify, eBay, etc.</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold">Understanding Results:</h4>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li><strong>Records Processed:</strong> Successfully read from file</li>
                  <li><strong>Products Created:</strong> New items added to catalog</li>
                  <li><strong>Products Updated:</strong> Existing stock levels refreshed</li>
                  <li><strong>Alerts Generated:</strong> Automatic notifications sent</li>
                </ul>
              </div>
            </div>
            <div className="bg-indigo-100 p-3 rounded-lg mt-3">
              <p className="text-sm font-medium">💡 Pro Tip: Upload files regularly (daily/weekly) to keep stock levels current and ensure timely supplier alerts.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upload Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{uploadStats.totalUploads}</p>
                <p className="text-xs text-muted-foreground">Total Uploads</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{uploadStats.totalRecordsProcessed}</p>
                <p className="text-xs text-muted-foreground">Records Processed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{uploadStats.totalAlertsGenerated}</p>
                <p className="text-xs text-muted-foreground">Alerts Generated</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-bold">{uploadStats.lastUpload}</p>
                <p className="text-xs text-muted-foreground">Last Upload</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Uploads */}
        <div className="lg:col-span-2">
          <Card data-testid="card-recent-uploads">
            <CardHeader>
              <CardTitle>Recent Stock Report Uploads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentUploads.map((upload) => (
                  <div 
                    key={upload.id} 
                    className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    data-testid={`item-upload-${upload.id}`}
                  >
                    <div className="flex-shrink-0">
                      {upload.processed ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <FileText className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{upload.filename}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {upload.uploadedAt}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {upload.platform}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="text-right text-sm">
                      <p className="font-medium">{upload.recordsProcessed} records</p>
                      <p className="text-orange-600">{upload.alertsGenerated} alerts</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upload Action */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Upload New Report</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                <div>
                  <p className="font-medium">Ready to upload?</p>
                  <p className="text-sm text-muted-foreground">
                    Upload functionality is now integrated with the Products page for a better workflow
                  </p>
                </div>
                <Button onClick={handleNavigateToProducts} className="w-full">
                  Go to Products & Upload
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Supported Platforms */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-base">Supported Platforms</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {['Amazon', 'Shopify', 'eBay', 'Etsy', 'WooCommerce', 'Magento'].map(platform => (
                  <Badge key={platform} variant="outline" className="justify-center text-xs py-1">
                    {platform}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
