import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Trash2 } from "lucide-react";
import StockBadge from "./StockBadge";

interface Product {
  id: string;
  name: string;
  sku: string;
  currentStock: number;
  minimumQuantity: number;
  supplierName?: string;
  lastUpdated: string;
}

export default function ProductTable() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock user ID - in real app this would come from auth
  const userId = "test-user-1";

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`/api/products?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data.map((product: any) => ({
          ...product,
          lastUpdated: new Date(product.lastUpdated).toLocaleDateString(),
        })));
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (productId: string) => {
    console.log('Edit product triggered:', productId);
  };

  const handleDelete = async (productId: string) => {
    console.log('Delete product triggered:', productId);
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchProducts(); // Refresh the list
      } else {
        console.error('Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    }
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
              {products.map((product) => (
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
                        onClick={() => handleEdit(product.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="outline"
                        onClick={() => handleDelete(product.id)}
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