# sprint-02 contract — 수집 파이프라인 + 점수 + 비교 대시보드

## 목표
일별 데이터를 수집하고 밸류에이션 점수를 계산해 비교 대시보드로 보여준다.

## 범위 (In Scope)
- `/api/cron/ingest` 서버 라우트: 외부 시세 → `daily_quotes` upsert (멱등, service role).
- 밸류에이션 점수 계산 로직([QUALITY_SCORE.md](../QUALITY_SCORE.md)) → `valuation_scores` 적재.
- `/dashboard`: 전체 업체 비교 테이블(주가, PER, 점수, 라벨, 랭킹) + 정렬/필터.
- `/companies/[ticker]`: 주가·PER·점수 추이 상세.
- `/`: 오늘의 고평가/저평가 Top N 요약.
- [RELIABILITY.md](../RELIABILITY.md)의 부분 실패/결측 처리 반영.

## 비범위
- 워치리스트, 프로덕션 배포/Cron 스케줄 등록(설정만 준비).

## 완료 기준 (Definition of Done)
- [ ] `npm run verify` 통과.
- [ ] ingest를 두 번 실행해도 중복 적재가 없음(멱등성 테스트).
- [ ] EPS ≤ 0 / 결측 종목이 점수에서 제외되고 UI에 "데이터 없음" 표기.
- [ ] 점수·라벨·랭킹이 QUALITY_SCORE.md 산식과 일치(단위 테스트).
- [ ] 대시보드가 마지막 성공 스냅샷과 기준일을 표시.
- [ ] 관련 문서·`state/progress.json` 최신화.
