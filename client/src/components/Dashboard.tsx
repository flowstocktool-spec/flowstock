import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, AlertTriangle, Upload, Users } from "lucide-react";
import StockBadge from "./StockBadge";

// Mock data - todo: remove mock functionality
const mockProducts = [
  { id: '1', name: 'Wireless Headphones', sku: 'WH-001', currentStock: 15, minimumQuantity: 10 },
  { id: '2', name: 'Bluetooth Speaker', sku: 'BS-002', currentStock: 3, minimumQuantity: 10 },
  { id: '3', name: 'Phone Case', sku: 'PC-003', currentStock: 0, minimumQuantity: 5 },
];

const mockStats = {
  totalProducts: 156,
  lowStockItems: 12,
  outOfStockItems: 3,
  totalSuppliers: 8,
  alertsSentToday: 5,
};

export default function Dashboard() {
  const handleUploadClick = () => {
    console.log('Upload stock report triggered');
  };

  return (
    <div className="space-y-8" data-testid="dashboard-main">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-products">{mockStats.totalProducts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-chart-2" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-2" data-testid="text-low-stock">{mockStats.lowStockItems}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive" data-testid="text-out-stock">{mockStats.outOfStockItems}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suppliers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-suppliers">{mockStats.totalSuppliers}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Button onClick={handleUploadClick} data-testid="button-upload-report">
            <Upload className="mr-2 h-4 w-4" />
            Upload Stock Report
          </Button>
          <Button variant="outline" data-testid="button-add-product">
            <Package className="mr-2 h-4 w-4" />
            Add Product
          </Button>
          <Button variant="outline" data-testid="button-add-supplier">
            <Users className="mr-2 h-4 w-4" />
            Add Supplier
          </Button>
        </CardContent>
      </Card>

      {/* Recent Items Needing Attention */}
      <Card>
        <CardHeader>
          <CardTitle>Items Needing Attention</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockProducts.map((product) => (
              <div key={product.id} className="flex items-center justify-between p-4 border rounded-md" data-testid={`item-attention-${product.id}`}>
                <div>
                  <h4 className="font-medium">{product.name}</h4>
                  <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                  <p className="text-sm font-mono">Stock: {product.currentStock} / Min: {product.minimumQuantity}</p>
                </div>
                <StockBadge currentStock={product.currentStock} minimumQuantity={product.minimumQuantity} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}