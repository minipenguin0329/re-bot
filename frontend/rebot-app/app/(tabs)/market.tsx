import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppHeader } from '@/src/components/AppHeader';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { ProductCard } from '@/src/components/ProductCard';
import { Screen } from '@/src/components/Screen';
import { Product, toProduct } from '@/src/data/products';
import { backendApi, getErrorMessage } from '@/src/services/api';
import { useCart } from '@/src/store/CartContext';
import { useWellness } from '@/src/store/WellnessContext';
import { colors, radius } from '@/src/theme/tokens';

export default function MarketScreen() {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { totalCount } = useCart();
  const { productConsent, setProductConsent } = useWellness();

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await backendApi.listProducts();
      setProducts(response.map(toProduct));
    } catch (caught) {
      setError(getErrorMessage(caught));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (productConsent) void loadProducts();
  }, [loadProducts, productConsent]);

  const recommended = products.filter((product) => product.category === 'recommended');
  const popular = products.filter((product) => product.category === 'popular');
  const searchResults = useMemo(() => products.filter((product) => product.name.toLowerCase().includes(query.trim().toLowerCase())), [products, query]);

  if (!productConsent) return <Screen><AppHeader title="마켓" /><View style={styles.consent}><Ionicons name="shield-checkmark-outline" size={52} color="#8A6B00" /><Text style={styles.consentTitle}>상품 정보 조회 동의</Text><Text style={styles.consentCopy}>동의하면 웰니스 태그와 관련된 상품 목록을 조회해요. OpenAI가 상품명을 만들거나 구매를 대신하지 않습니다.</Text><PrimaryButton label="동의하고 상품 보기" onPress={() => setProductConsent(true)} style={styles.consentButton} /></View></Screen>;

  return <Screen scroll><AppHeader title="마켓" leftIcon="menu" rightIcon="cart-outline" onRightPress={() => router.push('/market/cart')} />
    <View style={styles.body}>
      <View style={styles.search}><Ionicons name="search" size={22} color="#AAA" /><TextInput value={query} onChangeText={setQuery} placeholder="제품을 검색해보세요" placeholderTextColor="#AAA" style={styles.searchInput} />{query.length > 0 && <Pressable onPress={() => setQuery('')}><Ionicons name="close-circle" size={19} color="#AAA" /></Pressable>}</View>
      {totalCount > 0 && <Pressable style={styles.cartHint} onPress={() => router.push('/market/cart')}><Text style={styles.cartHintText}>장바구니에 담긴 상품 {totalCount}개</Text><Ionicons name="chevron-forward" size={16} color={colors.muted} /></Pressable>}
      {loading && <View style={styles.state}><ActivityIndicator color={colors.text} /><Text style={styles.empty}>상품을 불러오고 있어요.</Text></View>}
      {error && <View style={styles.state}><Text style={styles.error}>{error}</Text><PrimaryButton label="다시 시도" onPress={() => void loadProducts()} style={styles.retry} /></View>}
      {!loading && !error && products.length === 0 && <View style={styles.state}><Text style={styles.empty}>등록된 상품이 없습니다.{`\n`}새 상품 카탈로그 마이그레이션을 적용해주세요.</Text></View>}
      {!loading && !error && products.length > 0 && (query.trim().length > 0 ? <><View style={styles.heading}><Text style={styles.headingText}>검색 결과 ({searchResults.length})</Text></View>{searchResults.length === 0 ? <Text style={styles.empty}>일치하는 상품이 없어요</Text> : <View style={styles.grid}>{searchResults.map((product) => <ProductCard key={product.id} product={product} />)}</View>}</> : <><View style={styles.heading}><Text style={styles.headingText}>MY 추천 물품</Text><Pressable onPress={() => router.push({ pathname: '/market/list', params: { category: 'recommended' } })}><Text style={styles.more}>더보기</Text></Pressable></View><View style={styles.row}>{recommended.slice(0, 3).map((product) => <ProductCard key={product.id} product={product} />)}</View><View style={styles.heading}><Text style={styles.headingText}>인기상품</Text><Pressable onPress={() => router.push({ pathname: '/market/list', params: { category: 'popular' } })}><Text style={styles.more}>더보기</Text></Pressable></View><View style={styles.row}>{popular.slice(0, 3).map((product) => <ProductCard key={product.id} product={product} />)}</View></>)}
    </View>
  </Screen>;
}

const styles = StyleSheet.create({ body: { flex: 1, paddingTop: 20, paddingBottom: 40 }, consent: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }, consentTitle: { fontSize: 20, fontWeight: '800', marginTop: 20 }, consentCopy: { color: colors.muted, fontSize: 13, lineHeight: 21, textAlign: 'center', marginTop: 12 }, consentButton: { width: '100%', marginTop: 32 }, search: { height: 60, marginHorizontal: 24, borderRadius: radius.md, backgroundColor: colors.surfaceStrong, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20 }, searchInput: { flex: 1, fontSize: 14 }, cartHint: { marginHorizontal: 24, marginTop: 12, height: 44, borderRadius: radius.md, backgroundColor: colors.warningSoft, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }, cartHintText: { fontSize: 13, fontWeight: '600', color: colors.text }, heading: { height: 56, marginTop: 10, paddingHorizontal: 28, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, headingText: { fontSize: 15, fontWeight: '700' }, more: { fontSize: 12, color: colors.muted }, row: { flexDirection: 'row', gap: 9, paddingHorizontal: 24 }, grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, rowGap: 20, paddingHorizontal: 24 }, state: { alignItems: 'center', paddingHorizontal: 24, paddingTop: 48, gap: 16 }, empty: { textAlign: 'center', color: colors.muted, fontSize: 13, lineHeight: 21 }, error: { textAlign: 'center', color: '#B42318', fontSize: 13, lineHeight: 20 }, retry: { width: '100%' } });
