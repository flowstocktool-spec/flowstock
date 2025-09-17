import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Trash2, Mail } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Inventory</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2 font-medium">Product</th>
                <th className="text-left p-2 font-medium">SKU</th>
                <th className="text-left p-2 font-medium">Stock</th>
                <th className="text-left p-2 font-medium">Status</th>
                <th className="text-left p-2 font-medium">Supplier</th>
                <th className="text-left p-2 font-medium">Updated</th>
                <th className="text-left p-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product: Product) => (
                <tr key={product.id} className="border-b hover-elevate">
                  <td className="p-2 font-medium">{product.name}</td>
                  <td className="p-2 font-mono text-sm">{product.sku}</td>
                  <td className="p-2 font-mono">{product.currentStock}</td>
                  <td className="p-2">
                    <StockBadge currentStock={product.currentStock} minimumQuantity={product.minimumQuantity} />
                  </td>
                  <td className="p-2">{product.supplierName || 'N/A'}</td>
                  <td className="p-2 text-sm text-muted-foreground">{product.lastUpdated}</td>
                  <td className="p-2">
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => handleEdit(product)}
                        data-testid={`button-edit-product-${product.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => handleDelete(product.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => testAlert.mutate(product.id)}
                        disabled={testAlert.isPending}
                        title="Test Alert Email"
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => triggerLowStock.mutate(product.id)}
                        disabled={triggerLowStock.isPending}
                        title="Trigger Low Stock (Set stock to 1)"
                      >
                        ⚠️
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}