#!/usr/bin/env node
/**
 * Stop hook.
 * CLAUDE.md "작업을 끝내기 전에 반드시 실행할 것" 규칙 리마인드.
 * 차단하지 않고(systemMessage만) 사용자에게 마무리 체크리스트를 보여준다.
 */
process.stdout.write(
  JSON.stringify({
    systemMessage:
      "✅ 작업 마무리 체크 (CLAUDE.md):\n" +
      "  1) npm run verify 통과했는가?\n" +
      "  2) state/progress.json 최신화했는가?\n" +
      "  3) 관련 문서(docs/*, sprint contract) 업데이트했는가?\n" +
      "  4) Supabase RLS 가정/보안 규칙이 문서화되어 있는가?",
  })
);
