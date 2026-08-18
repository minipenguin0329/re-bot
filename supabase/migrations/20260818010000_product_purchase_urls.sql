-- Backfill external product-search URLs for catalogs created before URLs were added.
update public.products as product
set purchase_url = urls.purchase_url
from (
  values
    ('10000000-0000-4000-8000-000000000001'::uuid, 'https://search.shopping.naver.com/search/all?query=%EC%A0%80%EC%9E%90%EA%B7%B9%20%EB%B3%B4%EC%8A%B5%20%ED%81%AC%EB%A6%BC'),
    ('10000000-0000-4000-8000-000000000002'::uuid, 'https://search.shopping.naver.com/search/all?query=%EB%8D%B0%EC%9D%BC%EB%A6%AC%20%EC%88%98%EB%B6%84%20%EC%BC%80%EC%96%B4'),
    ('10000000-0000-4000-8000-000000000003'::uuid, 'https://search.shopping.naver.com/search/all?query=%EB%A7%88%EA%B7%B8%EB%84%A4%EC%8A%98%20%EB%B0%B8%EB%9F%B0%EC%8A%A4'),
    ('10000000-0000-4000-8000-000000000004'::uuid, 'https://search.shopping.naver.com/search/all?query=%EC%88%99%EB%A9%B4%20%EC%95%84%EC%9D%B4%ED%95%84%EB%A1%9C%EC%9A%B0'),
    ('10000000-0000-4000-8000-000000000005'::uuid, 'https://search.shopping.naver.com/search/all?query=%EC%A0%80%EC%9E%90%EA%B7%B9%20%ED%81%B4%EB%A0%8C%EC%A7%95%20%ED%8F%BC'),
    ('10000000-0000-4000-8000-000000000006'::uuid, 'https://search.shopping.naver.com/search/all?query=%EB%8D%B0%EC%8A%A4%ED%81%AC%20%EB%88%88%20%ED%9C%B4%EC%8B%9D%20%ED%83%80%EC%9D%B4%EB%A8%B8'),
    ('10000000-0000-4000-8000-000000000007'::uuid, 'https://search.shopping.naver.com/search/all?query=%EC%8A%A4%ED%8A%B8%EB%A0%88%EC%B9%AD%20%ED%8F%BC%EB%A1%A4%EB%9F%AC'),
    ('10000000-0000-4000-8000-000000000008'::uuid, 'https://search.shopping.naver.com/search/all?query=%EB%AC%B4%EB%93%9C%EB%93%B1%20%ED%99%94%EC%9D%B4%ED%8A%B8%EB%85%B8%EC%9D%B4%EC%A6%88')
) as urls(id, purchase_url)
where product.id = urls.id;
