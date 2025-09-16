import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Trash2 } from "lucide-react";
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

  // Mock user ID - in real app this would come from auth
  const userId = "test-user-1";

  const { data: products = [], isLoading: loading } = useQuery({
    queryKey: ["/api/products", userId],
    queryFn: async () => {
      const response = await fetch(`/api/products?userId=${userId}`);
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
      queryClient.invalidateQueries({ queryKey: ["/api/products", userId] });
    },
    onError: (error) => {
      console.error('Error deleting product:', error);
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