import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { AppHeader } from '@/src/components/AppHeader';
import { Screen } from '@/src/components/Screen';
import { colors, radius } from '@/src/theme/tokens';

const products = [
  { name: '저자극 보습 크림', tag: '피부 진정', color: '#EAE5DC' },
  { name: '데일리 수분 케어', tag: '수분 보충', color: '#DFECF1' },
  { name: '마그네슘 밸런스', tag: '수면 루틴', color: '#E9E2F3' },
];

function ProductCard({ name, tag, color }: (typeof products)[number]) {
  return <View style={styles.product}><View style={[styles.productImage, { backgroundColor: color }]}><Ionicons name="leaf-outline" size={34} color="#777" /></View><Text style={styles.productTag}>{tag}</Text><Text style={styles.productName} numberOfLines={2}>{name}</Text></View>;
}

export default function MarketScreen() {
  return <Screen><AppHeader title="마켓" leftIcon="menu" rightIcon="cart-outline" /><View style={styles.body}><View style={styles.search}><Ionicons name="search" size={22} color="#AAA" /><TextInput placeholder="제품을 검색해보세요" placeholderTextColor="#AAA" style={styles.searchInput} /></View><View style={styles.heading}><Text style={styles.headingText}>MY 추천 물품</Text><Text style={styles.more}>더보기</Text></View><View style={styles.row}>{products.map((product) => <ProductCard key={product.name} {...product} />)}</View><View style={styles.heading}><Text style={styles.headingText}>인기상품</Text><Text style={styles.more}>더보기</Text></View><View style={styles.row}>{products.slice().reverse().map((product) => <ProductCard key={`popular-${product.name}`} {...product} />)}</View></View></Screen>;
}

const styles = StyleSheet.create({ body: { flex: 1, paddingTop: 20 }, search: { height: 60, marginHorizontal: 24, borderRadius: radius.md, backgroundColor: colors.surfaceStrong, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20 }, searchInput: { flex: 1, fontSize: 14 }, heading: { height: 56, marginTop: 10, paddingHorizontal: 28, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, headingText: { fontSize: 15, fontWeight: '700' }, more: { fontSize: 12, color: colors.muted }, row: { flexDirection: 'row', gap: 9, paddingHorizontal: 24 }, product: { width: '31%' }, productImage: { height: 112, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }, productTag: { fontSize: 10, color: colors.muted, marginTop: 8 }, productName: { fontSize: 13, fontWeight: '600', marginTop: 3, lineHeight: 18 } });
