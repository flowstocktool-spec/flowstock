import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Upload, BookOpen } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import ProductTable from "@/components/ProductTable";
import ProductForm from "@/components/ProductForm";
import StockUpload from "@/components/StockUpload";
import { Mail } from "lucide-react";

export default function ProductsPage() {
  const [showForm, setShowForm] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const queryClient = useQueryClient();

  // Get current demo user ID consistently
  const userId = "demo-user";

  const handleAddProduct = () => {
    console.log('Add product triggered');
    setEditingProduct(null);
    setShowUpload(false);
    setShowForm(true);
  };

  const handleEditProduct = (product: any) => {
    console.log('Edit product triggered:', product.id);
    setEditingProduct(product);
    setShowUpload(false);
    setShowForm(true);
  };

  const handleUploadStock = () => {
    console.log('Upload stock report triggered');
    setShowForm(false);
    setEditingProduct(null);
    setShowUpload(true);
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

  const handleUploadCancel = () => {
    setShowUpload(false);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold" data-testid="heading-products">Products</h1>
            <p className="text-muted-foreground">Manage your product catalog and stock levels</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleUploadStock} variant="outline" data-testid="button-upload-stock">
              <Upload className="mr-2 h-4 w-4" />
              Upload Stock Report
            </Button>
            <Button onClick={handleAddProduct} data-testid="button-add-product-page">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </div>
        </div>

        {/* Products User Guide */}
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <BookOpen className="h-5 w-5" />
              Product Management Guide
            </CardTitle>
          </CardHeader>
          <CardContent className="text-green-700 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold">Adding Products:</h4>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li><strong>Manual:</strong> Click "Add Product" for individual items</li>
                  <li><strong>Bulk Upload:</strong> Use "Upload Stock Report" for CSV/Excel files</li>
                  <li><strong>SKU:</strong> Use unique identifiers (e.g., "TSHIRT-001")</li>
                  <li><strong>Minimum Quantity:</strong> Set realistic reorder thresholds</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold">Managing Stock:</h4>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li><strong>Green Badge:</strong> Stock is above minimum</li>
                  <li><strong>Orange Badge:</strong> Low stock - reorder soon</li>
                  <li><strong>Red Badge:</strong> Out of stock - urgent action needed</li>
                  <li><strong>Edit anytime:</strong> Click pencil icon to update details</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6 flex items-center justify-between" style={{ display: 'none' }}>
        <div>
          <h1 className="text-3xl font-bold" data-testid="heading-products">Products</h1>
          <p className="text-muted-foreground">Manage your product catalog and stock levels</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={handleUploadStock} variant="outline" data-testid="button-upload-stock">
            <Upload className="mr-2 h-4 w-4" />
            Upload Stock Report
          </Button>
          <Button onClick={handleAddProduct} data-testid="button-add-product-page">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      {showForm ? (
        <div className="mb-6">
          <ProductForm 
            product={editingProduct} 
            onSubmit={handleFormSubmit} 
            onCancel={handleFormCancel} 
          />
        </div>
      ) : showUpload ? (
        <div className="mb-6">
          <StockUpload />
          <div className="mt-4">
            <Button onClick={handleUploadCancel} variant="outline">
              Back to Products
            </Button>
          </div>
        </div>
      ) : (
        <ProductTable onEdit={handleEditProduct} />
      )}
    </div>
  );
}