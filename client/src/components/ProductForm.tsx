import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Hash, AlertTriangle } from "lucide-react";

interface Supplier {
  id: string;
  name: string;
}

interface ProductFormProps {
  product?: {
    id: string;
    name: string;
    sku: string;
    currentStock: number;
    minimumQuantity: number;
    supplierId: string;
  };
  onSubmit?: (data: any) => void;
  onCancel?: () => void;
}

export default function ProductForm({ product, onSubmit, onCancel }: ProductFormProps) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  
  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await fetch('/api/suppliers');
      if (response.ok) {
        const data = await response.json();
        setSuppliers(data);
      }
    } catch (error) {
      console.error('Failed to fetch suppliers:', error);
    }
  };
  const [formData, setFormData] = useState({
    name: product?.name || '',
    sku: product?.sku || '',
    currentStock: product?.currentStock || 0,
    minimumQuantity: product?.minimumQuantity || 10,
    supplierId: product?.supplierId || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Product form submitted:', formData);
    onSubmit?.(formData);
  };

  const handleCancel = () => {
    console.log('Product form cancelled');
    onCancel?.();
  };

  return (
    <Card data-testid="card-product-form">
      <CardHeader>
        <CardTitle>
          {product ? 'Edit Product' : 'Add New Product'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name</Label>
            <div className="relative">
              <Package className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                placeholder="e.g., Wireless Headphones"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="pl-10"
                data-testid="input-product-name"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sku">SKU</Label>
            <div className="relative">
              <Hash className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="sku"
                placeholder="e.g., WH-001"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="pl-10 font-mono"
                data-testid="input-product-sku"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currentStock">Current Stock</Label>
              <Input
                id="currentStock"
                type="number"
                min="0"
                value={formData.currentStock}
                onChange={(e) => setFormData({ ...formData, currentStock: parseInt(e.target.value) || 0 })}
                className="font-mono"
                data-testid="input-current-stock"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="minimumQuantity">Minimum Quantity</Label>
              <div className="relative">
                <AlertTriangle className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="minimumQuantity"
                  type="number"
                  min="1"
                  value={formData.minimumQuantity}
                  onChange={(e) => setFormData({ ...formData, minimumQuantity: parseInt(e.target.value) || 1 })}
                  className="pl-10 font-mono"
                  data-testid="input-minimum-quantity"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="supplier">Supplier</Label>
            <Select 
              value={formData.supplierId} 
              onValueChange={(value) => setFormData({ ...formData, supplierId: value })}
              required
            >
              <SelectTrigger data-testid="select-supplier">
                <SelectValue placeholder="Select a supplier" />
              </SelectTrigger>
              <SelectContent>
                {suppliers.map((supplier) => (
                  <SelectItem key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-4 pt-4">
            <Button 
              type="submit" 
              className="flex-1"
              data-testid="button-save-product"
            >
              {product ? 'Update Product' : 'Add Product'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCancel}
              data-testid="button-cancel-product"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}