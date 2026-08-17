import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '@/src/components/AppHeader';
import { Screen } from '@/src/components/Screen';
import { colors, radius } from '@/src/theme/tokens';

const FAQ_ITEMS = [
  {
    question: 'AI 자가진단 결과가 의료 진단인가요?',
    answer: '아니에요. AI 자가진단은 입력하신 증상과 최근 생활 기록을 바탕으로 참고할 만한 원인 후보와 행동 제안을 보여드리는 웰니스 정보 서비스이며, 의학적 진단이나 처방이 아닙니다. 증상이 지속되거나 악화되면 반드시 전문 의료기관을 방문해 주세요.',
  },
  {
    question: 'AI 자가진단과 AI 솔루션은 어떻게 다른가요?',
    answer: 'AI 자가진단은 증상을 입력하면 AI가 여러 원인 후보를 제시하고, 그중 맞는 것을 고르면 해결 방법을 제안하는 기능이에요. AI 솔루션은 반대로 원인을 이미 알고 있는 상황(예: 회식이 있어서 술을 마셔야 하는 상황)을 입력하면 바로 실행 가능한 행동을 제안해주는 기능이에요.',
  },
  {
    question: '입력한 증상, 사진, 생활 기록은 어떻게 쓰이나요?',
    answer: 'AI가 더 정확한 후보와 제안을 만드는 데에만 사용돼요. 증상 설명과 사진은 원인 분석에, 수면·스트레스·운동 등 생활 기록은 최근 며칠간의 패턴을 참고하는 데 쓰입니다. 자세한 항목과 보관 기간은 고객센터의 개인정보처리방침에서 확인하실 수 있어요.',
  },
  {
    question: '지병·알레르기 같은 특이사항을 꼭 입력해야 하나요?',
    answer: '아니요, 선택 사항이에요. 다만 입력해 두시면 AI가 원인 후보를 분석할 때 함께 참고하기 때문에 더 정확한 제안을 받을 수 있어요. 마이페이지의 회원정보 수정에서 언제든지 추가하거나 수정할 수 있습니다.',
  },
  {
    question: '마인드맵은 어떤 기준으로 만들어지나요?',
    answer: '완료된 자가진단 기록에서 AI가 제시한 원인과, 그 원인이 설명하는 증상을 모아 자동으로 구성돼요. 원인 가지를 누르면 관련된 증상들을 볼 수 있고, 자가진단을 더 진행할수록 마인드맵이 채워집니다. AI 솔루션으로 상담한 내용은 마인드맵에 포함되지 않아요.',
  },
  {
    question: '대화 내역은 얼마나 보관되나요?',
    answer: '분석 결과와 이어서 나눈 대화는 마지막 대화로부터 90일이 지나면 자동으로 삭제돼요. 그전에 직접 지우고 싶다면 대화 내역 상세 화면 우측 상단의 휴지통 아이콘으로 바로 삭제할 수 있어요. AI 솔루션으로 상담한 내용은 대화 내역에 남지 않아요.',
  },
  {
    question: '제안된 해결 방법이 저와 맞지 않으면 어떻게 하나요?',
    answer: '결과 화면이나 대화에서 도움이 안 됐다는 피드백을 남기면 AI가 더 쉬운 대안을 다시 제안해 드려요. AI 솔루션에서는 "다른 대안" 버튼으로 바로 새 제안을 받을 수 있어요.',
  },
  {
    question: '홈 화면 후속 조치 알림은 언제 오나요?',
    answer: '자가진단 후 어느 정도 시간이 지나면 "지금은 어떠신가요?" 알림이 떠요. "해결됐습니다" 또는 "아직 안 나았어요" 중 하나를 누르면 그 알림은 홈 화면에서 사라지고, 이후에는 알림(종 아이콘) 목록에서 다시 확인할 수 있어요.',
  },
  {
    question: '카카오 계정 외 다른 방법으로 로그인할 수 있나요?',
    answer: '네, 이메일과 비밀번호로도 가입하고 로그인할 수 있어요. 로그인 화면에서 원하는 방법을 선택해 주세요.',
  },
  {
    question: '회원 탈퇴를 하면 제 데이터는 어떻게 되나요?',
    answer: '탈퇴를 요청하시면 관련 법령에서 별도로 보관해야 하는 경우를 제외하고 프로필, 증상 기록, 대화 내역 등 개인정보가 지체 없이 삭제됩니다.',
  },
  {
    question: '문의를 남기면 답변은 언제 받을 수 있나요?',
    answer: '고객센터의 "이메일로 문의"를 통해 접수해 주시면 순차적으로 확인 후 회신드려요. 답변을 받으시려면 문의 내용에 회신받을 이메일 주소를 함께 남겨 주세요.',
  },
] as const;

export default function SupportFaqScreen() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return <Screen scroll><AppHeader title="자주 묻는 질문" back /><View style={styles.body}>
    {FAQ_ITEMS.map((item, index) => {
      const open = openIndex === index;
      return <View key={item.question} style={styles.item}>
        <Pressable style={styles.questionRow} onPress={() => setOpenIndex(open ? null : index)}>
          <Text style={styles.qMark}>Q</Text>
          <Text style={styles.question}>{item.question}</Text>
          <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={colors.muted} />
        </Pressable>
        {open && <View style={styles.answerRow}>
          <Text style={styles.aMark}>A</Text>
          <Text style={styles.answer}>{item.answer}</Text>
        </View>}
      </View>;
    })}
  </View></Screen>;
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 40, gap: 10 },
  item: { borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, overflow: 'hidden' },
  questionRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 16, paddingHorizontal: 16 },
  qMark: { width: 20, fontSize: 14, fontWeight: '800', color: colors.accent },
  question: { flex: 1, fontSize: 14, fontWeight: '700', color: colors.text, lineHeight: 20 },
  answerRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingBottom: 18, paddingTop: 2 },
  aMark: { width: 20, fontSize: 14, fontWeight: '800', color: colors.muted },
  answer: { flex: 1, fontSize: 13, lineHeight: 21, color: colors.muted },
});
