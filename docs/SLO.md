# SLO — noglutenkorea.com

**작성 2026-08-14.** 대상: 공개 사이트(Cloudflare Pages) 7개 엔드포인트.
관측 파이프라인: `scripts/healthcheck.mjs` → `scripts/push-metrics.mjs` → Grafana Cloud Prometheus, GitHub Actions 시간당 실행.
알림 정본 `monitoring/grafana-alerts.json`(적용 = `node scripts/provision-alerts.mjs --apply`).

---

## 1. SLI — 무엇을 "성공"으로 세는가

| SLI | 정의 | 지표 |
|---|---|---|
| **가용성** | 헬스체크가 해당 엔드포인트에서 성공 응답을 받음 | `ngk_http_up{target}` (1 또는 0) |
| **지연** | 응답 완료까지 걸린 시간 | `ngk_http_response_seconds{target}` |

대상 엔드포인트 7개: `homepage` · `sitemap` · `robots_txt` · `ads_txt` · 대표 장소 3종(`place_237-pizza`·`place_cafe-pepper`·`place_monil2-house`).
→ 장소 페이지를 넣은 이유: 홈만 보면 **데이터 파이프라인이 깨져 상세 페이지가 비어도 초록**으로 보인다. 실제 사용자 경로를 최소 한 개는 포함시킨다.

## 2. 실측 기준선 (2026-08-14)

| 항목 | 24시간 | 비고 |
|---|---|---|
| 가용률 | **100%** | 7 엔드포인트 평균 |
| 응답 평균 | **126 ms** | |
| 응답 최대 | **558 ms** | 임계값 산정의 근거 |
| 실패 체크 | **0** | |
| **수집 샘플 수** | **19 / 24** | 🔴 아래 §5 참조 |

7일 평균은 하루 **6.3샘플** — 시간당 수집이 최근에 켜졌기 때문이며, 아직 대표성이 없다. **30일 SLO 판정은 관측이 30일 쌓인 뒤부터** 한다.

## 3. SLO 목표

> **30일 롤링 가용성 ≥ 99.5%** (에러 버짓 = 30일 중 약 3시간 36분)

- 왜 99.5인가: 실측이 100%지만 **관측 창이 짧고**(§2) 무료 티어(Cloudflare Pages + GitHub Actions)에 의존하므로, 내가 통제하지 못하는 실패를 흡수할 여유가 필요하다. 99.9%(43분)는 지금의 **측정 해상도로는 판정조차 불가능**하다(§5).
- 지연은 SLO가 아니라 **경보 임계**로만 운영한다: 1초. 관측 최대(558ms)의 약 2배. 트래픽이 늘어 분포가 생기면 p95 기반으로 옮긴다.

## 4. 알림 — SLO와의 연결

| 룰 | 조건 | 성격 |
|---|---|---|
| `ngk-http-down` | `ngk_http_up < 1` | 에러 버짓을 **소모하는** 사건 |
| `ngk-http-slow` | 응답 > 1s | 버짓 소모 아님(경고) |
| `ngk-healthcheck-stale` | 마지막 수집 후 > 6h | **측정 불능** — 버짓 판정 자체가 무효화됨 |
| `ngk-ssl-expiry` / `ngk-ig-data-access` | 만료 임박 | 예방(사건 전) |

**설계 원칙 — "서비스가 죽은 것"과 "지표가 안 오는 것"을 다른 룰로 나눴다.**
가용성·지연 룰은 `noDataState: OK`다. 수집이 밀렸다고 장애로 오인하면 오탐만 쌓인다.
대신 `ngk-healthcheck-stale`만 `noDataState: Alerting` — **데이터 없음이 바로 그 룰이 감시하는 대상**이기 때문이다. 사이트가 실제로 죽으면 헬스체크는 `ngk_http_up 0`을 **보고**하므로 NoData가 아니라 값 0으로 잡힌다.

## 5. 🔴 알려진 한계 — 측정 해상도

수집이 **시간당 1회**이고 실제로는 24시간에 **19~20샘플**만 도착한다(무료 GitHub Actions 러너의 스케줄 지연. 코드 주석에도 명시돼 있고, 그래서 지표에 실행 시각 `ngk_healthcheck_timestamp_seconds`를 같이 싣는다).

여기서 따라오는 것:

1. **1시간 미만의 장애는 통째로 놓칠 수 있다.** 이 SLO는 "관측된 샘플 기준"이지 진짜 가용성이 아니다.
2. 그래서 **99.9% 같은 목표는 세울 수 없다** — 43분 버짓을 시간당 샘플로 판정할 방법이 없다.
3. 수집 결손률(약 20%) 자체가 지표다. 개선하려면 ①cron 주기 단축 ②외부 프로브(Grafana Synthetic Monitoring 무료 한도 내) 추가 중 하나가 필요하다.

**지금은 고치지 않는다.** 개인 서비스에 필요한 해상도가 아니고, 무료 러너의 지연을 지표로 관측하고 있다는 사실 자체가 파이프라인이 정직하게 작동한다는 증거다. 필요해지면 위 두 경로가 있다.

## 6. 운영

```bash
node scripts/grafana-query.mjs slo          # 24h 가용률·응답 집계
node scripts/grafana-query.mjs continuity   # 수집 연속성 (기대 24, 실제 19~20)
node scripts/grafana-query.mjs status       # 엔드포인트별 현재 상태
node scripts/provision-alerts.mjs           # 알림 정본 대비 인스턴스 diff (dry-run)
```

**리뷰 주기**: 관측 30일 도달 시점(≈2026-09-12)에 첫 에러 버짓 판정 + 임계값 재조정.
