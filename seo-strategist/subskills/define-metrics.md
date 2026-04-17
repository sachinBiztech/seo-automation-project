# Define Metrics

## Purpose
For every action in the sprint plan, defines the success metric, current value, target by sprint end, and how it will be measured. Prevents ambiguous goals — every tactic has a measurable outcome.

## Model
claude-sonnet-4-6

## Mode
MOCK

## Input
- seo-automation/outputs/sprint-plan.json
- seo-automation/outputs/gsc-findings.json
- seo-automation/outputs/ga4-findings.json

## Task

For each item in the sprint plan (content, technical, off-page), define:

### Per content item
- **Metric**: organic impressions for the primary keyword page
- **Current value**: from `gsc-findings.json` (current impressions for that URL, or 0 if new page)
- **Target by sprint end**: realistic uplift (new page: 100+ impressions in 15 days; existing page: +20% impressions)
- **Measurement method**: GSC → Performance → URL filter → 15-day comparison

### Per technical fix
- **Metric**: the specific CWV metric being fixed (LCP / CLS / FID)
- **Current value**: from sprint plan (e.g., LCP 2.8s)
- **Target by sprint end**: from sprint plan (e.g., LCP <2.5s)
- **Measurement method**: Google PageSpeed Insights / Chrome UX Report

### Per off-page item
- **Backlinks**: metric = DA of acquired link / count of links acquired
- **Quora/Reddit**: metric = profile views + link clicks (manual check)
- **Guest post**: metric = published + DA of host site

### Output rules
- Targets must be achievable in 15 days (do not set unrealistic goals)
- Every metric must have a measurement method — no "check rankings" vagueness

## Output
- Adds `metrics` field to `seo-automation/outputs/sprint-plan.json` (in-place update)

Metrics schema per item:
```json
{
  "metric_name": "string",
  "current_value": "string",
  "target_value": "string",
  "measurement_method": "string",
  "measurement_date": "sprint_end_date"
}
```
