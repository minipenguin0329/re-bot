import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '@/src/components/AppHeader';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { Screen } from '@/src/components/Screen';
import { useCart } from '@/src/store/CartContext';
import { colors } from '@/src/theme/tokens';

export default function CartScreen() {
  const { items, updateQty, removeItem, clearCart, totalPrice } = useCart();

  const handleCheckout = () => Alert.alert('데모 장바구니', '결제 API는 아직 연결되지 않았어요. 상품 선택 흐름만 확인할 수 있습니다.', [{ text: '장바구니 비우기', style: 'destructive', onPress: () => { clearCart(); router.back(); } }, { text: '닫기', style: 'cancel' }]);

  if (items.length === 0) return <Screen><AppHeader title="장바구니" back /><View style={styles.emptyBody}><Ionicons name="cart-outline" size={48} color={colors.subtle} /><Text style={styles.emptyText}>장바구니가 비어있어요</Text></View></Screen>;

  return <Screen scroll><AppHeader title="장바구니" back />
    <View style={styles.body}>
      {items.map((item) => {
        const product = item.product;
        return <View key={product.id} style={styles.row}>
          <View style={[styles.thumb, { backgroundColor: product.color }]}><Ionicons name="leaf-outline" size={26} color="#777" /></View>
          <View style={styles.info}>
            <Text style={styles.name}>{product.name}</Text>
            <Text style={styles.price}>{(product.price * item.qty).toLocaleString()}원</Text>
            <View style={styles.qtyRow}>
              <Pressable style={styles.qtyButton} onPress={() => updateQty(product.id, item.qty - 1)}><Ionicons name="remove" size={16} color={colors.text} /></Pressable>
              <Text style={styles.qty}>{item.qty}</Text>
              <Pressable style={styles.qtyButton} onPress={() => updateQty(product.id, item.qty + 1)}><Ionicons name="add" size={16} color={colors.text} /></Pressable>
            </View>
          </View>
          <Pressable hitSlop={10} onPress={() => removeItem(product.id)}><Ionicons name="close" size={20} color={colors.muted} /></Pressable>
        </View>;
      })}
    </View>
    <View style={styles.footer}>
      <View style={styles.totalRow}><Text style={styles.totalLabel}>총 결제금액</Text><Text style={styles.totalValue}>{totalPrice.toLocaleString()}원</Text></View>
      <PrimaryButton label="결제 흐름 확인 (데모)" onPress={handleCheckout} />
    </View>
  </Screen>;
}

const styles = StyleSheet.create({ body: { paddingHorizontal: 24, paddingTop: 16, gap: 16 }, row: { flexDirection: 'row', alignItems: 'center', gap: 14 }, thumb: { width: 64, height: 64, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }, info: { flex: 1, gap: 4 }, name: { fontSize: 14, fontWeight: '600' }, price: { fontSize: 13, color: colors.muted }, qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4 }, qtyButton: { width: 26, height: 26, borderRadius: 13, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }, qty: { fontSize: 14, fontWeight: '600', minWidth: 16, textAlign: 'center' }, footer: { marginTop: 32, paddingHorizontal: 24, paddingBottom: 24, gap: 16 }, totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 16, borderTopWidth: 1, borderColor: colors.border }, totalLabel: { fontSize: 15, fontWeight: '600' }, totalValue: { fontSize: 17, fontWeight: '800' }, emptyBody: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }, emptyText: { fontSize: 14, color: colors.muted } });
