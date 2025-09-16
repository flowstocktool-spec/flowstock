import ProductForm from '../ProductForm';

export default function ProductFormExample() {
  return (
    <div className="max-w-md">
      <ProductForm
        onSubmit={(data) => console.log('Form submitted:', data)}
        onCancel={() => console.log('Form cancelled')}
      />
    </div>
  );
}