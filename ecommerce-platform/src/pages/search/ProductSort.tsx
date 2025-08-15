import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowUpDown } from 'lucide-react';
import type { ProductSearchParams } from '@/types';

interface ProductSortProps {
  value: ProductSearchParams['sortBy'];
  onChange: (value: ProductSearchParams['sortBy']) => void;
}

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Best Match' },
  { value: 'newest', label: 'Newest First' },
  { value: 'name', label: 'Name A-Z' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' }
] as const;

export function ProductSort({ value, onChange }: ProductSortProps) {
  return (
    <div className="flex items-center gap-2">
      <ArrowUpDown className="w-4 h-4 text-gray-500" />
      <Select value={value} onValueChange={(v) => onChange(v as ProductSearchParams['sortBy'])}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}