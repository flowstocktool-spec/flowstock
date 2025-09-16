import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import ProductTable from "@/components/ProductTable";
import ProductForm from "@/components/ProductForm";

export default function ProductsPage() {
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();
  
  // Mock user ID - in real app this would come from auth
  const userId = "test-user-1";

  const handleAddProduct = () => {
    console.log('Add product triggered');
    setShowForm(true);
  };

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          userId,
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to create product');
      }
      return response.json();
    },
    onSuccess: () => {
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ["/api/products", userId] });
    },
    onError: (error) => {
      console.error('Error creating product:', error);
    },
  });

  const handleFormSubmit = (data: any) => {
    console.log('Product form submitted:', data);
    createMutation.mutate(data);
  };

  const handleFormCancel = () => {
    setShowForm(false);
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="heading-products">Products</h1>
          <p className="text-muted-foreground">Manage your product catalog and stock levels</p>
        </div>
        <Button onClick={handleAddProduct} data-testid="button-add-product-page">
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      {showForm ? (
        <div className="mb-6">
          <ProductForm onSubmit={handleFormSubmit} onCancel={handleFormCancel} />
        </div>
      ) : (
        <ProductTable />
      )}
    </div>
  );
}