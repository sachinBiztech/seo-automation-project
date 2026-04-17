# SEO Automation Engine

This repository contains the SEO automation engine for intelligence reporting and sprint planning.

## Purpose

The project is built to run two main pipelines:

- `node run-intelligence-pipeline.js` — intelligence report pipeline
- `node run-pipeline.js` — SEO strategist sprint plan pipeline

The repo is currently a mixed state of design docs, mock-mode pipelines, and partial production wiring.

## Repository structure

- `intelligence-report/` — intelligence report orchestrator and subskills
- `seo-strategist/` — SEO sprint planning orchestrator and subskills
- `mock-data/` — sample data used by mock pipelines
- `outputs/` — generated artifacts (should be ignored in source control)
- `run-intelligence-pipeline.js` — pipeline runner for intelligence report
- `run-pipeline.js` — pipeline runner for SEO strategist
- `CLAUDE.md`, `GUIDE.md`, `plan.md` — project documentation and architecture notes

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. If needed, update the workspace path in the runner scripts or make it configurable.
3. Run dry runs before live execution:

   ```bash
   node run-intelligence-pipeline.js --dry-run
   node run-pipeline.js --dry-run
   ```

## GitHub repository hygiene

- `node_modules/` is ignored and should not be committed.
- `outputs/` is generated and should not be committed.
- Local config files and OpenClaw/Claude state should stay out of git.
- Keep `package-lock.json` committed for reproducible installs.

If `outputs/` or `node_modules/` were already tracked, remove them from git cache:

```bash
git rm -r --cached outputs node_modules
git commit -m "Remove generated output and dependency folders from repo"
```

## Notes

- The `.md` files describe the agent design and pipeline behavior.
- The JS runner files are the real entry points used to start the pipeline.
- For a proper GitHub repo, the code and docs should be kept, while generated output and local state should remain ignored.
