import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '@/src/components/AppHeader';
import { FormField } from '@/src/components/FormField';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { Screen } from '@/src/components/Screen';
import { colors } from '@/src/theme/tokens';

export default function SupportEmailScreen() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) return Alert.alert('입력 확인', '제목과 내용을 모두 입력해주세요.');
    Alert.alert('문의가 접수되었습니다', '보내주신 문의는 익명으로 처리되며, 빠르게 답변드릴게요.', [{ text: '확인', onPress: () => router.back() }]);
  };

  return <Screen scroll><AppHeader title="이메일로 문의" back /><View style={styles.body}>
    <Text style={styles.notice}>문의 내용은 익명으로 접수되며, 답변이 필요하면 회신 받을 이메일을 내용에 함께 남겨주세요.</Text>
    <FormField label="제목" value={title} onChangeText={setTitle} placeholder="문의 제목을 입력하세요" maxLength={50} />
    <FormField label="내용" value={content} onChangeText={setContent} placeholder="문의 내용을 자세히 적어주세요" multiline maxLength={1000} />
    <PrimaryButton label="보내기" onPress={handleSubmit} style={styles.button} />
  </View></Screen>;
}

const styles = StyleSheet.create({ body: { flex: 1, paddingHorizontal: 24, paddingTop: 20, gap: 20, paddingBottom: 40 }, notice: { fontSize: 12, color: colors.muted, lineHeight: 18 }, button: { marginTop: 12 } });
