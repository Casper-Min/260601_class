# ARCHITECTURE.md

## 기술 스택
- Next.js App Router
- TypeScript
- Supabase Auth
- Supabase Postgres
- Supabase Row Level Security
- Vercel 배포

## 책임 경계
- UI: src/app, src/features/*/components
- Server actions / queries: src/features/*/actions.ts, queries.ts
- Supabase client: src/lib/supabase/*
- Database schema: supabase/schema.sql
- Security rules: docs/SECURITY.md, Supabase RLS policies

## 규칙
클라이언트 코드는 public Supabase key만 사용할 수 있다.
서버 전용 secret은 Client Component에서 import하면 안 된다.
