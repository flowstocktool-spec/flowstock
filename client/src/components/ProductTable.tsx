import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Trash2, Mail, Grid, List } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import StockBadge from "./StockBadge";

interface Product {
  id: string;
  name: string;
  sku: string;
  currentStock: number;
  minimumQuantity: number;
  supplierId: string;
  supplierName?: string;
  lastUpdated: string;
}

interface ProductTableProps {
  onEdit?: (product: Product) => void;
}

export default function ProductTable({ onEdit }: ProductTableProps) {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Auto-switch to cards on mobile for better UX
      if (mobile && viewMode === 'table') {
        setViewMode('cards');
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [viewMode]);

  const { data: products = [], isLoading: loading } = useQuery({
    queryKey: ["/api/products"],
    queryFn: async () => {
      const response = await fetch('/api/products');
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      return data.map((product: any) => ({
        ...product,
        lastUpdated: new Date(product.lastUpdated).toLocaleDateString(),
      }));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (productId: string) => {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete product');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
    onError: (error) => {
      console.error('Error deleting product:', error);
    },
  });

  const testAlert = useMutation({
    mutationFn: async (productId: string) => {
      const response = await fetch(`/api/test-alert/${productId}`, {
        method: 'POST',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send test alert');
      }
      return response.json();
    },
    onSuccess: (data) => {
      alert('✅ ' + data.message);
    },
    onError: (error) => {
      alert('❌ ' + error.message);
    },
  });

  const triggerLowStock = useMutation({
    mutationFn: async (productId: string) => {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentStock: 1, // Set stock to 1 to trigger low stock alert
        }),
      });
      if (!response.ok) throw new Error('Failed to update product');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      alert('🚨 Stock updated to 1 - automatic email should be sent if configured!');
    },
    onError: (error) => {
      alert('❌ Failed to trigger low stock: ' + error.message);
    },
  });


  const handleEdit = (product: Product) => {
    console.log('Edit product triggered:', product);
    onEdit?.(product);
  };

  const handleDelete = (productId: string) => {
    console.log('Delete product triggered:', productId);
    deleteMutation.mutate(productId);
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <div className="p-6 text-center">Loading products...</div>
        </CardContent>
      </Card>
    );
  }

  const ProductActions = ({ product }: { product: Product }) => (
    <div className="flex flex-wrap gap-2">
      <Button
        size={isMobile ? "sm" : "icon"}
        variant="outline"
        onClick={() => handleEdit(product)}
        data-testid={`button-edit-product-${product.id}`}
        className="min-h-[44px] px-3"
      >
        <Edit className="h-4 w-4" />
        {isMobile && <span className="ml-1">Edit</span>}
      </Button>
      <Button
        size={isMobile ? "sm" : "icon"}
        variant="outline"
        onClick={() => handleDelete(product.id)}
        disabled={deleteMutation.isPending}
        className="min-h-[44px] px-3"
      >
        <Trash2 className="h-4 w-4" />
        {isMobile && <span className="ml-1">Delete</span>}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => testAlert.mutate(product.id)}
        disabled={testAlert.isPending}
        title="Test Alert Email"
        className="min-h-[44px] px-3"
      >
        <Mail className="h-4 w-4" />
        {isMobile && <span className="ml-1">Alert</span>}
      </Button>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => triggerLowStock.mutate(product.id)}
        disabled={triggerLowStock.isPending}
        title="Trigger Low Stock (Set stock to 1)"
        className="min-h-[44px] px-3"
      >
        ⚠️ {isMobile && "Test"}
      </Button>
    </div>
  );

  const renderCardView = () => (
    <div className="space-y-4">
      {products.map((product: Product) => (
        <Card key={product.id} className="p-4">
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{product.name}</h3>
                <p className="text-sm text-muted-foreground font-mono">{product.sku}</p>
              </div>
              <StockBadge currentStock={product.currentStock} minimumQuantity={product.minimumQuantity} />
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Stock:</span>
                <span className="ml-2 font-mono font-medium">{product.currentStock}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Supplier:</span>
                <span className="ml-2">{product.supplierName || 'N/A'}</span>
              </div>
            </div>
            
            <div className="text-xs text-muted-foreground">
              Updated: {product.lastUpdated}
            </div>
            
            <ProductActions product={product} />
          </div>
        </Card>
      ))}
    </div>
  );

  const renderTableView = () => (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="text-left p-3 font-medium">Product</th>
            <th className="text-left p-3 font-medium">SKU</th>
            <th className="text-left p-3 font-medium">Stock</th>
            <th className="text-left p-3 font-medium">Status</th>
            <th className="text-left p-3 font-medium hidden md:table-cell">Supplier</th>
            <th className="text-left p-3 font-medium hidden lg:table-cell">Updated</th>
            <th className="text-left p-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product: Product) => (
            <tr key={product.id} className="border-b hover:bg-muted/50">
              <td className="p-3 font-medium">{product.name}</td>
              <td className="p-3 font-mono text-sm">{product.sku}</td>
              <td className="p-3 font-mono">{product.currentStock}</td>
              <td className="p-3">
                <StockBadge currentStock={product.currentStock} minimumQuantity={product.minimumQuantity} />
              </td>
              <td className="p-3 hidden md:table-cell">{product.supplierName || 'N/A'}</td>
              <td className="p-3 text-sm text-muted-foreground hidden lg:table-cell">{product.lastUpdated}</td>
              <td className="p-3">
                <ProductActions product={product} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Product Inventory</CardTitle>
          {!isMobile && (
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
                className="min-h-[44px] px-3"
              >
                <List className="h-4 w-4 mr-1" />
                Table
              </Button>
              <Button
                variant={viewMode === 'cards' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('cards')}
                className="min-h-[44px] px-3"
              >
                <Grid className="h-4 w-4 mr-1" />
                Cards
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {viewMode === 'cards' ? renderCardView() : renderTableView()}
      </CardContent>
    </Card>
  );
}