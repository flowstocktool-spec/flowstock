
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building, Mail } from "lucide-react";

interface SupplierFormProps {
  supplier?: {
    id: string;
    name: string;
    email: string;
  };
  onSubmit?: (data: { name: string; email: string }) => void;
  onCancel?: () => void;
}

export default function SupplierForm({ supplier, onSubmit, onCancel }: SupplierFormProps) {
  const [formData, setFormData] = useState({
    name: supplier?.name || '',
    email: supplier?.email || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.name.trim() || !formData.email.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert('Please enter a valid email address');
      return;
    }

    console.log('Supplier form submitted:', formData);
    onSubmit?.(formData);
  };

  const handleCancel = () => {
    console.log('Supplier form cancelled');
    onCancel?.();
  };

  return (
    <Card data-testid="card-supplier-form">
      <CardHeader>
        <CardTitle>
          {supplier ? 'Edit Supplier' : 'Add New Supplier'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Supplier Name</Label>
            <div className="relative">
              <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                placeholder="e.g., TechCorp Solutions"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="pl-10 min-h-[44px]"
                data-testid="input-supplier-name"
                autoComplete="organization"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                inputMode="email"
                placeholder="orders@techcorp.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="pl-10 min-h-[44px]"
                data-testid="input-supplier-email"
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-6 sticky bottom-0 bg-background p-4 -m-4 border-t mt-6">
            <Button 
              type="submit" 
              className="flex-1 min-h-[44px]"
              data-testid="button-save-supplier"
            >
              {supplier ? 'Update Supplier' : 'Add Supplier'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCancel}
              className="min-h-[44px]"
              data-testid="button-cancel-supplier"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
