import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Mail, Edit, Trash2 } from "lucide-react";
import SupplierForm from "@/components/SupplierForm";

interface Supplier {
  id: string;
  name: string;
  email: string;
  productCount?: number;
}

export default function SuppliersPage() {
  const [showForm, setShowForm] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock user ID - in real app this would come from auth
  const userId = "test-user-1";

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await fetch(`/api/suppliers?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setSuppliers(data);
      }
    } catch (error) {
      console.error('Failed to fetch suppliers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSupplier = () => {
    console.log('Add supplier triggered');
    setShowForm(true);
  };

  const handleFormSubmit = async (data: any) => {
    console.log('Supplier form submitted:', data);
    try {
      const response = await fetch('/api/suppliers', {
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
        fetchSuppliers(); // Refresh the list
      } else {
        console.error('Failed to create supplier');
      }
    } catch (error) {
      console.error('Error creating supplier:', error);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
  };

  const handleEdit = (supplierId: string) => {
    console.log('Edit supplier triggered:', supplierId);
  };

  const handleDelete = async (supplierId: string) => {
    console.log('Delete supplier triggered:', supplierId);
    try {
      const response = await fetch(`/api/suppliers/${supplierId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchSuppliers(); // Refresh the list
      } else {
        console.error('Failed to delete supplier');
      }
    } catch (error) {
      console.error('Error deleting supplier:', error);
    }
  };

  const handleEmail = (supplierEmail: string) => {
    console.log('Email supplier triggered:', supplierEmail);
    window.location.href = `mailto:${supplierEmail}`;
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="heading-suppliers">Suppliers</h1>
          <p className="text-muted-foreground">Manage your supplier contacts and relationships</p>
        </div>
        <Button onClick={handleAddSupplier} data-testid="button-add-supplier-page">
          <Plus className="mr-2 h-4 w-4" />
          Add Supplier
        </Button>
      </div>

      {showForm ? (
        <div className="mb-6">
          <SupplierForm onSubmit={handleFormSubmit} onCancel={handleFormCancel} />
        </div>
      ) : (
        {loading ? (
          <div>Loading suppliers...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suppliers.map((supplier) => (
            <Card key={supplier.id} className="hover-elevate" data-testid={`card-supplier-${supplier.id}`}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{supplier.name}</span>
                  <div className="flex gap-2">
                    <Button 
                      size="icon" 
                      variant="outline"
                      onClick={() => handleEmail(supplier.email)}
                      data-testid={`button-email-${supplier.id}`}
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="outline"
                      onClick={() => handleEdit(supplier.id)}
                      data-testid={`button-edit-supplier-${supplier.id}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="outline"
                      onClick={() => handleDelete(supplier.id)}
                      data-testid={`button-delete-supplier-${supplier.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{supplier.email}</p>
                  <p className="text-sm">
                    <span className="font-medium">{supplier.productCount || 0}</span> products
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
          </div>
        )}
      )}
    </div>
  );
}