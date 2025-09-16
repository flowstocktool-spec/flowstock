import { Badge } from "@/components/ui/badge";

interface StockBadgeProps {
  currentStock: number;
  minimumQuantity: number;
}

export default function StockBadge({ currentStock, minimumQuantity }: StockBadgeProps) {
  const getVariant = () => {
    if (currentStock === 0) return "destructive";
    if (currentStock <= minimumQuantity) return "secondary";
    return "default";
  };

  const getLabel = () => {
    if (currentStock === 0) return "Out of Stock";
    if (currentStock <= minimumQuantity) return "Low Stock";
    return "In Stock";
  };

  return (
    <Badge variant={getVariant()} data-testid={`badge-stock-${getLabel().toLowerCase().replace(' ', '-')}`}>
      {getLabel()}
    </Badge>
  );
}