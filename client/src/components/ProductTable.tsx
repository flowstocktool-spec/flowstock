import { useState } from 'react';
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
  supplierName: string;
  lastUpdated: string;
}

interface ProductTableProps {
  products?: Product[];
}

// Mock data - todo: remove mock functionality
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Wireless Headphones',
    sku: 'WH-001',
    currentStock: 15,
    minimumQuantity: 10,
    supplierName: 'TechCorp',
    lastUpdated: '2024-01-15'
  },
  {
    id: '2',
    name: 'Bluetooth Speaker',
    sku: 'BS-002',
    currentStock: 3,
    minimumQuantity: 10,
    supplierName: 'AudioPlus',
    lastUpdated: '2024-01-14'
  },
  {
    id: '3',
    name: 'Phone Case',
    sku: 'PC-003',
    currentStock: 0,
    minimumQuantity: 5,
    supplierName: 'CaseMaster',
    lastUpdated: '2024-01-13'
  },
];

export default function ProductTable({ products = mockProducts }: ProductTableProps) {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  const handleEdit = (productId: string) => {
    console.log('Edit product triggered:', productId);
  };

  const handleDelete = (productId: string) => {
    console.log('Delete product triggered:', productId);
  };

  return (
    <Card data-testid="card-product-table">
      <CardHeader>
        <CardTitle>Products</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Product Name</th>
                <th className="text-left p-2">SKU</th>
                <th className="text-left p-2">Current Stock</th>
                <th className="text-left p-2">Min Quantity</th>
                <th className="text-left p-2">Status</th>
                <th className="text-left p-2">Supplier</th>
                <th className="text-left p-2">Last Updated</th>
                <th className="text-left p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b hover-elevate" data-testid={`row-product-${product.id}`}>
                  <td className="p-2 font-medium">{product.name}</td>
                  <td className="p-2 font-mono text-sm">{product.sku}</td>
                  <td className="p-2 font-mono">{product.currentStock}</td>
                  <td className="p-2 font-mono">{product.minimumQuantity}</td>
                  <td className="p-2">
                    <StockBadge currentStock={product.currentStock} minimumQuantity={product.minimumQuantity} />
                  </td>
                  <td className="p-2">{product.supplierName}</td>
                  <td className="p-2 text-sm text-muted-foreground">{product.lastUpdated}</td>
                  <td className="p-2">
                    <div className="flex gap-2">
                      <Button 
                        size="icon" 
                        variant="outline"
                        onClick={() => handleEdit(product.id)}
                        data-testid={`button-edit-${product.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="outline"
                        onClick={() => handleDelete(product.id)}
                        data-testid={`button-delete-${product.id}`}
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