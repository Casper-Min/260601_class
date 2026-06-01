export const meta = {
  name: 'build-with-evaluation',
  description: '프로젝트 작업을 팀원(빌더)에게 분배하고, 평가자(qa-evaluator)가 ACCEPTED를 줄 때까지 빌드↔평가를 반복한다',
  phases: [
    { title: 'Build' },
    { title: 'Evaluate' },
  ],
}

// 평가자 판정 스키마 — 빌드를 멈출지(ACCEPTED) 계속할지(REJECTED)를 결정한다.
const VERDICT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['verdict', 'blocking_issues', 'summary'],
  properties: {
    verdict: { type: 'string', enum: ['ACCEPTED', 'REJECTED'] },
    blocking_issues: {
      type: 'array',
      items: { type: 'string' },
      description: 'REJECTED일 때 빌더가 바로 고칠 수 있는 구체적 수정 지시(파일:라인 + 기대 동작)',
    },
    verify_passed: { type: 'boolean', description: 'npm run verify를 실제로 돌려 통과했는지' },
    summary: { type: 'string', description: '판정 근거 요약' },
  },
}

// 기본 작업 목록(goal-lab sprint-01). args로 [{id, role, title}] 배열을 넘기면 대체된다.
// role 은 .claude/agents 의 빌더 에이전트 이름과 일치해야 한다.
const DEFAULT_TASKS = [
  { id: 'T2', role: 'supabase-engineer', title: 'goals 테이블 + RLS 정책 + Supabase Auth 로그인 구현' },
  { id: 'T3', role: 'backend-engineer', title: '로그인 사용자의 목표(goals) server actions/queries (CRUD, 본인 데이터만)' },
  { id: 'T3b', role: 'frontend-engineer', title: '목표(goals) CRUD UI 페이지/컴포넌트 (App Router)' },
  { id: 'T1', role: 'ssot-doc-guardian', title: '제품 스펙/문서 및 state/progress.json 정합성 최신화' },
]

// 평가자가 납득할 때까지 반복. 무한루프 방지를 위한 안전 상한(도달 시 로그로 명시).
const MAX_ROUNDS = 8

const tasks = Array.isArray(args) && args.length ? args : DEFAULT_TASKS

function buildPrompt(task, round, lastVerdict) {
  if (round === 0) {
    return [
      `[작업 ${task.id}] ${task.title}`,
      '',
      'SSOT는 저장소 파일이다. 시작 전 CLAUDE.md, ARCHITECTURE.md, docs/SECURITY.md, docs/sprint-contracts/current.md, state/progress.json을 읽어라.',
      '담당 책임 경계 안에서 구현하고, 끝내기 전에 npm run verify를 통과시키고 state/progress.json을 갱신하라.',
      '산출물(변경 파일과 요지, verify 결과)을 보고하라.',
    ].join('\n')
  }
  return [
    `[작업 ${task.id}] 재작업 라운드 ${round}.`,
    '평가자(qa-evaluator)가 다음 사유로 REJECTED 했다. 모두 해결하라:',
    ...(lastVerdict?.blocking_issues || []).map((b, i) => `  ${i + 1}. ${b}`),
    `평가 요약: ${lastVerdict?.summary || ''}`,
    '',
    '수정 후 npm run verify를 다시 통과시키고, 무엇을 어떻게 고쳤는지 보고하라.',
  ].join('\n')
}

function evalPrompt(task, build) {
  return [
    `다음 작업의 산출물을 평가하라. 완전히 납득하지 못하면 REJECTED 하라.`,
    `[작업 ${task.id}] ${task.title}`,
    '',
    '빌더 보고:',
    build,
    '',
    'docs/sprint-contracts/current.md 의 Definition of Done 과 CLAUDE.md 완료 조건에 비추어 검증하라.',
    '반드시 npm run verify 를 직접 실행해 통과를 확인하고, 보안(Client에 service role 노출/RLS 본인행 한정)과 문서/progress.json 최신화를 확인하라.',
  ].join('\n')
}

// 각 작업을 독립 파이프라인으로: 빌드 → (평가↔재작업 루프, ACCEPTED까지)
const results = await pipeline(
  tasks,
  (task) => agent(buildPrompt(task, 0), {
    agentType: task.role,
    label: `build:${task.id}`,
    phase: 'Build',
  }),
  async (firstBuild, task) => {
    let build = firstBuild
    let round = 0
    let verdict = null
    while (true) {
      verdict = await agent(evalPrompt(task, build), {
        agentType: 'qa-evaluator',
        label: `eval:${task.id} r${round}`,
        phase: 'Evaluate',
        schema: VERDICT_SCHEMA,
      })
      if (verdict.verdict === 'ACCEPTED') {
        log(`✅ ${task.id}: 평가자 납득(ACCEPTED) — ${round + 1}회 평가`)
        break
      }
      round++
      if (round >= MAX_ROUNDS) {
        log(`⛔ ${task.id}: 평가자 미납득 상태로 안전 상한 ${MAX_ROUNDS}회 도달 — 사람 개입 필요. 마지막 사유: ${verdict.summary}`)
        break
      }
      log(`🔁 ${task.id}: REJECTED(라운드 ${round}) — 재작업: ${(verdict.blocking_issues || [])[0] || ''}`)
      build = await agent(buildPrompt(task, round, verdict), {
        agentType: task.role,
        label: `rebuild:${task.id} r${round}`,
        phase: 'Build',
      })
    }
    return { task, rounds: round + 1, verdict, accepted: verdict.verdict === 'ACCEPTED' }
  }
)

const accepted = results.filter((r) => r && r.accepted)
const stuck = results.filter((r) => r && !r.accepted)
log(`완료: ACCEPTED ${accepted.length}/${results.length}${stuck.length ? `, 사람 개입 필요 ${stuck.length} (${stuck.map((s) => s.task.id).join(', ')})` : ''}`)

return {
  total: results.length,
  accepted: accepted.map((r) => ({ id: r.task.id, rounds: r.rounds })),
  needs_human: stuck.map((r) => ({ id: r.task.id, rounds: r.rounds, reason: r.verdict?.summary })),
}
