import StockBadge from '../StockBadge';

export default function StockBadgeExample() {
  return (
    <div className="flex gap-4">
      <StockBadge currentStock={50} minimumQuantity={10} />
      <StockBadge currentStock={5} minimumQuantity={10} />
      <StockBadge currentStock={0} minimumQuantity={10} />
    </div>
  );
}