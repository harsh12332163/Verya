# Verya Student Success Analytics — Demo Brief

## Student Success Score

The prototype reports a 0–100, explainable support score. Each indicator is normalized to 0–100 and multiplied by its fixed weight:

| Indicator | Weight | Prototype measure |
|---|---:|---|
| Academic performance | 30% | Mean of accessible subject marks |
| Attendance | 20% | Mean of accessible course attendance |
| LMS activity | 15% | 60% assignment/lab completion rate + 40% mean mark on completed work |
| Campus engagement | 10% | Simulated events/clubs participation signal |
| Placement readiness | 15% | 40% aptitude + 35% coding + 25% mock interview |
| Skills assessment | 7% | 60% technical + 40% soft skills |
| Student feedback | 3% | Simulated satisfaction signal |

The weighted contributions sum to the Success Score. The score is a prioritization aid, not a prediction of an individual student's future or an automated decision.

## Risk and segments

- Academic support is flagged for academic average below 65% or attendance below 75%.
- Placement risk is flagged when placement readiness is below 55%.
- Risk Score is the complement of the weighted Student Success Score (100 − Success Score). Overall priority is High at Risk Score 60+, Moderate at 30–59, and Low below 30.
- Segments distinguish a strong-academics/placement-readiness gap, academic support needs, re-engagement opportunities, high momentum, and developing students.
- Student details expose indicator values, weighted contributions, reason(s) for a flag, and a suggested human follow-up.

These are transparent prototype thresholds and should be calibrated with institutional stakeholders and evaluated for bias before operational use.

## Data integration status

Academic marks, assignment/lab status, and attendance are read from Verya's local demo records. LMS completion is derived from assignment/lab records. Engagement, aptitude/coding/interview, skills, and feedback are deterministic simulated sample signals so the prototype can demonstrate a unified student view; they are **not** connected to college systems. A real deployment needs consent and governance, data-quality checks, source timestamps/provenance, secure APIs or batch ingestion, access controls, retention rules, and monitored model validation.

## 90-second demo flow

1. Sign in as an administrator or faculty member and open the dashboard.
2. Introduce the cohort Success Score and the seven weighted signals; point out the sample-data disclosure.
3. Select **High priority** or **Placement-readiness gap**, then open a student row.
4. Explain the score contributions, specific risk reason, segment, and suggested human intervention.
5. Show the cohort segments and existing subject-performance/assignment panels as pathways from insight to action.
6. Sign in as a student to show the personal score breakdown, while noting that production integrations and institutional validation are the next steps.
