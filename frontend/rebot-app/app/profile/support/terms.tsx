import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '@/src/components/AppHeader';
import { Screen } from '@/src/components/Screen';
import { colors, radius } from '@/src/theme/tokens';

const docs = {
  terms: {
    title: '이용약관',
    tabLabel: '이용약관',
    body: '제1조 (목적)\n이 약관은 RE:BOT(이하 "회사")이 제공하는 AI 웰니스 자가진단 서비스(이하 "서비스")의 이용과 관련하여 회사와 회원의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.\n\n제2조 (서비스의 성격)\n① 서비스는 회원이 입력한 증상, 생활 기록 등을 바탕으로 AI가 참고용 원인 후보와 행동 제안을 제공하는 웰니스 정보 서비스입니다.\n② 서비스가 제공하는 정보는 의학적 진단, 처방, 치료를 대체하지 않으며, 증상이 지속되거나 악화될 경우 전문 의료기관의 진료를 받아야 합니다.\n\n제3조 (회원가입 및 계정)\n① 회원은 카카오 계정 또는 이메일로 가입할 수 있습니다.\n② 회원은 정확한 정보를 제공해야 하며, 허위 정보로 인한 불이익은 회원 본인이 부담합니다.\n\n제4조 (서비스 이용)\n① 회사는 서비스의 안정적 제공을 위해 노력하나, 시스템 점검, 외부 AI 서비스 장애 등으로 서비스가 일시 중단될 수 있습니다.\n② 회원은 서비스를 통해 얻은 정보를 본인의 판단과 책임 하에 활용해야 합니다.\n\n제5조 (회원 탈퇴)\n회원은 언제든지 앱 내 설정을 통해 탈퇴를 요청할 수 있으며, 탈퇴 시 관련 법령에서 정한 경우를 제외하고 개인정보는 지체 없이 파기됩니다.\n\n제6조 (면책)\n회사는 회원이 서비스에서 제공한 정보를 의료적 판단의 근거로 오·남용하여 발생한 손해에 대해 책임을지지 않습니다.\n\n부칙\n본 약관은 서비스 내 공지를 통해 개정될 수 있으며, 개정 시 사전에 고지합니다.',
  },
  notice: {
    title: '주의사항',
    tabLabel: '주의사항',
    body: '• RE:BOT이 제공하는 원인 후보와 행동 제안은 AI가 생성한 참고 정보이며, 의료적 진단이나 처방이 아닙니다.\n\n• 증상이 지속되거나 악화되는 경우, 갑작스럽거나 심한 통증이 있는 경우에는 반드시 전문 의료기관을 방문해 주세요.\n\n• 응급 상황(호흡곤란, 심한 흉통, 의식 저하 등)에는 즉시 119 또는 응급실을 이용해 주세요. 서비스는 응급 대응 수단이 아닙니다.\n\n• AI 자가진단 결과는 회원이 입력한 정보(증상 설명, 사진, 최근 생활 기록)에만 근거하며, 입력하지 않은 정보는 반영되지 않습니다.\n\n• AI 솔루션(상황 기반 제안) 기능은 자가진단과 별개로, 이미 원인을 알고 있는 상황에 대한 실행 가능한 행동을 제안하는 기능입니다.\n\n• 대화 내역은 회원이 직접 삭제할 수 있으며, 마지막 대화로부터 90일이 지나면 자동으로 삭제됩니다.\n\n• 서비스 이용 중 수집되는 정보는 더 나은 제안을 제공하기 위한 목적으로만 사용되며, 자세한 내용은 개인정보처리방침을 확인해 주세요.',
  },
  privacy: {
    title: '개인정보처리방침',
    tabLabel: '개인정보',
    body: 'RE:BOT(이하 "회사")은 이용자의 개인정보를 중요하게 생각하며, 「개인정보 보호법」 등 관련 법령을 준수합니다. 아래는 서비스 운영을 위해 실제로 수집·이용하는 항목을 기준으로 작성한 방침입니다.\n\n1. 수집하는 개인정보 항목\n- 필수: 이메일, 닉네임, 카카오 로그인 식별자(카카오 로그인 이용 시)\n- 선택: 직업, 출생연도, 성별, 평균 수면시간, 특이사항(지병·알레르기)\n- 서비스 이용 중 생성: 증상 설명 및 첨부 사진, 일일 생활 기록(수면·스트레스·운동·카페인·음주 등), AI 자가진단 결과 및 원인 후보, AI와 나눈 대화 내용\n\n2. 수집 및 이용 목적\n- 회원 식별 및 서비스 제공\n- AI 자가진단·AI 솔루션·추천 해결책 생성\n- 반복 증상 등을 확인하는 웰니스 프로필 제공\n- 고객 문의 응대\n\n3. 보유 및 이용 기간\n- 회원 정보: 탈퇴 시까지 (탈퇴 시 지체 없이 파기, 관련 법령에 따라 일정 기간 보관이 필요한 경우 제외)\n- AI 대화 내역: 마지막 대화로부터 90일간 보관 후 자동 삭제, 회원이 직접 삭제 요청 시 즉시 삭제\n- 문의 내역: 처리 완료 후 1년\n\n4. 개인정보의 제3자 제공 및 처리위탁\n- 회사는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다.\n- AI 분석 처리를 위해 증상 설명 등 입력 정보가 AI 모델 제공업체(OpenAI)에 전송되며, 인증·데이터 저장을 위해 Supabase(클라우드 인프라)를 이용합니다. 이는 서비스 제공에 필수적인 위탁 처리입니다.\n\n5. 이용자의 권리\n이용자는 언제든지 앱 내에서 본인의 프로필 정보 조회·수정, 자가진단 기록 및 대화 내역 삭제, 회원 탈퇴를 직접 진행할 수 있으며, 고객센터를 통해서도 열람·정정·삭제를 요청할 수 있습니다.\n\n6. 개인정보의 안전성 확보 조치\n회사는 개인정보에 대한 접근 권한을 최소한으로 제한하고, 통신 구간 암호화 등 기술적 조치를 통해 개인정보를 안전하게 관리합니다.\n\n7. 개인정보 보호책임자 및 문의처\n개인정보 관련 문의는 고객센터의 "이메일로 문의"를 통해 접수해 주세요.\n\n8. 고지의 의무\n본 방침은 관련 법령 또는 서비스 변경에 따라 개정될 수 있으며, 변경 시 서비스 내 공지를 통해 사전에 안내합니다.',
  },
} as const;

export default function SupportTermsScreen() {
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  const initialTab = tab === 'notice' || tab === 'privacy' ? tab : 'terms';
  const [active, setActive] = useState<keyof typeof docs>(initialTab);
  const doc = docs[active];

  return <Screen scroll><AppHeader title="약관 및 정책" back /><View style={styles.body}>
    <View style={styles.tabs}>{(Object.keys(docs) as (keyof typeof docs)[]).map((key) => <Pressable key={key} style={[styles.tab, active === key && styles.tabActive]} onPress={() => setActive(key)}><Text style={[styles.tabLabel, active === key && styles.tabLabelActive]} numberOfLines={1}>{docs[key].tabLabel}</Text></Pressable>)}</View>
    <Text style={styles.docTitle}>{doc.title}</Text>
    <Text style={styles.docBody}>{doc.body}</Text>
  </View></Screen>;
}

const styles = StyleSheet.create({ body: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40 }, tabs: { flexDirection: 'row', gap: 6, marginBottom: 24 }, tab: { flex: 1, height: 44, borderRadius: radius.md, backgroundColor: colors.surfaceStrong, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 }, tabActive: { backgroundColor: colors.black }, tabLabel: { fontSize: 12, fontWeight: '600', color: colors.muted }, tabLabelActive: { color: colors.white }, docTitle: { fontSize: 17, fontWeight: '700', marginBottom: 12 }, docBody: { fontSize: 13, lineHeight: 22, color: colors.text } });
