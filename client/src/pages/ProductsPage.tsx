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

  const handleFormSubmit = (data: any) => {
    console.log('Product form submitted:', data);
    setShowForm(false);
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