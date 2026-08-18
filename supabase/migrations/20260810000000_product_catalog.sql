alter table public.products
  add column if not exists price_krw integer check (price_krw is null or price_krw >= 0);

insert into public.products (
  id, name, category, description, image_url, purchase_url, tags, price_krw, active
) values
  ('10000000-0000-4000-8000-000000000001', '저자극 보습 크림', 'recommended', '건조한 피부를 위한 데일리 보습 제품', null, 'https://search.shopping.naver.com/search/all?query=%EC%A0%80%EC%9E%90%EA%B7%B9%20%EB%B3%B4%EC%8A%B5%20%ED%81%AC%EB%A6%BC', '["hydration"]'::jsonb, 18900, true),
  ('10000000-0000-4000-8000-000000000002', '데일리 수분 케어', 'recommended', '일상적인 수분 보충을 돕는 케어 제품', null, 'https://search.shopping.naver.com/search/all?query=%EB%8D%B0%EC%9D%BC%EB%A6%AC%20%EC%88%98%EB%B6%84%20%EC%BC%80%EC%96%B4', '["hydration"]'::jsonb, 15900, true),
  ('10000000-0000-4000-8000-000000000003', '마그네슘 밸런스', 'recommended', '편안한 수면 루틴을 위한 제품', null, 'https://search.shopping.naver.com/search/all?query=%EB%A7%88%EA%B7%B8%EB%84%A4%EC%8A%98%20%EB%B0%B8%EB%9F%B0%EC%8A%A4', '["sleep"]'::jsonb, 22000, true),
  ('10000000-0000-4000-8000-000000000004', '숙면 아이필로우', 'recommended', '빛을 줄여 수면 환경을 돕는 아이필로우', null, 'https://search.shopping.naver.com/search/all?query=%EC%88%99%EB%A9%B4%20%EC%95%84%EC%9D%B4%ED%95%84%EB%A1%9C%EC%9A%B0', '["sleep"]'::jsonb, 12900, true),
  ('10000000-0000-4000-8000-000000000005', '저자극 클렌징 폼', 'popular', '부드러운 세안을 위한 저자극 클렌저', null, 'https://search.shopping.naver.com/search/all?query=%EC%A0%80%EC%9E%90%EA%B7%B9%20%ED%81%B4%EB%A0%8C%EC%A7%95%20%ED%8F%BC', '["hydration"]'::jsonb, 13900, true),
  ('10000000-0000-4000-8000-000000000006', '데스크 눈 휴식 타이머', 'popular', '화면 휴식 주기를 관리하는 데스크 도구', null, 'https://search.shopping.naver.com/search/all?query=%EB%8D%B0%EC%8A%A4%ED%81%AC%20%EB%88%88%20%ED%9C%B4%EC%8B%9D%20%ED%83%80%EC%9D%B4%EB%A8%B8', '["desk_environment"]'::jsonb, 25900, true),
  ('10000000-0000-4000-8000-000000000007', '스트레칭 폼롤러', 'popular', '짧은 스트레칭과 운동 루틴을 돕는 폼롤러', null, 'https://search.shopping.naver.com/search/all?query=%EC%8A%A4%ED%8A%B8%EB%A0%88%EC%B9%AD%20%ED%8F%BC%EB%A1%A4%EB%9F%AC', '["exercise"]'::jsonb, 19900, true),
  ('10000000-0000-4000-8000-000000000008', '무드등 화이트노이즈', 'popular', '편안한 취침 환경을 만드는 무드등', null, 'https://search.shopping.naver.com/search/all?query=%EB%AC%B4%EB%93%9C%EB%93%B1%20%ED%99%94%EC%9D%B4%ED%8A%B8%EB%85%B8%EC%9D%B4%EC%A6%88', '["sleep", "desk_environment"]'::jsonb, 34900, true)
on conflict (id) do update set
  name = excluded.name,
  category = excluded.category,
  description = excluded.description,
  image_url = excluded.image_url,
  purchase_url = excluded.purchase_url,
  tags = excluded.tags,
  price_krw = excluded.price_krw,
  active = excluded.active;
