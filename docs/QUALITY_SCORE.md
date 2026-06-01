# QUALITY_SCORE.md

본 문서는 고평가/저평가 판별에 쓰는 **밸류에이션 점수(Valuation Score)** 산식의 SSOT다.
점수는 정보 제공 목적이며 투자 권유가 아니다(면책: [PRODUCT_SPEC.md](./PRODUCT_SPEC.md)).

## 1. 입력
- `per`: 종목의 당일 PER (EPS > 0 인 경우에만 유효)
- 업종 집계: 같은 거래일의 **유효 PER** 집합으로 계산한 평균(`mean_per`)과 중앙값(`median_per`)

## 2. 핵심 아이디어
개별 종목 PER을 **업종 상대값**으로 환산해, 업종 평균보다 비싸면 고평가, 싸면 저평가로 본다.

## 3. 산식
### 3.1 상대 PER (relative PER)
```
relative_per = per / median_per
```
- `relative_per > 1` → 업종 중앙값보다 비쌈(고평가 경향)
- `relative_per < 1` → 업종 중앙값보다 쌈(저평가 경향)

### 3.2 정규화 점수 (z-score 기반, 0~100)
```
z = (per - mean_per) / stddev_per
valuation_score = clamp( round( 50 - (z * 15) ), 0, 100 )
```
- 점수가 **높을수록 저평가**, **낮을수록 고평가** (PER이 낮을수록 점수↑).
- `stddev_per = 0`이거나 유효 종목 < 2개면 점수는 `null`.

### 3.3 분류 라벨
| 조건 | 라벨 | 사용자 표기 |
| --- | --- | --- |
| `valuation_score ≥ 66` | `undervalued` | 저평가 |
| `34 ≤ valuation_score < 66` | `fair` | 적정 |
| `valuation_score < 34` | `overvalued` | 고평가 |

### 3.4 랭킹
- 같은 거래일 내에서 `valuation_score` 내림차순으로 `rank` 부여(1 = 가장 저평가).

## 4. 결측/예외 처리
- EPS ≤ 0 또는 PER 결측 → 해당 종목은 점수 `null`, 랭킹 제외, 대시보드에서 "데이터 없음" 표기.
- 업종 유효 표본이 부족하면(< 2) 그 날의 점수 전체를 `null`로 둔다.

## 5. 저장
- 결과는 `valuation_scores(company_id, trade_date, relative_per, valuation_score, label, rank)`에 저장한다.
- 산식 변경 시 본 문서와 `docs/DECISIONS.md`를 함께 업데이트한다.

## 6. 표시 원칙
- 점수와 함께 기준일(`trade_date`)과 업종 표본 수를 노출해 해석 가능성을 보장한다.
- 데이터 신선도는 [RELIABILITY.md](./RELIABILITY.md) 기준을 따른다.
