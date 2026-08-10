import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '@/src/components/AppHeader';
import { ProductCard } from '@/src/components/ProductCard';
import { Screen } from '@/src/components/Screen';
import { Product, toProduct } from '@/src/data/products';
import { backendApi, getErrorMessage } from '@/src/services/api';
import { colors } from '@/src/theme/tokens';

const titles = { recommended: 'MY 추천 물품', popular: '인기상품' } as const;

export default function MarketListScreen() {
  const { category } = useLocalSearchParams<{ category?: string }>();
  const key = category === 'popular' ? 'popular' : 'recommended';
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void backendApi.listProducts().then((items) => setProducts(items.map(toProduct).filter((product) => product.category === key))).catch((caught) => setError(getErrorMessage(caught)));
  }, [key]);

  return <Screen scroll><AppHeader title={titles[key]} back />{error ? <Text style={styles.error}>{error}</Text> : products.length === 0 ? <ActivityIndicator style={styles.loading} color={colors.text} /> : <View style={styles.grid}>{products.map((product) => <ProductCard key={product.id} product={product} />)}</View>}</Screen>;
}

const styles = StyleSheet.create({ grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, rowGap: 24, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40 }, loading: { marginTop: 60 }, error: { margin: 24, color: '#B42318', textAlign: 'center', lineHeight: 20 } });
