import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { AppHeader } from '@/src/components/AppHeader';
import { ProductCard } from '@/src/components/ProductCard';
import { Screen } from '@/src/components/Screen';
import { products } from '@/src/data/products';

const titles = { recommended: 'MY 추천 물품', popular: '인기상품' } as const;

export default function MarketListScreen() {
  const { category } = useLocalSearchParams<{ category?: string }>();
  const key = category === 'popular' ? 'popular' : 'recommended';
  const list = products.filter((product) => product.category === key);

  return <Screen scroll><AppHeader title={titles[key]} back /><View style={styles.grid}>{list.map((product) => <ProductCard key={product.id} product={product} />)}</View></Screen>;
}

const styles = StyleSheet.create({ grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, rowGap: 24, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40 } });
