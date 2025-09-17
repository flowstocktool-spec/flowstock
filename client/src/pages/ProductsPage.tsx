import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import ProductTable from "@/components/ProductTable";
import ProductForm from "@/components/ProductForm";
import { Mail } from "lucide-react";

export default function ProductsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const queryClient = useQueryClient();

  // Mock user ID - in real app this would come from auth
  const userId = "test-user-1";

  const handleAddProduct = () => {
    console.log('Add product triggered');
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleEditProduct = (product: any) => {
    console.log('Edit product triggered:', product.id);
    setEditingProduct(product);
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
      setEditingProduct(null);
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
    onError: (error) => {
      console.error('Error creating product:', error);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!editingProduct?.id) {
        throw new Error('No product selected for editing');
      }
      const response = await fetch(`/api/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to update product');
      }
      return response.json();
    },
    onSuccess: () => {
      setShowForm(false);
      setEditingProduct(null);
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
    onError: (error) => {
      console.error('Error updating product:', error);
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete product');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
  });

  const testAlertMutation = useMutation({
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

  const handleFormSubmit = (data: any) => {
    console.log('Product form submitted:', data);
    if (editingProduct) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingProduct(null);
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
          <ProductForm 
            product={editingProduct} 
            onSubmit={handleFormSubmit} 
            onCancel={handleFormCancel} 
          />
        </div>
      ) : (
        <ProductTable onEdit={handleEditProduct} />
      )}
    </div>
  );
}