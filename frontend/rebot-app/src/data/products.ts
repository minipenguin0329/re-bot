export type Product = { id: string; name: string; tag: string; color: string; price: number; category: 'recommended' | 'popular' };

export const products: Product[] = [
  { id: 'p1', name: '저자극 보습 크림', tag: '피부 진정', color: '#EAE5DC', price: 18900, category: 'recommended' },
  { id: 'p2', name: '데일리 수분 케어', tag: '수분 보충', color: '#DFECF1', price: 15900, category: 'recommended' },
  { id: 'p3', name: '마그네슘 밸런스', tag: '수면 루틴', color: '#E9E2F3', price: 22000, category: 'recommended' },
  { id: 'p4', name: '숙면 아이필로우', tag: '수면 루틴', color: '#E4E9F0', price: 12900, category: 'recommended' },
  { id: 'p5', name: '저자극 클렌징 폼', tag: '피부 진정', color: '#F0E7E1', price: 13900, category: 'popular' },
  { id: 'p6', name: '루테인 눈 영양제', tag: '눈 피로', color: '#E5EFE3', price: 25900, category: 'popular' },
  { id: 'p7', name: '스트레칭 폼롤러', tag: '바른 자세', color: '#F1E9EC', price: 19900, category: 'popular' },
  { id: 'p8', name: '무드등 화이트노이즈', tag: '수면 루틴', color: '#E7E7F2', price: 34900, category: 'popular' },
];
