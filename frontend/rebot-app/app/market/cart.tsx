import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '@/src/components/AppHeader';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { Screen } from '@/src/components/Screen';
import { products } from '@/src/data/products';
import { useCart } from '@/src/store/CartContext';
import { colors } from '@/src/theme/tokens';

export default function CartScreen() {
  const { items, updateQty, removeItem, totalPrice } = useCart();

  const handleCheckout = () => Alert.alert('주문 완료', '주문이 접수되었습니다. (데모)', [{ text: '확인', onPress: () => router.back() }]);

  if (items.length === 0) return <Screen><AppHeader title="장바구니" back /><View style={styles.emptyBody}><Ionicons name="cart-outline" size={48} color={colors.subtle} /><Text style={styles.emptyText}>장바구니가 비어있어요</Text></View></Screen>;

  return <Screen scroll><AppHeader title="장바구니" back />
    <View style={styles.body}>
      {items.map((item) => {
        const product = products.find((candidate) => candidate.id === item.productId);
        if (!product) return null;
        return <View key={item.productId} style={styles.row}>
          <View style={[styles.thumb, { backgroundColor: product.color }]}><Ionicons name="leaf-outline" size={26} color="#777" /></View>
          <View style={styles.info}>
            <Text style={styles.name}>{product.name}</Text>
            <Text style={styles.price}>{(product.price * item.qty).toLocaleString()}원</Text>
            <View style={styles.qtyRow}>
              <Pressable style={styles.qtyButton} onPress={() => updateQty(item.productId, item.qty - 1)}><Ionicons name="remove" size={16} color={colors.text} /></Pressable>
              <Text style={styles.qty}>{item.qty}</Text>
              <Pressable style={styles.qtyButton} onPress={() => updateQty(item.productId, item.qty + 1)}><Ionicons name="add" size={16} color={colors.text} /></Pressable>
            </View>
          </View>
          <Pressable hitSlop={10} onPress={() => removeItem(item.productId)}><Ionicons name="close" size={20} color={colors.muted} /></Pressable>
        </View>;
      })}
    </View>
    <View style={styles.footer}>
      <View style={styles.totalRow}><Text style={styles.totalLabel}>총 결제금액</Text><Text style={styles.totalValue}>{totalPrice.toLocaleString()}원</Text></View>
      <PrimaryButton label="주문하기" onPress={handleCheckout} />
    </View>
  </Screen>;
}

const styles = StyleSheet.create({ body: { paddingHorizontal: 24, paddingTop: 16, gap: 16 }, row: { flexDirection: 'row', alignItems: 'center', gap: 14 }, thumb: { width: 64, height: 64, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }, info: { flex: 1, gap: 4 }, name: { fontSize: 14, fontWeight: '600' }, price: { fontSize: 13, color: colors.muted }, qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4 }, qtyButton: { width: 26, height: 26, borderRadius: 13, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }, qty: { fontSize: 14, fontWeight: '600', minWidth: 16, textAlign: 'center' }, footer: { marginTop: 32, paddingHorizontal: 24, paddingBottom: 24, gap: 16 }, totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 16, borderTopWidth: 1, borderColor: colors.border }, totalLabel: { fontSize: 15, fontWeight: '600' }, totalValue: { fontSize: 17, fontWeight: '800' }, emptyBody: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }, emptyText: { fontSize: 14, color: colors.muted } });
