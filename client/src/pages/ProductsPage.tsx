import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ProductTable from "@/components/ProductTable";
import ProductForm from "@/components/ProductForm";

export default function ProductsPage() {
  const [showForm, setShowForm] = useState(false);

  const handleAddProduct = () => {
    console.log('Add product triggered');
    setShowForm(true);
  };

  const handleFormSubmit = async (data: any) => {
    console.log('Product form submitted:', data);
    
    // Mock user ID - in real app this would come from auth
    const userId = "test-user-1";
    
    try {
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

      if (response.ok) {
        setShowForm(false);
        // You might want to refresh the product table here
        window.location.reload(); // Simple refresh for now
      } else {
        console.error('Failed to create product');
      }
    } catch (error) {
      console.error('Error creating product:', error);
    }
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