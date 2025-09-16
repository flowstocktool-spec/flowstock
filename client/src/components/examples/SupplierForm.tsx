import SupplierForm from '../SupplierForm';

export default function SupplierFormExample() {
  return (
    <div className="max-w-md">
      <SupplierForm
        onSubmit={(data) => console.log('Form submitted:', data)}
        onCancel={() => console.log('Form cancelled')}
      />
    </div>
  );
}