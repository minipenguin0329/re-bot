import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useCart } from '@/src/store/CartContext';
import { colors } from '@/src/theme/tokens';
import { Product } from '@/src/data/products';

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  return <View style={styles.product}>
    <View style={[styles.image, { backgroundColor: product.color }]}>
      <Ionicons name="leaf-outline" size={34} color="#777" />
      <Pressable hitSlop={8} style={({ pressed }) => [styles.add, pressed && styles.addPressed]} onPress={() => addItem(product.id)}><Ionicons name="add" size={16} color={colors.white} /></Pressable>
    </View>
    <Text style={styles.tag}>{product.tag}</Text>
    <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
    <Text style={styles.price}>{product.price.toLocaleString()}원</Text>
  </View>;
}

const styles = StyleSheet.create({ product: { width: '31%' }, image: { height: 112, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }, add: { position: 'absolute', right: 8, bottom: 8, width: 26, height: 26, borderRadius: 13, backgroundColor: colors.black, alignItems: 'center', justifyContent: 'center' }, addPressed: { opacity: 0.6 }, tag: { fontSize: 10, color: colors.muted, marginTop: 8 }, name: { fontSize: 13, fontWeight: '600', marginTop: 3, lineHeight: 18 }, price: { fontSize: 12, fontWeight: '700', marginTop: 3, color: colors.text } });
