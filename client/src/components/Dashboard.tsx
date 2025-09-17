
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, AlertTriangle, Upload, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import StockBadge from "./StockBadge";

interface DashboardStats {
  totalProducts: number;
  totalSuppliers: number;
  lowStockItems: number;
  outOfStockItems: number;
  alertsSentToday: number;
  totalAlerts: number;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  currentStock: number;
  minimumQuantity: number;
}

export default function Dashboard() {
  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    queryFn: async (): Promise<DashboardStats> => {
      const response = await fetch('/api/dashboard/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }
      return response.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds for real-time updates
  });

  // Fetch products for attention section
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["/api/products"],
    queryFn: async (): Promise<Product[]> => {
      const response = await fetch('/api/products');
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      // Filter items needing attention (low stock or out of stock)
      return data.filter((product: Product) => 
        product.currentStock <= product.minimumQuantity
      ).slice(0, 5); // Show only top 5 items needing attention
    },
    refetchInterval: 30000,
  });

  const handleUploadClick = () => {
    console.log('Upload stock report triggered');
    // Navigate to products page where upload functionality is now located
    window.location.href = '/products';
  };

  const handleAddProduct = () => {
    console.log('Add product triggered');
    window.location.href = '/products';
  };

  const handleAddSupplier = () => {
    console.log('Add supplier triggered');
    window.location.href = '/suppliers';
  };

  // Default values while loading
  const displayStats = stats || {
    totalProducts: 0,
    totalSuppliers: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    alertsSentToday: 0,
    totalAlerts: 0
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
            <div className="text-2xl font-bold" data-testid="text-total-products">
              {statsLoading ? '...' : displayStats.totalProducts}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-chart-2" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-2" data-testid="text-low-stock">
              {statsLoading ? '...' : displayStats.lowStockItems}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive" data-testid="text-out-stock">
              {statsLoading ? '...' : displayStats.outOfStockItems}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suppliers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-suppliers">
              {statsLoading ? '...' : displayStats.totalSuppliers}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Alert Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Alerts Sent Today</p>
              <p className="text-2xl font-bold text-blue-600">
                {statsLoading ? '...' : displayStats.alertsSentToday}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Alerts</p>
              <p className="text-2xl font-bold">
                {statsLoading ? '...' : displayStats.totalAlerts}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

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
          <Button variant="outline" onClick={handleAddProduct} data-testid="button-add-product">
            <Package className="mr-2 h-4 w-4" />
            Add Product
          </Button>
          <Button variant="outline" onClick={handleAddSupplier} data-testid="button-add-supplier">
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
          {productsLoading ? (
            <div className="text-center py-4">Loading items...</div>
          ) : products.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              🎉 All items are well-stocked!
            </div>
          ) : (
            <div className="space-y-4">
              {products.map((product) => (
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
