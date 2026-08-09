import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { AppHeader } from '@/src/components/AppHeader';
import { ProductCard } from '@/src/components/ProductCard';
import { Screen } from '@/src/components/Screen';
import { products } from '@/src/data/products';
import { useCart } from '@/src/store/CartContext';
import { colors, radius } from '@/src/theme/tokens';

export default function MarketScreen() {
  const [query, setQuery] = useState('');
  const { totalCount } = useCart();
  const recommended = products.filter((product) => product.category === 'recommended');
  const popular = products.filter((product) => product.category === 'popular');
  const searchResults = useMemo(() => products.filter((product) => product.name.includes(query.trim())), [query]);

  return <Screen scroll bottomSafe={false}><AppHeader title="마켓" leftIcon="menu" rightIcon="cart-outline" onRightPress={() => router.push('/market/cart')} />
    <View style={styles.body}>
      <View style={styles.search}><Ionicons name="search" size={22} color="#AAA" /><TextInput value={query} onChangeText={setQuery} placeholder="제품을 검색해보세요" placeholderTextColor="#AAA" style={styles.searchInput} />{query.length > 0 && <Pressable onPress={() => setQuery('')}><Ionicons name="close-circle" size={19} color="#AAA" /></Pressable>}</View>
      {totalCount > 0 && <Pressable style={styles.cartHint} onPress={() => router.push('/market/cart')}><Text style={styles.cartHintText}>장바구니에 담긴 상품 {totalCount}개</Text><Ionicons name="chevron-forward" size={16} color={colors.muted} /></Pressable>}

      {query.trim().length > 0 ? (
        <>
          <View style={styles.heading}><Text style={styles.headingText}>검색 결과 ({searchResults.length})</Text></View>
          {searchResults.length === 0 ? <Text style={styles.empty}>일치하는 상품이 없어요</Text> : <View style={styles.grid}>{searchResults.map((product) => <ProductCard key={product.id} product={product} />)}</View>}
        </>
      ) : (
        <>
          <View style={styles.heading}><Text style={styles.headingText}>MY 추천 물품</Text><Pressable onPress={() => router.push({ pathname: '/market/list', params: { category: 'recommended' } })}><Text style={styles.more}>더보기</Text></Pressable></View>
          <View style={styles.row}>{recommended.map((product) => <ProductCard key={product.id} product={product} />)}</View>
          <View style={styles.heading}><Text style={styles.headingText}>인기상품</Text><Pressable onPress={() => router.push({ pathname: '/market/list', params: { category: 'popular' } })}><Text style={styles.more}>더보기</Text></Pressable></View>
          <View style={styles.row}>{popular.map((product) => <ProductCard key={product.id} product={product} />)}</View>
        </>
      )}
    </View>
  </Screen>;
}

const styles = StyleSheet.create({ body: { flex: 1, paddingTop: 20, paddingBottom: 40 }, search: { height: 60, marginHorizontal: 24, borderRadius: radius.md, backgroundColor: colors.surfaceStrong, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20 }, searchInput: { flex: 1, fontSize: 14 }, cartHint: { marginHorizontal: 24, marginTop: 12, height: 44, borderRadius: radius.md, backgroundColor: colors.warningSoft, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }, cartHintText: { fontSize: 13, fontWeight: '600', color: colors.text }, heading: { height: 56, marginTop: 10, paddingHorizontal: 28, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, headingText: { fontSize: 15, fontWeight: '700' }, more: { fontSize: 12, color: colors.muted }, row: { flexDirection: 'row', gap: 9, paddingHorizontal: 24 }, grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, rowGap: 20, paddingHorizontal: 24 }, empty: { textAlign: 'center', color: colors.muted, fontSize: 13, marginTop: 30 } });
