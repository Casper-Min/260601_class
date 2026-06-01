# Sprint 03 — 배포 + 관측성

## 목표
프로덕션 배포를 완성하고 운영 가시성을 갖춘다.

## 범위 (In Scope)
- Vercel 프로젝트 연결 + 환경변수(Supabase) 구성 + 배포
- 배포 파이프라인에서 `npm run verify` 게이트
- 에러 로깅/모니터링 도입(Sentry 등)

## 비범위
- 결제, 반도체 외 도메인 확장

## 완료 기준
- [ ] `npm run verify` 통과
- [ ] Vercel 공개 URL에서 로그인 + 목표 CRUD 동작
- [ ] service role key 등 secret이 클라이언트에 노출되지 않음(최종 점검)
- [ ] 문서·`state/progress.json` 최신화
