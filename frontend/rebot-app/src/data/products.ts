import type { ProductResponse } from '@/src/types/api';

export type Product = {
  id: string;
  name: string;
  tag: string;
  color: string;
  price: number;
  category: 'recommended' | 'popular';
  description: string | null;
  imageUrl: string | null;
  purchaseUrl: string | null;
};

const colors = ['#EAE5DC', '#DFECF1', '#E9E2F3', '#E4E9F0', '#F0E7E1', '#E5EFE3', '#F1E9EC', '#E7E7F2'];

const tagLabels: Record<string, string> = {
  sleep: '수면 루틴',
  exercise: '운동 습관',
  hydration: '수분 보충',
  desk_environment: '생활 환경',
};

export function toProduct(product: ProductResponse, index: number): Product {
  return {
    id: product.id,
    name: product.name,
    tag: tagLabels[product.tags[0]] ?? product.category,
    color: colors[index % colors.length],
    price: product.price_krw ?? 0,
    category: product.category === 'popular' ? 'popular' : 'recommended',
    description: product.description,
    imageUrl: product.image_url,
    purchaseUrl: product.purchase_url,
  };
}
