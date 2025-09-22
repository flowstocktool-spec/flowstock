
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Home, 
  Package, 
  Users, 
  Upload, 
  Bell, 
  Settings,
  BookOpen,
  CheckCircle,
  AlertTriangle,
  Mail,
  Eye,
  Edit,
  Plus
} from "lucide-react";

export default function UserGuidePage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2" data-testid="heading-user-guide">
          <BookOpen className="h-8 w-8" />
          User Guide
        </h1>
        <p className="text-muted-foreground">Complete guide to using StockAlert Pro effectively</p>
      </div>

      <div className="space-y-8">
        {/* Dashboard Guide */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>The Dashboard provides a quick overview of your entire inventory management system.</p>
            
            <div className="space-y-3">
              <h4 className="font-semibold">Key Features:</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Product Summary:</strong> View total products, low stock items, and out-of-stock items</li>
                <li><strong>Supplier Overview:</strong> See total suppliers and recent activity</li>
                <li><strong>Alert Statistics:</strong> Track alerts sent today, this week, and total</li>
                <li><strong>Recent Activity:</strong> Monitor latest uploads and system activities</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">How to Use:</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li><span className="text-green-600">🟢 Green numbers</span> = Good stock levels</li>
                <li><span className="text-orange-500">🟡 Orange numbers</span> = Low stock alerts</li>
                <li><span className="text-red-600">🔴 Red numbers</span> = Out of stock items</li>
              </ul>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm"><strong>Best Practice:</strong> Check the dashboard daily to stay on top of inventory health. Address red (out-of-stock) items immediately.</p>
            </div>
          </CardContent>
        </Card>

        {/* Products Guide */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Products
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>The Products section is where you manage your entire product catalog, including stock levels, SKUs, and supplier assignments.</p>
            
            <div className="space-y-3">
              <h4 className="font-semibold">Adding Products Manually:</h4>
              <ol className="list-decimal pl-6 space-y-1">
                <li>Click <strong>"Add Product"</strong> button</li>
                <li>Fill in the form:
                  <ul className="list-disc pl-4 mt-1">
                    <li><strong>SKU:</strong> Unique product identifier (e.g., "TSHIRT-001")</li>
                    <li><strong>Name:</strong> Descriptive product name</li>
                    <li><strong>Current Stock:</strong> How many units you currently have</li>
                    <li><strong>Minimum Quantity:</strong> Threshold for low stock alerts</li>
                    <li><strong>Supplier:</strong> Choose from your supplier list</li>
                  </ul>
                </li>
                <li>Click <strong>"Save Product"</strong></li>
              </ol>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">Uploading Stock Reports:</h4>
              <ol className="list-decimal pl-6 space-y-1">
                <li>Click <strong>"Upload Stock Report"</strong> button</li>
                <li>Select your CSV file (supports multiple formats)</li>
                <li>The system will automatically:
                  <ul className="list-disc pl-4 mt-1">
                    <li>Auto-detect the file format (Amazon, Shopify, eBay, etc.)</li>
                    <li>Map columns automatically</li>
                    <li>Create new products or update existing ones</li>
                    <li>Send automatic alerts for low stock items</li>
                  </ul>
                </li>
              </ol>
            </div>

            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-sm"><strong>Supported Formats:</strong> Amazon, Shopify, eBay, Etsy, WooCommerce, and generic CSV files</p>
            </div>
          </CardContent>
        </Card>

        {/* Suppliers Guide */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Suppliers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>The Suppliers section manages your vendor contacts and their information for automated communication.</p>
            
            <div className="space-y-3">
              <h4 className="font-semibold">Adding a New Supplier:</h4>
              <ol className="list-decimal pl-6 space-y-1">
                <li>Click <strong>"Add Supplier"</strong> button</li>
                <li>Fill in the form:
                  <ul className="list-disc pl-4 mt-1">
                    <li><strong>Name:</strong> Company or contact name</li>
                    <li><strong>Email:</strong> Primary contact email for orders/alerts</li>
                  </ul>
                </li>
                <li>Click <strong>"Save Supplier"</strong></li>
              </ol>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">Managing Suppliers:</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li><Edit className="h-4 w-4 inline mr-1" /><strong>Edit:</strong> Update supplier information</li>
                <li><Mail className="h-4 w-4 inline mr-1" /><strong>Email:</strong> Click to open your email client</li>
                <li><Eye className="h-4 w-4 inline mr-1" /><strong>View Products:</strong> See assigned products count</li>
              </ul>
            </div>

            <div className="bg-yellow-50 p-3 rounded-lg">
              <p className="text-sm"><strong>Important:</strong> Add suppliers before importing products. Each product must have a supplier for alerts to work.</p>
            </div>
          </CardContent>
        </Card>

        {/* Stock Reports Guide */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Stock Reports
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Upload and track your inventory files from various e-commerce platforms.</p>
            
            <div className="space-y-3">
              <h4 className="font-semibold">Understanding Upload Results:</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Total Rows:</strong> How many products were in your file</li>
                <li><strong>Valid Rows:</strong> Successfully processed entries</li>
                <li><strong>Products Created:</strong> New products added to your catalog</li>
                <li><strong>Products Updated:</strong> Existing products with updated stock levels</li>
                <li><strong>Alerts Generated:</strong> Automatic low-stock notifications sent</li>
                <li><strong>Errors:</strong> Any issues that need attention</li>
              </ul>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <h5 className="font-semibold text-blue-800">Auto Platform Detection</h5>
                <p className="text-xs text-blue-600">Identifies Amazon, Shopify, eBay, and more</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <h5 className="font-semibold text-green-800">Smart Column Mapping</h5>
                <p className="text-xs text-green-600">Automatically finds SKU, stock, and price columns</p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <h5 className="font-semibold text-purple-800">Format Flexibility</h5>
                <p className="text-xs text-purple-600">Works with CSV, Excel, TSV, and custom formats</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alerts Guide */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Track all notifications sent to suppliers about low stock or out-of-stock situations.</p>
            
            <div className="space-y-3">
              <h4 className="font-semibold">How Alerts Are Triggered:</h4>
              <div className="space-y-2">
                <div>
                  <h5 className="font-medium">Automatic Triggers:</h5>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Stock level reaches or goes below minimum quantity</li>
                    <li>Product goes out of stock (zero inventory)</li>
                    <li>During stock report uploads</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium">Manual Triggers:</h5>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Test alerts from product management</li>
                    <li>Individual product alert testing</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 p-3 rounded-lg">
              <p className="text-sm"><strong>Monitor Alert Frequency:</strong> High alert volumes may indicate need for better stock management or overly aggressive minimum quantity settings.</p>
            </div>
          </CardContent>
        </Card>

        {/* Settings Guide */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Configure your account, email notifications, and system preferences.</p>
            
            <div className="space-y-3">
              <h4 className="font-semibold">Gmail SMTP Configuration (Essential!):</h4>
              <ol className="list-decimal pl-6 space-y-1">
                <li><strong>Enable 2-Factor Authentication</strong> on your Gmail account</li>
                <li><strong>Generate an App Password:</strong>
                  <ul className="list-disc pl-4 mt-1">
                    <li>Go to Google Account → Security → 2-Step Verification</li>
                    <li>Click "App passwords"</li>
                    <li>Generate a 16-character password</li>
                  </ul>
                </li>
                <li><strong>Enter Configuration:</strong>
                  <ul className="list-disc pl-4 mt-1">
                    <li>Gmail Username: Your full Gmail address</li>
                    <li>Gmail App Password: The 16-character code</li>
                  </ul>
                </li>
                <li>Click <strong>"Configure Email"</strong></li>
                <li><strong>Set Sender Email:</strong> Use a professional email address</li>
                <li><strong>Test Configuration:</strong> Send a test email to verify</li>
              </ol>
            </div>

            <div className="bg-red-50 p-3 rounded-lg border border-red-200">
              <p className="text-sm text-red-800"><strong>Critical:</strong> Email configuration is essential for the system to work properly. Without it, supplier alerts won't be sent!</p>
            </div>
          </CardContent>
        </Card>

        {/* Getting Started Workflow */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Getting Started Workflow
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <h4 className="font-semibold">For New Users:</h4>
              <ol className="list-decimal pl-6 space-y-1">
                <li><strong>Start with Settings:</strong> Configure email first</li>
                <li><strong>Add Suppliers:</strong> Create your vendor contacts</li>
                <li><strong>Upload Products:</strong> Use CSV upload or manual entry</li>
                <li><strong>Test Alerts:</strong> Verify email notifications work</li>
                <li><strong>Monitor Dashboard:</strong> Check daily for stock issues</li>
              </ol>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">Daily Workflow:</h4>
              <ol className="list-decimal pl-6 space-y-1">
                <li>Check Dashboard for overnight changes</li>
                <li>Upload latest stock reports</li>
                <li>Review automated notifications</li>
                <li>Handle out-of-stock items</li>
              </ol>
            </div>

            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-sm"><strong>Remember:</strong> The system works best when email is properly configured and stock reports are uploaded regularly!</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
