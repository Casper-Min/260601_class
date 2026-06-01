# sprint-03 contract — 워치리스트 + 신뢰성/관측성 + 배포

## 목표
로그인 사용자 기능을 완성하고, 신뢰성·관측성을 갖춰 Vercel에 배포한다.

## 범위 (In Scope)
- `/watchlist`: 로그인 사용자의 관심 종목 CRUD (RLS로 본인 데이터만).
- 대시보드/상세에서 워치리스트 추가/삭제 액션 (`src/features/watchlist/actions.ts`).
- Vercel Cron 스케줄 등록으로 일별 ingest 자동화.
- 관측성: ingest 성공/실패/소요시간 로깅, 마지막 성공 수집 시각 노출.
- 프로덕션 환경변수(secret) 구성 및 배포.

## 비범위
- 결제, 알림(이메일/푸시), 반도체 외 업종 확장.

## 완료 기준 (Definition of Done)
- [ ] `npm run verify` 통과.
- [ ] 워치리스트가 RLS로 보호됨: 타 사용자 데이터 접근 불가 테스트.
- [ ] Vercel Cron이 ingest를 자동 실행하고 결과가 로깅됨.
- [ ] 프로덕션에 배포되어 공개 URL에서 동작.
- [ ] service role 키 등 secret이 클라이언트에 노출되지 않음(최종 점검).
- [ ] 관련 문서·`state/progress.json` 최신화.
