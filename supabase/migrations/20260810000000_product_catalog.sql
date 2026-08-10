alter table public.products
  add column if not exists price_krw integer check (price_krw is null or price_krw >= 0);

insert into public.products (
  id, name, category, description, image_url, purchase_url, tags, price_krw, active
) values
  ('10000000-0000-4000-8000-000000000001', '저자극 보습 크림', 'recommended', '건조한 피부를 위한 데일리 보습 제품', null, null, '["hydration"]'::jsonb, 18900, true),
  ('10000000-0000-4000-8000-000000000002', '데일리 수분 케어', 'recommended', '일상적인 수분 보충을 돕는 케어 제품', null, null, '["hydration"]'::jsonb, 15900, true),
  ('10000000-0000-4000-8000-000000000003', '마그네슘 밸런스', 'recommended', '편안한 수면 루틴을 위한 제품', null, null, '["sleep"]'::jsonb, 22000, true),
  ('10000000-0000-4000-8000-000000000004', '숙면 아이필로우', 'recommended', '빛을 줄여 수면 환경을 돕는 아이필로우', null, null, '["sleep"]'::jsonb, 12900, true),
  ('10000000-0000-4000-8000-000000000005', '저자극 클렌징 폼', 'popular', '부드러운 세안을 위한 저자극 클렌저', null, null, '["hydration"]'::jsonb, 13900, true),
  ('10000000-0000-4000-8000-000000000006', '데스크 눈 휴식 타이머', 'popular', '화면 휴식 주기를 관리하는 데스크 도구', null, null, '["desk_environment"]'::jsonb, 25900, true),
  ('10000000-0000-4000-8000-000000000007', '스트레칭 폼롤러', 'popular', '짧은 스트레칭과 운동 루틴을 돕는 폼롤러', null, null, '["exercise"]'::jsonb, 19900, true),
  ('10000000-0000-4000-8000-000000000008', '무드등 화이트노이즈', 'popular', '편안한 취침 환경을 만드는 무드등', null, null, '["sleep", "desk_environment"]'::jsonb, 34900, true)
on conflict (id) do update set
  name = excluded.name,
  category = excluded.category,
  description = excluded.description,
  image_url = excluded.image_url,
  purchase_url = excluded.purchase_url,
  tags = excluded.tags,
  price_krw = excluded.price_krw,
  active = excluded.active;
