import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Mail, Edit, Trash2 } from "lucide-react";
import SupplierForm from "@/components/SupplierForm";

// Mock data - todo: remove mock functionality
const mockSuppliers = [
  { id: '1', name: 'TechCorp', email: 'orders@techcorp.com', productCount: 45 },
  { id: '2', name: 'AudioPlus', email: 'supply@audioplus.com', productCount: 23 },
  { id: '3', name: 'CaseMaster', email: 'business@casemaster.com', productCount: 12 },
  { id: '4', name: 'GadgetWorld', email: 'wholesale@gadgetworld.com', productCount: 76 },
];

export default function SuppliersPage() {
  const [showForm, setShowForm] = useState(false);

  const handleAddSupplier = () => {
    console.log('Add supplier triggered');
    setShowForm(true);
  };

  const handleFormSubmit = (data: any) => {
    console.log('Supplier form submitted:', data);
    setShowForm(false);
  };

  const handleFormCancel = () => {
    setShowForm(false);
  };

  const handleEdit = (supplierId: string) => {
    console.log('Edit supplier triggered:', supplierId);
  };

  const handleDelete = (supplierId: string) => {
    console.log('Delete supplier triggered:', supplierId);
  };

  const handleEmail = (supplierEmail: string) => {
    console.log('Email supplier triggered:', supplierEmail);
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockSuppliers.map((supplier) => (
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
                    <span className="font-medium">{supplier.productCount}</span> products
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}